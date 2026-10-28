# Integration contract / Schnittstellenvertrag / 接口约定

## 中文

### 拓扑

浏览器静态前端 → 独立HTTPS网关 → 固定配置的SAP和Microsoft Graph。GitHub Pages不运行Node.js服务。[S1] 浏览器只持有本网关访问令牌，不持有Graph client secret或SAP bearer token。[S6] `file://`连接真实网关被前端阻断，服务端不允许`Origin: null`。

### 配置步骤

复制`.env.example`为`.env`，只放服务端。运行`npm.cmd run gateway`会加载该文件。`LAB_MODE=sandbox`需要至少24字符随机`LAB_DEV_TOKEN`；更方便的`npm.cmd run gateway:sandbox`自动生成临时令牌。真实模式设`LAB_MODE=gateway`，不接受开发令牌。

Entra：为本网关定义`lab.read`、`lab.plan`、`lab.approve`、`lab.execute`权限，设置租户和audience。当前校验器仅支持指定租户的Entra v2 RS256访问令牌；不是Graph令牌，也不是ID token。JWKS仅从固定Microsoft租户地址读取。生产还需登录客户端、客户端应用allowlist、Conditional Access策略和企业级身份中间件审查。

Graph：服务端client credentials使用固定租户、客户端、密钥、邮箱和drive。邮件读取前20条，包含bodyPreview；草稿创建使用`POST /users/{configured-mailbox}/messages`，不是`sendMail`。[S3][S4] 文件只读根目录前20条元数据。[S5] 本版不下载附件或文件内容。管理员应限制应用邮箱/站点范围，密钥从受控机密存储注入。示例只实现shared-secret方式，不含证书、managed identity或OBO。

SAP：`SAP_BASE_URL`仅HTTPS origin，不带路径、账号、query。读取路径和创建路径由服务端JSON映射指定，浏览器不能提交任意上游URL。`collectionPath`支持`value`或`d.results`等实际集合路径。`fields`和`lineFields`将来源字段映射为本地审核案例；缺失字段留空，不虚构。`linesPath`应指向实际行数组。日期必须转换为ISO，价格必须明确价格单位；本示例不自动解析SAP `/Date(...)`、价格单位或币种换算。

写入映射的字符串`$case.banf.currency`表示取值；常量原样保留。`{"$map":"case.lines","$each":{"Material":"$item.material"}}`逐行映射，不使用eval。所有示例路径、字段和必填组织主数据必须按实际API修改。映射文件启动时加载，修改后重启会丢失内存计划。写入先GET获取CSRF和会话Cookie，再POST一次；无自动重试、PATCH或ETag更新。[S7]

### HTTP约定

所有`/api/v1/*`需要`Authorization: Bearer <gateway-token>`。POST需要`Content-Type: application/json`。返回`Cache-Control: no-store`。每身份每分钟最多120请求，单进程限流；POST最多250000字节。

```text
GET  /health                           无业务数据的存活信息
GET  /api/v1/capabilities               已配置能力、当前身份和权限
GET  /api/v1/sap/purchase-orders        订单审核副本，最多20条
GET  /api/v1/graph/messages             收件箱摘要，最多20条
GET  /api/v1/graph/files                文件元数据，最多20条
GET  /api/v1/audit                      内存动作记录，不是防篡改审计
POST /api/v1/actions/preview            {action,payload}
GET  /api/v1/actions/{id}               读取计划
POST /api/v1/actions/{id}/approve       {hash}
POST /api/v1/actions/{id}/execute       {hash} + Idempotency-Key header
```

仅允许`sap.createRequisition`、`sap.createPurchaseOrder`、`graph.createDraft`。没有发送邮件、付款或发票过账端点。计划冻结目标、载荷和SHA-256哈希；5分钟有效。真实模式要求不同审核人。创建者持`lab.execute`执行；同一计划同一幂等键重复请求返回已有结果。未知结果进入`uncertain`，不再执行。

### 生产阻断项

内存计划和幂等账本不是持久化业务事务；不支持跨重启、多实例或多计划业务去重。真实运行前增加持久化数据库、唯一业务键、恢复对账、审计、防泄漏、服务端企业审批、监控和完整SSO。客户端BANF标记只用于本地数据完整性，不能作为可信企业审批凭证。当前不是生产就绪认证。

## Deutsch

### Architektur und Einrichtung

Statisches Frontend → separates HTTPS-Gateway → fest konfigurierte SAP-/Graph-Ziele. Pages betreibt keinen Node.js-Server.[S1] Browser hält nur das Gateway-Token, niemals Graph-/SAP-Geheimnisse.[S6] Kein echtes Gateway aus`file://`, kein`Origin: null`.

`.env.example`serverseitig als`.env`kopieren;`npm.cmd run gateway`lädt die Datei. Sandbox benötigt ein zufälliges Token mit mindestens24Zeichen;`gateway:sandbox`erzeugt es automatisch. Echtes`LAB_MODE=gateway`akzeptiert kein Entwicklungstoken.

