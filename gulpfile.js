'use strict';

var path   = require('path'),
    gulp   = require('gulp'),
    gzip   = require('gulp-gzip'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    header = require('gulp-header'),
    footer = require('gulp-footer'),
    concat = require('gulp-concat'),
    // mocha  = require('gulp-mocha'),
    version = require('./package.json').version,
    Server = require('karma').Server;

var mainjs = ['src/Table.js',
              'src/Table.Drag.js',
              'src/Table.Cell.js',
              'src/Table.Header.js',
              'src/Table.Row.js',
              'src/Table.Col.js',
              'src/Table.Stretch.js',
              'src/Table.Toolbox.js'];

gulp.task('scripts', function () {
    return gulp.src(mainjs)
      .pipe(concat('maptalks.table.js'))
      .pipe(header('(function () {\n\'use strict\';\n\'' + version + '\';\n'))
      .pipe(footer('\n})();'))
      .pipe(gulp.dest('dist'))
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest('dist'))
      .pipe(gulp.dest('maptalks-table'))
      .pipe(gzip())
      .pipe(gulp.dest('dist'));
});

gulp.task('watch', ['test'], function () {
    gulp.watch(['src/**/*.js', 'test/**/*.js', './gulpfile.js'], ['test']);
});

var karmaConfig = {
    configFile: path.join(__dirname, '/karma.conf.js'),
    browsers: ['PhantomJS'],
    singleRun: false
};

gulp.task('test', [], function (done) {
    // gulp.src(['./node_modules/maptalks/dist/maptalks.js', mainjs, 'test/*.js'], {read: false})
    //     .pipe(mocha());
    karmaConfig.singleRun = true;
    new Server(karmaConfig, done).start();
});

gulp.task('tdd', [], function (done) {
    new Server(karmaConfig, done).start();
});

gulp.task('default', ['scripts']);
