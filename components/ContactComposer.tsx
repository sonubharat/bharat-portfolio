'use client';
import {useState} from 'react';
import {profile} from '../lib/content';
export default function ContactComposer(){
 const subjects=['A project idea','A work opportunity','Let’s connect'];
 const [error,setError]=useState('');
 const [open,setOpen]=useState(false);const [subject,setSubject]=useState('A project idea');const [message,setMessage]=useState('');
 return <div className="contact-composer"><button className="compose-toggle" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?'Close message':'Start a conversation'} <span>{open?'−':'↗'}</span></button>{open&&<form onSubmit={e=>{e.preventDefault();if(!subjects.includes(subject)||message.trim().length<10||message.length>2000||/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(message)){setError('Please write a message between 10 and 2,000 characters.');return;}setError('');window.location.href=`mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;}}><label htmlFor="contact-subject">What’s on your mind?</label><select id="contact-subject" value={subject} onChange={e=>setSubject(e.target.value)}><option>A project idea</option><option>A work opportunity</option><option>Let’s connect</option></select><label htmlFor="contact-message">Your message</label><textarea id="contact-message" value={message} onChange={e=>setMessage(e.target.value)} required minLength={10} maxLength={2000} aria-describedby="contact-validation" placeholder="Tell me a little about your idea…" rows={4}/><p id="contact-validation" role="status">{error||`${message.length}/2,000 characters`}</p><div><p>Opens your email app with a draft. Nothing is sent automatically.</p><button type="submit">Open email draft ↗</button></div></form>}</div>;
}
