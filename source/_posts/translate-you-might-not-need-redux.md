---
title: translate-you-might-not-need-redux
date: 2019-04-15 16:06:39
subtitle: 翻译<<You Might Not Need Redux>>
categories:
  - translation
tags:
  - react
  - redux
---

# 翻译《You Might Not Need Redux》

闲来无事, 翻译下我挺喜欢的一个程序员 [Dan Abromov](https://overreacted.io/) 的一篇文章[《You Might Not Need Redux》](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367), 因为我对于 redux 的用法也还很浅显, 里面也还存在着错误的用法, 多看看别人的一些优秀的工程, 慢慢会有更好的体会吧.

以下为翻译.

<!-- more -->

## 你也许并不需要 Redux

许多人经常在他们真的需要 Redux 之前就在项目中引入了它. "如果我的应用因为缺少了它而无法满足后续的扩展怎么办?", 但是在之后, 开发者又会对 Redux 给代码带来的迂回逻辑感到不满. "为什么我需要新建三个文件才能完成一个小小的功能?到底为什么?"

当人们遇到一些困难时会去抱怨 Redux, React, 函数式编程, 不可变数据和很多其他的事, 我也能理解他们. 把 Redux 和其它不需要"样板化"代码来更新应用状态的方式做比较然后得出 Redux 就是很繁琐的结论是很正常的事. 在某些方面来说确实如此, 设计的初衷就是这样.

Redux 提供了一些取舍. 它要求你:

- 把应用的状态描述为普通对象和数组.

- 把应用中发生的变化描述为普通对象.

- 把应用变化的处理逻辑描述为纯函数.

不论你是否在使用 React 构建一个应用, 上面的那些限制条件都不是必要的. 进一步来说这些限制条件是非常严格的, 在你把他们使用到应用中的哪怕一部分的时候都应该考虑清楚.

你是否有足够充足的理由去这样做?

这些限制条件对我来说是非常有吸引力的, 因为它们能帮助建立一个有着如下特性的应用:

- 把应用的状态保存到本地存储中, 然后开箱即用

- 在服务端就把状态填充好, 然后把它在 HTML 中发送给客户端, 然后开箱即用

- 序列化用户操作并将其与状态快照一起附加到自动错误报告中，以便产品开发人员可以重播它们以重现错误

- 通过网络传递操作对象以实现协作环境，而不会对代码的编写方式进行重大更改

- 保留撤消历史记录或进行乐观突变，而不会对代码的编写方式进行重大更改

- 开发时在应用状态历史里实现时间旅行, 当代码变更时可以从历史变更记录里面重新计算出当前的的应用状态, 参考[Redux DevTools](https://github.com/reduxjs/redux-devtools)

- 为开发者工具提供全面的检查和控制能力来让产品开发者们能够为他们的应用开发自定义的工具

- 在重用业务逻辑的同时提供换肤功能

如果你正在开发一些可扩展的终端, JavaScript调试器或者其它的一些网页应用的话, 这是值得你去尝试一下的, 哪怕只是采用其中一部分的想法(顺带一说, 这些想法一直都存在)

然而, 如果你是刚开始学习 React 的初学者, 那么不要把 Redux 作为你的第一选择.

你要做的应该是按照 React 的思想去思考. 当你真的需要 Redux 或者你想尝试一些新鲜的东西时再来使用 Redux 吧. 但是在使用的时候要格外注意一些, 就像你使用其它带着强烈的主观意识的工具一样.

如果按照" Redux 的方式"的方式写代码让你感到很有压力, 那么这也许是在提醒你或者你的同事们把它看的太过重要了. 它毕竟只是你的工具箱中的其中一个工具而已, 一个略带疯狂的实验.

最后, 不要忘了你可以在不使用 Redux 的情况下采纳它提供的一些想法. 例如, 一个有着本地状态的 React 组件:

```js
import React, { Component } from 'react';

class Counter extends Component {
  state = { value: 0 };

  increment = () => {
    this.setState(prevState => ({
      value: prevState.value + 1
    }));
  };

  decrement = () => {
    this.setState(prevState => ({
      value: prevState.value - 1
    }));
  };
  
  render() {
    return (
      <div>
        {this.state.value}
        <button onClick={this.increment}>+</button>
        <button onClick={this.decrement}>-</button>
      </div>
    )
  }
}
```
这样就很完美了. 我是认真的, 它是经得起考验的.

**本地状态就足够了**

Redux提供的取舍方案是为了提供一种把"发生了什么"和"状态是如何变化的"解耦的间接解决方案

这种解耦始终都是正确的吗?并不是, 它是一种取舍.

比如说, 我们能够用如下方式把一个 reducer 从我们的组件中分离出去: 

```js
import React, { Component } from 'react';

const counter = (state = { value: 0 }, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return { value: state.value + 1 };
    case 'DECREMENT':
      return { value: state.value - 1 };
    default:
      return state;
  }
}

class Counter extends Component {
  state = counter(undefined, {});
  
  dispatch(action) {
    this.setState(prevState => counter(prevState, action));
  }

  increment = () => {
    this.dispatch({ type: 'INCREMENT' });
  };

  decrement = () => {
    this.dispatch({ type: 'DECREMENT' });
  };
  
  render() {
    return (
      <div>
        {this.state.value}
        <button onClick={this.increment}>+</button>
        <button onClick={this.decrement}>-</button>
      </div>
    )
  }
}
```

注意我们刚刚在上面的代码中做到了不使用`npm install`就能够使用 Redux. 哇哦!

你应该把这种做法使用到你的有状态的组件中吗? 大部分情况下不会的, 除非你计划能够从这种比较曲折的做法中获得收益. 在如今的开发中, 制定计划是很关键的事.

Redux 库本身只是一系列的工具, 能够帮助挂载 reducers 到一个单一的全局存储对象. 用多用少都随你意

但是如果你舍弃了某些东西, 请确保你能获取对应的回报.


