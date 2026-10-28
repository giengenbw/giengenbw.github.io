# ZIEGLER LAB V9

## 中文：ZIEGLER LAB V9 详细使用与部署说明

### 1. 交付范围与真实连接边界

V9 保留 V8 的六个 Agent、三语界面、独立谈判/教练语言、左右折叠栏、学习路径、计划、复盘、采购案例与本地记忆，并增加 SAP / Microsoft 365 工作台、共享动作计划引擎和独立 Node.js 网关。

本交付假设企业已允许接入 SAP 与 Microsoft 365，但没有内置你的租户、凭据、SAP 服务版本或真实业务数据。默认是明确标注的虚构接口模拟，不把“配置完成”当成“权限已验证”。真实连接必须由 IT 配置服务端环境、SAP 字段映射和权限。

三个分发件：
- GitHub Pages 代码包：前端源码、共享模拟引擎、部署工作流、预构建 `site/`、前端测试及详细三语 README。不包含真实网关实现或企业凭据。
- 完整软件包：上述前端加服务端网关、身份校验、SAP/Graph 适配器、环境示例、接口说明、测试、启动器和离线 HTML。
- 单文件 HTML：无需安装，双击运行本地模拟；顶部 README 按钮内嵌本三语说明。`file://` 不允许连接真实网关。通过 HTTP(S) 托管后才可选择网关。

### 2. 不安装软件，直接演示

下载 HTML 后用 Edge / Chrome 打开，不要只在附件预览中运行。或解压完整包，双击 `START_DEMO.cmd`。右上角切换 Deutsch / English / 中文。左右栏箭头独立折叠，`Alt+[` 切左栏、`Alt+]` 切右栏。折叠不会清空训练会话。

在 Agent 中心加载“正常流程”，依次执行 BANF 人工审核、生成本地订单草稿、核对订单确认、查看分批收货、发票三方匹配。再演示“价格与数量差异”和“延期交付”。所有示例都是虚构数据，不代表真实供应商。

打开“SAP 与 Microsoft 365”：
1. 保持“本地接口模拟”，点击连接，查看能力状态。
2. 在 SAP 订单、Outlook 收件箱、SharePoint / OneDrive 文件之间切换并加载数据。
3. 将一份订单复制为本地审核案例。此操作不修改来源系统，审核标记会重置。
4. 回到工作台，选择创建采购申请、创建采购订单或创建 Outlook 草稿。
5. 生成不可变动作计划，检查完整载荷、目标动作、计划 ID、内容哈希和有效期。
6. 勾选人工核实，再批准，再执行。模拟结果明确显示未写入 SAP 或未发送邮件。
7. 使用故障模拟测试未授权、限流、冲突或写入超时。结果不确定时执行按钮禁用，不自动重试。

### 3. 六个 Agent

- Negotiation Training：12个内置虚构场景、三种训练模式、教练提示、人工事件、证据复盘、学习与多次训练对比。规则模拟，不是真实模型或实时数字人。
- BANF：申请人、成本中心、PSP、地点、理由、币种、多行物料，校验数量/价格/日期/必填项和重复物料，人工审核及文本导出。
- Bestellung anlegen：共享 BANF 数据，核对供应商、邮箱、付款条件和4500开头的10位订单号，生成本地订单草稿。此编号规则是本演示约定，不是通用 SAP 规则。
- Auftragsbestätigung：手动或结构化文本录入，比较订单引用、币种、数量、价格、交期、缺失和未知物料。记录审核不代表接受差异。
- Liefertermin：发货信息、跟踪号、送货单、分批收货、未交数量。偏差=需求日期减到货日期，早到正、晚到负；累计收货首次满足订单数量才是完成日期。
- Rechnung：订单/收货/发票三方核对，阻断超收货或超订单开票，检测价格/币种/引用差异和本地重复发票。人工税率仅用于算术，不做税务认定，不付款。

### 4. GitHub Pages 部署

GitHub Pages 是静态站点托管；真实网关必须单独部署。[S1]

推荐自动部署：
1. 新建仓库，将代码包解压后的内容放到仓库根目录。保留 `.github/workflows/pages.yml`，不要再多套一层目录。
2. 推送到 `main` 分支。
3. 仓库 Settings → Pages → Build and deployment → Source 选择 GitHub Actions。
4. 在 Actions 查看构建与部署结果。工作流执行 `npm ci`、`npm test`、`npm run build`，仅发布 `dist/`，不发布服务端或 `.env`。
5. 构建使用相对资源路径，支持项目子路径。应用采用内部状态导航，无需服务器路由重写。

