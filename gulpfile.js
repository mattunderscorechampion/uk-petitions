
'use strict';

var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    jsdoc = require('gulp-jsdoc'),
    jasmine = require('gulp-jasmine'),
    istanbul = require('gulp-istanbul'),
    ts = require('gulp-typescript'),
    tsdoc = require('gulp-typedoc'),
    tslint = require('gulp-tslint');

gulp.task('generate', function() {
    var tsResult = gulp.src(['./src/ts/*/*.ts'])
        .pipe(ts({
            target : 'ES5',
            module : 'commonjs',
            moduleResolution : 'node',
            declaration : true
        }));

    tsResult
        .js
        .pipe(gulp.dest('target/js'));
});

gulp.task('checks', function() {
    gulp.src(['./src/*.js', './src/examples/*.js'])
        .pipe(jshint({node: true}))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'))
        .on('end', function() {
          console.log('Checks complete');
        })
        .on('error', function(error) {
          console.error(error.message);
        });

        gulp.src('./src/*.ts')
            .pipe(tslint())
            .pipe(tslint.report('verbose'))
});

gulp.task('test', function(done) {
    gulp.src(["./src/*.js"])
        .pipe(istanbul({
            includeUntested : true
        }))
        .pipe(istanbul.hookRequire())
        .on('finish', function() {
            gulp.src(['./runner.js', 'test/*.js', 'test/**/*.js'])
                .pipe(jasmine({
                    includeStackTrace : true
                 }))
                .pipe(istanbul.writeReports({
                    dir : "./target/coverage",
                    reporters : ['cobertura', 'html']
                }))
                .on('end', done);
        });
});

gulp.task('doc', function() {
    gulp.src(['./src/*.js'])
        .pipe(jsdoc('./target/doc'))
    gulp.src(['./src/ts/public/*.ts'])
        .pipe(tsdoc({
            target : 'ES5',
            module : 'commonjs',
            moduleResolution : 'node',
            excludeNotExported: true,
            out: './target/tsdoc'
        }));
});

gulp.task('default', ['generate', 'checks', 'test', 'doc']);
