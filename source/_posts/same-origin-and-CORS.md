---
title: same-origin-and-CORS
date: 2018-10-16 11:06:36
categories:
   - front-end
tags:
   - same-origin
   - CORS
   - cookie
---

# 浏览器同源策略

目前的 web 开发还相当的依赖 cookie , 而cookie的使用限制于浏览器的同源策略(same-origin policy), 同时这个策略也是保证我们网站信息安全的基础, 这篇文章主要了解一下浏览器同源策略具体的含义, 以及在实际开发中如何绕过这一限制来达到跨域请求数据的目的.

<!-- more -->

## 何为同源

一个访问地址大致可以分为`<协议><域名><端口><路径>`四个部分: 例如<https://www.example.com:80/home/index.html?page=3>, `https`为协议, `www.example.com`为域名, 域名内也可分为顶级域名, 一级域名, 二级域名, 三级域名等等, 具体如何拆分的讨论可以参考知乎的一个[帖子](https://www.zhihu.com/question/29998374), 你只要明白意思就可以了, 这里的话我采用其中一种说法来描述一下, `com`为顶级域名, `example`为一级域名, `www`为二级域名, 接下来的`80`为端口, `/home/index.html?page=3`为路径, 这样我们就把一个URL的各个部分拆分开了.

所谓同源, 就是限制了`<协议><域名><端口>`这三个部分必须要一模一样, 此时就称为同源, 如果这三块有任何一个地方不一样就产生了跨域.

## 跨域带来的限制

在跨域情况下有如下几种情况会受到限制:

1. 两个域之间无法互相读取Cookie、LocalStorage 和 IndexDB
  例如a.com向api.com发起请求的时候, 请求中默认是不会携带a.com域下的cookie的, 也就是说api.com默认情况下是无法获取a.com的cookie的
2. 两个域之间无法互相获取和操作DOM
  例如a.com的一个页面内有一个iframe, iframe里面加载的是b.com的一个一个页面, 那么这两个页面之间是无法获取另一方的DOM来进行操作的
3. 两个域之间无法使用ajax通信
  例如a.com向api.com发起一个ajax请求(XMLHttpRequest或者fetch()), 那么返回的数据默认会被浏览器拦截并且丢弃然后控制台提示产生一个跨域的错误, 所以在js中是无法拿到返回数据的

## cookie的概念

