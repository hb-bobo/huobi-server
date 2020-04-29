const gulp = require('gulp');
const ts = require('gulp-typescript');
const mocha = require('gulp-mocha');

const tsProject = ts.createProject('tsconfig.test.json');

gulp.task('build', () => tsProject.src()
  .pipe(tsProject())
  .js.pipe(gulp.dest('dist')));

gulp.task('test', () => gulp.src('test/*.spec.ts')
  .pipe(mocha({
    reporter: 'nyan',
    require: ['ts-node/register'],
  })));
/* single command to hook into VS Code */
gulp.task('default', gulp.series('build', 'test'));