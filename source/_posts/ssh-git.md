---
title: ssh-git
date: 2018-08-30 09:56:01
tags: 
    - ssh
    - git
categories: 
    - tool
---

# github的https和ssh连接方式探究

在本机连接github仓库提交代码时有两种可选方法，一种是使用github账号的用户名和密码的认证方式通过https连接，另一种是使用ssh-key的认证方式通过ssh连接，本文主要研究这两种方式的工作过程以及可能会扩展探究一些相关的知识。
<!-- more -->

## ssh

1995年芬兰赫尔辛基理工大学的塔图·于勒宁编写了`secure shell`, 简称`SSH`, 在这之前已经有不安全的`shell`, 但是`SSH`的提出保证了在非安全网络中可以加密完整可靠的传输数据, 要注意的是`SSH`只是一种通信协议, 存在则多种实现, 下面使用的是其中应用最广泛其中之一的开源实现`OpenSSH`.  
`SSH`基于公钥和私钥形式的`非对称加密`实现身份验证, 其默认的通信端口是22, 在登录验证时有两种方式: 1.密码认证;2.公钥认证.

1. 密码认证
  1.用户使用`SSH`向远程主机发起连接请求; 2.远程主机收到请求后把自己的公钥发给用户; 3.用户使用公钥对自己的登录密码进行加密, 然后发送给远程主机; 4.远程主机使用自己的密钥对发来的加密信息进行解密, 然后验证解密出来的用户密码是否正确, 如果密码正确则允许用户连接, 登录成功, 然后用户会把远程主机的公钥加入到自己本地的`$HOME/.ssh/known_hosts`中.  
  仔细分析这个过程我们会发现一个漏洞, 假如我是个黑客, 我出现在了用户和服务器中间的位置, 当在上面第二步的过程时我把我自己的公钥发送给用户, 然后用户就会用我的公钥加密他的密码然后发送给我, 这样我再用我的私钥来解密消息, 就可以获得用户的明文密码了, 这其实就是著名的`中间人攻击Main-in-the-middle attack(MITM)`. 如何应对`中间人攻击`可以参加下面.

2. 密钥认证
  密钥认证比密码认证安全一些, 因为不涉及用户密码的传输过程. 过程大致如下: 1.用户生成自己的一对公钥和密钥, 然后将公钥存储在远程主机上; 2.用户登录的时候向远程主机发送用私钥签名的包含用户名和公钥等信息; 2.远程主机收到请求后检查自己的`$HOME/.ssh/authorized_keys`中是否有用户发送的消息中的公钥信息, 如果有则证明该消息的公钥信息合法, 然后就会使用该公钥解密消息.

