import {localSandbox,LabError} from '../shared/actions.mjs';
export function gatewayUrl(value){let u;try{u=new URL(value);}catch{throw new LabError('httpsRequired');}if(u.username||u.password||u.search||u.hash||!['http:','https:'].includes(u.protocol)||(u.protocol==='http:'&&!['localhost','127.0.0.1','[::1]'].includes(u.hostname)))throw new LabError('httpsRequired');return u.origin+u.pathname.replace(/\/$/,'');}
export class EnterpriseClient{
 constructor(){this.local=localSandbox();this.mode='sandbox';this.base='';this.token='';}
 disconnect(){this.token='';this.base='';this.mode='sandbox';}
 async connect(base,token){if(globalThis.location?.protocol==='file:')throw new LabError('gatewayOnly');this.base=gatewayUrl(base);this.token=token;this.mode='gateway';try{return await this.capabilities();}catch(e){this.disconnect();throw e;}}
 async request(path,{method='GET',body,key}={}){
  let r;try{r=await fetch(this.base+path,{method,credentials:'omit',redirect:'error',cache:'no-store',headers:{Authorization:'Bearer '+this.token,...(body?{'content-type':'application/json'}:{}),...(key?{'idempotency-key':key}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(20000)});}catch{throw new LabError(method==='POST'&&path.endsWith('/execute')?'uncertainResult':'timeout',504);}
  const data=await r.json().catch(()=>({}));if(!r.ok)throw new LabError(data.error?.code||'upstreamError',r.status);return data;
 }
 capabilities(){return this.mode==='sandbox'?this.local.adapter.capabilities():this.request('/api/v1/capabilities');}
 orders(){return this.mode==='sandbox'?this.local.adapter.listOrders():this.request('/api/v1/sap/purchase-orders');}
 messages(){return this.mode==='sandbox'?this.local.adapter.listMessages():this.request('/api/v1/graph/messages');}
 files(){return this.mode==='sandbox'?this.local.adapter.listFiles():this.request('/api/v1/graph/files');}
 preview(action,payload){return this.mode==='sandbox'?this.local.service.preview(this.local.actor,action,payload):this.request('/api/v1/actions/preview',{method:'POST',body:{action,payload}});}
 approve(plan){return this.mode==='sandbox'?Promise.resolve(this.local.service.approve(this.local.actor,plan.id,plan.hash)):this.request(`/api/v1/actions/${plan.id}/approve`,{method:'POST',body:{hash:plan.hash}});}
 execute(plan,key){return this.mode==='sandbox'?this.local.service.execute(this.local.actor,plan.id,plan.hash,key):this.request(`/api/v1/actions/${plan.id}/execute`,{method:'POST',body:{hash:plan.hash},key});}
 get(id){return this.mode==='sandbox'?Promise.resolve(this.local.service.get(this.local.actor,id)):this.request(`/api/v1/actions/${encodeURIComponent(id)}`);}
 audit(){return this.mode==='sandbox'?Promise.resolve({items:this.local.service.events,durable:false}):this.request('/api/v1/audit');}
 reset(){this.disconnect();this.local=localSandbox();}
}
