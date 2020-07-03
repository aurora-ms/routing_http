



const gulp = require('gulp'),
    sass = require('gulp-sass'),
    cssbeautify = require('gulp-cssbeautify'),
    autoprefixer = require('autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    postcss = require('gulp-postcss'),
    cleanCSS = require('gulp-clean-css'),
    rename = require("gulp-rename"),
    gulpStylelint = require('gulp-stylelint'),
    babel = require('gulp-babel'),
    uglify = require('gulp-uglify'),
    htmlLint = require('gulp-html-lint'),
    htmlAutoprefixer = require("gulp-html-autoprefixer"),
    htmlmin = require('gulp-htmlmin'),
    imagemin = require('gulp-imagemin'),
    responsive = require('gulp-responsive'),
    browserSync = require('browser-sync').create(),
    jshint = require('gulp-jshint');




const rutes = {
    scssPath: 'static/scss/style.scss',
    jsPath: 'static/script.js',
    htmlPath: 'static/*.html',
    imgPath: 'static/img/*.{png,jpg}'
};

const reload = browserSync.reload;

sass.compiler = require('node-sass');

function scssTask() {
    return gulp.src(rutes.scssPath)

        .pipe(sass.sync().on('error', sass.logError))
        .pipe(cssbeautify({ indent: "  ", hasSpace: false }))
        .pipe(gulpStylelint({
            reporters: [
                { formatter: 'string', console: true }
            ]
        }))
        .pipe(gulp.dest('./sources/css'))
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(rename("style_min.css"))
        .pipe(gulp.dest('./finalFiles'))
        .pipe(reload({stream: true}));

};


function cssTask() {
    return gulp.src('sources/css/*.css')
        .pipe(sourcemaps.init())
        .pipe(postcss([autoprefixer()]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./sources/css/dest'))
        .pipe(reload({stream: true}));
}





function jsTask() {
    return gulp.src(rutes.jsPath)
        .pipe(jshint({
            esnext: true
        }))
        .pipe(sourcemaps.init())
        .pipe(jshint.reporter('default'), { verbose: true })
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(rename("js_min.js"))
        .pipe(gulp.dest('./finalFiles'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./sources/js'))
        .pipe(reload({stream: true}));

}

function htmlTask() {
    return gulp.src(rutes.htmlPath)
        .pipe(htmlLint())
        .pipe(htmlAutoprefixer())
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('./finalFiles'))
        .pipe(reload({stream: true}));
}


function imgTask() {
    return gulp.src(rutes.imgPath)
        .pipe(imagemin([
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 })

        ]))
        .pipe(responsive(
            {
                '*.jpg': {
                    width: 277
                },
                '*.png': {
                    rename: { suffix: '-thumbnail' }
                },
            },
            {
                quality: 75,
                progressive: true,
                compressionLevel: 6,
                withMetadata: false
            }
        )
        )
        .pipe(gulp.dest('./finalFiles/img'))
        .pipe(reload({stream: true}));
}

 function watch () {
    gulp.watch('static/*.js', gulp.series('js'));
    gulp.watch('static/scss/*.scss', gulp.series('css', browserSync.reload));
    gulp.watch('static/*.html', gulp.series('html', browserSync.reload));
    gulp.watch('static/img/*', gulp.series('img'));

};

gulp.task('default', gulp.parallel(watch, browser_sync))

function browser_sync () {
 
    browserSync.init({
        server: {
            baseDir: 'static'
        }
    });
};

gulp.task('all', gulp.parallel(imgTask, htmlTask, jsTask, gulp.series(scssTask, cssTask)));

gulp.task('js', jsTask);

gulp.task('css', gulp.series(scssTask, cssTask));

gulp.task('html', htmlTask);

gulp.task('img', imgTask);



