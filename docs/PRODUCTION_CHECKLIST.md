# Production acceptance / Produktionsabnahme / 生产验收

中文：以下项目必须由IT/采购/安全负责人验收，不因“已拥有接口权限”自动满足：完整SSO；客户端应用白名单；最小权限与资源范围；持久化动作/幂等/审计；多副本并发和恢复对账；SAP实际元数据、主数据、价格单位和日期转换；企业审批；数据保护/保留；真实测试租户验收；TLS/反向代理/限流/监控；机密轮换；备份恢复；回滚和人工应急。未完成前保持真实写入关闭。

Deutsch: IT/Einkauf/Sicherheit müssen SSO, Client-Allowlist, minimale Rechte/Ressourcen, dauerhafte Pläne/Idempotenz/Audit, Parallelität/Wiederherstellung, SAP-Metadaten/Stammdaten/Preiseinheiten/Datum, Unternehmensfreigaben, Datenschutz/Aufbewahrung, Testmandantenabnahme, TLS/Proxy/Monitoring, Geheimnisrotation, Backup und manuelle Notfallprozesse abnehmen. Bis dahin echte Schreibzugriffe deaktiviert lassen.

English: IT/procurement/security must accept full SSO, authorized-client allowlist, least privilege/resource scope, durable plans/idempotency/audit, concurrency/recovery, SAP metadata/master data/price units/dates, enterprise approval, privacy/retention, test-tenant acceptance, TLS/proxy/monitoring, secret rotation, backup and manual fallback. Keep real writes disabled until accepted.
