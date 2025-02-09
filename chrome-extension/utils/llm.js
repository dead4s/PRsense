
function CommitContentToString(author, email, date, diff)
{
  return `author: ${author}
email: ${email}
date: ${date}
diff: ${diff}`;
}

function CommitTitleToString(title, desc)
{
  return `title: ${title}
description: ${desc}`;
}

function extractTitle(str) {
  // remove markdwon ** 
  str = str.replace(/\*\*(.+?)\*\*/g, '$1');
  
  const titleMatch = str.match(/Title:\s*(.*)/);
  return titleMatch ? titleMatch[1].trim() : '';
}

function extractDescription(str) {
  // remove markdwon ** 
  str = str.replace(/\*\*(.+?)\*\*/g, '$1');
 
  const descriptionMarker = 'Description:';
  const startIndex = str.indexOf(descriptionMarker);
  if (startIndex === -1) return '';

  // get all text after description
  let description = str.substring(startIndex + descriptionMarker.length).trim();
  return description;
}

function fewShotTemplate(prev_commits, author, email, date, diff)
{
  let result = "";
  prev_commits.forEach(commit => {
    result += 'pr contents:\n';
    result += CommitContentToString(commit.author, commit.email, commit.date, commit.diff);
    result += '\n';
    result += 'create PR title and description:\n';
    result += CommitTitleToString(commit.title, commit.desc);
    result += '\n';
  });

  result += 'pr contents:\n';
  result += CommitContentToString(author, email, date, diff);
  result += '\n';
  result += 'create PR title and description:\n';
  return result;
}

export async function generateTitleDesc(prev_commits, author, email, date, diff){

  const template = fewShotTemplate(prev_commits, author, email, date, diff);

  try{
    const getApiKey = () => {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get("openaiApiKey", (data) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(data.openaiApiKey);
          }
        });
      });
    };
 
    const apiKey = await getApiKey();
    if (!apiKey) {
      throw new Error('openaiApiKey is missing');
    }
    console.log("API key:", apiKey);
    console.log("diffText:", template);
 
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: template }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }  
    
    const response_json = await response.json();
    const response_text = response_json.choices[0].message.content;
    
    var ret_obj = {}
    ret_obj.title = extractTitle(response_text);
    ret_obj.desc = extractDescription(response_text);
    return ret_obj;
  } 
  catch (error) {
    console.error('error while generateTitleDesc:', error);
    return {error: error.message};
  }
}
