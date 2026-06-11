// Main controller for Healthcare Cost Optimizer (V5 Global Script Mode)

// Global state
const state = {
  profile: {
    age: 35,
    householdSize: 1,
    agi: 48000,
    state: "MA",
    zipcode: "02108",
    filingStatus: "single",
    citizenship: "citizen",
    hasEmployerOffer: "no",
    employmentStatus: "w2",
    currentCoverage: "none",
    currentActive: "active",
    coverageEndDate: "",
    hsaContribution: 3000,
    cmsApiKey: ""
  },
  billItems: [],
  hospitalName: "Community Medical Center",
  chartInstance: null,
  chartType: "line",
  ocrTempItems: [],
  tempCustomItem: null
};

// DOM Elements
const ageInput = document.getElementById("user-age");
const hhInput = document.getElementById("household-size");
const agiInput = document.getElementById("user-agi");
const stateSelect = document.getElementById("user-state");
const zipInput = document.getElementById("user-zip");
const filingSelect = document.getElementById("filing-status");
const citizenshipSelect = document.getElementById("citizenship");
const employerSelect = document.getElementById("employer-offer");
const employmentSelect = document.getElementById("employment-status");
const currentCoverageSelect = document.getElementById("current-coverage");
const currentActiveSelect = document.getElementById("current-coverage-active");
const currentEndDateInput = document.getElementById("coverage-end-date");
const coverageEndDateGroup = document.getElementById("coverage-end-date-group");
const hsaInput = document.getElementById("hsa-contribution");

const tabScan = document.getElementById("tab-scan-btn");
const tabManual = document.getElementById("tab-manual-btn");
const paneScan = document.getElementById("pane-scan");
const paneManual = document.getElementById("pane-manual");

const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const openCameraBtn = document.getElementById("open-camera-btn");
const scanProgressBox = document.getElementById("scan-progress-box");
const scanProgressBar = document.getElementById("scan-progress-bar");
const scanPercentage = document.getElementById("scan-percentage");

const cptSelector = document.getElementById("cpt-selector");
const manualCptCode = document.getElementById("manual-cpt-code");
const manualCptDesc = document.getElementById("manual-cpt-desc");
const customCharge = document.getElementById("custom-charge");
const manualFrequency = document.getElementById("manual-frequency");
const addManualBtn = document.getElementById("add-manual-item");
const clearAllBtn = document.getElementById("clear-all-btn");
const scenarioSelector = document.getElementById("scenario-selector");

const billItemsContainer = document.getElementById("bill-items-container");
const emptyBillMsg = document.getElementById("empty-bill-message");
const billTotalDisplay = document.getElementById("bill-total-display");

const planComparisonList = document.getElementById("plan-comparison-list");
const planSearchInput = document.getElementById("plan-search-input");
const bestPlanCard = document.getElementById("best-plan-card");
const adviceEngineCard = document.getElementById("advice-engine-card");

const auditResultsContainer = document.getElementById("audit-results-container");
const genDisputeBtn = document.getElementById("gen-dispute-btn");
const genCharityBtn = document.getElementById("gen-charity-btn");
const letterEditorBox = document.getElementById("letter-editor-box");
const letterContentBox = document.getElementById("letter-content-box");
const letterEligibilityWarning = document.getElementById("letter-eligibility-warning");
const copyLetterBtn = document.getElementById("copy-letter-btn");

// Camera Modal
const cameraModal = document.getElementById("camera-modal");
const webcamVideo = document.getElementById("webcam-stream");
const snapshotCanvas = document.getElementById("snapshot-canvas");
const snapBtn = document.getElementById("snap-btn");
const closeCameraBtn = document.getElementById("close-camera-btn");

// Verification Modal
const verificationModal = document.getElementById("verification-modal");
const ocrRawTextArea = document.getElementById("ocr-raw-text-area");
const ocrDetectedList = document.getElementById("ocr-detected-list");
const confirmOcrBtn = document.getElementById("confirm-ocr-import-btn");
const cancelOcrBtn = document.getElementById("cancel-ocr-import-btn");

// CPT Category Modal
const cptCategoryModal = document.getElementById("cpt-category-modal");
const unknownCptDisplay = document.getElementById("unknown-cpt-display");
const unknownCategorySelect = document.getElementById("unknown-category-select");
const saveCptCategoryBtn = document.getElementById("save-cpt-category-btn");
const cancelCptCategoryBtn = document.getElementById("cancel-cpt-category-btn");

// Chart Toggles
const chartToggleLine = document.getElementById("chart-toggle-line");
const chartToggleBar = document.getElementById("chart-toggle-bar");

// CMS API Input
const cmsApiKeyInput = document.getElementById("cms-api-key-input");

// Unique High-Contrast HSL Color Palette Mapping for all 10 plans
function getPlanColor(planId) {
  const colorMap = {
    bronze_hdhp: "#38bdf8",     // Cyan
    silver_ppo: "#6366f1",      // Indigo
    gold_ppo: "#e11d48",        // Red
    platinum_epo: "#10b981",    // Emerald
    bcbs_silver: "#3b82f6",     // Royal Blue
    united_gold: "#f59e0b",     // Amber/Gold
    aetna_bronze: "#ec4899",    // Pink
    cigna_silver: "#8b5cf6",    // Purple
    kaiser_platinum: "#14b8a6", // Teal
    no_insurance: "#f97316"     // Orange
  };
  return colorMap[planId] || "#94a3b8"; // Gray fallback
}

// Init Application
document.addEventListener("DOMContentLoaded", () => {
  // V5.1: Load saved CMS API key from browser's local storage
  const savedKey = localStorage.getItem("cms_api_key");
  if (savedKey && cmsApiKeyInput) {
    cmsApiKeyInput.value = savedKey;
  }

  setupEventListeners();
  populateCptSelector();
  syncProfileState();
  updateCalculations();
  initSecurityLock();
});

