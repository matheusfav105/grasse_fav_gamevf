
// Maison des Arômes — WebGL Prototype (GitHub Pages Ready)
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { PointerLockControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/PointerLockControls.js';

const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0b10);
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.7, 6);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
document.body.appendChild(renderer.domElement);

// Bottle PIP
const bottleCanvas = document.getElementById('bottleCanvas');
const bottleRenderer = new THREE.WebGLRenderer({ canvas: bottleCanvas, antialias: true, alpha: true });
const bottleScene = new THREE.Scene();
const bottleCam = new THREE.PerspectiveCamera(50, bottleCanvas.clientWidth / bottleCanvas.clientHeight, 0.1, 100);
bottleCam.position.set(0, 0.6, 2.1);

// Lights
const hemi = new THREE.HemisphereLight(0xbdd1ff, 0x202020, 0.9);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 1.0);
sun.position.set(4, 8, 2);
sun.castShadow = true;
scene.add(sun);

// Ground + deck
const groundGeo = new THREE.PlaneGeometry(200, 200, 100, 100);
groundGeo.rotateX(-Math.PI / 2);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x1a1a22, metalness: 0.2, roughness: 0.8 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.receiveShadow = true;
scene.add(ground);
const deck = new THREE.Mesh(new THREE.BoxGeometry(14, 0.1, 14), new THREE.MeshStandardMaterial({ color: 0x3c2f23, metalness: 0.1, roughness: 0.7 }));
deck.position.set(0, 0.05, 0);
scene.add(deck);

// Monoliths
function monolith(x, z, h=THREE.MathUtils.randFloat(1.2,2.1)) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, h, 6),
    new THREE.MeshStandardMaterial({ color: 0x2a2a33, metalness: 0.05, roughness: 0.9 }));
  m.position.set(x, h/2, z);
  m.castShadow = true;
  scene.add(m);
}
for (let i=0;i<14;i++) monolith(THREE.MathUtils.randFloatSpread(60), THREE.MathUtils.randFloatSpread(60));

// Ingredients
const INGREDIENTS = [
  { id: 'bergamota', display:'Bergamota', type:'top', time:[6,9], color:0x8ef0d2 },
  { id: 'mandarina', display:'Mandarina', type:'top', time:[9,13], color:0xffaa55 },
  { id: 'rose_damascena', display:'Rose Damascena', type:'heart', time:[5,8], color:0xff66aa },
  { id: 'jasmim', display:'Jasmim', type:'heart', time:[19,22], color:0xffffff },
  { id: 'cardamomo', display:'Cardamomo', type:'heart', time:[10,14], color:0x88ffcc },
  { id: 'sandalowood', display:'Sândalo', type:'base', time:[17,23], color:0xcaa472 },
  { id: 'vanilla', display:'Vanilla', type:'base', time:[20,24], color:0xf2d6a6 },
  { id: 'musk', display:'Musk', type:'base', time:[0,24], color:0xe8e8f0 }
];

const plants = [];
function makePlant(ingredient, x, z){
  const group = new THREE.Group();
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.02,0.6,8),
    new THREE.MeshStandardMaterial({ color: 0x2b6d3e, roughness:.7 }));
  stem.position.y = 0.3;
  group.add(stem);
  const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.12, 18, 18),
    new THREE.MeshStandardMaterial({ color: ingredient.color, emissive: ingredient.color, emissiveIntensity: 0.15, metalness:.2, roughness:.4 }));
  bloom.position.y = 0.66;
  group.add(bloom);
  group.position.set(x, 0, z);
  group.userData.ingredient = ingredient;
  group.userData.collectible = true;
  scene.add(group);
  plants.push(group);
}
function plantRow(ingredient, z, count=8, spacing=1.4, offsetX=-5){
  for (let i=0;i<count;i++){
    makePlant(ingredient, offsetX + i*spacing, z+THREE.MathUtils.randFloatSpread(0.4));
  }
}
let rowZ = -6;
for (let k=0;k<INGREDIENTS.length;k++){
  plantRow(INGREDIENTS[k], rowZ);
  rowZ -= 1.2;
}

