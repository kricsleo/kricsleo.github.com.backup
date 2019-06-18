---
title: yahoo-best-practices-for-speeding-up-your-Web-Site
date: 2018-11-15 16:01:33
subtitle: yahoo 关于网站速度优化的军规
categories:
  - front-end
tags:
  - yahoo
  - speed
---

# yahoo 的网站优化实践军规

yahoo 的网站优化军规已经出来很多年了, 我是最近才看到, 然后做一下笔记, 也比对一下自己现在做的怎么样.

原文地址: [Best Practices for Speeding Up Your Web Site](https://developer.yahoo.com/performance/rules.html?guccounter=1)
<!-- more -->
掘金上也有不少好文章来详细阐述的: [前端性能优化之雅虎35条军规](https://juejin.im/post/5b73ef38f265da281e048e51)

1. 减少 HTTP 请求
2. 使用 CDN
3. 添加`Expires`或者`Cache-Control`缓存控制头
4. 对除了图片和 PDF 这类文件以外的文件(如 CSS, JS, 或者 `application/json`等)使用 Gzip
5. 样式放在头部
6. 脚本放在底部
7. 避免使用 CSS 表达式
8. 脚本和样式使用外链形式
9. 减少 DNS 查询
10. 压缩脚本和样式文件
11. 避免重定向
12. 移除重复的脚本
13. 配置 ETags
14. 缓存 Ajax 数据
15. 尽早刷新缓冲区
16. Ajax 尽量使用 GET 方式
17. 延迟加载暂时不必要的资源
18. 预先加载可能用到的资源
19. 减少页面 DOM 元素数量
20. 资源分散到不同的域上
21. 减少 iframes 的数量
22. 避免404
23. 减少 cookie 大小
24. 把资源部署到不用发送 cookie 的域上
25. 减少访问 DOM 的次数
26. 合适处理事件绑定
27. 使用`<link>`而不是`@import`
28. CSS 中避免使用 AlphaImageLoader
29. 优化及压缩图片
30. 优化 CSS 雪碧图
31. 选用尺寸刚好合适的图片, 不要缩放使用
32. 使用小的 favicon, 同时注意缓存该文件
33. 文件大小不要超过25k(这一条目前来说可能过时了, 后期查证)
34. 把多个文件合并成一个文件, 减少 HTTP 数量
35. 避免空`src`的`img`