无需构建的替代方法：把 `site/` 内的全部内容上传到一个独立发布仓库根目录，Pages 选择从 `main` 根目录发布。不要把开发用的根目录 `index.html` 当成预构建文件；它引用源码入口。

Pages 站点可能公开可见，不上传真实订单、员工信息、凭据或保密数据。不要把私人仓库等同于私人站点。[S2] 本交付没有替你创建仓库、推送代码或实际发布公网网站。

### 5. 本地开发和单文件重新封装

需要兼容 Node.js（以 `package.json` 的 engines 为准）和 npm。演示 HTML 不需要这些环境。

```powershell
npm.cmd ci
npm.cmd run dev
npm.cmd test
npm.cmd run html
```

`npm run html` 构建 `dist/` 并生成根目录 `ZIEGLER_LAB_V9_DE_EN_ZH.html`。前端包和完整包均可重新构建。`npm ci` 需要网络下载依赖；交付不包含 `node_modules`。

### 6. 单独测试网关，仍不访问真实企业系统

仅完整包包含服务端。终端一运行 `npm.cmd run dev`。终端二运行：

```powershell
npm.cmd run gateway:sandbox
```

脚本绑定 `127.0.0.1:8787`，打印随机临时令牌。打开开发服务器的 HTTP 地址，在工作台选择独立 API 网关，输入网关地址和该临时令牌。默认 CORS 只允许本地5173端口；如果 Vite 自动换端口，必须同步设置 `ALLOWED_ORIGINS`。

此模式用于验证浏览器→网关→模拟适配器的真实 HTTP 流程，仍不访问 SAP 或 Graph。临时令牌不是企业登录，不能用于生产。

### 7. 真实 SAP / Microsoft 365 配置

详细接口、字段与限制见 `docs/INTEGRATION.md`。基本步骤：
1. IT 单独部署网关，设置 `LAB_MODE=gateway`，通过 TLS 反向代理暴露。
2. 设置 `ENTRA_TENANT_ID`、`ENTRA_AUDIENCE`，使用面向本网关的 Entra v2 访问令牌。网关验证 RS256 签名、租户、issuer、audience、有效期和 `lab.read` / `lab.plan` / `lab.approve` / `lab.execute` 权限。
3. 浏览器的令牌仅保留内存，不写 localStorage/sessionStorage。当前版本提供令牌输入用于受控集成测试；没有完整的 MSAL 登录、刷新、登出或 Conditional Access 交互。生产必须补齐。
4. Graph 适配器使用服务端 client credentials：`M365_TENANT_ID`、`M365_CLIENT_ID`、`M365_CLIENT_SECRET`、固定 `M365_MAILBOX` 和 `M365_DRIVE_ID`。密钥不能放浏览器或仓库。[S6]
5. 邮件读取包含 bodyPreview，需要相应邮件读取权限；创建草稿需要 Mail.ReadWrite。文件列表需要适用的文件/站点读取权限。由管理员选择并限制实际资源范围，不默认申请全租户无限权限。[S3][S4][S5]
6. `ENABLE_GRAPH_DRAFT=false` 默认不允许创建真实草稿。启用后仍需动作预览和另一位审核人批准。草稿不是发送，本版没有发送端点。[S3]
7. SAP 设置 `SAP_BASE_URL`、`SAP_BEARER_TOKEN` 和 `SAP_MAPPING_FILE`。映射示例全部是占位路径，必须按已批准的实际 API 元数据修改。采购组织、采购组、工厂、供应商业务伙伴编号、价格单位、日期格式等企业字段必须补齐，不能把供应商显示名称当作通用 SAP 主数据编号。
8. `ENABLE_SAP_WRITES=false` 默认只读。启用前必须完成测试租户验收。适配器支持配置的 POST 创建、CSRF token 与会话 Cookie，不实现 PATCH 更新或 ETag 并发更新。[S7]
9. `ALLOWED_ORIGINS` 填准确前端 origin，例如 `https://YOUR-ORG.github.io`，不含仓库路径；不使用通配符。`file://` 来源不允许。

