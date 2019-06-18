---
title: markdown
date: 2018-08-23 09:09:00
categories: 
    - tool
tags: 
    - markdown
---
# markdown语法整理
经常使用markdown来做笔记，这里把现在常用的语法先记录一下，万一老年人了记忆不好，也可以查一查
<!--more-->

## 标题
```markdown
# h1
......
###### h6

分隔符
最少三个---或***
```

## 目录
```markdown
(部分markdown软件不支持)
[TOC]
```

## 引用
```markdown
> quote(每行最后添加两个空格即表示换行)  
quote  

> quote(或者采取每行前面都添加引用标志)
> quote

> quote(多行嵌套引用)
>> quote2
>>> quote3
```

## 代码
```markdown
行内代码`code`行内代码

多行代码，[支持高亮语言](https://blog.csdn.net/qq_32126633/article/details/78838494#language_key)
```

## 链接
```markdown
[个人博客](https://kricsleo.github.io/ 'krics的个人博客')
或者
[blog]: https://kricsleo.github.io/ 'krics的个人博客'
[个人博客][blog]
```

## 图片
```markdown
![个人头像](https://kricsleo.github.io/images/avatar.jpg 'krics的个人头像')
或者
[avatar]: https://kricsleo.github.io/images/avatar.jpg 'krics的个人头像'
![个人头像][avatar]
图片带链接
[![个人头像](https://kricsleo.github.io/images/avatar.jpg 'krics的个人头像')](https://kricsleo.github.io/images/avatar.jpg)
```

## 序表
```markdown
有序节点
1. 节点1
    1. 节点1.1
2. 节点2
无序节点
- 节点$
    - 节点$.^
- 节点#
    - 节点#.&
```

## 任务
```markdown
- [ ] 未完成
- [x] 已完成
```
## 表格
```markdown
# 附上[在线生成表格工具](https//www.tablesgenerator.com/markdown_tables)
|    a    |       b       |      c     |
|:-------:|:------------- | ----------:|
|   居中   |      左对齐    |    右对齐   |
```

## 语义性
```markdown
*斜体* or <i>斜体</i>
**加粗** or <b>加粗</b>
***斜体加粗*** or <em>强调</em>
~~删除线~~
上标<sup>u</sup>
下标<sub>d</sub>
键盘按键<kbd>Ctrl</kbd>
```

## 格式化显示
```markdown
<pre>
    ...
<pre>
```

## 公式
- [ ] 目前还不常用，之后补齐  
## 脚注
```markdown
Markdown[^1]
在页面底端注解
[^1]: Markdown是一种纯文本标记语言  
```

## 定义型列表
```markdown
Markdown
:   Markdown是一种纯文本标记语言  (冒号后跟一个'Tab'或者四个空格)
```

## 邮箱
```markdown
<xxx@163.com>
```

## 流程图
markdown的代码绘制流程图个人感觉比较复杂，个人使用的在线绘制工具[ProcessOn](https://www.processon.com/diagrams)
