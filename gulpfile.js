
'use strict';

var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    jsdoc = require('gulp-jsdoc'),
    jasmine = require('gulp-jasmine'),
    istanbul = require('gulp-istanbul'),
    ts = require('gulp-typescript'),
    tsdoc = require('gulp-typedoc'),
    tslint = require('gulp-tslint'),
    merge = require('merge-stream');

gulp.task('generate', function() {
    return gulp.src(['./src/ts/*/*.ts'])
        .pipe(ts({
            target : 'ES5',
            module : 'commonjs',
            moduleResolution : 'node',
            declaration : true
        }))
        .js
        .pipe(gulp.dest('target/js'));
});

gulp.task('js-checks', function() {
    return gulp.src(['./src/*.js', './src/examples/*.js'])
        .pipe(jshint({node: true}))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('ts-checks', ['generate'], function() {
    return gulp.src('./src/*.ts')
        .pipe(tslint())
        .pipe(tslint.report('verbose'));
});

gulp.task('checks', ['js-checks', 'ts-checks']);

gulp.task('test', ['generate'], function(done) {
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

gulp.task('js-doc', function() {
    return gulp.src(['./src/*.js'])
        .pipe(jsdoc('./target/doc'));
});

gulp.task('ts-doc', function() {
    return gulp.src(['./src/ts/public/*.ts'])
        .pipe(tsdoc({
            target : 'ES5',
            module : 'commonjs',
            moduleResolution : 'node',
            excludeNotExported: true,
            excludeExternals: true,
            out: './target/tsdoc'
        }));
});

gulp.task('doc', ['js-doc', 'ts-doc']);

gulp.task('default', ['generate', 'checks', 'test', 'doc']);
