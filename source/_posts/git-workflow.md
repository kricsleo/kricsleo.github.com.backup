---
title: git-workflow
date: 2018-08-22 15:01:31
tags: 
    - git
categories:
    - tool
---

### git的日常使用流程记录
内容参考于阮一峰老师的[Git使用规范流程](https//www.ruanyifeng.com/blog/2015/08/git-use-process.html)，记录一下git的日常使用流程。
<!--more-->
![常用流程图](https//www.ruanyifeng.com/blogimg/asset/2015/bg2015080501.png)
#### 1. 新建分支
开发新功能时都应该新建一个分支，在分支上开发，当功能开发完成时再合并到主分支，并销毁新建的分支。
```bash
# git checkout——检出，是我们的常用命令。最为常用的两种情形是创建分支和切换分支
# 先切换到主分支，获取最新代码
git checkout master
git pull

# 然后新建分支，在这个分支上进行新功能开发
git checkout -b myfeature
```
#### 2. 提交分支
新功能开发完成以后提交代码
```bash
# 默认保存所有改动 --all
git add

# 查看发生改动的地方
git status

# 提交改动，也可以跟上 --verbose，然后就可以列出diff比较的结果，并且附上本次提交信息
git commit
```
#### 3. 同步代码
开发过程中可以经常同步主分支的最新代码，保证一直在最新的基础上进行开发
```bash
# git fetch 表示取回最新代码
git fetch origin

# 将有更新的代码与当前分支合并
# 所取回的更新，在本地主机上要用"远程主机名/分支名"的形式读取。比如origin主机的master，就要用origin/master读取。
git merge origin/masterdfdf
```
#### 4. 合并多个commit
新功能开发过程中一般会多次commit，但是在功能开发完成以后需要合并到主干时，一般把之前的commit合并成一个或几个关键的commit
```bash
# git rebase命令的i参数表示互动（interactive），具体如何合并请参见原文
git rebase -i origin/master
```
#### 5. 推送到远程仓库
多个commit经过合理的处理以后就可以把当前分支推送到远程仓库了
```bash
# git push命令要加上force参数，因为rebase以后，分支历史改变了，跟远程分支不一定兼容，有可能要强行推送
git push --force master myfeature
```
#### 6. 发出Pull Request
提交到远程仓库以后，就可以发出 Pull Request 到master分支，然后请求别人进行代码review，确认可以合并到master。

## 常用 git 命令

```bash
# 本地分支推送到远程
# 参数: [origin] 远程主机名, 一般为 origin
# [local-branch-name]: 本地创建的分支名
# [remote-branch-name]: 把本地分支推送到哪个远程分支(一般和本地保持一致, 如果远程分支名不存在会自动创建)
git push [origin] [local-brand-name]:[remote-branch-name]

# 删除本地分支
# 参数: -d 删除 -D 强制删除
git branch -[d|D] [local-branch-name]

# 删除远程分支
git push [origin] --delete [remote-branch-name]

```


参考文档: https//www.ruanyifeng.com/blog/2014/06/git_remote.html

(end)


