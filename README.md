# 巴黎葛朗台 · Paris Gratuit

独立网页，访客不需要 ChatGPT 账号。

## 网页发布

GitHub Pages 使用 main 分支的 /docs 目录。网页地址（开启 Pages 后生效）：https://phoebe-wfan.github.io/paris-gratuit/

在仓库 Settings → Pages → Build and deployment 选择 Deploy from a branch，Branch 选择 main，Folder 选择 /docs，保存。仓库已包含构建完成的网页，不需要先安装依赖。

## 功能与状态

四个栏目：免费展览、免费体育赛事、免费 Pop-up、其他免费活动。活动展示官方来源、免费条件和核实日期。

前端位于 GitHub Pages，后台是 Cloudflare Worker + D1。关注按随机访客凭证保存到数据库，不使用 ChatGPT 用户身份；浏览器仅保存访问凭证，关注记录不在本地存储。换设备暂不会自动同步，不要清除本网站的访客凭证。

苹果日历可导出 .ics，也可通过个人随机订阅链接读取后台的最新开票时间。未知的开票时间不生成提醒；活动日期独立导出。已预约只停止开票提醒，仍可导出参观日期。请勿公开个人日历订阅链接。

邮件发送代码已准备，但未启用：Resend 账号尚无验证发信域名，也没有完成接收邮箱验证流程。页面不会让用户开启一个无法发送的通知。接好验证域名、发信密钥及邮箱确认后才能开启。

## 构建

Node >=22.13，pnpm 11.25，保留锁文件。

```sh
pnpm install
node scripts/build-pages.mjs  # 构建 /docs 独立前端
pnpm build                  # 构建 Worker 后台
pnpm db:generate            # 仅 schema 变化时生成新迁移
```

`pages.html` 设置非秘密后台地址，`vite.config.pages.ts` 构建普通 React 网页。后台可以迁到其他 Cloudflare Workers 托管并修改地址，不需要依赖 ChatGPT 登录。

## 后台访问

公开读接口 /api/catalog。关注 /api/preferences 与提交 /api/submissions 使用 X-Visitor-Key（64位随机十六进制 bearer 凭证）。浏览器跨域只允许 https://phoebe-wfan.github.io。个人 .ics 使用随机 calendar token，不暴露邮箱。

管理接口 GET/PUT /api/update、POST /api/check 必须使用 UPDATE_SECRET。此秘密保存在托管服务环境，不能写进 GitHub、网页或日志。当前后台的 UPDATE_SECRET 与该站现有服务访问凭证一致，后台任务从 Sites get_site 动态读取同站凭证，只发送到该站的 Authorization 与 OAI-Sites-Authorization 两个 Bearer 头。以后旋转服务凭证时，必须同时更新后台秘密。

GET /api/update 返回活动与待审链接。PUT 接收 {events:[EventRecord],reviewedSubmissionIds:[]}，schema 见 lib/catalog.ts 和 app/api/update/route.ts。省略记录不删除；取消使用 status=cancelled；写后回读核实。seedEvents 是初始种子，D1 记录按稳定ID覆盖。

## 定期管理

每周一巴黎时间09:00发现与核实新活动，每小时检查官方开票页面。自动任务更新 D1 数据，前端及日历直接读取，不需每次重新构建。

来源优先官网：le19M、奥赛、卢浮宫、小皇宫、巴黎市活动日历、体育公告及活动主办方。社交平台仅作为可公开检索的发现线索，核实后才发布。

免费体育参与必须标明不是观赛赛事。快闪免费入场不等于商品/饮食免费。只有明确公开的开票时刻才能写 bookingOpensAt；没有证据保持 null。预约入口存在不保证尚有余票。

## 邮件后台

运行时秘密 RESEND_API_KEY、验证域名的 MAIL_FROM；只有接收邮箱经过确认、用户启用 emailEnabled 后发送。通知使用幂等键和 D1 去重。关闭邮件、取消关注、标记已预约停止对应提醒。当前邮件服务未启用，不能声称已发送。
