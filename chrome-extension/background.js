import { getCommitHistroy } from "./utils/commit_history.js"
import { generateTitleDesc } from "./utils/llm.js"

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
        const commits = await getCommitHistroy(owner, repo, num_commit);
        console.log(commits);
        
        const {title, desc} = await generateTitleDesc(commits, author, email, date, diffText);
        sendResponse({title, desc});

      } catch (error) {
        console.log('error in FETCH_SUMMARY', error);
        sendResponse({ error });
      }
    })();

    return true;
  }
});
