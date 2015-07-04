var gulp = require('gulp');
var mocha = require('gulp-mocha');
var exit = require('gulp-exit');
var docco = require("gulp-docco");
var run = require('gulp-run');

gulp.task('test', function() {
  //run('mocha --harmony -R spec test/*.js').exec();
  return gulp.src(['test/*.js'], { read: false })
    .pipe(mocha({
      reporter: 'spec',
      globals: {
        should: require('expect.js')
      }
    }))
    .pipe(exit());
});


gulp.task('doc', function() {
  //return gulp.src("./lib/*.js")
  return gulp.src(["./lib/*.js","./test/*.js"])
    .pipe(docco())
    .pipe(gulp.dest('./docs'));
});


gulp.task('default', ['test','doc']);
