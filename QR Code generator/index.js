// QR Code Generator JavaScript

function generateQR() {
  const textInput = document.getElementById("textInput");
  const qrCodeDiv = document.getElementById("qrcode");
  const messageDiv = document.getElementById("message");

  const text = textInput.value.trim();

  // Clear previous messages and QR code
  messageDiv.innerHTML = "";
  qrCodeDiv.innerHTML = "";

  // Validate input
  if (!text) {
    showMessage("Please enter some text or URL!", "error");
    return;
  }

  // Show loading message
  showMessage("Generating QR code...", "success");

  try {
    // Create QR code using QR Server API
    const qrCodeURL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      text
    )}`;

    // Create image element
    const img = document.createElement("img");
    img.src = qrCodeURL;
    img.alt = "QR Code";
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    img.style.border = "2px solid #ddd";
    img.style.borderRadius = "8px";
    img.style.marginTop = "10px";

    // Handle image load success
    img.onload = function () {
      qrCodeDiv.appendChild(img);
      showMessage("QR code generated successfully!", "success");

      // Add download button
      addDownloadButton(qrCodeURL, text);
    };

    // Handle image load error
    img.onerror = function () {
      showMessage("Failed to generate QR code. Please try again.", "error");
    };
  } catch (error) {
    showMessage("An error occurred while generating QR code.", "error");
    console.error("QR Generation Error:", error);
  }
}

function showMessage(message, type) {
  const messageDiv = document.getElementById("message");
  messageDiv.innerHTML = `<div class="${type}">${message}</div>`;
}

function addDownloadButton(qrCodeURL, originalText) {
  const qrCodeDiv = document.getElementById("qrcode");

  // Create download button
  const downloadBtn = document.createElement("button");
  downloadBtn.textContent = "Download QR Code";
  downloadBtn.style.marginTop = "15px";
  downloadBtn.style.fontSize = "14px";
  downloadBtn.style.padding = "8px 20px";

  downloadBtn.onclick = function () {
    downloadQRCode(qrCodeURL, originalText);
  };

  qrCodeDiv.appendChild(downloadBtn);
}

function downloadQRCode(qrCodeURL, originalText) {
  // Create a temporary link element for download
  const link = document.createElement("a");
  link.href = qrCodeURL;
  link.download = `qrcode-${Date.now()}.png`;

  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showMessage("QR code download started!", "success");
}

// Allow Enter key to generate QR code
document.addEventListener("DOMContentLoaded", function () {
  const textInput = document.getElementById("textInput");

  textInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      generateQR();
    }
  });

  // Focus on input when page loads
  textInput.focus();
});

// Clear QR code when input is cleared
function clearQRCode() {
  const textInput = document.getElementById("textInput");
  const qrCodeDiv = document.getElementById("qrcode");
  const messageDiv = document.getElementById("message");

  if (textInput.value.trim() === "") {
    qrCodeDiv.innerHTML = "";
    messageDiv.innerHTML = "";
  }
}

// Add input event listener to clear QR code when input is empty
document.addEventListener("DOMContentLoaded", function () {
  const textInput = document.getElementById("textInput");
  textInput.addEventListener("input", clearQRCode);
});
