# Original Blender assets

All five scenes are authored using bpy, with original geometry and material compositions. Blender 5.3.0 was used. No downloaded models, fabricated screenshots, or epidemiological values are included. Dashboard charts and geographic markers are abstract visual motifs, not project screenshots or research results.

## Rebuild

From the project root on Windows:

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.3\blender.exe' --background --threads 8 --python blender/scripts/export_assets.py -- --final
```

Individual scripts `create_hero.py`, `create_studio.py`, `create_ai_research.py`, `create_jobnest.py`, and `create_covid_research.py` rebuild one scene. Shared geometry, materials, lights, camera and export configuration live in `asset_common.py`.

Sources are in `blender/scenes/`, never in the public directory. Models are exported before adding the offline floor, lights and camera. glTF exports apply bevel and solidify modifiers. Geometry is deliberately economical: low-segment spheres, 8-sided torus profiles and no external textures. This avoids texture payloads while retaining physically based metallic, roughness and transmission materials.

## Current render quality

The approved final quality uses Cycles CPU, 64 samples, denoising, AgX, area lights and camera depth of field. Pass `-- --final` after the Python script to render hero desktop at 2560 × 1440, hero mobile at 1080 × 1350, and studio/project posters at 1920 × 1280. Editable scene files save the final desktop resolution and sample settings before rendering. Omitting the flag produces review renders at 24 samples and half these dimensions. Blender backups and Python caches are ignored; automatic backup creation is disabled by the pipeline.

## Runtime integration

glTF uses Y-up; the main viewing side is +Z. A camera near `[6,4,8]` works. Normalize by bounding box and preserve aspect ratio. Studio exports include `Monitor_Projects`, `Keyboard_Skills`, `Notebook_About`, `Wall_Achievements`, `Display_Research`, and the four `CameraTarget_*` empties. Bind named objects to click handlers; provide corresponding accessible HTML controls.

Render-only floor is not in GLB. Each GLB is self-contained, with no external textures. Three.js GLTFLoader supports its materials. Browser loading, interaction, reduced-motion and mobile verification are performed by the application owner, separately from Blender export validation.
