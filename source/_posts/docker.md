---
title: Docker
date: 2018-09-10 13:19:34
categories:
  - tool
tags:
  - docker
---
# docker学习笔记

Docker是一个开源的引擎，可以轻松的为任何应用创建一个轻量级的、可移植的、自给自足的容器。开发者在笔记本上编译测试通过的容器可以批量地在生产环境中部署，包括VMs（虚拟机）、bare metal、OpenStack 集群和其他的基础应用平台.
<!-- more -->

如无特殊说明, 以下操作环境均为`CentOS 7`, 内核版本位`3.10.0-693.2.2.el7.x86_64`
(查看内核版本: `uname -r`)

## docker常用命令

```bash
# 安装docker
yum install -y docker

# 查看已安装的docker, 或者 docker info
docker version

# 启动docker服务
service docker start

# 查看已下载的镜像 或 docker images
docker image ls 

# 从仓库抓取镜像到本地, Docker 官方提供的镜像都存放在 library 组里, 同时这也是默认的组
# 例如 docker image pull library/hello-world 等价于 docker image pull hello-world
docker image pull [imageName]

# 删除已下载的镜像, 如果有使用该镜像创建的容器, 那么必须先删除对应的容器才能删除镜像
docker image rm [imageName]

# 从镜像创建容器并运行
# 给个hello-world的测试例子, 由于本地没有hello-world这个镜像，所以会自动下载一个hello-world的镜像，并在容器内运行。
docker run [imageName]

# 列出正在运行的容器
# dcoker container ls
# docker contaienr ls --all 列出所有容器, 包括已停止的
docker ps

# 停止容器 或强制停止: docker container kill [containID]
docker stop [containerId]

# 启动已经停止的容器
docker start [containerId]

# 重启容器
docker restart [containerId]

# 删除容器
docker rm [containerId]

# 获取容器的输出信息
docker logs [containerId]

# 查看当前已经运行的容器(可以看到容器id: CONTAINER_ID)
docker ps

# 进入容器内部(推荐使用exec)
docker exec -it [containerId] /bin/bash
# 参数说明
# -i 以交互方式运行，是阻塞式的
# -t 分配一个伪终端，这个参数通常与-i参数一起使用，然后， 在后面跟上容器里的/bin/bash，这样就把我们带到容器里去了。
# -d 以后台方式执行，这样，我们执行完这条命令，还可以干其他事情，写脚本最常用

# 查看某个容器的日志
docker container logs [containerId]

# 在宿主机和容器之间拷贝文件, 容器未启动也可拷贝
# docker cp containerId:from/path/to/file to/owner/path
docker cp from/owner/path containerId:to/path/to/file

# 查看各容器占用的系统资源
docker stats

# 保存对容器的更改, 生成一个新的镜像
docker commit [containerId] [newImageName]
```

## 编写一个 Dockerfile

我们可以从一个 Dockerfile 来新建一个镜像来满足自己自定义的需求.

我们一般会新建一个`.dockerignore`文件, 表示在拷贝文件到镜像中的时候要忽略哪些文件, 就像是`.gitignore`一样(语法也一样), 一般而言, 我们都会忽略诸如`.git`和`node_modules/`等文件夹

