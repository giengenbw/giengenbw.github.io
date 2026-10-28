# ZIEGLER LAB V9

## English: ZIEGLER LAB V9 – Detailed guide

### 1. Deliverables and real-connection boundary

V9 preserves the six agents, three interface languages, independent conversation/coach languages, both collapsible sidebars, learning paths, plans, debriefs and local memory. It adds a SAP/Microsoft 365 workbench, shared action-planning engine and separate Node.js gateway.

The design assumes organizational permission to use SAP and Microsoft 365. It does not contain your tenant, credentials, SAP version or real business data. Clearly labeled simulation is the default. Configured capabilities are not proof of verified permissions.

Three distributions:
- GitHub Pages code: frontend source, shared simulation engine, deployment workflow, prebuilt `site/`, frontend tests and detailed trilingual README. No real gateway implementation or enterprise credentials.
- Complete package: also includes gateway, authentication, SAP/Graph adapters, environment example, API documentation, tests, launchers and offline HTML.
- Single HTML: opens locally without installation and embeds this trilingual README behind the top button. A real gateway is blocked under `file://`; host the frontend over HTTP(S) to use it.

### 2. Demonstrate without installation

Download the HTML and open it in Edge or Chrome, not only the attachment preview. Alternatively extract the complete package and launch `START_DEMO.cmd`. Select Deutsch / English / 中文 at the top right. Both sidebars collapse independently; `Alt+[` toggles left and `Alt+]` right. Collapsing the call panel preserves the session.

Start with “Demo: clean workflow”: review BANF, create a local PO draft, compare confirmation, inspect partial receipts and match the invoice. Then demonstrate price/quantity variance and late delivery. All fixtures are fictional.

In “SAP & Microsoft 365”:
1. Keep local interface simulation selected and connect.
2. Load SAP orders, Outlook inbox and SharePoint/OneDrive file metadata.
3. Copy an order into a local review case. Source data is unchanged and local review flags reset.
4. Select requisition creation, PO creation or Outlook draft creation.
5. Create an immutable plan and inspect its full payload, action, ID, content hash and expiry.
6. Check the explicit human-review box, approve, then execute.
7. Simulate unauthorized access, throttling, conflict or write timeout. Uncertain outcomes disable re-execution and are never automatically retried.

### 3. Six agents

- Negotiation Training: twelve fictional scenarios, three modes, coaching, manual events, evidence-linked debriefs, learning and attempt comparison. Rule-based, not a live model or real-time avatar.
- BANF: requester, cost center, WBS, site, justification, currency and multiple lines; validate required fields, quantities, prices, dates and duplicate materials; manual review and text export.
- Purchase Order: shared requisition data, supplier, email, payment and ten-digit PO number starting 4500. This numbering rule is a demo convention, not a universal SAP rule.
- Order Confirmation: manual or structured text; compare reference, currency, quantity, price, date, missing and unknown lines. Recording a review does not accept variances.
- Delivery Tracking: shipment, tracking, delivery note, partial receipts and outstanding quantity. Early positive, late negative: requested date minus receipt date. Completion is the first date cumulative valid receipts meet ordered quantity.
- Invoice Review: PO/receipt/invoice match; block excess invoicing, detect price/currency/reference differences and local duplicate invoices. Manually entered tax is arithmetic only. No payment.

### 4. Deploy to GitHub Pages

GitHub Pages is static hosting. Run the real gateway separately.[S1]

Recommended automated deployment:
1. Create a repository and place extracted package contents directly at its root. Keep `.github/workflows/pages.yml`; do not add an extra wrapper directory.
2. Push to `main`.
3. Settings → Pages → Build and deployment → Source: GitHub Actions.
4. Inspect Actions. The workflow runs `npm ci`, `npm test`, `npm run build` and publishes only `dist/`, never server code or `.env`.
5. Relative asset paths support project subpaths. Internal state navigation needs no server rewrites.

No-build alternative: copy all contents of `site/` into a separate publishing repository root and select `main`/root publishing. The development `index.html` at package root is not a prebuilt entry; it references source files.

Pages may be publicly visible. Never upload real orders, personal data, credentials or confidential information. A private repository does not automatically mean a private site.[S2] This delivery did not create a repository, push code or publish a public website for you.

### 5. Develop and repack

Development needs compatible Node.js and npm; see `package.json` engines. Offline HTML needs neither.

```powershell
npm.cmd ci
npm.cmd run dev
npm.cmd test
npm.cmd run html
```

The final command builds `dist/` and `ZIEGLER_LAB_V9_DE_EN_ZH.html`. Both code packages can be rebuilt. `npm ci` needs network access; `node_modules` is not bundled.

### 6. Test a separate sandbox gateway

Complete package only: run `npm.cmd run dev` in terminal 1, then in terminal 2:

```powershell
npm.cmd run gateway:sandbox
```

The launcher binds `127.0.0.1:8787` and prints a random temporary token. Open the HTTP frontend, choose separate gateway mode and enter the address and token. Default CORS allows local port-5173 origins only; update `ALLOWED_ORIGINS` if Vite chooses another port.

This tests real browser-to-gateway HTTP communication but still uses fictional adapters. The temporary token is not production authentication.

### 7. Configure real SAP / Microsoft 365

