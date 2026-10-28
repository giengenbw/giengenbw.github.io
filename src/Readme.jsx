import React,{useState,createElement as __localizedElement} from 'react';
import readme from './README.trilingual.md?raw';
import {LANGS} from './catalog.js';
export function ReadmePanel({ui}){
 const [lang,setLang]=useState(ui);
 const marker=`<!-- LANG:${lang} -->`,start=readme.indexOf(marker)+marker.length;
 const end=readme.indexOf('<!-- LANG:',start);
 const body=readme.slice(start,end<0?undefined:end).trim();
 const refs=readme.slice(readme.indexOf('## Official references'));
 return <div className="readme-panel"><h2>ZIEGLER LAB V9 · README</h2><div className="row">{LANGS.map(([value,label])=><button data-readme-lang={value} className={lang===value?'primary':''} key={value} onClick={()=>setLang(value)}>{label}</button>)}</div><pre data-testid="readme-content">{body+'\n\n'+refs}</pre></div>;
}
