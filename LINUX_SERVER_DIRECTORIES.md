# Linux 服务器根目录说明

这份文档解释 Linux 服务器根目录下常见目录的用途，并结合当前这个 Node.js、Nginx、PM2、Docker、MySQL 项目在阿里云 ECS 上的部署场景说明哪些目录最常用、哪些目录不要随便改。

你的服务器根目录大概是这样：

```text
bin  boot  dev  etc  home  lib  lib64  lost+found  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var
```

这些目录大体遵循 Linux 文件系统层级标准，也就是常说的 FHS。不同 Linux 发行版会有一些差异，但整体职责基本一致。

## 快速结论

部署应用时，最常接触的是这些目录：

```text
/var/www      应用文件、前端 dist、后端 release 包
/etc/nginx    Nginx 配置
/root         root 用户的根目录；如果用 root 运行 PM2，PM2 数据也在这里
/var/log      系统和服务日志
/tmp          临时文件
/opt          可选的第三方软件
/home         普通用户的根目录
```

下面这些目录要非常谨慎：

```text
/bin
/boot
/dev
/lib
/lib64
/proc
/run
/sbin
/sys
/usr
```

这些大多是系统级目录。随意修改或删除里面的文件，可能会导致系统命令失效、服务无法启动，甚至服务器无法正常开机。

## 目录逐项说明

## `/bin`

`/bin` 存放系统最基础、最常用的用户命令。这些命令通常在系统启动、修复、单用户模式或基础操作中都需要用到。

常见命令包括：

```text
ls
cp
mv
rm
cat
sh
bash
mkdir
```

在很多现代 Linux 发行版中，`/bin` 可能只是指向 `/usr/bin` 的软链接。

和部署的关系：

- 一般不要把应用代码放到这里。
- 不要删除或替换这里的文件。
- 你在 shell 里执行的一些基础命令，可能就是从这里找到的。

示例：

```bash
which ls
which bash
```

## `/boot`

`/boot` 存放系统启动需要的内核和引导程序相关文件。

常见内容：

```text
vmlinuz-*       Linux 内核镜像
initramfs-*     初始化内存文件系统
grub/           GRUB 引导程序文件
```

和部署的关系：

- 和 Node.js、Nginx、MySQL、前端部署基本无关。
- 除非你在升级内核或调整引导配置，否则不要改这里。
- 如果 `/boot` 空间满了，系统升级内核时可能失败。

## `/dev`

`/dev` 存放设备文件。这里的文件不是普通业务文件，而是内核暴露出来的设备接口。

常见例子：

```text
/dev/null
/dev/zero
/dev/random
/dev/tty
/dev/sda
```

和部署的关系：

- 应用可能会间接使用 `/dev/null` 这类设备文件。
- Docker、系统服务可能会挂载或访问某些设备文件。
- 不要手动删除或编辑这里的设备节点。

常见用法：

```bash
echo "discard this" > /dev/null
```

这条命令会把输出丢弃。

## `/etc`

`/etc` 存放系统级配置文件。

常见内容：

```text
/etc/nginx/             Nginx 配置
/etc/systemd/           systemd 服务配置
/etc/ssh/               SSH 配置
/etc/hosts              静态主机名解析
/etc/resolv.conf        DNS 解析配置
/etc/passwd             系统用户信息
/etc/group              用户组信息
```

和部署的关系：

- Nginx 站点配置一般在这里。
- SSL 证书工具可能会在这里写入或引用配置。
- 如果不用 PM2，而用 systemd 管理 Node 服务，服务配置也会放在这里。

当前项目可能会用到：

```text
/etc/nginx/nginx.conf
/etc/nginx/conf.d/
/etc/nginx/sites-enabled/
```

常用命令：

```bash
nginx -t
systemctl reload nginx
systemctl status nginx
```

注意：

- 每次改完 Nginx 配置，先测试：

```bash
nginx -t
```

