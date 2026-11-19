'use client';
import {useState} from 'react';
import {profile} from '../lib/content';
export default function ContactComposer(){
 const [open,setOpen]=useState(false);const [subject,setSubject]=useState('A project idea');const [message,setMessage]=useState('');
 return <div className="contact-composer"><button className="compose-toggle" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?'Close message':'Start a conversation'} <span>{open?'−':'↗'}</span></button>{open&&<form onSubmit={e=>{e.preventDefault();window.location.href=`mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;}}><label htmlFor="contact-subject">What’s on your mind?</label><select id="contact-subject" value={subject} onChange={e=>setSubject(e.target.value)}><option>A project idea</option><option>A work opportunity</option><option>Let’s connect</option></select><label htmlFor="contact-message">Your message</label><textarea id="contact-message" value={message} onChange={e=>setMessage(e.target.value)} required minLength={10} placeholder="Tell me a little about your idea…" rows={4}/><div><p>Opens your email app with a draft. Nothing is sent automatically.</p><button type="submit">Open email draft ↗</button></div></form>}</div>;
}
