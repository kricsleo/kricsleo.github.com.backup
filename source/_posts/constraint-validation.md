---
title: constraint-validation
date: 2019-02-25 11:38:04
subtitle: h5的原生表单校验api
categories:
  - front-end
tags:
  - h5
---

# h5 原生表单校验api

我们通常会对表单的 input 的做各种各样的校验, 比如长度, 大小, 格式等等, 其实在h5中为了方便这些校验原生就有不少的校验类型和方式, 只不过错误提示的样式由于各个浏览器不太一样, 而且无法自定义, 产品和设计一般都不会认可这样的表现, 所以目前还是比较少用到浏览器原生的校验, 不过了解一下还有没有坏处的.
<!-- more -->

这里我放一篇对 h5 原生的校验描述的比较不错的文章[HTML5利用约束验证API来检查表单的输入数据](http://www.imooc.com/article/15355)

另外可以看一下 MDN 的资料[约束验证](https://developer.mozilla.org/zh-CN/docs/Web/Guide/HTML/HTML5/Constraint_validation), 目前可用的校验方式有: pattern, min, max, required, step, maxlength

input 目前支持的类型有传统的10种, 加上 h5 中新增的13种, 一共是23种.

传统的10种
| type | description |
| ---- | ---- |
| `text` | 文本 |
| `password` | 密码, 输入字符会被以*隐藏 |
| `file` | 点击上传文件 |
| `radio` | 单选 |
| `checkbox` | 多选 |
| `hidden` | 隐藏的字段 |
| `button` | 按钮 |
| `image` | 图像形式的提交按钮 |
| `image` | 文本 |
| `reset` | 重置表单输入框 |
| `submit` | 提交表单 |

h5 新增的13种
| type | description |
| ---- | ---- |
| `number` | 数字输入 |
| `tel` | 电话号码 |
| `email` | 邮件地址 |
| `url` | url |
| `range` | 一定范围的数字, 滑动选择形式 |
| `color` | 点击弹出颜色选择框 |
| `search` | 语义化, 表示搜索, 与 text 表现一直 |
| `date` | 选择年-月-日 |
| `month` | 选择年-月 |
| `week` | 选择年-周 |
| `time` | 选择时-分 |
| `datetime` | 选择年-月-日-时-分 UTC时间 |
| `datetimelocal` | 选择年-月-日-时-分 本地时间 |


