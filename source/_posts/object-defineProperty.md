---
title: object-defineProperty
subtitle: Object.defineProperty
date: 2018-10-08 00:06:51
categories:
  - front-end
tags:
  - object
---

# 属性描述符

在js的对象中通常会有很多个属性, 例如`let person = { name: 'john'}`中的`name`就是`person`这个对象的一个属性, 我们可以定义这个属性的一些特性, 也就是来描述这个属性, 比如这个属性是否是可读写的, 是否是可以被枚举的等等, 由此产生出了**属性描述符**这个概念.
<!-- more -->
属性描述符分为两种: `数据描述符`和`存取描述符`:

- `数据描述符`是一个拥有可写或不可写值的属性
- `存取描述符`是由一对`getter-setter`函数功能来描述的属性

属性描述符必须是两种形式其中之一, 不能同时是两者. 我们使用`Object.defineProperty()`这个方法来定义一个属性的属性描述符.

## 数据描述符

数据描述符有四个: `configurable`, `enumerable`, `writable`和`value`, 前三个属性在使用`Object.defineProperty()`定义时默认都是`false`,第四个属性`value`默认为`undefined`, 而如果使用字面量直接添加属性的话, 那么这个属性的前三个属性默认都是`true`. 下面具体说一下这个四个属性:

- `configurable`

是否可以删除目标属性或是否可以再次修改属性的四个特性, 意思是当设置为`true`时可以随时对`configurable`, `enumerable`, `writable`和`value`这四个属性进行修改, 但是一旦设置为`false`, 那么这个四个属性将都不能被更改, 你也无法再次将`configurable`设置为`true`, 默认为`false`

- `enumerable`

此属性是否可以被枚举（使用`for...in`或`Object.keys()`）。设置为`true`可以被枚举；设置为`false`，不能被枚举, 默认为`false`

- `writable`

属性的值是否可以被重写。设置为`true`可以被重写；设置为`false`，不能被重写, 默认为`false`

- `value`

属性对应的值,可以使任意类型的值，默认为`undefined`

使用举例:

```JavaScript
let person = {
  name: 'john'
}

// 定义一个已经有的属性 name, 或者新增一个属性 name, 写法一样
Object.defineProperty(person, 'name', {
  configurable: true | false,
  enumerable: true | false,
  writable: true | false,
  value: 任意类型的值
});

// 查看属性
Object.getOwnPropertyDescriptor(person, 'name');
// => {
//      configurable: true,
//      enumerable: true,
//      writable: true,
//      value: 'john'
//    }
```

ES5有三个操作符会忽略掉对象中`enumerable`设置为`false`的属性:

- `for...in`循环: 只遍历对象自身的和继承的可枚举的属性
- `Object.keys()`：返回对象自身的所有可枚举的属性的键名
- `JSON.stringify()`：只串行化对象自身的可枚举的属性

ES6新增了一个操作`Object.assign()`，也会忽略对象中`enumerable`为`false`的属性，只拷贝对象自身的可枚举的属性。

## 存取描述符

存取描述符也有四个: `configurable`, `enumerable`, `get`和`set`, 前两个属性在使用`Object.defineProperty()`定义时默认都是`false`, 后两个属性默认是`undefined`, 而如果使用字面量直接添加属性的话, 那么这个属性的前两个属性默认都是`true`, 下面具体说一下这个四个属性:

- `configurable`

与上面`数据描述符`中相同

- `enumerable`

与上面`数据描述符`中相同

- `get`

获取对象中属性值的方法, 它的值应该是一个返回这个属性值的方法, 默认为`undefined`

- `set`

设置对象中属性值的方法, 它的值应该是一个接受一个新值作为参数然后执行设置属性值的方法, 默认为`undefined`

使用举例:

```JavaScript
let person = { name: 'john' };

Object.defineProperty(person, 'name', {
  configurable: true | false,
  enumerable: true | false,
  get: function() {
    return value;
  } | undefined,
  set: function(newVal) {
    if(newVal !== value) {
      value = newVal;
    }
  } | undefined
});
```

这里的`set`的用途就很强大了, 比如我们使用的Vue里面的数据绑定就是基于这个`set`实现的双向数据绑定, 这里埋下一个坑:
TODO: 分析Vue的源码中的数据绑定部分

## 属性的遍历

- `for...in`

`for...in`循环遍历对象自身的和继承的可枚举属性（不含Symbol属性)

- `Object.keys(obj)`

`Object.keys`返回一个数组，包括对象自身的（不含继承的）所有可枚举属性（不含Symbol属性）。

- `Object.getOwnPropertyNames(obj)`

`Object.getOwnPropertyNames`返回一个数组，包含对象自身的所有属性（不含Symbol属性，但是包括不可枚举属性）。

- `Object.getOwnPropertySymbols(obj)`

`Object.getOwnPropertySymbols`返回一个数组，包含对象自身的所有Symbol属性。

- `Reflect.ownKeys(obj)`

`Reflect.ownKeys`返回一个数组，包含对象自身的所有属性，不管是属性名是Symbol或字符串，也不管是否可枚举。