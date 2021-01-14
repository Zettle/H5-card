// const ora = require('ora');
const gulp = require('gulp');
const es = require('event-stream');
const htmlmin = require('gulp-htmlmin');
const clean = require('gulp-clean');
const cssmin = require('gulp-minify-css');
const rename = require("gulp-rename");
const browserify = require('browserify');
const sequence = require('run-sequence');
const connect = require('gulp-connect');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const babelify = require('babelify');
const stripDebug = require('gulp-strip-debug');
const gulpif = require('gulp-if');
const less  =require("gulp-less");
const auto  =require("gulp-autoprefixer");
const watch = require('gulp-watch'); // 监听文件新增


/**
 * 是否要生成map文件，压缩和非压缩都会生成对应的map文件
 *    压缩文件会生成单独的map文件
 *    未压缩文件会直接用base64方式引入
 */
const isMap = process.env.isMap === '1';
const isProd = process.env.isProd === '1'; // 是否打包的是生产包，和测试包区别是域名等配置不同
const isDropLog = process.env.isDropLog === '1'; // 是否去掉代码中的console.log
const isUglify = process.env.isUglify === '1'; // 是否去掉代码中的console.log

console.log(`===是否生成map：${isMap}===`);
console.log(`===是否生产env：${isProd}===`);
console.log(`===是否去掉log：${isDropLog}===`);
console.log(`===是否压缩代码：${isUglify}===`);
/**
 * 默认执行default
 *  
 */
gulp.task('default', () => {
    sequence(['clean']);
    setTimeout(() => {
        sequence('libjs', 'less', 'img', 'main', 'html', 'watch', 'connect');
        // sequence('libjs', 'less', 'img', 'main', 'html');
    }, 2000);
});

gulp.task('clean', () => {
    gulp.src('./dist').pipe(clean());
});

gulp.task('build', ['clean', 'main']);

// 第三方js
gulp.task('libjs', () => {
    gulp.src('./src/js/lib/*.js')
        .pipe(gulp.dest('./dist/js/lib/'));
});

// less处理
gulp.task('less', () => {
    gulp.src(['./src/css/loading.less', './src/css/page.less'])
        .pipe(less())
        .pipe(auto({
            grid:true
        }))
        .pipe(gulpif(isUglify, cssmin({
            advanced: true, // 类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
            // compatibility: 'ie7', // 保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
            keepBreaks: false, // 类型：Boolean 默认：false [是否保留换行]
            keepSpecialComments: '*' // 保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
        })))
        .pipe(gulp.dest('./dist/css/'))
        .pipe(connect.reload());
});

// 图片
gulp.task('img', () => {
    gulp.src('./src/img/**/*.*')
        .pipe(gulp.dest('./dist/img/'));
    // 音乐
    gulp.src('./src/music/**/*.*')
        .pipe(gulp.dest('./dist/music/'));
});

/**
 * 主要内容，处理sdk的js
 */
gulp.task('main', () => {
    // 双入口，一个是用于loading，一个是所有页面功能
    let tasks = [];
    let entryFiles = {
        index: './src/js/index.js',
        page: './src/js/page.js'
    };
    for (let key in entryFiles) {
        let b = browserify({
            debug: isMap,
            entries: [entryFiles[key]]
        })
        .transform(babelify) // es6转es5
        .bundle()
        .pipe(source(`${key}.js`))
        .pipe(buffer())
        .pipe(gulpif(isDropLog, stripDebug())); // 去掉console/alert等
        if (isUglify) {
            b.pipe(uglify()) // 压缩代码，只认识es5
            .pipe(gulpif(isMap, sourcemaps.init({loadMaps: true}))) // 要生成map就放开这里
            .pipe(gulpif(isMap, sourcemaps.write('./'))); // 要生成map就放开这里
        }
        b.pipe(gulp.dest('./dist/js/'))
        .pipe(connect.reload());
        tasks.push(b);
    }
    return es.merge.apply(null, tasks);
});

// 监听example中的index.html改变，方便自己测试
gulp.task('html', () => {
    gulp.src('src/**/*.html')
        .pipe(gulpif(isUglify, htmlmin({
            removeComments: true, // 清除HTML注释
            collapseWhitespace: true, // 压缩HTML
            collapseBooleanAttributes: false, // 省略布尔属性的值 <input checked="true"/> ==> <input />
            removeEmptyAttributes: true, // 删除所有空格作属性值 <input id="" /> ==> <input />
            removeScriptTypeAttributes: true, // 删除<script>的type="text/javascript"
            removeStyleLinkTypeAttributes: true, // 删除<style>和<link>的type="text/css"
            minifyJS: true, // 压缩页面JS
            minifyCSS: true // 压缩页面CSS
        })))
        .pipe(gulp.dest('./dist/'))
        .pipe(connect.reload());  // 重启浏览器
});

// 内容不大，直接用watch也可以
gulp.task('watch', () => {
    // 监听内容改变的话执行main任务
    watch(['src/js/**/*.js'], () => {
        sequence('main');
    });

    watch('src/**/*.html', () => {
        sequence('html');
    });

    watch('./src/css/**/*.less', () => {
        sequence('less');
    })
});



/**
 * 启动一个http服务
 */
gulp.task('connect', function () {
    connect.server({
        host: '0.0.0.0',
        // 启动了一个http://localhost:8080
        livereload: true // TODO: 由croee-env来控制是否要启动webscoket，ie下不支持要设置为false
    });
});