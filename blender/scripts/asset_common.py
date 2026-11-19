"""Original portfolio assets, authored procedurally with Blender 5.3."""
import bpy, math, random, sys, json
from mathutils import Vector
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
FINAL = '--final' in sys.argv
random.seed(42)

def material(name, color, metal=0, rough=.35, emission=0, transmission=0):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Metallic'].default_value=metal; p.inputs['Roughness'].default_value=rough
    p.inputs['Transmission Weight'].default_value=transmission
    p.inputs['Emission Color'].default_value=(*color,1); p.inputs['Emission Strength'].default_value=emission
    return m

def init():
    random.seed(42)
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
    global titanium, chrome, cyan, dark, glass, wood, white
    titanium=material('Brushed titanium',(.16,.21,.25),.88,.27)
    chrome=material('Polished aluminum',(.5,.58,.63),.95,.19)
    cyan=material('Cyan signal',(.015,.72,.84),.35,.25,2)
    dark=material('Anodized graphite',(.018,.027,.034),.65,.32)
    glass=material('Optical glass',(.13,.44,.48),.25,.12,0,.72)
    wood=material('Smoked oak',(.12,.065,.035),0,.65)
    white=material('Soft display white',(.55,.79,.82),.15,.3,.5)

def finish_mesh(o,name,mat):
    o.name=name; o.data.materials.append(mat)
    if o.type=='MESH':
        for p in o.data.polygons:p.use_smooth=True
    return o

def box(name,loc,scale,mat,bevel=.06):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        mod=o.modifiers.new('Precision machined edges','BEVEL');mod.width=bevel;mod.segments=3
        o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    return finish_mesh(o,name,mat)

def ball(name,loc,r,mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=12,radius=r,location=loc)
    return finish_mesh(bpy.context.object,name,mat)

def tube(name,points,rad,mat,cyclic=False):
    c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=1;c.bevel_depth=rad;c.bevel_resolution=3
    s=c.splines.new('POLY');s.points.add(len(points)-1)
    for p,co in zip(s.points,points):p.co=(*co,1)
    s.use_cyclic_u=cyclic;o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.data.materials.append(mat);return o

def ring(name,center,r,mat,rot=(0,0,0),minor=.035):
    bpy.ops.mesh.primitive_torus_add(major_segments=72,minor_segments=8,location=center,major_radius=r,minor_radius=minor,rotation=rot)
    return finish_mesh(bpy.context.object,name,mat)

def text(name,body,loc,size,mat,rot=(math.pi/2,0,0)):
    c=bpy.data.curves.new(name,'FONT');c.body=body;c.size=size;c.extrude=.001
    o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.location=loc;o.rotation_euler=rot;c.materials.append(mat);return o

def area(name,loc,power,color,size,target=(0,0,1)):
    d=bpy.data.lights.new(name,'AREA');d.energy=power;d.color=color;d.shape='DISK';d.size=size
    o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()

def hero():
    # Two interwoven, continuously twisting titanium ribbons with machined ribs.
    for layer in range(2):
        verts=[];faces=[];n=180
        for i in range(n):
            t=2*math.pi*i/n;tw=t*3+layer*math.pi
            center=Vector((1.48*math.cos(t),.63*math.sin(t),1.85+1.35*math.sin(t)))
            radial=Vector((math.cos(t),math.sin(t)*.5,math.sin(t))).normalized()
            side=Vector((0,1,0));offset=radial*math.cos(tw)*.28+side*math.sin(tw)*.28
            for w in [-1,1]:verts.append(center+offset+w*.23*(radial*math.sin(tw)-side*math.cos(tw)))
        for i in range(n):j=(i+1)%n;faces.append((2*i,2*j,2*j+1,2*i+1))
        m=bpy.data.meshes.new('Twisted ribbon');m.from_pydata(verts,[],faces);m.update()
        o=bpy.data.objects.new('Hero_Titanium_Ribbon_'+str(layer),m);bpy.context.collection.objects.link(o);finish_mesh(o,o.name,titanium)
        sol=o.modifiers.new('Solid metal shell','SOLIDIFY');sol.thickness=.075
        bev=o.modifiers.new('Edge polish','BEVEL');bev.width=.025;bev.segments=3
        tube('Illuminated ribbon seam '+str(layer),[verts[i*2] for i in range(n)],.012,cyan,True)
        for i in range(0,n,4):tube('Machined cross rib', [verts[2*i],verts[2*i+1]],.022,chrome)
    ring('Inner gyro', (0,0,1.85),.7,chrome,(math.pi/2,.45,.3),.055)
    ring('Inner signal', (0,0,1.85),.56,cyan,(.7,1,.3),.018)
    core=box('Compute core',(0,0,1.85),(.38,.38,.58),dark);core.rotation_euler=(.3,.4,.5)
    for z in range(6):box('Core channels',(0,-.205,1.65+z*.08),(.24,.025,.018),cyan,.005)

