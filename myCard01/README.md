# 效果1

主要是学习慕课上的，跟着做的学习作品


## 技术栈
- jquery
- [jquery-fullpage](https://alvarotrigo.com/fullPage/zh/): 实现页面滑动效果插件



## 几个demo
###  demo01.html
主要是fullpage.js的使用

参考资料: https://github.com/alvarotrigo/fullPage.js/tree/master/lang/chinese#fullpagejs

> 注意点
1. onLeave 取的是第1个参数的index。afterLoad 取的是第2个参数的index。fullPage.js中第1个参数是当前section的数据，第2个参数是目标section的数据



### demo02.html
fullPage.js和里面内容动画搭配的使用。

利用jquery中 `$('.box').on('自定义事件', function () {})` 和 `$('.box').trigger('自定义事件')` 来监听和触发自定义事件

在 `$('.page')` 中监听2个自定义事件 `onLeave` 和 `onLoad`

在每次滑动切换页面的时候，触发上面的自定义事件

> 注意点
1. 在html结构如下
```html
<div class="page" id="page-1">
    Some page1
    <div class="component logo">logo</div>
    <div class="component slogan">slogan</div>
</div>
```
而 `.page` 和 `.component` 刚好监听了一个自定义事件 `.on('onLoad')` 。当我们触发子级的 `$('.component').trigger('onLoad')` 后，事件会一直冒泡到父级，再触发父级的 onLoad 事件，而父级 onLoad 事件里面又由代码触发子级的 onLoad。从而进入死循环。

解决方式是子父级不要监听相同名字的自定义事件，或者阻止下事件冒泡


### demo03.html
为了编写基本功能 `H5ComponentBase.js` ，该js会根据传递进来的配置返回一个`<div></div>`元素。然后外界就可以拿到这个div插入DOM里面。

> 注意点
1. 设计师给的是双倍图，所以我们在封装js的时候，要把width和height除以2，这样外界就直接传入在设计稿上量出来的宽度高度即可

2. 在水平居中的原理是设置下面代码
```css
.div {
    position: absolute;
    left: 50%;
    width: 200px;
    margin-left: 100px;
}
```

3. 动画效果是通过jquery的animate实现的

4. 通过按钮触发 .h5_component 的自定义事件，并且执行不同的animate动画


### demo04.html

1. 链式调用的实现，在执行完方法后，把对象return出去，就可以继续调用该实例的方法

2. fullPage.js的初始化，要在dom操作完后执行。每一次fullPage的切换，找出当前.section下所有的.compontent，做出切除效果。找到下一个.section下所有的.component，做切入效果


### demo05.html

散点图生成的demo，本质用div绘画圆，每个数据结构如下: 
```js
var data = [
    [ '文本AA', 0.4, 'red' ],
    [ '文本BB', 0.2, 'blue', 0, '-50%' ],
    [ '文本CC', 0.2, 'green', 0, '-50%' ],
];
```
每个数组是一个散点图的数据，`[文字, 占比, 颜色, x轴偏差, y轴偏差]`

第1个数组作为基点，只有`[文字, 占比, 颜色]`属性，然后的根据该散点图进行绘画，位置是根据 `x轴偏差, y轴偏差` 进行定位，大小是根据第2个元素进行定位。

比如上面数据:

1. 基点图是`['文本AA', 0.4, 'red']`

2. 第2个散点图是位置是 `[0, '-50%']` 即根据基点图x轴偏移0，y轴偏移-50%。在代码上设置`{ left:0; top:-50% }`即可。

3. 第2个散点图的大小定义: 第2个三点图数据是0.2，占全部的`0.2/0.4 = 50%`。所以大小就定位基点图的50%即可


## demo06.html
柱状图的实现

每个柱状条的数据结构`[ '文本AA', 0.4, '#ff7676' ]`。
- 第1个参数是文案
- 第2个参数是宽度的百分比
- 第3个参数是颜色

每个柱状图的html结构如下:
```html
<div class="line">
    <div class="name">文本AA</div>
    <div class="process">
        <div class="bg"></div>
    </div>
    <div class="per">40%</div>
</div>
```
中间的柱状包含2个
```html
<div class="process">
    <div class="bg"></div>
</div>
```
`.process` 的宽度等于外界传递进来的，然后保持不动。`.bg` 的宽度从0到100%变化，就可以看出柱状的变化，而百分比数字又保持不变



## demo07.html
1. 折线图是利用cavans绘画的，在js中控制canvas等于外界传递的宽高，然后通过css控制缩放到dom的实际宽高，这样高分辨率屏下也会比较高清
2. 绘画网格图的时候，把整个网格视为100个格子，每隔10个格子绘画一条线，然后根据数据中的百分比，定位到了折线应该绘画到哪儿
3. 绘画网格图的时候，对于竖线，则看data数据有多少，比如 N 条数据，则中间需要 N 条竖线，加上首尾，一共需要画 `N+2` 条线。每个格子的间隙则是 `N+1` 份，因为首尾的竖线是不展示数据的
4. 动画，创建2个canvas，一个绘画网格，是不动的，一个绘画折线+动画效果






## 原理
总体html结构
```html
<div class="h5">
    <div class="h5_page">
        <div class="h5_component"></div>
        <div class="h5_component"></div>
    </div>

    <div class="h5_page">
        <div class="h5_component"></div>
    </div>
</div>
```