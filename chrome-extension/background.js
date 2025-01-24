async function getCommitHistroy(owner, repo, commitsToFetch = 3, token = null) {
  const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${commitsToFetch}`;

  try {
    const headers = token ? { Authorization: `token ${token}` } : {};
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const raw_commits = await response.json();
    const ret_commits = [];
    console.log(`last ${commitsToFetch} commits:`);
    raw_commits.forEach((commit, index) => {

      console.log(`commit:\t #${index + 1}`);
      console.log(`message:\t ${commit.commit.message}`);
      console.log(`author:\t ${commit.commit.author.name}`);
      console.log(`date:\t ${commit.commit.author.date}`);
      console.log('---------------------------');
      
      ret_commit = {}; 
      ret_commit.message = commit.commit.message;
      ret_commit.author = commit.commit.author.name; 
      ret_commit.email = commit.commit.author.email;
      ret_commit.date = commit.commit.author.date;
      ret_commit.url = commit.commit.tree.url;

      ret_commits.push(ret_commit);
    });

    return ret_commits;

  } catch (error) {
    console.error('error while fetching commits:', error);
  }
};


const fetchSummary = (diffText) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("openaiApiKey", async (data) => {
      const apiKey = data.openaiApiKey;
      if (!apiKey) {
        sendResponse({ error: "API Key is missing!" });
        return;
      }

      console.log("API key: ", apiKey);
      console.log("diffText: ", diffText);

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
    
    // TODO: get ths fields from url (@rey)
    const owner = "samsung";
    const repo = "one"; 
    const num_commit = 3; 
    
    // TODO: get new PR's author and date info (@rey)
    const author = 'zetwhite';
    const email = 'zetwhite@naver.com';
    const date = '2025-01-24T07:13:07Z';

    (async () => {
      try {
        // TODO: update `getCommitHistory` and `fetchSummary` have same style (@zetwhite)
        const commits = await getCommitHistroy(owner, repo, num_commit);
        console.log(commits);

        const text = await fetchSummary(diffText);
        sendResponse({ text });
      
      } catch (error) {
        console.log('error in FETCH_SUMMARY', error);
        sendResponse({ error });
      }
    })();

    return true;
  }
});
