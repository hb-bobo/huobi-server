const fs = require('fs');
const path = require('path');
const { src, dest, series } = require('gulp');
const merge = require('merge-stream');
const prettier = require("prettier");
const pkg = require('./package.json');

function exec(cmdStr) {
    console.log(cmdStr)
    return new Promise(function (resolve, reject) {
        const exec = require('child_process').exec;
        exec(cmdStr, function (err, stdout, srderr) {
            if (err) {
                resolve(srderr);
                return;
            }
            resolve(stdout);
        });
    });
}
function clear(cb) {
    exec('rm -rf dist')
    .then(() => {
        cb()
    })
}
function replace(cb) {
    // body omitted
    
    delete pkg.devDependencies;
    const wirteString = JSON.stringify(pkg).replace(/dist\//g, '');
    fs.writeFileSync(path.resolve('./dist/package.json'), prettier.format(wirteString, { parser: 'json' }));
    let pm2 = require('./pm2.json');
    pm2 = JSON.stringify(pm2).replace(/dist\//g, '')
    fs.writeFileSync(path.resolve('./dist/pm2.json'),  prettier.format(pm2, { parser: 'json' }));
    cb();
}
function copy (cb) {
   const config = src('config/*.js').pipe(dest('dist/config'));
  const public = src('public/admin/**/*').pipe(dest('dist/public/admin'));
  const files = src([
    '.dockerfile',
    '.dockerignore',
    '.gitignore',
    'pm2.json',
    'README.md'
  ]).pipe(dest('dist'))
  return merge(config, files)
}
exports.default = series(clear, copy, replace)