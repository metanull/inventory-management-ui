const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get commits from the last 30 days, grouped by date
const since = new Date();
since.setDate(since.getDate() - 30);
const sinceDate = since.toISOString().split('T')[0];

try {
  const commits = execSync(`git log --since="${sinceDate}" --pretty=format:"%H|%ad|%s|%an" --date=short`, { encoding: 'utf8' });
  
  if (!commits.trim()) {
    console.log('No commits found in the last 30 days');
    process.exit(0);
  }

  const commitLines = commits.trim().split('\n');
  const commitsByDate = {};

  commitLines.forEach(line => {
    const [hash, date, subject, author] = line.split('|');
    if (!commitsByDate[date]) {
      commitsByDate[date] = [];
    }
    commitsByDate[date].push({ hash, subject, author });
  });

  // Ensure _posts directory exists
  const postsDir = path.join('docs', '_posts');
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }

  // Generate blog posts for each date
  Object.keys(commitsByDate).sort().reverse().forEach(date => {
    const commits = commitsByDate[date];
    const filename = `${date}-daily-update.md`;
    const filepath = path.join(postsDir, filename);

    // Skip if file already exists and hasn't changed significantly
    if (fs.existsSync(filepath)) {
      const existing = fs.readFileSync(filepath, 'utf8');
      if (existing.includes(`<!-- commits-count: ${commits.length} -->`)) {
        return; // Skip if same number of commits
      }
    }

    const content = `---
layout: default
title: "Daily Update - ${new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}"
date: ${date}
---

<!-- commits-count: ${commits.length} -->

## Development Activity for ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

${commits.length === 1 ? 'This day had 1 commit:' : `This day had ${commits.length} commits:`}

${commits.map(commit => {
  const type = commit.subject.match(/^(feat|fix|docs|style|refactor|test|chore):/);
  const emoji = type ? {
    'feat': '✨',
    'fix': '🐛', 
    'docs': '📚',
    'style': '💄',
    'refactor': '♻️',
    'test': '✅',
    'chore': '🔧'
  }[type[1]] || '📝' : '📝';
  
  return `### ${emoji} ${commit.subject}

- **Author**: ${commit.author}
- **Commit**: [\`${commit.hash.substring(0, 7)}\`](https://github.com/your-org/inventory-management-ui/commit/${commit.hash})
`;
}).join('\n')}

---

*Total commits this day: ${commits.length}*
`;

    fs.writeFileSync(filepath, content);
    console.log(`Generated blog post: ${filename}`);
  });

} catch (error) {
  console.log('No git history found or error occurred:', error.message);
}
