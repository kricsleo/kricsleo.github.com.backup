---
title: Proxy
date: 2019-01-17 18:50:49
subtitle: ES6的新特性-Proxy(代理)
categories:
  - front-end
tags:
  - ES6
---

# 拥抱ES6中的新API--Proxy

ES6带来了很多新的方便易用的API, Proxy(代理)就是其中之一, 意思可以理解为对象的代理, 实际上是一个构造函数, 通过这个构造函数我们可以对某个对象进行包装, 然后返回一个新的对象, 然后我们所有对原对象的操作都可以转移到这个新的对象上, 并且我们的操作过程是可以被拦截和过滤的, 这就类似于你请的律师一样, 他会为你处理你的事情, 并在处理的过程中进行一些你设定好的操作, 称为代理.
<!-- more -->

## 它的产生

我之前探索过`Object.defineProperty()`这个API, 这个API通过定义对象的属性的`get`和`set`存取描述符也可以在想要操作这个对象的时候捕捉到那些行为, 与 Proxy 非常类似, 不过 Proxy 可以认为是前者的升级版, 前者在ES5中就已经有了, 所以低版本的浏览器或者老旧的IE也可以使用, 其中Vue2.0及以下就是使用的`Object.defineProperty()`来实现的数据双向绑定, 所以可以兼容低版本的浏览器, 不过 Proxy 是在ES6中新引入的, 功能比前者更全面, 能够解决之前解决不了的部分属性变化的拦截问题, Vue作者本人尤雨溪在最近的一次演讲中表示, 今年下半年将会推出的Vue3.0中将使用 Proxy 来代替之前的`Object.defineProperty()`, 这样新的Vue3.0也就无法兼容低版本和IE浏览器(而且这个兼容性问题无法使用polyfill来弥补), 关于二者的详细区别, 也可以参考掘金的这篇文章[vue3.0 尝鲜 -- 摒弃 Object.defineProperty，基于 Proxy 的观察者机制探索](https://juejin.im/post/5bf3e632e51d452baa5f7375).

## 使用

- 基本语法:

```js
const p = new Proxy(target, handler);
```

- 参数说明:

  - target: 用Proxy包装的目标对象（可以是任何类型的对象，包括原生数组，函数，甚至是另一个代理.

  - handler: 一个对象，其属性是当执行一个操作时定义代理的行为的函数.

- 使用示例:

```js
const handler = {
  get(target, prop) {
    console.log(`getting ${prop}`);
    return prop in target ? target[prop] : 200;
  },
  set(target, prop, value) {
    console.log(`setting ${prop} to ${value}`);
    target[prop] = value;
  }
};

const t = {};

const p = new Proxy(t, handler);

p.name = 'krics'; // => setting name to krics

p.name; // => getting name

t; // => {name: 'krics'}
```

- 发生了什么

`p`是对`t`对象进行包装过后的代理对象, 当我们给`p`设置新属性的时候, 在代理对象内部会调用`handler`中的`set`函数, 将新属性设置给`t`对象, 当我们需要获取`p`的某个属性的时候, 就会调用`handler`中的`get`函数, 然后返回对应的值, 感觉起来就好像我们是在操作`t`对象一样, 这里面可以挖掘出更大的潜力的就是`console.log()`这段代码, 我们在实际情况中可以在这个地方进行任意的处理, 比如执行一个函数, 或者通知消息订阅者这里的数据发生了变化, 然后去更新视图等等.

- 数据双向绑定示例

我拿一个简单的输入框输入文字, 然后页面上同步显示出我输入的文字作为示例

```js

// html content
// <input type="text" class="input" />
// <p class="text"></p>

const Text = document.getElementsByClassName('text')[0];
const Input = document.getElementsByClassName('input')[0];

const p = new Proxy({}, {
  set(target, prop, value) {
    Text.innerHTML = value;
    target[prop] = value;
  }
});

Input.addEventListener('input', e => {
  const { target: { value } } = e;
  p.text = value;
});
```

## 关于`Reflect`

在看Proxy相关的内容的时候看到了`Reflect`这个同样在ES6中引入的对象, 而且在js之后的发展中这个对象上将会部署越来越多的方法, 比如
> 将Object对象的一些明显属于语言内部的方法（比如Object.defineProperty），放到Reflect对象上。现阶段，某些方法同时在Object和Reflect对象上部署，未来的新方法将只部署在Reflect对象上。也就是说，从Reflect对象上可以拿到语言内部的方法。
> 修改某些Object方法的返回结果，让其变得更合理。比如，Object.defineProperty(obj, name, desc)在无法定义属性时，会抛出一个错误，而Reflect.defineProperty(obj, name, desc)则会返回false。
> 让Object操作都变成函数行为。某些Object操作是命令式，比如name in obj和delete obj[name]，而Reflect.has(obj, name)和Reflect.deleteProperty(obj, name)让它们变成了函数行为。
> Reflect对象的方法与Proxy对象的方法一一对应，只要是Proxy对象的方法，就能在Reflect对象上找到对应的方法。这就让Proxy对象可以方便地调用对应的Reflect方法，完成默认行为，作为修改行为的基础。也就是说，不管Proxy怎么修改默认行为，你总可以在Reflect上获取默认行为。
更详细的内容可以参考[这里](http://es6.ruanyifeng.com/?search=proxy&x=0&y=0#docs/reflect)

之所以在这里说起这个新的对象, 是因为`Reflect`和Proxy搭配起来使用非常方便(例如上面说的第四点)

我们可以把之前写过的Proxy使用的代码里面的`handler`部分改一点东西, 让它更加合理

```js
const handler = {
  get(target, prop, receiver) {
    console.log(`getting ${prop}`);
    return Reflect.get(target, prop, receiver);
  },
  set(target, prop, value, receiver) {
    console.log(`setting ${prop} to ${value}`);
    return Reflect.set(target, prop, value, receiver);
  }
};
```

与之前的代码的区别是我们不再自己实现获取属性的值或者设置属性的值的方法, 转而调用原生的默认的`get`和`set`来完成操作, 更加可靠.
关于`Reflect`的API, 可以参见下面.

需要说明的是关于上面使用的`Reflect.get`和`Reflect.set`中的第三个参数`receiver`, 这个参数是一个可选项, 代表`this`的指向(即上下文), 传入一个对象之后, 内部的操作如果用到`this`, 那么将会使用传入的`receiver`对象.

### `Reflect`上已经部署的方法

目前已经部署了13个, 未来会有更多.

- Reflect.apply(target, thisArg, args)
- Reflect.construct(target, args)
- Reflect.get(target, name, receiver)
- Reflect.set(target, name, value, receiver)
- Reflect.defineProperty(target, name, desc)
- Reflect.deleteProperty(target, name)
- Reflect.has(target, name)
- Reflect.ownKeys(target)
- Reflect.isExtensible(target)
- Reflect.preventExtensions(target)
- Reflect.getOwnPropertyDescriptor(target, name)
- Reflect.getPrototypeOf(target)
- Reflect.setPrototypeOf(target, prototype)

### 对比`Object.defineProperty()`

`Object.defineProperty()`每次只能劫持一个属性, 如果一个对象里面有多个属性需要劫持, 那么就需要不断的循环来重复处理所有需要劫持的属性, 另外如果对象后期新增了属性, 那么新增的属性是不会被自动劫持的, 这也就是为什么在`Vue`中我们需要把进行双向绑定的属性提前定义好, 因为后面新写入的属性, `Vue`是没法自动去进行劫持绑定的(需要手动调用`Vue`提供的函数进行处理), 但是`Proxy`就没有这些缺点, 因为他是一次劫持整个对象, 那么对象中的属性自然也会被一次性都劫持, 而且对于新增的属性, 因为也同样属于这个对象, 那么也自然会被劫持, 使用起来方便了很多. `Proxy`的缺点目前来说很明显, 就是无法磨平的兼容性.

## 参考资料

- [vue3.0 尝鲜 -- 摒弃 Object.defineProperty，基于 Proxy 的观察者机制探索](https://juejin.im/post/5bf3e632e51d452baa5f7375)
- [面试官: 实现双向绑定Proxy比defineproperty优劣如何?](https://juejin.im/post/5acd0c8a6fb9a028da7cdfaf)
- [记一次思否问答的问题思考：Vue为什么不能检测数组变动](https://segmentfault.com/a/1190000015783546)
- [Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- [MDN-Reflect](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect)
- [ECMAScript 6 入门-Reflect](http://es6.ruanyifeng.com/?search=proxy&x=0&y=0#docs/reflect)
