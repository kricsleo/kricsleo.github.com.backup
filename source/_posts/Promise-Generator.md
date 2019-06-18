---
title: Promise-Generator
date: 2018-10-18 10:33:04
categories:
  - front-end
tags:
  - callback
  - promise
  - async
---

# 异步解决方案

本文是为了解js的异步操作解决方案发展过程. 从原始的回调地狱到ES6的`Promise`和`Generator`再到ES7提案阶段的`async`.
这篇笔记也拖了好久了, 该是时候丰富一下了.

<!-- more -->

## 回调地狱

我们之前会把异步的事件写在回调函数里面, 如果有一系列的异步事件, 并且这些事件是按照顺序触发的, 那么我们的代码最后的结构很可能就是回调里面放回调再放回调, 一层层往里面嵌套, 堪称'地狱'.

下面的部分中我会使用`setTimeout`来模拟异步操作

```JavaScript
function delay(fn, time = 1500) {
  setTimeout(() => {
    fn();
  }, time);
}

// 按序打印三个日志
delay(() => {
  console.log('step 1');
  delay(() => {
    console.log('step 2');
    delay(() => {
      console.log('step 3');
    })
  })
})
```

## `Promise`

为了避免回调地狱的代码横向发展, 社区最早提出和实现了`Promise`, 后来被 ES6 纳入了标准中, 使得代码从横向发展变成了链式的纵向发展. 通过`then()`来执行回调, 使得代码的逻辑变得清晰, 写法也更简洁. 关键点有四个个, `resolve`, `reject`, `then`和`catch`.

- `then`始终返回一个`Promise`, 如果返回值本身不是一个`Promise`的话那么会将其包装成一个`Promise`, 这样可以保证`then`的链式调用, 方便使用

- `catch`实际上是`then`的第二个参数的语法糖, 可以理解为`then(null, rejection)`的别名, 也就是说可以使用`catch`来省略`then`的第二个参数捕获错误的繁杂写法, 看起来更像是链式的调用. 同时`catch`也是始终返回一个`Promise`的

常见的写法如下:

```JavaScript
// 创建一个 Promise 对象
const promise = new Promise( (resolve, reject) => {
  // ... some code

  if (/* 异步操作成功 */){
    resolve(value);
  } else {
    // 异步操作失败
    reject(error);
  }
});

// 对这个 Promise 对象进行链式操作
promise.then(value => {
  // success
}, error => {
  // failure
}).catch(error => {
  // js error
});
```

我们使用`Promise`来改写上面的按序打印三个日志的方法

```js
function delayP(fn, time = 1500) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(fn());
    }, time)
  });
}

delayP(() => {
  console.log('step 1');
}).then(() => delayP(() => console.log('step 2')))
  .then(() => delayP(() => console.log('step 3')))
```

看起来是把代码的横向发展变成了纵向发展, 使得逻辑流程更易于理解一点, 但是这种方式感觉也并没有太优雅, 所以回调的写法还在继续进化

其他api:

- `Promise.all(iterable)` 参数为一个`Promise`数组, 返回值是一个`Promise`  
  当参数数组中的所有项都`resolve`或者有任何一项出现`reject`时, 返回值立刻执行`then`, `resolve`的时候接受到的参数也是一个数组, 每一项是`all()`里面的数组项对应的结果, `reject`的时候参数就是数组中最先`reject`的那一项的结果

```js
const step1 = delayP(() => console.log('step 1'));
const step2 = delayP(() => console.log('step 2'));
Promise.all([step1, step2])
  .then(values => console.log(values))
  .catch(err => console.log(err))
```

- `Promise.race(iterable)` 参数为一个`Promise`数组, 返回值是一个`Promise`  
  当参数数组中有任何一项执行结束, 返回值就立刻执行`then`, `resolve`和`reject`的参数都是最先执行结束的那个`Promise`的结果



注意上面两个api参数数组里面如果有某一项不是`Promise`, 那么会被包装成`Promise`, 类似`Promise.resolve()`

## `Generator`

`callback`, `Promise`, `Generator`和`async`的发展过程如下:

