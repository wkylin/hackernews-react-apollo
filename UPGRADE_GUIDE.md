# HackerNews React Apollo 升级指南

这份文档按“先可运行，再逐步现代化”的顺序整理，目标是把当前老项目升级到：

- 前端：React 19 + Vite + `@apollo/client`
- 后端：现代 GraphQL Yoga + Prisma ORM
- 数据库：阿里云 MySQL 8.0
- 部署：环境变量驱动，去掉硬编码地址和密钥

---

## 1. 当前项目现状

当前仓库是一个典型的老版全栈 GraphQL 教程项目：

- 前端是 Create React App + React 16 + React Router 5
- Apollo 用的是旧包：`apollo-boost`、`react-apollo`、`apollo-link-*`
- 后端是 `graphql-yoga@1`
- 数据层是 Prisma 1，通过 Prisma Cloud endpoint 代理
- 现有数据库连接不是本地直连 MySQL，而是 Prisma 1 远端服务

需要优先改掉的点：

- `server/prisma/prisma.yml` 里的 Prisma 1 endpoint
- `server/src/generated/prisma-client` 这套旧 client
- 前端写死的 `http://localhost:4000`
- 后端硬编码的 `APP_SECRET`

---

## 2. 推荐升级顺序

不要一次把所有东西都改掉。按这个顺序最稳：

1. 先把数据库层迁到 MySQL 8.0 + Prisma ORM
2. 再把后端 GraphQL 从 `graphql-yoga@1` 升到现代 Yoga
3. 再把前端 Apollo 升到 `@apollo/client`
4. 最后把 CRA 迁到 Vite，React 升到 19

如果中途要保功能，先保留 `feed / signup / login / post / vote`，订阅最后再补。

---

## 3. 第 0 步：冻结现状并备份

在动代码前先做三件事：

1. 备份现有 Prisma 1 数据或确认旧 endpoint 是否还能访问
2. 记录当前功能是否都正常
3. 新建一个迁移分支

建议先验证这些接口：

- `feed`
- `signup`
- `login`
- `post`
- `vote`
- `newLink` / `newVote` subscription

---

## 4. 第 1 步：迁移数据库到 MySQL 8.0

### 4.1 目标

把 Prisma 1 远端数据库代理，换成你自己的阿里云 MySQL 8.0。

### 4.2 建议的 Prisma schema

新建 `server/prisma/schema.prisma`：

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id       String @id @default(cuid())
  name     String
  email    String @unique
  password String
  links    Link[]
  votes    Vote[]
}

model Link {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  description String
  url         String
  postedById  String?
  postedBy    User?    @relation(fields: [postedById], references: [id])
  votes       Vote[]

  @@index([postedById])
}

model Vote {
  id     String @id @default(cuid())
  linkId String
  userId String
  link   Link   @relation(fields: [linkId], references: [id])
  user   User   @relation(fields: [userId], references: [id])

  @@unique([linkId, userId])
  @@index([userId])
}
```

### 4.3 环境变量

在 `server/.env` 中配置：

```env
DATABASE_URL="mysql://用户名:密码@阿里云IP:3306/hackernews"
APP_SECRET="一串足够长的随机字符串"
```

如果后端和 MySQL 在同一台机器上，可以改成：

```env
DATABASE_URL="mysql://用户名:密码@127.0.0.1:3306/hackernews"
```

### 4.4 MySQL 建库

先在 MySQL 里建库：

```sql
CREATE DATABASE hackernews
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

再建用户：

```sql
CREATE USER 'hackernews_user'@'%' IDENTIFIED BY '强密码';
GRANT ALL PRIVILEGES ON hackernews.* TO 'hackernews_user'@'%';
FLUSH PRIVILEGES;
```

### 4.5 迁移命令

在 `server/` 下执行：

```bash
npm remove prisma-client-lib prisma
npm install @prisma/client@^6.19 graphql-yoga graphql bcryptjs jsonwebtoken dotenv
npm install -D prisma
npx prisma init --datasource-provider mysql
npx prisma migrate dev --name init
npx prisma generate
```

说明：Prisma 7 已经是当前主线，但它要求 ESM、显式 generator output 和数据库 driver adapter。这个项目后端仍是 CommonJS + `graphql-yoga@1`，所以第 1 步先用 Prisma 6 作为兼容桥；等后端升级到现代 Yoga/ESM 后，再单独升级 Prisma 7。

生产环境只跑：

```bash
npx prisma migrate deploy
```

### 4.6 要改的代码

重点改这些文件：

- `server/src/index.js`
- `server/src/utils.js`
- `server/src/resolvers/Mutation.js`
- `server/src/resolvers/Query.js`
- `server/src/resolvers/User.js`
- `server/src/resolvers/Link.js`
- `server/src/resolvers/Vote.js`

典型替换：

- `context.prisma.createLink(...)` -> `prisma.link.create(...)`
- `context.prisma.createUser(...)` -> `prisma.user.create(...)`
- `context.prisma.user({ email })` -> `prisma.user.findUnique(...)`
- `context.prisma.links(...)` -> `prisma.link.findMany(...)`
- `context.prisma.$exists.vote(...)` -> `prisma.vote.findUnique(...)` 或 `@@unique([linkId, userId])`

