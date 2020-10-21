const loading = {
    processTimer: null,
    inter: 500,
    completeLen: 0, // 已经请求完成数
    totalLen: 0, // 总需要请求数
    startProcess (callback) {
        this.clearProcessTimer();
        this.processTimer = setInterval(() => {
            let percentage = this.countPercentage();
            callback(percentage);
            if (percentage === 100) { // 加载完成
                this.clearProcessTimer();
            }
        }, 600); // 和css的.loading-process的transition时间越一致，仿正效果越好
    },
    // 计算百分比
    countPercentage () {
        // 当被除数=0的时候返回NaN
        return this.totalLen === 0 ? 0 : parseInt(this.completeLen / this.totalLen *100)
    },
    // 清除定时器
    clearProcessTimer () {
        this.processTimer && clearInterval(this.processTimer);
    },
    /**
     * 进度条结束控制
     */
    endProcess () {},
    /**
     * 读取html代码
     */
    loadTemp (zdom, url) {
        return new Promise(resolve => {
            zdom.load(url, () => {
                resolve();
            });
        });
    },
    /**
     * 读取page用到得css资源
     * TODO：暂时还没找监听css加载完成的方法
     */
    style (url) {
        let cssLink = $(`<link rel="stylesheet" href="${url}" />`);
        $('head').append(cssLink);
        return Promise.resolve();
    },
    /**
     * 读取html上用到得img图片
     */
    loadImg (zdom) {
        let zImgs = zdom.find('img');
        this.totalLen += zImgs.length;
        zImgs.forEach(item => { // 遍历出所有img的src监听加载完成
            let oImg = new Image();
            oImg.src = $(item).attr('src');
            oImg.onload = () => {
                this.completeLen += 1;
            };
        });  
    },
    /**
     * 读取css中用到得图片，预加载
     */
    loadCssImg (id) {
        let zdom = $(document.querySelector(id).content);
        this.loadImg(zdom);
    },
    /**
     * 读取page用到得js脚本
     */
    loadScript(url) {
        this.totalLen += 1;
        let head = document.getElementsByTagName('head')[0],
            js = document.createElement('script');
        js.setAttribute('type', 'text/javascript'); 
        js.setAttribute('src', url); 
        $('body').append(js);
        if (document.all) {
            js.onreadystatechange = () => {
                if (js.readyState == 'loaded' || js.readyState == 'complete') {
                    this.completeLen += 1;
                }
            }
        } else {
            js.onload = () => {
                this.completeLen += 1;
            }
        }
    },
    /**
     * 加载音乐
     */
    loadmusic (url) {
        this.totalLen += 1;
        $('body').append(`<audio id="audio-pre" src="${url}" loop></audio>`);
        $('#audio-pre').on('canplaythrough', () => {
            this.completeLen += 1;
            $('#audio-pre').remove();
        });
    }
};
// setInterval(() => {
//     console.log(loading.totalLen, loading.completeLen);
// }, 100);
module.exports = loading;