```dockerfile
# FROM 表示新建的镜像文件所依赖的基础镜像, 我这里是在8.12.0的版本的node镜像的基础上进行定制的
FROM node:8.12.0
# LABEL 指令用于向镜像中添加元数据，可以通过docker inspect命令查看, 比如下面指定该镜像维护者信息(旧的 MAINTAINER 字段已经废弃)
LABEL maintainer="kricsleo.com"
# COPY 表示文件拷贝, 第一个参数是本机源文件路径, 第二个参数是镜像中的目的文件路径, 这里表示将当前文件夹下的内容全部拷贝到镜像中的`/workspace/node`目录中
# 与 COPY 类似的命令是 ADD, ADD 的功能更丰富, 除了与 COPY 相同的作用外, 它还可以下载远程的文件拷贝进去, 还可以将压缩的文件自动解压后拷贝到镜像中
COPY . /workspace/node
# WORKDIR 指定镜像中接下来的工作目录, 命令等都将在这个目录上执行
WORKDIR /workspace/node
# RUN 表示新建镜像前要执行的命令, 这里执行了`npm install`将会安装项目的所有依赖, 这些依赖安装完成后都会被打包进入镜像文件中
# RUN 命令可以有多个, 每一个 RUN 命令都会创建一层镜像, 类似于洋葱结构, 后面的 RUN 失败导致镜像构建失败时, 下次重新构建的话会从上一个成功的
# 那一层镜像开始构建, 注意可以按照需求合并 RUN 命令, 可以避免多余的层级
RUN npm install
# EXPOSE 表示向外提供服务的端口号, 可以指定多个, 用空格分开即可, 一般我们可以在后面创建容器的时候使用`-p`参数来将宿主机和容器中暴露的端口号进行映射
EXPOSE 3000
# CMD 表示启动容器之后在容器中要运行的命令, 这里相当于告诉容器运行之后运行`/bin/bash`
# 我们一般在从镜像启动容器的时候类似于`docker run -it <image> /bin/bash`, 这里最后的`/bin/bash`命令会覆盖我们指定的 CMD 命令
# CMD 命令只能存在一个, CMD [command, param1, param2, ...], 后面的参数都会传递给这个命令
CMD ['/bin/bash']
```

Dockerfile 编写完成以后我们就可以来使用它构建一个镜像了.

```bash
# build 表示开始构建镜像
# -t 表示构建的镜像名和版本标签, 默认是 latest
# -f 指定 Dockerfile 的路径
# 最后的 . 表示工作环境为当前目录, 如果 Dockerfile 也在当前目录, 那么可以不用指定 -f 参数
docker build -t [imageName:tag] -f [/path/to/Dockerfile] .
```