- 不要随便改 `/etc` 下不认识的文件。改之前要知道这个文件属于哪个服务、影响什么行为。

## `/home`

`/home` 存放普通用户的根目录。

例子：

```text
/home/alice
/home/deploy
/home/www
```

和部署的关系：

- 如果创建了非 root 的部署用户，比如 `deploy`，它的文件通常在 `/home/deploy`。
- 这个用户的 SSH key 通常在 `/home/deploy/.ssh`。
- 有些团队会把应用部署到 `/home/deploy/apps/...`。

root 用户比较特殊：

```text
/root
```

`/root` 才是 root 用户的根目录，不是 `/home/root`。

生产建议：

- 尽量不要所有服务都用 root 运行。
- 更安全的做法是创建专门的部署用户，例如 `deploy`、`www-data` 等。

## `/lib`

`/lib` 存放 `/bin` 和 `/sbin` 中基础命令运行所需的共享库。

常见内容：

```text
libc.so
ld-linux.so
某些系统上的内核模块
```

在很多现代系统中，`/lib` 可能是指向 `/usr/lib` 的软链接。

和部署的关系：

- 一般不要动这个目录。
- 一些 native 依赖可能会依赖这里的系统库。
- 如果破坏这里的文件，可能导致系统命令无法运行。

## `/lib64`

`/lib64` 存放 64 位系统所需的基础共享库。

在 64 位 Linux 系统中，动态链接器和很多系统程序都会依赖这里。

和部署的关系：

- 和 `/lib` 类似。
- 不要把应用文件放这里。
- 不要手动删除这里的文件。

## `/lost+found`

`/lost+found` 通常由 ext4 等文件系统自动创建。

当系统异常断电、磁盘损坏或文件系统修复工具 `fsck` 恢复文件碎片时，可能会把恢复出来的文件放到这里。

和部署的关系：

- 不用于应用部署。
- 通常是空的。
- 不要把它当作存储目录。

## `/media`

`/media` 用于自动挂载可移动设备。

例子：

```text
/media/usb
/media/cdrom
```

和部署的关系：

- 云服务器上很少用到。
- 桌面 Linux 或物理机上更常见。

## `/mnt`

`/mnt` 是临时挂载文件系统的通用挂载点。

例子：

```text
/mnt/data
/mnt/backup
/mnt/nas
```

和部署的关系：

- 云盘、NAS、临时数据盘可能挂载到这里。
- 如果你给阿里云 ECS 挂载了额外数据盘，可能会挂到 `/mnt` 或 `/data`。

注意：

- 如果把磁盘挂载到某个目录，原来那个目录下已有的文件会被挂载内容暂时“盖住”。
- 查看当前挂载情况可以用：

```bash
df -h
mount
lsblk
```

## `/opt`

`/opt` 用于安装可选的第三方软件，通常是不按系统包管理器默认目录安装的软件。

例子：

```text
/opt/node
/opt/google
/opt/appname
```

和部署的关系：

- 有些团队会把手动下载的软件安装到这里。
- 第三方厂商的独立软件包也常放这里。
- 对当前项目来说，`/var/www/hackernews` 比 `/opt/hackernews` 更常见，但只要文档清楚，两种方式都能用。

## `/proc`

`/proc` 是 Linux 内核提供的虚拟文件系统。

它不是磁盘上的真实文件目录，而是暴露当前进程、内核、CPU、内存等运行时信息。

例子：

```text
/proc/cpuinfo
/proc/meminfo
/proc/1
/proc/self
```

和部署的关系：

- `ps`、`top`、`free`、监控 Agent 等工具会读取 `/proc`。
- 可以通过它查看进程和系统状态。
- 不要把它当成持久化存储目录。

常用命令：

```bash
cat /proc/cpuinfo
cat /proc/meminfo
```

## `/root`

`/root` 是 root 用户的根目录。

常见内容：