这里我们首先看一下cookie的相关概念, cookie是存在客户端浏览器的一小段文本, 不同的浏览器对cookie的大小有不同的限制, 可以通过`document.cookie`来获取本域名下的cookie信息, cookie中包含如下属性: `key=value`, `Domain`, `Path`, `Expires`, `Max-Age`, `Secure`和`HttpOnly`, 还有用的比较少的`HostOnly`等, 可以查看[这篇文章](https://imququ.com/post/host-only-cookie.html), 各个属性之间用英文分号和空格（"; "）连接, 大概说一下各个属性.

- `key=value`
  cookie最主要的内容, 设置cookie的值, 例如`username=krics;`, 代表在cookie中存储了一个`username`, 它的值是`krics`, 必填项.
- `Domain`
  cookie的域名, 默认是当前域名, 和`Path`配合指定 cookie 的具体路径. 注意在手动设置时domain是可以设置为页面本身的域名（本域），或页面本身域名的父域，但不能是公共后缀[`public suffix`](https://publicsuffix.org/)。举例说明下：如果页面域名为 www.baidu.com, domain可以设置为“www.baidu.com”，也可以设置为“baidu.com”，但不能设置为“.com”或“com”. 设置`Domain`时的前面带点‘.’和不带点‘.’的区别:
  - 带点：任何 subdomain 都可以访问，包括父 domain
  - 不带点：只有完全一样的域名才能访问，subdomain 不能（但在 IE 下比较特殊，它支持 subdomain 访问）
- `Path`
  cookie的可访问路径, 默认为"/"，表示指定域下的所有路径都能访问, 它是在域名的基础下，指定可以访问的路径。例如cookie设置为"domain=.google.com.hk; path=/webhp"，那么只有".google.com.hk/webhp"及"/webhp"下的任一子目录如"/webhp/aaa"或"/webhp/bbb"会发送cookie信息，而".google.com.hk"就不会发送，即使它们来自同一个域。
- `Expires`
  cookie的过期日期, 内容格式是GMT时间字符串, 例如`Expires="Tue, 16 Oct 2018 04:01:45 GMT;"`代表此cookie将在这个时间过期, 在此之前cookie都是有效的, 可以使用`Date`类型的`toGMTString()`方法来获取这个时间戳, 可选属性. 如果没有设置该项那么默认 cookie 的有效期是本次会话期间, 也就是说在关闭浏览器前这个 cookie 一直有效, 但是一关闭浏览器这个 cookie 马上就失效被删除, 这种 cookie 也叫做`session cookie`. 现在在`http/1.1`中已经推荐使用`Max-Age`来代替这个属性, 但是由于老版本的IE(ie6、ie7 和 ie8)只可使用`Expires`属性, 不兼容`Max-Age`这个新属性, 所以使用时请考虑到这一点
- `Max-Age`
  cookie的最大有效时间, 在`http/1.1`中引入的新属性, 单位是秒, 代表从**客户端**的此刻开始到多少秒后, 这个cookie会失效, 例如`Max-Age=3600`, 代表在客户端设置这个cookie起的3600秒后这个cookie失效, 可选属性. 默认值是`-1`, 含义是本次会话期间有效, 关闭浏览器则失效, 设置为`0`代表删除该 cookie, 设置为正整数代表的有效秒数.
  注意对于对于`Expires`和`Max-Age`都可以使用的浏览器而言, 这两个如果都设置了, 那么`Max-Age`的优先级高(IE除外, IE只使用`Expires`), 如果只设置一个, 那就以设置的那个为准(同样IE除外), 如果都没有设置, 那么cookie的有效时间为本次会话期间, 只要浏览器不关闭, 那么这个cookie一直有效, 如果浏览器被关闭, 那么这个cookie就会被删除, 像这样没有设置`Expires`和`Max-Age`的cookie, 我们也可以称为session cookie, 因为它是与本次会话相关联的. 可选属性
- `Secure`
  cookie的安全标志, 内容很简单, 只需要指定一个`Secure`字段就可以了, 而不是键值对的形式, 当指定是`Secure`之后, 这个cookie只会在使用`SSL`(例如`HTTPS`)连接时才会被发送到服务器. 默认为空, 那么默认情况下不论是不是安全的连接在可以发送 cookie 的时候都会发送这个cookie. 可选属性. 如果想在客户端即网页中通过 js 去设置secure类型的 cookie，必须保证网页是https协议的。在http协议的网页中是无法设置secure类型cookie的。
- `HttpOnly`
  cookie的安全保证, 内容也很简单, 只需要指定一个`HttpOnly`字段就可以了, 当指定为`HttpOnly`后, 就无法通过js去访问或者设置这个cookie的内容, 同时也无法通过js来设置`HttpOnly`的cookie, 这个字段只有服务器能够操作, 这个cookie会正常的发送给服务器, 只是对客户端的js不可见而已. 可选属性

有两种方式产生cookie, 一种是服务器的响应, 而是客户端的js.

- 服务器响应方式
  如果服务器在响应的数据中添加一个响应头: `Set-Cookie: name=krics; Path=/; Domain=.example.com; Max-Age=31536000`, 例如下面JAVA的写法,

```java
// 生成一个cookie
Cookie cookie = new Cookie("name", "krics");
cookie.setPath("/");
cookie.setDomain(".example.com");//这样设置，能实现不同二级域名的两个网站共用这个cookie, 自定义
cookie.setMaxAge(365 * 24 * 60 * 60);// 不设置的话，则cookies不写入硬盘,而是写在内存,只在当前页面有用,以秒为单位
response.addCookie(cookie);         //添加第一个Cookie
// 可以重复上面的代码添加多个cookie
```

这样就会在响应头中添加上面示例给出的额外的头信息.

- 客户端js
  在客户端通过js方式`document.cookie`既能访问cookie, 也能设置cookie, 例如`document.cookie="name=krics; Path=/; Domain=.example.com; Max-Age=31536000"`, 那么就会添加一个cookie到浏览器中, 这里比较有意思的是并不是多次设置`document.cookie`其实是追加内容, 不像一般js那样会覆盖内容, 之后有时间可以看一下这里的处理. 这里因为浏览器没有提供其他的api来操作cookie, 所以我们一般会自己封装一个工具类来读写cookie, 这里给出我的一个比较简单的实现[Cookie.js](https://kricsleo.github.io/code/Cookie.js)

## 解决跨域

这里可以参考阮一峰的文章[浏览器同源政策及其规避方法](http://www.ruanyifeng.com/blog/2016/04/same-origin-policy.html).

### iframe形式的跨域

1. 如果两个窗口一级域名相同，只是二级域名不同，那么可以通过设置document.domain属性为同一个值，就可以规避同源政策，拿到DOM。
2. 片段标识符（fragment identifier）指的是，URL的#号后面的部分，比如<http://example.com/x.html#fragment的#fragment>。如果只是改变片段标识符，页面不会重新刷新。但是会触发`window`的`onhashchange`事件, 可以通过监听这个事件来传递数据.
3. 监听`window.name`属性。这个属性的最大特点是，无论是否同源，只要在同一个窗口里，前一个网页设置了这个属性，后一个网页可以读取它, 而且这个值得容量很大, 字符串形式.
4. 以上三种方式都属于hack, HTML5为了解决这个问题，引入了一个全新的API：跨文档通信 API（Cross-document messaging）,这个API为window对象新增了一个`window.postMessage`方法，允许跨窗口通信，不论这两个窗口是否同源。具体使用可以参考[MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/postMessage), 需要注意的是在IE下有一定的兼容性问题.
5. 通过window.postMessage，读写其他窗口的 LocalStorage . 也是基于`window.postMessage`的.

### AJAX

这里才是重点, 一个跨域的AJAX请求要想正常交互, 有如下四种解决方案:

1. JSONP
  它的基本思想是，网页通过添加一个`<script>`元素，向服务器请求JSON数据，这种做法不受同源政策限制；服务器收到请求后，将数据放在一个指定名字的回调函数里传回来。
  这种方式的优点是简单兼容性好, 服务器的改造小, 但是这种方式因为是通过加载js脚本的形式实现的, 所以只支持`GET`方式.
2. WebSocket
  WebSocket是一种通信协议，使用ws://（非加密）和wss://（加密）作为协议前缀。该协议不实行同源政策，只要服务器支持，就可以通过它进行跨源通信。
  这种方式对服务器的改造最大, 需要更改协议
3. Nginx
  通过在服务器端布置Nginx, 通过它代理请求, 然后由Nainx将请求转发到真正的数据服务器上, 这种方式需要在服务器端安装Nginx, 然后需要配置Nginx才行
4. CORS
  CORS是跨源资源分享（Cross-Origin Resource Sharing）的缩写。它是W3C标准，是跨源AJAX请求的根本解决方法。相比JSONP只能发GET请求，CORS允许任何类型的请求。
  关于CORS, 可以参考阮一峰的文章[跨域资源共享 CORS 详解](http://www.ruanyifeng.com/blog/2016/04/cors.html), 简单来说是按照下文配置.

### CORD

1. 服务器端配置
  - `Access-Control-Allow-Origin`: 代表允许跨域的域名,可选字段, 默认不允许跨域请求, 如果配置为`"*"`代表接受任何一个域发送的ajax请求, 也可以指定一个特定的域名, 表示只接受这个域发送的跨域请求, 注意- 不能设置多个域, 要么是通配符`"*"`, 要么是某一个域

  - `Access-Control-Allow-Credentials`: 代表是否允许跨域请求携带cookie, 可选字段, 默认不允许, 设置为`true`代表允许, 但是这个字段和上面的`Access-Control-Allow-Origin`有一点冲突的是, 如果设置为`true`, 那么`Access-Control-Allow-Origin`只能配置特定的一个允许跨域的域名, 这个时候不能配置通配符`"*"`

  - `Access-Control-Expose-Headers`: 代表允许客户端获取的额外的头字段信息, 可选字段, 默认无法拿到自定义的头部字段, CORS请求时，XMLHttpRequest对象的getResponseHeader()方法只能拿到6个基本字段：`Cache-Control`、`Content-Language`、`Content-Type`、`Expires`、`Last-Modified`、`Pragma`。如果想拿到其他字段，就必须在`Access-Control-Expose-Headers`里面指定。例如可以指定`Access-Control-Expose-Headers: FooBar`，那么客户端可以通过`response.getResponseHeader('FooBar')`拿到FooBar字段的值。

2. 客户端配置
  `withCredentials`: 代表跨域请求是否发送对应域的cookie, 可选字段, 默认不会发送(有的浏览器可能例外, 也可以显示的设置为`false`), 设置为`true`代表发送, 需要注意的是客户端是需要和服务端配合使用的, 当设置为`true`时, 虽然cookie发送过去了, 但是服务器要配置`Access-Control-Allow-Credentials: true`和`Access-Control-Allow-Origin: www.example.com`才能正确接收到cookie

当然还有更详细的内容, 如果碰到更多问题, 可以去看一下上面阮一峰的关于跨域的文章, 也可以参考Faremax的一片文章[全解跨域请求处理办法](https://segmentfault.com/a/1190000016590427).

## 参考文章

[聊一聊 cookie](https://segmentfault.com/a/1190000004556040#articleHeader12)
[全解跨域请求处理办法](https://segmentfault.com/a/1190000016590427)
[跨域资源共享 CORS 详解](http://www.ruanyifeng.com/blog/2016/04/cors.html)
