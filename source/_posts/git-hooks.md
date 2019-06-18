---
title: git-hooks
date: 2019-05-15 11:16:57
subtitle: git hooks
categories:
  - tool
tags:
  - git
---

# git hooks

现在代码一般都会使用git来进行管理, 其中git hooks(git钩子)是git提供的在代码管理的生命周期中会被触发的一个阶段, 如同react里面组件的生命周期一样, 随着组件的状态的改变, 一些生命周期函数会被触发, 然后可以在触发的时候进行自定义的操作, git 也是如此, 例如我们可以在代码被提交(`git commit`)前进行代码的自动检查, 通过了检查才允许提交, 否则提交失败, 然后还有常见的自动化部署也是利用了 git hooks, 当新代码被提交到服务端(`git push`)的时候触发git hooks, 然后服务器自动进行重新部署. 

<!-- more -->

我目前的使用来说用到了上面提供的两个钩子`pre-commit`(`git commit`时触发)和`post-update`(`git push`时触发)

一个是在本地提交js代码的时候使用eslint先对代码进行lint, lint通过后才允许提交, 否则提交失败, 修正不合约的语法之后再次进行提交, 这样强制性的代码lint可以一定程度保证团队协作时代码的风格和质量. 

另一个是我博客的搜索服务是部署在阿里云ECS的docker里面的, 每次我对搜索相关的代码改动的时候, 就会推送到我的服务器里, 然后服务器上通过`post-update`钩子接收到新的提交时就会执行我写好的脚本, 自动使用最新代码进行docker的重新构建和运行, 很是方便

每一个git仓库在初始化的时候都会在项目的`.git/hooks`目录下初始化默认的钩子脚本
```bash
# 进入项目根目录后查看默认的钩子脚本
cd .git/hooks && ls
# 有如下默认的钩子脚本
applypatch-msg.sample     pre-applypatch.sample     pre-receive.sample
commit-msg.sample         pre-commit.sample         prepare-commit-msg.sample
fsmonitor-watchman.sample pre-push.sample           update.sample
post-update.sample        pre-rebase.sample
```
每个脚本后都带有`.sample`后缀, 这是因为这些钩子脚本默认都是不执行的, 如果需要使用哪个钩子, 那么就把后缀去掉, 然后就可以执行了

