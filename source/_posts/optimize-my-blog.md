---
title: optimize-my-blog
subtitle: 个人博客改造过程
date: 2018-10-21 14:58:11
categories:
  - front-end
tags:
  - web优化
---

# hexo主题 MaterialFlow 主题改造

打算对博客的访问速度和样式做一个改版优化.
<!-- more -->
因为看到屈屈的博客做了很多优化, 体验很好, 所以自己私下想要pk一下 目前使用的网站评测主要有google的[PageSpeed Insights](https://developers.google.com/speed/pagespeed/insights/)和[GTmetrix](https://gtmetrix.com/), 屈屈在PageSpeed Insights上的评分是97分, 那么我的目标是98分及以上.

## 目标

1. 精简页面请求数-不超过5个  
  目前已经删除掉多余的请求, 现在已经删减到5个, 分别是页面html, 脚本index.js, 样式style.css, 字体RobotoMono-Iconfont以及图标favicon.ico, 第一次请求会加载这五个, 从第二次开始就只会有一个请求, 就是页面html, 这个是必须的, 其余的四个均在缓冲中(如果用户没有手动清除缓存的话)
2. 减少请求大小-单个请求不超过50k  
  目前都已经控制到30k以内, 除开一些特例, 目前页面上最大的请求就是页面本身(这个是正常且自然的), 其次就是页面上的图片, 这个我会尽量压缩, 但是也是在可以接受的范围, 其他的css, js, 和字体都在20k以内
3. 控制首屏加载时间-不超过1s
  目前首屏加载时间相当快了, 因为其实只是先显示一个加载动画, 然后等css加载完毕以后再显示主要内容
4. 静态文件上cdn-七牛云cdn  
  目前js和css还有字体文件都已经使用七牛云的cdn服务
5. 升级https  
  目前全站资源都切换到了https,主域名kricsleo.com已经使用github提供的免费https服务, cdn域名store.kricsleo.com也使用在阿里云上申请到的SSL证书升级到了https
6. 干掉jquery  
  之前的主题使用的是jquery来实现一些功能, 现在已经将相关逻辑都使用原生js改写, 目前没有任何第三方依赖
7. 精简字体文件  
  中文字体采用系统自带的字体渲染, 英文字体系统自带的比较难看, 加上我很喜欢google的一个字体[Roboto Mono](https://fonts.google.com/specimen/Roboto+Mono), 所以犹豫了很久决定为了网站的风格稍微牺牲一点速度, 还是采用`@font-face`加载网络字体, 同时因为我用到了一些图标, 所以最后我决定自己把英文字体和`iconfont`的图标进行合并, 同时删除掉我用不到的字体和字符, 找到了一个很好用的在线编辑字体的工具[FontEditor](http://fontstore.baidu.com/static/editor/index.html#), 把Roboto Mono中我用不到的基本都删掉了, 最后剩下的大概只有ASCII里面的字符, 同时把在阿里图标库找到的我要用的`iconfont`图标加了进去, 最后生成了一个适合我的`RobotoMono-Iconfont`字体文件, 大小只有17k, 最后将这个文件放到了我的cdn上由页面引用
8. 优化图片加载-懒加载
  图片很容易会拖慢网页的加载, 所以我对图片做了懒加载, 这里涉及到一个hexo的渲染问题, 我稍后来细写这一块.目前的效果是随着页面的滚动, 当图片进入视区中时才会去下载这个图片并显示.
9. 避免css的加载和解析拖慢首屏的展现
  这一块和控制首屏展现时间一起写.

## 过程记录

对于上面的目标里面的部分记录一下达成的过程

1. 压缩所有资源  
  我使用的hexo生成的博客静态文件, 压缩的时候使用

## 相关资料

关于浏览器渲染字体的过程:
[Web Font 123 - 再谈 WebFont 优化](https://blog.nfz.moe/archives/webfont-123.html)
渲染字体的方式原生有三种: `FOUT`(Flash of Unstyled Text), `FOIT`(Flash of Invisible Text)和`FOIT 3S`(3s前为`FOIT`, 3s后还未加载完毕则降级为`FOUT`)

## 优化关键渲染路径

html, css 和 JavaScript 之间的依赖关系
[关键渲染路径系列文章](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/?hl=zh-cn);

普通: 停止解析 dom, 单线程转为下载并立即执行 js, 在 js 处理完毕之后再继续解析 dom, 会阻塞 dom 的解析和渲染
defer: 并行下载 js 文件, 但是将其执行时间推迟到 dom 构建完毕在domContentLoaded时间之前, 不会阻塞 dom 的解析但会阻塞dom 的渲染, 按照规范来说 js脚本是按照顺序执行的, 但是各个浏览器的实现可能不一样, 在实际中无法保证顺序执行这一点, 相当于把 js 脚本位置移动到`<body>`底部, 脚本在执行的时候dom 已经构建完毕, 可以操作 dom;
async: 并行下载 js 文件, 下载完成后立即执行, 执行时间可能在domContentLoaded之前, 也可能在domContentLoaded之后, 但是一定在 load 事件之前, 不会阻塞 dom 的解析和渲染, 但是在执行时不保证 dom 构建完毕, 同时也不保证各个脚本的执行顺序, 也就是说如果你的脚本里面有操作 dom 的地方, 那么这个地方可能会报错, 因为对应的 dom 节点可能还没有构建完成, 所以需要避免在此类脚本中操作 dom;值得注意的是，向 document 动态添加 script 标签时，async 属性默认是 true，


css 加载优化

1. 只显示头部和右侧

css加载不会阻塞DOM树的解析
css加载会阻塞DOM树的渲染
css加载会阻塞后面js语句的执行、

js 可以阻塞 dom 树的构建和渲染

> 实际上，内联脚本始终会阻止解析器，除非您编写额外代码来推迟它们的执行
> --[使用 JavaScript 添加交互](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/adding-interactivity-with-javascript?hl=zh-cn)

preload firefox不支持

# 总体步调

1. 速度:
  - [x] 请求数: 页面初始请求不超过6个(现在是5个)
  - [x] 请求大小: 最大请求大小不超过150k
  - [x] 不超过2s 加载完毕
  - [x] 静态文件采用 cdn 缓存
  - [x] 图片懒加载
  - [x] 干掉 jquery
  - [x] 字体文件太大了, 采用[在线字体处理](http://fontstore.baidu.com/static/editor/index.html#), 去除多余文字, 加入需要的 iconfont
  - [ ] 考虑内联或者其它方式处理 css, 目前 css 严重阻碍首屏展现
2. 样式
  - [ ] 整体风格天蓝色
  - [ ] 采用卡片式布局(可以考虑重写, 既可以练习自己的建站技巧, 也可以去除原本 css 中的冗余部分)
3. 安全
  - [x] 全站升级为 https
  - [x] 七牛云空间也一并配置 https
4. 评论
  - 等到前三点稳定以后再开启评论合适/速度快/国内可访问的评论系统
5. 搜索
  - [ ] 等到前四点稳定以后再考虑转用其他搜索实现毫秒级响应(第三方搜索或者自己部署 Elasticsearch)
  目前采用的是`hexo-generator-search`生成的站内静态文件.
  2019-04-24更新: 在阿里云的服务器上部署了 docker 环境, 然后在 docker 中部署了 Elasticsearch, 实现了搜索, 不过目前使用的搜索域名是'try.kricsleo.com',
  然后下一个问题是我的 markdown 文章如何导入 es 中, 每次新建或者更新文章时如何同步的更新 es 中的数据?

