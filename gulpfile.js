// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
// var uglify = require('gulp-uglify');

// Compile Our Sass
gulp.task('sass', function() {
  return gulp.src('public/sass/*.scss')
    .pipe(plumber({
        errorHandler: function (err) {
            console.log(err);
            this.emit('end');
        }
    }))
    .pipe(sass())
    .pipe(gulp.dest('public/css'));
});

// Concatenate & Minify CSS
gulp.task('css', function() {
  return gulp.src('pubic/css/*.css')
    .pipe(concat('all.css'))
    .pipe(gulp.dest('public/css'))
    .pipe(minifyCss({compatibility: 'ie9'}))
    .pipe(rename('all.min.css'))
    .pipe(gulp.dest('public/production'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
  return gulp.src([
    'public/bower_components/jquery/dist/jquery.min.js',
    'public/bower_components/velocity/velocity.min.js',
    'public/bower_components/moment/min/moment-with-locales.js',
    'public/bower_components/foundation/js/foundation.min.js',
    'public/bower_components/foundation/js/foundation/foundation.reveal.js',
    'public/bower_components/store-js/store.min.js',
    'public/bower_components/caman/dist/caman.min.js',
    'public/dodoc.js',
    'public/js/libs/*.js',
    'public/js/capture/*.js',
    'public/js/*.js',
    ])
    .pipe(concat('all.js'))
    .pipe(gulp.dest('public/js/production'))
    .pipe(rename('all.min.js'))
    // .pipe(uglify().on('error', function(e){
    //   console.log(e);
    // }))
    .pipe(gulp.dest('public/js/production'));
});

// Watch Files For Changes
gulp.task('watch', function() {
  gulp.watch(['public/js/*.js', 'public/js/libs/*.js','public/js/capture/*.js',], ['scripts']);
  gulp.watch(['public/sass/*.scss', 'public/sass/*/*.scss'], ['sass', 'css']);
});

// Default Task
gulp.task('default', ['sass', 'css', 'scripts', 'watch']);
