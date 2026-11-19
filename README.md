# Bharat Sharma — Creative technology portfolio

### Latest customization

The current shell has macOS-inspired traffic-light controls, a floating centered dock, minimize-to-dock and restore animations, and animated maximize/restore. The desktop starts empty after the entrance; visitors choose which apps to open. Workvex has its own co-founder card and a direct `https://workvex.com` link. Current location: Hyderabad, Telangana, India. Current roles: Full Stack Developer, Creative Designer, Gen AI.

The local résumé is `public/files/Bharat-Sharma-Resume.pdf`, prepared from the supplied PDF with its header updated to Hyderabad and its phone number removed, honoring the earlier privacy setting. The user's source file is unchanged. The entrance reads Think Infinity ∞ and uses a browser port of the requested texture-warp tunnel, followed by the retained flash. See third-party notices for the tunnel's license.

## Current interface

The page starts on a live lock screen. Select **Enter Bharat's world** for the original 2.3-second canvas tunnel transition into the desktop. Reduced-motion users enter immediately. A Skip animation control is available during the transition. Settings provides pause/resume motion and still wallpapers. The current live wallpaper is the user-supplied **Mesmerizing Black Hole 4K** MP4, served locally without transcoding at 3840×2160. It loops silently, pauses in hidden tabs, and defaults to an extracted poster under reduced motion. Source: `public/media/black-hole-4k.mp4`. The NASA footage remains an earlier saved asset and is not the active wallpaper.

### Python arcade

Open Arcade from the dock or desktop, or run `games` in Terminal. It includes Hangman, minimax Tic Tac Toe (or local two-player mode), and Memory Match with a best score saved on the device. Python rules execute through locally hosted Pyodide in a Web Worker. No Python server, remote game API, or account is needed. The runtime loads only when the first game is selected (~14 MB uncompressed), so the initial portfolio does not load it. First launch can take several seconds. Minimized apps retain their state; closing Arcade ends its worker. Pure Python behavior checks: `python scripts/check_arcade.py`.

The live page is an Ubuntu-style desktop adapted from Vivek Patel's MIT-licensed portfolio. See `THIRD_PARTY_NOTICES.md` and `licenses/ubuntu-portfolio-MIT.txt`. The earlier 3D and editorial implementations remain as local source history but are not mounted by `app/page.tsx`.

Open apps using the dock or desktop shortcuts. Drag windows by their title bars, use their minimize/maximize/close buttons, search apps via Activities, or change the wallpaper in Settings. On phones, apps fill the workspace above the bottom dock. The terminal supports `help`, `whoami`, `projects`, `skills`, `experience`, `education`, `contact`, `open <app>`, `ls`, `date`, `hello`, and `clear`. It executes only portfolio commands; it is not an operating-system shell.

Delivery preference: **local only**. Do not upload or publish this project unless explicitly requested. The hosting manifest records an earlier unpublished registration; it is not authorization to deploy.

A six-act Next.js portfolio using verified resume content, original Blender assets, React Three Fiber, Three.js, GSAP, and a small custom shader. All artwork is conceptual; it does not represent product screenshots or measured epidemiological results.

## Run

```powershell
npm install
npm run dev
```

Visit http://127.0.0.1:3000. `npm run build` creates the static deployment in `out/`; `npm run typecheck` validates TypeScript. Serve `out/` with any static web server; `next start` is not used for static exports.

## Content and privacy

Edit `lib/content.ts`. Set `profile.showEmail` or `profile.showLocation` to `false` and rebuild to hide those contact details in the interface. To remove the values from shipped client code too, clear their fields. No phone number is included. The resume URL is the original Google Drive document; no unverified repository or live-demo links are invented.

## Interaction

- Desktop hero follows the cursor and scroll with subtle shader deformation.
- Studio meshes and the keyboard-accessible area buttons reveal content. Camera movements follow area selection.
- Project tabs switch among rotatable scenes and selectable technical explanations. Each project opens a native keyboard-accessible case-study dialog.
- A contact composer opens an email draft after local validation; it never sends messages itself.
- Small screens and reduced-motion preferences default to Blender-rendered stills; visitors can opt into 3D. Reduced motion suppresses automatic model movement and CSS/GSAP animation.
- WebGL load errors retain the poster. Scenes mount near the viewport and unmount away from it; pixel ratio adapts downward under load.

## Assets

See `blender/README.md` for regeneration. Editable sources remain in `blender/scenes/`, outside the public assets. Only browser GLBs and WebP posters are deployed. Models use compact, texture-free PBR materials; they do not need texture downloads or decoders.

## Verification

Production build and TypeScript; structural GLB validation; browser-loaded hero, studio and all project GLBs; desktop and 390px phone visual checks; navigation, dialog open/close, feature disclosures, and mobile poster fallback. Browser console inspected for errors. Broad hardware performance benchmarking and a formal accessibility audit have not been performed.
