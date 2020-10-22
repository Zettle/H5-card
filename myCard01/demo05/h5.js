var H5 = function () {
    // 组件的默认配置
    this.defCfg = {
        type: 'base'
    };

    // 添加最外层的 div.h5
    this.id = `h5_${Math.random()}`.replace('.', '_');
    this.el = $(`<div class="h5" id="${this.id}"></div>`);
    $('body').prepend(this.el);

    /**
     * 对外暴露的方法: 新增一个页面 div.h5_page
     * @param {string} name 页面名称，最终会作为div的className
     */
    this.addPage = function (name) {
        var clsName = `h5_page h5_page_name_${name}`;
        var page = $(`<div class="${clsName}"></div>`);
        this.el.append(page);
        this.curPage = page;
        return this; // 把this返回出去，就可以实现链式调用
    };

    /**
     * 对外暴露的方法: 新增一个组件
     */
    this.addComponent = function (name, cfg) {
        cfg = $.extend({}, this.defCfg, cfg);
        var component = null;
        switch (cfg.type) {
            case 'base':
                component = new H5ComponentBase(name, cfg);
                break;
        
            default:
                break;
        }
        this.curPage.append(component);
        return this;
    };

    this.load = function () {
        this.el.show();
        this.el.fullpage({
            sectionSelector: '.h5_page',
            sectionsColor : ['#1bbc9b', '#4BBFC3', '#7BAABE','#ccddff'],
            onLeave: function(origin) {
                $(origin.item).find('.h5_component').trigger('leave'); // 触发自定义事件
            },
            afterLoad: function(origin, destination) {
                $(destination.item).find('.h5_component').trigger('load');
            },
        });
    };

    return this;
};