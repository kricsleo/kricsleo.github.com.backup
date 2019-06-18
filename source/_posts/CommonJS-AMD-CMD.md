---
title: CommonJS-AMD-CMD-ES6
date: 2018-09-25 16:49:17
categories:
    - front-end
tags:
    - 前端模块化
---

# JavaScript 模块化

远古时期, 我们写的 js 都是都是通过 script 标签进行管理, 这使得项目一旦复杂, 页面内便会写上成堆的 script 标签来引入各种外部 js 文件, 而且我们还需要保证 js 的顺序, 因为一个 js 文件内的方法往往依赖另外的 js 来实现, 我们通过确保书写顺序来确保 js 的加载顺序, 这当然是极不方便的, 后来前端工程师们就开始了尝试 js 模块化的探索之旅.
<!-- more -->

## 什么是模块化

> 在了解这些规范之前，还是先了解一下什么是模块化。
模块化是指在解决某一个复杂问题或者一系列的杂糅问题时，依照一种分类的思维把问题进行系统性的分解以之处理。模块化是一种处理复杂系统分解为代码结构更合理，可维护性更高的可管理的模块的方式。可以想象一个巨大的系统代码，被整合优化分割成逻辑性很强的模块时，对于软件是一种何等意义的存在。对于软件行业来说：解耦软件系统的复杂性，使得不管多么大的系统，也可以将管理，开发，维护变得“有理可循”。
还有一些对于模块化一些专业的定义为：模块化是软件系统的属性，这个系统被分解为一组高内聚，低耦合的模块。那么在理想状态下我们只需要完成自己部分的核心业务逻辑代码，其他方面的依赖可以通过直接加载被人已经写好模块进行使用即可。
首先，既然是模块化设计，那么作为一个模块化系统所必须的能力：
定义封装的模块。
定义新模块对其他模块的依赖。
可对其他模块的引入支持。
好了，思想有了，那么总要有点什么来建立一个模块化的规范制度吧，不然各式各样的模块加载方式只会将局搅得更为混乱。那么在JavaScript中出现了一些非传统模块开发方式的规范 CommonJS的模块规范，AMD（Asynchronous Module Definition），CMD（Common Module Definition）等。  --[文章](https://segmentfault.com/a/1190000004873947)

## CommonJS

CommmonsJS是同步加载模块的, 例如如下代码:

```javascript
// foobar.js
// 私有变量
var test = 123;

// 公有方法
function foobar () {
    this.foo = function () {
        // do someing ...
    }
    this.bar = function () {
        //do someing ...
    }
}

// exports对象上的方法和变量是公有的
var foobar = new foobar();
exports.foobar = foobar;
```

```javascript
// test.js
// require方法默认读取js文件，所以可以省略js后缀
var test = require('./boobar').foobar;

test.bar();
```

CommonJS规定一个单独的 js 文件就是一个模块, 在 js 文件中引入其他的模块需使用关键字`require`, 例如`require('./a')`, 该方法会根据读取这个文件然后返回这个文件内部的`exports`对象, 文件内需要导出的东西使用关键字`exports`, 例如`exports.foobar = foobar`, 需要注意的是CommonJS 是同步加载模块的, 也就是说会在模块加载完毕之后再去执行接下里的代码, 会阻塞 js 的线程, 对于像 Node.js 这样的服务端, 因为各个模块文件都存在本地硬盘上, 加载起来很快, 所以阻塞的时间很短, 属于可以接受的程度, 但是对于浏览器端, 需要通过网络下载下来各个依赖文件, 这个阻塞的时间就比较长了, 所以 CommonJS一般用在 Node.js 中, 同时也因为 Node.js 发扬光大.

那么在浏览器端为了实现异步加载模块, 就产生了 AMD 和 CMD 解决方案.

## AMD

AMD 全称是"Asynchronous Module Definition", 中文名是"异步模块定义"

### AMD 定义模块

AMD 定义了一个简洁实用的 api, `define(id, dependencies?, factory)`;
第一个参数`id`为字符串类型, 表示模块标志, 为可选参数, 如果不存在则模块标识应该默认定义为在加载器中被请求脚本的标识。如果存在，那么模块标识必须为顶层的或者一个绝对的标识。
第二个参数`dependencies`为数组类型, 表示当前模块所依赖的模块的模块标识.
第三个参数`factory`是一个需要实例化的函数或者一个对象.

可以使用这个 api 进行灵活的模块定义:

- 定义无依赖的模块

```javascript
define( {
    add : function( x, y ){
        return x + y ;
    }
} );
```

- 定义有依赖的模块

```JavaScript
define(['alpha'], function(alpha) {
    return {
        verb: function() {
            return alpha.verb() + 1;
        }
    }
});
```

- 定义数据对象模块

```javascript
define({
    users: [],
    members: []
});
```

- 具名模块

```JavaScript
define('alpha', ['require', 'exports', 'beta'], function(require, exports, beta) {
    exports.verb = function() {
        return beta.verb();

        // or
        // return require('beta').verb();
    }
});
```

- 包装模块

```javascript
define(function(require, exports, module) {
    var a = require('a');
    exports.action = function() {}
});
```

除了define外，AMD 还保留一个关键字`require`. `require` 作为规范保留的全局标识符，可以实现为 `module loader`，也可以不实现。
AMD模式可以用于浏览器环境并且允许非同步加载模块，也可以按需动态加载模块。

### AMD 使用模块

api: `require(dependencies, callback);`
第一个参数`dependencies`为数组类型, 里面是当前回调函数需要依赖的模块
第二个参数`callback`为回调函数, 当依赖加载完毕之后会执行这个回调函数, 函数的参数就是所加载的模块, 可在函数中使用
例如:

```JavaScript
require(['math'], function(math)) {
    math.add(2, 3);
});
```

### AMD 规范的实现者 RequireJS

RequireJS 是一个前端的模块化管理的工具库，遵循AMD规范，它的作者就是AMD规范的创始人 James Burke。所以说RequireJS是对AMD规范的阐述一点也不为过。

RequireJS的思想是通过一个函数将所有需要的或者依赖的模块加载进来, 然后返回一个新的函数(或者模块), 我们所有关于新模块的业务代码都在这个函数里面进行, 其内部也可以无限制的使用已经加载进来的模块.

```JavaScript
<script data-main='scripts/main' src='scripts/require.js'></script>
```

那么scripts下的main.js则是指定的主代码脚本文件，所有的依赖模块代码文件都将从该文件开始异步加载进入执行。RequireJS 的定义`define`和使用`require`都与之前说的 AMD 规范一致.

## CMD

[CMD 规范](https://github.com/seajs/seajs/issues/242)
[seajs](https://seajs.github.io/seajs/docs/#docs)

CMD是SeaJS 在推广过程中对模块定义的规范化产出, 特点有如下两点:

- 对于依赖的模块, AMD 是提前执行, 而 CMD 是延迟执行. (不过RequireJS从2.0开始，也改成可以延迟执行, 根据写法不同，处理方式不同.)
- AMD 推崇依赖前置, CMD 推崇依赖就近

对比:

```JavaScript
// AMD
define(['./a', './b'], function() {

    // 依赖一开始就写好
    a.test();
    b.test();
});

// CMD
define(function(require, exports, module) {

    // 依赖就近
    var a = require('./a');
    a.test();

    // 软依赖
    if(status) {
        var b = require('./b');
        b.test();
    }

})
```

AMD也支持 CMD 的写法, 但依赖前置是官方的推荐做法
AMD 的 api 是一个当多个用, CMD 严格的区分推崇职责单一, 例如 AMD 里面的require 分为全局的和局部的, 但是 CMD 里面没有全局的 require, 提供 seajs.use()来实现模块系统的加载启动.

## UMD

UMD 是 CommonJS 和 AMD 的融合.

AMD模块以浏览器第一的原则发展，异步加载模块。
CommonJS模块以服务器第一原则发展，选择同步加载，它的模块无需包装(unwrapped modules)。
这迫使人们又想出另一个更通用的模式UMD （Universal Module Definition）。希望解决跨平台的解决方案。

UMD先判断是否支持Node.js的模块（exports）是否存在，存在则使用Node.js模块模式。
在判断是否支持AMD（define是否存在），存在则使用AMD方式加载模块。

判断过程如下:

```JavaScript
(function(window, factory) {
    if(typeof exports = 'object') {
        module.exports = factory();
    } else if(typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        window.eventUtil = factory();
    }
})(this, function(){
    // module...
})
```

## ES6 模块化

经历了那么多探索以后, ES6终于在语言层面引入了模块化, 旨在成为服务端和浏览器端通用的解决方案, 模块功能主要由两个命令构成, `export`和`import`, `export`命令用于规定模块的对外接口，`import`命令用于输入其他模块提供的功能。

```JavaScript
// 定义模块 module.js
let basicNum = 0;
const add = funtion(a, b) {
    return a + b;
}
export { basicNum, add};

// 引入模块
import { basicNum, add } from './module';
function foo() {
    return add(2, basicNum);
}
```

这种引入方式你需要知道模块内部导出的内容的具体名字, 在你引入的时候需要一字不差的对应上名字, 有很多时候我们并不想去模块内部查看它到底是用的什么名字, 这个时候 ES6 贴心的为我们额外提供了一个`export default`, 为模块指定一个默认输出, 对应的`import`不需要使用大括号, 这更加接近AMD 的引用写法.

```JavaScript
// 定义模块 module.js
let basicNum = 0;
const add = funtion(a, b) {
    return a + b;
}
export default { basicNum, add };

// 引入模块
import module from './module';
function foo() {
    return module.add(2, module.basicNum);
}
```

需要注意的是ES6的模块不是对象, 它的`import`会被 JavaScript 引擎静态分析, 在编译的时候就引入模块代码, 而不是在运行的时候加载, 所以也就无法实现条件加载. 但是好处是这使得对代码进行静态分析成为可能.

## ES6模块与 CommonJS 的差异

- **CommonJS 输出的是一个值得拷贝, ES6输出的是一个值的引用**

CommonJS 输出的是一个值的拷贝, 也就是说一旦已经输出, 那么模块内部之后再发生变动也不会影响这个已经输出的值.
ES6的运行机制和 CommonJS 不一样, 当 js 引擎在进行静态分析的时候如果发现`import`那么就会生成一个对应模块的只读引用, 只有在运行的时候才根据这个引用到对应的模块去取值。 换句话说，ES6 的import有点像 Unix 系统的“符号连接”，原始值变了，import加载的值也会跟着变。因此，ES6 模块是动态引用，并且不会缓存值，模块里面的变量绑定其所在的模块。

- **CommonJS 是运行时加载, ES6是编译时输出接口**

运行时加载: CommonJS模块是对象, 即在输入时先加载整个模块, 生成一个对象, 然后再从这个对象上面读取方法, 这种加载称为'运行时加载'

编译时加载: ES6模块不是对象, 而是通过`export`命令显示指定输出的代码, `import`时采取静态命令的形式, 即在`import`时指定加载某个值, 而不是加载整个模块, 这种加载称为'编译时加载'.

## 参考文章

[玉伯的回答](https://github.com/seajs/seajs/issues/588)
[模块化七日谈](https//huangxuan.me/js-module-7day/#/)
[我是豆腐不是渣的文章](https://segmentfault.com/a/1190000004873947)