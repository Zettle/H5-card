const Touch = require('./tools/touch');
const Music = require('./tools/music');
const pageHandle = require('./tools/pageHandle');
class Page {
    constructor () {
        this.transitionFlag = true; // 为了防止父级监听transitionEnd，子级也多次触发的问题
        this.isPageTransting = false; // page是否正在transiton翻页，防止翻页时候用户又快速滑动手指
        this.disY = 0;
        this._currentPageIndex = 0; // 默认第一张开始
    }
    get $currentPage () {
        return $(this.$pageArr[this.currentPageIndex]);
    }
    get nextPageIndex () {
        // 当nextPageIndex > 总页面.length - 1的时候，nextPageIndex回到第一张即0
        // let nextPageIndex = this.currentPageIndex >= this.$pageArr.length - 1 ? 0 : this.currentPageIndex + 1;
        return this.currentPageIndex >= this.$pageArr.length - 1 ? 0 : this.currentPageIndex + 1;
    }
    get $nextPage () {
        return $(this.$pageArr[this.nextPageIndex]);
    }
    get prePageIndex () {
        // perPageIndex = currentPageIndex - 1
        // 当prePageIndex < 0的时候，上一张是空的，这时候取总页面最后一张
        // this.currentPageIndex <=0 ? this.$pageArr.length - 1 ? this.currentPageIndex -1
        return this.currentPageIndex <=0 ? this.$pageArr.length - 1 : this.currentPageIndex -1;
    }
    get $prePage () {
        return $(this.$pageArr[this.prePageIndex]);
    }
    set currentPageIndex (newVal) {
        $('#page-num-cur').text(newVal + 1);
        this._currentPageIndex = newVal;
    }
    get currentPageIndex () {
        return this._currentPageIndex;
    }
    init () {
        this.getDoms(); // 获取dom的$对象，存起来，以便多个地方用到
        this.getScreenSize(); // 获取屏幕宽高
        this.$mainPage.show();
        this.touchEvent(); // 手指向上向下滑事件
        this.startMove(this.currentPageIndex); // 开始第1张的动画，下标0开始
        this.pageSection(); // 监听页面运动完的回调
        this.beginMusic();
    }
    beginMusic () {
        let musicInt = new Music('./music/m.mp3');
        let $music = $('#music');
        let clasNameOper = '';
        musicInt.onMusicState(isPaused => { // 监听状态
            clasNameOper = isPaused ? 'removeClass' : 'addClass';
            $music[clasNameOper]('play');
        });
        $music.on('touchend', () => {
            musicInt.isPaused ? musicInt.play() : musicInt.pause();
        });
    }

