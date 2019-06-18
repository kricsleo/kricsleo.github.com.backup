---
title: elasticsearch
date: 2019-05-08 10:53:26
subtitle: elasticsearch 笔记
categories:
  - database
tags:
  - nodejs
  - elasticsearch
---

# elasticsearch

我的博客之前的搜索都是使用的[`hexo-generator-json-content`](https://github.com/alexbruno/hexo-generator-json-content)这个插件来生成的静态json文件, 在搜索的时候会去请求这个json文件, 里面是整个博客站点的文章数据, 随着博客的数量变多, 这个文件也越来越大, 导致第一次搜索的时候下载这个文件就会出现很长时间的等待, 所以也一直想要优化博客的搜索. 

之前做爬虫的时候使用过[`elasticsearch`](https://www.elastic.co/cn/)这个全文检索库, 感觉检索非常方便和快速, 所以这次有时间了就把博客的搜索完全迁移到了es上, 另外还顺带写了一个自动同步 hexo 博客数据到 es 里面的插件[`hexo-elasticsearch`](https://www.npmjs.com/package/hexo-elasticsearch)

<!-- more -->

我有一个阿里云的ECS服务器, 不过内存很小只有1G, 我把node端和es都使用docker的方式部署在了这个服务器上, 然后给es分配了300多M的内存, 虽然官方建议分配内存是2G, 但是我这小水管服务器实在是没那么多, 内存给的太多了服务器直接就会挂掉, 好在目前我的博客数据也没那么多, 分配的内存暂时够用. 部署过程可以看我这篇博客[docker学习笔记](/docker/).

## 关于elasticsearch

有部分想法借鉴了屈屈的博客[使用 Elasticsearch 实现博客站内搜索](https://imququ.com/post/elasticsearch.html)

elasticsearch是一个基于lucene的全文检索库, 向外提供了简洁易用的restful api, 同时在Python, java 和 js 等语言中都有对应的实现, 使用起来很方便. 我现在主要做前端开发, 所以服务端使用的是轻量的 nodejs, 然后引用的[`elasticsearch`](https://www.npmjs.com/package/elasticsearch)这个npm包来实现对 es 的操作.

我使用到的也只是es比较简单的一部分功能, 已经完全可以满足我博客的搜索需求.

> Elasticsearch 集群可以包含多个索引（Index），每个索引可以包含多个类型（Type），每个类型可以包含多个文档（Document），每个文档可以包含多个字段（Field）。以下是 MySQL 和 Elasticsearch 的术语类比图，帮助理解： 
> 
> MySQL | Elasticsearch
> :-: | :-:
> Database | Index
> Table | Type
> Row | Document
> Column | Field
> Schema | Mapping
> Index | Everything Indexed by default
> SQL | Query DSL
> --[使用 Elasticsearch 实现博客站内搜索](https://imququ.com/post/elasticsearch.html)

## 相关api

[API Reference](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html)
[How to Integrate Elasticsearch into Your Node.js Application](https://qbox.io/blog/integrating-elasticsearch-into-node-js-application)
[Elasticsearch 6.x Mapping设置](https://juejin.im/post/5b799dcb6fb9a019be279bd7)

- `new elasticsearch.Client()`
第一步是新建一个es连接
```js
const es = require('elasticsearch');
const client = new es.Client({
  // es 的连接地址及ip
  host: 'your_es_host:port',
  // 日志, 如果配置了的话每次操作es都会在控制输出相关信息
  log: 'trace'
});
```

- `client.info()`
连接之后可以通过`info`api查看es的相关信息, 检查是否连接成功, 也可使用`client.ping()`来测试连接
```js
client.info({})
  .then(info => console.log(info))
  .catch(error => console.error(error))

// 或者使用 ping 来查看连接是否正常
client.ping({
  requestTimeout: 30000
}).then(success => {
  if(success) {
    console.log('es connected!');
  } else {
    console.error('es connect error!');
  }
})
```

- `client.indices.create([params] [, options] [, callback])`
创建索引, 存储数据之前一般都要先创建一个索引, 之后所有的数据都会存储在这个索引中
```js
client.indices.create({
  // index_name 就是索引的名字
  index: 'index_name'
}).then(res => console.log('index success', res))
  .catch(err => console.warn('index fail', err))
```

- `client.indices.putMapping([params] [, options] [, callback])`
在有了索引之后, 我们可以创建一个`Type`, 然后定义`Type`里面的各自字段的结构和索引信息, 也就是创建`Mapping`, 和MySQL不同的是在M有SQL里面要先定义好表结构(scheme)然后才能往表里插入数据, 但是在es中我们可以不用先定义`Mapping`直接就插入数据, es会自动根据数据的类型建立索引, 并且数据字段也可以动态增长, 这是es非常灵活的一点, 但是我仍然先定义`Mapping`再插入数据, 主要是因为这一步可以定义好各个字段的索引规则

对于一个字段首先指定该字段的`type`(数据类型), 可以查看[Mapping](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html)里面的可用字段类型, 比较常用的有  
  - `text`: text 类型数据会被分词器拆分开来检索, 例如`我的名字`会被拆分成`我`, `我的`, `名字`和`我的名字`一般用于一段文字内容的检索, 如果不需要分词可以配置`index`项为`false`, 但是如果不需要分词的话就推荐使用`keyword`类型, `keyword`类型默认就是不进行分词的
  - `keyword`: keyword 类型数据不会被拆分, 只能作为整体进行匹配, 例如`我的名字`就只能搜索`我的名字`才能搜索到, 一般用于关键词之类的检索
  - `date`: 日期类型
  - `long`: 长整型数据
  - `double`: 浮点数数据
  - `boolean`: 布尔值
  - `ip`: ip地址

然后是`term_vector`(词条向量), 这个配置项代表对该字段的各个term的统计信息, 如果某个词出现的位置和频率等, 具体可以查看这里[ElasticSearch之termvector介绍](https://blog.csdn.net/wangmaohong0717/article/details/80712978)

`analyzer`配置指定该字段使用的分词器, 如果不指定, 那么使用的就是默认分词器(standard analyzer), 我这里安装了对中文分词友好[`elasticsearch-analysis-ik`](https://github.com/medcl/elasticsearch-analysis-ik)插件, 使用的是该插件提供的分词器, ik 提供了`ik_max_word`和`ik_smart`两个分词器, 前者会将文本做最细粒度的拆分，比如会将“中华人民共和国国歌”拆分为“中华人民共和国,中华人民,中华,华人,人民共和国,人民,人,民,共和国,共和,和,国国,国歌”，会穷尽各种可能的组合，适合 Term Query; 后者会做最粗粒度的拆分，比如会将“中华人民共和国国歌”拆分为“中华人民共和国,国歌”，适合 Phrase 查询.

`search_analyzer`配置搜索时使用的分词器, 默认和`analyzer`保持一致

我的博客的`Mapping`如下
```js
client.indices.putMapping({
  index: 'blog',
  type: 'article',
  body: {
    properties: {
      title: {
        type: 'text',
        term_vector: 'with_positions_offsets',
        analyzer: 'ik_max_word',
        search_analyzer: 'ik_max_word'
      },
      subtitle: {
        type: 'text',
        term_vector: 'with_positions_offsets',
        analyzer: 'ik_max_word',
        search_analyzer: 'ik_max_word'
      },
      content: {
        type: 'text',
        term_vector: 'with_positions_offsets',
        analyzer: 'ik_max_word',
        search_analyzer: 'ik_max_word'
      },
      link: {
        type: 'keyword'
      },
      author: {
        type: 'keyword',
      },
      categories: {
        type: 'keyword',
      },
      tags: {
        type: 'keyword',
      },
      create_date: {
        type: 'date',
      },
      update_date: {
        type: 'date',
      }
    }
  }
});
```

- `client.index([params] [, options] [, callback])`
像某个`Type`中插入数据, 这个接口只能一次插入一条数据
```js
client.index({
  // 要插入到哪个 index 中
  index: 'blog',
  // 要插入到哪个 Type 中
  type: 'article',
  // 本次插入的数据的id, 可以不配置, 默认也会生成一个id
  id: 'input-event/',
  // body 内容就是本次插入的数据的各自字段内容
  body: {
    title: 'input event',
    subtitle: 'input 元素的事件顺序',
    author: 'kricsleo',
    tags: ['js', 'h5'],
    categories: ['front-end'],
    content: '如果是组合输入(比如中文日文等)输入的话就会出现括号中组合输入事件, 详细来说是当开始输入中文的时候就会触发`compositionstart`事件, 此时`input`事件和`keyup`事件拿到的输入框的值是不完整的(一般包含你输入的拼音和拼音之间的分号), 当中文输入结束的时候会触发`compositionend`事件, 此时可以取到该输入框的完整的输入中文后的值(一般而言这个值是我们所需要的)',
    create_date: '2015-12-15T13:05:55Z',
    update_date: '2015-12-15T13:05:55Z',
  }
})
```

- `client.bulk([params] [, options] [, callback])`
如果需要批量操作的话就需要使用`bulk`接口, 给`bulk`可以一次传入多种多样的操作, 比如`index`(新增), `update`(更新)和`delete`删除等等

比如我博客生成的json数据里面的一个数组, 每一项都是一篇文章数据, 我需要一次性插入所有文章到es中. 我的做法是每次插入前先清除之前的文章数据, 因为文章里面的内容可能会被更新, 但是博客和es本身是相互独立的, 博客里面是没有记录该文章数据在es中的对应的数据id的, 所以没法去更新es里面的文章数据, 只能先全部清除, 然后再将最新的文章数据全部写入
```js
const es = require('elasticsearch');
const fs = require('fs');
const path = require('path');

const client = new es.Client({
  host: 'your_es_host:port',
  // log: 'trace'
});

// json file path
const JSON_PATH = '../../public/content.json';

// generate docs by post data
function convertPosts2Docs(posts) {
  return posts.map(post => ({
    index: 'blog',
    type: 'article',
    id: post.title,
    body: {
      title: post.title,
      subtitle: post.subtitle || post.title,
      link: `/${post.path}`,
      content: post.text,
      create_date: post.date,
      update_date: post.updated
    }
  }));
}

// generate bulk body by post
function buildBody(post) {
  return {
    body: {
      title: post.title,
      subtitle: post.subtitle || post.title,
      link: `/${post.path}`,
      content: post.text,
      create_date: post.date,
      update_date: post.updated
    }
  }
}

// generate bulk by index, type, posts
function buildBulk(index, type, posts) {
  const bulk = [];
  posts.forEach(post => {
    bulk.push({
      index: {
        _index: index,
        _type: type,
        _id: post.title,
      }
    });
    bulk.push(buildBody(post));
  });
  return bulk;
}

// write json into es
function writeJson(jsonPath) {
  const filePath = path.resolve(__dirname, jsonPath);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`read file: ${filePath} failed!`);
      return;
    }
    const posts = JSON.parse(data);
    const bulk = buildBulk('blog', 'article', posts);
    client.bulk({
      body: bulk
    }).then(res => {
      let errorCount = 0;
      res.items.forEach(item => {
        if (item.index && item.index.error) {
          console.error(`${errorCount++} write failed: `, item.index.error);
        }
      });

      const total = res.items.length;
      console.log(`write done: ${total - errorCount}/${total} write successfully!`);
    })

  });
}

// clear all previous docs
function clearDocs(index, type) {
  return client.deleteByQuery({
    index,
    type,
    body: {
      query: {
        match_all: {}
      }
    }
  }).then(res => {
    console.log(`delete done: ${res.deleted}/${res.total} delete successfully!`);
    return Promise.resolve(res);
  })
}

clearDocs('blog', 'article')
  .then(() => writeJson(JSON_PATH))
  .catch(err => console.error(error))
```

- `client.search([params] [, options] [, callback])`
根据 Query DSL 语句查询符合条件的数据

一个最简单的搜索, 搜索后匹配的数据返回在`hits`字段中
```js
client.search({
  index: 'blog',
  type: 'article',
  q: '中文'
}).then(res => console.log(res))
  .catch(err => console.error(err))
```

目前我的博客使用的搜索语句参考了屈屈的博客里面的搜索语句

```js
const generateDSL = (q = '', from = 0, to = 10) => ({
  index: 'blog',
  type: 'article',
  // 搜索关键词
  q,
  // 搜索条目起始位置
  from,
  // 搜索条目终止位置
  to,
  body: {
    query: {
      // 使用 dis_max 会在最后计算文档的相关性算分的时候, 只会取queries中的相关性的最大值
      // 关于 dis_max 可以查看这里 [Elasticsearch的入门使用](https://juejin.im/post/5b9dbe645188255c865e0d0e#heading-84)
      dis_max: {
        queries: [
          {
            match: {
              // 在哪个字段中进行搜索, 这里是 title 字段
              title: {
                // 要搜索的关键词
                query: q,
                // 最小匹配数
                minimum_should_match: '50%',
                // 设置查询语句的权重, 大于1权重增大, 0到1之间权重逐渐降低。匹配到权重越高的查询语句, 相关性算分越高
                boost: 4,
              }
            }
          },
          {
            match: {
              subtitle: {
                query: q,
                minimum_should_match: '50%',
                boost: 4,
              }
            }
          }, {
            match: {
              content: {
                query: q,
                minimum_should_match: '75%',
                boost: 4,
              }
            }
          }, {
            match: {
              tags: {
                query: q,
                minimum_should_match: '100%',
                boost: 2,
              }
            }
          }, {
            match: {
              categories: {
                query: q,
                minimum_should_match: '100%',
                boost: 2,
              }
            }
          }
        ],
        // 将其他匹配语句的评分也计算在内。将其他匹配语句的评分结果与tie_breaker相乘, 最后与最佳字段的评分求和得出文档的算分。
        tie_breaker: 0.3
      }
    },
    // 会对检索的匹配的结果中，匹配的部分做出高亮的展示, 默认使用标签em包裹
    highlight: {
      // 指定高亮标签前标签
      pre_tags: ['<b>'],
      // 指定高亮标签后标签
      post_tags: ['</b>'],
      fields: {
        // 返回的匹配结果中会列出title字段(数组)
        title: {},
        // 返回的匹配结果中会列出content字段(数组)
        content: {},
      }
    }
  }
});
```

- `client.delete([params] [, options] [, callback])`
删除指定的某条数据, 使用此api删除时必须至少指定`index`, `type`和`id`三个参数, 否则就会删除失败, 也就是说此api只能删除单条数据

```js
client.delete({
  index: 'blog',
  type: 'article',
  id: 'data_id'
})
```

- `client.deleteByQuery([params] [, options] [, callback])`
删除符合条件的数据, 使用此api可以删除多条数据, 只要数据符合 query 的条件即可

比如我每次同步博客数据的时候都会先删除之前的所有历史博客数据使用的就是这个api

```js
client.deleteByQuery({
  index: 'blog',
  type: 'article',
  body: {
    query: {
      // 匹配所有文档
      match_all: {}
    }
  }
}
```

## `elaticsearch`与`hexo`配合

折腾着写了个hexo的插件[`hexo-elasticsearch`](https://www.npmjs.com/package/hexo-elasticsearch), 在每次重新生成文章的时候都会自动把文章信息同步到自己的es库中, 不过如果真的要做到博客中使用es来进行搜索, 那么你还要做部署es和部署nodejs后端提供查询服务两个部分, 目前来说我就是这样实现的, 关于 es 的部署你可以查看我这篇博客: [docker学习笔记](/docker)