// Setup DOM bindings
function setupEventListeners() {
  const profileElements = [
    ageInput, hhInput, agiInput, stateSelect, zipInput,
    filingSelect, citizenshipSelect, employerSelect, employmentSelect,
    currentCoverageSelect, currentActiveSelect, currentEndDateInput, hsaInput,
    cmsApiKeyInput
  ];

  profileElements.forEach(elem => {
    elem.addEventListener("input", () => {
      syncProfileState();
      updateCalculations();
    });
  });

  // Toggle coverage date group visibility based on status
  currentActiveSelect.addEventListener("change", () => {
    if (currentActiveSelect.value === "lost") {
      coverageEndDateGroup.style.display = "block";
    } else {
      coverageEndDateGroup.style.display = "none";
      currentEndDateInput.value = "";
    }
  });

  // Tabs
  tabScan.addEventListener("click", () => toggleTabs("scan"));
  tabManual.addEventListener("click", () => toggleTabs("manual"));

  // Scenario Selector
  scenarioSelector.addEventListener("change", handleScenarioChange);

  // Search filter
  planSearchInput.addEventListener("input", () => updateCalculations());

  // Chart toggles
  chartToggleLine.addEventListener("click", () => toggleChartType("line"));
  chartToggleBar.addEventListener("click", () => toggleChartType("bar"));

  // File OCR Upload
  dropZone.addEventListener("click", (e) => {
    if (e.target !== openCameraBtn) {
      fileInput.click();
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  });

  // Drag & drop
  dropZone.addEventListener("dragover", e => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });
  
  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });
  
  dropZone.addEventListener("drop", e => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    if (e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  });

  // Camera events
  openCameraBtn.addEventListener("click", openCamera);
  closeCameraBtn.addEventListener("click", closeCamera);
  snapBtn.addEventListener("click", snapPhoto);

  // Verification modal events
  confirmOcrBtn.addEventListener("click", importVerifiedOcrItems);
  cancelOcrBtn.addEventListener("click", discardOcrImport);

  // CPT category modal events
  saveCptCategoryBtn.addEventListener("click", saveCustomCptCategory);
  cancelCptCategoryBtn.addEventListener("click", () => cptCategoryModal.style.display = "none");

  // Manual items add
  addManualBtn.addEventListener("click", addManualItem);
  clearAllBtn.addEventListener("click", clearAllItems);

  // Appeal Letter events
  genDisputeBtn.addEventListener("click", renderDisputeLetter);
  genCharityBtn.addEventListener("click", renderCharityLetter);
  copyLetterBtn.addEventListener("click", copyLetterToClipboard);
}

// Sync values to state
function syncProfileState() {
  state.profile.age = parseInt(ageInput.value) || 35;
  state.profile.householdSize = Math.max(1, parseInt(hhInput.value) || 1);
  state.profile.agi = Math.max(0, parseInt(agiInput.value) || 0);
  state.profile.state = stateSelect.value;
  state.profile.zipcode = zipInput ? zipInput.value.trim() : "02108";
  state.profile.filingStatus = filingSelect.value;
  state.profile.citizenship = citizenshipSelect.value;
  state.profile.hasEmployerOffer = employerSelect.value;
  state.profile.employmentStatus = employmentSelect.value;
  state.profile.currentCoverage = currentCoverageSelect.value;
  state.profile.currentActive = currentActiveSelect.value;
  state.profile.coverageEndDate = currentEndDateInput.value;
  state.profile.hsaContribution = Math.max(0, parseInt(hsaInput.value) || 0);
  state.profile.cmsApiKey = cmsApiKeyInput ? cmsApiKeyInput.value.trim() : "";

  // V5.1: Persist key locally on user device
  if (state.profile.cmsApiKey) {
    localStorage.setItem("cms_api_key", state.profile.cmsApiKey);
  } else {
    localStorage.removeItem("cms_api_key");
  }

  // Adjust HSA limits
  const hsaLimit = (state.profile.householdSize > 1) ? 8550 : 4300;
  hsaInput.max = hsaLimit;
  if (state.profile.hsaContribution > hsaLimit) {
    state.profile.hsaContribution = hsaLimit;
    hsaInput.value = hsaLimit;
  }
}

// Open Camera feed
async function openCamera(e) {
  e.preventDefault();
  e.stopPropagation();
  try {
    const active = await window.HealthcareOCR.startCamera(webcamVideo);
    if (active) {
      cameraModal.style.display = "flex";
    }
  } catch (err) {
    alert(err.message);
  }
}

// Close Camera modal
function closeCamera(e) {
  if (e) e.preventDefault();
  window.HealthcareOCR.stopCamera();
  cameraModal.style.display = "none";
}

// Snap frame
async function snapPhoto(e) {
  e.preventDefault();
  const blob = await window.HealthcareOCR.captureSnapshot(webcamVideo, snapshotCanvas);
  closeCamera();
  processFile(blob);
}

// Handle Simulated Injury Event Loading
function handleScenarioChange() {
  const scenarioKey = scenarioSelector.value;
  if (!scenarioKey) return;

  const scenario = window.INJURY_SCENARIOS[scenarioKey];
  if (scenario) {
    state.billItems = scenario.items.map(item => ({
      code: item.code,
      description: item.description,
      charge: item.charge
    }));
    
    renderBillItems();
    updateCalculations();
  }
}

// Clear medical list
function clearAllItems(e) {
  e.preventDefault();
  state.billItems = [];
  scenarioSelector.value = "";
  renderBillItems();
  updateCalculations();
}

// Toggle chart display type
function toggleChartType(type) {
  state.chartType = type;
  if (type === "line") {
    chartToggleLine.style.background = "rgba(56,189,248,0.2)";
    chartToggleLine.style.borderColor = "var(--primary)";
    chartToggleBar.style.background = "transparent";
    chartToggleBar.style.borderColor = "var(--border-glass)";
  } else {
    chartToggleLine.style.background = "transparent";
    chartToggleLine.style.borderColor = "var(--border-glass)";
    chartToggleBar.style.background = "rgba(56,189,248,0.2)";
    chartToggleBar.style.borderColor = "var(--primary)";
  }
  updateCalculations();
}

// Populate CPT list
function populateCptSelector() {
  cptSelector.innerHTML = '<option value="" disabled selected>Select a common service...</option>';
  Object.keys(window.CPT_DATABASE).forEach(key => {
    const item = window.CPT_DATABASE[key];
    const option = document.createElement("option");
    option.value = item.code;
    option.textContent = `[CPT ${item.code}] ${item.description.substring(0, 50)}...`;
    cptSelector.appendChild(option);
  });

  cptSelector.addEventListener("change", () => {
    const item = window.CPT_DATABASE[cptSelector.value];
    if (item) {
      manualCptCode.value = item.code;
      manualCptDesc.value = item.description;
      customCharge.value = item.avgCommercial;
    }
  });
}

