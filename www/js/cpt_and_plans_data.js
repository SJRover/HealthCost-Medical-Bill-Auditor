// CPT, Insurance, and Simulated Injury Reference Data (V4 Global Script Mode)
// Exposes references on window.CPT_DATABASE, window.SAMPLE_PLANS, and window.INJURY_SCENARIOS.

window.CPT_DATABASE = {
  // Office Visits
  "99203": { code: "99203", category: "Office Visit", description: "Office visit for new patient (moderate complexity, 30-44 min)", avgCommercial: 240, medicareRate: 115, typicalDiscount: 0.45 },
  "99204": { code: "99204", category: "Office Visit", description: "Office visit for new patient (high complexity, 45-59 min)", avgCommercial: 350, medicareRate: 170, typicalDiscount: 0.45 },
  "99213": { code: "99213", category: "Office Visit", description: "Office visit for established patient (low-mod complexity, 15-29 min)", avgCommercial: 160, medicareRate: 90, typicalDiscount: 0.40 },
  "99214": { code: "99214", category: "Office Visit", description: "Office visit for established patient (moderate-high complexity, 30-39 min)", avgCommercial: 220, medicareRate: 130, typicalDiscount: 0.40 },
  "99395": { code: "99395", category: "Office Visit", description: "Preventive medicine evaluation/wellness visit (established patient, age 18-39)", avgCommercial: 180, medicareRate: 125, typicalDiscount: 0.50, isPreventive: true },

  // Emergency Room & Urgent Care
  "99283": { code: "99283", category: "Emergency Room", description: "Emergency department visit (moderate severity / complexity)", avgCommercial: 850, medicareRate: 150, typicalDiscount: 0.55 },
  "99284": { code: "99284", category: "Emergency Room", description: "Emergency department visit (high severity, no immediate threat)", avgCommercial: 1450, medicareRate: 260, typicalDiscount: 0.60 },
  "99285": { code: "99285", category: "Emergency Room", description: "Emergency department visit (critical/life-threatening severity)", avgCommercial: 2400, medicareRate: 380, typicalDiscount: 0.60 },
  "99222": { code: "99222", category: "Inpatient Care", description: "Initial hospital inpatient care per day (moderate severity)", avgCommercial: 1200, medicareRate: 145, typicalDiscount: 0.40 },

  // Imaging (X-Ray, MRI, CT, Ultrasound)
  "71045": { code: "71045", category: "Imaging", description: "Chest X-ray (single view)", avgCommercial: 120, medicareRate: 40, typicalDiscount: 0.50 },
  "72148": { code: "72148", category: "Imaging", description: "MRI of the lumbar spine (lower back) without contrast", avgCommercial: 1800, medicareRate: 280, typicalDiscount: 0.65 },
  "70450": { code: "70450", category: "Imaging", description: "CT scan of the head/brain without contrast", avgCommercial: 1200, medicareRate: 160, typicalDiscount: 0.60 },
  "76830": { code: "76830", category: "Imaging", description: "Ultrasound of the pelvis (transvaginal/standard)", avgCommercial: 350, medicareRate: 110, typicalDiscount: 0.50 },

  // Laboratory / Blood Tests
  "80053": { code: "80053", category: "Lab Work", description: "Comprehensive Metabolic Panel (CMP) blood test", avgCommercial: 90, medicareRate: 15, typicalDiscount: 0.70 },
  "85025": { code: "85025", category: "Lab Work", description: "Complete Blood Count (CBC) with automated differential", avgCommercial: 60, medicareRate: 11, typicalDiscount: 0.70 },
  "80061": { code: "80061", category: "Lab Work", description: "Lipid Panel (cholesterol, HDL, LDL, triglycerides)", avgCommercial: 75, medicareRate: 18, typicalDiscount: 0.70 },
  "83036": { code: "83036", category: "Lab Work", description: "Hemoglobin A1c (HbA1c) blood test for blood sugar", avgCommercial: 65, medicareRate: 13, typicalDiscount: 0.70 },
  "84443": { code: "84443", category: "Lab Work", description: "TSH (Thyroid Estimulating Hormone) blood test", avgCommercial: 80, medicareRate: 23, typicalDiscount: 0.70 },
  "80076": { code: "80076", category: "Lab Work", description: "Hepatic Function (Liver) Panel blood test", avgCommercial: 85, medicareRate: 14, typicalDiscount: 0.70 },

  // Outpatient Procedures & Surgeries
  "45378": { code: "45378", category: "Procedures", description: "Diagnostic colonoscopy (including collection of specimens if done)", avgCommercial: 2100, medicareRate: 380, typicalDiscount: 0.50 },
  "29881": { code: "29881", category: "Procedures", description: "Knee arthroscopy (meniscectomy, shaving/debridement of cartilage)", avgCommercial: 4500, medicareRate: 980, typicalDiscount: 0.55 },
  "93000": { code: "93000", category: "Procedures", description: "Electrocardiogram (EKG/ECG) tracing, interpretation, and report", avgCommercial: 110, medicareRate: 22, typicalDiscount: 0.60 },
  "49505": { code: "49505", category: "Procedures", description: "Inguinal hernia repair (age 5 or older, initial repair)", avgCommercial: 5800, medicareRate: 1200, typicalDiscount: 0.50 },
  "47562": { code: "47562", category: "Procedures", description: "Laparoscopic gallbladder removal (cholecystectomy)", avgCommercial: 8500, medicareRate: 2100, typicalDiscount: 0.55 },

  // HCPCS Ambulance & Inpatient Charges
  "A0427": { code: "A0427", category: "Ambulance", description: "Ambulance service, Advanced Life Support, emergency transport (Level 1)", avgCommercial: 1100, medicareRate: 450, typicalDiscount: 0.30 },
  "HC-IVF": { code: "HC-IVF", category: "Hospital Charges", description: "Intravenous (IV) infusion, hydration therapy (first hour)", avgCommercial: 350, medicareRate: 65, typicalDiscount: 0.70 },
  "HC-ROOM": { code: "HC-ROOM", category: "Hospital Charges", description: "Hospital semi-private room charges (per day, inpatient)", avgCommercial: 2800, medicareRate: 750, typicalDiscount: 0.50 },
  "HC-FAC": { code: "HC-FAC", category: "Hospital Charges", description: "Hospital outpatient facility fee (general clinic use)", avgCommercial: 450, medicareRate: 120, typicalDiscount: 0.45 }
};

