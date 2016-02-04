
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

gulp.task('checks', ['generate'], function() {
    var checkJs = gulp.src(['./src/*.js', './src/examples/*.js'])
        .pipe(jshint({node: true}))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'))

    var checkTs = gulp.src('./src/*.ts')
        .pipe(tslint())
        .pipe(tslint.report('verbose'));

    return merge(checkJs, checkTs);
});

gulp.task('test', ['checks'], function(done) {
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

gulp.task('doc', ['test'], function() {
    var docJs = gulp.src(['./src/*.js'])
        .pipe(jsdoc('./target/doc'));
    var docTs = gulp.src(['./src/ts/public/*.ts'])
        .pipe(tsdoc({
            target : 'ES5',
            module : 'commonjs',
            moduleResolution : 'node',
            excludeNotExported: true,
            out: './target/tsdoc'
        }));

    return merge(docJs, docTs);
});

gulp.task('default', ['generate', 'checks', 'test', 'doc']);
