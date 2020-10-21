const loading = require('./tools/loading');

let oMainPage = $('#main-page');
let oLoading = $('#loading'),
    loadingProcess = oLoading.find('#loading-process'),
    loadingText = oLoading.find('#loading-text');

const proportion = 5; // 假设temp和style算5%

// 开始监听进度条，每隔一段时间反显页面上
loading.startProcess(percentage => showPercentage(percentage - proportion < proportion ? proportion : percentage));

Promise.all([
    // 下面不计算在百分比内，只能自己假设
    loading.loadTemp(oMainPage, './page.html'), // 请求html代码
    loading.style('./css/page.css') // 读取page用到得css资源
])
.then(() => {
    // 下面的请求需要等dom插入完成或者计算在百分比内
    showPercentage(proportion);
    // loading.loadmusic('./music/m.mp3'); // 加载音乐
    loading.loadCssImg('#preload-css-img'); // 读取css中用到得图片，预加载
    loading.loadImg(oMainPage); // 读取html上用到得img图片
    loading.loadScript('./js/page.js'); // 读取page用到得js脚本
});

// 把百分比展示在页面上
function showPercentage (percentage) {
    loadingProcess.width(`${percentage}%`);
    loadingText.text(`${percentage}%`);
    if (percentage >= 95) {
        // 认为加载完成了
        oLoading.remove();
        window.PageInit();
        perLoadGuidePic(); // 提前加载下大图指导图，不放在百分比计算里面，不去占用太多资源
    }
}

// 提前加载好指导大图，由于翻页这里还不需要，不干扰翻页加载
function perLoadGuidePic () {
    let oImg = new Image();
    oImg.src = './img/guide.jpg';
}

// 移动端，禁止下拉出现浏览器版本信息，不然页面下滑会阻塞
document.body.addEventListener('touchmove', function(ev) {
    ev.preventDefault();
}, {capture: false, passive: false});
