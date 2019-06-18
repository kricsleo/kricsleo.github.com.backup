---
title: web-font
subtitle: 网页字体加载过程及优化
date: 2018-11-01 10:11:36
categories:
  - front-end
tags:
  - web-font
  - css
---

# 网页字体加载过程及优化

现在很多网站为了视觉效果都在使用在线字体, 系统自带的字体可以直接使用, 但是自定义的在线字体需要通过`@font-face`来加载. 这里主要结合我自己的博客的实践来记录一下网页字体的加载过程及优化.
<!-- more -->

## 在线字体格式

目前来说有如下四种字体格式, `WOFF`, `SVG`, `EOT`和`OTF/TTF`, 兼容性可以在[caniuse](https://caniuse.com/)上面关注最新的情况

- WOFF
  `WOFF`全称是"Web Open Font Format", 这种字体专门用于网络, 是由 Mozilla 与 Type Supply, LettError 及其他组织协同开发的一种网页字体格式, 使用了OpenType (OTF)和TrueType (TTF)字体里的存储结构和压缩算法, 所以在传输的时候可以节省带宽, 加载更快, 目前兼容性来说, IE9+以及其他绝大部分浏览器都可以使用, 是现在的大潮流, 推荐使用这种字体

- OTF/TTF
  全称是"OpenType Font"和"TrueType Font", 是Windows 和 Mac 系统最常用的字体格式, 不过容易被非法复制, 目前的支持情况来说IE9+以上是部分支持, 其余的主流浏览器都没问题.

- SVG
  `SVG`全称是"Scalable Vector Graphics", 是一种用矢量图格式改进的字体格式，体积上比矢量图更小. 兼容性极差, 基本上只有safari系列支持

- EOT
  微软自家开发的字体, 也只有IE全系列支持, 连Edge都不支持

关于字体的编辑推荐一个在线工具[FontEditor](http://fontstore.baidu.com/static/editor/index.html#), 十分好用, 可以删除或者添加字体里面的字符集, 包括多个字体文件合成一个字体, 我目前就是把我博客中使用的Roboto Mono字体和Iconfont字体合成了一个字体文件, 同时删除了Roboto Mono中ASCII码字符集以外的字体, 因为我只用这个字体来渲染代码中出现的英文和数字等, 不需要其他的字符, 字体文件大小从原来的110k直接缩小成了18k.

## `@font-face`

`@font-face`格式:

```css
/* 完整格式, 不过我们日常使用时可能只会涉及到其中少数几个 */
@font-face {
  [ font-family: <family-name>; ] ||
  [ src: <src>; ] ||
  [ unicode-range: <unicode-range>; ] ||
  [ font-variant: <font-variant>; ] ||
  [ font-feature-settings: <font-feature-settings>; ] ||
  [ font-variation-settings: <font-variation-settings>; ] ||
  [ font-stretch: <font-stretch>; ] ||
  [ font-weight: <font-weight>; ] ||
  [ font-style: <font-style>; ]
  [ font-daipsy: <font-display>;]
}

/* 例如, src 中可以使用 local 加载本地计算机的字体, url 用来加载在线的字体(注意跨域问题), 指定 format 可以帮助浏览器更快解析字体
  可选 format 有 【truetype(.ttf)、opentype（.otf）、truetype-aat、embedded-opentype(.eot)、svg(.svg)、woff(.woff)】
 */
@font-face {
  font-family: MyHelvetica;
  src: local("Helvetica Neue Bold"),
       local("HelveticaNeue-Bold"),
       url(MgOpenModernaBold.ttf) format('turetype');
  font-weight: bold;
}
```

在css中使用`@font-face`定义字体, 当浏览器在解析到这一行css时并不会马上去下载这个字体, 而是会继续解析建立DOM树和CSSOM树, 只有当DOM树和CSSOM树结合生成渲染树的时候浏览器会进行一个判断, 如果在渲染树中存在一个会被渲染出来的节点(也就是`display`不能为`none`, 见下面"什么样的节点不会出现在渲染树中")使用了这个字体, 那么浏览器在这个时候才会开始下载这个字体, 至于字体什么时候下载完毕那就不一定了, 同时渲染过程并不会被这个下载过程给阻塞, 那么在此时不确定所需字体是否加载完毕的时候该如何处理采用了这个字体的文字呢?

- 什么样的节点不会出现在渲染树中
  只有`display:none`的节点不会出现在渲染树中, 而其他的例如`visibility:hidden;`或者`opacity:0;`都是会出现在渲染树中的, 因为后面的几种情况虽然也是元素在页面不可见, 但是会在页面上占据它自己的空间, 这会影响到页面的布局, 同时这样的元素中的字体的大小和样式是会影响这个元素所占据的空间的大小的(例如`span`元素等的大小是被字体撑开的), 所以这样的元素中的字体当然是会被加载的, 因为浏览器要根据元素占据的空间大小去布局.

由此引发出了三种解决方案`FOUT`, `FOIT`和`FOIT 3S`, 浏览器采取哪一种根据浏览器不同也有差异, 不过好消息是除了IE和Edge以外(对我来说基本是不考虑IE系列的...)的chrome, firefox, safari和opera都采用了第三种方案`FOIT 3S`. 下面简单介绍一下三种方案:

1. `FOUT`(Flash of Unstyled Text)
  > 当我们在 @font-face 中按优先级顺序定义了一系列字体（称之为 Font Stack）时，如果定义的最高优先级的字体在设备的字库中没有找到、或者引用了 WebFont 但是字体文件没有被加载，那么浏览器会继续轮询 Font Stack，直到找到可用的字体（这个过程就是寻找 fallback 字体）并先渲染出来；当自定义的字体文件被加载以后，浏览器会用这个字体文件重新渲染一遍画面。这有可能造成页面已经展示给用户以后页面的布局再次发生改动。而且，设计师并不喜欢 FOUT，因为这意味着有可能先让访客看到并不好看的备用字体、再看到好看的设计好的字体。但是 FOUT 不会因为字体文件无法加载而导致用户啥都看不到。IE 自从诞生之日起就在使用这种模式，现在 Edge 也在使用这种模式.
2. `FOIT`(Flash of Invisible Text)
  >这是浏览器处理在设备的字库中没有找到、或者字体文件尚未被下载时的另一种方案。如果检测到设定了当前优先级下有设置自定义字体文件，那么浏览器就会不显示任何内容，直到字体显示出来。这有可能造成访客可能需要等待很长一段时间才能看见网页的内容；如果网络环境较为恶劣，甚至有可能会导致有的内容永久不可见。Safari 曾经在很长的一段时间内使用这种模式，并且 iOS WebKit 仍然在使用这种模式，Opera 也曾短暂使用过。(注: 目前这个方案已经被抛弃了)
3. `FOIT 3S`
  >这应该是一个比较折中的解决方案，并且目前 Chrome、Firefox、Safari 都在使用。在 3s 内使用了自定义字体样式的使用 FOIT 模式，在一定时间内（1s，3-5s，也可能是 10s，具体看浏览器和版本）使用 FOIT，如果字体仍然没有加载出来就降级到 FOUT 以改善用户的浏览体验。
--[Web Font 123 - 再谈 WebFont 优化](https://blog.nfz.moe/archives/webfont-123.html)

我们可以使用`@font-face`中指定`font-display`来告诉浏览器该采用哪种方案, 一共有四个选项: `auto`, `swap`, `fallback`和`optional`

- 不指定的情况下默认值是`auto`则浏览器会采用`FOIT 3S`方案
- 指定为`swap`则浏览器会采用`FOUT`方案
- 指定为`fallback`则浏览器会等待一个极短的时间(大约100ms), 在这个时间之前不会显示任何内容, 这个时间结束之后如果字体还没有加载完成, 那么会采用优先级较低的字体来渲染, 之后等字体加载结束之后再使用正确的字体来重新渲染(根据我的测试, 如果这个字体加载的时间太长, 比如5s, 这个时间我没有准确测量过 那么即使之后字体加载完成了, chrome也不会再去重新渲染该字体, 如果短于这个时间, chrome是会去重新用正确的字体渲染的)
- 指定为`optional`则浏览器会采用和`fallback`类似的做法, 只不过等待字体加载的时间会更短(比如上面是5s, 那么现在可能只会等待加载1s)

## `FontFaceSet`

除了在css中使用`@font-face`加载在线字体之外, js里面也有手动加载在线字体的API, 只不过目前还有一定兼容性问题, 但是我关心的chrome, firefox和safari的最近的版本都已经支持了, 所以对我来说是可以使用的. 关于这个API的定义可以参考CSS的这份[草案](https://drafts.csswg.org/css-font-loading/#font-load-event-examples), 也可以参考这篇[文章](https://medium.com/@matuzo/getting-started-with-css-font-loading-e24e7ffaa791)的实践, 我自己归纳如下:

1. `new FontFace()`
  这个API用来生成一个`FontFace`字体实例, 接受三个参数, 第一个是字体名(对应`@font-face`中的`font-family`), 第二个是字体的的路径(对应`@font-face`中的`src`), 第三个是字体的其它信息(例如`@font-face`中的`font-style`和`font-weight`等), 第三个参数也可以不传, 返回一个`FontFace`字体实例对象

  ```JavaScript
  const robotoMono = new FontFace('Roboto Mono', 'url("https://store.kricsleo.com/blog/static/fonts/RobotoMono-Regular.ttf")', {
    style: 'normal',
    weight: '400',
  });
  ```

2. `[FontFace].load()`
  这个API仅用来加载字体文件, 也就是浏览器会去下载对应的字体文件, 返回一个`Promise`对象, `resolve`时会抛出对应的`FontFace`对象, 可以自行捕获加载错误或者定义加载成功后的行为, 需要注意的是此时字体加载成功以后页面上的文字也不会使用该字体去渲染, 还需要使用下面的`add()`方法把字体加到`FontFaceSet`中才可以使用

  ```JavaScript
  robotoMono.load().then(fontFace => {
    console.log(fontFace.family, 'loaded successfully!');
  }, fontFace => {
     console.error('failed: ', fontFace.status);
  });
  ```

3. `[FontFaceSet].load()`
  这个API也可以用来加载字体, 只不过这个API可以不用先生成一个`FontFace`的实例, 可以使用CSS中已经定义的字体, 然后用这个API来手动加载已经定义的字体, 可以参考[MDN](https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/load)

  ```JavaScript
  // 第一个参数为字体的相关信息, 分别是'font-style' 'font-weight', 'font-size'和'font-family'
  // 第二个参数为字体中的某个字符, 可以用来限制加载的字体中必须有这个字符
  document.fonts.load('italic bold 16px Roboto', 'ß').then(fontFace => {
    console.log(fontFace.family, ' has been loaded successfully!');
  }, fontFace => {
    console.warn('loading error...');
  });
  ```

4. `[FontFaceSet].add()`
  这个API用来把字体实例加到文档的字体列表`FontFaceSet`中, 使得字体可以被使用, 返回添加了字体实例之后的`FontFaceSet`对象

  ```JavaScript
  document.fonts.add(robotoMono);
  ```

5. `[FontFace.]status`
   这个API用来访问字体的状态, 共有四种, `unloaded`, `loading`, `loaded`和`error`, 一旦加载并准备好字体，`loaded`的`Promise`就会完成

   ```JavaScript
   console.log(robotoMono.status);

   robotoMono.loaded.then(fontFace => {
     console.log(fontFace.family, 'loaded successfully!');
   }, fontFace => {
     console.error('failed: ', fontFace.status);
   });
   ```

6. `[FontFaceSet].ready`
  这个API用来作为一系列字体加载的结果的回调, 当所有字体都成功加载时就会触发`Promise`的完成

  ```JavaScript
  document.fonts.ready.then(fontFaceSet => {
    console.log('All fonts have been loaded successfully!');
  });
  ```

## 轮子

为了达到通过js来定义和控制CSS字体的下载及替换默认的延迟下载行为的目的, 现在已经有一些可以使用的轮子, 比如[fontfaceobserver](https://github.com/bramstein/fontfaceobserver)和[Web Font Loader](https://github.com/typekit/webfontloader), 其实原生的API也挺好用的而且比较简洁, 如果不想引入第三方库的话自己手写一下挺好的.