// Toggle Tab
function toggleTabs(activeTab) {
  if (activeTab === "scan") {
    tabScan.classList.add("active");
    tabManual.classList.remove("active");
    paneScan.style.display = "block";
    paneManual.style.display = "none";
  } else {
    tabScan.classList.remove("active");
    tabManual.classList.add("active");
    paneScan.style.display = "none";
    paneManual.style.display = "block";
  }
}

// Process OCR files
async function processFile(fileOrBlob) {
  scanProgressBox.style.display = "block";
  scanProgressBar.style.width = "0%";
  scanPercentage.textContent = "0%";

  try {
    const text = await window.HealthcareOCR.scanBillImage(fileOrBlob, percent => {
      scanProgressBar.style.width = `${percent}%`;
      scanPercentage.textContent = `${percent}%`;
    });

    scanProgressBox.style.display = "none";
    
    // Parse recognized text
    const parsed = window.HealthcareOCR.parseBillText(text, window.CPT_DATABASE);
    state.hospitalName = parsed.hospitalName;

    state.ocrTempItems = parsed.detectedCptCodes.map(cpt => ({
      code: cpt.code,
      description: cpt.description,
      charge: cpt.avgCommercial
    }));

    if (state.ocrTempItems.length === 0 && parsed.totalCharged > 0) {
      state.ocrTempItems.push({
        code: "HC-FAC",
        description: "Scanned Hospital Charges",
        charge: parsed.totalCharged
      });
    }

    openOcrVerificationModal(text);

  } catch (err) {
    console.error("Scan Error: ", err);
    alert("Scan Error: " + err.message);
    scanProgressBox.style.display = "none";
  }
}