// Greenhouse + rare
const greenMat = new THREE.MeshPhysicalMaterial({ color: 0x88aaff, transparent:true, opacity:0.08, roughness:0.05, metalness:0.2, transmission:0.9, clearcoat:1 });
const greenhouse = new THREE.Mesh(new THREE.BoxGeometry(4.5, 2.2, 4.5), greenMat);
greenhouse.position.set(8, 1.1, -10);
scene.add(greenhouse);
const rareRose = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 24), new THREE.MeshStandardMaterial({ color: 0xff77cc, emissive:0xff66aa, emissiveIntensity:0.4 }));
rareRose.position.set(8, 1.5, -10);
rareRose.userData.ingredient = { id:'rose_damascena', display:'Rose Damascena', type:'heart', time:[5,8], color:0xff66aa, rare:true };
rareRose.userData.collectible = true;
scene.add(rareRose);

// Vapor (lab)
const vaporGeo = new THREE.BufferGeometry();
const vaporCount = 800;
const vapPos = new Float32Array(vaporCount * 3);
for(let i=0;i<vaporCount;i++){
  vapPos[i*3+0] = THREE.MathUtils.randFloatSpread(3);
  vapPos[i*3+1] = Math.random()*2;
  vapPos[i*3+2] = THREE.MathUtils.randFloatSpread(3);
}
vaporGeo.setAttribute('position', new THREE.BufferAttribute(vapPos, 3));
const vaporMat = new THREE.PointsMaterial({ size: 0.04, color: 0xa88cff, transparent:true, opacity:0.6 });
const vapor = new THREE.Points(vaporGeo, vaporMat);
vapor.position.set(-4, 0.2, 2);
scene.add(vapor);

// Lab desk
const labDesk = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.12, 1.4), new THREE.MeshStandardMaterial({ color: 0x2e2621, metalness:0.1, roughness:0.7 }));
labDesk.position.set(-4, 0.6, 2);
scene.add(labDesk);

// Bottle viewer (PIP)
function makeBottle(){
  const points = [];
  points.push(new THREE.Vector2(0.0, 0));
  points.push(new THREE.Vector2(0.25, 0));
  points.push(new THREE.Vector2(0.35, 0.2));
  points.push(new THREE.Vector2(0.38, 0.7));
  points.push(new THREE.Vector2(0.26, 1.0));
  points.push(new THREE.Vector2(0.18, 1.12));
  points.push(new THREE.Vector2(0.15, 1.2));
  const lathe = new THREE.LatheGeometry(points, 48);
  const grad = new THREE.MeshPhysicalMaterial({
    color: 0x6c63ff, metalness:0.6, roughness:0.1, transmission:0.6, thickness: 0.6,
    iridescence: 0.35, clearcoat:1.0, emissive: 0x3a2a74, emissiveIntensity: 0.05
  });
  const bottle = new THREE.Mesh(lathe, grad);
  bottle.castShadow = true;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.18, 24),
    new THREE.MeshStandardMaterial({ color: 0x3b2b6b, metalness: 0.9, roughness: 0.2 }));
  cap.position.y = 1.29;
  const group = new THREE.Group();
  group.add(bottle);
  group.add(cap);
  return group;
}
const bottle = makeBottle();
bottleScene.add(new THREE.AmbientLight(0xffffff, .7));
const bLight = new THREE.DirectionalLight(0xffffff, 0.9);
bLight.position.set(1.5, 2.2, 1.5);
bottleScene.add(bLight);
bottleScene.add(bottle);

// Controls
const controls = new PointerLockControls(camera, renderer.domElement);
const keyState = {};
document.addEventListener('keydown', (e)=> keyState[e.code]=true);
document.addEventListener('keyup', (e)=> keyState[e.code]=false);
renderer.domElement.addEventListener('click', ()=>{ if (!isMobile && started) controls.lock(); });

