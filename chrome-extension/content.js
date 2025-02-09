// content.js
(function () {
  // GitHub의 diff 데이터를 가져오는 예제
  const diffContainer = document.querySelector(
    ".js-diff-progressive-container"
  );
  if (!diffContainer) return;

  const diffText = diffContainer.innerText; // Diff 데이터를 텍스트로 추출
  console.log("Diff data:", diffText);

  // Background script와 메시지 전달
  chrome.runtime.sendMessage({ type: "DIFF_DATA", payload: diffText });
})();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FETCH_DIFF") {
    const diffContainer = document.querySelector(
      ".js-diff-progressive-container"
    );
    if (!diffContainer) {
      sendResponse({ error: "No diff content found" });
      return;
    }

    const diffText = diffContainer.innerText;
    // Send to background script
    chrome.runtime.sendMessage(
      { type: "FETCH_SUMMARY", payload: diffText },
      (response, ...rest) => {
        if (response.error) {
          console.error("Error:", response.error);
          return;
        }
        
        if(!response.title || !response.desc)
        {
          console.error("Error: response does not contian title or desc");
          return;
        }

        // Fill the PR title and description
        const titleInput = document.querySelector("#pull_request_title");
        const descriptionInput = document.querySelector("#pull_request_body");

        if (titleInput && descriptionInput) {
          titleInput.value = response.title;
          descriptionInput.value = response.desc;
          sendResponse("success");
        }
      }
    );
  }
  return true;
});
