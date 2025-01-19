// popup.js

// Save the API key
document.getElementById("save-key").addEventListener("click", () => {
  const apiKey = document.getElementById("api-key").value;
  if (!apiKey) {
    alert("Please enter your OpenAI API Key!");
    return;
  }

  // Save the key to Chrome's storage
  chrome.storage.local.set({ openaiApiKey: apiKey }, () => {
    alert("API Key saved successfully!");
  });
});

// Load the API key when the popup opens
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get("openaiApiKey", (data) => {
    if (data.openaiApiKey) {
      document.getElementById("api-key").value = data.openaiApiKey;
    }
  });
});

// Example of sending the API key with the "Fill PR Info" action
document.getElementById("fill-pr").addEventListener("click", () => {
  const resultDiv = document.getElementById("result");
  resultDiv.textContent = "Processing...";

  chrome.storage.local.get("openaiApiKey", (data) => {
    if (!data.openaiApiKey) {
      resultDiv.textContent = "Please save your OpenAI API Key first!";
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0].url.includes("github.com")) {
        resultDiv.textContent = "Please navigate to a GitHub pull request page";
        return;
      }

      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          type: "FETCH_DIFF",
          apiKey: data.openaiApiKey,
        },
        (response) => {
          if (response == "success") {
            resultDiv.textContent = "Done!";
          }
          if (chrome.runtime.lastError) {
            resultDiv.textContent =
              "Error: " + chrome.runtime.lastError.message;
          }
        }
      );
    });
  });
});
