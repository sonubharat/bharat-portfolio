'use client';
import {useEffect,useRef,useState} from 'react';
export default function LiveWallpaper({enabled=true,paused=false}:{enabled?:boolean;paused?:boolean}){const video=useRef<HTMLVideoElement>(null);const [reduced,setReduced]=useState(true);const [failed,setFailed]=useState(false);
useEffect(()=>{const m=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(m.matches);update();m.addEventListener('change',update);return()=>m.removeEventListener('change',update);},[]);
useEffect(()=>{const element=video.current;if(!element)return;const update=()=>{if(document.hidden||paused||reduced||!enabled)element.pause();else element.play().catch(()=>{});};update();document.addEventListener('visibilitychange',update);return()=>document.removeEventListener('visibilitychange',update);},[paused,reduced,enabled]);
if(!enabled)return null;return <div className="live-wallpaper" aria-hidden="true"><img src="/media/black-hole-poster.webp" alt=""/>{!reduced&&!failed&&<video ref={video} autoPlay muted loop playsInline preload="auto" poster="/media/black-hole-poster.webp" onError={()=>setFailed(true)}><source src="/media/black-hole-4k.mp4" type="video/mp4"/></video>}<div className="wallpaper-shade"/><div className={`wallpaper-glow ${paused||reduced?'wallpaper-paused':''}`}/></div>;
}
