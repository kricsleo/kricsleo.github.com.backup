---
title: bash
date: 2018-09-13 12:41:22
categories:
  - tool
tags:
  - shell
---
# 常用的shell命令

<!-- more -->

## 删除文件

```bash
rm -f <file>

rm -rf <folder>
# 参数说明:
# -r: 删除目录下所有文件, 包括目录本身
# -f: 强制删除, 不确认

# 移动文件
mv <originFile> <destDir>

# 使用 scp 从本地拷贝文件到远程服务器, 参数调换即可反向拷贝
# 参数: 添加 -r 代表文件目录拷贝
scp <localFile> username@hostname:<remoteDir>
```

```bash
# linux查询系统版本
lsb_release -a

# 查看网络端口占用
netstat -antp

# 开启 nginx 在 nginx 目录下
./sbin/nginx

# 关闭 nginx
./sbin/nginx -s stop
```

## mac

```bash
# 清除 dns 缓存
sudo killall mDNSResponder

# Finder是否显示隐藏文件, No 为隐藏, Yes 为显示
defaults write com.apple.finder AppleShowAllFiles No && killall Finder

# npm (批量更新包及相关依赖)[https://ask.helplib.com/javascript/post_134443]
npm install -g npm-check-updates
npm-check-updates -u
npm install
```
