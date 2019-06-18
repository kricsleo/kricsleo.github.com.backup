---
title: Airbnb-JavaScript-Style-Guide
subtitle: Airbnb 代码规范阅读笔记
date: 2018-09-05 09:55:28
tags:
    - codeStyle
---

# Airbnb JavaScript Style Guide 阅读笔记
Airbnb的JavaScript代码风格是世界上最流行的JavaScript代码风格之一, 在阅读的时候结合我自己的使用经验记录如下重点, 日后多次阅读应该会持续更新.
在线阅读地址: https://github.com/airbnb/javascript
(中文翻译版: https://github.com/yuche/javascript)

<!-- more -->

## 对象
1. 使用字面值创建对象
```javascript
// bad
const item = new Object();

// good
const item = {};
```
2. 使用对象方法的简写
```javascript
// bad
const atom = {
  value: 1,

  addValue: function (value) {
    return atom.value + value;
  },
};

// good
const atom = {
  value: 1,

  addValue(value) {
    return atom.value + value;
  },
};
```
##  数组
1. 使用字面值创建数组
```javascript
// bad
const items = new Array();

// good
const items = [];
```
2. 使用扩展运算符`...`复制数组
```JavaScript
// bad
const len = items.length;
const itemsCopy = [];
let i;

for (i = 0; i < len; i++) {
  itemsCopy[i] = items[i];
}

// good
const itemsCopy = [...items];
```
3. 使用Array#from把类数组对象转为数组
```JavaScript
const foo = document.querySelectorAll('.foo');
const nodes = Array.from(foo);
```
## 解构
1. 使用解构存取和使用多属性对象
```JavaScript
// bad
function getFullName(user) {
  const firstName = user.firstName;
  const lastName = user.lastName;

  return `${firstName} ${lastName}`;
}

// good
function getFullName(obj) {
  const { firstName, lastName } = obj;
  return `${firstName} ${lastName}`;
}

// best
function getFullName({ firstName, lastName }) {
  return `${firstName} ${lastName}`;
}
```
2. 对数组使用解构赋值
```JavaScript
const arr = [1, 2, 3, 4];

// bad
const first = arr[0];
const second = arr[1];

// good
const [first, second] = arr;
```
3. 回传对个对象时, 使用对象解构, 而不是数组解构
> 为什么？增加属性或者改变排序不会改变调用时的位置。
```JavaScript
// bad
function processInput(input) {
  // then a miracle occurs
  return [left, right, top, bottom];
}

// 调用时需要考虑回调数据的顺序。
const [left, __, top] = processInput(input);

// good
function processInput(input) {
  // then a miracle occurs
  return { left, right, top, bottom };
}

// 调用时只选择需要的数据
const { left, right } = processInput(input);
```
## 字符串
1. 程序化生成字符串时使用模板字符串代替字符串连接
> 模板字符串更简洁, 根据可读性
```JavaScript
// bad
function sayHi(name) {
  return 'How are you, ' + name + '?';
}

// bad
function sayHi(name) {
  return ['How are you, ', name, '?'].join();
}

// good
function sayHi(name) {
  return `How are you, ${name}?`;
```
## 函数
1. 使用函数声明代替函数表达式
> 因为函数声明是可命名的, 所以他们在调用栈中更容易被识别. 
> 此外函数声明会把整个函数提升(hoisted), 而函数表达式只会把函数的引用变量名提升. 这条规则是的箭头函数可以取代函数表达式.
```JavaScript
// bad
const foo = function () {
};

// good
function foo() {
}
```
2. 函数表达式
```JavaScript
// 立即调用的函数表达式(IIFE)
(() => {
    console.log('welcome!')
})()
```
3. 不要使用`arguments`。可以选择`rest`语法`...`替代
```JavaScript
// bad
function concatenateAll() {
  const args = Array.prototype.slice.call(arguments);
  return args.join('');
}

// good
function concatenateAll(...args) {
  return args.join('');
}
```
4. 直接给函数的参数指定默认值，不要使用一个变化的函数参数。
```JavaScript
// really bad
function handleThings(opts) {
  // 不！我们不应该改变函数参数。
  // 更加糟糕: 如果参数 opts 是 false 的话，它就会被设定为一个对象。
  // 但这样的写法会造成一些 Bugs。
  //（译注：例如当 opts 被赋值为空字符串，opts 仍然会被下一行代码设定为一个空对象。）
  opts = opts || {};
  // ...
}

// still bad
function handleThings(opts) {
  if (opts === void 0) {
    opts = {};
  }
  // ...
}

// good
function handleThings(opts = {}) {
  // ...
}
```
## 构造器
1. 总是使用`class`, 避免使用`prototype`
> 因为`class`语法更易读
```JavaScript
// bad
function Queen(contents = []) {
    this._quene = [...contents];
}
Quene.prototype.pop = function() {
    const value = this._quene[0];
    this._quene.splice(0, 1);
    return value;
}

// good
class Queen {
    constructor(contents = []) {
        this._quene = [...contents];
    }
    pop() {
        const value = this._quene[0];
        this._quene.splice(0, 1);
        return value;
    }
}
```
## Iterators and Generators
1. 不要使用`iterators`, 使用高阶函数如`map`或者`reduce`来代替`for-of`
```JavaScript
const numbers = [1, 2, 3, 4, 5];

// bad
let sum = 0;
for (let num of numbers) {
  sum += num;
}

sum === 15;

// good
let sum = 0;
numbers.forEach((num) => sum += num);
sum === 15

// best (use the functional force)
const sum = numbers.reduce((total, num) => total += num, 0)
sum === 15
```
## 比较运算符和等号
条件表达式例如 if 语句通过抽象方法`ToBoolean`强制计算它们的表达式并且总是遵守下面的规则：
- 对象 被计算为 true
- Undefined 被计算为 false
- Null 被计算为 false
- 布尔值 被计算为 布尔的值
- 数字 如果是 +0、-0、或 NaN 被计算为 false, 否则为 true
- 字符串 如果是空字符串 '' 被计算为 false，否则为 true
## 注释
1. 给注释增加 FIXME 或 TODO 的前缀可以帮助其他开发者快速了解这是一个需要复查的问题，或是给需要实现的功能提供一个解决方式。这将有别于常见的注释，因为它们是可操作的。使用 FIXME -- need to figure this out 或者 TODO -- need to implement。
```JavaScript
class Calculator {
  constructor() {
    // FIXME: shouldn't use a global here
    total = 0;
  }
}

class Calculator {
  constructor() {
    // TODO: total should be configurable by an options param
    this.total = 0;
  }
}
```
## 空白
1. 使用2个空格作为缩进。
2. 在文件末尾插入一个空行。
## 逗号
1. 增加结尾的逗号: 需要。
> `JavaScript`支持这种做法,并且会自动处理结尾多余的逗号, 好处是会让git diff更干净, 新增字段更方便.
> 另外，像 babel 这样的转译器会移除结尾多余的逗号，也就是说你不必担心老旧浏览器的尾逗号问题。
```JavaScript
// bad - git diff without trailing comma
const hero = {
     firstName: 'Florence',
-    lastName: 'Nightingale'
+    lastName: 'Nightingale',
+    inventorOf: ['coxcomb graph', 'modern nursing']
}

// good - git diff with trailing comma
const hero = {
     firstName: 'Florence',
     lastName: 'Nightingale',
+    inventorOf: ['coxcomb chart', 'modern nursing'],
}

// bad
const hero = {
  firstName: 'Dana',
  lastName: 'Scully'
};

const heroes = [
  'Batman',
  'Superman'
];

// good
const hero = {
  firstName: 'Dana',
  lastName: 'Scully',
};

const heroes = [
  'Batman',
  'Superman',
];
```
## 类型转换
1. 字符串
```JavaScript
//  => this.reviewScore = 9;

// bad
const totalScore = this.reviewScore + '';

// good
const totalScore = String(this.reviewScore);
```
2. 如果因为某些原因 parseInt 成为你所做的事的瓶颈而需要使用位操作解决性能问题时，留个注释说清楚原因和你的目的。
```JavaScript
// good
/**
 * 使用 parseInt 导致我的程序变慢，
 * 改成使用位操作转换数字快多了。
 */
const val = inputValue >> 0;
```
## 命名规则
1. 别保存`this`的引用。使用箭头函数或`Function#bind`。
```JavaScript
// bad
function foo() {
  const self = this;
  return function() {
    console.log(self);
  };
}

// bad
function foo() {
  const that = this;
  return function() {
    console.log(that);
  };
}

// good
function foo() {
  return () => {
    console.log(this);
  };
}
```
2. 如果你的文件只输出一个类，那你的文件名必须和类名完全保持一致。
```JavaScript
// file contents
class CheckBox {
  // ...
}
export default CheckBox;

// in some other file
// bad
import CheckBox from './checkBox';

// bad
import CheckBox from './check_box';

// good
import CheckBox from './CheckBox';
```
3. 当你导出默认的函数时使用驼峰式命名。你的文件名必须和函数名完全保持一致。
```JavaScript
function makeStyleGuide() {
}

export default makeStyleGuide;
```
4. 当你导出单例、函数库、空对象时使用帕斯卡式命名。
```JavaScript
const AirbnbStyleGuide = {
  es6: {
  }
};

export default AirbnbStyleGuide;
```
## 事件
1. 当给事件附加数据时（无论是 DOM 事件还是私有事件），传入一个哈希而不是原始值。这样可以让后面的贡献者增加更多数据到事件数据而无需找出并更新事件的每一个处理器。
```JavaScript
// bad
$(this).trigger('listingUpdated', listing.id);

...

$(this).on('listingUpdated', function(e, listingId) {
  // do something with listingId
});

// good
$(this).trigger('listingUpdated', { listingId : listing.id });

...

$(this).on('listingUpdated', function(e, data) {
  // do something with data.listingId
});
```