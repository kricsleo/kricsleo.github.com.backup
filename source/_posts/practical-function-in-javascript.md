---
title: Practical-Function-In-Javascript
date: 2018-09-07 09:07:17
categories:
  - front-end
tags:
  - function
---
# JavaScript中的常用函数
本文主要整理了平时JavaScript中常用的函数, 持续更新.
<!-- more -->

## 数组
### [Array.concat()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/concat)
作用: 合并数组, 返回新数组, 不影响原数组
备注: 字符串中也有此同名函数, 作用可类比

### [Array.filter()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
作用: 对数组每个元素进行测试, 返回符合条件的元素组成的新数组, 不影响原数组

### [Array.find()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
作用: 返回数组中满足提供的测试函数的第一个元素的值, 否则返回 undefined

### [Array.forEach()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)
作用: 对数组的每个元素执行一次提供的函数, 不影响原数组

### [Array.includes()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)
作用: 判断数组是否包含某个值, 是则返回`true`, 否则返回`false`
备注: 字符串中也有此同名函数`String.includes(subSring, fromIndex)`, 用于判断字符串是否包含另一个字符串

### [Array.indexOf()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
作用: 返回数组中给定元素的索引值，若给定元素不存在，则返回值是-1
备注: 字符串中也有此同名函数, 作用可类比

### [Array.join()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/join)
作用: 将数组中的所有元素用给定方式连接成一个字符串，默认用`，`连接, 可用空字符串`''`连接, 返回连接后的字符串, 不影响原数组

### [Array.map()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
 作用: 对数组中的每个元素都调用一个提供的函数后返回的结果组成一个新数组, 返回新数组, 不影响原数组

### [Array.reduce(callback[accumulator, currentValue, currentIndex, array], initialValue)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce)
作用: 对累加器和数组中的每个元素（从左到右）应用一个函数，将其减少为单个值, 返回最后的计算结果, 此函数功能强大, 建议参考官方文档

### [Array.slice()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/slice)
作用: 将数组的制定部分(包括开始位置, 不包括结束位置)浅拷贝到一个新数组, 返回拷贝的新数组, 不影响原数组
备注: 字符串中也有此同名函数, 作用可类比

### [Array.splice()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
作用: 通过删除现有元素和/或添加新元素来更改一个数组的内容, 返回被删除的元素组成的数组, 如果没有删除, 则返回空数组, **会改变原数组**, 此函数功能强大, 建议参考官方文档

## 字符串
### [String.charAt()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/charAt)
作用: 返回字符串中指定位置的字符, 不存在则返回空字符串`""`

### [String.charCodeAt()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt)
作用: 返回字符串中指定位置的字符的`UTF-16`代码单元值的数, 在0到65535之间, 超出范围返回`NaN`

### [String.match()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/match)
作用: 将字符串与正则表达式匹配, 返回匹配后的结果数组,数组的第一项是进行匹配完整的字符串，之后的项是用圆括号捕获的结果。如果没有匹配到，返回null, 不影响原数组
如果给的参数不是正则表达式, 那么会隐式的转换成正则表达式, 此函数功能很强大, 请参考官方文档

备注: [`RegExp.text()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test)用来测试字符串是否与正则匹配 速度会更快, 如果匹配则返回`true`, 否则返回`false`
[`String.search()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/search)也类似`test()`方法, 只不过返回的值是第一个匹配的地方的索引值, 如果没有匹配则返回`-1`
[`RegExp.exec()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec)的行为和`String.match()`很相似, 在非全局匹配下表示一样, 但是对于全局匹配`/g`他们的表现就不同, 简单来说就是`match()`的全局匹配会一次找到全部的匹配项放在数组中返回, 但是`exec()`的全局匹配是每调用一次`exec()`就返回在上一次执行的基础上继续搜索的下一个匹配结果, 直到最后找不到的时候就会返回`null`, 参考[这里](https//zyy1217.com/2016/12/29/%20js%E6%AD%A3%E5%88%99%E8%A1%A8%E8%BE%BEexec%E5%92%8Cmatch%E7%9A%84%E5%8C%BA%E5%88%AB/)

### [Sring.replace()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/replace)
作用: 将字符串中的匹配值(字符串或者正则表达式匹配到的值)用另外的值(替换的字符串或者一个方法返回的值)替换, 然后返回新的字符串, 不影响原字符串
**使用字符串匹配时只会替换第一个匹配的结果**
关于第二个参数如果使用字符串, 那么`$&, $n, ...`等能够作为代替匹配的结果字符串使用, 如果使用函数, 那么`match, p1, p2, ...`能够代替匹配的结果在函数参数中使用, 具体请参见官方文档
**可使用正则表达式全局匹配实现全局替换**, 例如`'hello, yello'.replace(/llo/g, 'yes')`

### [String.split()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/split)
作用: 将字符串按照匹配的字符串或者正则表达式进行分割, 返回分割的结果组成的数组, 不影响原字符串
关于分割的结果中有时会产生空字符串`''`的原因可以参考[KevinYue的这篇文章](https://segmentfault.com/a/1190000000692744), 评论中的'切黄瓜'的比喻也有助于理解, 另外使用正则表达式时会忽略全局匹配符`/g`

### [String.substr()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/substr)
作用: 将字符串中从指定位置开始的指定长度(不指定长度则到字符串末尾)的部分拷贝为新字符串返回, 不影响原字符串

### [String.substring()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/substring)
作用: 将字符串中从指定位置开始(包含)到指定位置结束(不包含)(或者默认到结尾)的部分拷贝伟新字符串返回, 不影响原字符串

### [String.trim()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/Trim)
作用: 返回字符串开头和结尾的空白字符(包括space, tab, no-break space等以及所有行终止符字符如 LF，CR)都移出的新字符串, 不影响原字符串

## 其他平时的笔记

- `Object.freeze(obj)`冻结一个对象, 冻结了之后这个对象的所有属性都不可被修改, 尝试修改不报错但是会不生效, 返回被冻结之后的对象, 并不是传入参数的一个副本, 而是传入的对象本身, 只是进行了属性冻结.

- `Element.scrollIntoView()`HTML5原生的滚动API, 使得一个元素滚动到试图中, 兼容到IE8, 主流浏览器均支持.
  三种调用形式:
  - element.scrollIntoView(); // 等同于element.scrollIntoView(true)
  - element.scrollIntoView(alignToTop); // Boolean型参数(true代表元素顶部尽可能与浏览器顶部对齐, false代表元素底部尽可能与浏览器底部对齐)
  - element.scrollIntoView(scrollIntoViewOptions); // Object型参数
    `scrollIntoViewOptions`里面支持三个参数:
    ```javascript
    {
      behavior: "auto" | "instant" | "smooth", // 默认 auto, 滚动动画, auto 和 instant 都是无动画立即到底目的位置, smooth 为带动画
      block: "start" | "center" | "end" | "nearest", // 默认 center, 垂直方向对齐方式, start 顶部对齐, center 中间对齐, end 底部对齐, nearest 就近对齐(意思是现在的位置靠近哪种对齐方式就采用哪种对齐方式, 移动最小)
      inline: "start" | "center" | "end" | "nearest", // 默认 nearest, 水平方向对齐方式, 具体参数含义和 block 类似
    }
    ```


[参考文档1](https://www.jianshu.com/p/da71c06b92d0)
