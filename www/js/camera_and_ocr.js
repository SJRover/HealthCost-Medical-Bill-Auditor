// Client-side Camera Capture and Tesseract.js OCR Parser (Global Script Mode)

let activeStream = null;

window.HealthcareOCR = {
  // Start webcam stream and display on HTML5 video element
  startCamera: async function(videoElement) {
    if (activeStream) {
      this.stopCamera();
    }
    
    try {
      activeStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Prefer back camera on mobile
        audio: false
      });
      videoElement.srcObject = activeStream;
      videoElement.play();
      return true;
    } catch (err) {
      console.error("Webcam access error:", err);
      throw new Error("Could not access your device's camera. Make sure you grant permission.");
    }
  },

  // Stop active webcam stream
  stopCamera: function() {
    if (activeStream) {
      activeStream.getTracks().forEach(track => track.stop());
      activeStream = null;
    }
  },

  // Capture current frame of video element onto a canvas and return as blob
  captureSnapshot: function(videoElement, canvasElement) {
    const context = canvasElement.getContext("2d");
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    
    // Draw current video frame to canvas
    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    
    return new Promise(resolve => {
      canvasElement.toBlob(blob => {
        resolve(blob);
      }, "image/jpeg", 0.95);
    });
  },

  // Run Tesseract.js OCR on an image file or blob
  scanBillImage: async function(imageFileOrBlob, progressCallback) {
    if (typeof Tesseract === "undefined") {
      throw new Error("OCR Library (Tesseract.js) failed to load. Please check your internet connection.");
    }

    const worker = await Tesseract.createWorker("eng", 1, {
      logger: m => {
        if (m.status === "recognizing" && progressCallback) {
          progressCallback(Math.round(m.progress * 100));
        }
      }
    });

    try {
      const { data: { text } } = await worker.recognize(imageFileOrBlob);
      await worker.terminate();
      return text;
    } catch (err) {
      await worker.terminate();
      throw err;
    }
  },

  // Parse CPT codes, prices, and provider name from bill text
  parseBillText: function(text, cptDatabase) {
    const result = {
      detectedCptCodes: [],
      totalCharged: 0,
      hospitalName: "Community Medical Center",
      rawText: text
    };

    const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    
    // 1. Detect provider name from top lines
    const providerKeywords = ["hospital", "clinic", "medical", "health", "care", "imaging", "physicians", "dentistry", "urgent"];
    for (let i = 0; i < Math.min(12, lines.length); i++) {
      const lineLower = lines[i].toLowerCase();
      if (providerKeywords.some(kw => lineLower.includes(kw)) && lines[i].length < 60) {
        result.hospitalName = lines[i].replace(/[^\w\s\.-]/g, ""); // Strip weird characters
        break;
      }
    }

    // 2. Scan for 5-digit CPT codes
    const cptRegex = /\b\d{5}\b/g;
    const foundCodes = text.match(cptRegex) || [];

    // Check custom codes
    Object.keys(cptDatabase).forEach(code => {
      if (code.startsWith("HC-") && text.includes(code)) {
        foundCodes.push(code);
      }
    });

    // Match with database and de-duplicate
    const uniqueCodes = [...new Set(foundCodes)];
    uniqueCodes.forEach(code => {
      if (cptDatabase[code]) {
        result.detectedCptCodes.push({ ...cptDatabase[code] });
      }
    });

    // 3. Scan for total bill price
    const priceRegex = /(?:\$\s*)?(\b\d{1,5}(?:,\d{3})*(?:\.\d{2})?\b)/g;
    let match;
    const prices = [];
    while ((match = priceRegex.exec(text)) !== null) {
      const val = parseFloat(match[1].replace(/,/g, ""));
      if (!isNaN(val) && val > 0) {
        prices.push(val);
      }
    }

    const totalKeywords = ["total due", "total charges", "amount due", "please pay", "total amount", "balance due"];
    let detectedTotal = 0;
    
    lines.forEach(line => {
      const lineLower = line.toLowerCase();
      if (totalKeywords.some(kw => lineLower.includes(kw))) {
        const priceInLine = line.match(/(?:\$\s*)?(\b\d{1,5}(?:,\d{3})*(?:\.\d{2})?\b)/);
        if (priceInLine) {
          const val = parseFloat(priceInLine[1].replace(/,/g, ""));
          if (val > detectedTotal) {
            detectedTotal = val;
          }
        }
      }
    });

    if (detectedTotal > 0) {
      result.totalCharged = detectedTotal;
    } else if (prices.length > 0) {
      result.totalCharged = Math.max(...prices);
    }

    return result;
  }
};
