---
title: http-2.0
date: 2018-11-16 17:00:58
subtitle: HTTP/2.0 笔记
categories:
  - front-end
  - http
tags:
  - HTTP/2.0
---

# 关于 HTTP/2.0

最近折腾了一段时间的 HTTP/2.0, 目前来说国内外很多大厂都已经用上了 HTTP/2.0, 部署起来也很容易, 这里关于协议的一些细节及部署过程做一个记录.
<!-- more -->
主要参考的是屈屈的博客 HTTP/2.0 系列文章: [HTTP/2 资料汇总](https://imququ.com/post/http2-resource.html)

## SPDY 和 HTTP/2.0

在 HTTP/2.0 标准正式推出之前, google 先实验性的推出了新的传输层协议 SPDY, 由于 SPDY 表现优异, 于是 google 慷慨的把这个协议提交到了 IETF, 之后 IETF 对这个标准进行了进一步的完善, 也改名叫做 HTTP/2.0. 所以你可以把 SPDY 看做 HTTP/2.0 的前身, 随着 HTTP/2.0 的正式标准化, SPDY 也就完成了它的历史使命, 逐渐在退出历史舞台.

**我们之前大多数使用的都是 HTTP/1.1, 那么在服务器和客户端交互的时候应该如何恰当的升级通信协议呢?**

首先 SPDY 是基于 SSL/TLS 的(也就是说如果要使用 SPDY, 那么就必须部署 HTTPS), 当服务器和浏览器在通过三次握手建立 TCP 连接之后, 下一步就要协商 SSL/TLS 加密协议的细节(版本, 算法和加密套件等), 在这个协商过程中就把 SPDY 协议的协商过程也加进去了, 为了协商 SPDY 协议谷歌开发了一个名为下一代协议协商`Next Protocol Negotiation(NPN)`的 SSL/TLS 扩展，用于在客户端连接服务器时协商是否采用 SPDY 协议。SPDY 协议是由 Web 服务器所实现支持的，而 NPN 则是由 OpenSSL 等 SSL 实现支持的。

由 SPDY 标准之后的 HTTP/2.0 协议在协商的过程也发生了一些变化, 由原来的 NPN 变为了应用层协议协商`Application-Layer Protocol Negotiation(ALPN)`, 他们的作用是相同的, 都是为了在建立连接的时候进行协议协商以便能够升级到 SPDY 或者 HTTP/2.0. 但是他们的做法有所不同而且是**不兼容的, 但是NPN 和 ALPN 可以并存，但是会客户端会优先选择 ALPN**

- 在协商协议的时候, NPN 是服务器发送所支持的协议列表，由客户端进行选择。而 ALPN 则是客户端发送该列表，由服务端选择.
- 在 NPN 中，最终的选择结果是在 Change Cipher Spec 之后发送给服务端的，也就是说是被加密了的。而在 ALPN 中，所有的协商都是明文的.

目前的**问题**是NPN 已经广泛地被 OpenSSL 支持，而 ALPN 则目前只有最新的 openssl-1.0.2 才支持, 而我们目前使用的几个主流 Linux 发行版的 OpenSSL 版本都还不支持 ALPN, 而同时这个 OpenSSL 是系统相当低层的库, 被众多的其他软件所依赖, 一般情况下没有谁会去升级这个库.

所以在之前很多网站想要享受更加优秀的网站加载速度采用的都是 SPDY 协议, 可是自从 Chrome 51 开始, 谷歌就去掉了对 SPDY 和对 NPN 的支持, 也就是说在这之后浏览器将无法使用 NPN 来和服务器协商进行协议的升级, 所以如果你的 Web 服务器使用的是 openssl-1.0.2 以下的版本，不支持 ALPN 协商，那么 Chrome 51 及以后版本就会以 HTTP/1 协议访问你的网站(当然其它的浏览器就不是这样了)。