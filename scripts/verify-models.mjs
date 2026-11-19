import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Box3, Vector3, Mesh } from 'three';

const required = ['Monitor_Projects','Keyboard_Skills','Notebook_About','Wall_Achievements','Display_Research','CameraTarget_Overview','CameraTarget_Projects','CameraTarget_Skills','CameraTarget_About'];
for (const name of ['hero-sculpture','developer-studio','ai-research','jobnest','covid-research']) {
  const bytes = await readFile(new URL(`../public/models/${name}.glb`,import.meta.url));
  const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
  const size = new Box3().setFromObject(gltf.scene).getSize(new Vector3());
  assert(size.toArray().every(x=>Number.isFinite(x)&&x>0),`${name}: invalid bounds`);
  let meshes=0;
  gltf.scene.traverse(object=>{if(object instanceof Mesh){meshes++; assert(object.geometry.attributes.position.count>0); assert(object.material);}});
  assert(meshes>0);
  if(name==='developer-studio') for(const key of required) assert(gltf.scene.getObjectByName(key),`missing studio object ${key}`);
  console.log(`${name}: Three.js parse passed, ${meshes} meshes, ${(bytes.length/1024).toFixed(0)} KiB, bounds ${size.toArray().map(x=>x.toFixed(2)).join(' × ')}`);
}
