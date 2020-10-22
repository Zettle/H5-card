/**
 * @cfg type   是什么类型的div，本质会加到div的class上面
 *             比如 base-基本  pie-饼图  bar-柱状图
 * @cfg name   给改div起什么名字，本质会加到div的class上面
 * @cfg text   div里面的文字
 * @cfg width  div的宽度
 * @cfg height div的高度
 * @cfg bg     div的背景图
 * @cfg center 是否水平居中，设为true表示要水平居中
 */
var H5ComponentBase = function (name, cfg) {
    var cfg = cfg || {};
    // 随机生成一个id，因为Math.random()生成的是小数，所以用replace把小数点替换为_，让格式看上去好看点
    var id = `h5_c_${Math.random()}`.replace('.', '_');
    var clsName = `h5_component h5_component_${cfg.type} h5_component_name_${name}`;
    var component = $(`<div class="${clsName}" id="${id}"></div>`);
    cfg.text && component.text(cfg.text);

    // 设计师给的是2倍图，所以在这里先除好，在外界就不需要每次去除，直接在设计稿量了多少，就传递进来多少
    cfg.width && component.width(cfg.width / 2);
    cfg.height && component.height(cfg.height / 2);
    cfg.css && component.css(cfg.css);
    cfg.bg && component.css('backgroundImage', `url('${cfg.bg}')`);

    // 如果要水平居中
    if (cfg.center) {
        component.css({
            left: '50%',
            marginLeft: `${-1 * (cfg.width/4)}px` // 这里要除4，是因为设计给的是2倍图
        });
    }

    component.on('load', function () {
        $(this).addClass('h5_component_load').removeClass('h5_component_leave');
        cfg.animateIn && $(this).animate(cfg.animateIn);
        return false; // 阻止冒泡
    });
    component.on('leave', function () {
        $(this).addClass('h5_component_leave').removeClass('h5_component_load');
        cfg.animateOut && $(this).animate(cfg.animateOut);
        return false; // 阻止冒泡
    });
    return component;
};