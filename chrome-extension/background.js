const fetchSummary = (diffText) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("openaiApiKey", async (data) => {
      const apiKey = data.openaiApiKey;
      if (!apiKey) {
        sendResponse({ error: "API Key is missing!" });
        return;
      }

      console.log("API key: ", apiKey);
      try {
        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "user",
                  content: `Create title and description of Pull Request based on following github diff:\n\n${diffText}`,
                },
              ],
              temperature: 0.7,
            }),
          }
        );

        const result = await response.json();
        // Chat completions API returns message in different format
        const summary = result.choices[0].message.content;
        resolve(summary);
      } catch (error) {
        reject(error);
      }
    });
  });
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FETCH_SUMMARY") {
    const diffText = message.payload;

    // OpenAI API 키를 가져오기
    fetchSummary(diffText)
      .then((text) => {
        sendResponse({ text });
      })
      .catch((error) => {
        sendResponse({ error });
      });

    return true;
  }
});