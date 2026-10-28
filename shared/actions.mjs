import {validateBanf,validatePO,blocking,clone,demoCase} from '../src/engine.mjs';
export const ACTIONS=['sap.createRequisition','sap.createPurchaseOrder','graph.createDraft'];
export class LabError extends Error{constructor(code,status=400,detail=''){super(code);this.code=code;this.status=status;this.detail=detail;}}
export const canonical=value=>{if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';return JSON.stringify(value);};
export async function hash(value){const bytes=new TextEncoder().encode(canonical(value));const digest=await globalThis.crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');}
const uuid=()=>globalThis.crypto.randomUUID();
export function validateAction(action,payload){
 if(!ACTIONS.includes(action))throw new LabError('actionUnsupported');
 if(!payload||typeof payload!=='object'||Array.isArray(payload))throw new LabError('payloadInvalid');
 if(action==='graph.createDraft'){
  const {to,subject,body}=payload;
  if(typeof to!=='string'||!/^([^\s@]+)@([^\s@]+)\.[^\s@]+$/.test(to)||typeof subject!=='string'||!subject.trim()||subject.length>250||typeof body!=='string'||body.length>20000)throw new LabError('payloadInvalid');
  return {to,subject,body};
 }
 let c;try{c=clone(payload.case);}catch{throw new LabError('payloadInvalid');}
 if(!c||typeof c.id!=='string'||!c.id||c.id.length>100||!c.banf||!c.po||!c.supplier||!Array.isArray(c.lines)||c.lines.length>100)throw new LabError('payloadInvalid');
 let issues;try{issues=action==='sap.createRequisition'?validateBanf(c):validatePO(c);}catch{throw new LabError('payloadInvalid');}
 if(blocking(issues))throw new LabError('validationBlocked',422);
 // Only the fields needed for the proposed write enter the immutable plan.
 return {case:{id:c.id,banf:{requester:c.banf.requester,costCenter:c.banf.costCenter,project:c.banf.project,site:c.banf.site,reason:c.banf.reason,currency:c.banf.currency,reviewed:c.banf.reviewed===true},supplier:{name:String(c.supplier.name||''),email:String(c.supplier.email||''),country:String(c.supplier.country||'')},po:{number:String(c.po.number||''),payment:String(c.po.payment||'')},lines:c.lines.map(l=>({material:l.material,description:l.description,qty:l.qty,unit:l.unit,price:l.price,needDate:l.needDate}))}};
}
export class ActionService{
 constructor(adapter,{ttlMs=300000,max=300,separateApprover=false,now=()=>Date.now()}={}){this.adapter=adapter;this.ttlMs=ttlMs;this.max=max;this.separateApprover=separateApprover;this.now=now;this.plans=new Map();this.events=[];}
 event(action,id,actor,state){this.events.push({at:new Date(this.now()).toISOString(),action,id,actor:actor.id,state});this.events=this.events.slice(-500);}
 clean(){for(const [id,p]of this.plans)if(p.expiresAt<this.now()&&!['executing','uncertain'].includes(p.state))this.plans.delete(id);}
 async preview(actor,action,input){
  if(!actor.scopes.includes('lab.plan'))throw new LabError('forbidden',403);
  this.clean();if(this.plans.size>=this.max)throw new LabError('capacityLimit',429);
  const payload=validateAction(action,input);const target=this.adapter.target?.(action)||{system:action.startsWith('sap.')?'SAP':'Microsoft Graph',environment:'sandbox'};const plan={id:uuid(),action,payload,target,hash:await hash({action,payload,target}),creator:actor.id,approver:null,state:'preview',createdAt:this.now(),expiresAt:this.now()+this.ttlMs,mode:this.adapter.mode};
  this.plans.set(plan.id,plan);this.event(action,plan.id,actor,'preview');return this.public(plan);
 }
 public(p){return clone({id:p.id,action:p.action,payload:p.payload,target:p.target,hash:p.hash,creator:p.creator,approver:p.approver,state:p.state,createdAt:p.createdAt,expiresAt:p.expiresAt,mode:p.mode,result:p.result||null});}
 get(actor,id){const p=this.plans.get(id);if(!p)throw new LabError('planMissing',404);if(p.creator!==actor.id&&!actor.scopes.includes('lab.approve'))throw new LabError('forbidden',403);return this.public(p);}
 approve(actor,id,digest){const p=this.plans.get(id);if(!p)throw new LabError('planMissing',404);if(!actor.scopes.includes('lab.approve'))throw new LabError('forbidden',403);if(this.separateApprover&&p.creator===actor.id)throw new LabError('separationRequired',403);if(p.expiresAt<this.now())throw new LabError('planExpired',409);if(p.hash!==digest)throw new LabError('hashMismatch',409);if(p.state!=='preview')throw new LabError('stateConflict',409);p.state='approved';p.approver=actor.id;this.event(p.action,id,actor,'approved');return this.public(p);}
 async execute(actor,id,digest,key){
  const p=this.plans.get(id);if(!p)throw new LabError('planMissing',404);
  if(!actor.scopes.includes('lab.execute')||p.creator!==actor.id)throw new LabError('forbidden',403);
  if(!key||typeof key!=='string'||key.length>120)throw new LabError('idempotencyRequired');
  if(p.hash!==digest)throw new LabError('hashMismatch',409);
  if(p.state==='completed'&&p.key===key)return this.public(p);
  if(p.state==='uncertain')throw new LabError('uncertainResult',409);
  if(p.expiresAt<this.now())throw new LabError('planExpired',409);
  if(p.state!=='approved')throw new LabError('stateConflict',409);
  p.key=key;p.state='executing';this.event(p.action,id,actor,'executing');
  try{p.result=await this.adapter.execute(p.action,clone(p.payload),{idempotencyKey:key,actor:actor.id,planId:id});p.state='completed';this.event(p.action,id,actor,'completed');return this.public(p);}
  catch(e){p.state=e.code==='writeDisabled'||e.code==='mappingMissing'||e.code==='validationBlocked'?'failed':'uncertain';p.error=e.code||'upstreamError';this.event(p.action,id,actor,p.state);throw new LabError(p.state==='uncertain'?'uncertainResult':p.error,p.state==='uncertain'?409:400);}
 }
}
export class SandboxAdapter{
 constructor(){this.mode='sandbox';this.orders=[demoCase('clean'),demoCase('late')];this.orders[1].po.number='4500999002';this.orders[1].ab.reference='4500999002';this.orders[1].invoice.reference='4500999002';this.counter=0;this.fault='none';this.drafts=[];}
 target(action){return {system:action.startsWith('sap.')?'SAP':'Microsoft Graph',environment:'fictional-sandbox',destination:'No external system'};}
 async capabilities(){return {mode:'sandbox',source:'fictional',sapRead:true,graphRead:true,actions:ACTIONS,separateApprover:false,durableLedger:false};}
 async listOrders(){this.checkRead();return {items:clone(this.orders),source:'fictional',fetchedAt:new Date().toISOString()};}
 async listMessages(){this.checkRead();return {items:[{id:'DEMO-MSG-001',subject:'DEMO · AB 4500999001',from:'supplier@example.invalid',receivedDateTime:'2026-10-28T09:00:00Z',bodyPreview:'Fictional confirmation. No real mailbox data.'},{id:'DEMO-MSG-002',subject:'DEMO · Delivery update 4500999002',from:'supplier@example.invalid',receivedDateTime:'2026-10-28T10:00:00Z',bodyPreview:'Fictional capacity update. Human review required.'}],source:'fictional'};}
 async listFiles(){this.checkRead();return {items:[{id:'DEMO-FILE-001',name:'DEMO_AB_4500999001.txt',size:260,webUrl:null},{id:'DEMO-FILE-002',name:'DEMO_Invoice_4500999001.txt',size:220,webUrl:null}],source:'fictional'};}
 checkRead(){if(this.fault==='unauthorized')throw new LabError('unauthorized',401);if(this.fault==='throttled')throw new LabError('throttled',429);}
 async execute(action,payload){this.counter++;if(this.fault==='uncertain')throw new LabError('upstreamTimeout',504);if(this.fault==='conflict')throw new LabError('upstreamConflict',409);if(action==='graph.createDraft'){const d={id:'DEMO-DRAFT-'+this.counter,isDraft:true,source:'fictional',...payload};this.drafts.push(d);return {externalId:d.id,isDraft:true,source:'fictional',sent:false};}return {externalId:(action==='sap.createPurchaseOrder'?'DEMO-PO-':'DEMO-BANF-')+this.counter,source:'fictional',postedToSAP:false};}
}
export function localSandbox(){const adapter=new SandboxAdapter();const actor={id:'local-demo-buyer',scopes:['lab.read','lab.plan','lab.approve','lab.execute']};return {adapter,actor,service:new ActionService(adapter)};}
