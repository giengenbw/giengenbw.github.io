import {text as translatedIssue} from './catalog.js';
// ZIEGLER LAB local procurement engine. No SAP, bank or external API calls.
export const SCHEMA_VERSION=8;
export const id=()=>globalThis.crypto?.randomUUID?.()||`lab-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const clone=value=>JSON.parse(JSON.stringify(value));
export function decimal(value,places=2){
 const s=String(value??'').trim();
 if(!/^\d+(?:[.,]\d+)?$/.test(s))return null;
 const parts=s.replace(',','.').split('.');
 if((parts[1]||'').length>places)return null;
 const n=Number(parts[0])*10**places+Number((parts[1]||'').padEnd(places,'0'));
 return Number.isSafeInteger(n)&&n<=100000000000?n:null;
}
export function validDate(value){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return false;
 const d=new Date(`${value}T00:00:00Z`);
 return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value;
}
export function normalizeDate(value){
 const s=String(value||'').trim();if(validDate(s))return s;
 const m=s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);const iso=m?`${m[3]}-${m[2]}-${m[1]}`:'';
 return validDate(iso)?iso:'';
}
// Positive = early; negative = late. UTC avoids daylight-saving differences.
export function dayDifference(baseline,actual){
 if(!validDate(baseline)||!validDate(actual))return null;
 return Math.round((Date.parse(baseline+'T00:00:00Z')-Date.parse(actual+'T00:00:00Z'))/86400000);
}
export function lineCents(line){const q=decimal(line.qty,3),p=decimal(line.price,2);return q===null||p===null?null:(()=>{const v=(BigInt(q)*BigInt(p)+500n)/1000n;return v<=BigInt(Number.MAX_SAFE_INTEGER)?Number(v):null;})();}
export function totalCents(lines){const v=lines.map(lineCents);return v.some(n=>n===null)?null:(()=>{const sum=v.reduce((a,b)=>a+BigInt(b),0n);return sum<=BigInt(Number.MAX_SAFE_INTEGER)?Number(sum):null;})();}
export function invoiceTotals(lines,vat){const net=totalCents(lines),rate=decimal(vat,2);if(net===null||rate===null||rate>10000)return {net:null,tax:null,gross:null};const tax=Number((BigInt(net)*BigInt(rate)+5000n)/10000n);return Number.isSafeInteger(net+tax)?{net,tax,gross:net+tax}:{net:null,tax:null,gross:null};}
export function blankLine(){return {id:id(),material:'',description:'',qty:'1',unit:'PC',price:'0.00',needDate:''};}
export function blankCase(){return {id:id(),name:'',demo:false,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),banf:{requester:'',costCenter:'',project:'',site:'Giengen',reason:'',currency:'EUR',reviewed:false},supplier:{name:'',email:'',country:'DE'},po:{number:'',payment:'',created:false},lines:[blankLine()],ab:{reference:'',number:'',currency:'EUR',lines:[],reviewed:false,raw:'',reviewNote:''},delivery:{shipDate:'',tracking:'',note:'',receipts:[]},invoice:{reference:'',number:'',date:'',currency:'EUR',vat:'0',lines:[],reviewed:false,raw:'',reviewNote:''},audit:[]};}
export function demoCase(kind='clean'){
 const c=blankCase();c.demo=true;c.name=kind==='variance'?'demoVariance':kind==='late'?'demoLate':'demoClean';
 c.banf={requester:'Demo Buyer',costCenter:'DEMO-4100',project:'DEMO-26-001',site:'Giengen',reason:'Fictional training case / Fiktiver Übungsfall / 虚构练习',currency:'EUR',reviewed:false};
 c.supplier={name:'Nordwerk Components · FICTIONAL',email:'supplier@example.invalid',country:'DE'};
 c.po={number:'4500999001',payment:'30 days after delivery',created:false};
 c.lines=[{id:id(),material:'DEMO-1001',description:'Demo bracket / Demo-Halter / 演示支架',qty:'20',unit:'PC',price:'25.00',needDate:'2026-11-16'},{id:id(),material:'DEMO-1002',description:'Demo mounting kit / Demo-Montagesatz / 演示安装件',qty:'10',unit:'PC',price:'40.00',needDate:'2026-11-18'}];
 c.ab={reference:c.po.number,number:'AB-DEMO-001',currency:'EUR',lines:c.lines.map(l=>({id:id(),material:l.material,qty:l.qty,price:kind==='variance'&&l.material==='DEMO-1001'?'27.50':l.price,date:kind==='late'?'2026-11-25':l.needDate})),reviewed:false,raw:'',reviewNote:''};
 c.delivery.receipts=c.lines.map(l=>({id:id(),material:l.material,qty:kind==='variance'&&l.material==='DEMO-1001'?'15':l.qty,date:kind==='late'?'2026-11-25':l.needDate,reference:'GR-DEMO-001'}));
 c.invoice={reference:c.po.number,number:'INV-DEMO-001',date:'2026-11-26',currency:'EUR',vat:'0',lines:c.lines.map(l=>({id:id(),material:l.material,qty:l.qty,price:l.price})),reviewed:false,raw:'',reviewNote:''};
 return c;
}
const issue=(code,field='',severity='error',details={})=>({code,field,severity,...details});
export function validateLines(lines,{dates=true}={}){
 const out=[];if(!Array.isArray(lines)||!lines.length)return [issue('missingLines')];
 const seen=new Set();for(const l of lines){
  if(!l.material.trim())out.push(issue('required','material'));
  if(seen.has(l.material))out.push(issue('duplicateMaterial',l.material));seen.add(l.material);
  if(!l.description?.trim()&&dates)out.push(issue('required','description'));
  if(!l.unit?.trim()&&dates)out.push(issue('required','unit'));
  const q=decimal(l.qty,3),p=decimal(l.price,2);
  if(q===null||q<=0)out.push(issue('invalidQuantity',l.material));
  if(p===null)out.push(issue('invalidPrice',l.material));
  else if(p===0)out.push(issue('zeroPrice',l.material,'warning'));
  if(dates&&!validDate(l.needDate))out.push(issue('invalidDate',l.material));
 }
 if(totalCents(lines)===null)out.push(issue('invalidTotal'));
 return out;
}
export function validateBanf(c){
 const out=validateLines(c.lines);
 for(const k of ['requester','costCenter','project','site','reason'])if(!c.banf[k]?.trim())out.push(issue('required',k));
 if(!['EUR','USD','GBP','CNY','CHF'].includes(c.banf.currency))out.push(issue('currency','currency'));
 return out;
}
export function validatePO(c){
 const out=validateBanf(c);
 if(!c.banf.reviewed)out.push(issue('banfNotReviewed'));
 if(!/^4500\d{6}$/.test(c.po.number))out.push(issue('poFormat','poNumber'));
 if(!c.supplier.name.trim())out.push(issue('required','supplier'));
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.supplier.email))out.push(issue('invalidEmail','email'));
 if(!c.po.payment.trim())out.push(issue('required','payment'));
 return out;
}
export function compareAB(c){
 const out=[];
 if(!c.po.created)out.push(issue('poNotCreated'));
 if(c.ab.reference!==c.po.number||!c.ab.reference)out.push(issue('referenceMismatch','poNumber'));
 if(!c.ab.number.trim())out.push(issue('required','abNumber'));
 if(c.ab.currency!==c.banf.currency)out.push(issue('currencyMismatch','currency'));
 const seen=new Set();
 for(const a of c.ab.lines){
  if(seen.has(a.material))out.push(issue('duplicateMaterial',a.material));seen.add(a.material);
  const l=c.lines.find(x=>x.material===a.material);
  if(!l){out.push(issue('unknownMaterial',a.material));continue;}
  const q=decimal(a.qty,3),p=decimal(a.price,2);
  if(q===null||q<=0)out.push(issue('invalidQuantity',a.material));
  else if(q!==decimal(l.qty,3))out.push(issue('quantityMismatch',a.material,'error',{expected:l.qty,actual:a.qty}));
  if(p===null)out.push(issue('invalidPrice',a.material));
  else if(p!==decimal(l.price,2))out.push(issue('priceMismatch',a.material,'error',{expected:l.price,actual:a.price}));
  if(!validDate(a.date))out.push(issue('invalidDate',a.material));
  else if(a.date!==l.needDate)out.push(issue('dateMismatch',a.material,'warning',{expected:l.needDate,actual:a.date,days:dayDifference(l.needDate,a.date)}));
 }
 for(const l of c.lines)if(!seen.has(l.material))out.push(issue('missingMaterial',l.material));
 return out;
}
export function deliveryRows(c){return c.lines.map(l=>{
 const receipts=c.delivery.receipts.filter(r=>r.material===l.material&&validDate(r.date)&&(decimal(r.qty,3)||0)>0).sort((a,b)=>a.date.localeCompare(b.date));
 const received=receipts.reduce((s,r)=>s+(decimal(r.qty,3)||0),0),ordered=decimal(l.qty,3)||0;
 let cumulative=0,completion='';for(const r of receipts){cumulative+=decimal(r.qty,3)||0;if(!completion&&ordered>0&&cumulative>=ordered)completion=r.date;}
 const actual=completion||receipts.at(-1)?.date||'';
 const confirmed=c.ab.lines.find(a=>a.material===l.material)?.date||'';
 return {material:l.material,ordered:ordered/1000,received:received/1000,open:Math.max(0,ordered-received)/1000,over:Math.max(0,received-ordered)/1000,baseline:l.needDate,confirmed,actual,completion,days:actual?dayDifference(l.needDate,actual):null,forecastDays:!actual?dayDifference(l.needDate,confirmed):null,complete:ordered>0&&received>=ordered};
 });}
export function validateReceipts(c){
 const out=[];for(const r of c.delivery.receipts){if(!c.lines.some(l=>l.material===r.material))out.push(issue('unknownMaterial',r.material));if(!validDate(r.date))out.push(issue('invalidDate',r.material));if(decimal(r.qty,3)===null||decimal(r.qty,3)<=0)out.push(issue('invalidQuantity',r.material));}
 for(const r of deliveryRows(c))if(r.over>0)out.push(issue('overReceipt',r.material,'warning',{actual:r.received,expected:r.ordered}));
 return out;
}
export function matchInvoice(c,allCases=[]){
 const out=[];
 if(!c.po.created)out.push(issue('poNotCreated'));
 if(c.invoice.reference!==c.po.number||!c.invoice.reference)out.push(issue('referenceMismatch','poNumber'));
 if(!c.invoice.number.trim())out.push(issue('required','invoiceNumber'));
 if(!validDate(c.invoice.date))out.push(issue('invalidDate','invoiceDate'));
 if(c.invoice.currency!==c.banf.currency)out.push(issue('currencyMismatch','currency'));
 const totals=invoiceTotals(c.invoice.lines,c.invoice.vat);if(totals.gross===null)out.push(issue('invalidTotal'));
 if(!c.invoice.lines.length)out.push(issue('missingLines'));
 const duplicate=allCases.find(x=>x.id!==c.id&&x.supplier.name.trim().toLowerCase()===c.supplier.name.trim().toLowerCase()&&x.invoice.number.trim().toLowerCase()===c.invoice.number.trim().toLowerCase()&&c.invoice.number.trim());
 if(duplicate)out.push(issue('duplicateInvoice','invoiceNumber'));
 const seen=new Set();
 for(const a of c.invoice.lines){
  if(seen.has(a.material))out.push(issue('duplicateMaterial',a.material));seen.add(a.material);
  const l=c.lines.find(x=>x.material===a.material);if(!l){out.push(issue('unknownMaterial',a.material));continue;}
  const q=decimal(a.qty,3),p=decimal(a.price,2),ordered=decimal(l.qty,3);
  if(q===null||q<=0)out.push(issue('invalidQuantity',a.material));
  if(p===null)out.push(issue('invalidPrice',a.material));
  else if(p!==decimal(l.price,2))out.push(issue('priceMismatch',a.material,'error',{expected:l.price,actual:a.price}));
  const received=c.delivery.receipts.filter(r=>r.material===a.material&&validDate(r.date)).reduce((s,r)=>s+(decimal(r.qty,3)||0),0);
  if(q!==null&&q>received)out.push(issue('invoiceOverReceipt',a.material,'error',{expected:received/1000,actual:q/1000}));
  if(q!==null&&ordered!==null&&q>ordered)out.push(issue('invoiceOverOrder',a.material));
 }
 out.push(...validateReceipts(c).filter(i=>i.severity==='error'));
 return out;
}
export function blocking(issues){return issues.some(i=>i.severity==='error');}
export function invalidateFrom(c,stage){
 const n=clone(c);if(stage==='banf')n.banf.reviewed=false;
 if(['banf','po'].includes(stage))n.po.created=false;
 if(['banf','po','ab'].includes(stage))n.ab.reviewed=false;
 n.invoice.reviewed=false;return n;
}
export function audit(c,action,detail=''){
 const n=clone(c);n.updatedAt=new Date().toISOString();n.audit=[...n.audit,{id:id(),at:n.updatedAt,action,detail}].slice(-300);return n;
}
// Deterministic structured text parser. No OCR and no AI extraction claims.
// Headers: PO=..., AB=... / INVOICE=..., CURRENCY=..., DATE=..., VAT=...
// Rows: material;quantity;unitPrice;date (AB), material;quantity;unitPrice (invoice)
export function parseDocument(text,type){
 const result={reference:'',number:'',currency:'EUR',date:'',vat:'0',lines:[]},errors=[];
 if(typeof text!=='string'||text.length>100000)return {value:result,errors:[issue('importSize')]};
 const headers={PO:'reference',BESTELLUNG:'reference','订单':'reference',AB:'number',AUFTRAGSBESTAETIGUNG:'number',INVOICE:'number',RECHNUNG:'number','发票':'number',CURRENCY:'currency',WAEHRUNG:'currency','币种':'currency',DATE:'date',DATUM:'date','日期':'date',VAT:'vat',MWST:'vat','税率':'vat'};
 for(const [index,raw] of text.split(/\r?\n/).entries()){
  const line=raw.trim();if(!line||line.startsWith('#'))continue;
  if(line.includes('=')){const pos=line.indexOf('='),key=line.slice(0,pos).trim().toUpperCase(),value=line.slice(pos+1).trim();if(headers[key])result[headers[key]]=value;else errors.push(issue('unknownHeader',String(index+1)));continue;}
  const cells=line.split(';').map(s=>s.trim());
  if(cells.length!==(type==='ab'?4:3)){errors.push(issue('invalidRow',String(index+1)));continue;}
  const [material,qty,price,date]=cells;
  if(!material||decimal(qty,3)===null||decimal(price,2)===null){errors.push(issue('invalidRow',String(index+1)));continue;}
  const item={id:id(),material,qty:qty.replace(',','.'),price:price.replace(',','.')};
  if(type==='ab'){item.date=normalizeDate(date);if(!item.date){errors.push(issue('invalidDate',String(index+1)));continue;}}
  result.lines.push(item);
 }
 if(result.date)result.date=normalizeDate(result.date);
 if(result.lines.length>100)errors.push(issue('importSize'));
 return {value:result,errors};
}
const str=(v,max=2000)=>typeof v==='string'?v.slice(0,max):'';
function safeLine(l,kind){
 if(!l||typeof l!=='object'||Array.isArray(l))throw Error('importSchema');
 const out={id:id(),material:str(l.material,100),qty:str(l.qty,30),price:str(l.price,30)};
 if(typeof l.qty!=='string'||typeof l.price!=='string')throw Error('importSchema');
 if(kind==='po')Object.assign(out,{description:str(l.description),unit:str(l.unit,20),needDate:str(l.needDate,10)});
 if(kind==='ab')out.date=str(l.date,10);
 return out;
}
export function exportWorkspace(cases){return JSON.stringify({product:'ZIEGLER LAB',version:SCHEMA_VERSION,exportedAt:new Date().toISOString(),cases},null,2);}
export function importWorkspace(text){
 if(typeof text!=='string'||text.length>2000000)throw Error('importSize');
 const data=JSON.parse(text);
 if(data.product!=='ZIEGLER LAB'||data.version!==SCHEMA_VERSION||!Array.isArray(data.cases)||data.cases.length>100)throw Error('importSchema');
 const ids=new Set();return data.cases.map(raw=>{
  if(!raw||!Array.isArray(raw.lines)||raw.lines.length>100||!raw.banf||!raw.supplier||!raw.po||!raw.ab||!raw.delivery||!raw.invoice)throw Error('importSchema');
  const c=blankCase();c.id=str(raw.id,100)||id();if(ids.has(c.id))throw Error('importSchema');ids.add(c.id);c.name=str(raw.name,200);c.demo=raw.demo===true;
  for(const k of ['requester','costCenter','project','site','reason','currency'])c.banf[k]=str(raw.banf[k]);
  for(const k of ['name','email','country'])c.supplier[k]=str(raw.supplier[k]);
  for(const k of ['number','payment'])c.po[k]=str(raw.po[k]);
  c.lines=raw.lines.map(l=>safeLine(l,'po'));
  for(const kind of ['ab','invoice']){
   if(!Array.isArray(raw[kind].lines)||raw[kind].lines.length>100)throw Error('importSchema');
   for(const k of ['reference','number','currency','raw','reviewNote'])c[kind][k]=str(raw[kind][k],k==='raw'?100000:2000);
   c[kind].lines=raw[kind].lines.map(l=>safeLine(l,kind));
  }
  c.invoice.date=str(raw.invoice.date,10);c.invoice.vat=str(raw.invoice.vat,10);
  if(!Array.isArray(raw.delivery.receipts)||raw.delivery.receipts.length>500)throw Error('importSchema');
  c.delivery.receipts=raw.delivery.receipts.map(r=>{if(decimal(r.qty,3)===null)throw Error('importSchema');return {id:id(),material:str(r.material,100),qty:str(r.qty,30),date:str(r.date,10),reference:str(r.reference,100)};});
  for(const k of ['shipDate','tracking','note'])c.delivery[k]=str(raw.delivery[k]);
  // Imported approvals are never trusted. Every imported case requires fresh review.
  return audit(c,'imported','Reviews reset; imported audit and approval flags not trusted.');
 });
}
export function draftMessage(c,kind,language){
 const de=language==='de',zh=language==='zh',number=c.po.number||'[PO]';
 const subject=kind==='ab'?(de?`Abweichungen in Auftragsbestätigung ${c.ab.number} / Bestellung ${number}`:zh?`订单确认差异 ${c.ab.number} / 采购订单 ${number}`:`Order confirmation discrepancies ${c.ab.number} / PO ${number}`):kind==='delivery'?(de?`Lieferstatus / Bestellung ${number}`:zh?`交付状态 / 采购订单 ${number}`:`Delivery status / PO ${number}`):(de?`Rechnungsprüfung ${c.invoice.number} / Bestellung ${number}`:zh?`发票核对 ${c.invoice.number} / 采购订单 ${number}`:`Invoice review ${c.invoice.number} / PO ${number}`);
 const lines=kind==='delivery'?deliveryRows(c).map(r=>`${r.material}: ${de?'offen':zh?'未交':'open'} ${r.open}; ${de?'Wunschtermin':zh?'需求日期':'requested date'} ${r.baseline}`).join('\n'):(kind==='ab'?compareAB(c):matchInvoice(c)).map(i=>`${i.field||'-'}: ${translatedIssue(i.code,language)}${i.expected!==undefined?` (${i.expected} → ${i.actual})`:''}`).join('\n');
 const body=de?`Guten Tag,\n\nbitte prüfen Sie die folgenden Punkte zu unserer Bestellung ${number}:\n\n${lines||'Bitte bestätigen Sie die konkreten Bedingungen schriftlich.'}\n\nBitte teilen Sie uns den aktuellen Stand und die nächsten Schritte mit.\n\nVielen Dank!`:zh?`您好，\n\n请核实采购订单 ${number} 的以下事项：\n\n${lines||'请书面确认具体条件。'}\n\n请告知最新状态及后续安排。\n\n谢谢！`:`Hello,\n\nPlease review the following points regarding our purchase order ${number}:\n\n${lines||'Please confirm the specific terms in writing.'}\n\nPlease advise the current status and next steps.\n\nThank you.`;
 return {to:c.supplier.email,subject,body};
}