window.SAMPLE_PLANS = [
  // Representative Marketplace plans (Base premium set at age 21)
  {
    id: "bronze_hdhp",
    name: "Bronze HSA-Eligible HDHP",
    tier: "Bronze",
    type: "HMO",
    basePremium: 310,
    deductible: 7000,
    coinsurance: 0.20,
    copayPCP: 0,
    copaySpecialist: 0,
    copayER: 0,
    oopm: 8500,
    hsaEligible: true,
    description: "Lowest monthly premium. Best if you are healthy, rarely visit the doctor, and want to save taxes using an HSA.",
    pros: ["Lowest monthly cost", "Triple-tax advantaged HSA eligibility", "Protects against catastrophic emergencies"],
    cons: ["Very high deductible", "Must pay full price for all non-preventive visits until deductible is met"]
  },
  {
    id: "silver_ppo",
    name: "Silver Choice PPO",
    tier: "Silver",
    type: "PPO",
    basePremium: 420,
    deductible: 4500,
    coinsurance: 0.20,
    copayPCP: 35,
    copaySpecialist: 65,
    copayER: 350,
    oopm: 7500,
    hsaEligible: false,
    description: "Moderate premium and deductible. Covers primary care visits with fixed copays before meeting the deductible.",
    pros: ["Copays for routine office visits bypass the deductible", "PPO network allows specialist visits without PCP referrals", "Out-of-network coverage options"],
    cons: ["Moderate deductible still applies to imaging, surgeries, and ER", "HSA tax advantages not available"]
  },
  {
    id: "gold_ppo",
    name: "Gold Secure PPO",
    tier: "Gold",
    type: "PPO",
    basePremium: 530,
    deductible: 1500,
    coinsurance: 0.15,
    copayPCP: 20,
    copaySpecialist: 45,
    copayER: 250,
    oopm: 5000,
    hsaEligible: false,
    description: "Higher premium, low deductible. Ideal if you manage chronic conditions, have planned procedures, or take regular brand-name meds.",
    pros: ["Low deductible", "Lower coinsurance (15%)", "Excellent routine visit copays", "No referrals required"],
    cons: ["Higher monthly fixed premium costs", "No tax-advantaged savings options"]
  },
  {
    id: "platinum_epo",
    name: "Platinum Complete EPO",
    tier: "Platinum",
    type: "EPO",
    basePremium: 670,
    deductible: 0,
    coinsurance: 0.10,
    copayPCP: 10,
    copaySpecialist: 30,
    copayER: 150,
    oopm: 3000,
    hsaEligible: false,
    description: "Highest premium, $0 deductible. All covered medical care is paid via low, fixed copays or 10% coinsurance starting day one.",
    pros: ["No deductible to meet", "Very low copayments", "Lowest Out-of-Pocket Maximum", "Predictable costs"],
    cons: ["Extremely high monthly premium", "No coverage for out-of-network care except emergencies", "Expensive if you end up not needing medical care"]
  },
  // Top Private Insurers (Estimated Quotes based on tier & type)
  {
    id: "bcbs_silver",
    name: "Blue Cross Blue Shield Silver",
    tier: "Silver",
    type: "PPO",
    basePremium: 430,
    deductible: 4000,
    coinsurance: 0.20,
    copayPCP: 30,
    copaySpecialist: 60,
    copayER: 300,
    oopm: 7300,
    hsaEligible: false,
    description: "Wide national network from Blue Cross. Predictable co-pays for primary care.",
    pros: ["Largest national network of providers", "Fewer out-of-network denials", "Good local customer support"],
    cons: ["Slightly higher premium than HMOs", "Strict prior authorization rules"]
  },
  {
    id: "united_gold",
    name: "UnitedHealthcare Choice Plus Gold",
    tier: "Gold",
    type: "POS",
    basePremium: 550,
    deductible: 1200,
    coinsurance: 0.15,
    copayPCP: 20,
    copaySpecialist: 40,
    copayER: 200,
    oopm: 4800,
    hsaEligible: false,
    description: "UHC Choice Plus network. Low deductible and extensive wellness perks.",
    pros: ["National POS network (no specialist referrals required)", "Excellent pharmacy formulary coverage", "Digital health benefits included"],
    cons: ["High base premium", "Surprise facility charges in hospital networks"]
  },
  {
    id: "aetna_bronze",
    name: "Aetna Health Saver Bronze (HSA)",
    tier: "Bronze",
    type: "EPO",
    basePremium: 305,
    deductible: 7200,
    coinsurance: 0.20,
    copayPCP: 0,
    copaySpecialist: 0,
    copayER: 0,
    oopm: 8550,
    hsaEligible: true,
    description: "Low premium Aetna plan. In-network EPO restriction with HSA capability.",
    pros: ["Competitive premium pricing", "Direct access to CVS MinuteClinics with $0 copays", "HSA tax shelter"],
    cons: ["Strict EPO network (no out-of-network coverage)", "All care subject to deductible first"]
  },
  {
    id: "cigna_silver",
    name: "Cigna Connect Silver",
    tier: "Silver",
    type: "HMO",
    basePremium: 395,
    deductible: 5000,
    coinsurance: 0.25,
    copayPCP: 40,
    copaySpecialist: 75,
    copayER: 400,
    oopm: 7800,
    hsaEligible: false,
    description: "Standard Cigna HMO connector plan. Requires PCP referrals.",
    pros: ["24/7 telehealth access included at $0 copay", "Great international travel emergency coverage"],
    cons: ["High copays for specialists", "No out-of-network coverage", "PCP gatekeeper model"]
  },
  {
    id: "kaiser_platinum",
    name: "Kaiser Permanente HMO Platinum",
    tier: "Platinum",
    type: "HMO",
    basePremium: 650,
    deductible: 0,
    coinsurance: 0.10,
    copayPCP: 15,
    copaySpecialist: 25,
    copayER: 150,
    oopm: 2500,
    hsaEligible: false,
    description: "Integrated Kaiser system. Zero deductible, all services coordinated in-house.",
    pros: ["Excellent preventative care integration", "All services coordinated under one roof", "Lowest Out-of-Pocket Max"],
    cons: ["Highly restricted network (must use Kaiser facilities)", "No out-of-network coverage", "Long wait times for out-of-system specialists"]
  },
  // No Insurance
  {
    id: "no_insurance",
    name: "No Insurance (Self-Pay)",
    tier: "None",
    type: "Cash-Pay",
    basePremium: 0,
    deductible: Infinity,
    coinsurance: 1.0,
    copayPCP: Infinity,
    copaySpecialist: Infinity,
    copayER: Infinity,
    oopm: Infinity,
    hsaEligible: false,
    description: "No monthly premium, but you pay 100% of all medical bills out-of-pocket. Eligible for charity care and cash discounts.",
    pros: ["No monthly premium payments"],
    cons: ["100% financial liability", "No ceiling (OOPM) on medical debt", "Higher hospital baseline charges (chargemaster prices)", "No preventive care coverage"]
  }
];

