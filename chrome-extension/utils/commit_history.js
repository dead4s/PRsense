export class Commit {
  constructor(title, desc, author, email, date, diff) {
    this.title = title; 
    this.desc = desc;
    this.author = author;
    this.email = email;
    this.date = date;
    this.diff = diff 
  }
}

function splitMessage(message) {
  const index = message.indexOf('\n\n');
  if (index === -1) return { title: message, desc: "" };
  return {
    title: message.slice(0, index),
    desc: message.slice(index + 2)
  };
}

async function getDiff(commit_url, token = null){
  const url = `${commit_url}.diff`;
  console.log(url);
  try
  {
    const headers = token ? { Authorization: `token ${token}` } : {};
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const diff_text = await response.text();
    console.log(diff_text);
    return diff_text;
  }
  catch (error) {
    console.error('error while fetching diff:', error);
  }
};

export async function getCommitHistroy(owner, repo, commitsToFetch = 3, token = null) {
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
   
    for (const [index, commit] of raw_commits.entries()) 
    {
      console.log(`commit:\t #${index + 1}`);
      console.log(`message:\t ${commit.commit.message}`);
      console.log(`author:\t ${commit.commit.author.name}`);
      console.log(`date:\t ${commit.commit.author.date}`);
      console.log('---------------------------');

      diff_text = await getDiff(commit.html_url);

      const split_message = splitMessage(commit.commit.message);
      const new_commit = new Commit(
        split_message.title, 
        split_message.desc,
        commit.commit.author.name,
        commit.commit.author.email,
        commit.commit.author.date,
        diff_text
      ); 
      ret_commits.push(new_commit);
    }

    return ret_commits;

  } catch (error) {
    console.error('error while fetching commits:', error);
  }
};

