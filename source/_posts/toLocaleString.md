---
title: toLocaleString
date: 2019-04-25 10:04:25
subtitle: 冷门的toLocaleString
categories:
  - front-end
tags:
  - toLocaleString
  - 国际化
---

# 冷门的`toLocaleString`

js 里面除了我们日常使用的api以外, 其实还是有不少大多数人都不知道的很好用的api的, `toLocaleString`算一个, 也许你在面试题中看到过用正则来实现数字千位用逗号分隔的做法, 但是如果你能直接说出`toLocaleString`, 应该是出乎面试官的意料的, 而它的用法可不止于此.

`toLocaleString`方法在`Numnber`和`Date`类型上都有部署, 实现的作用都是格式化数字或者日期, 返回格式化后的字符串.

<!-- more -->

## `Number.prototype.toLocaleString`

api: `toLocaleString([locales [, options]])`

`locales`指定地区, 默认是按照当前电脑环境的语言, 也可以指定不同的语言, 中文是`zh`, 英文是`en`, 其它可选项请查看[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation), 不区分大小写.

例如:

```js
const a = -2345679.56789;
const b = new Date();

// 单纯的数字的格式化在 zh 和 en 是相同的
a.toLocalString(); // => "-2,345,679.568"
a.toLocaleString('zh'); // => "-2,345,679.568"
a.toLocaleString('en'); // => "-2,345,679.568"

// 日期的格式化就能看出语言差异了
b.toLocalString(); // => "2019/4/25 上午10:27:15"
b.toLocaleString('zh'); // => "2019/4/25 上午10:27:15"
b.toLocaleString('en'); // => "4/25/2019, 10:27:15 AM"
```

`options`参数才是重头戏, 它可以定义更多的配置项, 但是一定要先指定`locales`参数, 才能使用`options`参数.

`options`对象中的`style`表示格式化时使用的格式, 默认是`decimal`即纯数字, 另外还有`percent`百分比和`currency`货币形式, 需要注意的是如果指定`style`为`currency`, 那么必须接着指定`currency`属性才行, 因为`currency`没有默认值, 可选值有`CNY`人民币, `USD`美元, `EUR`欧元等, 更多请参考[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString)

指定了`style`为`currency`之后, 除了`currency`属性之外, 还有一个`currencyDisplay`属性可用, 默认值是`symbol`即货币符号, 另外两个可选值为`code`代码(如`CNY`)和`name`名称(如`人民币`)

```js
const c = 80909.89;
c.toLocaleString('zh', {style: 'percent'}); // => "8,090,989%" 
c.toLocaleString('zh', {style: 'currency', currency: 'CNY'}); // => "￥80,909.89"
c.toLocaleString('zh', {style: 'currency', currency: 'CNY', currencyDisplay: 'name'}); // => "80,909.89 人民币"
```

接下来是`options`里面的两组不能同时使用的参数, 一组是`minimumIntegerDigits`, `minimumFractionDigits`和`maximumFractionDigits`, 另一组是`minimumSignificantDigits`和`maximumSignificantDigits`

前一组是用来指定数字的最少整数位数, 最少小数位数和最多小数位数, 后一组用来指定最少数字位数和最多数字位数(包括整数和小数一起). 如果指定了后一组参数, 那么前一组参数就会被忽略掉. 指定位数的规则都是按照四舍五入, 是真正的数学上的四舍五入, 而不是像`toFixed`那样的按照银行家算法的伪四舍五入, 如果位数不足的话就会自动用`0`补齐. **四舍五入**, **自动补齐**, 想想就知道有多大潜力! 

另外`style`里面还有一个`useGrouping`参数, 表示是否使用分组分隔符，如千位分隔符或千/万/亿分隔符, 默认为`true`

```js
const d = 892839.855;

d.toLocaleString('zh', { style: 'currency', currency: 'CNY' ,minimumFractionDigits: 2, maximumFractionDigits:2 }); // => "￥892,839.86"
d.toLocaleString('zh', { style: 'currency', currency: 'CNY' ,minimumFractionDigits: 2, maximumFractionDigits:2, useGrouping: false }); // => "￥892839.86"
```

看看上面的金额格式化的示例, 只需要一行语句多简洁啊, 我之前还专门写了个函数来做金额的格式化显示, 跟这个一比差远了...

```js
/**
 * @description: format money to standard string including prefix, separator and two decimal places
 * @param {number | string} currency
 * @param {string} prefix prefix the output with the specified string
 * @return: {string} formated currency
 */
function formatCurrency(currency = '', prefix = '') {
  const split = currency.toString().split('.');
  let integer = split[0] || '0';
  if (integer.startsWith('¥')) {
    integer = integer.slice(1, integer.length);
  }
  let isNegative = false;
  if(integer.startsWith('-')) {
    isNegative = true;
    integer = integer.slice(1, integer.length);
  }
  let decimal = split[1] || '00';
  let output = '';
  while (integer.length > 3) {
    output = `,${integer.slice(-3)}${output}`;
    integer = integer.slice(0, integer.length - 3);
  }
  if (integer) {
    output = integer + output;
  }
  if (decimal.length < 2) {
    decimal = decimal + '0';
  }
  output = `${isNegative ? '-' : ''}${prefix}${output}.${decimal}`;
  return output;
}
```

## `Date.prototype.toLocaleString`

api: `toLocaleString([locales [, options]])`

`locales`参数与之前的一致, 也是指定语言, 默认是当前电脑环境语言

`options`参数就不一样了, 里面的`hour12`表示使用十二小时制还是二十四小时制, 默认值根据当前环境变化而变化

```js
const e = new Date();

e.toLocaleString('zh', {hour12: true}); // => "2019/4/25 下午11:07:32"
e.toLocaleString('zh', {hour12: false}); // => "2019/4/25 23:07:32"
```

然后是对年月日星期时分秒时区等的显示格式设置, 参数分别是`year`, `month`, `day`, `weekday`, `hour`, `minute`, `second`, `timeZoneName`.

`weekday`可选值为`narrow`, `short`和`long`, 就是缩写的长度不同, 例如 Wednesday 依次显示为 W , Wed 和 Wednesday
`timeZoneName`可选值为`short`和`long`, 例如 GMT+8 和 中国标准时间
其余的参数可选值为`numeric`和`2-digit`, 区别是`numeric`直接显示, `2-digit`会固定显示两位数, 例如 7 和 07
`month`除了`numeric`和`2-digit`外还有`narrow`, `short`和`long`, 额外的这三个其实也是控制缩写的长度(设置`locales`为`en`能看出差别)

## 参考文章
[Number​.prototype​.toLocale​String()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString)
[toLocaleString 了解一下](https://juejin.im/post/5ac7079f5188255c637b3233)