window.INJURY_SCENARIOS = {
  "pregnancy": {
    name: "Pregnancy & Childbirth (3-Day Hospital Stay)",
    items: [
      { code: "99395", charge: 180, description: "Routine prenatal physical checkup" },
      { code: "99222", charge: 1200, description: "Initial hospital inpatient care per day (moderate severity)" },
      { code: "HC-ROOM", charge: 8400, description: "Hospital semi-private room charges (3 days at $2800/day)" },
      { code: "76830", charge: 350, description: "Ultrasound of the pelvis (pregnancy scan)" },
      { code: "80053", charge: 90, description: "Comprehensive Metabolic Panel (CMP)" }
    ]
  },
  "knee_surgery": {
    name: "Knee Injury (Meniscectomy Outpatient Surgery)",
    items: [
      { code: "99203", charge: 240, description: "Office visit for orthopedist consultation (new patient)" },
      { code: "72148", charge: 1800, description: "MRI of the lumbar spine / joint structure without contrast" },
      { code: "29881", charge: 4500, description: "Knee arthroscopy (meniscectomy & joint cartilage shaving)" },
      { code: "HC-FAC", charge: 450, description: "Hospital outpatient facility surgical fee" },
      { code: "93000", charge: 110, description: "Electrocardiogram (EKG/ECG) tracing and report" }
    ]
  },
  "chest_pain_er": {
    name: "Severe Chest Pain (ER Visit & ALS Ambulance)",
    items: [
      { code: "99285", charge: 2400, description: "Emergency department visit (critical/life-threatening severity)" },
      { code: "A0427", charge: 1100, description: "Ambulance service, Advanced Life Support, emergency transport" },
      { code: "85025", charge: 60, description: "Complete Blood Count (CBC) test" },
      { code: "71045", charge: 120, description: "Chest X-ray (single view)" },
      { code: "93000", charge: 110, description: "Electrocardiogram (EKG/ECG) trace & interpretation" }
    ]
  },
  "preventive_wellness": {
    name: "Routine Annual Wellness Checkup",
    items: [
      { code: "99395", charge: 180, description: "Preventive medicine evaluation/wellness visit (established patient)" },
      { code: "80053", charge: 90, description: "Comprehensive Metabolic Panel (CMP)" },
      { code: "80061", charge: 75, description: "Lipid Panel (cholesterol checks)" }
    ]
  }
};
