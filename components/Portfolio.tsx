'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { profile, projects, skills } from '../lib/content';
import WorkShowcase from './WorkShowcase';
import ContactComposer from './ContactComposer';
import ImmersiveJourney from './ImmersiveJourney';

const Scene = dynamic(() => import('./Scene'), {ssr:false});
type Project = typeof projects[number];
export default function Portfolio() {
  const [menu, setMenu] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [studioTopic, setStudioTopic] = useState('Overview');
  const [copied, setCopied] = useState(false);
  const root = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.hero-line span', {yPercent:110, opacity:0, duration:1.2, stagger:.14, ease:'power3.out'});
      gsap.utils.toArray<HTMLElement>('.reveal').forEach(el => gsap.from(el, {y:35, opacity:0, duration:.85, ease:'power2.out', scrollTrigger:{trigger:el,start:'top 92%',once:true}}));
      gsap.to('.hero-title', {y:90, opacity:.35, ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
    }, root);
    return () => mm.revert();
  }, []);
  useEffect(() => {if(project) { previousFocus.current=document.activeElement as HTMLElement; dialog.current?.showModal(); } else if(dialog.current?.open) dialog.current.close();}, [project]);
  useEffect(() => {if(!project)return; const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;};},[project]);
  const close = () => {setProject(null); previousFocus.current?.focus();};
  const studioSelect = (name: string) => {
    const target = name.includes('Projects') ? 'Projects' : name.includes('Skills') ? 'Skills' : name.includes('Achievements') ? 'Beyond code' : name.includes('Research') ? 'Research' : 'About';
    setStudioTopic(target);
  };
  return <main ref={root}>
    <a className="skip-link" href="#work">Skip to projects</a>
    <header className="header"><a href="#home" className="wordmark" aria-label="Bharat Sharma home">b<span>·</span>s<span className="brand-dot">/</span></a><nav aria-label="Main navigation" className={menu?'nav open':'nav'}><a href="#work" onClick={() => setMenu(false)}>Selected work <span>03</span></a><a href="#about" onClick={() => setMenu(false)}>About me</a><a href="#contact" className="nav-contact" onClick={() => setMenu(false)}>Let’s talk <span>↗</span></a></nav><button className="menu-toggle" aria-expanded={menu} aria-label="Toggle navigation" onClick={() => setMenu(!menu)}>{menu?'Close −':'Menu +'}</button></header>
    <section id="home" className="hero">
      <div className="hero-topline"><span><i className="status-dot" /> FULL STACK DEVELOPER & AI EXPLORER</span><span className="edition">PORTFOLIO — VOL. 01 / 2026</span></div>
      <div className="hero-art"><Scene hero /></div>
      <div className="hero-title"><p className="eyebrow hero-intro">DEVELOPER. EXPLORER. MAKER.</p><h1><span className="hero-line"><span>Bharat</span></span><span className="hero-line"><span><em>Sharma.</em></span></span></h1><p className="hero-copy">I turn complex ideas into thoughtful digital experiences.<br/> Full stack development. AI. Data.</p><a href="#work" className="pill">Discover my work <span>↗</span></a></div>
      <div className="art-caption"><span className="cross">+</span><span>FORM / 001<br/><b>ENGINEERED CURIOSITY</b></span><span className="caption-line" /></div>
      <div className="hero-bottom"><a href="#world"><span className="scroll-icon">↓</span> SCROLL TO DISCOVER</a><span>LOGIC IN THE DETAILS. IMAGINATION IN THE BIG PICTURE.</span><span>01 — 06</span></div>
    </section>
    <ImmersiveJourney/>
    <section className="world section" id="world">
      <div className="section-top reveal"><span className="eyebrow">02 / MY WORLD</span><span className="eyebrow muted">A SPACE FOR IDEAS TO TAKE SHAPE</span></div>
      <div className="world-heading reveal"><h2>Where curiosity<br/><em>gets to work.</em></h2><p>I build at the intersection of web development, artificial intelligence, and visual thinking. Explore the desk to discover the work, skills, and ideas behind it.</p></div>
      <div className="studio-frame"><Scene name="developer-studio" poster="studio-poster" interactive focus={studioTopic} onSelect={studioSelect}/><div className="studio-label"><span className="status-dot"/> THE DEVELOPER STUDIO <span>DRAG TO EXPLORE</span></div></div>
      <div className="studio-navigation" aria-label="Studio areas">{['Overview','Projects','Skills','About','Beyond code','Research'].map((topic,i) => <button key={topic} aria-pressed={studioTopic===topic} className={studioTopic===topic?'active':''} onClick={() => setStudioTopic(topic)}><span>0{i+1}</span>{topic}<span>↗</span></button>)}</div>
      <div className="studio-detail" aria-live="polite"><span className="eyebrow">{studioTopic}</span><p>{studioTopic==='Overview'?'A creative interpretation of my workspace. Select an object in the scene, or use the controls above.':studioTopic==='Projects'?'From generative image synthesis to career analytics — explore three projects built around different kinds of questions.':studioTopic==='Skills'?'Python, JavaScript, SQL, visual design, and a hands-on approach to learning new systems.':studioTopic==='About'?'Computer Science Engineering at Manav Rachna University, with a Cloud & Full Stack specialization.':studioTopic==='Research'?'Exploring multi-perspective image synthesis and multinational epidemiological time-series data.':'Creative leadership, community volunteering, and learning beyond the screen.'}</p><a href={studioTopic==='Skills'?'#skills':studioTopic==='About'?'#about':studioTopic==='Beyond code'?'#beyond':'#work'}>Take a closer look ↗</a></div>
    </section>
    <section className="work section" id="work"><div className="section-top reveal"><span className="eyebrow">03 / SELECTED WORK</span><span className="eyebrow muted">EXPERIMENTS WITH PURPOSE</span></div><div className="work-heading reveal"><h2>Different questions.<br/><em>Thoughtful solutions.</em></h2><p>A selection of work across<br/>intelligent systems, web, and data.</p></div>
      <WorkShowcase onOpen={setProject}/>
    </section>
    <section id="about" className="journey section"><div className="section-top reveal"><span className="eyebrow">04 / MY JOURNEY</span><span className="eyebrow muted">ALWAYS A WORK IN PROGRESS</span></div><div className="journey-grid"><div className="journey-intro reveal"><h2>Built on curiosity.<br/><em>Shaped by doing.</em></h2><p>I’m Bharat Bhushan Nath Sharma, a full stack developer and AI & data enthusiast. My work brings together structured engineering, an eye for design, and an interest in how intelligent systems learn.</p><a className="text-link" href={profile.resume} target="_blank" rel="noreferrer">View résumé <span>↗</span></a></div><div className="timeline">
      <Timeline date="2025" type="EXPERIENCE" title="Full Stack Developer Intern" place="Xebia · Gurugram, India" body="Coordinated web application architecture and stakeholder requirements for recruitment workflows. Implemented structured workflows and data strategies, collaborating across teams on modular components and frontend responsiveness."/>
      <Timeline date="2024" type="EXPERIENCE" title="Full Stack Developer Intern" place="Mahadev Moulds · Faridabad, India" body="Designed and deployed an interactive chatbot connecting manufacturers and commercial buyers. Applied testing methodologies to support reliable deployment and operational efficiency."/>
      <Timeline date="2022 — 2026" type="EDUCATION" title="B.Tech, Computer Science Engineering" place="Manav Rachna University · Faridabad" body="Cloud & Full Stack specialization."/>
      <Timeline date="2020 — 2022" type="EDUCATION" title="Higher Secondary Certificate" place="SASI Junior College · Andhra Pradesh" body="Science."/>
    </div></div>
    <div className="skills" id="skills"><div className="skills-title reveal"><span className="eyebrow">THE TOOLKIT</span><h3>Different tools.<br/>One curious mind.</h3></div>{skills.map(group=><div className="skill-group reveal" key={group.title}><h4>{group.title}</h4><div className="tags">{group.items.map(s=><span key={s}>{s}</span>)}</div></div>)}</div></section>
    <section id="beyond" className="beyond section"><div className="section-top reveal"><span className="eyebrow">05 / BEYOND CODE</span><span className="eyebrow muted">MORE THAN WHAT’S ON THE SCREEN</span></div><h2 className="reveal">A little design.<br/>A little community.<br/><em>A lot of possibility.</em></h2><div className="beyond-grid"><article className="reveal"><span className="beyond-symbol">✳</span><p className="eyebrow">CREATIVE LEADERSHIP</p><h3>Lead Designer</h3><p>Dr. OP Bhalla Foundation</p><p>Directed creative work and visual presentations.</p><span className="recognition">Letter of Appreciation</span></article><article className="reveal"><span className="beyond-symbol">↗</span><p className="eyebrow">COMMUNITY</p><h3>Showing up matters.</h3><p>Wheel Chair Cricket Association</p><p>Supported community alignment and event coordination as a volunteer.</p><span className="recognition">Shield of Appreciation</span></article><article className="reveal"><span className="beyond-symbol">⊹</span><p className="eyebrow">CONTINUOUS LEARNING</p><h3>Never done learning.</h3><ul><li>NPTEL-Swayam</li><li>LinkedIn Professional Skills</li><li>MongoDB Certification</li></ul><p className="language-list">English · Hindi · Odia · Telugu · German</p></article></div></section>
    <section id="contact" className="contact section"><div className="particle-field" aria-hidden="true">{Array.from({length:32},(_,i)=><i key={i} style={{left:`${(i*37)%100}%`,top:`${(i*19)%100}%`,animationDelay:`-${i*.7}s`}}/>)}</div><div className="section-top"><span className="eyebrow">06 / LET’S CONNECT</span><span className="eyebrow muted">THE NEXT IDEA STARTS WITH A HELLO</span></div><div className="contact-content reveal"><p>Have an idea in mind?</p><h2>Let’s make<br/><em>something matter.</em></h2>{profile.showEmail && <div className="email-row"><a href={`mailto:${profile.email}`}>{profile.email}<span>↗</span></a><button aria-label="Copy email address" onClick={async()=>{try{await navigator.clipboard.writeText(profile.email);setCopied(true);setTimeout(()=>setCopied(false),2500);}catch{setCopied(false);}}}>{copied?'Copied ✓':'Copy'}</button><span role="status" className="sr-only">{copied?'Email address copied':''}</span></div>}{profile.showEmail && <ContactComposer/>}<div className="socials"><a href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a><a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a><a href={profile.resume} target="_blank" rel="noreferrer">Résumé ↗</a></div></div><footer><span>© {new Date().getFullYear()} BHARAT SHARMA</span>{profile.showLocation&&<span>{profile.location.toUpperCase()}</span>}<a href="#home">BACK TO TOP ↑</a></footer></section>
    <dialog aria-labelledby="case-title" ref={dialog} onCancel={close} onClose={close} onClick={e=>{if(e.target===dialog.current)close();}} className="case-dialog"><div className="case-inner">{project&&<><div className="case-top"><span className="eyebrow">CASE STUDY / {project.number}</span><button autoFocus onClick={close} aria-label="Close case study">Close ×</button></div><p className="eyebrow">{project.category}</p><h2 id="case-title">{project.name}</h2><p className="case-subtitle">{project.subtitle}</p><div className="case-art"><Scene key={project.id} name={project.id} poster={project.id} interactive/></div><p className="art-disclaimer">Original conceptual artwork — not a product screenshot or a visualization of measured research results. Drag to change perspective.</p><div className="case-content"><div><h3>The project</h3><p>{project.description}</p><h3>What I built</h3><ul>{project.details.map(d=><li key={d}>{d}</li>)}</ul></div><aside><h3>Technologies</h3><div className="tags">{project.tech.map(t=><span key={t}>{t}</span>)}</div><h3>Explore the focus areas</h3>{project.topics.map((t,i)=><details key={t}><summary>{t}</summary><p>{project.id==='jobnest'?['Identify candidate skill gaps.','Support career benchmarking.','Authenticate access using JSON Web Tokens.'][i]:project.id==='ai-research'?['Condition image synthesis on multiple input viewpoints.','Extract spatial features from preprocessed inputs.','Align embeddings for multi-perspective consistency.'][i]:['Study changes in infections over time.','Analyze fatality trends in multinational datasets.','Examine demographic correlations with statistical models.'][i]}</p></details>)}</aside></div></>}</div></dialog>
  </main>;
}
function Timeline({date,type,title,place,body}: {date:string;type:string;title:string;place:string;body:string}) {return <article className="timeline-item reveal"><div className="timeline-date">{date}<span>{type}</span></div><h3>{title}</h3><h4>{place}</h4><p>{body}</p></article>;}

