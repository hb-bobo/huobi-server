const ghpages = require('gh-pages');

const pkg = require('../package.json');

const repo = pkg.repository.url;
let branch = process.argv[2] || 'beta';
let cm = process.argv[3] || 'chore: Auto push after build';
let fetchFileName = process.argv[4] || 'dist';
ghpages.publish(fetchFileName, {
    branch,
    dest: `${fetchFileName}/`,
    repo,
    message: cm,
    dotfiles: true,    
}, (err) => {
    console.info(`success publish ${fetchFileName} to ${branch} branch`, err);
});
