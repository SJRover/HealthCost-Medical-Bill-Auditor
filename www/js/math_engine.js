// US Healthcare Financial & Tax Math Engine (V4 Global Script Mode)
// Exposes calculations on window.HealthcareMath.

const FPL_2026_BASE = 15800;
const FPL_2026_INCREMENT = 5600;

// Medicaid Non-Expansion States (10 states as of 2026)
const MEDICAID_NON_EXPANSION_STATES = ["AL", "FL", "GA", "KS", "MS", "SC", "TN", "TX", "WY"];

window.HealthcareMath = {
  // Calculate Federal Poverty Level (FPL)
  calculateFPL: function(householdSize) {
    const size = Math.max(1, parseInt(householdSize) || 1);
    return FPL_2026_BASE + (size - 1) * FPL_2026_INCREMENT;
  },

  // Get standard ACA Age Rating Factor (based on CMS 3:1 rating curve)
  // Age 21 factor is 1.00, age 64+ is 3.00, children are 0.76.
  getAgeRatingFactor: function(age) {
    const a = Math.max(1, Math.min(120, parseInt(age) || 35));
    if (a < 21) return 0.76;
    if (a <= 27) return 1.00;
    if (a <= 30) return 1.00 + (a - 27) * (1.13 - 1.00) / 3;
    if (a <= 35) return 1.13 + (a - 30) * (1.22 - 1.13) / 5;
    if (a <= 40) return 1.22 + (a - 35) * (1.28 - 1.22) / 5;
    if (a <= 45) return 1.28 + (a - 40) * (1.44 - 1.28) / 5;
    if (a <= 50) return 1.44 + (a - 45) * (1.78 - 1.44) / 5;
    if (a <= 55) return 1.78 + (a - 50) * (2.23 - 1.78) / 5;
    if (a <= 60) return 2.23 + (a - 55) * (2.71 - 2.23) / 5;
    if (a <= 64) return 2.71 + (a - 60) * (3.00 - 2.71) / 4;
    return 3.00; // Age 64+ caps at 3x the 21-year-old rate
  },

  // Estimate marginal tax rate based on AGI, Filing Status, and State
  estimateMarginalTaxRate: function(agi, filingStatus, state) {
    const income = Math.max(0, parseFloat(agi) || 0);
    const status = filingStatus || "single";
    
    let standardDeduction = 15500;
    if (status === "married_joint") standardDeduction = 31000;
    else if (status === "head_household") standardDeduction = 23200;

    const taxableIncome = Math.max(0, income - standardDeduction);
    
    let fedRate = 0.10;
    if (status === "married_joint") {
      if (taxableIncome > 380000) fedRate = 0.32;
      else if (taxableIncome > 200000) fedRate = 0.24;
      else if (taxableIncome > 94000) fedRate = 0.22;
      else if (taxableIncome > 23200) fedRate = 0.12;
    } else {
      if (taxableIncome > 190000) fedRate = 0.32;
      else if (taxableIncome > 100000) fedRate = 0.24;
      else if (taxableIncome > 47000) fedRate = 0.22;
      else if (taxableIncome > 11600) fedRate = 0.12;
    }

    const ficaRate = 0.0765;
    
    let stateRate = 0.04;
    const zeroStateTax = ["TX", "FL", "AK", "NV", "SD", "WA", "WY", "TN", "NH"];
    if (zeroStateTax.includes(state)) stateRate = 0.0;
    else if (state === "CA") stateRate = 0.08;
    else if (state === "NY") stateRate = 0.06;
    else if (state === "MA") stateRate = 0.05;

    return {
      federal: fedRate,
      fica: ficaRate,
      state: stateRate,
      total: fedRate + ficaRate + stateRate
    };
  },

  // Calculate the Advanced Premium Tax Credit (APTC) / ACA Marketplace Subsidy
  calculateACASubsidy: function(agi, householdSize, citizenship, hasEmployerOffer, baseBenchmarkPremium = 6120) {
    if (citizenship === "undocumented") return 0; 
    if (hasEmployerOffer === "yes") return 0; 

    const fpl = this.calculateFPL(householdSize);
    const fplPercent = (agi / fpl) * 100;

    if (fplPercent < 100) return baseBenchmarkPremium / 12;

    let capPercentage = 0.025;
    if (fplPercent >= 400) capPercentage = 0.085;
    else if (fplPercent >= 300) capPercentage = 0.06 + ((fplPercent - 300) / 100) * 0.025; 
    else if (fplPercent >= 250) capPercentage = 0.04 + ((fplPercent - 250) / 50) * 0.02; 
    else if (fplPercent >= 200) capPercentage = 0.02 + ((fplPercent - 200) / 50) * 0.02; 
    else if (fplPercent >= 150) capPercentage = 0.00 + ((fplPercent - 150) / 50) * 0.02; 

    const maxAnnualPayment = agi * capPercentage;
    const annualSubsidy = Math.max(0, baseBenchmarkPremium - maxAnnualPayment);

    return annualSubsidy / 12; // Monthly subsidy
  },

  // Check state expansion rules and returns Medicaid status
  checkMedicaidEligibility: function(agi, householdSize, state) {
    const fpl = this.calculateFPL(householdSize);
    const ratio = agi / fpl;
    const isNonExpansion = MEDICAID_NON_EXPANSION_STATES.includes(state);

    if (isNonExpansion) {
      if (ratio < 1.0) {
        return {
          status: "Medicaid Coverage Gap Alert",
          eligible: false,
          gap: true,
          description: `You reside in ${state}, which has not expanded Medicaid under the ACA. Because your income is below 100% FPL ($${Math.round(fpl)}), you do not qualify for Medicaid AND are disqualified from ACA Marketplace premium subsidies. This is the 'Medicaid Coverage Gap.'`
        };
      }
      return {
        status: "Standard ACA Marketplace Route",
        eligible: false,
        gap: false,
        description: "Your income is above 100% FPL, making you eligible to receive standard ACA Marketplace premium tax credits."
      };
    } else {
      // Expansion States (effective limit is 138% FPL due to the 5% AGI disregard)
      if (ratio <= 1.38) {
        return {
          status: "Eligible for Free State Medicaid",
          eligible: true,
          gap: false,
          description: `You reside in ${state}, which has expanded Medicaid. Because your income is under 138% FPL ($${Math.round(fpl * 1.38)}), you are eligible for free state health insurance.`
        };
      }
      return {
        status: "Standard ACA Marketplace Route",
        eligible: false,
        gap: false,
        description: "Your income exceeds 138% FPL. You are eligible to purchase ACA Marketplace plans with premium tax credits."
      };
    }
  },

  // Check Charity Care (FAP) eligibility limits
  checkCharityCareEligibility: function(agi, householdSize) {
    const fpl = this.calculateFPL(householdSize);
    const ratio = agi / fpl;

    if (ratio <= 2.00) {
      return {
        status: "Eligible for 100% Charity Care Write-off",
        discount: 1.0,
        eligible: true,
        description: "Your income is under 200% FPL. Nonprofit hospitals are federally mandated under IRS § 501(r) to write off your bill completely."
      };
    } else if (ratio <= 4.00) {
      const slidingScaleDiscount = 0.85 - ((ratio - 2.0) / 2.0) * 0.35; // 85% to 50% discount
      return {
        status: "Eligible for Sliding Scale Financial Assistance",
        discount: slidingScaleDiscount,
        eligible: true,
        description: `Your income is ${Math.round(ratio * 100)}% FPL. You qualify for an estimated ${Math.round(slidingScaleDiscount * 100)}% charity care discount.`
      };
    } else {
      return {
        status: "Exceeds Standard Charity Care Thresholds",
        discount: 0.35,
        eligible: false,
        description: "Your income exceeds 400% FPL, disqualifying you from standard financial assistance policies. However, a 30-40% prompt cash-pay discount is typical."
      };
    }
  },

  // Calculate the Total Annual Cost of Care (TACC) for a plan
  calculatePlanTACC: function({
    plan,
    utilization,
    agi,
    householdSize,
    filingStatus,
    citizenship,
    hasEmployerOffer,
    hsaContribution,
    state,
    age,
    employmentStatus = "w2"
  }) {
    const tax = this.estimateMarginalTaxRate(agi, filingStatus, state);
    const ageFactor = this.getAgeRatingFactor(age);

    // Dynamic Premium Quoting: Scale base premium by age factor
    let monthlyPremium = plan.basePremium ? (plan.basePremium * ageFactor) : plan.monthlyPremium;
    
    // Apply ACA subsidy if marketplace plan
    if (plan.tier !== "None") {
      const subsidy = this.calculateACASubsidy(agi, householdSize, citizenship, hasEmployerOffer);
      monthlyPremium = Math.max(0, monthlyPremium - subsidy);
    }
    const annualPremium = monthlyPremium * 12;

    // Calculate Out of Pocket (OOP) costs
    let oop = 0;
    if (plan.id === "no_insurance") {
      const charity = this.checkCharityCareEligibility(agi, householdSize);
      oop = utilization * (1 - charity.discount);
    } else {
      if (utilization <= plan.deductible) {
        oop = utilization;
      } else {
        const remainingSpend = utilization - plan.deductible;
        oop = plan.deductible + (remainingSpend * plan.coinsurance);
      }
      oop = Math.min(oop, plan.oopm);
    }

    const grossExpenses = annualPremium + oop;

    // Tax Savings Calculation
    // 1. Premium tax savings
    let premiumTaxSavings = 0;
    if (plan.tier !== "None") {
      if (employmentStatus === "self_employed") {
        premiumTaxSavings = annualPremium * (tax.federal + tax.state);
      } else {
        premiumTaxSavings = 0; // W-2 employees pay marketplace post-tax
      }
    }

    // 2. HSA tax savings (HSA contributions are NOT state-tax deductible in CA and NJ)
    let hsaTaxSavings = 0;
    if (plan.hsaEligible && hsaContribution > 0) {
      const limit = (householdSize > 1) ? 8550 : 4300;
      const cappedContribution = Math.min(hsaContribution, limit);
      
      const isStateDeductible = !["CA", "NJ"].includes(state);
      const effectiveSavingsRate = tax.federal + tax.fica + (isStateDeductible ? tax.state : 0);
      
      hsaTaxSavings = cappedContribution * effectiveSavingsRate;
    }

    const netCareCost = Math.max(0, grossExpenses - premiumTaxSavings - hsaTaxSavings);
    const cashOutflow = grossExpenses + (plan.hsaEligible ? Math.min(hsaContribution, (householdSize > 1) ? 8550 : 4300) : 0) - premiumTaxSavings - hsaTaxSavings;

    return {
      netCost: Math.round(netCareCost),
      cashOutflow: Math.round(cashOutflow),
      annualPremium: Math.round(annualPremium),
      monthlyPremium: Math.round(monthlyPremium),
      oopPaid: Math.round(oop),
      premiumTaxSavings: Math.round(premiumTaxSavings),
      hsaTaxSavings: Math.round(hsaTaxSavings),
      hsaAssetVal: plan.hsaEligible ? Math.min(hsaContribution, (householdSize > 1) ? 8550 : 4300) : 0
    };
  }
};
