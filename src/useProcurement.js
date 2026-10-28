import {useEffect,useRef,useState} from 'react';
import * as E from './engine.mjs';
const KEY='ziegler-lab-v9-memory';
export function useProcurement({ui,setUi,collapsed,setCollapsed,rightCollapsed,setRightCollapsed}){
 const [cases,setCases]=useState([]),[activeId,setActiveId]=useState(''),[remember,setRemember]=useState(false),[error,setError]=useState('');
 const ready=useRef(false);
 useEffect(()=>{
  try{
   const raw=JSON.parse(localStorage.getItem(KEY)||'null');
   if(raw?.consent===true){
    // The local store is untrusted input too. Sanitize data, then restore only flags that
    // are consistent with current validation. Imported backups always reset flags.
    const clean=E.importWorkspace(JSON.stringify(raw.workspace));
    for(const c of clean){const old=raw.workspace.cases.find(x=>x.id===c.id);
     c.banf.reviewed=old?.banf?.reviewed===true&&!E.blocking(E.validateBanf(c));
     c.po.created=old?.po?.created===true&&!E.blocking(E.validatePO(c));
     c.ab.reviewed=old?.ab?.reviewed===true;
     c.invoice.reviewed=old?.invoice?.reviewed===true&&!E.blocking(E.matchInvoice(c,clean));
     c.audit=Array.isArray(old?.audit)?old.audit.filter(a=>a&&typeof a.action==='string'&&typeof a.at==='string').slice(-300).map(a=>({id:E.id(),action:a.action.slice(0,80),at:a.at.slice(0,40),detail:typeof a.detail==='string'?a.detail.slice(0,1000):''})):[];
    }
    setCases(clean);setActiveId(clean.some(c=>c.id===raw.activeId)?raw.activeId:clean[0]?.id||'');setRemember(true);
    if(['de','en','zh'].includes(raw.ui))setUi(raw.ui);
    setCollapsed(raw.collapsed===true);setRightCollapsed(raw.rightCollapsed===true);
   }
  }catch{setError('importSchema');}
  ready.current=true;
 },[]);
 useEffect(()=>{
  if(!ready.current||!remember)return;
  try{localStorage.setItem(KEY,JSON.stringify({consent:true,ui,collapsed,rightCollapsed,activeId,workspace:JSON.parse(E.exportWorkspace(cases))}));}
  catch{setError('importSize');}
 },[remember,ui,collapsed,rightCollapsed,activeId,cases]);
 const active=cases.find(c=>c.id===activeId)||cases[0]||null;
 function changeRemember(value){setRemember(value);if(!value)try{localStorage.removeItem(KEY);}catch{}}
 function addCase(kind){if(cases.length>=100){setError('importSize');return null;}let c=kind?E.demoCase(kind):E.blankCase();if(kind){let serial=1;while(cases.some(x=>x.po.number==='4500999'+String(serial).padStart(3,'0')))serial++;c.po.number='4500999'+String(serial).padStart(3,'0');c.ab.reference=c.po.number;c.invoice.reference=c.po.number;c.ab.number='AB-DEMO-'+String(serial).padStart(3,'0');c.invoice.number='INV-DEMO-'+String(serial).padStart(3,'0');}c=E.audit(c,'createdCase');setCases(prev=>[...prev,c]);setActiveId(c.id);return c;}
 function replace(next,action='edited',detail=''){
  setCases(prev=>prev.map(c=>c.id===next.id?E.audit(next,action,detail):c));
 }
 function edit(stage,fn){if(!active)return;const next=E.invalidateFrom(active,stage);fn(next);replace(next,'edited',stage);}
 function mark(stage){
  if(!active)return {ok:false,code:'noData'};const next=E.clone(active);
  const issues=stage==='banf'?E.validateBanf(next):stage==='po'?E.validatePO(next):stage==='invoice'?E.matchInvoice(next,cases):[];
  if(E.blocking(issues))return {ok:false,code:'blocked'};
  if(stage==='po'&&cases.some(c=>c.id!==next.id&&c.po.number===next.po.number))return {ok:false,code:'duplicatePO'};
  if(stage==='banf')next.banf.reviewed=true;
  if(stage==='po')next.po.created=true;
  if(stage==='ab')next.ab.reviewed=true;
  if(stage==='invoice')next.invoice.reviewed=true;
  replace(next,{banf:'banfReviewed',po:'poCreated',ab:'abReviewed',invoice:'invoiceReviewed'}[stage]);return {ok:true};
 }
 function remove(id){setCases(prev=>prev.filter(c=>c.id!==id));if(activeId===id)setActiveId(cases.find(c=>c.id!==id)?.id||'');}
 function importText(text){const clean=E.importWorkspace(text);setCases(clean);setActiveId(clean[0]?.id||'');}
 function addExternal(c){if(cases.length>=100){setError('importSize');return;}setCases(prev=>[...prev,E.audit(c,'imported','Source copy; review flags reset')]);setActiveId(c.id);}
 function clear(){setUi('de');setCollapsed(false);setRightCollapsed(false);setCases([]);setActiveId('');setRemember(false);setError('');try{localStorage.removeItem(KEY);}catch{}}
 return {cases,active,activeId,setActiveId,remember,setRemember:changeRemember,error,setError,addCase,addExternal,replace,edit,mark,remove,importText,clear};
}
