'use client';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState, Component } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Environment, OrbitControls, PerformanceMonitor, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

class SceneBoundary extends Component<{children: React.ReactNode, onError: () => void}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError() { return {failed: true}; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}
function Model({name, interactive, onSelect, onHover, reduced}: {name: string; interactive?: boolean; onSelect?: (name: string) => void; onHover: (name:string)=>void; reduced: boolean}) {
  const { scene } = useGLTF(`/models/${name}.glb`);
  const group = useRef<THREE.Group>(null);
  const time = useMemo(() => ({value: 0}), []);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    if(name === 'hero-sculpture') clone.traverse(object => {
      if(object instanceof THREE.Mesh) {
        const material = object.material.clone();
        material.onBeforeCompile = (shader: {uniforms: Record<string, unknown>; vertexShader: string}) => {
          shader.uniforms.uTime = time;
          shader.vertexShader = 'uniform float uTime;\n' + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n transformed += normal * sin(position.y * 3.0 + uTime * 0.6) * 0.012;');
        };
        object.material = material;
      }
    });
    const box = new THREE.Box3().setFromObject(clone);
    const scale = 5.5 / Math.max(...box.getSize(new THREE.Vector3()).toArray());
    clone.position.sub(box.getCenter(new THREE.Vector3()));
    const root = new THREE.Group(); root.add(clone); root.scale.setScalar(scale);
    return root;
  }, [scene, name, time]);
  useEffect(() => () => { if(name==='hero-sculpture') model.traverse(object => {if(object instanceof THREE.Mesh) object.material.dispose();}); }, [model,name]);
  useFrame(({pointer, clock}, delta) => {
    time.value = reduced ? 0 : clock.elapsedTime;
    if (!group.current || reduced || interactive) return;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointer.x * .32 + Math.sin(clock.elapsedTime * .16) * .14, 3, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -pointer.y * .12, 3, delta);
    group.current.position.y = Math.sin(clock.elapsedTime * .6) * .055;
  });
  const click = (e: ThreeEvent<MouseEvent>) => { if (!onSelect) return; e.stopPropagation(); let object: THREE.Object3D | null = e.object; while (object) { if (/Monitor_Projects|Keyboard_Skills|Notebook_About|Wall_Achievements|Display_Research/.test(object.name)) { onSelect(object.name); break; } object = object.parent; } };
  return <group ref={group}><primitive object={model} onClick={click} onPointerOver={(e: ThreeEvent<PointerEvent>) => { const label=e.object.name; if(/Feature_|Monitor_|Keyboard_|Notebook_|Wall_|Display_/.test(label)){e.stopPropagation();onHover(label.replace(/_/g,' '));}}} onPointerOut={() => onHover('')} /></group>;
}
function Atmosphere({reduced}: {reduced: boolean}) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({time: {value: 0}}), []);
  useFrame(({clock}) => { if (material.current && !reduced) material.current.uniforms.time.value = clock.elapsedTime; });
  return <mesh position={[0, 0, -4]}><planeGeometry args={[22, 15]} /><shaderMaterial ref={material} transparent depthWrite={false} uniforms={uniforms} vertexShader={'varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }'} fragmentShader={'varying vec2 vUv; uniform float time; void main(){vec2 p=vUv-.5; float halo=exp(-length(p*vec2(1.,1.4))*7.); float wave=.8+.2*sin(p.x*20.+time*.3); gl_FragColor=vec4(.10,.55,.63,halo*.18*wave); }'} /></mesh>;
}
function CameraMotion({reduced}: {reduced: boolean}) {
  useFrame(({camera}, dt) => { if(reduced) return; const progress = Math.min(window.scrollY / Math.max(window.innerHeight,1),1); camera.position.y=THREE.MathUtils.damp(camera.position.y, 2.7 + progress*1.2, 3, dt); camera.lookAt(0,0,0); });
  return null;
}
export default function Scene({name = 'hero-sculpture', poster = 'hero-poster', interactive = false, onSelect, hero = false, focus = 'Overview'}: {name?: string; poster?: string; interactive?: boolean; onSelect?: (name: string) => void; hero?: boolean; focus?: string}) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [ready, setReady] = useState(false);
  const [dpr, setDpr] = useState(1.5);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState('');
  const onReady = useCallback(() => setReady(true), []);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const smallScreen = matchMedia('(max-width: 820px)');
    const update = () => {setReduced(media.matches); setEnabled(!media.matches && !smallScreen.matches);}; update(); media.addEventListener('change',update);smallScreen.addEventListener('change',update);
    const observer = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), {rootMargin:'150px'});
    if (host.current) observer.observe(host.current);
    return () => {observer.disconnect(); media.removeEventListener('change',update);smallScreen.removeEventListener('change',update);};
  }, []);
  return <div className={`scene ${hero ? 'hero-scene' : ''}`} ref={host}>
    <picture className={`scene-poster ${ready && visible && enabled && !failed ? 'loaded' : ''}`}>
      {hero && <source media="(max-width: 820px)" srcSet="/images/hero-poster-mobile.webp" />}
      <img src={`/images/${poster}.webp`} alt={hero ? 'Original titanium sculpture with interlocking metallic fins and cyan light' : `Original 3D artwork for ${name.replaceAll('-', ' ')}`} loading={hero ? 'eager' : 'lazy'} />
    </picture>
    {visible && enabled && !failed && <SceneBoundary onError={() => setFailed(true)}><Canvas dpr={dpr} camera={{position:hero?[6,2.7,8]:[5,2.7,7], fov:36}} gl={{alpha:true, antialias:true, powerPreference:'low-power'}} onCreated={({gl}) => {gl.setClearColor('#070a0b',0);}} onError={() => setFailed(true)}>
      <ContextWatch onFailure={()=>setFailed(true)}/>
      <PerformanceMonitor onDecline={() => setDpr(1)} />
      <ambientLight intensity={.5} /><directionalLight position={[4,7,4]} intensity={4} color="#e3f4ff" /><pointLight position={[-4,2,-2]} intensity={35} color="#50f3e6" />
      <Suspense fallback={null}><Model name={name} interactive={interactive} onSelect={onSelect} onHover={setHovered} reduced={reduced || paused} /><Ready onReady={onReady} /><Environment preset={undefined} resolution={128}><mesh scale={30}><sphereGeometry args={[1,16,16]} /><meshBasicMaterial color="#46525b" side={THREE.BackSide} /></mesh><mesh position={[0,8,0]} rotation={[Math.PI/2,0,0]}><planeGeometry args={[12,12]} /><meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} /></mesh></Environment></Suspense>
      <Atmosphere reduced={reduced || paused} />{hero && <CameraMotion reduced={reduced || paused} />}
      {interactive && <Suspense fallback={null}><StudioControls focus={focus} reduced={reduced || paused} studio={name==='developer-studio'} /></Suspense>}
    </Canvas></SceneBoundary>}
    {!enabled && !failed && <button className="enable-3d" onClick={() => setEnabled(true)}>Explore in 3D <span>↗</span></button>}
    {enabled && ready && !failed && <div className="scene-controls"><button onClick={()=>setPaused(!paused)} aria-pressed={paused}>{paused?'Play motion':'Pause motion'}</button><button onClick={()=>{setEnabled(false);setReady(false);}}>Still view</button></div>}
    {hovered && enabled && !failed && <span className="scene-tooltip">{hovered}</span>}
    {name==='developer-studio' && enabled && ready && !failed && <div className="studio-hotspots">{[['Monitor_Projects','Projects'],['Keyboard_Skills','Skills'],['Notebook_About','About']].map(([object,label],i)=><button key={object} className="studio-hotspot" onClick={()=>onSelect?.(object)} aria-label={`Explore ${label} in studio`}><span>{i+1}</span><b>{label}</b></button>)}</div>}
    {failed && <span className="scene-status">Still view · 3D unavailable on this device</span>}
  </div>;
}
function Ready({onReady}: {onReady: () => void}) {useEffect(() => {onReady();}, [onReady]); return null;}
function ContextWatch({onFailure}:{onFailure:()=>void}) {
 const gl=useThree(state=>state.gl);
 useEffect(()=>{const canvas=gl.domElement;canvas.addEventListener('webglcontextlost',onFailure);return()=>canvas.removeEventListener('webglcontextlost',onFailure);},[gl,onFailure]);
 return null;
}
function StudioControls({focus,reduced,studio}: {focus:string;reduced:boolean;studio:boolean}) {
  if(studio) return <NamedStudioControls focus={focus} reduced={reduced}/>;
  return <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={.4} maxPolarAngle={1.65} autoRotate={!reduced} autoRotateSpeed={.3}/>;
}
function NamedStudioControls({focus,reduced}:{focus:string;reduced:boolean}) {
  const {scene} = useGLTF('/models/developer-studio.glb');
  const controls = useRef<any>(null);
  useEffect(() => {
    if(!controls.current) return;
    const c=controls.current;
    const positions:Record<string,number[]>={Overview:[6,3.8,8],Projects:[-1.8,1.5,5],Skills:[.7,4.5,4],About:[-3.5,3.4,4],'Beyond code':[-3,2.3,4],Research:[3,1.8,4]};
    const p=positions[focus]||positions.Overview;
    const lookup:Record<string,string>={Projects:'CameraTarget_Projects',Skills:'CameraTarget_Skills',About:'CameraTarget_About','Beyond code':'Wall_Achievements',Research:'Display_Research'};
    const box=new THREE.Box3().setFromObject(scene); const scale=5.5/Math.max(...box.getSize(new THREE.Vector3()).toArray());
    const named=scene.getObjectByName(lookup[focus]||'CameraTarget_Overview');
    const target=named?named.getWorldPosition(new THREE.Vector3()).sub(box.getCenter(new THREE.Vector3())).multiplyScalar(scale):new THREE.Vector3();
    const motion=gsap.to(c.object.position,{x:p[0],y:p[1],z:p[2],duration:reduced?0:1.2,ease:'power2.inOut',onUpdate:()=>c.update()});
    const targetMotion=gsap.to(c.target,{x:target.x,y:target.y,z:target.z,duration:reduced?0:1.2,ease:'power2.inOut'});
    return () => {motion.kill();targetMotion.kill();};
  },[focus,reduced,scene]);
  return <OrbitControls ref={controls} enablePan={false} enableZoom={false} minPolarAngle={.4} maxPolarAngle={1.65}/>;
}
