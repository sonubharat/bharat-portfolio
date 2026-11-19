"""Extract a poster from the user-supplied video using Blender's sequencer."""
import bpy
from pathlib import Path
root=Path(__file__).resolve().parents[1]
video=root/'public/media/black-hole-4k.mp4'
scene=bpy.context.scene
scene.sequence_editor_create()
strip=scene.sequence_editor.strips.new_movie('Black hole wallpaper',str(video),channel=1,frame_start=1)
scene.frame_set(10)
scene.render.resolution_x=1920
scene.render.resolution_y=1080
scene.render.resolution_percentage=100
scene.render.image_settings.file_format='WEBP'
scene.render.image_settings.quality=90
scene.render.filepath=str(root/'public/media/black-hole-poster.webp')
scene.render.use_sequencer=True
scene.view_settings.view_transform='Standard'
bpy.ops.render.render(write_still=True)
print('POSTER_CREATED',scene.render.filepath,flush=True)
