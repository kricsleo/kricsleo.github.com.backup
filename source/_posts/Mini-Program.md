---
title: Mini-Program
date: 2018-09-06 15:10:23
categories:
  - front-end
tags:
  - Mini-Program
---

# 微信小程序跳坑记录

开发微信小程序还是踩了不少坑的, 官方的文档并不详细, 更新也不及时, 碰到问题还是多 google 吧.

<!-- more -->

## 摘要

小程序的逻辑层和渲染层是分开的, 逻辑层运行在 JSCore 中 并没有一个完整的浏览器对象, 因而缺少相关的 DOM API 和 BOM API.
小程序的运行环境 --[参考](https://juejin.im/post/5b8fd1416fb9a05cf3710690)

| 运行环境 |     逻辑层     |     渲染层     |
| :------: | :------------: | :------------: |
|   IOS    | JavaScriptCore |   WKWebView    |
|  安卓 2  |   X5 JSCore    |   X5 浏览器    |
| 开发工具 |      NWJS      | Chrome WebView |

[小程序的 Native 和 js 之间的交互是通过 JSBridge 实现](https://juejin.im/post/5abca877f265da238155b6bc)
[小程序的视图线程和服务线程的交互生命周期](https://www.jianshu.com/p/0078507e14d3)
![小程序的视图线程和服务线程的交互生命周期](https://mp.weixin.qq.com/debug/wxadoc/dev/image/mina-lifecycle.png?t=1474644090505)

小程序的文件编译过程:

- WXml -> js -> Virtual DOM -> DOM Tree
- WXSS -> js -> CSS

## 数据绑定

微信小程序通过`状态模式-单向数据流`来实现数据绑定.
状态模式定义一个对象, 当对象发生改变时, 状态就发生改变, 然后通知与之绑定的视图刷新, 注意: **数据流向是单向的,  即视图变化不会引起对象状态变化**.
如果想要视图改变的时候让对象状态也一并改变, 那么就需要依赖事件来实现, 即视图变化 -> 触发事件 -> 捕获事件 -> 回调处理(在这里可以操作对象)

## 生命周期

### 小程序

整个小程序有三个生命阶段:

1. 小程序初始化完成时: `onLaunch`
2. 小程序启动，或从后台进入前台显示时: `onShow`
3. 小程序从前台进入后台时: `onHide`

关于小程序的销毁有如下机制: 点击左上角关闭或者'Home'键离开微信, 小程序将在后台运行, 只有在后台超过一定时间或者系统内存占用过高时才会真正销毁小程序 --[参考](https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/app.html)

### 页面栈

目前页面栈最大深度是 10 层 --[来源](https://developers.weixin.qq.com/community/develop/doc/000ecec19b04f0e79ab65ec0b5bc04)
一旦达到 10 层, 将无法再使用`wx.navigatoTo()`或同等方式打开新页面, 必须使用其他方式清除一定的栈空间以后才能再打开新页面

路由方式: 五种

1. `wx.navigateTo()`或者点击`<navigator open-type="navigateTo"/>`组件
   页面栈变化: 仅目标页面(不能是`tab`页)入栈

2. `wx.navigateBack()`或者点击`<navigator open-type="navigateBack">`组件或者点击`左上角返回按钮`
   页面栈变化: 仅源页面出栈
   备注: 该方法可在参数(Ojbject)中额外附加一个 Number 型参数`delta`, 表示返回的页面数, 也就是要退几次页面栈, 如果`delta`大于当前栈数, 则返回首页

3. `wx.redirectTo()`或者点击`<navigator open-type="redirectTo"/>`组件
   页面栈变化: 源页面出栈 -> 目标页面(不能是`tab`页)入栈

4. `wx.switchTab()`或者点击`<navigator open-type="switchTab"/>`组件
   页面栈变化: 清空页面栈 -> 目标页面(必须是`tab`页)入栈

5. `wx.reLaunch()`或者点击组件`<navigator open-type="reLaunch"/>`组件
   页面栈变化: 清空页面栈 -> 目标页面(任意页面)入栈

同一页面如果被压栈多次, 那么就会在栈中相应的存在多次, 相当于页面顺序浏览的历史记录

### 页面生命周期

从页面栈的变化解释页面的生命周期:

1. 页面刚入栈在栈顶: `onLoad` -> `onShow` -> `onReady`
2. 页面从栈顶被压栈到第二层: `onHide`
3. 页面从栈的第二层到最底层之间活动: 无事件
4. 页面退栈刚到栈顶: `onShow`
5. 页面从栈顶出栈: `onUnload` (注意: 页面出栈即被销毁, 不会触发`onHide`, 直接触发`onUnload`)

一个页面要正常显示，必须经历 3 个生命周期：`加载` -> `显示` -> `渲染`, 对应回调函数顺序:`onLoad` -> `onShow` -> `onReady`.
**官方给出的示例中`onReady`放在`onShow`之前, 但是这并不是真正的顺序, 容易误导开发者**

## 组件

1. hidden 属性
   首先强调一点: **不要使用`hidden`属性!**

   - 语法
     正确的写法是`hidden="{{true}}"`和`hidden="{{false}}"`, 遵循`Mustache`语法, 双大括号不能省略, 因为`hidden`的值是`Boolean`型的, 必须使用`Mustache`计算值才行, 如果省略了双大括号, 比如`hidden="false"`(填写其它内容也一样)), 那么就会把`"false"`作为字符串处理, 此时字符串不为空, 那么结果就是`true`, 此组件仍然会被隐藏.

   - 为什么不要使用该属性
     `hidden`属性的表现相当怪异.
     根据不完全测试, 在`view`, `navigator`等组件上表现为会给你的组件添加一个 css 属性`display: none;`, 如果你是通过`id`或者`class`来给组件加上自定义的`display`属性的话, 那么`hidden`添加的那个`display`属性优先级比你的高, 此时组件会被隐藏; 如果你是使用的内联样式`style="display: flex;"`来给组件添加`display`属性, 那么你这里添加的`display`属性优先级会比较高, 此时`hidden`属性不生效;
     在`button`组件上添加`hidden="{{true}}"`表现为会给你的组件上添加一个 css 属性`display: none !important;`, 这里相比之前多了`!important`关键字, 所以此时的`hidden`属性的优先级是最高的, 不会被你自定义的给覆盖掉;
     在`text`组件上又是一种表示了, 如果你为`text`组件添加`hidden="{{true}}"`, 那么只要你给这个组件自定义了`display`属性, 你的优先级就会比`hidden`的高, `hidden`处于不生效的状态, 如果你没有自定义, 那么`hidden`才会生效;
     基于上面的种种怪异的表现, 已经不需要去测试更多的组件了, 因为这已经有足够充分的理由不去使用`hidden`属性了.

   - 替代办法
     我们使用`hidden`属性无非是想控制组件的显示与否, 那么可以采取如下的替代方案:

   ```html
   <view style="display: {{isHidden ? 'none' : 'flex'}};"></view>
   ```

   - 备注
     对于不怎么切换显示隐藏的组件可以使用`wx:if`, 这样的渲染支出是可以接受的, 但是如果一个组件会经常的切换显示隐藏, 那么最好考虑采取`display: "none;"`的方法, 因为这样不需要重复渲染组件, 只要切换显示隐藏即可, 可以减少 cpu 支出, 提高页面效率. [官方说法](https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxml/conditional.html)

2. scroll-view
   注意：使用竖向滚动时，需要给`scroll-view`一个固定高度, 否则无法`点击回到顶部`以及`滚动到指定位置`

3. text
   `text`组件内只支持嵌套`text`

4. cover-view
    在ios中如果`cover-view`内的文字使用了`rotate`旋转, 那么文字将会显示不全, 只能显示一个文字, 官方bug没有修复, 见[cover-view使用transform rotate后内容会被裁剪](https://developers.weixin.qq.com/community/develop/doc/00088a24548420b41d47a08f158400), 目前的做法最简单的是把文字做成图片, 另一种很麻烦的做法是一个`cover-view`一个文字, 计算每个`cover-view`的文字, 最后拼成整行的文字.

## request

`GET`一般都正常, 但是`POST`请求真可谓是'一千个读者有一千个哈姆雷特', 各种失败的情况都有, 可尝试如下方法:

1. 首先`method`是必须设置为`POST`的;

2. `header`中设置`"Content-Type": "application/x-www-form-urlencoded"`, 也有说小写`"content-type": "application/x-www-form-urlencoded"`能成功;

3. data 有说不能直接传`json`格式, 需要先转格式:

   ```JavaScript
   function json2Form(json) {
       var str = [];
       for(var p in json){
           str.push(encodeURIComponent(p) + "=" + encodeURIComponent(json[p]));
       }
       return str.join("&");
   }

   let data = {
     name: '张三',
     age: '23'
   };

   const ajaxData = json2Form(data); // 然后将`ajaxData`附在请求的`data`中字段中
   ```

4. 也有说服务端必须是`https`的;

5. 实在不行服务端就改成`GET`吧...

## 域名

小程序对于服务器的域名有要求, 在开发时如果没有 https 的服务器, 那么 pc 端可以把微信开发工具里的域名校验展示关闭, ios 端打开调试模式运行小程序, 安卓端打不打开调试模式都可以, 之后如果申请到了 https 的服务器, 那么把服务器域名加入到微信管理平台的域名列表中, 然后就可以关闭各种之前调试的东西正常使用了.

## 源码分析

对小程序的源码分析应该会是比较大的工作量, 所以我打算另外用一篇文章来记录, 这里先挖下一个坑

- [ ] 微信小程序源码分析