```text
/root/.ssh/
/root/.bashrc
/root/.pm2/
```

和部署的关系：

- 如果 PM2 是用 root 用户启动的，PM2 的数据和日志通常在：

```text
/root/.pm2/
```

当前项目中你已经看到过类似日志：

```text
/root/.pm2/logs/hackernews-api-error-0.log
/root/.pm2/logs/hackernews-api-out-0.log
```

这说明当前 PM2 是在 root 用户下运行的。

常用 PM2 命令：

```bash
pm2 status
pm2 show hackernews-api
pm2 logs hackernews-api
pm2 flush hackernews-api
pm2 save
```

安全建议：

- 用 root 运行应用方便，但不是最理想的生产方式。
- 更安全的做法是创建专门的部署用户运行应用。

## `/run`

`/run` 存放系统启动之后产生的运行时状态。

例子：

```text
/run/nginx.pid
/run/systemd/
/run/docker/
/run/mysqld/
```

和部署的关系：

- PID 文件、socket 文件可能在这里。
- 这里的内容通常是临时的，重启后会重新生成。
- 不要把应用代码或持久化数据放这里。

查看示例：

```bash
ls /run
```

## `/sbin`

`/sbin` 存放系统管理相关的基础命令。

常见命令：

```text
ip
mount
reboot
shutdown
fsck
```

在现代 Linux 发行版中，`/sbin` 可能是指向 `/usr/sbin` 的软链接。

和部署的关系：

- 主要用于系统管理。
- 不要把应用文件放这里。

## `/srv`

`/srv` 按设计用于存放“由本机对外提供服务的数据”。

例子：

```text
/srv/www
/srv/ftp
/srv/git
```

和部署的关系：

- 有些管理员会把网站放到 `/srv/www`。
- 但更多教程和发行版默认使用 `/var/www`。
- 两者都可以，只要 Nginx 配置指向正确路径。

当前项目的部署示例使用：

```text
/var/www/hackernews
```

所以 `/srv` 不是必须使用。

## `/sys`

`/sys` 也是内核暴露的虚拟文件系统。

它提供设备、驱动、cgroup、内核子系统等信息。

例子：

```text
/sys/class/net/
/sys/block/
/sys/fs/cgroup/
```

和部署的关系：

- Docker、systemd、监控工具可能会读取或操作 `/sys`。
- 这里不是持久化应用存储。
- 除非你明确知道对应内核参数的含义，否则不要修改。

## `/tmp`

`/tmp` 存放临时文件。

特点：

- 通常所有用户都可以写入。
- 可能会被系统自动清理。
- 根据系统配置，重启后可能会被清空。

和部署的关系：

- 构建工具、安装器、临时调试文件可能会写到这里。
- 不要把持久化上传文件、数据库文件、应用发布包长期放这里。
- 适合临时排查问题。

示例：

```bash
mktemp
```

安全提示：

- 因为 `/tmp` 是共享目录，应用创建临时文件时应使用安全随机文件名，不要使用可预测文件名。

## `/usr`

`/usr` 存放大部分用户态程序、库、头文件、文档和共享资源，通常由系统包管理器安装和维护。

常见内容：

```text
/usr/bin
/usr/sbin
/usr/lib
/usr/local
/usr/share
```

和部署的关系：

- 通过 `yum`、`dnf`、`apt` 安装的命令通常会出现在 `/usr` 下。
- Node、npm、pnpm、nginx、mysql 客户端等工具可能安装在这里。
- 通常不要把业务应用直接部署到 `/usr`。

重要子目录：

```text
/usr/local
```

`/usr/local` 通常用于本机手动安装的软件，不归系统包管理器默认管理。

查看命令来源：

```bash
which node
which nginx
which pm2
```

## `/var`

`/var` 存放运行过程中会变化的数据，也就是 variable data。

常见内容：

