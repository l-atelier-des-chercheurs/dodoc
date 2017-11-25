// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var jshint = require('gulp-jshint');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var dodoc  = require('./dodoc.js');

var pluginsScripts = [
  'client/bower_components/jquery/dist/jquery.min.js',
  'node_modules/socket.io-client/dist/socket.io.js',
  'client/bower_components/moment/min/moment.min.js',
  'client/bower_components/moment/locale/fr.js',
  'client/bower_components/store-js/store.min.js',
  'client/bower_components/alertifyjs/dist/js/alertify.js',
  'client/bower_components/promise-polyfill/promise.min.js',
  'client/bower_components/qrious/dist/qrious.min.js'
];
var userScripts = [
  'dodoc.js',
  'client/js/common.js',
  'client/js/modules/_modals.js',
  'client/js/_global.js',
];

var templateCss = [
  dodoc.settings().userDirname + '/templates/**/*.scss'
];

var userCss = [
  'client/sass/style.scss'
];


// Compile Our Sass
gulp.task('sass', function() {
  return gulp.src(userCss)
    .pipe(plumber({
        errorHandler: function (err) {
            console.log(err);
            this.emit('end');
        }
    }))
//     .pipe(sourcemaps.init())
    .pipe(sass())
//     .pipe(sourcemaps.write())
    .pipe(concat('style.css'))
    .pipe(minifyCss())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('client/css'));
});

gulp.task('templatesSass', function() {
  return gulp.src(templateCss)
    .pipe(plumber({
        errorHandler: function (err) {
            console.log(err);
            this.emit('end');
        }
    }))
    .pipe(sass({
      outputStyle: 'expanded',
    }))
    .pipe(gulp.dest(dodoc.settings().userDirname + '/templates'))
})


// Concatenate & Minify CSS
gulp.task('css', function() {
  return gulp.src('public/css/*.css')
    .pipe(concat('all.css'))
    .pipe(gulp.dest('client/css'))
    .pipe(minifyCss({compatibility: 'ie9'}))
    .pipe(rename('all.min.css'))
    .pipe(gulp.dest('client/production'));
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
    .pipe(concat('plugins.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('client/js/production'));
});


// Watch Files For Changes
gulp.task('watch', function() {
//   gulp.watch(['client/js/*.js', 'client/js/libs/*.js','client/js/capture/*.js',], ['lint']);
  gulp.watch( ['client/sass/*.scss', 'client/sass/basic/*.scss'].concat(templateCss).concat(userCss), ['sass', 'templatesSass', 'css']);
});

// Default Task
gulp.task('default', ['sass', 'templatesSass', 'css', 'script-plugins', 'watch']);