def dashboard(x,y,z,w=1.6,h=.95,name='Display'):
    box(name,(x,y,z),(w,.1,h),dark)
    box(name+'_Glass',(x,y-.058,z),(w-.08,.012,h-.08),glass,.015)
    for i in range(6):
        ht=.12+(.5+.5*math.sin(i*1.4))*(h*.48)
        box(name+'_AbstractChart',(x-w*.36+i*w*.12,y-.075,z-h*.32+ht/2),(w*.065,.015,ht),cyan,.008)
    tube(name+'_Trend',[(x-w*.36+i*w*.14,y-.09,z+h*.12+math.sin(i)*h*.17) for i in range(6)],.012,white)

def studio():
    box('Studio platform',(0,0,-.13),(6,4.8,.22),dark)
    box('Oak desktop',(0,0,1.05),(4,1.7,.12),wood)
    for x in [-1.7,1.7]:box('Aluminum desk leg',(x,.15,.48),(.1,1.25,1.05),chrome)
    dashboard(-.6,.49,1.9,1.6,1.05,'Monitor_Projects')
    dashboard(1.02,.51,1.86,1.35,.94,'Display_Research')
    for x in [-.6,1.02]:box('Monitor stand',(x,.5,1.38),(.075,.09,.55),chrome)
    box('Keyboard_Skills',(-.4,-.42,1.17),(1.25,.42,.075),dark)
    for row in range(4):
        for col in range(13):box('Keycap',(-.95+col*.09,-.57+row*.09,1.22),(.074,.07,.045),titanium,.01)
    mouse=ball('Mouse',(.52,-.4,1.2),.13,dark);mouse.scale=(.65,1.1,.4)
    box('Notebook_About',(-1.42,-.28,1.17),(.55,.68,.07),titanium)
    text('Notebook title','IDEAS',(-1.6,-.4,1.21),.08,white,(0,0,0))
    box('Computer hardware',(2.2,.4,.7),(.55,.9,1.4),dark)
    for z in [.35,.73,1.1]:ring('Cooling fan',(2.2,-.06,z),.16,cyan,(math.pi/2,0,0),.02)
    for x in [-2.6,-1.6,-.6,.4,1.4,2.4]:box('Acoustic architectural panel',(x,1.65,1.6),(.88,.12,3),titanium,.025)
    box('Wall_Achievements',(-2.2,1.5,2.15),(.7,.12,.9),chrome)
    text('Achievement heading','BEYOND\nCODE',(-2.48,1.42,2.32),.13,white)
    dashboard(.3,1.35,2.9,1.45,.5,'Technical_Terminal')
    for name,loc in [('Overview',(0,0,1.2)),('Projects',(-.6,.4,1.9)),('Skills',(-.4,-.4,1.2)),('About',(-1.4,-.3,1.2))]:
        o=bpy.data.objects.new('CameraTarget_'+name,None);bpy.context.collection.objects.link(o);o.location=loc
    tube('Ambient light',[(-2.9,1.4,.15),(2.9,1.4,.15)],.025,cyan)

def ai():
    nodes=[]
    for layer in range(4):
        for j in range(6):
            a=j*math.tau/6+layer*.4;loc=(math.cos(a)*(.55+layer*.16),-.7+layer*.5,1.5+math.sin(a)*(.55+layer*.16));nodes.append(loc)
            ball('Latent feature node',loc,.07,cyan if j%3==0 else chrome)
    for k,p in enumerate(nodes[:-6]):
        for offset in [0,1]:tube('Feature connection',[p,nodes[(k+6+offset)%len(nodes)]],.009,titanium)
    for i in range(3):
        x=(i-1)*1.65;y=-.65+abs(i-1)*.3
        box('Input_View_'+str(i),(x,y,2.8),(.85,.055,.65),glass)
        for j in range(3):ring('Abstract input motif',(x,y-.04,2.8),.12+j*.07,cyan,(math.pi/2,0,0),.008)
        tube('Input projection',[(x,y,2.45),(x*.3,0,1.8)],.01,cyan)
    ring('Latent orbit',(0,0,1.5),1.25,chrome,(.35,.3,0),.025)
    box('Neural pedestal',(0,0,.2),(2.8,2,.18),dark)

