import { getCommitHistroy } from "./utils/commit_history.js"
import { fetchSummary } from "./utils/llm.js"

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