See `docs/INTEGRATION.md`:
1. Deploy the gateway separately behind TLS and set `LAB_MODE=gateway`.
2. Configure `ENTRA_TENANT_ID` and `ENTRA_AUDIENCE`. Use an Entra v2 access token for this gateway. The server verifies RS256 signature, tenant, issuer, audience, expiry and `lab.read` / `lab.plan` / `lab.approve` / `lab.execute` permissions.
3. Browser tokens stay in memory. Manual token input is for controlled integration testing; full MSAL login, refresh, logout and Conditional Access interaction are not yet implemented.
4. Graph uses server-side client credentials: `M365_TENANT_ID`, `M365_CLIENT_ID`, `M365_CLIENT_SECRET`, fixed `M365_MAILBOX` and `M365_DRIVE_ID`. Never put credentials in browser code or the repository.[S6]
5. Reading bodyPreview needs appropriate mail-read permission; draft creation needs Mail.ReadWrite. File listing needs appropriate file/site read permissions. Administrators must choose and restrict actual resources rather than grant unrestricted tenant-wide access by default.[S3][S4][S5]
6. `ENABLE_GRAPH_DRAFT=false` is the default. Enabling it permits approved drafts, not sending.[S3]
7. SAP requires `SAP_BASE_URL`, `SAP_BEARER_TOKEN`, `SAP_MAPPING_FILE`. All example paths are placeholders. Replace them against approved API metadata and add organization-specific required fields: purchasing organization/group, plant, business partner ID, price unit and date format. Supplier display names are not universal SAP master-data IDs.
8. Keep `ENABLE_SAP_WRITES=false` until sandbox acceptance. The adapter supports configured POST creation, CSRF tokens and session cookies, not PATCH/ETag updates.[S7]
9. Set `ALLOWED_ORIGINS` to the exact frontend origin, e.g. `https://YOUR-ORG.github.io`, without repository path or wildcard. No `file://` origin.

The real gateway requires a different approver from the creator. The approver loads the plan ID with their own token and approves; the creator refreshes and executes. Local checkboxes and BANF flags do not replace enterprise approval. Execution uses only the frozen payload.

### 8. Memory, backup and operational limits

Procurement data is memory-only unless explicitly enabled. Consent stores language, fold state, cases and local review notes. Opting out deletes persistence, not the current in-memory view. Training persistence/deletion remains separate; private notes and media are not stored.

JSON schema remains 8 for V8 compatibility; V9 uses separate browser keys. Export from V8 and import into V9; import replaces cases and resets reviews. Limits: 100 cases, 100 lines per document, 500 receipts and 2 MB import.

Gateway tokens, connection settings, action plans and loaded mail/file lists are excluded from procurement backups. Copied enterprise orders become local cases and may persist if memory is enabled; obtain permission first. Browser storage is unencrypted.

Plans expire after five minutes, with at most 300 plans and 500 events in memory. Idempotency works only within one running process, not across restarts or replicas. Do not create a fresh plan to blindly retry an uncertain outcome. Add durable idempotency, audit, reconciliation/recovery, concurrency control and monitoring before production.

One confirmation and invoice per case. No cumulative multiple-invoice allocation, credit notes, FX, freight allocation, tax rules, bank checks, payment, PDF/OCR, attachment downloads, Teams/calendar writes or live model. Graph reads the first 20 messages/file metadata; SAP reads the first 20 orders, without automatic pagination. Real SAP confirmation, goods-receipt and invoice reads are not implemented; these remain local entry.

Speech depends on browser/vendor services and is not guaranteed offline. Real Windows launchers, enterprise tenants, SAP and hardware were not tested. Test reports are not production certification.

### 9. Troubleshooting

- npm missing: use the HTML; ask IT to install Node.js for development and reopen the terminal.
- Blank Pages: check directory depth, Actions logs and complete `dist/` assets; do not upload only the development index.html.
- 401: check token expiry, audience and tenant. A Graph token is not a gateway token.
- 403: check roles, different approver, CORS and upstream resource authorization.
- 429: wait and manually repeat reads; never automatically retry writes.
- Mapping error: verify metadata, collection/line paths, mandatory master data and result-ID path.
- Uncertain write: reconcile in the source system first; do not resubmit or rely on refreshing the page.
- Missing memory: check consent and browser storage. Renaming/moving HTML can change storage scope; migrate using JSON.

### 10. Tests and structure

`npm test` covers the engine, action state machine, gateway and adapters. The Pages package runs only included frontend/shared tests. Browser regression: `tests/browser_smoke.py`, plus `tests/browser_enterprise.py` in the complete package. Results are in `docs/TEST_REPORT.md`.

`src/` frontend; `shared/` action engine; `server/` gateway (complete package); `scripts/` build/packing; `.github/workflows/` deployment; `dist/` build output; `site/` prebuilt Pages output; `examples/` fictional data; `docs/` guides and test evidence.

## Official references / Offizielle Quellen / 官方参考

- [S1] GitHub Pages static hosting: https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages
- [S2] Creating a Pages site and visibility warning: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- [S3] Microsoft Graph create draft, Mail.ReadWrite: https://learn.microsoft.com/en-us/graph/api/user-post-messages?view=graph-rest-1.0
- [S4] Microsoft Graph list messages: https://learn.microsoft.com/en-us/graph/api/user-list-messages?view=graph-rest-1.0
- [S5] Microsoft Graph drive children: https://learn.microsoft.com/en-us/graph/api/driveitem-list-children?view=graph-rest-1.0
- [S6] Microsoft identity platform client credentials: https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-client-creds-grant-flow
- [S7] SAP Cloud SDK CSRF handling: https://sap.github.io/cloud-sdk/docs/js/features/connectivity/csrf

References checked for this delivery. SAP example mappings are illustrative and not certified against your system.