```text
/var/log       日志
/var/www       Web 应用文件
/var/lib       服务数据
/var/cache     缓存
/var/spool     队列任务，例如邮件、打印队列
/var/tmp       比 /tmp 保留时间更长的临时文件
```

和部署的关系：

这是当前服务器上最重要的目录之一。

当前项目使用类似路径：

```text
/var/www/hackernews
```

一个合理的目录结构可能是：

```text
/var/www/hackernews/
  frontend/
    dist/
  server/
    dist/
    node_modules/
    package.json
    ecosystem.config.cjs
    .env
```

Nginx 可能从这里提供前端静态文件：

```text
/var/www/hackernews/frontend/dist
```

Nginx 可能把 API 请求代理到：

```text
http://127.0.0.1:4000
```

常用日志：

```text
/var/log/nginx/access.log
/var/log/nginx/error.log
```

Docker 数据可能在：

```text
/var/lib/docker
```

MySQL 数据可能在下面这些路径之一，取决于安装方式：

```text
/var/lib/mysql
/var/lib/docker/volumes/...
```

注意：

- `/var` 很容易变大，因为日志、Docker 镜像、数据库文件都会持续增长。
- 建议定期检查磁盘占用：

```bash
df -h
du -sh /var/*
```

## 当前项目的部署目录映射

对这个 HackerNews 项目来说，一个合理的生产部署映射如下：

```text
/var/www/hackernews/frontend/dist
  Vite 构建出来的前端静态文件。

/var/www/hackernews/server
  从 server/release 上传来的后端发布包。

/var/www/hackernews/server/dist/index.js
  编译后的后端入口文件，由 PM2 运行。

/var/www/hackernews/server/node_modules
  pnpm install --prod 安装的生产运行时依赖。

/var/www/hackernews/server/.env
  真实生产环境变量。不要提交到 Git，也不要从本地随便覆盖服务器版本。

/etc/nginx
  hacker.wkylin.cn 和 api.wkylin.cn 的 Nginx 配置。

/root/.pm2
  如果 PM2 用 root 运行，这里保存 PM2 进程元数据和日志。

/var/log/nginx
  Nginx 访问日志和错误日志。
```

## 当前服务器常用命令

查看 API 进程：

```bash
pm2 status
pm2 show hackernews-api
pm2 logs hackernews-api --lines 80
```

检查本机 API：

```bash
curl -i http://127.0.0.1:4000/health
```

检查公网 API：

```bash
curl -i https://api.wkylin.cn/health
```

检查 Nginx：

```bash
nginx -t
systemctl reload nginx
tail -n 100 /var/log/nginx/error.log
```

检查监听端口：

```bash
ss -ltnp
ss -ltnp | grep ':4000'
ss -ltnp | grep ':80\|:443'
```

检查磁盘占用：

```bash
df -h
du -sh /var/www/hackernews
du -sh /var/log
du -sh /var/lib/docker
```

## 不要做什么

不要删除这些目录：

```text
/bin
/boot
/dev
/etc
/lib
/lib64
/proc
/run
/sbin
/sys
/usr
/var
```

不要把生产应用代码放到这些目录：

```text
/tmp
/proc
/sys
/dev
/run
```

不要把真实密钥写进 Git 仓库里的文件：

```text
.env
DATABASE_URL
APP_SECRET
数据库密码
SSL 私钥
```

## 实用理解模型

可以把服务器目录简单理解成这样：

```text
/etc      配置
/var      会变化的数据，包括 Web 应用和日志
/usr      系统安装的软件
/root     root 用户根目录；如果 PM2 用 root 跑，PM2 数据也在这里
/home     普通用户根目录
/tmp      临时文件
/proc     实时内核和进程信息，不是真实磁盘文件
/sys      实时内核和设备信息，不是真实磁盘文件
/dev      设备接口
```

当前项目日常部署和排查，主要会在这些地方操作：

```text
/var/www/hackernews
/etc/nginx
/root/.pm2
/var/log/nginx
```