![js流程控制发展过程](https://static.cnodejs.org/FgKu20kvFqHrkgpjbQxXkV1DmrG1)

> Generator 函数有多种理解角度。语法上，首先可以把它理解成，Generator 函数是一个状态机，封装了多个内部状态。  
> 执行 Generator 函数会返回一个遍历器对象，也就是说，Generator 函数除了状态机，还是一个遍历器对象生成函数。返回的遍历器对象，可以依次遍历 Generator 函数内部的每一个状态。  
> 形式上，Generator 函数是一个普通函数，但是有两个特征。一是，function关键字与函数名之间有一个星号；二是，函数体内部使用yield表达式，定义不同的内部状态（yield在英语里的意思就是“产出”）

-- [Generator 函数的语法](http://es6.ruanyifeng.com/#docs/generator)

`Generator`函数最大的特点是可以通过`yeild`关键字来交出js的执行权, 从而可以让函数里面的内容在任意位置停下来, 交出执行权, 让函数外面的代码获得执行权, 等到该函数重新获得执行权的时候可以接着上次的断点继续执行. 

在这种交换执行权的过程中也可以传递数据, 调用用`next(arg)`括号里面的`arg`会被传递给函数内部, 在函数里相应的地方可以获取传进来的`arg`, 同时调用`next(arg)`会返回一个对象, 对象里面包含两个值`value`和`done`, `value`是函数中断点处向外传递的数据, `done`是`Boolean`型的值, 表示该函数是否已经执行完毕

`Generator`可以单独使用, 也可以和`Promise`配合起来使用, 每一个`yield`都会停止`Generator`函数的运行, 而每一次调用`next()`都可以让函数接着运行直到下一个`yield`处, 就像个懒人一样, 抽一鞭子才会动一下(鲁迅说的). 所以如果需要`Generator`函数自动运行直到函数结束的话一般会搭配上一个自动执行器函数, 通过自动执行器函数来让`Generator`函数每次一停下就接着又往下运行直到`done`为`true`函数运行才结束

(注意`Generator`并不是一定要搭配`Promise`一起用, 他们是分开的两个东西, 只不过都可以解决回调问题)

下面模拟该过程

```JavaScript
// 仍然使用上面的 delayP 函数 来定义一个 Generator 函数
function delayP(fn, time = 1500) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(fn());
    }, time)
  });
}
const generator = function* () {
  const step1 = yield delayP(() => console.log('step 1'));
  const step2 = yield delayP(() => console.log('step 2'));
  const step3 = yield delayP(() => console.log('step 3'));
  console.log('result: ', step1, step2, step3);
}

// 生成一个遍历器对象
const g = generator();
// 手动执行遍历
g.next().value
  .then(() => g.next('res1').value)
  .then(() => g.next('res2').value)
  .then(() => g.next('res3'))

// 自定义一个简单的自动执行器函数
function run(generator) {
  const g = generator();

  function next() {
    const res = g.next();
    console.log('res', res);
    if(res.done) {
      return;
    }
    res.value.then(() => next());
  }

  next();
}
// 使用自动执行器函数来自动执行
run(generator);
```

## async

ES7 里面引入了`async`让异步操作更为便捷, 目前来看这是最优雅的异步做法. 我们可以把`async`看做`Generator`的语法糖, 底层原理是一致的, 只不过在写法上更为简洁.
我们使用`async`来改写一下上面的按序打印三个日志的过程

参考: [与Promise血脉相连的async/await](https://juejin.im/post/5a9516885188257a6b061d72)

```js
// async函数写法
const asy = async function () {
  const step1 = await delayP(() => {
    console.log('step 1');
    return 'res1';
  });
  const step2 = await delayP(() => {
    console.log('step 2');
    return 'res2';
  });
  const step3 = await delayP(() => {
    console.log('step 3');
    return 'res3';
  });
  console.log('res:', step1, step2, step3);
}
// async函数的执行
asy()
```

从上面的比较可以看出, 从形式上来说是关键词不一样.

- `Generator`函数使用`*`来表示一个异步函数, `async`函数使用`async`来表示一个异步函数

- `Generator`函数使用`yield`来进行一个异步操作, `async`函数使用`await`来进行一个异步操作, 这两者后面也都可以是同步操作, 比如可以同步计算得到的值, 只不过`Generator`经常搭配使用的`co`模块约定，`yield`命令后面只能是`Thunk`函数或`Promise`对象

- `Generator`返回的是一个`iterator`对象, 需要使用`next()`来遍历执行, `async`函数返回的是一个`Promise`对象, 可以对返回值直接调用`then()`方法

- 在`async`里面的`await`会把后面的内容转成一个`Promise`(如果本身不是一个`Promise`的话), 然后自动获取`Promise`完成后的结果, 一旦有一个`await`后面的`Promise`出现了`reject`状态, 那么会直接返回这个`reject`的`Promise`, 后面的代码都不会执行了. 你可以使用`try/catch`来包裹可能出现`reject`的地方来让代码始终向下执行

从内部的工作过程来说, `Generator`函数没有自动执行的功能, 如果需要内部的异步步骤一步步执行, 那么你需要手动一步步调用`next()`方法来驱动异步的进行(我们也可以去实现一个自动执行器函数比如有名的[co](https://github.com/tj/co)模块来帮助我们完成一步步调用`next`这个过程). 而`async`函数简化了这个过程, 内置了执行器, 可以自动一步一步的按照顺序执行异步操作.

`async`用起来比`generator`更加简洁直接, 但是付出的代价就是没有`generator`灵活, 因为`await`只是单纯的把 promise resolve后的值原封不动的返回, 而`yield`则可以自己完全控制返回什么样的值, 这也就意味着使用`generator`可以在函数的执行过程中向函数内注入各种各样的值, 这带来了更多的可操作性.

我这里只是一叶障目, generator 有着更多的含义和用法. 在我能够完整的说个大概之前, 还是请参考一些别人的理解吧.

参考文章: [[译] Javascript（ES6）Generator 入门](https://juejin.im/post/5b4c22aa6fb9a04faf479be1)

```JavaScript
// 一个用于理解 generator 和 next()传参的问题

function* gen(i) {
  console.log(i);
  const j = 5 * (yield (i * 10));
  console.log(j);
  const k = yield (2 * k / 4);
  console.log(k);
  return i + j + k;
}

var g = gen(10);

console.log(g.next(20)); // {value: 100, done: false}
console.log(g.next(10)); // {value: 25, done: false}
console.log(g.next(5));  // {value: 65, done: true}


// test
const a = Promise.resolve(90);
const b = Promise.reject(78);
const c = Promise.reject(56);
Promise.all([a, b, c]).then(res => console.log(res))
  .catch(err => console.log(err));
```


