'use client';
export default function ErrorPage({retry}:{retry:()=>void}){return <main className="safe-error"><h1>Let’s try that again.</h1><p>The workspace could not load. Please retry or return home.</p><button onClick={()=>retry()}>Try again</button><a href="/">Return to workspace</a></main>;}
