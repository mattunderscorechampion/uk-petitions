
'use strict';

var gulp = require('gulp'),
    jasmine = require('gulp-jasmine'),
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
    return gulp.src('./src/ts/*/*.ts')
        .pipe(tslint({
            configuration : {
                rules : {
                    'class-name' : true,
                    'no-consecutive-blank-lines' : true
                }
            }
        }))
        .pipe(tslint.report('verbose'));
});

gulp.task('test', ['generate'], function() {
    return gulp.src('test/*.js')
        .pipe(jasmine({
            includeStackTrace : true
        }));
});

gulp.task('doc', function() {
    return gulp.src(['./src/ts/public/*.ts'])
        .pipe(tsdoc({
            target : 'ES5',
            module : 'commonjs',
            moduleResolution : 'node',
            mode : 'file',
            excludeNotExported : true,
            excludeExternals : true,
            out : './target/doc',
            readme : './typedocFrontpage.txt'
        }));
});

gulp.task('default', ['generate', 'checks', 'test', 'doc']);
