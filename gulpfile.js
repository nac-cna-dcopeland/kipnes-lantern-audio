'use strict';

let browserSync = require('browser-sync').create();
let gulp = require('gulp');
let cachebust = require('gulp-cache-bust');

// BrowserSync Task (Live reload)
gulp.task('browserSync', function() {
	browserSync.init({
		open: "external",
		host: "lantern.audio",
		proxy: "lantern.audio", // 'dev.site.com' in your example
		port: 8080
	})
});

gulp.src('./docs/index.html')
    .pipe(cachebust({
        type: 'timestamp'
    }))
    .pipe(gulp.dest('./docs'));

// Gulp Watch Task
gulp.task('watch', ['browserSync'], function () {
  gulp.watch('./docs/**/*.css').on('change', browserSync.reload);
  gulp.watch('./docs/**/*.js').on('change', browserSync.reload);
  gulp.watch('./docs/index.html').on('change', browserSync.reload);
});

// Gulp Default Task
gulp.task('default', ['watch']);