def jobnest():
    box('Analytics desk',(0,0,.8),(3.7,1.7,.13),wood)
    for x in [-1.5,1.5]:box('Desk supports',(x,.15,.36),(.1,1.2,.8),chrome)
    dashboard(-.65,.3,1.65,1.6,1,'JobNest_Analytics')
    dashboard(1.05,.5,2.2,1.1,.85,'JobNest_Benchmarking')
    box('Laptop keyboard',(-.65,-.4,.91),(1.5,.65,.06),dark)
    for i in range(8):tube('Keyboard rows',[(-1.25+i*.16,-.65,.95),(-1.25+i*.16,-.2,.95)],.012,chrome)
    points=[(1+math.cos(i*math.tau/6)*.55,-.35,1.35+math.sin(i*math.tau/6)*.4) for i in range(6)]
    for i,p in enumerate(points):ball('Feature_'+['Skill_Gap','Benchmark','Authentication','Database','REST_API','Dashboard'][i],p,.08,cyan);tube('Candidate connection',[(1,-.35,1.35),p],.012,chrome)
    ball('Candidate hub',(1,-.35,1.35),.14,chrome)

def covid():
    ball('Research_Glass_Globe',(0,0,1.55),1.12,glass)
    for lat in [-.75,-.4,0,.4,.75]:
        r=math.sqrt(1.14**2-lat**2);ring('Latitude',(0,0,1.55+lat),r,chrome,minor=.009)
    for a in range(0,180,30):ring('Longitude',(0,0,1.55),1.14,chrome,(math.pi/2,0,math.radians(a)),.009)
    for i in range(50):
        a=random.uniform(0,math.tau);u=random.uniform(-.9,.9);r=math.sqrt(1-u*u)
        ball('Abstract geographic marker',(1.15*r*math.cos(a),1.15*r*math.sin(a),1.55+1.15*u),.022,cyan)
    for i in range(3):ring('Information layer',(0,0,1.55),1.4+i*.22,cyan if i==1 else titanium,(.2+i*.15,.3,0),.015)
    box('Research plinth',(0,0,.13),(2.5,2.5,.2),dark)

def export(name,poster,camera=(5,-8,5),target=(0,0,1.5)):
    models=ROOT/'public/models';images=ROOT/'public/images';scenes=ROOT/'blender/scenes'
    for d in [models,images,scenes]:d.mkdir(parents=True,exist_ok=True)
    bpy.ops.object.select_all(action='DESELECT')
    for o in bpy.context.scene.objects:o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(models/(name+'.glb')),export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False)
    box('Render_only_floor',(0,0,-.29),(200,200,.1),material('Studio ground',(.012,.018,.023),.15,.45),0)
    area('Key',(1,-4,7),1500,(.75,.85,1),5,target)
    area('Cyan rim',(-4,1,4),1800,(.1,.8,1),4,target)
    area('Warm rim',(4,3,5),1900,(1,.78,.54),3,target)
    area('Front softbox',(0,-5,2),500,(.7,.85,1),4,target)
    scene=bpy.context.scene;scene.world.color=(.08,.08,.08)
    bpy.ops.object.camera_add(location=camera);cam=bpy.context.object;cam.name='Camera_Poster';cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=6.9;scene.camera=cam
    cam.data.dof.use_dof=True;cam.data.dof.focus_distance=(cam.location-Vector(target)).length;cam.data.dof.aperture_fstop=8
    scene.render.engine='CYCLES';scene.cycles.samples=64 if FINAL else 24;scene.cycles.use_denoising=True
    multiplier=2 if FINAL else 1
    scene.render.resolution_x=960*multiplier;scene.render.resolution_y=640*multiplier;scene.render.resolution_percentage=100
    if name=='hero-sculpture':scene.render.resolution_x=1280*multiplier;scene.render.resolution_y=720*multiplier;cam.data.ortho_scale=8
    if name=='developer-studio':cam.data.ortho_scale=8.7
    scene.render.image_settings.file_format='WEBP';scene.render.image_settings.quality=90
    scene.render.filepath=str(images/(poster+'.webp'));scene.view_settings.view_transform='AgX'
    bpy.ops.wm.save_as_mainfile(filepath=str(scenes/(name+'.blend')))
    bpy.ops.render.render(write_still=True)
    if name=='hero-sculpture':
        scene.render.resolution_x=540*multiplier;scene.render.resolution_y=675*multiplier;cam.data.ortho_scale=4.7
        scene.render.filepath=str(images/'hero-poster-mobile.webp');bpy.ops.render.render(write_still=True)
    for p in [models/(name+'.glb'),scenes/(name+'.blend'),images/(poster+'.webp')]:
        assert p.exists() and p.stat().st_size>100, f'Missing asset: {p}'
    print('ASSET_COMPLETE',name,flush=True)

def run(kind):
    init()
    functions={'hero':hero,'studio':studio,'ai_research':ai,'jobnest':jobnest,'covid_research':covid}
    names={'hero':('hero-sculpture','hero-poster'),'studio':('developer-studio','studio-poster'),'ai_research':('ai-research','ai-research'),'jobnest':('jobnest','jobnest'),'covid_research':('covid-research','covid-research')}
    functions[kind]()
    camera=(5,-8,4.2) if kind!='studio' else (6,-8,5.2)
    export(*names[kind],camera=camera,target=(0,0,1.85) if kind=='hero' else (0,0,1.5))