// Mobile joystick + look
const mobileControls = document.getElementById('mobileControls');
const joystickBase = document.getElementById('joystickBase');
const joystickStick = document.getElementById('joystickStick');
let joyActive = false, joyVec = {x:0, y:0};
let lookActive = false, lastLook = {x:0,y:0};
function clamp(v, min, max){ return Math.min(max, Math.max(min, v)); }

joystickBase.addEventListener('touchstart', (e)=>{ joyActive = true; }, {passive:true});
joystickBase.addEventListener('touchmove', (e)=>{
  if(!joyActive) return;
  const rect = joystickBase.getBoundingClientRect();
  const t = e.touches[0];
  const cx = rect.left + rect.width/2;
  const cy = rect.top + rect.height/2;
  const dx = clamp(t.clientX - cx, -55, 55);
  const dy = clamp(t.clientY - cy, -55, 55);
  joystickStick.style.transform = `translate(${dx}px, ${dy}px)`;
  joyVec.x = dx/55; joyVec.y = dy/55;
}, {passive:true});
joystickBase.addEventListener('touchend', ()=>{
  joyActive = false; joyVec.x=0; joyVec.y=0;
  joystickStick.style.transform = `translate(-50%,-50%)`;
}, {passive:true});

document.addEventListener('touchstart', (e)=>{
  if (e.target.closest('#joystickBase') || e.target.closest('#actionBtn')) return;
  lookActive = true;
  const t = e.touches[0];
  lastLook.x = t.clientX; lastLook.y = t.clientY;
}, {passive:true});
document.addEventListener('touchmove', (e)=>{
  if(!lookActive) return;
  const t = e.touches[0];
  const dx = (t.clientX - lastLook.x)/ window.innerWidth * 4.0;
  const dy = (t.clientY - lastLook.y)/ window.innerHeight * 2.5;
  controls.getObject().rotation.y -= dx;
  camera.rotation.x -= dy;
  camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotation.x));
  lastLook.x = t.clientX; lastLook.y = t.clientY;
}, {passive:true});
document.addEventListener('touchend', ()=>{ lookActive = false; }, {passive:true});

// Interaction
const raycaster = new THREE.Raycaster();
const interactHint = document.getElementById('interactHint');
let focusedCollectible = null;
function updateInteraction(){
  raycaster.setFromCamera(new THREE.Vector2(0,0), camera);
  const intersects = raycaster.intersectObjects([...plants, rareRose], false);
  let found = null;
  for (const hit of intersects){
    if (hit.distance < 2.0 && hit.object.userData.collectible) { found = hit.object; break; }
  }
  focusedCollectible = found;
  interactHint.classList.toggle('hidden', !found);
}

// Time & ambience
let gameMinutes = 6 * 60;
let lastTime = performance.now();
function updateTime(){
  const now = performance.now();
  const dt = (now - lastTime) / 1000;
  lastTime = now;
  gameMinutes += dt * 360;
  if (gameMinutes >= 24*60) gameMinutes -= 24*60;

  const h = Math.floor(gameMinutes/60);
  const m = Math.floor(gameMinutes%60);
  document.getElementById('clock').innerText = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;

  const t = h/24;
  const sky = new THREE.Color().setHSL(0.66, 0.4, 0.06 + 0.4 * Math.sin(t*Math.PI*2)*0.5 + 0.5);
  scene.background.lerp(sky, 0.02);
  sun.position.set(Math.cos(t*Math.PI*2)*8, Math.sin(t*Math.PI*2)*10, 2);

  vapor.material.opacity = 0.35 + 0.25*Math.sin(now*0.001);
  bottle.rotation.y += 0.005;
}

