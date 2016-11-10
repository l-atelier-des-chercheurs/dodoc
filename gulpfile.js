// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var jshint       = require('gulp-jshint');
// var uglify = require('gulp-uglify');

var pluginsScripts = [
  'public/bower_components/jquery/dist/jquery.min.js',
  'public/bower_components/velocity/velocity.min.js',
  'public/bower_components/moment/min/moment-with-locales.js',
  'public/bower_components/foundation/js/foundation.min.js',
  'public/bower_components/foundation/js/foundation/foundation.reveal.js',
  'public/bower_components/store-js/store.min.js',
  'public/bower_components/alertifyjs/dist/js/alertify.js',
];
var userScripts = [
  'public/dodoc.js',
  'public/js/common.js',
  'public/js/modules/_modals.js',
  'public/js/_global.js',
];

var templateCss = [
  'templates/**/*.scss'
]
var templateCss = [
  'templates/**/*.scss'
]

var userCss = [
  'public/sass/style.scss'
]


// Compile Our Sass
gulp.task('sass', function() {
  return gulp.src(userCss)
    .pipe(plumber({
        errorHandler: function (err) {
            console.log(err);
            this.emit('end');
        }
    }))
    .pipe(sass())
    .pipe(concat('style.css'))
    .pipe(gulp.dest('public/css'));
});

gulp.task('templatesSass', function() {
  return gulp.src(templateCss)
    .pipe(plumber({
        errorHandler: function (err) {
            console.log(err);
            this.emit('end');
        }
    }))
    .pipe(sass())
    .pipe(concat('templates.css'))
    .pipe(gulp.dest('public/css'));
})


// Concatenate & Minify CSS
gulp.task('css', function() {
  return gulp.src('pubic/css/*.css')
    .pipe(concat('all.css'))
    .pipe(gulp.dest('public/css'))
    .pipe(minifyCss({compatibility: 'ie9'}))
    .pipe(rename('all.min.css'))
    .pipe(gulp.dest('public/production'));
});


// Lint Task
gulp.task('lint', function() {
  return gulp.src( userScripts)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});


// Concatenate JS plugin
gulp.task('script-plugins', function() {
  return gulp.src(pluginsScripts)
    .pipe(concat('plugins.js'))
    .pipe(gulp.dest('public/js/production'));
});


// Watch Files For Changes
gulp.task('watch', function() {
  gulp.watch(['public/js/*.js', 'public/js/libs/*.js','public/js/capture/*.js',], ['lint']);
  gulp.watch( ['public/sass/*.scss'].concat(templateCss).concat(userCss), ['sass', 'css']);
});

// Default Task
gulp.task('default', ['sass', 'templatesSass', 'css', 'script-plugins', 'watch']);
