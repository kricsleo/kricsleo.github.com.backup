---
title: Content-Type
date: 2018-10-12 10:32:51
categories: 
  - http
tags:
  - Content-Type
---

# Content-Type

`HTTP/1.1`协议规定的`HTTP`请求方法有`OPTIONS`、`GET`、`HEAD`、`POST`、`PUT`、`DELETE`、`TRACE`、`CONNECT`这几种, 用的最多的是`GET`和`POST`, 这里主要说一下提交请求时的请求头中`Content-Type`字段
<!-- more -->

## `http`请求结构

`http`请求分为三个部分: 状态行, 请求头和消息主体, 结构如下:

```text
<method> <request url> <version>
<headers>

<entity-body>
```

## Content-Type类型

`Content-Type`有如下常见的类型:

- `text/plain`: 文本类型
- `text/html`: html文件类型
- `text/css`: css文件类型
- `text/javascript`: javascript文件类型
- `application/x-www-form-urlencoded` POST讨论
- `multipart/form-data` POST讨论
- `application/json` POST讨论
- `text/xml` POST中讨论

由于`GET`方式的数据实际上是以`QueryString`的方式放在`<request url>`中的(非ASCII字符会被转码), 例如'<https://www.example.com?key1=value1&key2=value2>', 所以对`GET`讨论`Content-Type`没有意义

`http`协议规定`POST`提交的数据必须放在消息主体（entity-body）中，但协议并没有规定数据必须使用什么编码方式。实际上，开发者完全可以自己决定消息主体的格式，只要最后发送的`HTTP`请求满足上面的格式就可以。

服务端通常是根据请求头（headers）中的`Content-Type`字段来获知请求中的消息主体是用何种方式编码，再对主体进行解析。所以有必要了解`Content-Type`的内容. 目前在`POST`请求中所使用的`Content-Type`主要有如下四种类型: `application/x-www-urlencoded`, `multipart/form-data`, `application/json`, `text/xml`, 下面详细说一下这四种类型.

### `application/x-www-urlencoded`

这应该是最常见的`POST`提交数据的方式了。浏览器的原生`<form>`表单，如果不设置`enctype`属性，那么默认就会以这种方式提交数据。这种方式会将表单中的数据按照`key1=value1&key2=value2`的形式连接成字符串, 同时会将出现的非`ASCII`字符进行编码, 编码方式可以参考`encodeURIComponent()`函数, 例如下面这个表单提交时的数据结构:

```text
POST http://www.example.com HTTP/1.1
Content-Type: application/x-www-form-urlencoded;charset=utf-8

title=test&sub%5B%5D=1&sub%5B%5D=2&sub%5B%5D=3
```

但是需要注意的是这是在`<form>`表单中没有`type=file`形内容的时候的提交方式, 如果表单中有二进制内容需要提交, 比如文件或者图片等, 那么就无法使用`application/x-www-urlencoded`方式, 需要转而使用下面会谈到的`multipart/form-data`方式.

### `multipart/form-data`

当需要提交二进制数据如文件或者图片时就需要使用这种`multipart/form-data`, 一个常见的提交内容结构如下: 

```text
POST http://www.example.com HTTP/1.1
Content-Type:multipart/form-data; boundary=----WebKitFormBoundaryrGKCBY7qhFd3TrwA

------WebKitFormBoundaryrGKCBY7qhFd3TrwA
Content-Disposition: form-data; name="text"

title
------WebKitFormBoundaryrGKCBY7qhFd3TrwA
Content-Disposition: form-data; name="file"; filename="chrome.png"
Content-Type: image/png

PNG ... content of chrome.png ...
------WebKitFormBoundaryrGKCBY7qhFd3TrwA--
```

请求头中的`boundary`代表将使用后面这一长串的字符串来分隔不同的字段, 消息主体里按照字段个数又分为多个结构类似的部分，每部分都是以`--boundary`开始，紧接着是内容描述信息，然后是回车，最后是字段具体内容（文本或二进制）。如果传输的是文件，还要包含文件名和文件类型信息。消息主体最后以`--boundary--`标示结束, 关于`multipart/form-data`的详细定义，请前往[rfc1867](http://www.ietf.org/rfc/rfc1867.txt)查看。

`application/x-www-urlencoded`和`multipart/form-data`都是浏览器原生支持的，而且现阶段标准中原生`<form>`表单也只支持这两种方式（通过`<form>`元素的`enctype`属性指定，默认为 application/x-www-form-urlencoded。其实`enctype`还支持`text/plain`，不过用得非常少）。

下面提到的`Content-Type`属于随着技术的发展, 我们自定义出来的新的数据提交方式, 更为便捷.

### `application/json`

因为`json`格式数据的读写性非常好, 用的也极为广泛, 所以`application/json`这个请求头也用的越来越多, 这个请求头就是告诉服务器发送的数据是序列化后的`json`字符串, 现在在做的`Vue`项目中用到的`Axios`所使用的默认就是`application/json`, 这里有一个问题就是Axios全局设置`Content-Type`为`application/x-www-urlencoded`不生效, 需要在请求发出前拦截方法中修改配置才能生效, 不知道是不是bug, 如下:

```JavaScript
function _interceptorRequest(config) {
  config.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8';
  return config
}
```

使用`application/json`方式发送的数据结构类似下面这个: 

```text
POST http://www.example.com HTTP/1.1 
Content-Type: application/json;charset=utf-8

{"title":"test","sub":[1,2,3]}
```

`json`格式可以提交结构复杂的数据,在抓包工具或者调试中查看起来也很方便, 尤其适合`RESEful`的接口, 需要注意的是不论我们使用`application/x-www-urlencoded`还是`application/json`都要注意和服务器相配合, 因为毕竟我们发送的数据是希望服务器来正确接收和处理的, 如果客户端设置的`Content-Type`与服务端期望接收的`Content-Type`不一致就很有可能导致服务器无妨正常处理这个请求.

### text/xml

这是一种使用`HTTP`作为传输协议，`XML`作为编码方式的远程调用规范, 典型的`XML-RPC`请求如下: 

```text
POST http://www.example.com HTTP/1.1
Content-Type: text/xml

<?xml version="1.0"?>
<methodCall>
    <methodName>examples.getStateName</methodName>
    <params>
        <param>
            <value><i4>41</i4></value>
        </param>
    </params>
</methodCall>
```

`XML-RPC`协议简单、功能够用，各种语言的实现都有。它的使用也很广泛，如`WordPress`的`XML-RPC`Api，搜索引擎的`ping`服务等等。`JavaScript`中，也有现成的库支持以这种方式进行数据交互，能很好的支持已有的 `XML-RPC`服务。

## 参考文章

- [四种常见的POST提交数据方式](https://imququ.com/post/four-ways-to-post-data-in-http.html)
- [HTTP Header之Content-Type](https://www.chenshaowen.com/blog/content-type-http-header.html)
