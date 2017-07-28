"use strict";

const gulp = require('gulp'),
  mocha = require('gulp-mocha'),
  exit = require('gulp-exit'),
  run = require('gulp-run'),
  docco = require("gulp-docco"),
  ghPages = require('gulp-gh-pages');

gulp.task('test', () => {
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


gulp.task('doc', () => {
  var options = {
    layout:     'parallel',
    output:     'docs',
    template:   'docs/docco.jst',
    css:        'docs/docco.css',
    extension:  null,
    languages:  {},
    marked:     null
  };
  return gulp.src(["./lib/*.js","./examples/*.js","./test/*.js"])
    .pipe(docco(options))
    .pipe(gulp.dest('./docs'));
});

gulp.task('deploy', () => {
  return gulp.src('./docs/**/*')
    .pipe(ghPages());
});

// gulp.task('doc', () => {
//   //return gulp.src("./lib/*.js")
//   return gulp.src(["./lib/*.js","./examples/*.js","./test/*.js"])
//     .pipe(docco())
//     .pipe(gulp.dest('./docs'));
// });


gulp.task('default', ['test','doc']);
