module.exports = {
    transitionFlag: true,
    // 第三页的特殊处理
    page2In ($page) {
        // 最后一个运行的dom，多个属性改变，会触发多次transitionend
        $page.find('.s6').on('transitionend', (e) => {
            if (e.target === e.currentTarget && this.transitionFlag) {
                this.transitionFlag = false;
                // 根据是否有.step1来判断是否做了第一个步骤
                if ($page.hasClass('step1')) {
                    $page.addClass('step2');
                } else {
                    $page.addClass('step1');
                }
                setTimeout(() => {
                    this.transitionFlag = true;
                });
            }
        });
    },
    // 第3个页面的特殊处理
    page2Out ($page) {
        $page.removeClass('step1 step2');
    }
};