# V9 verification / Prüfbericht / 测试报告

## 中文
- 完整包Node自动测试：108/108通过。包含原采购引擎、动作哈希/不可变性、审批权限、双人审核、过期、幂等重放、并发执行、未知结果隔离、CORS、HTTP鉴权、JWT签名/issuer/audience/tenant、Graph草稿mock、SAP CSRF/Cookie/POST与不重试测试。
- V9离线浏览器回归：三语采购流程、27种训练语言组合、9项额外流程通过；零运行时错误、零HTTP请求。
- V9接口浏览器回归：三语订单/邮件/文件读取、采购申请和草稿的预览批准执行、401/429、未知写入隔离、file://网关阻断通过。
- 另起真实本地HTTP网关验证：项目子路径静态构建、CORS、令牌鉴权、模拟读取和草稿、令牌不落localStorage/sessionStorage、刷新清除令牌。
- 单文件内嵌README三语切换和内容长度已测试。
- 生产构建与锁文件dry-run检查通过。Pages精简包单独构建和测试记录另附。
- 未测试：真实SAP、真实Microsoft 365租户、实际GitHub Actions公网部署、Windows双击启动器、麦克风/摄像头/语音厂商服务。上游适配器使用mock响应，不是企业系统端到端验收。

## Deutsch
108/108 Node-Tests bestanden. Offline-Browser: drei Beschaffungssprachen,27Trainingskombinationen und9Zusatzabläufe ohne Laufzeitfehler/HTTP-Anfragen. Integration: drei Sprachen, Lesen, genehmigte BANF/Entwürfe,401/429, unklare Ergebnisse, file://-Sperre. Separates lokales HTTP-Gateway mit CORS/Token, Unterpfad-Build und nicht persistenten Tokens geprüft. Eingebettete README in drei Sprachen geprüft. Build und Lockfile-Dry-Run bestanden.
Nicht geprüft: echtes SAP/M365, öffentliche GitHub-Actions-Bereitstellung, Windows-Starter und Medienhardware/-dienste. Adaptertests nutzen Mocks, keine Unternehmensabnahme.

## English
108/108 Node tests passed. Offline browser: three procurement languages,27training combinations and9additional flows with zero runtime errors/HTTP requests. Integration browser: three languages, reads, approved requisition/draft actions,401/429, uncertain outcomes and file:// restriction. Separate local HTTP gateway tested CORS/authentication, project-subpath build and nonpersistent tokens. Embedded trilingual README verified. Build and lockfile dry-run passed.
Not tested: real SAP/M365 tenants, public GitHub Actions deployment, Windows launchers or media hardware/vendor services. Adapter tests use mocks, not enterprise end-to-end acceptance.

## Evidence / Belege / 证据
- unit-tests-v9.log
- browser-tests-v9.log
- browser-enterprise.log
- browser-report.json
- browser-enterprise-report.json
- build-v9.log
- lockfile-check-v9.log
- pages-build-check.log / pages-unit-tests.log (distribution verification)

Pages distribution verification / Pages-Paketprüfung / Pages精简包验证: 89/89 included tests passed; production build passed. The 108-test count above applies to the complete package.