真实网关默认强制创建人与审核人不同。审核人用自己的网关令牌，按计划 ID 加载并批准；创建人刷新计划后执行。客户端勾选和 BANF 本地审核标记不等于企业审批。计划批准只授权被冻结的载荷，不允许执行时替换内容。

### 8. 记忆、备份与运行限制

默认采购数据只在内存。明确同意后才保存语言、折叠状态、采购案例和本地审核记录。关闭记忆删除持久化副本，但当前内存数据保留到刷新。训练保存与删除单独管理，私人笔记和音视频不保存。

采购 JSON 备份沿用 schema 8，以兼容 V8；V9 浏览器存储键独立，旧浏览器数据不自动迁移。先在 V8 导出，再在 V9 导入，导入会替换案例并重置审核。最多100案例、每类100行、500条收货、2 MB导入。

网关令牌、连接配置、动作计划、读取的邮件/文件列表不进入采购备份。手动复制的企业订单会成为本地案例，若已启用记忆则可能持久化，操作前需公司允许。浏览器存储未加密。

动作计划默认5分钟有效；内存最多300计划、500事件。幂等防重复仅在同一网关进程存活期间有效，不保证跨重启或多副本 exactly-once。结果不确定时不得新建计划盲目重试。生产前必须接入持久化幂等表、审计、恢复对账、并发控制和监控。当前服务端没有这些生产设施。

每案例一份AB和一份发票；无累计多发票分摊、贷项、汇率、运费分摊、税务规则、银行验证、付款、PDF/OCR、附件下载、Teams通知、日历写入或真实模型。Graph仅前20条邮件和文件元数据；SAP读取前20条，且不自动翻页。SAP AB、收货和发票的实时读取尚未实现，仍使用本地录入。

语音识别取决于浏览器，可能调用厂商服务，不在离线保证范围。真实Windows启动器、企业租户、SAP和硬件未实测。测试记录说明实际验证范围，不是生产认证。

### 9. 常见问题

- npm 找不到：直接使用 HTML；开发时由 IT 安装 Node.js，重新打开终端，使用 `npm.cmd`。
- Pages 空白：检查上传层级、Actions日志、`dist/`资源是否齐全；不要只上传开发用 index.html。
- 401：检查网关令牌是否过期、audience/tenant是否正确；Graph令牌不能当作本网关令牌。
- 403：检查网关权限、不同审核人要求、CORS和上游资源授权。
- 429：等待后人工重新读取，不自动重试写入。
- SAP映射错误：核对API元数据、集合路径、行字段、必填主数据和返回ID路径。
- 写入结果不确定：先在来源系统核实，不重复执行，不靠刷新页面解决。
- 刷新后记忆消失：确认已同意、浏览器允许本地存储；改名/移动HTML可能改变存储范围，使用JSON迁移。

### 10. 测试与目录

`npm test` 运行采购引擎、动作状态机、网关和适配器测试；Pages精简包只运行包含的前端/共享测试。Python Playwright浏览器测试见 `tests/browser_smoke.py` 和完整包的 `tests/browser_enterprise.py`。实际结果见 `docs/TEST_REPORT.md`。

`src/` 前端；`shared/` 共享动作引擎；`server/` 独立网关（完整包）；`scripts/` 构建封装；`.github/workflows/` Pages部署；`dist/` 构建产物；`site/` 预构建发布副本（Pages包）；`examples/` 虚构示例；`docs/` 说明与测试证据。

## Official references / Offizielle Quellen / 官方参考

- [S1] GitHub Pages static hosting: https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages
- [S2] Creating a Pages site and visibility warning: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- [S3] Microsoft Graph create draft, Mail.ReadWrite: https://learn.microsoft.com/en-us/graph/api/user-post-messages?view=graph-rest-1.0
- [S4] Microsoft Graph list messages: https://learn.microsoft.com/en-us/graph/api/user-list-messages?view=graph-rest-1.0
- [S5] Microsoft Graph drive children: https://learn.microsoft.com/en-us/graph/api/driveitem-list-children?view=graph-rest-1.0
- [S6] Microsoft identity platform client credentials: https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-client-creds-grant-flow
- [S7] SAP Cloud SDK CSRF handling: https://sap.github.io/cloud-sdk/docs/js/features/connectivity/csrf

References checked for this delivery. SAP example mappings are illustrative and not certified against your system.