// Show verification panel
function openOcrVerificationModal(rawText) {
  ocrRawTextArea.value = rawText;
  ocrDetectedList.innerHTML = "";

  if (state.ocrTempItems.length === 0) {
    ocrDetectedList.innerHTML = `<div style="text-align: center; color: var(--text-dark); padding: 10px 0;">No codes detected. Enter them manually.</div>`;
  } else {
    state.ocrTempItems.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "ocr-edit-row";
      row.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
          <input type="checkbox" id="ocr-check-${index}" checked style="width: 16px; height: 16px;">
          <label for="ocr-check-${index}" style="font-size: 13px; font-weight: 600;">[CPT ${item.code}]</label>
          <span style="font-size: 11px; color: var(--text-muted); text-overflow: ellipsis; white-space: nowrap; overflow: hidden; max-width: 200px;">${item.description}</span>
        </div>
        <div>
          <input type="number" id="ocr-charge-${index}" class="ocr-edit-input" value="${Math.round(item.charge)}">
        </div>
      `;
      ocrDetectedList.appendChild(row);
    });
  }

  verificationModal.style.display = "flex";
}

// Save verified items
function importVerifiedOcrItems() {
  state.ocrTempItems.forEach((item, index) => {
    const chk = document.getElementById(`ocr-check-${index}`);
    const num = document.getElementById(`ocr-charge-${index}`);
    
    if (chk && chk.checked) {
      const confirmedPrice = parseFloat(num.value) || item.charge;
      state.billItems.push({
        code: item.code,
        description: item.description,
        charge: confirmedPrice
      });
    }
  });

  verificationModal.style.display = "none";
  state.ocrTempItems = [];
  renderBillItems();
  updateCalculations();
}

function discardOcrImport() {
  verificationModal.style.display = "none";
  state.ocrTempItems = [];
}

// Add manual item
function addManualItem(e) {
  e.preventDefault();
  const code = manualCptCode.value.trim() || "HC-CUSTOM";
  const desc = manualCptDesc.value.trim() || "Custom Medical Expense";
  const charge = parseFloat(customCharge.value);
  const freq = manualFrequency.value;

  if (isNaN(charge) || charge <= 0) {
    alert("Please enter a valid cost.");
    return;
  }

  // CPT Code categorization intercept
  if (code !== "HC-CUSTOM" && code !== "" && !window.CPT_DATABASE[code]) {
    state.tempCustomItem = { code, desc, charge, freq };
    unknownCptDisplay.textContent = code;
    cptCategoryModal.style.display = "flex";
    return;
  }

  const finalCharge = (freq === "monthly") ? (charge * 12) : charge;
  const finalDesc = desc + (freq === "monthly" ? " (Monthly Recurring)" : "");

  state.billItems.push({
    code: code,
    description: finalDesc,
    charge: finalCharge
  });

  renderBillItems();
  updateCalculations();
  
  // Clear fields
  manualCptCode.value = "";
  manualCptDesc.value = "";
  cptSelector.value = "";
  customCharge.value = "";
}

// Save custom categorization
function saveCustomCptCategory() {
  const category = unknownCategorySelect.value;
  let medicareRate = 100;
  
  if (category === "office") medicareRate = 110;
  else if (category === "surgery") medicareRate = 980;
  else if (category === "er") medicareRate = 260;
  else if (category === "imaging") medicareRate = 220;
  else if (category === "lab") medicareRate = 15;

  window.CPT_DATABASE[state.tempCustomItem.code] = {
    code: state.tempCustomItem.code,
    category: category.toUpperCase(),
    description: state.tempCustomItem.desc,
    avgCommercial: state.tempCustomItem.charge,
    medicareRate: medicareRate,
    typicalDiscount: 0.40
  };

  const finalCharge = (state.tempCustomItem.freq === "monthly") ? (state.tempCustomItem.charge * 12) : state.tempCustomItem.charge;
  const finalDesc = state.tempCustomItem.desc + (state.tempCustomItem.freq === "monthly" ? " (Monthly Recurring)" : "");

  state.billItems.push({
    code: state.tempCustomItem.code,
    description: finalDesc,
    charge: finalCharge
  });

  cptCategoryModal.style.display = "none";
  state.tempCustomItem = null;

  renderBillItems();
  updateCalculations();

  manualCptCode.value = "";
  manualCptDesc.value = "";
  cptSelector.value = "";
  customCharge.value = "";
}

// Render list of added medical bill items
function renderBillItems() {
  billItemsContainer.innerHTML = "";
  
  if (state.billItems.length === 0) {
    emptyBillMsg.style.display = "block";
    billItemsContainer.appendChild(emptyBillMsg);
    billTotalDisplay.textContent = "$0";
    return;
  }
  
  emptyBillMsg.style.display = "none";
  let total = 0;
  
  state.billItems.forEach((item, index) => {
    total += item.charge;
    const row = document.createElement("div");
    row.className = "bill-item-card";
    row.innerHTML = `
      <div style="flex: 1; min-width: 0; padding-right: 12px; word-break: break-word;">
        <div style="font-size: 12px; font-weight: 600; color: var(--primary);">CPT ${item.code}</div>
        <div style="font-size: 13px; color: var(--text-main); margin-top: 2px; line-height: 1.3;">${item.description}</div>
      </div>
      <div style="display: flex; align-items: center; gap: 16px;">
        <span style="font-size: 15px; font-weight: 700; color: var(--accent-red);">$${Math.round(item.charge).toLocaleString()}</span>
        <button class="delete-item-btn" onclick="removeItem(${index})">&times;</button>
      </div>
    `;
    billItemsContainer.appendChild(row);
  });
  
  billTotalDisplay.textContent = `$${Math.round(total).toLocaleString()}`;
}

// Remove bill item
function removeItem(index) {
  state.billItems.splice(index, 1);
  renderBillItems();
  updateCalculations();
}

// Live CMS Marketplace API integration pipeline stub
async function fetchCMSMarketplacePlans(apiKey) {
  console.log("Initiating live CMS Marketplace API fetch pipeline...");
  const requestUrl = `https://marketplace.api.healthcare.gov/api/v1/plans/search?apikey=${apiKey}`;
  
  const payload = {
    household: {
      income: state.profile.agi,
      people: [
        {
          age: state.profile.age,
          aptc_eligible: (state.profile.citizenship === "citizen" && state.profile.hasEmployerOffer === "no")
        }
      ]
    },
    market: "Individual",
    place: {
      state: state.profile.state,
      zipcode: state.profile.zipcode || "02108"
    },
    year: 2026
  };

  try {
    const response = await fetch(requestUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    
    if (response.status === 401 || response.status === 403) {
      console.warn("CMS API Authentication error (Key unauthorized or expired). Falling back to estimated private rates.");
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Failed to query CMS Marketplace API", err);
    return null;
  }
}

// Run calculations
async function updateCalculations() {
  const utilization = state.billItems.reduce((acc, item) => acc + item.charge, 0);

  if (state.profile.cmsApiKey) {
    const liveData = await fetchCMSMarketplacePlans(state.profile.cmsApiKey);
    if (liveData && liveData.plans) {
      console.log("Successfully retrieved live health plans from Healthcare.gov API:", liveData.plans.length);
    }
  }
  
  const results = window.SAMPLE_PLANS.map(plan => {
    const summary = window.HealthcareMath.calculatePlanTACC({
      plan,
      utilization,
      agi: state.profile.agi,
      householdSize: state.profile.householdSize,
      filingStatus: state.profile.filingStatus,
      citizenship: state.profile.citizenship,
      hasEmployerOffer: state.profile.hasEmployerOffer,
      hsaContribution: state.profile.hsaContribution,
      state: state.profile.state,
      age: state.profile.age,
      employmentStatus: state.profile.employmentStatus
    });
    return { plan, summary };
  });

  // Filter plans
  const searchVal = planSearchInput.value.toLowerCase().trim();
  const filteredResults = results.filter(res => 
    res.plan.name.toLowerCase().includes(searchVal) ||
    res.plan.type.toLowerCase().includes(searchVal) ||
    res.plan.tier.toLowerCase().includes(searchVal)
  );

  renderComparisonList(filteredResults);
  renderBestPlan(results);
  runAuditEngine(results, utilization);
  renderCostCurveChart(results, utilization);
  runAdviceEngine(results, utilization);
}

// Render compared health plans
function renderComparisonList(results) {
  planComparisonList.innerHTML = "";
  
  results.forEach(res => {
    const item = document.createElement("div");
    item.className = "plan-item";
    
    let hsaAssetDisplay = "";
    if (res.plan.hsaEligible && res.summary.hsaAssetVal > 0) {
      hsaAssetDisplay = `<p style="font-size: 11px; color: var(--accent-green); font-weight: 600; margin-top: 8px;">★ Adds $${res.summary.hsaAssetVal} to your HSA tax-free wealth.</p>`;
    }

    item.innerHTML = `
      <div class="plan-header">
        <div>
          <h4 style="font-size: 16px; margin-bottom: 4px;">${res.plan.name}</h4>
          <div class="plan-meta">
            <span class="tier-badge tier-${res.plan.tier}">${res.plan.tier}</span>
            <span class="plan-type-badge">${res.plan.type}</span>
          </div>
        </div>
        <div style="text-align: right;">
          <span class="cost-value" style="color: ${res.plan.id === 'no_insurance' ? 'var(--accent-red)' : 'var(--text-main)'}">
            $${res.summary.netCost}/yr
          </span>
          <p style="font-size: 10px; color: var(--text-muted);">Net Care Cost</p>
        </div>
      </div>
      
      <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">${res.plan.description}</p>
      
      <div class="plan-cost-summary">
        <div class="cost-metric">
          <p class="cost-label">Premium/Mo</p>
          <p class="cost-value">$${Math.round(res.summary.monthlyPremium)}</p>
        </div>
        <div class="cost-metric">
          <p class="cost-label">Deductible</p>
          <p class="cost-value">$${res.plan.deductible === Infinity ? "N/A" : res.plan.deductible}</p>
        </div>
        <div class="cost-metric">
          <p class="cost-label">OOP Paid</p>
          <p class="cost-value">$${res.summary.oopPaid}</p>
        </div>
        <div class="cost-metric">
          <p class="cost-label">Tax Savings</p>
          <p class="cost-value saving">$${res.summary.hsaTaxSavings + res.summary.premiumTaxSavings}</p>
        </div>
      </div>

      ${hsaAssetDisplay}
    `;
    planComparisonList.appendChild(item);
  });
}

// Recommend best plan card
function renderBestPlan(results) {
  const validPlans = results.filter(r => r.plan.id !== "no_insurance");
  if (validPlans.length === 0) return;

  const best = validPlans.reduce((prev, curr) => prev.summary.netCost < curr.summary.netCost ? prev : curr);
  const uninsured = results.find(r => r.plan.id === "no_insurance");

  let benefitExplanation = "";
  if (best.plan.hsaEligible) {
    benefitExplanation = `Enrolling in this <strong>HSA Plan</strong> saves you <strong>$${best.summary.hsaTaxSavings}</strong> in taxes. It also caps your absolute maximum liability in an emergency at $${best.plan.oopm}.`;
  } else {
    benefitExplanation = `Your low deductible of $${best.plan.deductible} and predictable copays keep your total costs structured and lower than other coverage tiers.`;
  }

  const savingsOverUninsured = uninsured.summary.netCost - best.summary.netCost;
  let savingsStatement = "";
  if (savingsOverUninsured > 0) {
    savingsStatement = `<span style="color: var(--accent-green); font-weight: 700;">Saves you $${Math.round(savingsOverUninsured)}</span> compared to staying uninsured.`;
  } else {
    savingsStatement = `Uninsured costs appear cheaper for this bill alone, but carrying no coverage exposes you to unlimited catastrophic risk.`;
  }

  bestPlanCard.innerHTML = `
    <div class="plan-item best-match" style="margin-bottom: 24px;">
      <div class="best-match-badge">Recommended Plan</div>
      <h3 style="color: var(--accent-green); font-size: 18px; margin-bottom: 8px;">${best.plan.name}</h3>
      <p style="font-size: 13px; margin-bottom: 12px;">Based on your inputs, this plan offers the lowest net cost of <strong>$${best.summary.netCost}/year</strong> (Premium + Out of Pocket minus Tax Writeoffs).</p>
      <div style="font-size: 12px; border-left: 2px solid var(--accent-green); padding-left: 12px; margin-bottom: 16px;">
        ${benefitExplanation} <br>
        ${savingsStatement}
      </div>
      
      <div style="display: flex; gap: 20px;">
        <div style="flex: 1;">
          <h5 style="color: var(--accent-green); font-size: 11px; text-transform: uppercase;">Pros</h5>
          <ul style="font-size: 11px; padding-left: 12px; color: var(--text-muted);">
            ${best.plan.pros.map(p => `<li>${p}</li>`).join("")}
          </ul>
        </div>
        <div style="flex: 1;">
          <h5 style="color: var(--accent-red); font-size: 11px; text-transform: uppercase;">Cons</h5>
          <ul style="font-size: 11px; padding-left: 12px; color: var(--text-muted);">
            ${best.plan.cons.map(c => `<li>${c}</li>`).join("")}
          </ul>
        </div>
      </div>
    </div>
  `;
}

// V5 Actionable Advice Engine with 60-Day SEP Calendar logic
function runAdviceEngine(results, totalBill) {
  const fpl = window.HealthcareMath.calculateFPL(state.profile.householdSize);
  const ratioFPL = state.profile.agi / fpl;

  let adviceHTML = "";

  // 1. Medicaid checks
  const medicaidResult = window.HealthcareMath.checkMedicaidEligibility(state.profile.agi, state.profile.householdSize, state.profile.state);
  if (medicaidResult.eligible) {
    adviceHTML += `
      <div style="margin-bottom: 16px; padding: 12px; border-radius: 12px; background: rgba(52, 211, 153, 0.1); border-left: 4px solid var(--accent-green);">
        <h4 style="color: var(--accent-green); font-size: 14px; margin-bottom: 4px;">★ ${medicaidResult.status}</h4>
        <p style="font-size: 12px; color: var(--text-muted);">${medicaidResult.description}</p>
      </div>
    `;
  } else if (medicaidResult.gap) {
    adviceHTML += `
      <div style="margin-bottom: 16px; padding: 12px; border-radius: 12px; background: rgba(248, 113, 113, 0.1); border-left: 4px solid var(--accent-red);">
        <h4 style="color: var(--accent-red); font-size: 14px; margin-bottom: 4px;">🚨 ${medicaidResult.status}</h4>
        <p style="font-size: 12px; color: var(--text-muted);">${medicaidResult.description} Consider looking for job benefits or seeking free local community health clinics.</p>
      </div>
    `;
  }

  // 2. 60-Day Special Enrollment Period (SEP) timeline
  if (state.profile.currentActive === "lost" && state.profile.coverageEndDate) {
    const lossDate = new Date(state.profile.coverageEndDate + "T00:00:00");
    const currentDate = new Date();
    currentDate.setHours(0,0,0,0);
    
    const diffTime = currentDate - lossDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const daysRemaining = 60 - diffDays;
    
    if (daysRemaining > 0) {
      const expirationDate = new Date(lossDate.getTime() + 60 * 24 * 60 * 60 * 1000);
      adviceHTML += `
        <div style="margin-bottom: 16px; padding: 12px; border-radius: 12px; background: rgba(251, 191, 36, 0.1); border-left: 4px solid var(--accent-amber);">
          <h4 style="color: var(--accent-amber); font-size: 14px; margin-bottom: 4px;">⏰ Special Enrollment Period (SEP) Active</h4>
          <p style="font-size: 12px; color: var(--text-muted);">You lost coverage on <strong>${lossDate.toLocaleDateString()}</strong>. Under federal law, you have exactly <strong>${daysRemaining} days left</strong> in your 60-day Special Enrollment window to switch to a new marketplace plan (expires <strong>${expirationDate.toLocaleDateString()}</strong>). Act quickly before this window closes, otherwise you will be locked out until the next Open Enrollment Period.</p>
        </div>
      `;
    } else {
      const expirationDate = new Date(lossDate.getTime() + 60 * 24 * 60 * 60 * 1000);
      adviceHTML += `
        <div style="margin-bottom: 16px; padding: 12px; border-radius: 12px; background: rgba(248, 113, 113, 0.1); border-left: 4px solid var(--accent-red);">
          <h4 style="color: var(--accent-red); font-size: 14px; margin-bottom: 4px;">🚨 Special Enrollment Period Expired</h4>
          <p style="font-size: 12px; color: var(--text-muted);">Your 60-day Special Enrollment window has **expired** (ended on <strong>${expirationDate.toLocaleDateString()}</strong>). You are locked out of private marketplace switches until the next Open Enrollment Period (Nov 1 - Jan 15) unless you qualify for another exception (e.g. marriage, baby birth, or relocating to a new zip code).</p>
        </div>
      `;
    }
  } else {
    // Standard timeline
    adviceHTML += `
      <div style="margin-bottom: 16px; padding: 12px; border-radius: 12px; background: rgba(251, 191, 36, 0.1); border-left: 4px solid var(--accent-amber);">
        <h4 style="color: var(--accent-amber); font-size: 14px; margin-bottom: 4px;">⏳ Annual Timeline & Switching Rules</h4>
        <p style="font-size: 12px; color: var(--text-muted);">US health plans are annual calendar contracts. Open Enrollment runs from <strong>Nov 1 to Jan 15</strong>. You cannot cancel and switch plans mid-year unless you experience a Qualifying Life Event (e.g. job loss, birth, marriage, divorce, or relocating to a new zip code).</p>
      </div>
    `;
  }

  // 3. Deductible reset warning
  if (totalBill > 0) {
    adviceHTML += `
      <div style="margin-bottom: 16px; padding: 12px; border-radius: 12px; background: rgba(248, 113, 113, 0.1); border-left: 4px solid var(--accent-red);">
        <h4 style="color: var(--accent-red); font-size: 14px; margin-bottom: 4px;">⚠️ Mid-Year Deductible Reset Warning</h4>
        <p style="font-size: 12px; color: var(--text-muted);">If you qualify for a mid-year switch under a Special Enrollment Period (SEP), note that any payments you made toward your current plan's deductible will **reset to $0** on the new plan. Only switch mid-year if your premium savings outweigh this reset burden.</p>
      </div>
    `;
  }

  // 4. Pre-existing conditions safety check
  adviceHTML += `
    <div style="margin-bottom: 16px; padding: 12px; border-radius: 12px; background: rgba(56, 189, 248, 0.1); border-left: 4px solid var(--primary);">
      <h4 style="color: var(--primary); font-size: 14px; margin-bottom: 4px;">🛡️ Pre-Existing Conditions Protection</h4>
      <p style="font-size: 12px; color: var(--text-muted);">Under the ACA, health insurance plans cannot charge you more, deny you coverage, or restrict benefits due to pre-existing chronic conditions. You are fully protected when switching between qualified marketplace or employer plans.</p>
    </div>
  `;

  // 5. Crossover advice
  const bronze = results.find(r => r.plan.id === "bronze_hdhp");
  const gold = results.find(r => r.plan.id === "gold_ppo");

  if (bronze && gold) {
    const costDiff = gold.summary.netCost - bronze.summary.netCost;
    if (costDiff > 0) {
      adviceHTML += `
        <div style="padding: 12px; border-radius: 12px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-glass);">
          <h4 style="font-size: 14px; margin-bottom: 4px;">📊 Cost Crossover Strategy</h4>
          <p style="font-size: 12px; color: var(--text-muted);">Given your current medical bill profile of $${Math.round(totalBill)}, the **Bronze HSA Plan** is currently the most cost-effective, saving you **$${Math.round(costDiff)}/year** over PPO options. If you expect your future annual care usage to remain below $5,000, staying with the HDHP + HSA is the optimal strategy.</p>
        </div>
      `;
    } else {
      adviceHTML += `
        <div style="padding: 12px; border-radius: 12px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-glass);">
          <h4 style="font-size: 14px; margin-bottom: 4px;">📊 Cost Crossover Strategy</h4>
          <p style="font-size: 12px; color: var(--text-muted);">Because you have high current medical bill expenses ($${Math.round(totalBill)}), the **Gold PPO Plan** has crossed over to become more cost-effective. Enrolling in a low-deductible PPO caps your out-of-pocket copays and will save you money over a Bronze HDHP when major medical needs arise.</p>
        </div>
      `;
    }
  }

  adviceEngineCard.innerHTML = adviceHTML;
}

// Core audit check engine
function runAuditEngine(results, totalBill) {
  auditResultsContainer.innerHTML = "";
  const audits = [];

  // Check state penalties
  const mandateStates = ["CA", "MA", "NJ", "RI", "DC", "VT"];
  if (mandateStates.includes(state.profile.state)) {
    audits.push({
      type: "flag-danger",
      icon: "⚖️",
      title: "State Individual Mandate Penalties Active",
      description: `You reside in ${state.profile.state}. Going without health insurance in this state will trigger tax penalties on your annual state tax returns.`
    });
  }

  if (state.profile.citizenship === "undocumented") {
    audits.push({
      type: "flag-warning",
      icon: "📋",
      title: "Marketplace Subsidy Restriction",
      description: "Undocumented status restricts ACA premium subsidies. However, you are fully eligible for nonprofit hospital Charity Care policies."
    });
  }

  if (state.profile.hasEmployerOffer === "yes") {
    audits.push({
      type: "flag-warning",
      icon: "💼",
      title: "Employer Health Offer Disqualification",
      description: "Because you are offered employer health insurance, you are barred from receiving ACA marketplace tax subsidies."
    });
  }

  // Letter eligibility check
  const charity = window.HealthcareMath.checkCharityCareEligibility(state.profile.agi, state.profile.householdSize);
  const fplLimit = window.HealthcareMath.calculateFPL(state.profile.householdSize);
  
  if (charity.eligible) {
    audits.push({
      type: "flag-success",
      icon: "🎉",
      title: `${charity.status}`,
      description: `${charity.description} Click 'Charity Care Letter' to view your appeal.`
    });
    genCharityBtn.disabled = false;
  } else {
    audits.push({
      type: "flag-warning",
      icon: "💡",
      title: "Charity Care Disqualified (>400% FPL)",
      description: `Your income exceeds 400% FPL ($${Math.round(fplLimit * 4.0)}). You do not qualify for hospital financial assistance. Dispute billing directly instead.`
    });
    genCharityBtn.disabled = true;
  }

  // Audit specific codes
  let emergencyCptDetected = false;
  let markedUpDetected = false;
  
  state.billItems.forEach(item => {
    const dbRef = window.CPT_DATABASE[item.code];
    if (dbRef) {
      const medicareRatio = item.charge / dbRef.medicareRate;
      if (medicareRatio > 2.0) {
        markedUpDetected = true;
        audits.push({
          type: "flag-danger",
          icon: "⚠️",
          title: `CPT Code ${item.code} Markup Alert`,
          description: `Hospital charged $${Math.round(item.charge)} (average Medicare rate is $${dbRef.medicareRate}). This is a ${Math.round(medicareRatio)}x markup. Target this in appeal letters.`
        });
      }

      if (["99283", "99284", "99285"].includes(item.code)) {
        emergencyCptDetected = true;
      }
    }
  });

  if (emergencyCptDetected) {
    audits.push({
      type: "flag-warning",
      icon: "🛡️",
      title: "No Surprises Act Active",
      description: "Emergency code detected. Out-of-network emergency rooms are barred from balance billing you. Only in-network cost-shares apply."
    });
  }

  // Dispute button eligibility
  if (state.billItems.length > 0 && (markedUpDetected || emergencyCptDetected)) {
    genDisputeBtn.disabled = false;
    letterEligibilityWarning.textContent = "";
  } else {
    genDisputeBtn.disabled = true;
    letterEligibilityWarning.textContent = "Dispute Letter only eligible for bills showing overcharges/ER CPT codes.";
  }

  if (state.billItems.length === 0) {
    audits.push({
      type: "flag-success",
      icon: "✅",
      title: "Awaiting Bill Details",
      description: "Add items using the bill scan or manual input to begin the automated audit check."
    });
  }

  audits.forEach(aud => {
    const div = document.createElement("div");
    div.className = `audit-item ${aud.type}`;
    div.innerHTML = `
      <div class="audit-icon">${aud.icon}</div>
      <div class="audit-details">
        <h4>${aud.title}</h4>
        <p>${aud.description}</p>
      </div>
    `;
    auditResultsContainer.appendChild(div);
  });
}

// Dispute Negotiation Letter
function renderDisputeLetter() {
  const dateStr = new Date().toLocaleDateString();
  const itemsText = state.billItems.map(item => {
    const db = window.CPT_DATABASE[item.code];
    const medRate = db ? `$${db.medicareRate}` : "N/A";
    const markupVal = db ? `${Math.round(item.charge / db.medicareRate)}x` : "N/A";
    return `- CPT Code ${item.code} (${item.description}): Billed $${Math.round(item.charge)} (CMS Medicare Benchmark: ${medRate} | Markup: ${markupVal})`;
  }).join("\n");

  const totalBill = state.billItems.reduce((acc, cur) => acc + cur.charge, 0);

  const template = `[Your Full Name]
[Your Mailing Address]
[Your Contact Phone]
[Your Email Address]

Date: ${dateStr}

To: Patient Financial Services / Billing Audit Division
Provider Facility: ${state.hospitalName}

RE: FORMAL BILLING AUDIT & PRICE CORRECTION REQUEST
Account Number: [Insert Account Number]
Total Balance Billed: $${Math.round(totalBill)}

To Whom It May Concern,

I am writing to formally dispute the charges on the above-referenced medical statement. Upon reviewing my fully itemized statement and medical records, I have identified billing codes and fees that are marked up significantly above the fair-market rates and CMS Medicare fee schedules.

Specifically, I am disputing the following procedure line items:

${itemsText}

I request a formal review of my chart for upcoding, duplicate billing, and unbundled charges. Under federal guidelines, including the No Surprises Act (45 CFR § 149), out-of-network emergency providers are prohibited from balance-billing patients.

Furthermore, please consider this a formal request to place a temporary hold on this account, pausing all collection activities and reporting to credit bureaus, while this billing dispute is under investigation. I expect a written response within thirty (30) days from receipt.

Sincerely,

_______________________________
[Your Signature]
[Your Printed Name]`;

  letterContentBox.textContent = template;
  letterEditorBox.style.display = "block";
  letterEditorBox.scrollIntoView({ behavior: "smooth" });
}

// Charity Care Appeal Letter
function renderCharityLetter() {
  const dateStr = new Date().toLocaleDateString();
  const fpl = window.HealthcareMath.calculateFPL(state.profile.householdSize);
  const percentFPL = Math.round((state.profile.agi / fpl) * 100);
  const totalBill = state.billItems.reduce((acc, cur) => acc + cur.charge, 0);

  const template = `[Your Full Name]
[Your Mailing Address]
[Your Contact Phone]
[Your Email Address]

Date: ${dateStr}

To: Financial Assistance Department / Charity Care Office
Hospital Facility: ${state.hospitalName}

RE: APPLICATION FOR FINANCIAL ASSISTANCE / IRC SECTION 501(r) RE-EVALUATION
Account Number: [Insert Account Number]
Unpaid Care Balance: $${Math.round(totalBill)}

Dear Coordinator,

I am writing to formally request financial assistance regarding my outstanding balance of $${Math.round(totalBill)} under the hospital's Financial Assistance Policy (FAP).

My Adjusted Gross Income (AGI) is $${state.profile.agi} for a household size of ${state.profile.householdSize}. According to current Department of Health and Human Services guidelines, my income places me at ${percentFPL}% of the Federal Poverty Level (FPL).

As a tax-exempt 501(c)(3) nonprofit hospital organization, your facility is federally mandated under Internal Revenue Code Section 501(r)(4) to provide financial assistance and discounts to low-income patients. Given my income relative to the poverty guidelines, I believe I qualify for the hospital's charity write-off policy.

I have attached copies of my recent financial documentation as required. Please send me the official application paperwork, provide a sliding-scale write-off, and place a temporary hold on this account to prevent collection actions.

Sincerely,

_______________________________
[Your Signature]
[Your Printed Name]`;

  letterContentBox.textContent = template;
  letterEditorBox.style.display = "block";
  letterEditorBox.scrollIntoView({ behavior: "smooth" });
}

// Clipboard copier helper
function copyLetterToClipboard() {
  navigator.clipboard.writeText(letterContentBox.textContent)
    .then(() => {
      alert("Letter copied to clipboard! You can paste it into email or word processors.");
    })
    .catch(err => {
      console.error("Failed to copy text", err);
    });
}

// Render dynamic Chart.js cost curves (Line vs Stacked Bar V5 with unique colors)
function renderCostCurveChart(results, totalBill) {
  const ctx = document.getElementById("costChart").getContext("2d");

  if (state.chartInstance) {
    state.chartInstance.destroy();
  }

  if (state.chartType === "line") {
    // Render Total Cost Curve (Line)
    const utilizationSpends = [0, 2000, 5000, 10000, 15000, 25000];

    const datasets = results.map(res => {
      const dataPoints = utilizationSpends.map(spend => {
        const calc = window.HealthcareMath.calculatePlanTACC({
          plan: res.plan,
          utilization: spend,
          agi: state.profile.agi,
          householdSize: state.profile.householdSize,
          filingStatus: state.profile.filingStatus,
          citizenship: state.profile.citizenship,
          hasEmployerOffer: state.profile.hasEmployerOffer,
          hsaContribution: state.profile.hsaContribution,
          state: state.profile.state,
          age: state.profile.age,
          employmentStatus: state.profile.employmentStatus
        });
        return calc.netCost;
      });

      const color = getPlanColor(res.plan.id);

      return {
        label: res.plan.name,
        data: dataPoints,
        borderColor: color,
        backgroundColor: color + "1A",
        borderWidth: 3,
        tension: 0.1,
        fill: false
      };
    });

    state.chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["$0", "$2,000", "$5,000", "$10,000", "$15,000", "$25,000"],
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#94a3b8",
              boxWidth: 10,
              padding: 8,
              font: { family: "Outfit", size: 9 }
            }
          },
          tooltip: { mode: "index", intersect: false }
        },
        scales: {
          x: {
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: { color: "#94a3b8" },
            title: { display: true, text: "Annual Healthcare Care Utilization", color: "#94a3b8" }
          },
          y: {
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: { color: "#94a3b8" },
            title: { display: true, text: "Total Net Cost ($/Year)", color: "#94a3b8" }
          }
        }
      }
    });

  } else {
    // Render Stacked Bar Chart for the specific medical bill total (Bar)
    const planLabels = results.map(r => r.plan.name.split(" ")[0] + " (" + r.plan.type + ")");
    
    const premiumData = results.map(res => res.summary.annualPremium);
    const oopData = results.map(res => res.summary.oopPaid);
    const backgroundColors = results.map(res => getPlanColor(res.plan.id));

    state.chartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: planLabels,
        datasets: [
          {
            label: "Annual Premium Cost",
            data: premiumData,
            backgroundColor: backgroundColors.map(c => c + "B3"),
            borderColor: backgroundColors,
            borderWidth: 1,
            stack: "Stack 0"
          },
          {
            label: "Out-of-Pocket Care Paid",
            data: oopData,
            backgroundColor: backgroundColors.map(c => c + "FF"),
            borderColor: backgroundColors,
            borderWidth: 1,
            stack: "Stack 0"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title: function(tooltipItems) {
                const index = tooltipItems[0].dataIndex;
                return results[index].plan.name;
              },
              label: function(tooltipItem) {
                const index = tooltipItem.dataIndex;
                const premium = results[index].summary.annualPremium;
                const oop = results[index].summary.oopPaid;
                const savings = results[index].summary.hsaTaxSavings + results[index].summary.premiumTaxSavings;
                const finalNet = results[index].summary.netCost;
                
                if (tooltipItem.datasetIndex === 0) {
                  return `Annual Premium: $${premium}`;
                } else {
                  return `Out-of-Pocket: $${oop}\nTax Write-offs: -$${savings}\nNet care burden: $${finalNet}`;
                }
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: { color: "#94a3b8" }
          },
          y: {
            stacked: true,
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: { color: "#94a3b8" },
            title: { display: true, text: "Gross Cost Breakdown ($/Year)", color: "#94a3b8" }
          }
        }
      }
    });
  }
}

