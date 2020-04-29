const ghpages = require('gh-pages');

const pkg = require('../package.json');

const repo = "git@github.com:hb-bobo/tv-server.git";
let branch = process.argv[2] || 'beta';
let cm = process.argv[3] || '编译后自动提交';
let fetchFileName = process.argv[4] || 'dist';
ghpages.publish(fetchFileName, {
    branch,
    dest: `${fetchFileName}/`,
    repo,
    message: cm,
}, (err) => {
    console.info(`success publish ${fetchFileName} to ${branch} branch`, err);
});