    /**
     * 获取dom的$对象
     */
    getDoms () {
        this.$page = $('.page');
        this.$mainPage = $('#main-page');
        // 由于$pageArr里面元素都是原生DOM对象，所以需要重新组装一下，让每个元素都是zepto对象
        // TODO：下面方法不可以，里面元素都是dom对象，因为$()得到的不是一个真正的数组
        // this.$pageArr = $('.slide-page').map((i, item) => {
        //     return $(item);
        // });
        this.$pageArr = [];
        this.$page.forEach(item => {
            this.$pageArr.push($(item));
        });
        $('#page-num-total').text(this.$page.length);
    }
    /**
     * 获取屏幕宽高
     */
    getScreenSize () {
        /**
         * bottom: 667, height: 667, left: 0, right: 375, top: 0, width: 375, x: 0, y: 0
         */
        this.screenSize = document.documentElement.getBoundingClientRect();
    }
    /**
     * 手指向上向下滑事件
     */
    touchEvent () {
        let percentage = 0; // 已移动的距离占据整个屏幕高度的百分比
        // let this.disY = 0; // 0鼠标上滑 1鼠标下滑
        let touchObj = new Touch({
            dom: this.$mainPage[0],
            // 鼠标刚点击的时候
            touchStartHandle: () => {
                if (this.isPageTransting) {
                    return false;
                }
                percentage = 0;
                this.disY = 0;
            },
            // 鼠标最后抬起的时候
            touchEndHandle: () => {
                if (this.isPageTransting) {
                    return false;
                }
                // 向上滑
                if (this.disY < 0) {
                    this.isPageTransting = true;
                    this.$currentPage.addClass('transition').css({
                        transform: `scale(0) translate3d(0, 0, 0)`
                    });
                    this.$nextPage.addClass('transition').css({
                        transform: 'scale(1) translate3d(0, 0, 0)'
                    });
                } else if (this.disY > 0) {
                    // 向下滑
                    this.isPageTransting = true;
                    this.$currentPage.addClass('transition').css({
                        transform: `scale(0) translate3d(0, 0, 0)`
                    });
                    this.$prePage.addClass('transition').css({
                        transform: 'scale(1) translate3d(0, 0, 0)'
                    });
                }
            },
            swipeUp: (dis) => {
                if (this.isPageTransting) {
                    return false;
                }
                this.disY = dis;
                // 当前页面，根据移动的距离开始缩放，缩放比例=(1-鼠标已移动距离/屏幕高度)
                // 整个过程的this.disY是负数
                percentage = (1 + this.disY / this.screenSize.height).toFixed(6);
                this.$currentPage.css({
                    transform: `scale(${percentage}) translate3d(0, 0, 0)`,
                    transformOrigin: 'center top 0'
                });
                // 下一页，开始移动到屏幕最下面，并开始向上移动，移动距离=屏幕高度-鼠标已移动距离
                // 整个过程的this.disY是负数
                // nexPageTransLateYDis = this.screenSize.height + this.disY;
                this.$nextPage.addClass('visible').css({
                    transform: `scale(1) translate3d(0, ${this.screenSize.height + this.disY}px, 0)`
                });

                this.$prePage.removeClass('visible');
            },
            swipeDown: (dis) => {
                if (this.isPageTransting) {
                    return false;
                }
                this.disY = dis;
                percentage = (1 - this.disY / this.screenSize.height).toFixed(6);
                this.$currentPage.css({
                    transform: `scale(${percentage}) translate3d(0, 0, 0)`,
                    transformOrigin: 'center bottom 0'
                });
                // 上一页
                this.$prePage.addClass('visible').css({
                    transform: `scale(1) translate3d(0, ${-this.screenSize.height + this.disY}px, 0)`
                });
                // 下一页
                this.$nextPage.removeClass('visible');
            }
        });
    }
    /**
     * 监听每个页面运动后的回调
     */
    pageSection () {
        // 子级的transition也会触发这个监听transitionend
        this.$page.on('transitionend', (e) => {
            if (e.target === e.currentTarget && this.transitionFlag) {
                this.isPageTransting = false; // 是否正在翻页标识为false
                this.transitionFlag = false;
                let pageId = this.currentPageIndex;
                if (this.disY < 0) {
                    // 手指上滑
                    pageId += 1;
                } else {
                    // 手指下滑
                    pageId -= 1;
                }
                if (pageId >= this.$pageArr.length) {
                    pageId = 0;
                }
                if (pageId < 0) {
                    pageId = this.$pageArr.length -1;
                }
                this.startMove(pageId);
            }
        });
    }
    /**
     * pageId 开始第几章的动画
     * 当只有一张的时候有问题，实际情况也不会存在一张的时候
     * 除非开发过程在开发第一张的时候，可以先把this.$nextPage和this.$prePage隐藏
     */
    startMove (pageId = 0) {
        this.currentPageIndex = pageId;
        this.$currentPage.addClass('visible').removeClass('transition');
        this.$nextPage.removeClass('active transition visible');
        this.$prePage.removeClass('active transition visible');
        setTimeout(() => {
            // 加.active需要点延迟，然后页面彻底display:block后再做动画
            this.$currentPage.addClass('active');
            // transitionFlag需要加延迟，不然阻止不了多次同时运行transitionend
            this.transitionFlag = true;
            // 如何除了加.active外还需要别的处理，则写在pageHandle里面
            if (pageHandle[`page${this.currentPageIndex}In`]) {
                pageHandle[`page${this.currentPageIndex}In`](this.$currentPage);
            }
            // 上个页面是否需要做离开处理
            if(pageHandle[`page${this.prePageIndex}Out`]) {
                pageHandle[`page${this.prePageIndex}Out`](this.$prePage);
            }
            // 下个页面是否需要做离开处理
            if(pageHandle[`page${this.nextPageIndex}Out`]) {
                pageHandle[`page${this.nextPageIndex}Out`](this.$nextPage);
            }
        });
    }
};
let oPage = new Page();
// 为了让另外一个入口loading.js在加载完资源后可以调用，把pageInit暴露在window里面
// bind修改this指向
window.PageInit = oPage.init.bind(oPage);