// Security Biometric Lock Controller (V6 Mobile & Browser Prompt)
function initSecurityLock() {
  const securityLockScreen = document.getElementById("security-lock-screen");
  const securityLockToggle = document.getElementById("security-lock-toggle");
  const biometricsUnlockBtn = document.getElementById("biometrics-unlock-btn");
  const devBypassLockBtn = document.getElementById("dev-bypass-lock-btn");
  
  if (!securityLockScreen || !securityLockToggle || !biometricsUnlockBtn || !devBypassLockBtn) return;
  
  // Load initial toggle state
  const isLockEnabled = localStorage.getItem("security_lock_enabled") === "true";
  securityLockToggle.checked = isLockEnabled;
  
  // Handle lock behavior
  if (isLockEnabled) {
    // Show lock screen overlay
    securityLockScreen.style.display = "flex";
    document.body.style.overflow = "hidden"; // Disable dashboard scroll
    
    // Check if we are running in Capacitor (native mobile app)
    const isMobile = window.Capacitor && window.Capacitor.isNativePlatform();
    
    if (isMobile) {
      // Trigger Native Face ID / Device Passcode immediately on launch
      triggerNativeBiometrics();
    } else {
      // Running in a web browser (Dev/Staging preview)
      // Show developer bypass button to prevent lockout in desktop testing
      devBypassLockBtn.style.display = "block";
      document.getElementById("security-status-text").textContent = "Running in browser preview. Tap 'Authenticate' to simulate Face ID, or use Dev Bypass.";
    }
  }
  
  // Bind toggle change
  securityLockToggle.addEventListener("change", () => {
    localStorage.setItem("security_lock_enabled", securityLockToggle.checked);
  });
  
  // Bind Authenticate button
  biometricsUnlockBtn.addEventListener("click", () => {
    const isMobile = window.Capacitor && window.Capacitor.isNativePlatform();
    if (isMobile) {
      triggerNativeBiometrics();
    } else {
      // Simulate successful biometrics in browser
      unlockApp();
    }
  });
  
  // Bind Dev Bypass
  devBypassLockBtn.addEventListener("click", () => {
    unlockApp();
  });
}

