var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    jsdoc = require('gulp-jsdoc');

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

gulp.task('doc', function() {
    gulp.src(['./src/*.js', './src/run/*.js'])
        .pipe(jsdoc('./target/doc'))
});

gulp.task('default', ['checks', 'doc']);
