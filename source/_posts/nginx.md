---
title: nginx
date: 2018-11-08 10:29:02
subtitle: nginx 部署及配置笔记
categories:
  - front-end
tags:
  - nginx
---

# nginx 的部署与配置笔记

现在很多网站用的都是 nginx 作为代理服务器, 所以为了进行 web 性能的优化, 自然也要折腾一下 nginx 的配置的.
<!-- more -->

我的远程主机环境:

```bash
# linux 通用查看系统版本
lsb_release -a
# LSB Version:    :core-4.1-amd64:core-4.1-noarch
# Distributor ID: CentOS
# Description:    CentOS Linux release 7.4.1708 (Core)
# Release:        7.4.1708
# Codename:       Core
```

## nginx 的安装

参考文章: [nginx服务器详细安装过程（使用yum 和 源码包两种安装方式，并说明其区别）](https://segmentfault.com/a/1190000007116797)

安装 nginx 前要先安装 nginx 编译及运行的依赖环境

```bash
# yum -y install gcc gcc-c++ make libtool zlib zlib-devel openssl openssl-devel pcre pcre-devel
```

nginx 一般来说有两种安装方式: `yum`安装和源码包自行编译安装, 新手推荐前一种, 想折腾的话或者老手使用后一种

- `yum`安装是在线安装, 好处是简单方便, 不易出错, 但是缺点是使用的其实是别人编译好的二进制版本, 不能自定义其中加载的模块, 不过目前来 centos 官方提供的那个版本还是比较实用的

```bash
# 首先把 nginx 的源加载 yum 里面
vi /etc/yum.repo.d/nginx.repo
```

然后在文件里添加如下内容

```conf
[nginx]
name=nginx repo
baseurl=http://nginx.org/packages/centos/$releasever/$basearch/
gpgcheck=0
enabled=1
```

然后就可以使用`yum install nginx`安装最新版了, 也可以`yum install nginx-1.6.3`安装指定版本.安装之后可以使用`rpm -ql nginx`查看安装目录, 卸载时使用`rpm -e nginx`, 如果因为依赖包导致卸载失败，可以尝试`rpm -e --nodeps nginx`来卸载，这个命令相当于强制卸载，不考虑依赖问题。

使用这种方式安装之后 nginx 会被自动添加到系统服务里面, 也就是说可以直接使用`serivce nginx {option}`来启动或者关闭 nginx.

- 源码包编译安装, 好处是编译的时候是根据你本机的条件和环境进行编译的, 性能更好一些,同时也可以在编译的时候自定义模块

```bash
# 可以获取指定版本的 nginx, 可以使用 -P 指定下载目录
wget -c <-P> <destDir> https://nginx.org/download/nginx-1.11.6.tar.gz
# 然后解压下载的压缩包, 可以使用 -C 指定解压目录
tar -zxvf nginx-1.11.6.tar.gz <-C> <destDir>
# 然后进行解压后的目录
cd nginx-1.11.6
# 然后先进行编译配置, 直接使用 ./configure 表示使用默认配置, 也可以在后面附加参数表示一些其他的模块之类的, 请具体根据使用来配置
./configure
# 然后进行编译安装
make && make install
```

一般来说编译安装后的二进制文件都在`/usr/local/`目录下, 如果需要卸载的话直接在这里删除对应的目录就可以, 同时启动 nginx 也可以在这里使用二进制文件直接启动, 见下文 nginx 的使用.

使用源码包编译安装的好处是是可以后期为 nginx 添加各种各样的模块.

比如我在第一次安装的并没有安装 SSL 相关的模块, 后期我想开启 SSL, 这个时候就需要给 nginx 添加`ngx_http_ssl_module`模块.
注意在添加的时候为了保留之前的一些配置, 我们需要先查看之前编译的`configure`配置项, 你可以使用`./nginx -V`来查看, 我的输出如下:

```text
nginx version: nginx/1.15.2
built by gcc 4.8.5 20150623 (Red Hat 4.8.5-28) (GCC)
configure arguments: --prefix=/usr/local/nginx
```

可以看到我的版本是`1.15.2`, 我之前的编译参数是`--prefix=/usr/local/nginx`, 也就是只制定了 nginx 的配置文件路径, 那么我现在需要在原来的基础上添加新的参数`--with-http_ssl_module`才能编译一个新的带有 SSL 模块的 nginx 二进制文件.

1. 找到原来的源码包, 没有的话就下载一个跟你现在用的是同一个版本的 nginx 源码包, 然后解压, 进入解压后的目录
2. 在解压后的目录执行编译前的配置`./configure --prefix=/usr/local/nginx --with-http_ssl_module`, 注意这里一定要把你原来的参数都拷贝过来, 然后在后面添加新的, 要不然编译出来的东西可能跟你原来的不兼容
3. 接下来执行`make`, **这里可千万别手快执行`make && make install`**, 如果你`insall`了那么你之前的 nginx 的配就都丢了, 所以我们这里只需要编译出一个可用的 nginx 的二进制版本, 然后手动替换掉原来的即可.
4. 新编译的 nginx 文件在 `objs/nginx`

```bash
# 将原来的`/usr/local/nginx/sbin/nginx`备份
cp /usr/local/nginx/sbin/nginx /usr/local/nginx/sbin/nginx.back
# 请先停止 nginx 服务, 然后再删除原来的 nginx 文件
rm -f /usr/local/nginx/sbin/nginx
# 把新的 nginx 文件拷贝到原来的地方
cp objs/nginx /usr/local/nginx/sbin/nginx
```

然后再正常启动 nginx 即可使得新的功能生效

## nginx 的使用

有两种方式启动 nginx, 但是后一种相对来说方便一些, 推荐使用.

- 直接在安装目录使用 nginx 的命令进行 nginx 的启动和关闭

```bash
# 启动
/usr/local/nginx/sbin/nginx
# 检查默认配置文件
/usr/nginx/sbin/nginx -t
# 检查指定配置文件
/usr/nginx/sbin/nginx -t -c {configFileDir}
# 使用指定配置文件启动 nginx
/usr/nginx/sbin/nginx -c {configFileDir}
# 关闭 stop 表示立即停止, quit 表示平滑停止, reopen 表示重新启动 reload 不中断服务重新加载配置文件
/usr/local/nginx/sbin/nginx -s {stop|quit|reload|reopen}
# 通过进程查看及关闭 nginx
ps -ef | grep nginx
# 从容停止Nginx：
kill -QUIT 主进程号
# 快速停止Nginx：
kill -TERM 主进程号
# 强制停止Nginx：
kill -9 nginx
```

- 配置 nginx 的启动和关闭到系统服务

1. 在`/etc/init.d/`目录下新建文件`nginx`, 把[这些内容](/code/nginx)拷贝到文件中
2. 赋予脚本可执行权限`chmod +x /etc/init.d/nginx`
3. 修改系统服务之后使用`systemctl daemon-reload`重新加载一下才能生效
4. 可以吧 nginx 服务配置成开机启动 `chkconfig nginx on`
5. 有如下命令可执行:

```bash
service nginx {start|stop|status|restart|condrestart|try-restart|reload|force-reload|configtest}
# 参数说明
# start 启动 nginx
# stop 停止 nginx
# status 查看 nginx 的状态
# restart 重启 nginx, 会先中断 nginx, 然后重新启动, 如果配置文件有误, 那么将无法启动 nginx
# reload 重新加载配置文件, 不会中断 nginx 服务, 如果新的配置文件有误, 那么会使用上一次正确的配置文件, 保证服务正常运行
# configtest 检查配置文件是否正确
```

## nginx 的配置

nginx 的配置相对来说是比较繁杂的, 所以我放到最下面来说, 后期持续补充.
参考文档: [nginx服务器安装及配置文件详解](https://segmentfault.com/a/1190000002797601)

### gzip压缩功能设置

gzip 相关配置可放在 http{} 或 server{} 或 location{} 层级，若不同层级有重复设置优先级为 location{} > server{} > http{}
gzip 配置参数如下

```conf
# 打开 gzip 压缩
gzip on;
# 进行压缩的最小文件大小, 小于这个大小的不进行压缩
gzip_min_length 1k;
# 压缩结果数据流存储所用空间，下面表示以16k为单位，按照原始数据大小以16k为单位的4倍申请内存。默认值是申请跟原始数据相同大小的内存空间去存储gzip压缩结果。
gzip_buffers    4 16k;
# 采用http协议版本 默认是1.1 ，对于1.0的请求不会压缩，如果设置成1.0，表示http1.0以上 的版本都会压缩。(如果使用了 proxy_pass 进行反向代理，那么nginx和后端的 upstream server之间默认是用 HTTP/1.0协议通信的。)
gzip_http_version 1.0;
# 压缩级别（1~9，一般为平衡文件大小和CPU使用，5是常用值，当然跟实际机器的情况有关） 级别越高, 压缩比越大, 但是 cpu 的性能消耗也越高, 同时在压缩到一定程度之后即使再进行压缩文件体积也不会再有明显的减小了. 一般取值在4~6, 这里有一组测试数据
; text/html - phpinfo():
; 0    55.38 KiB (100.00% of original size)
; 1    11.22 KiB ( 20.26% of original size)
; 2    10.89 KiB ( 19.66% of original size)
; 3    10.60 KiB ( 19.14% of original size)
; 4    10.17 KiB ( 18.36% of original size)
; 5     9.79 KiB ( 17.68% of original size)
; 6     9.62 KiB ( 17.37% of original size)
; 7     9.50 KiB ( 17.15% of original size)
; 8     9.45 KiB ( 17.06% of original size)
; 9     9.44 KiB ( 17.05% of original size)

; application/x-javascript - jQuery 1.8.3 (Uncompressed):
; 0    261.46 KiB (100.00% of original size)
; 1     95.01 KiB ( 36.34% of original size)
; 2     90.60 KiB ( 34.65% of original size)
; 3     87.16 KiB ( 33.36% of original size)
; 4     81.89 KiB ( 31.32% of original size)
; 5     79.33 KiB ( 30.34% of original size)
; 6     78.04 KiB ( 29.85% of original size)
; 7     77.85 KiB ( 29.78% of original size)
; 8     77.74 KiB ( 29.73% of original size)
; 9     77.75 KiB ( 29.74% of original size)
gzip_comp_level 5;
# 压缩文件类型（默认总是压缩 text/html类型，其中特别说明的是application/javascript和text/javascript最好都加上，若页面script标签的type不同则有可能发生部分js文件不会压缩，默认type为application/javascript） 一般来说对图片不进行压缩, 因为图片压缩比较耗时而且压缩比也很低
gzip_types application/atom+xml application/javascript application/json application/rss+xml application/vnd.ms-fontobject application/x-font-ttf application/x-web-app-manifest+json application/xhtml+xml application/xml font/opentype image/svg+xml image/x-icon text/css text/plain text/javascript text/x-component;
# 代表缓存压缩和原始版本资源，避免客户端因Accept-Encoding不支持gzip而发生错误的现象（现在一般都采用gzip） 开启此参数以后会在返回头里面看到一个 Vary 字段, 里面会有一个 Accept-Encoding 字段, 代表此资源有着多个版本, 比如 gzip 压缩版 和不压缩版, 关于 Vary 字段的解释可以查看这里: https://imququ.com/post/vary-header-in-http.html
gzip_vary on;
# 禁止IE6进行gzip压缩（当然现在已经基本没有人使用IE6了）
gzip_disable "MSIE [1-6]";
```

参考文章:[Nginx配置指北之gzip](https://segmentfault.com/a/1190000010563519)

### HTTPS 配置

如果要启用 nginx 的 SSL 配置, 那么需要 nginx 安装的时候包含了`http_ssl_module`模块, 默认 nginx 是不会安装这个模块的, 可以使用`./nginx -V`查看 nginx 安装时的配置参数里面有没有这个模块, 如果没有这个模块, 那么我们可以按照上面编译安装的步骤编译一个新的包含这个模块的 nginx 二进制文件, 然后替换掉现在的即可. 然后在 server{} 层级中加入如下配置(请根据自己情况修改)

详细配置说明可以查看[Nginx 配置 HTTPS 服务器](https://aotu.io/notes/2016/08/16/nginx-https/index.html)

```conf
# 网站域名
server_name example.com
# 表示监听 443 端口, 协议为 ssl
listen 443 ssl;
# 证书文件的位置
ssl_certificate     example.com.crt;
# 证书私钥文件的位置
ssl_certificate_key example.com.key;
# SSL 协议具体版本
ssl_protocols       TLSv1 TLSv1.1 TLSv1.2;
# SSL 算法
ssl_ciphers         HIGH:!aNULL:!MD5;
```

上面的配置是必须的, 另外还有一些配置依据个人情况可以添加. 另外你需要首先申请自己的网站证书才行.

例如安全协议的具体版本`ssl_protocols`和算法`ssl_ciphers`, 由于这两个命令的默认值已经好几次发生了改变，因此不建议显性定义，除非有需要额外定义的值，如定义 D-H 算法, 具体查看[Nginx 配置 HTTPS 服务器](https://aotu.io/notes/2016/08/16/nginx-https/index.html)进行配置.

### HTTP/2.0 配置

既然已经上了 HTTPS, 那么干脆一鼓作气上到 HTTP/2.0, 根据规范来说 HTTP/2.0 是不需要依赖 HTTPS 的, 但是目前的现状来说, 各个浏览器都是要求在 HTTPS 的环境中才能启用 HTTP/2.0. nginx 要启用 HTTP/2.0 需要`http_v2_module`和`http_ssl_module`这两个模块, 如果之前的编译安装时没有这两个模块, 那么就需要重新加上参数再编译一份. 这里省略我再次编译的过程(同上), 只是编译参数改为`./configure --prefix=/usr/local/nginx --with-http_ssl_module --with-http_v2_module`.

更新了 nginx 之后就要在 nginx 的配置文件里面开启 HTTP/2.0, 告诉客户端我们支持 HTTP/2.0 了. 配置很简单, 只需要在之前的`listen`字段中增加一个`http2`即可.

目前 IE11+ 以及其他主流浏览器都已经支持 HTTP/2.0, 而且就算客户端不支持结果也是正常的使用现在的 HTTP/1.1, 不会影响页面访问.

例如:

```conf
# 改为
listen 443 ssl http2;
```

这里有一个**小坑**, 在启用 HTTP/2.0 之前, 我们可能把80端口和443端口放在同一个 server 里面监听, 但是如果我们想要启用 HTTP/2.0, 那么就必须把80端口拿出去单独放在一个 server 里面, 监听80端口的并不能启用 HTTP/2.0, 所以如果你想要为网站同时启用 HTTP 和 HTTP/2.0, 那么你在 nginx 配置文件里面就至少需要写两个 server, 一个监听80端口, 另一个监听443端口.

关于 HTTP/2.0 的相关文章, 尤其是升级及浏览器兼容问题可以查看屈屈的博客[谈谈 HTTP/2 的协议协商机制](https://imququ.com/post/protocol-negotiation-in-http2.html).

我自己的总结如下: 在浏览器和服务端建立 TCP 连接之后, 如果是 http 协议, 那么此时就可以进行数据传输了, 如果是 https 协议, 那么就还需要建立安全的 TLS 连接, 由于 TLS 有多个版本, 也有不同的加密算法, 那么浏览器和服务器就需要进行协商, 确定一个版本和算法等信息来进行数据加密, 协商是通过`握手`来实现的, 首先客户端会发送一个`client hello`握手信息, 里面包含了客户端支持的各种协议以及算法等信息, 然后服务端收到这个信息之后会在这些支持的协议里面选出自己也支持的协议和算法, 然后确定最后要采用的协议和算法(例如 HTTP/2.0 > HTTP/1.1)通过`server hello`握手信息返给客户端, 这样双方就确定了一组对应的协议和算法进行后续的数据传输. 所以可以看到服务器在升级到了 HTTP/2.0 之后, 如果用户使用的浏览器也支持 HTTP/2.0, 那么协商之后双方就会无痛升级到 HTTP/2.0 进行通信, 享受 HTTP/2.0 带来的种种好处, 而如果用户的浏览器不支持 HTTP/2.0, 那么协商之后就会采用原来的 HTTP/1.1进行通信, 并不会影响现在的业务.
