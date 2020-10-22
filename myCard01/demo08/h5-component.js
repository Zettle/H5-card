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

/**
 * 折线图，基于canvas绘画
 */
var H5ComponentPloyline = function (name, cfg) {
    var cfg = cfg || {};
    cfg.type = 'ployline';

    var component = new H5ComponentBase(name, cfg);

    var $Canvas = $('<canvas></canvas>');
    var oCanvas = $Canvas[0]; // 转为原生js对象
    var ctx = oCanvas.getContext('2d');
    oCanvas.width = cfg.width;
    oCanvas.height = cfg.height;
    component.append($Canvas);

    var $Canvas2 = $('<canvas></canvas>');
    var oCanvas2 = $Canvas2[0]; // 转为原生js对象
    var ctx2 = oCanvas2.getContext('2d');
    oCanvas2.width = cfg.width;
    oCanvas2.height = cfg.height;
    component.append($Canvas2);

    // 绘画水平直线
    var per = cfg.height / 10;
    for (var i = 0; i < 11; i++) {
        ctx.beginPath();
        ctx.moveTo(0, per * i);
        ctx.lineTo(cfg.width, per * i);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#aaaaaa';
        ctx.stroke();
    }

    // 绘画竖直线
    var perx = cfg.width / (cfg.data.length + 1);
    for (var i = 0; i< cfg.data.length + 2; i++) {
        ctx.beginPath();
        ctx.moveTo(perx * i, 0);
        ctx.lineTo(perx * i, cfg.height);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#aaaaaa';
        ctx.stroke();
    }
    
    // 绘画数据点-组装数据
    var dataArr = [];;
    $.each(cfg.data, function (idx, item) {
        dataArr.push({
            label: item[0], // 文字
            labelColor: item[2] ? item[2] : '', // 文字颜色
            per: item[1], // 百分比
            x: perx * (idx + 1), // x轴坐标
            y: cfg.height * (1 - item[1]), // y轴坐标
        });
    });

    // 绘画数据点
    for (var i=0; i<dataArr.length; i++) {
        const ploy = dataArr[i];
        ctx2.beginPath();
        ctx2.fillStyle = '#ff8878';
        ctx2.arc(ploy.x, ploy.y, 6, 0, 2*Math.PI);
        ctx2.fill();
        ctx2.closePath();
    }

    // 绘画点与点之间的连线
    ctx2.beginPath();
    ctx2.strokeStyle = '#ff8878';
    for (var i=0; i<dataArr.length; i++) {
        const ploy = dataArr[i];
        ctx2.lineTo(ploy.x, ploy.y);
    }
    ctx2.stroke();
    ctx2.closePath();

    // 绘画文字
    ctx2.beginPath();
    for (var i=0; i<dataArr.length; i++) {
        const ploy = dataArr[i];
        ctx2.fillStyle = ploy.labelColor || '#000';
        ctx2.fillText(`${ploy.per * 100}%`, ploy.x - 10, ploy.y - 10);
    }
    ctx2.closePath();

    // 绘画折线内的阴影
    ctx2.beginPath();
    const firstPloy = dataArr[0];
    const lastPloy = dataArr[dataArr.length - 1];
    ctx2.moveTo(firstPloy.x, firstPloy.y);
    for (var i=0; i<dataArr.length; i++) {
        ctx2.lineTo(dataArr[i].x, dataArr[i].y);
    }
    ctx2.lineTo(lastPloy.x, cfg.height);
    ctx2.lineTo(firstPloy.x, cfg.height);
    ctx2.closePath();
    ctx2.fillStyle = 'rgba(255, 136, 120, 0.2)';
    ctx2.fill();
    ctx2.closePath();

    // 创建label文字，直接使用dom
    console.log(perx);
    var labelWidth = perx / 2;
    for (var i=0; i<dataArr.length; i++) {
        var txt = $(`<p class="ploy-label">${dataArr[i].label}</p>`);
        txt.css({ width: `${perx/2}px`, left: `${labelWidth * (i+1) - labelWidth/2}px` })
        component.append(txt);
    }

    return component;
};

/**
 * 雷达图，基于canvas绘画
 */
var H5ComponentRadar = function (name, cfg) {
    var cfg = cfg || {};
    cfg.type = 'radar';

    var component = new H5ComponentBase(name, cfg);

    var $Canvas = $('<canvas></canvas>');
    var oCanvas = $Canvas[0]; // 转为原生js对象
    var ctx = oCanvas.getContext('2d');
    oCanvas.width = cfg.width;
    oCanvas.height = cfg.height;
    component.append($Canvas);

    var $Canvas2 = $('<canvas></canvas>');
    var oCanvas2 = $Canvas2[0]; // 转为原生js对象
    var ctx2 = oCanvas2.getContext('2d');
    oCanvas2.width = cfg.width;
    oCanvas2.height = cfg.height;
    component.append($Canvas2);

    var r = cfg.width / 2; // 半径

    // 绘画圆心
    ctx.beginPath();
    ctx.arc(r, r, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
    // 绘画完整的圆
    ctx.beginPath();
    ctx.arc(r, r, r, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();

    // 绘画5个点
    var step = 5;
    for (var i=0; i<step; i++) {
        var rad = (2 * Math.PI / 360) * (360 / step) * i;
        var x = r + Math.sin(rad) * r;
        var y = r + Math.cos(rad) * r;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }
    
    // 绘画5变形
    var step = 5;
    ctx.beginPath();
    for (var i=0; i<step; i++) {
        var rad = (2 * Math.PI / 360) * (360 / step) * i;
        var x = r + Math.sin(rad) * r;
        var y = r + Math.cos(rad) * r;
        ctx.lineTo(x, y);
    }
    ctx.fill();
    ctx.closePath();



    return component;
}