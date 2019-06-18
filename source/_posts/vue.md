---
title: vue
date: 2018-09-13 09:42:12
categories:
  - framework
tags:
  - vue
  - ast
---

# Vue 学习笔记

最近开始学习 Vue 了, 在这里记录一下学习笔记.

最近像没头的苍蝇一样盯着 Vue, 感觉好些地方不甚了解, 博客也搁置了快五天没动过笔了...

<!-- more -->

## `Vue.extend()`和`Vue.component()`

两者都是使用参数来返回一个构建模板的构造方法, 不同的是`vue.extend()`返回的是一个匿名的构造器, 需要自己接收返回值注册名字, `vue.component()`可以在生成构造的函数的时候将组件名绑定上去, 所以后者可以看做是前者的语法糖. --[参考](https://segmentfault.com/q/1010000007312426)

## `Vue.set(target, prop, value)`

给实例添加动态响应的属性, 注意 target 不能是实例本身或者实例的根属性, 也就是说你不能给 data 加上根级的属性, 可以给 data 中的对象加上新属性,
例如`Vue.set(this.$data, 'name', 'krics')`是会报错的, 但是`Vue.set(this.$data.info, 'name', 'krics')`是正确的.

## 编译

在生成单页面的 vue 应用时,

- [ ] 有模板与有 render 函数的区别