参考资料:[Dockerfile的编写](http://notes.maxwi.com/2017/12/14/docker-Dockerfile/)

## docker中使用mysql

```bash
# 下载mysql镜像
docker pull mysql

# 从镜像创建并运行一个容器
docker run --name first-mysql -p 3306:3306 -e MYSQL\_ROOT\_PASSWORD=root -d mysql
# 参数说明:
# --name 指定容器独一无二的名字
# -p mysql容器的端口映射
# -e <key=value>	设置进入后可以使用的环境变量，这样动态指定比较灵活,  'MYSQL\_ROOT\_PASSWORD'字段指定的是 root
# 用户的密码
# -d 表示使用守护进程, 即服务挂在后台
```

在我本机连接阿里云上的ECS中的mysql容器时无法连接, 后来排查使用如下解决方案:
1. 编辑ECS的安全组规则
  把mysql的通信端口3306加入到允许列表中, 如果你是把docker里面的mysql的端口映射到ECS的其它端口, 比如3307, 那么这里你就把这个映射之后的端口3307加入到运行列表即可;
2. 编辑ECS的防火墙
  ECS的防火墙可能会拦截3306端口的通信, 那么你需要打开这个端口, 让防火墙允许端口通信, 我的ECS系统是CentOS7, 在CentOS7中是使用`firewall`来管理端口通信的, 那么使用如下方法加入3306端口: 

  ```bash
  # 永久加入3306端口
  firewall-cmd --zone=public --add-port=3306/tcp --permanent
  # 参数说明:
  # –zone 作用域
  # –add-port=80/tcp 添加端口，格式为：端口/通讯协议
  # –permanent 永久生效，没有此参数重启后失效

  # 重启防火墙生效
  firewall-cmd --reload
  ```

  另外附上常用防火墙命令:

  ```bash
  # 关闭防火墙
  systemctl stop firewalld

  #打开防火墙
  systemctl start firewalld

  #查看防火墙状态
  firewall-cmd --state
  ```

## 安装 Elasticsearch

我安装的版本是**6.5.4**, 需要指定版本安装, 因为没有默认的'lastest'版本

```bash
# -it 参数代表分配并且进入该容器的终端, 可以看到命令行详细的启动过程, 也可以进行命令交互
# -d 参数代表在后台守护该容器的进程一直运行
# --name: 为此次运行的容器起一个好记的名字
# 使用 -e 指定多个参数, 因为我服务器是个只有1G内存的小水管, 而 es 在5版本之后的默认最大内存使用是2G, 所以我
# 指定了 ES_JAVA_OPTS="-Xms200m -Xmx200m" 参数来限制最大使用 200m 堆内存, 但是不知道怎么回事, 内存还是会一直往上飙,
# 会远远超过我指定的内存
# 指定 NETWORK_HOST="0.0.0.0", 可以让 es 接受来自任意ip地址的访问
# 最后指定了本次启动的容器从 docker.io/elasticsearch:6.5.4 镜像创建
docker run -d --name es -p 9200:9200 -p 9300:9300 -e ES_JAVA_OPTS="-Xms150m -Xmx150m" -e NETWORK_HOST="0.0.0.0" docker.io/elasticsearch:6.5.4
```

### 安装 elasticsearch-head

```bash
# elasticsearch-head 使用的端口是9100
docker run -d -p 9100:9100 docker.io/mobz/elasticsearch-head:5
```

然后访问ip:9100, 在页面上填入 es 的地址ip:9200, 如果无法连接, 那么需要在 es 的配置文件 `elasticsearch.yml`中添加参数

```bash
# 如果启用了 HTTP 端口，那么此属性会指定是否允许跨源 REST 请求
http.cors.enabled: true
# 如果 http.cors.enabled 的值为 true，那么该属性会指定允许 REST 请求来自何处
http.cors.allow-origin: "*"
```

### 安装中文分词 ik

进入 es 容器中, 使用 es 自带的命令安装插件
```bash
# 注意安装对应 es 版本的 ik 分词插件, 我的 es 是6.5.4, 所以安装的6.5.4的 ik
elasticsearch-plugin install https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v6.5.4/elasticsearch-analysis-ik-6.5.4.zip
```

### elasticsearch 的使用

参考[使用 Elasticsearch 实现博客站内搜索](https://imququ.com/post/elasticsearch.html)

初始化和写入数据都可以了, 但是现在碰到一个问题, 我的博客主站是托管在 github 上的, github 只提供静态资源服务, 那么我这个部署在阿里云上的 es 要如何联动起来使用上搜索功能呢?

~~通过 nginx 分发?~~目前使用 nginx 分发达到了在备用域名 try.kricsleo.com 上可以调用部署在阿里云上的 es 服务

放出我的博客文章的 mapping 

```js
{
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
        type: 'text'
      },
      author: {
        type: 'text',
      },
      categories: {
        type: 'keyword',
      },
      tags: {
        type: 'keyword',
      },
      create_date: {
        type: 'date',
        index: false
      },
      update_date: {
        type: 'date',
        index: false
      }
    }
  }
}
```

搜索时使用的生成 DSL 查询语句的方法

```js
const generateDSL = (query = '', from = 0, size = 10) => ({
  index: 'blog',
  type: 'article',
  q: query,
  from,
  size,
  body: {
    query: {
      dis_max: {
        queries: [
          {
            match: {
              title: {
                query: keyword,
                minimum_should_match: '50%',
                boost: 4,
              }
            }
          },
          {
            match: {
              subtitle: {
                query: keyword,
                minimum_should_match: '50%',
                boost: 4,
              }
            }
          }, {
            match: {
              content: {
                query: keyword,
                minimum_should_match: '75%',
                boost: 4,
              }
            }
          }, {
            match: {
              tags: {
                query: keyword,
                minimum_should_match: '100%',
                boost: 2,
              }
            }
          }, {
            match: {
              categories: {
                query: keyword,
                minimum_should_match: '100%',
                boost: 2,
              }
            }
          }
        ],
        tie_breaker: 0.3
      }
    },
    highlight: {
      pre_tags: ['<b>'],
      post_tags: ['</b>'],
      fields: {
        title: {},
        content: {},
      }
    }
  }
});
```

## 参考资料

[使用 Elasticsearch 实现博客站内搜索](https://imququ.com/post/elasticsearch.html)
[Docker 入门教程](http://www.ruanyifeng.com/blog/2018/02/docker-tutorial.html)
[docker安装elasticSearch以及系列插件](https://www.xuchuruo.cn/%E4%BD%BF%E7%94%A8docker%E5%AE%89%E8%A3%85elasticsearch.html)
[Docker安装elasticsearch5（爬坑心得）](https://blog.csdn.net/qq_23250633/article/details/81327001): 内存不足无法启动 es 解决方法