// Native Biometrics integration using Capacitor Native Biometrics plugin
async function triggerNativeBiometrics() {
  const statusText = document.getElementById("security-status-text");
  try {
    // Double check if Capacitor Community Biometrics is available
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.NativeBiometric) {
      const Biometric = window.Capacitor.Plugins.NativeBiometric;
      
      // Check if biometrics (Face ID/Fingerprint) or device passcode is available on phone
      const result = await Biometric.isAvailable();
      
      if (result.isAvailable) {
        // Perform biometric scanning (Face ID / Touch ID)
        // This will trigger the native iOS FaceID dialog or native device passcode fallback
        await Biometric.verifyIdentity({
          reason: "Access your private medical financial dashboard",
          title: "HealthCost Authentication",
          subtitle: "Log in with Face ID or Passcode",
          description: "Confirm identity to decrypt and view records."
        });
        
        unlockApp();
      } else {
        // Fallback: If no Face ID is registered, use device passcode credentials
        statusText.textContent = "Biometrics unavailable. Confirming passcode credential...";
        const credentials = await Biometric.getCredentials({
          server: "com.healthcost.optimizer"
        });
        if (credentials) {
          unlockApp();
        } else {
          statusText.textContent = "Authentication failed. Tap 'Authenticate' to retry.";
        }
      }
    } else {
      // Capacitor loaded but plugin not present - default to unlock
      console.warn("NativeBiometric plugin not found. Unlocking...");
      unlockApp();
    }
  } catch (err) {
    console.error("Biometric failure: ", err);
    statusText.textContent = "Authentication cancelled or failed. Tap to retry.";
  }
}

// Unlock UI
function unlockApp() {
  const securityLockScreen = document.getElementById("security-lock-screen");
  if (securityLockScreen) {
    securityLockScreen.style.display = "none";
    document.body.style.overflow = ""; // Re-enable dashboard scroll
  }
}
