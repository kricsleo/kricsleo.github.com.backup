---
title: ASCII-Unicode-UTF8
date: 2018-09-05 17:33:51
tags:
  - encrypt
---
# ASCII, Unicode和UTF8之间的关系
本文主要了解一下ASCII码、Unicode码和UTF-8码的来源和相互之间的关系, 顺便也理了一下中文编码GB2312, GBK, GB18030的关系。
<!-- more -->

## ASCII码
在上世纪60年代，美国制定了ASCII码，主要目的是为了用二进制编码的方式来表达英文字符，用一个8位的字节大小对应了128个字符，其中包括了可打印出来的96个字符和32个不可打印的控制字符, 规则是二进制中第1位固定为`0`, 后面7位用来编码, 刚好可以表示2<sup>7</sup> = 128个字符, 例如规定空格<kbd>SPACE</kbd>的编码为`00100000`, 十进制是`32`, 大写字母`A`的编码为`01000001`, 十进制是`65`, 附上[ASCII码表](https://www.sojson.com/asciitable.html)

## GB2312, GBK, GB18030
- GB2312 是对 ASCII 的中文扩展, 一个小于127的字符的意义与ASCII码相同, 但是当两个大于127的字符连在一起时就表示汉字, 同时GB2312在127之外的地方把ASCII已经有的数字, 标点和字母又重新加入了一遍, 这些重新加入的字符占用两个字节的空间, 也就是说在GB2312中有两套数字, 字母和标点, 码值小于127的那一套因为是ASCII码, 只占用一个字节, 就叫'半角'符号, 而新加入的一套数字, 字母和标点就叫'全角'符号.
- 因为GB2312只收录了6763个汉字, 很多的汉字也需要加入编码中, 所以微软对GB2312进行了扩展, 规定只要第一个字节大于127, 那么就不管后面一个字节是不是大于127的, 通通都认为这两个字节一起表示了一个汉字, 这样就又增加了近20000个新的汉字（包括繁体字）和符号, 扩充之后就成为GBK标准, 它向下兼容GB2312编码，出现于Windows 95简体中文版中, 但是这个是微软标准, 并不是国家标准.
- 后来又加入了少数民族文字，于是我们再扩展，又加了几千个新的少数民族的字，GBK扩成了GB18030, GB18030成为了国家标准.

## Unicode码
ASCII码虽然满足了美国的需求,但是对于其它语言而言128个字符是远远不够的, 比如法语中字母上方有注音, 这是ASCII码无法表示的, 又比如汉字有10万左右, 这也是超出了ASCII码的范围, 所以后来Unicode码出现了.
Unicode码有着很大的容量, 现在的规模可以容纳100多万个符号, 每个符号的编码都不一样, 比如，U+0639表示阿拉伯字母Ain，U+0041表示英语的大写字母A，U+4E25表示汉字`严`。你可以使用在线的[工具](https//tool.chinaz.com/Tools/unicode.aspx)来转换成Unicode码. 
### Unicode码编码方式
Unicode码只是定义了每个字符对应的二进制代码是什么, 但是并没有规定字符对应的二进制应该以什么样的形式存储, Unicode统一规定，每个符号用三个或四个字节表示. 比如汉字`严`的Unicode码是十六进制数4E25, 转换成二进制就是`100111000100101`一共是15位, 至少占用2个字节的空间, 而其他的字符可能有更多的二进制位数, 而之前的ASCII码是固定为8位的, 如果采取将前面多余的位数全都置0的话, 那么在存储原来的ASCII码编码的文件时就会浪费大量的空间来存储无用的0信息, 这是不可接受的. 所以如何合理的用Unicode码来兼容原先的ASCII码信息就产生出了多种具体的实现方式. 
### UTF-8实现Unicode
UTF-8是目前使用最多的Unicode编码实现方式, 除此之外也有 UTF-16（字符用两个字节或四个字节表示）和 UTF-32（字符用四个字节表示）实现方式, 不过基本不使用.
UTF-8 最大的一个特点，就是它是一种变长的编码方式。它可以使用1~4个字节表示一个符号，根据不同的符号而变化字节长度。
按照如下两条规则来编码字符:
1. 对于单(n = 1)字节的符号，字节的第一位设为0，后面7位为这个符号的 Unicode 码。因此对于英语字母，UTF-8 编码和 ASCII 码是相同的。

2. 对于多(n > 1)字节的符号，第一个字节的前n位都设为1，第n + 1位设为0，后面字节的前两位一律设为10。剩下的没有提及的二进制位，全部为这个符号的 Unicode 码。
下表总结了编码规则，字母x表示可用编码的位。
```text
Unicode符号范围     |        UTF-8编码方式
(十六进制)        |              （二进制）
----------------------+---------------------------------------------
0000 0000-0000 007F | 0xxxxxxx
0000 0080-0000 07FF | 110xxxxx 10xxxxxx
0000 0800-0000 FFFF | 1110xxxx 10xxxxxx 10xxxxxx
0001 0000-0010 FFFF | 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
```
在解码的时候现查看二进制的第一位, 如果是0, 那么说明是单字节的字符, 直接将该字节按照Unicode码表转换成对应的字符即可, 如果第一位是1, 那么继续查看有几个连续的1, 有n个, 则说明连续的n个字节代表一个字符.
以汉字`严`为例, `严`的Unicode码是`4E25`(二进制为`100111000100101`), 根据上表, `4E25`处于`0000 0800 - 0000 FFFF`范围, 那么`严`的编码格式就是`1110xxxx 10xxxxxx 10xxxxxx`, 也就是说`严`的UTF-8编码方式就需要占用三个字节, 我们把`严`的二进制按照顺序填到`x`的位置, 最后得到的结果就是`11100100 10111000 10100101`, 转成16进制就是`E4B8A5`, 这就是`严`的UTF-8编码结果.
总得来说, `严`的Unicode码为`4E25`, UTF-8编码为`E4B8A5`, 这就好比你的身份证是`123456`, 在学校站队时老师按照一定的排队方式把你编排到了`五组三排第二个`, 这两者最后的结果是可以相互转换的, 你可借助在线[工具](https//tool.chinaz.com/Tools/unicode.aspx)验证.

## JavaScript中的Unicode与UTF-8
javascript程序是使用Unicode字符集编写的, 所以我们在JavaScript中经常使用的字符或者字符串实际上内部是采用Unicode编码的, 在有些情况下, 比如我们的服务器要求接受的二进制内容的编码必须是UTF-8, 那么我们在把JavaScript中的字符串发送到服务器之前就需要进行转码, 将Unicode字符串转为UTF-8字符串. 我们在前端有时候会看到的服务器返回的json数据中乱码实际上就是因为服务器发送数据的编码跟我们客户端接受数据的编码方式不一致导致的, 你可以试着将乱码字段拷贝到在线[工具](https//tool.chinaz.com/Tools/unicode.aspx)中进行转码, 比如选择将`Unicode转为UTF-8`, 然后你就能看到正确的信息.

除了数据交互之外, 浏览器的URI也是我们能够了解这种编码转换的地方, 因为URI中的querystring必须按照UTF8的编码进行传输, 但是JavaScript中是Unicode的, 如果没有中文信息还好, 因为英文字符在这两者之间的码值是保持一致的, JavaScript的字符串`hello`到了URI中也还是`hello`, 如果你不手动去转换也是ok的, 但是一旦涉及到中文(包括其它非英文字符), 比如汉字`严`, 它的Unicode码值和UTF-8码值就差的很远, 如果你不进行手动转换, 直接将JavaScript中的字符`严`丢到地址栏的URI中, 那么就会导致URI乱码, 你再想从URI中把之前放进去的`严`取出来就会发现得到的根本不是汉字`严`, 而是一串乱码.

## 在JavaScript中如何转换Unicode与UTF-8
- 浏览器提供了三对方法来进行编码转换,`escape/unescape`, `encodeURI/decodeURI`和`encodeURIComponent/decodeURIComponent`.
  1. 第一对`escape/unescape`是非标准的, **[已经被废弃](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/escape)**, 这里只说一下它的转码方式, `escape`在处理大于127的字符时是在字符的Unicode码前面直接加上一个`%u`, 例如`严`的Unicode码为`4E25`, 那么`escape('严')`的结果就是`%u4E25`, 再次强调, **请不要使用`escape/unescape`, 它已被废弃**;
  2. 第二对`encodeURI/decodeURI`是用来给整个URL进行转码的, 它不会转义`&, ?, /, =`这样的功能字符;
  3. 第三对`encodeURIComponent/decodeURIComponent`是用来给URL的部分字段进行转码的, 它会对`&, ?, /, =`这些特殊字符进行转义, 一般用来处理key-value形式的query字段.
`encodeURI`和`encodeURIComponent`都是先将非英文字符的Unicode码转为UTF-8码, 然后在每个字节前面都加上一个`%`, 比如汉字`严`的Unicode码是`4E25`, 使用`encodeURI`编码时会先转成UTF-8码`E4 B8 A5`, 在用`%`连接起来就得到最后结果`%E4%B8%A5`.
```JavaScript
//编码
encodeURIComponent('严'); // => '%E4%B8%A5'

//解码
decodeURIComponent('%E4%B8%A5'); // => '严'

//encodeURI和encodeURIComponent对比
encodeURI('www.kricsleo.com?name="张三"'); // => "www.kricsleo.com?name=%22%E5%BC%A0%E4%B8%89%22"

encodeURIComponent('www.kricsleo.com?name="张三"') // => "www.kricsleo.com%3Fname%3D%22%E5%BC%A0%E4%B8%89%22"
```
- 我们也可以自己用js来使用Unicode和UTF-8之间的相互转换
```JavaScript
/**
 * 将字符串格式化为UTF8编码的字节
 */
const toUTF8 = function (str, isGetBytes) {
      var back = [];
      var byteSize = 0;
      for (var i = 0; i < str.length; i++) {
          var code = str.charCodeAt(i);
          if (0x00 <= code && code <= 0x7f) {
                byteSize += 1;
                back.push(code);
          } else if (0x80 <= code && code <= 0x7ff) {
                byteSize += 2;
                back.push((192 | (31 & (code >> 6))));
                back.push((128 | (63 & code)))
          } else if ((0x800 <= code && code <= 0xd7ff) 
                  || (0xe000 <= code && code <= 0xffff)) {
                byteSize += 3;
                back.push((224 | (15 & (code >> 12))));
                back.push((128 | (63 & (code >> 6))));
                back.push((128 | (63 & code)))
          }
       }
       for (i = 0; i < back.length; i++) {
            back[i] &= 0xff;
       }
       if (isGetBytes) {
            return back
       }
       if (byteSize <= 0xff) {
            return [0, byteSize].concat(back);
       } else {
            return [byteSize >> 8, byteSize & 0xff].concat(back);
        }
}

toUTF8('严'); // =>  [0, 3, 228, 184, 165]

/**
 * 读取UTF8编码的字节，并转为Unicode的字符串
 */
const fromUTF8 = function (arr) {
    if (typeof arr === 'string') {
        return arr;
    }
    var UTF = '', _arr = arr;
    for (var i = 0; i < _arr.length; i++) {
        var one = _arr[i].toString(2),
                v = one.match(/^1+?(?=0)/);
        if (v && one.length == 8) {
            var bytesLength = v[0].length;
            var store = _arr[i].toString(2).slice(7 - bytesLength);
            for (var st = 1; st < bytesLength; st++) {
                store += _arr[st + i].toString(2).slice(2)
            }
            UTF += String.fromCharCode(parseInt(store, 2));
            i += bytesLength - 1
        } else {
            UTF += String.fromCharCode(_arr[i])
        }
    }
    return UTF
}

fromUTF8([0, 3, 228, 184, 165]); // => '严'
```

参考资料:
1. 阮一峰的博客: https//www.ruanyifeng.com/blog/2007/10/ascii_unicode_and_utf-8.html
2. segmentfault上张亚涛的专栏: https://segmentfault.com/a/1190000005794963





