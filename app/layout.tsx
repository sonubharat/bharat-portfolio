import type { Metadata } from 'next';
import './desktop.css';
import './playful-workspace.css';
import './macos-workspace.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://bharat-sharma-creative-portfolio.proudcroissant4.chatgpt.site'),
  title: 'Bharat’s Workspace — Interactive Developer Portfolio',
  description: 'Bharat Sharma — Full Stack Developer, Creative Designer, Gen AI enthusiast, and co-founder of Workvex. Based in Hyderabad, Telangana, India.',
  openGraph: { title: 'Bharat’s Workspace — Interactive Developer Portfolio', description: 'Explore Bharat Sharma’s projects, skills, and journey in an interactive desktop.' },
};
export default function Layout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