关于各个钩子的调用时机可以查看[HOOKS](https://git-scm.com/docs/githooks#_hooks)

不过需要注意的是`.git`目录下的内容是不在git的版本管理里面的, 所以你如果更改了本地的钩子脚本, 那么默认情况下是不会被提交的, 如果需要这些内容也能够像其他代码一样在团队之间保持一致的话, 可以把这些钩子文件移出`.git`目录, 这样提交代码的时候就会提交这部分内容, 然后每一次代码更新以后再把这些脚本复制回`.git/hooks`目录中(复制的过程也可以通过钩子来自动完成, 不用手动复制, 钩子脚本里面加上拷贝文件的命令就可以了)

## `pre-commit`

`pre-commit`是客户端钩子, 在键入提交信息前在本地运行, 它用于检查即将提交的快照, 如果该钩子以非零值退出，Git 将放弃此次提交，不过你可以用`git commit --no-verify`来绕过这个环节

例如对本次提交的`js`和`jsx`文件进行eslint检查, 如果有文件无法通过检查, 那么将会退出此次提交
```bash
#!/bin/sh
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep ".jsx\{0,1\}$")
if [[ "$STAGED_FILES" = "" ]]; then
exit 0
fi
PASS=true
echo "\nValidating Javascript:\n"
# Check for eslint
which eslint &> /dev/null
if [[ "$?" == 1 ]]; then
echo "\t\033[41mPlease install ESlint\033[0m"
exit 1
fi
for FILE in $STAGED_FILES
do
eslint "$FILE"
if [[ "$?" == 0 ]]; then
echo "\t\033[32mESLint Passed: $FILE\033[0m"
else
echo "\t\033[41mESLint Failed: $FILE\033[0m"
PASS=false
fi
done
echo "\nJavascript validation completed!\n"
if ! $PASS; then
echo "\033[41mCOMMIT FAILED:\033[0m Your commit contains files that should pass ESLint but do not. Please fix the ESLint errors and try again.\n"
exit 1
else
echo "\033[42mCOMMIT SUCCEEDED\033[0m\n"
fi
exit $?
```

## `post-update`

`post-update`是服务端钩子, 在服务器收到新的代码推送(`git push`)的时候运行, 自动化部署就利用这个钩子, 每次向服务器推送代码, 就触发该钩子然后服务器开始部署新代码

例如我的博客的搜索目前就是采用这种方式, 搜索使用的是[`koa`框架](https://koa.bootcss.com/)来做服务端, 代码其实很简单, 只有一个文件, 就是连接我的es, 然后依据查询参数到es中查询文章数据, 然后返回去, 不过中间复杂一点的是使用了`nginx`来代理(后期还打算通过`nginx`把被墙的`Disqus`接进来作为博客的评论系统, 这是后话了), 我的node端是运行在docker里面的, 所以还写了一个`Dockerfile`来每次拉新代码以后就重新构建docker镜像, 然后使用新的镜像来生成一个搜索容器, 这一套流程还是比较麻烦的, 不过使用自动化的话就能省不少事

服务端配置钩子也还是很方便的, 主要就是新建一个git裸仓, git裸仓一般也被作为远程的中心仓库, 这个仓库无法直接作为工作区, 也就是说在这个仓库里是不能进行`git commit`等操作的, 里面也没有项目源文件而是包含着文件版本历史, 一般是作为共享区来使用, 命名一般为`xxx.git`的形式, 例如你经常`clone`的git仓库就是这样的. 我们可以使用`git push`来向裸仓中提交版本记录, 也可以使用`git pull`从裸仓中拉取最新的版本

新建一个本地仓库的命令是`git init`, 而新建一个裸仓的命令是`git init --bare`

例如我在服务器上新建一个裸仓用来接受我本地向它提交代码
```bash
# 新建一个目录用来存放裸仓
mkdir ks.git && cd ks.git
# 初始化裸仓
git init --bare
```
一个裸仓就建好了

我的目的是之后向这个裸仓中提交代码时就触发自动部署流程, 所以我要编辑裸仓中的`post-update`钩子
```bash
cd hooks
# 使用cp来拷贝并重命名钩子文件
cp post-update.sample post-update
vi post-update
```
然后开始写脚本了
```bash
# 环境变量GIT_DIR会被设置为服务端当前目录, 我们需要更新另一个git里面的文件, 所以要先重置环境变量
unset GIT_DIR

# 指定一个目录用来作为代码文件夹, 这里面存放的是要运行的代码
WORK_DIR=/workspace/ks/server
cd $WORK_DIR

# 初始化该目录为git工作仓库
git init
# 指定该仓库的远程仓库地址就是我们之前建立的那个裸仓, 因为我们提交代码是提交到裸仓中的, 所以这个仓库可以从裸仓中拉取最新代码, 
git remote add origin /workspace/ks/ks.git
# 清除未在版本控制里面的冗余文件, 比如编译后的一些文件等等, 保证工作目录的干净
git clean -df
# 拉取最新代码到工作目录中
git pull origin master

# 现在最新的代码已经到工作目录中了, 之后可已使用 pm2 restart xxx 来重启我们的node服务
# 对于我来说现在可以按照新代码来重新构建镜像了, 当然了, 建新的之前先把旧的都清除掉
# 停止正在运行的搜索服务容器
docker stop ks
# 删除这个已停止的搜索服务容器
docker container rm ks
# 删除旧的搜索服务镜像
docker image rm ks

# 根据项目根目录的 Dockerfile 来构建新镜像
docker build -t ks .
# 然后使用新镜像来生成并运行新的搜索服务容器
docker run -d --name ks -p 3000:3000 ks
```
注意: 如果`post-update`执行权限不足的话可以使用`chmod +x post-update`来赋予执行权限

以上服务器端就配置完成了, 那么本地代码如何提交到服务器呢, 按照如下步骤

```bash
# 如果本地已经是一个 git 仓库了, 就不用 git init 初始化了
git init

# 添加刚刚配置的服务器的裸仓为本地仓库的其中一个 remote 主机
# 我这里给远程主机配置的名字是 server , 因为我已经把 github 上的仓库配置成 origin 了
# user_name 和 server_ip 是你使用 ssh 方式连接服务器时的用户名和服务器地址, : 后面的是裸仓的路径
git remote add server user_name:server_ip:/worksapce/ks/ks.git

# 之后如果有新的代码需要推送到服务器上, 然后命令可以看到 服务器返回的一些日志信息, 表明 post-update 已被成功调用, 开始自动部署了
git push server master
```

以上脚本内容实现了如下自动化过程: 

本地`git push`代码到服务器 => 服务器部署新代码 => 服务器停止并删除旧的docker里面的搜索服务 => 根据新代码生成新的docker镜像并运行新的搜索服务

## 参考文章

- [用 Git 钩子进行简单自动部署](https://aotu.io/notes/2017/04/10/githooks/index.html)
