class Touch {
    /**
     * @params options 
     * dom {dom} 要监听的dom
     * touchStartHandle {Function} 鼠标点击的回调
     * touchEndHandle {Function} 鼠标抬起的回调
     * swipeUp {Function} 鼠标上滑的回调，参数disY滑动距离，负数
     * swipeDown {Function} 鼠标下滑的回调，参数disY滑动距离，正数或者0
     */
    constructor (options) {
        this.opt = options;

        this.touchStartPageY = 0;
        this.disPageY = 0;
        this.eventHandle();
    }
    eventHandle () {
        this.opt.dom.addEventListener('touchstart', (e) => {
            this.touchStartPageY = e.touches[0].pageY;
            this.disPageY = 0; // 重置
            this.opt.touchStartHandle && this.opt.touchStartHandle(e);
        }, false);

        this.opt.dom.addEventListener('touchmove', (e) => {
            this.disPageY = e.touches[0].pageY - this.touchStartPageY;
            if (this.disPageY < 0) {
                this.opt.swipeUp && this.opt.swipeUp(this.disPageY);
            } else if (this.disPageY > 0) {
                this.opt.swipeDown && this.opt.swipeDown(this.disPageY);
            }
        }, false);

        this.opt.dom.addEventListener('touchend', (e) => {
            this.opt.touchEndHandle && this.opt.touchEndHandle(e);
        });
    }
}
module.exports = Touch;