---
title: toFixed
date: 2019-03-15 10:41:44
subtitle: toFixed的精度问题
categories:
  - front-end
tags:
  - js怪异事件录
---

# JS 中的 `toFixed`精度问题

在关于金额的计算中经常会出现精确到两位小数的情况, 然后如果直接使用js的`number.toFixed()`方法其实会导致意想不到的问题, 比如你可以猜一下下面表达式的执行结果

```js
0.1 + 0.2;

(1.555).toFixed(2);
```

<!-- more -->

第一个表达式结算结果是`0.30000000000000004`, 第二个表达式结果是`"1.55"`, 其实这是 js 的浮点数存储方式导致的, 具体的可以看github上的一个讨论:[JavaScript 浮点数陷阱及解法](https://github.com/camsong/blog/issues/9),  简单来说就是 js 里面对于小数的存储是不精确的, 所以在涉及到小数的运算的时候就有可能因为精度问题出现意想不到的计算结果. 如果是一般的运算的话可以使用这个库来解决这个问题[nefe/number-precision](https://github.com/nefe/number-precision).

关于`toFixed()`方式的说明在[MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed)上说是采取的**四舍五入**的规则, 但是实际测试并非如此, 比如你可以猜一下下面表达式的执行结果:

```js
(1.15).toFixed(1);

(1.151).toFixed(1);

(1.25).toFixed(1);
```

这三个表达式的执行结果分别是`"1.1"`, `"1.2"`和`"1.3"`, 按照四舍五入根本说不通, 其实`toFixed()`真正的规则是**银行家舍入算法**

## 银行家舍入算法

银行家舍入算法规则是**四舍六入五考虑, 五后非零就进一, 五后为零看奇偶, 五前为偶应舍去, 五前为奇要进一**, 之所以制定出这一套规则是因为在银行金额的计算中为了尽可能少的避免损失, 因为金额的舍去和进位总体来说要保持大致相同的概率, 这样最后计算出来的帐才会不盈不亏, 具体讨论可以看这里: [为什么银行家舍入是合理的？](https://blog.csdn.net/MAOZEXIJR/article/details/78563531)和[知乎的讨论](https://www.zhihu.com/question/24580446)

**我不知道是不是chrome更新了的原因, 前几天刚测过的银行家算法来解释`toFixed()`是可以解释的通的, 但是写这篇笔记的时候我再次测试却又发现与之前的测试结果不一致了, 现在怎么都解释不通了**

例如, 按照银行家算法, `(1.555).toFixed(2)`的结果应该是`"1.56"`, 但是今天的执行结果变成了`"1.55`, 虽然满足了**五前为奇**但是却并没有**进一**, WTF???

## 如何修复`toFixed()`的舍入问题

不论怎样, 当日常编程中使用`toFixed()`碰到舍入的时候我们总希望能够按照我们所期望的真正的四舍五入那样返回结果, 所以只能手动的实现`toFixed()`方法.

我下面只是随便实现的一个, 把原数先放大一定倍数, 然后利用`Math.round()`来做真正的四舍五入, 最后然后再缩小相同倍数, 这样处理一次之后就能排除特殊的**五后**的情况, 然后就可以使用`Number.toFixed()`方法得到理想中的四舍五入后的值, 简单的写了几个测试, 也许有特例是我没有覆盖到的?

```js
function toFixed(value, digits) {
  const multiple = Math.pow(10, digits);
  const magnified = value * multiple;
  const roundedMagnified = Math.round(magnified);
  return ( roundedMagnified / multiple ).toFixed(digits);
}

function test(describe, fn) {
  console.group(describe);
  typeof fn === 'function' && fn();
  console.groupEnd();
}

const Expect = function (result) {
  this.result = result;
  this.tobe = expectResult => {
    if(result === expectResult) {
      console.log('passed');
    } else {
      console.error(`failed: expect ${result} to be equal to ${expectResult}`);
    }
  };
}

function expect(result) {
  return new Expect(result);
}

// test
test('test toFixed', () => {
  expect(toFixed(1.55, 1)).tobe('1.6');
  expect(toFixed(1.45, 1)).tobe('1.5');
  expect(toFixed(1.550, 1)).tobe('1.6');
  expect(toFixed(1.551, 1)).tobe('1.6');
  expect(toFixed(1.552, 1)).tobe('1.6');
  expect(toFixed(1.450, 1)).tobe('1.5');
  expect(toFixed(1.451, 1)).tobe('1.5');
  expect(toFixed(1.452, 1)).tobe('1.5');

  expect(toFixed(1.55, 2)).tobe('1.55');
  expect(toFixed(1.45, 2)).tobe('1.45');
  expect(toFixed(1.550, 2)).tobe('1.55');
  expect(toFixed(1.551, 2)).tobe('1.55');
  expect(toFixed(1.552, 2)).tobe('1.55');
  expect(toFixed(1.450, 2)).tobe('1.45');
  expect(toFixed(1.451, 2)).tobe('1.45');
  expect(toFixed(1.452, 2)).tobe('1.45');
});

```