// Inventory + missions
const inventory = new Map();
function addToInventory(ing, quality){
  const key = ing.id;
  const prev = inventory.get(key) || {count:0, best:0, display:ing.display, type: ing.type};
  prev.count += 1;
  prev.best = Math.max(prev.best, quality);
  inventory.set(key, prev);
  renderInventory();
}
function renderInventory(){
  const inv = [...inventory.values()];
  const order = {top:0, heart:1, base:2};
  inv.sort((a,b)=> order[a.type]-order[b.type]);
  const txt = inv.map(i=>`${i.display} ×${i.count}  <span style="opacity:.7">(qualidade ${i.best.toFixed(1)})</span>`).join('<br/>');
  document.getElementById('inventory').innerHTML = `<b>Pirâmide Olfativa</b><br/>${txt || '<span style="opacity:.7">sem ingredientes</span>'}`;
}
function currentHour(){ return Math.floor(gameMinutes/60); }
function qualityFor(ing){
  const h = currentHour();
  const [a,b] = ing.time;
  let q = (h>=a && h<b) ? 1.0 : 0.6;
  if (ing.rare) q += 0.2;
  return Math.min(1.0, q);
}

const missionBox = document.getElementById('mission');
const MISSIONS = [
  { id:'tutorial', text:'Tutorial — Colha 1x Bergamota entre 06:00 e 09:00 nos jardins.', cond: ()=> (inventory.get('bergamota')?.count||0)>=1 },
  { id:'m1', text:'Missão 1 — Encontre a Rose Damascena rara dentro da estufa.', cond: ()=> (inventory.get('rose_damascena')?.count||0)>=1 },
  { id:'m2', text:'Missão 2 — Reúna notas Top (Bergamota/Mandarina), Coração (Rose/Jasmim/Cardamomo) e Base (Sândalo/Vanilla/Musk).', cond: ()=> {
      const top = (inventory.get('bergamota')?.count||0) + (inventory.get('mandarina')?.count||0);
      const heart = (inventory.get('rose_damascena')?.count||0) + (inventory.get('jasmim')?.count||0) + (inventory.get('cardamomo')?.count||0);
      const base = (inventory.get('sandalowood')?.count||0) + (inventory.get('vanilla')?.count||0) + (inventory.get('musk')?.count||0);
      return top>=1 && heart>=2 && base>=2;
    }},
  { id:'final', text:'Final — No laboratório, pressione "Interagir" para compor o frasco icônico fav (azul/roxo).', cond: ()=> crafted }
];
let missionIndex = 0;
function updateMissionText(){ missionBox.innerHTML = `<b>Missão</b><br/>${MISSIONS[missionIndex].text}`; }
function advanceMissions(){
  if (MISSIONS[missionIndex].cond()){
    missionIndex = Math.min(missionIndex+1, MISSIONS.length-1);
    updateMissionText();
  }
}

let crafted = false;
function canCraft(){
  if (missionIndex < 2) return false;
  const top = (inventory.get('bergamota')?.count||0) + (inventory.get('mandarina')?.count||0);
  const heart = (inventory.get('rose_damascena')?.count||0) + (inventory.get('jasmim')?.count||0) + (inventory.get('cardamomo')?.count||0);
  const base = (inventory.get('sandalowood')?.count||0) + (inventory.get('vanilla')?.count||0) + (inventory.get('musk')?.count||0);
  return top>=1 && heart>=2 && base>=2;
}
function craft(){
  if (!canCraft()) return;
  crafted = true;
  bottle.traverse(obj=>{
    if (obj.material){
      if (obj.material.isMeshPhysicalMaterial){
        obj.material.color.set(0x7b5bff);
        obj.material.emissive?.set(0x2a1357);
        obj.material.emissiveIntensity = 0.18;
        obj.material.transmission = 0.7;
        obj.material.thickness = 0.75;
      } else {
        obj.material.color?.set(0x2f2255);
        obj.material.metalness = 1.0;
        obj.material.roughness = 0.15;
      }
    }
  });
  missionIndex = MISSIONS.length-1;
  updateMissionText();
  showToast("Frasco icônico composto! Parabéns, perfumista.");
}

