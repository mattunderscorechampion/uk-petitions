var gulp = require('gulp'),
    jshint = require('gulp-jshint');

gulp.task('checks', function() {
    gulp.src(['./src/*.js'])
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

gulp.task('default', ['checks']);
