var gulp = require('gulp'),
    jshint = require('gulp-jshint');

gulp.task('checks', function() {
    gulp.src(['./list-petitions.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .on('end', function() {
          console.log('Checks complete');
        })
        .on('error', function(error) {
          console.error(error.message);
        });
});

gulp.task('default', ['checks']);
