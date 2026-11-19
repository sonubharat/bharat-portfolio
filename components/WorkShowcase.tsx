'use client';
import {useState} from 'react';
import dynamic from 'next/dynamic';
import {projects} from '../lib/content';
const Scene = dynamic(()=>import('./Scene'),{ssr:false});
const shortNames=['Generative synthesis','JobNest','Global health research'];
const steps=[
  [{title:'Multi-angle inputs',body:'The framework conditions image synthesis on examples from different viewpoints.'},{title:'Spatial features',body:'Data preprocessing and spatial feature extraction prepare the inputs for the neural framework.'},{title:'Latent alignment',body:'Embedding alignment supports convergence and consistency across perspectives.'}],
  [{title:'Secure access',body:'JWT authentication supports access to the platform through modular REST APIs.'},{title:'Talent intelligence',body:'Skill-gap analysis and career benchmarking help candidates understand their next steps.'},{title:'Analytical views',body:'Interactive dashboards bring platform data into a visual interface, backed by normalized database schemas.'}],
  [{title:'Time-series data',body:'Multinational epidemiological datasets form the foundation of the analysis.'},{title:'Statistical models',body:'Regression and correlation modeling examine infection trajectories, fatality trends, and demographic relationships.'},{title:'Visual communication',body:'Tableau visualizations communicate the research. No unsupported statistics are presented here.'}]
];
export default function WorkShowcase({onOpen}:{onOpen:(project:typeof projects[number])=>void}) {
 const [selected,setSelected]=useState(0); const [step,setStep]=useState(0); const p=projects[selected];
 return <div className="work-showcase">
   <div className="project-tabs" role="tablist" aria-label="Selected projects">{projects.map((item,i)=><button role="tab" aria-selected={selected===i} aria-controls="project-stage" id={`project-tab-${i}`} key={item.id} onClick={()=>{setSelected(i);setStep(0);}} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const next=(i+(e.key==='ArrowRight'?1:2))%3;setSelected(next);setStep(0);document.getElementById(`project-tab-${next}`)?.focus();}}}><span>{item.number}</span>{shortNames[i]}<b>↗</b></button>)}</div>
   <div id="project-stage" role="tabpanel" aria-labelledby={`project-tab-${selected}`} className={`project-stage stage-${selected}`} key={p.id}>
     <div className="stage-copy"><span className="eyebrow">{p.category}</span><h3>{selected===0?<>New views.<br/><em>New possibilities.</em></>:selected===1?<>Talent, with<br/><em>perspective.</em></>:<>A world of data.<br/><em>A clearer picture.</em></>}</h3><p>{p.description}</p><div className="tags">{p.tech.map(t=><span key={t}>{t}</span>)}</div><button className="solid-link" onClick={()=>onOpen(p)}>Inside the project <span>↗</span></button><span className="stage-footnote">{p.name}</span></div>
     <div className="stage-art"><Scene name={p.id} poster={p.id} interactive/><div className="stage-coordinate"><span>0{selected+1} / EXPLORE THE IDEA</span><span>DRAG TO ROTATE ↔</span></div><span className="stage-watermark" aria-hidden="true">{selected===0?'AI':selected===1?'JN':'DATA'}</span></div>
   </div>
   <div className="system-map"><div className="system-map-heading"><span className="eyebrow">UNDER THE SURFACE</span><p>{selected===0?'From examples to synthesis.':selected===1?'From access to insight.':'From observations to understanding.'}</p></div><div className="system-steps" aria-label="Project focus areas">{steps[selected].map((s,i)=><button aria-pressed={step===i} className={step===i?'active':''} key={s.title} onClick={()=>setStep(i)}><span className="step-number">0{i+1}</span><span>{s.title}</span><b>{step===i?'−':'+'}</b></button>)}</div><p className="system-description" aria-live="polite">{steps[selected][step].body}</p></div>
 </div>;
}
