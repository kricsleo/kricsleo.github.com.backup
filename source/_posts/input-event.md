---
title: input-event
date: 2019-04-22 11:14:00
subtitle: input 元素的事件顺序
categories:
  - front-end
tags:
  - h5
---

# input 元素的事件顺序

h5 的`<input />`组件上有很多的事件, 这次来详细的探究一下它们的触发顺序和使用场景

<!-- more -->

我的测试是在 chrome 版本 73.0.3683.75（正式版本）（64 位）环境, 其它的浏览器可能有不同, 有时间再补充其它浏览器吧.

目前来说比较常用的有`focus`/`keydown`/`input`/`keyup`/`compositionstart`/`compositionupdate`/`compositionend`/`change` 

点击一个输入框开始输入触发的事件顺序依次是: 

`focus`=>`keydown`(=>`compositionstart`=>`compositionupdate`)=>`input`(=>`compositionend`)=>`keyup`  

 如果是组合输入(比如中文日文等)输入的话就会出现括号中组合输入事件, 详细来说是当开始输入中文的时候就会触发`compositionstart`事件, 此时`input`事件和`keyup`事件拿到的输入框的值是不完整的(一般包含你输入的拼音和拼音之间的分号), 当中文输入结束的时候会触发`compositionend`事件, 此时可以取到该输入框的完整的输入中文后的值(一般而言这个值是我们所需要的)

 (额外的一点是从`input`事件开始可以拿到最新输入的值, 前面的事件拿到的值都要落后一次, 少了最后一次输入的字符)

`change`事件的触发需要**两个条件**, 一是`input`元素即将失焦, 事件顺序是`change`=>`blur`, 二是本次失焦后的内容与前一次失焦后的内容不同(如果相同是不会触发该事件的),

最常用的场景之一是`input`用来搜索的时候, 我们的需求是输入变化的时候就去查询(当然有节流), 但是在中文输入的时候就不要查询, 直到中文输入结束之后再查询, 这样可以避免用一些明显无效的关键词如`文章n'r`去查询, 等到完整中文输入后变成`文章内容`再去查询

```js
function throttle(fn, minDelay, maxDelay) {
  let timer;
  let startTime = new Date();
  return function () {
    const context = this;
    const args = arguments;
    let curTime = new Date();
    clearTimeout(timer);
    if (curTime - startTime >= maxDelay) {
      fn.apply(context, args);
      startTime = curTime;
    } else {
      timer = setTimeout(() => {
        fn.apply(context, args);
      }, minDelay);
    }
  }
}

function listenInput(selector, cb, delay = 150, maxDelay = 1000) {
  const el = document.querySelector(selector);
  if(!el || !cb || typeof cb !== 'function') {
    return false;
  }
  const throttleCB = throttle(cb, delay, maxDelay);
  let isComposition = false;
  const compositionstart = () => isComposition = true;
  const compositionend = () => {
    isComposition = false;
    throttleCB(el.value);
  };
  const input = () => {
    if(isComposition) {
      return false;
    }
    throttleCB(el.value);
  }

  el.addEventListener('compositionstart', compositionstart);
  el.addEventListener('compositionend', compositionend);
  el.addEventListener('input', input);
  
  return () => {
    el.removeEventListener('compositionstart', compositionstart);
    el.removeEventListener('compositionend', compositionend);
    el.removeEventListener('input', input);
  }
}

// 使用示例
// 开始监听, 默认最小间隔时间是150ms, 最大间隔时间是1000ms
const removeListener = listenInput('#inputId', value => {
  console.log(value);
}, 100, 1500);

// 取消监听
removeListener();
```
