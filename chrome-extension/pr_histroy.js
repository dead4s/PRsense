export class Commit {
  constructor(title, desc, author, email, date, url) {
    this.title = title; 
    this.desc = desc;
    this.author = author;
    this.email = email;
    this.date = date;
    this.url = url;
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
    
    raw_commits.forEach((commit, index) => {

      console.log(`commit:\t #${index + 1}`);
      console.log(`message:\t ${commit.commit.message}`);
      console.log(`author:\t ${commit.commit.author.name}`);
      console.log(`date:\t ${commit.commit.author.date}`);
      console.log('---------------------------');
  
      const split_message = splitMessage(commit.commit.message);
      const new_commit = new Commit(
        split_message.title, 
        split_message.desc,
        commit.commit.author.name,
        commit.commit.author.email,
        commit.commit.author.date,
        commit.commit.tree.url
      ) 
      ret_commits.push(new_commit);
    });

    return ret_commits;

  } catch (error) {
    console.error('error while fetching commits:', error);
  }
};

