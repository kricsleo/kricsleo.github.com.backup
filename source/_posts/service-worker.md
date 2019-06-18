---
title: service-worker
date: 2018-11-04 21:32:46
subtitle: service-woerker
categories:
  - front-end
tags:
  - service-worker
---

# service-worker

service worker (服务工作线程)可以为网页提供离线访问的功能, 除此之外当然也有**推送通知**和**后台同步**的功能, 它是一种 JavaScript 线程, 可以独立在主线程外独立运行, 但是无法直接访问和操作 DOM , 服务工作线程通过响应 postMessage 接口发送的消息来与其控制的页面通信, 页面可在必要时对 DOM 执行操作.
<!-- more -->

- 使用前提
  网站必须是 https 的, 本地开发的话也可以使用 localhost 和 127.0.0.1
- 兼容性
  目前来说 IE 系列都不支持, Edge 从17开始支持, 其他PC段浏览器基本都没有太大问题, 移动端 IOS Safari 从11.4开始支持, 安卓浏览器从67(发布于2017.03)开始支持, QQ和UC等都已经支持. 一般来说在注册 service worker 之前可以先通过`'serviceWorker' in navigator`检查一下是否支持, 不支持则不进行注册.

## 注册 service worker

如果在页面加载完成之前就直接注册 service worker, 会影响到页面的加载过程, 所以推荐的做法是在`load`事件里面去注册

```JavaScript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }).catch(function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
```

需要注意的是 service worker 文件的位置决定了这个它能控制的页面和请求范围, 最多只能控制到本目录, 可以通过`scope`参数指定目录, 但是也不能高于所在目录, 所以经常会把这个文件直接放在根目录, 这样就可以控制到整个域下面的文件和请求.

chrome 里面可以通过[chrome://serviceworker-internals](chrome://serviceworker-internals)来查看已经开启的 service worker, 在控制台的 Application 里的 Servie Worker 也可以查看.

## 安装 service worker

页面在注册了 service worker 之后就可以到下一个生命周期`install`, 一般在这个生命周期里进行一些文件的缓存, 有如下三个过程:

1. 打开缓存
2. 缓存文件
3. 确认所需文件是否全部缓存成功

```JavaScript
const CACHE_NAME = 'my-site-cache-v1';
const urlsToCache = [
  '/',
  '/styles/main.css',
  '/script/main.js'
];

self.addEventListener('install', evt => {
  // Perform install steps
  evt.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});
```

`caches.open()`用来打开一个特定名称的缓存, 你可以理解为名称空间, 将要被缓存的文件都会被存在这个空间里面.
`cache.addAll()`用来缓存一个 url 列表的所有文件, 它会根据 url 创建对应的 request, 如果本地没有这个请求对应的 response, 那么就会发起请求拿到对应的 response, 然后以 requst 为键名, 对应的 response 为键值, 对响应数据进行缓存. 添加单个缓存 url 可使用`cache.add()`.
[`event.waitUntil()`](https://developer.mozilla.org/zh-CN/docs/Web/API/ExtendableEvent/waitUntil)用来延长一个事件的生命周期, 例如在上面的调用中, 它延迟将被安装的worker视为 installing ，直到传递的 Promise 被成功地resolve. 这主要用于确保：服务工作线程在所有依赖的核心cache被缓存之前都不会被安装. 如果有文件缓存失败, 那么本次安装就会失败, 之后会自动重试.

## 激活 service worker

当一个 service worker 被安装了以后在生命时间进入激活(activate)状态呢? 一般来说如果是首次加载此页面, 那么在安装`install`完成以后就会进入激活状态, 但是如果此页面之前被旧的 service worker 控制, 那么新的 service worker 会进入`waiting`状态, 等到此页面被关闭然后被重新打开的时候, 新的 servie worker 才会接管这个页面, 你也可以使用`skipWaiting()`使得新的 service worker 跳过`waiting`状态, 直接进入`activate`状态, 当新的 servie worker 进入`activate`状态以后, 如果页面是在新的 service worker 被激活之前就加载了的, 那么这个页面的请求仍然还不受 service worker 控制, 如果你希望之前打开或加载的页面也能收到新的 servie worker控制, 一种方式是你可以使用`clients.claim()`来使得新的 servie worker 控制还未受控制的页面, 另一种方式就是关闭并重新打开页面, 注意如果只是刷新本页面, 那么本页面仍然还是受原来的 service worker 控制的.

通过`navigator.serviceWorker.controller`(其将为`null`或一个服务工作线程实例)检测客户端是否受控制

## 缓存 fetch

当 service worker 被安装以后, service worker 就可以拦截 fetch 请求, 可以在这个时候返回缓存中的数据, 如果没有对应的缓存的话, 你可以手动发起这个请求, 然后将请求的结果返回给页面, 这里的作用相当于一个网络代理.

```JavaScript
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response.
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});
```

对所有的 fetch 请求进行拦截, 然后在缓存中搜索这个 request, 如果找到了, 那么就直接返回之前缓存的对应的 response, 如果没有找到, 那么就需要手动发起一个同样的请求, 注意 resquest 和 response 都是流对象, 只能读取一次, 所以在上面的代码中需要复制`clone()`这个流一份, 然后才能再次使用, 当获得返回数据的时候, 判断是正常响应的数据 `status === 200`然后就把这个数据缓存一份备用, 同时这个数据也会给浏览器一份作为响应.

## 更新 service worker

页面每次加载时都会下载一份 service worker 文件然后和以前的作对比, 如果发现不一样, 那么就会安装新的 service worker, 同时旧的不会被马上删除, 而是可以继续控制它已经控制的页面, 只是新打开的页面会被新的 service worker 接管, 当旧的页面全部都被关闭的时候, 旧的 service worker 就全面失效了, 新的 service worker 就是唯一的控制者了. 那么在新旧交替的一个时间, 新的 service worker 虽然已经安装完成, 且触发了 install 事件, 但是在旧的页面上会处于 waiting 状态, 如果希望新的 service worker 能够在安装后马上生效, 那么可以使用`skipWaiting()`来跳过 waiting 状态, 直接进入 activate 状态.

## 更新缓存

有时候我们希望能够更新缓存, 让页面能够取到最新的数据.

- 手动更新缓存的方法

```JavaScript
self.addEventListener('activate', function(event) {

  var cacheWhitelist = ['pages-cache-v1', 'blog-posts-cache-v1'];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

我们可以在 service worker 处于 activate 状态之后设置一份白名单, 然后遍历缓存, 凡是不是这个白名单里面的缓存都删除掉, 那就可以起到手动更新缓存的作用.

## 三大特性研究

参考文章: [【PWA学习与实践】(8)使用Service Worker进行后台同步 - Background Sync](https://juejin.im/post/5af80c336fb9a07aab29f19c)

1. 资源请求(fetch)
  这一点在上面的文件和请求缓存里面已经涉及到了.

2. 推送通知(push)
  推动通知(push)依赖`Notification API`和`PUSH API`, 目前来说这两个 API 的兼容性也不容乐观, 基本没法实用, 所以暂时不做多的讨论. 如果想要了解更多, 请查看上面的那篇文章.

3. 后台同步(sync)
  后台同步(sync)依赖于`Background Sync API`, 目前来说这个 API 的兼容惨不忍睹, 几乎只有 chrome 自家的产品支持. 所以在目前的阶段, 暂时不多去讨论后台同步这个部分. 可以查看上面那篇文章了解更多.

## 参考文档

[服务工作线程](https://developers.google.com/web/fundamentals/primers/service-workers/)
