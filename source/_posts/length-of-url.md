---
title: length-of-url
date: 2018-11-07 16:42:49
subtitle: 关于URL长度的笔记
categories:
  - front-end
tags:
  - HTTP
---

# 关于URL长度的笔记

在了解 cookie 的大小限制的时候看到了一片记录关于 URL 长度的博客, 所以收藏了下来.
<!-- more -->

原文: [GET传参最大长度的理解误区](https://github.com/zhongxia245/blog/issues/35)
作者: zhongxia

为防止原文丢失, 这里直接转载一份.

> GET传参最大长度的理解误区
时间：2016-10-17 14:59:38
作者：zhongxia

零、总结
文章数据来源于网络，可能存在变动，但是原理是一样的。

HTTP 协议 未规定 GET 和POST的长度限制
GET的最大长度显示是因为 浏览器和 web服务器限制了 URI的长度
不同的浏览器和WEB服务器，限制的最大长度不一样
要支持IE，则最大长度为2083byte，若只支持Chrome，则最大长度 8182byte
一、误解
大家都知道http 中 存在 GET 和 POST 这两种最常用的请求方式。（PUT，DELETE不在本文讨论范围之内）

误解：HTTP 协议下的 Get 请求参数长度是有大小限制的，最大不能超过XX，而 Post 是无限制的。

1、首先即使有长度限制，也是限制的是整个 URI 长度，而不仅仅是你的参数值数据长度。

2、HTTP 协议从未规定 GET/POST 的请求长度限制是多少。

*以下内容摘自 《关于 HTTP GET/POST 请求参数长度最大值的一个理解误区》， 文章时间为 2013年的。可能以当前最新的浏览器有出入 *

>The HTTP protocol does not place any a priori limit on the length of a URI. Servers MUST be able to handle the URI of any resource they serve, and SHOULD be able to handle URIs of unbounded length if they provide GET-based forms that could generate such URIs. A server SHOULD return 414 (Request-URI Too Long) status if a URI is longer than the server can handle (see section 10.4.15).
Note: Servers ought to be cautious about depending on URI lengths above 255 bytes, because some older client or proxy implementations might not properly support these lengths.

3、所谓的请求长度限制是由浏览器和 web 服务器决定和设置的，各种浏览器和 web 服务器的设定
均不一样，这依赖于各个浏览器厂家的规定或者可以根据 web 服务器的处理能力来设定。

>The limit is in MSIE and Safari about 2KB, in Opera about 4KB and in Firefox about 8KB, (255 bytes if we count very old browsers) . We may thus assume that 8KB is the maximum possible length and that 2KB is a more affordable length to rely on at the server side and that 255 bytes is the safest length to assume that the entire URL will come in.
If the limit is exceeded in either the browser or the server, most will just truncate the characters outside the limit without any warning. Some servers however may send a HTTP 414 error. If you need to send large data, then better use POST instead of GET. Its limit is much higher, but more dependent on the server used than the client. Usually up to around 2GB is allowed by the average webserver. This is also configureable somewhere in the server settings. The average server will display a server-specific error/exception when the POST limit is exceeded, usually as HTTP 500 error.

IE 和 Safari 浏览器 限制 2k
Opera 限制4k
Firefox 限制 8k（非常老的版本 256byte）

如果超出了最大长度，大部分的服务器直接截断，也有一些服务器会报414错误。

>HTTP 1.1 defines Status Code 414 Request-URI Too Long for the cases where a server-defined limit is reached. You can see further details on RFC 2616. For the case of client-defined limits, there is no sense on the server returning something, because the server won't receive the request at all.

详细可以看 RFC2616
>The server is refusing to service the request because the Request-URI is longer than the server is willing to interpret. This rare condition is only likely to occur when a client has improperly converted a POST request to a GET request with long query information, when the client has descended into a URI "black hole" of redirection (e.g., a redirected URI prefix that points to a suffix of itself), or when the server is under attack by a client attempting to exploit security holes present in some servers using fixed-length buffers for reading or manipulating the Request-URI.

二、各个浏览器和web服务器的最大长度总结
** 以下内容摘自[《GET请求中URL的最大长度限制总结》](http://www.cnblogs.com/cuihongyu3503319/p/5892257.html)， 文章内容是 2016年9月，相对比较符合当前的最新现状。 **

在网上查询之后，浏览器和服务器对url长度都有限制，现总结如下。

浏览器
1、IE

IE浏览器（Microsoft Internet Explorer） 对url长度限制是2083（2K+53），超过这个限制，则自动截断（若是form提交则提交按钮不起作用）。

2、firefox

firefox（火狐浏览器）的url长度限制为 65 536字符，但实际上有效的URL最大长度不少于100,000个字符。

3、chrome

chrome（谷歌）的url长度限制超过8182个字符返回本文开头时列出的错误。

4、Safari

Safari的url长度限制至少为 80 000 字符。

5、Opera

Opera 浏览器的url长度限制为190 000 字符。Opera 9 地址栏中输入190 000字符时依然能正常编辑。

服务器
1、Apache

Apache能接受url长度限制为8 192 字符

2、IIS

Microsoft Internet Information Server(IIS)能接受url长度限制为16 384个字符。
这个是可以通过修改的（IIS7）

```text
configuration/system.webServer/security/requestFiltering/requestLimits@maxQueryStringsetting.<requestLimits maxQueryString="length"/>
```

3、Perl HTTP::Daemon

Perl HTTP::Daemon 至少可以接受url长度限制为8000字符。Perl HTTP::Daemon中限制HTTP request headers的总长度不超过16 384字节(不包括post,file uploads等)。但当url超过8000字符时会返回413错误。
这个限制可以被修改，在Daemon.pm查找16×1024并更改成更大的值。

4、ngnix

可以通过修改配置来改变url请求串的url长度限制。

client_header_buffer_size 默认值：client_header_buffer_size 1k

large_client_header_buffers默认值 ：large_client_header_buffers 4 4k/8k

>由于jsonp跨域请求只能通过get请求，url长度根据浏览器及服务器的不同而有不同限制。
若要支持IE的话，url长度限制为2083字符，若是中文字符的话只有2083/9=231个字符。
若是Chrome浏览器支持的最大中文字符只有8182/9=909个。

三、参考文章
[GET请求中URL的最大长度限制总结](http://www.cnblogs.com/cuihongyu3503319/p/5892257.html)
[关于 HTTP GET/POST 请求参数长度最大值的一个理解误区](https://my.oschina.net/leejun2005/blog/136820)