// HUD & UI
const hud = document.getElementById('hud');
const hands = document.getElementById('hands');
const actionBtn = document.getElementById('actionBtn');

function showToast(msg){
  const hint = document.createElement('div');
  hint.textContent = msg;
  hint.style.position='fixed'; hint.style.left='50%'; hint.style.transform='translateX(-50%)';
  hint.style.bottom='120px'; hint.style.padding='10px 14px';
  hint.style.background='rgba(0,0,0,.55)'; hint.style.border='1px solid rgba(255,255,255,.15)';
  hint.style.borderRadius='12px'; hint.style.color='#fff'; hint.style.zIndex='999';
  document.body.appendChild(hint);
  setTimeout(()=> hint.remove(), 1800);
}

function interact(){
  if (focusedCollectible){
    const ing = focusedCollectible.userData.ingredient;
    const q = qualityFor(ing);
    addToInventory(ing, q);
    focusedCollectible.visible = false;
    focusedCollectible.userData.collectible = false;
    showToast(`Coletado: ${ing.display} (qualidade ${q.toFixed(1)})`);
    advanceMissions();
    return;
  }
  const d = camera.position.distanceTo(labDesk.position);
  if (d < 2.0){
    craft();
  }
}

document.addEventListener('keydown', (e)=>{ if (e.code==='KeyE') interact(); });
actionBtn?.addEventListener('click', ()=> interact());

// Movement
function updateMovement(delta){
  const speed = 2.2;
  if (!isMobile){
    const forward = (keyState['KeyW']||keyState['ArrowUp']) ? 1 : (keyState['KeyS']||keyState['ArrowDown']) ? -1 : 0;
    const strafe = (keyState['KeyD']||keyState['ArrowRight']) ? 1 : (keyState['KeyA']||keyState['ArrowLeft']) ? -1 : 0;
    const direction = new THREE.Vector3();
    direction.z = -forward; direction.x = strafe;
    direction.normalize();
    const move = new THREE.Vector3();
    controls.getDirection(move);
    const right = new THREE.Vector3();
    right.crossVectors(camera.up, move).normalize().multiplyScalar(-1);
    const forwardVec = move.multiplyScalar(direction.z * speed * delta);
    const rightVec = right.multiplyScalar(direction.x * speed * delta);
    controls.getObject().position.add(forwardVec).add(rightVec);
  } else {
    const angle = Math.atan2(joyVec.y, joyVec.x);
    const mag = Math.min(1, Math.hypot(joyVec.x, joyVec.y));
    const moveDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
    const yaw = controls.getObject().rotation.y;
    moveDir.applyAxisAngle(new THREE.Vector3(0,1,0), yaw - Math.PI/2);
    controls.getObject().position.addScaledVector(moveDir, speed * mag * delta);
  }
}

// Start
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');
let started = false;
startBtn.addEventListener('click', ()=>{
  overlay.classList.add('hidden');
  hud.classList.remove('hidden');
  hands.classList.remove('hidden');
  if (isMobile){ mobileControls.classList.remove('hidden'); } else { controls.lock(); }
  started = true;
  updateMissionText();
});

controls.getObject().position.set(0, 1.5, 6);
scene.add(controls.getObject());

// Resize
window.addEventListener('resize', ()=>{
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  bottleCam.aspect = bottleCanvas.clientWidth / bottleCanvas.clientHeight;
  bottleCam.updateProjectionMatrix();
});

// Loop
function animate(){
  requestAnimationFrame(animate);
  const now = performance.now();
  const delta = (now - lastTime)/1000;
  updateTime();
  if (started){
    updateMovement(Math.min(0.05, delta>0 ? delta : 0.016));
    updateInteraction();
  } else {
    lastTime = performance.now();
  }
  renderer.render(scene, camera);
  bottleRenderer.setSize(bottleCanvas.clientWidth, bottleCanvas.clientHeight, false);
  bottleRenderer.render(bottleScene, bottleCam);
}
lastTime = performance.now();
animate();