3. 中间人攻击
  那么`SSH`如何应对之前提到的`中间人攻击`呢?
  在我们第一次连接一个远程主机例如`ssh user@host`连接时, 我们会收到如下提示信息:
  > The authenticity of host 'host (12.18.429.21)' can't be established.  
  RSA key fingerprint is 98:2e:d7:e0:de:9f:ac:67:28:c2:42:2d:37:16:58:4d.  
  Are you sure you want to continue connecting (yes/no)?

  这就是在提示我们是第一次连接这个主机, 然后消息里面给出了这个主机的公钥的md5摘要信息`98:2e:d7:e0:de:9f:ac:67:28:c2:42:2d:37:16:58:4d`, 我们可以通过确认这个摘要值是不是我们想要连接的主机的, 如果是就输入`yes`回车确认连接, 并且会自动把这个主机加入到我们的本地`known hosts`（已知主机）名单里面, 以后都不再提示.
  因为`中间人攻击`核心就是使用假的公钥来替代真正的远程主机的公钥, 那么可以通过如下两种解决方案来应对: 

  1. 远程主机把自己的公钥拿到CA处做认证，申请一个数字证书  
    有关数字证书和数字签名的区别可以查看[这里](https//www.ruanyifeng.com/blog/2011/08/what_is_a_digital_signature.html), 以后只要确认这个证书是正规可信的, 那就可以对应的信任该公钥

  2. 远程主机把自己公钥的指纹信息公布出来, 让大家自己来查看对比
    比如放在自己的网站上面供想要连接的人执行对比查阅
  通过上面两种做法都可以是的用户确认自己当前加密信息所使用的公钥确定是正确的远程主机的公钥, 而不是`中间人`的公钥
关于`SSH`, 你也可以参考[这里](https//blog.51cto.com/zhaochj/1602279)或者[阮一峰的博客](https//www.ruanyifeng.com/blog/2011/12/ssh_remote_login.html)

## git的两种通信协议

实际上git可以使用四种通信协议:`本地传输`，`SSH协议`，`Git协议`和`HTTP/S协议`, 我们这里只讨论其中的`SSH协议`和`HTTP/S协议`.  
使用中最明显的区别是`SSH协议`只能操作我们有管理权限的项目, 但是`HTTP/S协议`允许我们clone没有管理权限的项目(不能修改, 只能clone查看). 
一般我们使用`SSH协议`比较多, 因为服务器一般是`linux`系统的, 它内置了`SSH`, 使用方便, 而且`SSH`也更安全.

1. 首先在本机下载安装[Git](https://git-scm.com/downloads)，一路点next默认安装即可;
2. 配置个人信息
  使用git提交更改的时候会为本次提交附上提交人的一些信息，比如提交人的用户名及邮箱信息，我们可以使用git提供的配置功能来提前配置好这些信息，使用如下：

  ```bash
  git config --global user.name "John Doe"
  git config --global user.email "johndoe@example.com"

  # 参数说明：
  # git config: 表示使用git的配置工具
  # --global: 表示配置全局的信息，你也可以在某个项目下面单独配置这个信息，只需要去掉'--global'即可，
  # <- 这样不同的项目就会有不同提交人信息
  # user.name / user.email: 后面跟上你自己的用户名和邮箱信息即可

  # 之后我们可以使用如下命令来查看我们配置的信息
  #git config user.name
  #git config user.email
  ```

3. 按照下面步骤尝试clone一个github上的项目到本地

### 使用https协议

以我的博客所使用[hexo的materialFlow主题项目](https://github.com/stkevintan/hexo-theme-material-flow)为例(这个项目我没有管理权限)，一行命令`git clone https://github.com/stkevintan/hexo-theme-material-flow.git`即可clone到本地, 因为这个项目我没有权限, 如果我是用`SSH协议`方式那么就会报错, 见下面.   
在修改了代码以后想要提交`git push`的时候会提示我们输入用户名和密码, 这里就涉及到新版`智能HTTP/S协议`(Git1.6.6之后引入), 你可参考[这里](https://blog.csdn.net/JNingWei/article/details/78905712), 在弹出的一个窗口输入用户名和密码, 之后你再提交的时候不会要求输入用户名和密码, 如果你使用的时候不是这样(Git版本太低或者服务器不支持`智能HTTP/S协议`), 那么可以参考[这里](https://www.jianshu.com/p/b5ec092fc1d1)配置`https`协议下的认证, 这样就不用每次提交的时候都要求输入用户名和密码.

### 使用ssh协议

此时你就无法直接使用`git clone git@github.com:stkevintan/hexo-theme-material-flow.git`命令来clone上面那个项目到本地，会产生如下错误提示：
> fatal: Could not read from remote repository.  
> Please make sure you have the correct access rights and the repository exists.

因为ssh的方式是需要进行认证的，你必须是这个项目的所有者或者管理者，才能有权限去使用ssh方式clone该项目，而上面的https方式则允许任何一个人在不需要验证的情况下去clone项目.

**那么接下来看一下对于一个我们有管理权限的仓库应该如何使用ssh方式去clone到本地**

ssh方式是基于不对称性加密来通信的，你需要使用不对称性算法来生成一对密钥，然后将私钥放置在你本机上，将公钥放置在github服务器上，之后在进行ssh通信时将会使用这对秘钥来完成认证登陆及加密和解密信息，
在window上和mac上我们都可以使用`ssh-keygen`这个命令行工具来生成我们需要的密钥，这是我们想要使用ssh通信的第一步

1. 生成一对密钥  
打开你的命令行（window下使用`cmd.exe`，mac下使用`terminal.app`），然后按照如下命令来生成密钥

```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
# 参数说明：  
# ssh-keygen: 表示将要使用ssh-keygen这个工具来生成密钥
# -t: 指定要生成的密钥类型，有rsa1(SSH1),dsa(SSH2),ecdsa(SSH2),rsa(SSH2)等类型，较为常用的是rsa类型，此处指定为rsa类型
# -b: 指定要生成的密钥长度 (单位:bit)，对于RSA类型的密钥，最小长度768bits,默认长度为2048bits。DSA密钥必须是1024bits，此处指定为4096bits
# -C: 制定要生成的密钥的注释，这个可以自己随意填写，就相当于给这个密钥留个名，好分辨，比如此处可以用注册github的邮箱号
```

之后会出现如下提示内容：
> Generating public/private rsa key pair.
> Enter file in which to save the key (C:/Users/xxxxx/.ssh/id_rsa):

意思是让你输入这个密钥文件的文件名，一般情况保存默认就可以，直接回车确认。
(如果你有多个git的账号需要配置，比如你自己在github上有账号需要提交代码，同时自己在公司也有git的账号，有时候需要提交代码到公司的仓库里，那么这时候你就需要额外的配置来保证提交的时候不会冲突，[详见下面](#多git账户配置))
然后会出现下一个提示内容：
> Enter passphrase (empty for no passphrase):

意思是要不要对私钥设置口令（passphrase），如果担心私钥的安全，你可以设置一个，这里一般不设置，直接回车确认即可，最后会出现类似如下的提示内容：
> +---[RSA 4096]----+  
| o+o     ..  .o  |  
| oo... o ... =   |  
|+ +.+ o.o.o.+ o  |  
|oB =.o..E.o* o   |  
|o = o.o Soo+=    |  
|   . o .+++ .    |  
|       o.o       |  
|      ..         |  
|      ..         |  
+----[SHA256]-----+  

那么恭喜你，你已经生成了一对密钥文件，他们存储在`C:/Users/xxxxx/.ssh/`（windows）或者`~/.ssh`（mac）目录下，默认的文件是id_rsa（私钥文件名）和id_rsa.pub（公钥文件名），你可以去打开查看一下里面的内容。

2. 部署密钥  
之前说过了你需要将私钥保存在本机，公钥放置在服务器上，这样之后才能用这对密钥建立ssh通信，那么在github上我们按照如下做法来部署密钥
    1. 用文本编辑器打开刚才生成的公钥文件id_rsa.pub，拷贝里面的全部内容；
    2. 打开浏览器登陆你的github账户，依次打开你头像上的Settings > SSH and GPG keys > New SSH key;
    3. 填写相关信息，**title**可以类似之前生成密钥时填写的注释信息那样填写你的邮箱名，然后**key**里面填上刚才拷贝的公钥内容，点击**Add SSH key**之后输入一次你的github账户密码进行确认，然后你的公钥就被保存部署到github服务器上了；

3. 测试连接，使用如下命令来测试是否能够通过ssh连接到github
```bash
ssh git@github.com
# 参数说明：
# ssh: 使用ssh进行连接
# git@github.com: ssh连接时需要指定登陆用户名和远程主机名，这里的git就是github的远程服务器的用户名，github.com就是远程服务器的主机名，用'@'符号连接起来
```
当你是第一次连接的时候会提示你如下信息：
> The authenticity of host 'github.com (52.74.223.119)' can't be established.    
RSA key fingerprint is SHA256:nThbg6kXUpJWGl7E1IGOCspRomTxdCARLviKw6E5SY8.    
Are you sure you want to continue connecting (yes/no)?  

这是因为你是第一次连接该主机，该主机不在你本机的`known hosts`（已知主机）名单里面，所以询问你是否要继续连接这个陌生的主机，输入`yes`然后回车确认即可，之后再次连接的时候就不会有这个提示信息了。这里提示信息中的`RSA key fingerprint`代表的是公钥的md5摘要值, 因为`RSA`算法生成的公钥长度很长(一般为1024位或者2018位, 可以自己在生成时指定), 这里就用了对公钥进行摘要后的比较短的值来代表公钥.
如果你配置步骤没问题的话应该可以看到下面的连接上之后的欢迎信息(xxxxx代表你的github的账户名)：
> Warning: Permanently added 'github.com,52.74.223.119' (RSA) to the list of known hosts.  
PTY allocation request failed on channel 0  
Hi xxxxx! You've successfully authenticated, but GitHub does not provide shell access.  
Connection to github.com closed. 

4. 使用ssh方式clone项目  
之前说过了ssh方式只能操作我们有管理权限的项目，所以这里我拿自己做的一个[微信小程序的虚拟车牌键盘](https://github.com/kricsleo/vehicleKeyboard)的项目为例
```bash
git clone git@github.com:kricsleo/vehicleKeyboard.git
```
这个时候我们就能顺利clone该项目到本机了，因为在我们上面这条命令请求数据的过程中，我们本机和github的服务器会使用我们之前生成的那对密钥来进行相互认证，从而使我们不需要手动输入github的账户名和密码信息来完成认证登陆，同时我们以后修改了项目代码在进行提交的时候也可直接进行提交等相关操作，无需再考虑登陆及连接的问题，git的使用可以参考我之前的一篇[小总结](https//kricsleo.com/2018/08/22/git-workflow/)

关于git使用https和ssh方式的区别你也可以查看[这里](https://blog.cuiyongjian.com/engineering/git-https-ssh/)

## 多git账户配置
如果你需要生成多对密钥，比如你需要和两个不一样的服务器A和B进行ssh通信，那么这个时候你就可以生成两对密钥，一对用来和A通信，另一对用来和B通信，最常见的情况就是我们自己在github上面会有自己的github账户，自己平时会开发一些自己的项目，然后提交到github上面，在公司里面公司一般会有自己的gitlab服务器，然后给员工开通一个gitlab的账号，有关公司内部的项目就会让员工用gitlab的账户进行开发，然后提交代码到公司的gitlab上面，那么这时候我们可以按照如下的方法来配置一下，保证自己随时提交代码的时候都是能够提交到正确的地方，而不会混乱。
1. 再生成一对密钥
在上面的操作中你已经生成了一对密钥，名字叫做`id_rsa`和`id_rsa.pub`（如果你没有改名的话），这个密钥我们已经拿来和github进行通信了，此时我们要想和公司的gitlab通信就需要再生成一对密钥，为了避免这次生成的密钥覆盖我们之前的那对密钥，可以执行如下命令：
```bash 
ssh-keygen -t rsa -b 4096 -C "youremail@yourcompany.com” -f ~/.ssh/id_rsa_xx

# 参数说明
# 这次我们生成密钥的命令只比之前多了一个参数： -f
# -f: 表示将这次什么的密钥文件保存为id_rsa_xx，同样放在了之前的那个文件夹，这个文件名你可以自己随意指定，不过最好容易区分一些
```
后面你的操作就和之前生成密钥一样了，生成好密钥之后再看下一步
2. 部署新生成的密钥  
和之前部署github密钥的步骤类似，你登录你公司的gitlab，找到添加`ssh-key`的地方，然后拷贝新生成的公钥id_rsa_xx.pub文件内容到gitlab里面去并且保存，这样你公司的gitlab服务器上的公钥信息就配置好了
3. 新建配置文件    
因为现在我们本机上有了两对密钥，提交代码到github时需要使用之前生成的那一对，提交代码到公司的gitlab上需要我们现在刚刚生成的这一对，那么我们就要写一个简单的配置文件来告诉git该如何再提交代码时选择正确的密钥，实际上就是编写SSH的用户配置文件config。
在目录`~/.ssh`(mac环境)或者`C:/Users/xxxxx/.ssh/`下新建文件`config`，注意**没有后缀名**的，然后在里面填写上如下内容：
```bash
#github
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_rsa

#yourcompany
Host git.XXXXX.com
    HostName git.XXXXX.com
    User git
    IdentityFile ~/.ssh/id_rsa_XX


# 参数说明，此段内容不用拷贝，是为了加以说明
# Host: 别名，为了方便记忆和区分，可以任意填写
# HostName： 主机名 服务器的主机名，也可以是服务器的ip地址，需要准确填写
# User： 用户名，ssh登录服务器时的用户名，一般是git
# IdentityFile： 密钥文件的路径，填写上你要用来和这个服务器通信使用的密钥文件的路径
# PreferredAuthentications：可选值 'publickey'和'password',强制使用密钥验证或者密码认证，我这里没有要求这个，你也可以按自己需求加上
```

4. 测试连接
使用如下命令来分别测试能否连接到对应的服务器
```bash
# 测试连接公司
ssh git@git.XXXXX.com

# 测试连接github
ssh git@github.com
```
如果能分别看到对应的欢迎信息，那么恭喜你配置正确了。

5. 配置个人信息
这次我们因为有不同的项目，提交时需要附加上的个人信息也不一样，你提交github时会用你自己的github账户名和邮箱信息，但是提交公司的gitlab时会使用公司给你的账户名和公司个人邮箱，那么我们就需要到具体的项目下面执行如下的命令：
```bash 
git config user.name "yourname"
git config user.email "youremail@XXXXX.com"

# 参数说明
# 与之前我们执行的那条配置个人信息命令相比，只是少了个'--global'参数，因为我们现在不是在全局配置，而是在个别项目中单独配置
```
到这里为止，你的多git账户依旧配置完毕了，后面就可以和平常一样使用git来提交代码了，ssh会为你选择正确的密钥来和服务器认证和通信。

