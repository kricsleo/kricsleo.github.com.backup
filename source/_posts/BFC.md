---
title: BFC
date: 2019-02-25 08:50:03
subtitle: BFC
categories:
  - front-end
tags:
  - css
---

# BFC (BLOCK FORMATTING CONTEXT)
关于 BFC (BLOCK FORMATTING CONTEXT: 块格式化上下文)这个专有名词可能听得不多, 但是在实际的页面布局中实际上却是会经常碰到的, 只是没有特意去注意这个现象而已, 这里记录一下它是如何影响我们的布局的.
<!-- more -->

## BFC 解释

> 9.4.1 Block formatting contexts
> Floats, absolutely positioned elements, block containers (such as inline-blocks, table-cells, and table-captions) that are not block boxes, and block boxes with 'overflow' other than 'visible' (except when that value has been propagated to the viewport) establish new block formatting contexts for their contents.
>
> In a block formatting context, boxes are laid out one after the other, vertically, beginning at the top of a containing block. The vertical distance between two sibling boxes is determined by the ['margin'](https://www.w3.org/TR/CSS2/box.html#propdef-margin) properties. Vertical margins between adjacent block-level boxes in a block formatting context [collapse](https://www.w3.org/TR/CSS2/box.html#collapsing-margins).
>
> In a block formatting context, each box's left outer edge touches the left edge of the containing block (for right-to-left formatting, right edges touch). This is true even in the presence of floats (although a box's line boxes may shrink due to the floats), unless the box establishes a new block formatting context (in which case the box itself [may become narrower](https://www.w3.org/TR/CSS2/visuren.html#bfc-next-to-float) due to the floats).
>
> For information about page breaks in paged media, please consult the section on [allowed page breaks](https://www.w3.org/TR/CSS2/page.html#allowed-page-breaks).
>
> by - [w3c: 9.4.1 Block formatting contexts](https://www.w3.org/TR/CSS2/visuren.html#block-formatting)

### 创建一个 BFC

第一段在描述如何创建一个 BFC, 目前[根据总结](https://juejin.im/post/5b704f18e51d4566612667c2)有如下14种方法(别担心, 实际我们常用的并没有那么多)可以使得一个区域变成一个 BFC:

> 1. 根元素或包含根元素的元素，这里我理解为body元素
> 2. 浮动元素（元素的float不是none）
> 3. overflow值不为visible的块元素
> 4. 绝对定位元素（元素的position为absolute或fixed）
> 5. 行内块元素（元素的display为inline-block）
> 6. 弹性元素（display为flex或inline-flex元素的直接子元素）
> 7. 网格元素（display为grid或inline-grip元素的直接子元素）
> 8. 表格单元格（元素的display为table-cell，html表格单元格默认为该值）
> 9. 表格标题（元素的display为table-caption，html表格标题默认为该值）
> 10. 匿名表格单元格元素（元素的display为table、table-row、table-row-group、table-header-group、table-footer-group（分别是html table、row、tbody、thead、tfoot的默认属性）或inline-table）
> 11. display值为flow-root的元素
> 12. contain值为layout、content或strict的元素
> 13. 多列容器（元素的column-count或column-width不为auto，包括column-count为1）
> 14. column-span为all的元素始终会创建一个新的BFC，即使该元素没有包裹在一个多列容器中

其中前六点是我们目前比较常碰到的情况, 尤其是第一点很容易忽略

### Margin Collapse

第二段在描述在一个 BFC 内部的子元素在垂直方向上会从顶部开始按照自上而下的顺序排布, 两个子元素 box 之间的距离由 margin 决定, **相邻(含义见下面)**的 box 之间的 margin (margin-bottom和margin-bottom) 会发生**折叠[margin collapse]**现象, **折叠**具体表现为如下三点:

1. 如果二者的 margin 都是正数或者负数, 那么最后二者之间的距离是二者中绝对值大的那一个
2. 如果一个为正, 另一个为负, 那么最后二者之间的距离是二者相加的和

同时要注意这样的折叠是有条件的, 除了满足上面说的要在同一个 BFC 中的相邻子元素之间, 还有如下条件:

1. 在定位规则为正常文档流中的块级盒(非float, 非绝对定位), 且在同一 BFC
2. 是垂直方向上的 margin
3. 两 margin 相邻, 中间无任何间隔包括包含 padding, boarder, line-box, clearance(clear属性), 意味着会发生折叠的两个 margin 是直接接触的, 没有被任何东西隔开

**相邻**的情况是指如下两种:
1. 兄弟: 两个子元素之间的 margin-bottom 和 margin-top
2. 父子: 父容器的 margin-top 和第一个子元素的 margin-top之间, 父容器的 margin-bottom 和 最后一个子元素的 margin-bottom 之间

### 水平排布

第三段内容简单一点, 是说在 BFC 内部的子元素的左边距会与 BFC 容器的左边对齐(从右到左布局的话那么就对齐到右边)(我目前没有发现用途).

### 避免高度坍塌

BFC 的另外一个特点就是可以避免父容器的高度坍塌, 在 float 布局中如果子元素浮动了, 那么父元素的高度在计算的时候就不会计算子元素的高度(父元素的宽度仍然会计算浮动子元素的宽度), 那么很容易出现父元素高度不高, 导致子元素在视觉上出现在父元素外面的情况, 而 BFC 的一个特点就是会包納内部的浮动元素, 所以如果使用`overflow: auto`或者其它的方式使得父容器变为一个 BFC 容器的话, 那么父元素就会包含浮动的子元素了, 也就不会出现高度坍塌了.

## 参考资料

1. [https://juejin.im/post/5b704f18e51d4566612667c2](https://juejin.im/post/5b704f18e51d4566612667c2)