Entra-v2-RS256-Zugriffstoken für das Gateway mit festem Mandanten/Audience und`lab.read`,`lab.plan`,`lab.approve`,`lab.execute`. Kein Graph- oder ID-Token. Produktions-Login, Client-Allowlist, Conditional Access und Identitätsprüfung durch IT ergänzen.

Graph verwendet serverseitige Client Credentials mit festem Postfach und Drive. Erste20Mails einschließlich bodyPreview, Entwurf über`POST /users/{configured-mailbox}/messages`, kein Versand.[S3][S4] Erste20Dateimetadaten aus Drive-Root, kein Inhalts-/Anhangdownload.[S5] Ressourcen administrativ begrenzen. Beispiel nutzt Shared Secret, keine Zertifikate, Managed Identity oder OBO.

SAP-Basis ist ein HTTPS-Origin ohne Pfad/Query/Benutzerinfo. Pfade und Felder kommen nur aus serverseitigem Mapping. Sammlung z.B.`value`oder`d.results`, Positionen über`linesPath`; fehlende Felder bleiben leer. ISO-Datum und Preiseinheit ausdrücklich prüfen; keine automatische SAP-Datums-/Preiseinheitskonvertierung.

`$case...`liest Werte;`$map`/`$each`bildet Positionen ab, ohne eval. Alle Beispielpfade und Pflichtstammdaten ersetzen. CSRF und Sitzungscookies werden vor einmaligem POST gelesen; kein automatischer Retry, PATCH oder ETag-Update.[S7]

### Vertrag und Grenzen

Die obige Endpunktliste ist sprachunabhängig. Alle API-Endpunkte benötigen Bearer-Token, POST benötigt JSON. Antworten sind no-store.120Anfragen pro Identität/Minute,250000Bytes pro POST, jeweils nur ein Prozess.

Nur BANF-Anlage, PO-Anlage und Mailentwurf. Plan friert Ziel/Nutzdaten/Hash ein, gilt5Minuten. Echtes Gateway verlangt anderen Prüfer. Gleicher Plan und Idempotenzschlüssel liefern vorhandenes Ergebnis; unklare Ergebnisse werden gesperrt.

Vor Produktion dauerhafte Datenbank, Geschäfts-Deduplizierung, Wiederherstellung/Abgleich, Audit, Unternehmensfreigaben, Datenschutz, Monitoring und vollständiges SSO ergänzen. Lokale BANF-Markierung ist kein vertrauenswürdiger Unternehmensfreigabenachweis. Kein Produktionszertifikat.

## English

### Topology and configuration

Static frontend → separate HTTPS gateway → fixed SAP/Graph targets. Pages does not run Node.js servers.[S1] Browser holds only the gateway token, never Graph/SAP secrets.[S6] Real gateway use from`file://`is blocked;`Origin: null`is not allowed.

Copy`.env.example`to server-side`.env`;`npm.cmd run gateway`loads it. Sandbox needs a random token of at least24characters;`gateway:sandbox`generates one. Real`LAB_MODE=gateway`never accepts the development token.

Use an Entra v2 RS256 access token for the gateway, fixed tenant/audience, with`lab.read`,`lab.plan`,`lab.approve`,`lab.execute`. Not a Graph or ID token. Add production sign-in, authorized-client allowlist, Conditional Access and IT-reviewed identity middleware.

Graph uses server-side client credentials, fixed mailbox and drive. Reads first20messages including bodyPreview; creates drafts through`POST /users/{configured-mailbox}/messages`, never sendMail.[S3][S4] Lists first20root file metadata, no file/attachment content download.[S5] Administrators must restrict resources. Sample implements shared secrets, not certificates, managed identity or OBO.

SAP base is an HTTPS origin without path/query/userinfo. Only server mapping controls paths/fields. Collection may be`value`or`d.results`;`linesPath`points to actual line arrays. Missing values stay blank. Validate ISO dates and price units; no automatic SAP date/price-unit conversion.

`$case...`resolves values;`$map`/`$each`maps lines without eval. Replace all illustrative paths and mandatory master data. Fetch CSRF/session cookies before one POST; no automatic retries, PATCH or ETag updates.[S7]

### Contract and production blockers

The endpoint list above is language-independent. All API endpoints require Bearer authentication; POST requires JSON. Responses are no-store.120requests per identity/minute and250000bytes per POST, single-process limits.

Only requisition creation, PO creation and mail drafts. Plans freeze target/payload/hash and expire after5minutes. Real gateway requires a different approver. Same plan/key returns the previous result; uncertain outcomes are quarantined.

Before production add durable database, business-key deduplication, reconciliation/recovery, audit, enterprise approval, data protection, monitoring and full SSO. Local BANF flags are not trusted enterprise approval evidence. This is not production certification.

## Sources / Quellen / 来源

See README references [S1]–[S7]. The supplied SAP mapping is illustrative, not an assertion about your SAP metadata.
