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




## 原理
- 页面滑动是用jquery.