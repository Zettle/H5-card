# H5-card

> 基于旧项目开发的一个H5贺卡场景

- node版本: 10.15.1


## 项目结构
1、H5贺卡骨架，除去loading，项目至少要3张才可以，不然在获取`this.$currentPage`和`this.$nextPage`和`this.$prePage`会出现重叠，在设置某些动画的同时，又设置了隐藏

2、基于zepto开发

## 页面逻辑
1、index.html里面尽可能简单少代码，目的是为了首屏加载尽可能快，加载zepto.js和index.js，原则上只放loading的代码

2、index.js用ajax去请求page.html、page.csss、page.js等资源，index.html的loding是读取图片百分比，包括page.html里面的`<img>`标签，css里面的图片（这些需要手动写在page.html的#preload-css-img），加载完后remove掉loading，并展示第一张广告

3、翻页逻辑

**向上翻页：** 

当前页：随着手指滑动距离disY，计算`1 + this.disY / this.screenSize.height`，注意向上滑的时候由于手指坐标是在变小的，所以disY恒为负数

下一页：根据手指滑动距离disY平移

**向下翻页：** 

当前页：随着手指滑动距离disY，计算`1 - this.disY / this.screenSize.height`，注意向下滑的时候由于手指坐标是在变大的，所以disY恒为正数

上一页：根据手指滑动距离disY平移

4、动画逻辑
给每个页`section.page`加`.active`的时候，就会产生动画效果。对于需要特殊处理的页面逻辑，写在`tools/pageHandle.js`里面。

```js
page2In ($page) {
    // 页面3-进场后更多的逻辑处理
},
page2Out ($page) {
    // 页面3-离场后更多的逻辑处理
}
```

## gulp搭建
1、多入口打包

[资料](http://www.cnblogs.com/darrenji/p/5492293.html)

2、gulp的watch后，新建文件不会监听到：改用`gulp-watch`

3、保存后自动刷新浏览器：gulp-connect

4、打包去掉`console`：gulp-strip-debug

5、自动补全css前缀：gulp-autoprefixer

6、根据不同环境做不同gulp处理：gulp-if

## 遇到的问题
1、监听`transitionend`事件，当子级DOM也发生transition的时候，也会触发父级的`transitionend`，当同个元素多个属性发生transition的时候，也会多次触发`transitionend`。

* e.target === e.currentTarget 判断是否是当前DOM发生的
* 建立transitionFlag标识，防止多个属性时候多次触发

```js
let transitionFlag = true;
this.$page.on('transitionend', (e) => {
    if (e.target === e.currentTarget && transitionFlag) {
        transitionFlag = false;
        // ...code...
        setTimeout(() => {
            transitionFlag = true;
        });
    }
}
```

2、在翻页ing的时候，如果手指快速又滑动一次，就会乱，所以建立一个变量`isPageTransting=true`标识是否正在翻页，如果正在翻页则不做任何处理，翻页结束后，再将标识设置为false

3、新版浏览器禁止了自动播放音乐，需要用户发生行为后才可以调用`.play()`来播放

4、移动端浏览器大多会向下滑时候出现浏览器内核信息，可以用下面方式阻止掉
```js
document.body.addEventListener('touchmove', function(ev) {
    ev.preventDefault();
}, {capture: false, passive: false});
```

5、pc端适应方案
- 用鼠标滚动轮来实现上翻还是下翻
- 定宽高：根据设计稿宽高比例、浏览器宽高比例，取最小值。或者以PC端高度=100%，宽度js计算得到（未）