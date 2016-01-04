var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    jsdoc = require('gulp-jsdoc'),
    jasmine = require('gulp-jasmine'),
    istanbul = require('gulp-istanbul');

gulp.task('checks', function() {
    gulp.src(['./src/*.js', './src/run/*.js'])
        .pipe(jshint({node: true}))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'))
        .on('end', function() {
          console.log('Checks complete');
        })
        .on('error', function(error) {
          console.error(error.message);
        });
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
    gulp.src(['./src/*.js', './src/run/*.js'])
        .pipe(jsdoc('./target/doc'))
});

gulp.task('default', ['checks', 'test', 'doc']);