---

## 5. 第 2 步：升级后端 GraphQL

### 5.1 目标

把老的 `GraphQLServer` 改成现代 Yoga 的 `createYoga` 模式。

### 5.2 入口改造

现在入口在 `server/src/index.js`，逻辑是：

- 读取 schema
- 注入 prisma client
- 启动 HTTP 服务

升级后建议改成：

```js
import { createServer } from 'http'
import { createYoga, createSchema } from 'graphql-yoga'
import { prisma } from './prisma'

const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
  context({ request }) {
    return { request, prisma }
  },
})

createServer(yoga).listen(4000)
```

### 5.3 鉴权改造

把 `APP_SECRET` 从代码里移到环境变量。

当前问题点：

- `server/src/utils.js` 里硬编码了 `APP_SECRET`

改成：

```js
const APP_SECRET = process.env.APP_SECRET
```

### 5.4 subscription 处理

订阅是最容易拖慢升级的地方，建议分两段：

1. 先让 query/mutation 全部跑通
2. 再迁移 subscription

如果想保留实时更新，优先走 Yoga 当前推荐的订阅方案，不要继续依赖旧的 `subscriptions-transport-ws`。

---

## 6. 第 3 步：升级前端 Apollo

### 6.1 目标

把这些旧依赖替换掉：

- `apollo-boost`
- `react-apollo`
- `apollo-link-context`
- `apollo-link-ws`
- `apollo-link-http`
- `apollo-cache-inmemory`
- `subscriptions-transport-ws`

换成：

- `@apollo/client`

### 6.2 入口改造

当前前端入口在 `src/index.js`，有以下老模式：

- `ApolloClient` 旧构造方式
- `split + WebSocketLink`
- `localStorage` token 注入

升级后建议统一成 `@apollo/client` 的官方写法，接口地址改成环境变量，不要再写死：

```js
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL,
})
```

### 6.3 页面组件改造

重点改这些文件：

- `src/components/LinkList.js`
- `src/components/Search.js`
- `src/components/CreateLink.js`
- `src/components/Login.js`
- `src/components/Link.js`

把 `Query` render prop 逐步换成 `useQuery` / `useMutation` / `useSubscription`。

### 6.4 路由升级

当前是 React Router 5：

- `Switch`
- `Route component`
- `Redirect`

后续升级到 React Router 6/7 时要改成：

- `Routes`
- `Route element`
- `Navigate`

---

## 7. 第 4 步：从 CRA 迁到 Vite，升级到 React 19

### 7.1 目标

CRA 已经不再推荐，React 官方现在也建议新项目用推荐框架或 Vite 这类构建工具。

### 7.2 迁移动作

1. 新增根目录 `index.html`
2. 新增 `vite.config.js`
3. 把入口改成 `src/index.jsx`
4. 把 `ReactDOM.render` 换成 `createRoot`
5. 把环境变量从 `REACT_APP_*` 改成 `VITE_*`
6. 把包含 JSX 的组件文件改为 `.jsx`
7. 构建产物目录从 `build/` 改为 `dist/`

### 7.3 依赖建议

前端建议升级为：

- React 19
- React DOM 19
- `@apollo/client`
- React Router 5 暂时保留，后续再单独升级到 6/7

---

## 8. 第 5 步：验证清单

每完成一阶段都要验收，不要等到最后一起看。

### 后端验收

- `feed` 能查
- `signup` 能注册
- `login` 能登录
- `post` 能发链接
- `vote` 能投票

### 数据库验收

- 用户表、链接表、投票表都已建立
- `link -> postedBy`
- `vote -> user / link`
- `@@unique([linkId, userId])` 生效

### 前端验收

- 首页正常
- 登录正常
- 发帖正常
- 搜索正常
- 分页正常
- 实时订阅作为独立后续任务，不阻塞主站上线

---

## 9. 推荐的实际执行节奏

最稳的执行顺序是：

1. 先接 MySQL 8.0
2. 再把 Prisma 1 的 resolver 改成现代 Prisma
3. 再把 GraphQL Yoga 升级
4. 再把 Apollo 升级
5. 最后做 React 19 + Vite 迁移

订阅后续任务单独排：

- 用 `graphql-ws` 或 `graphql-sse` 重新接入 `newLink/newVote`
- 前端再补回订阅消费和实时刷新
- 这个任务不影响主站上线

---

## 10. 参考文档

- Prisma 从 v1 迁移：https://www.prisma.io/docs/v6/orm/more/upgrades/from-v1
- Prisma ORM + MySQL：https://www.prisma.io/docs/orm/core-concepts/supported-databases/mysql
- Prisma ORM 总览：https://www.prisma.io/docs/v6/orm
- Yoga 从 v1 迁移：https://the-guild.dev/graphql/yoga-server/docs/migration/migration-from-yoga-v1
- Apollo Client 迁移：https://www.apollographql.com/docs/react/migrating/apollo-client-3-migration
- React 版本说明：https://react.dev/versions
- CRA 弃用说明：https://react.dev/blog/2025/02/14/sunsetting-create-react-app
- React + Vite 建议：https://react.dev/learn/add-react-to-an-existing-project
