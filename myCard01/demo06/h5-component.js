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

/**
 * 散点图
 * @param {*} name 
 * @param {*} cfg 配置项，同上面的 H5ComponentBase
 */
var H5ComponentPoint = function (name, cfg) {
    var cfg = cfg || {};
    cfg.type = 'point';

    var component = new H5ComponentBase(name, cfg);

    var basePoint = cfg.data[0]; // 基点
    // 遍历数据
    $.each(cfg.data, function (idx, item) {
        console.log(idx, item);
        var per = `${item[1] / basePoint[1] * 100}%`;

        var clsName = `point`;
        var point = $(`<div class="${clsName}" id="point_${idx}"></div>`);
        point.html(`
            <div class="point_text">
                <p class="name">${item[0]}</p>
                <p class="per">${per}</p>
            </div>
        `);
        point.css({
            backgroundColor: item[2],
            width: per,
            height: per,
        });
        if (item[3] !== undefined && item[4] !== undefined) {
            point.css({
                left: item[3],
                top: item[4]
            });
        }
        component.append(point);
    });
    return component;
};

/**
 * 柱状图
 * @param {*} name 
 * @param {*} cfg 配置项，同上面的 H5ComponentBase
 */
var H5ComponentBar = function (name, cfg) {
    var cfg = cfg || {};
    cfg.type = 'bar';

    var component = new H5ComponentBase(name, cfg);
    $.each(cfg.data, function (idx, item) {
        console.log(item);
        var widthPer = `${item[1] * 100}%`;
        var line = $(`
            <div class="line">
                <div class="name">${item[0]}</div>
                <div class="process">
                    <div class="bg"></div>
                </div>
                <div class="per">${widthPer}</div>
            </div>
        `);
        line.find('.process').width(widthPer);
        item[2] && line.find('.bg').css({backgroundColor: item[2]});
        component.append(line);
    });
    return component;
};