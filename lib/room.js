// Three.js diorama (r128 API). Call createRoom(refs) from a client effect; it returns a dispose function.
import * as THREE from 'three';

export function createRoom(refs){
  const { stage, bubble, lightbox, lbImg, btnWave, btnRgb } = refs;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const spd = reduce ? 0.35 : 1;

  const renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0e0915);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  const camTarget = new THREE.Vector3(-0.6, 1.1, -0.6);

  const ramp = new Uint8Array([70,70,70,255, 150,150,150,255, 255,255,255,255]);
  const gradientMap = new THREE.DataTexture(ramp, 3, 1, THREE.RGBAFormat);
  gradientMap.minFilter = gradientMap.magFilter = THREE.NearestFilter; gradientMap.needsUpdate = true;
  const mat = (c) => new THREE.MeshToonMaterial({color:c, gradientMap});
  const glow = (c) => new THREE.MeshBasicMaterial({color:c});

  const room = new THREE.Group(); scene.add(room);

  function box(w,h,d,m,x,y,z,parent=room){
    const b = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), m);
    b.position.set(x,y,z); b.castShadow = true; b.receiveShadow = true; parent.add(b); return b;
  }
  function sph(r,m,x,y,z,sx=1,sy=1,sz=1,parent=room){
    const s = new THREE.Mesh(new THREE.SphereGeometry(r,32,22), m);
    s.position.set(x,y,z); s.scale.set(sx,sy,sz); s.castShadow = true; parent.add(s); return s;
  }
  function cyl(rt,rb,h,m,x,y,z,parent=room,seg=24){
    const c = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg), m);
    c.position.set(x,y,z); c.castShadow = true; c.receiveShadow = true; parent.add(c); return c;
  }

  // ---------- shell ----------
  const M = {
    white: mat(0xf2eef6), floor: mat(0x3a2f4a), wall: mat(0x144d7c), wall2: mat(0x104268), trim: mat(0x1b1424),
    wood: mat(0x5b4a6e), deskTop: mat(0x1f1a28), metal: mat(0x8f86a0), dark: mat(0x15111c),
    rug: mat(0x6c4f8f), chair: mat(0x7b5aa6), chairDark: mat(0x2b2236),
    leaf: mat(0x58a07a), pot: mat(0xe9e1ee), poster: mat(0x9a7bc2), book1: mat(0xf4a6b8), book2: mat(0x7be0b4), book3: mat(0xf6c66b)
  };
  box(6,0.2,6,M.floor,0,-0.1,0);
  box(6,4,0.2,M.wall,0,2,-3.1);
  box(0.2,4,6,M.wall2,-3.1,2,0);
  const rug = cyl(1.5,1.5,0.03,M.rug,-0.6,0.015,-0.3,room,48);

  // window on back wall
  const winFrame = box(1.5,1.2,0.08,M.trim,1.4,2.4,-2.98);
  const skyMat = new THREE.MeshBasicMaterial({color:0x1b2550});
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(1.32,1.02), skyMat);
  sky.position.set(1.4,2.4,-2.93); room.add(sky);
  const stars = [];
  for(let i=0;i<14;i++){
    const st = new THREE.Mesh(new THREE.CircleGeometry(0.018,8), glow(0xfff4d6));
    st.position.set(1.4 + (Math.random()-.5)*1.2, 2.4 + (Math.random()-.5)*0.9, -2.92); room.add(st); stars.push(st);
  }
  const moon = new THREE.Mesh(new THREE.CircleGeometry(0.11,24), glow(0xfff1c9)); moon.position.set(1.8,2.7,-2.92); room.add(moon);
  box(1.5,0.06,0.12,M.trim,1.4,1.82,-2.94);

  // shelves on back wall
  box(1.6,0.06,0.35,M.wood,-1.3,2.3,-2.85);
  box(1.6,0.06,0.35,M.wood,-1.3,2.95,-2.85);
  [[0.12,0.34,M.book1],[0.1,0.3,M.book2],[0.14,0.36,M.book3],[0.1,0.28,M.poster]].forEach((b,i)=>{
    box(b[0],b[1],0.26,b[2],-1.95+i*0.15,2.33+b[1]/2,-2.85);
  });
  // tiny figures on shelf
  sph(0.11,M.book1,-0.9,3.1,-2.85); sph(0.08,M.pot,-0.9,3.27,-2.85);
  sph(0.11,M.book2,-0.6,3.1,-2.85); sph(0.08,M.pot,-0.6,3.27,-2.85);
  box(0.3,0.22,0.2,M.chairDark,-1.6,3.09,-2.85);
  sph(0.12,M.poster,-1.1,2.45,-2.85);

  // poster on left wall
  const POSTER_SRC = '/kamar/poster-sheet.jpg';
  const posterG = new THREE.Group(); posterG.position.set(-2.97,2.4,1.45); posterG.rotation.y = Math.PI/2; room.add(posterG);
  const pFrame = new THREE.Mesh(new THREE.BoxGeometry(1.5,0.97,0.05), M.trim); pFrame.castShadow = true; posterG.add(pFrame);
  const posterTex = new THREE.TextureLoader().load(POSTER_SRC); posterTex.encoding = THREE.sRGBEncoding;
  const pArt = new THREE.Mesh(new THREE.PlaneGeometry(1.4,0.848), new THREE.MeshBasicMaterial({map:posterTex}));
  pArt.position.z = 0.03; posterG.add(pArt);
  const pLamp = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.04,0.08), M.metal); pLamp.position.set(0,0.56,0.07); posterG.add(pLamp);
  const pLight = new THREE.PointLight(0xffe2b0, 0.6, 3); pLight.position.set(0,0.5,0.5); posterG.add(pLight);

  const POSTER2_SRC = '/kamar/poster-room.jpg';
  const poster2G = new THREE.Group(); poster2G.position.set(-0.2,1.62,-2.97); room.add(poster2G);
  const p2Frame = new THREE.Mesh(new THREE.BoxGeometry(1.2,0.74,0.05), M.trim); p2Frame.castShadow = true; poster2G.add(p2Frame);
  const poster2Tex = new THREE.TextureLoader().load(POSTER2_SRC); poster2Tex.encoding = THREE.sRGBEncoding;
  const p2Art = new THREE.Mesh(new THREE.PlaneGeometry(1.12,0.63), new THREE.MeshBasicMaterial({map:poster2Tex}));
  p2Art.position.z = 0.03; poster2G.add(p2Art);

  // neon paw sign on back wall
  const neonMat = new THREE.MeshBasicMaterial({color:0xc1a1cf});
  const neon = new THREE.Group(); neon.position.set(0.1,2.75,-2.98); room.add(neon);
  const pad = new THREE.Mesh(new THREE.TorusGeometry(0.2,0.025,8,32), neonMat); pad.scale.set(1.15,0.9,1); neon.add(pad);
  [[-0.27,0.26],[-0.09,0.37],[0.09,0.37],[0.27,0.26]].forEach(p=>{
    const toe = new THREE.Mesh(new THREE.TorusGeometry(0.07,0.02,8,24), neonMat); toe.position.set(p[0],p[1],0); neon.add(toe);
  });
  const neonLight = new THREE.PointLight(0xc1a1cf, 0.8, 4); neonLight.position.set(0.1,2.7,-2.6); room.add(neonLight);

  // LED strips along the top of both walls
  const ledMat = new THREE.MeshBasicMaterial({color:0x8a5cff});
  const ledBack = new THREE.Mesh(new THREE.BoxGeometry(6,0.05,0.05), ledMat); ledBack.position.set(0,3.92,-2.98); room.add(ledBack);
  const ledLeft = new THREE.Mesh(new THREE.BoxGeometry(0.05,0.05,6), ledMat); ledLeft.position.set(-2.98,3.92,0); room.add(ledLeft);
  const ledLight1 = new THREE.PointLight(0x8a5cff, 0.9, 6); ledLight1.position.set(0,3.6,-2.5); room.add(ledLight1);
  const ledLight2 = new THREE.PointLight(0x8a5cff, 0.9, 6); ledLight2.position.set(-2.5,3.6,0); room.add(ledLight2);

  // plant
  cyl(0.22,0.17,0.4,M.pot,2.4,0.2,-2.4);
  for(let i=0;i<7;i++){
    const a = i/7*Math.PI*2;
    const leaf = sph(0.16,M.leaf,2.4+Math.cos(a)*0.14,0.62+(i%2)*0.12,-2.4+Math.sin(a)*0.14,0.6,1.4,0.6);
    leaf.rotation.z = Math.cos(a)*0.5; leaf.rotation.x = Math.sin(a)*0.5;
  }

  // ---------- desk against the left wall ----------
  const deskTop = box(1.1,0.07,3.2,M.deskTop,-2.45,1.0,-0.3);
  [[-2.85,-1.8],[-2.85,1.2],[-2.0,-1.8],[-2.0,1.2]].forEach(p=> box(0.07,1.0,0.07,M.metal,p[0],0.5,p[1]));
  // desk mat with RGB edge
  const matEdge = box(0.62,0.012,1.4,ledMat,-2.25,1.04,-0.25);
  box(0.6,0.014,1.38,M.dark,-2.25,1.042,-0.25);

  // monitors (screens are canvas textures)
  function makeScreen(w,h){
    const c = document.createElement('canvas'); c.width = 256; c.height = Math.round(256*h/w);
    const tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding;
    return {c, ctx:c.getContext('2d'), tex};
  }
  const screens = [];
  function monitor(z, rotY, w, h, cy){
    const g = new THREE.Group(); g.position.set(-2.72,1.04,z); g.rotation.y = rotY; room.add(g);
    box(0.06,cy-h/2+0.05,0.06,M.metal,0,(cy-h/2+0.05)/2,0,g);
    box(0.3,0.03,0.24,M.metal,0,0.015,0,g);
    box(0.06,h+0.06,w+0.06,M.dark,0,cy,0,g);
    const s = makeScreen(w,h);
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(w,h), new THREE.MeshBasicMaterial({map:s.tex}));
    plane.position.set(0.035,cy,0); plane.rotation.y = Math.PI/2; g.add(plane);
    screens.push(s); return g;
  }
  monitor(-0.75, 0.15, 1.15, 0.65, 0.68).position.y += 0.09;   // landscape, right side, on riser
  monitor(0.42, -0.22, 0.52, 0.92, 0.78);   // portrait, left side
  const screenLight = new THREE.PointLight(0x9fd0ff, 0.9, 3.5); screenLight.position.set(-2.1,1.7,-0.25); room.add(screenLight);

  // keyboard + mouse
  box(0.26,0.035,0.8,M.white,-2.15,1.06,-0.25);
  const keyGlow = box(0.24,0.008,0.78,glow(0x5a8cff),-2.15,1.08,-0.25);
  sph(0.05,M.white,-2.0,1.07,0.3,1,0.55,1.4);

  // white monitor riser under the landscape monitor
  // monitor riser (1 only): top board + two end legs, open underneath so the keyboard can tuck in
  const riserTop = box(0.34,0.03,1.4,M.white,-2.73,1.115,-0.75);
  [-1,1].forEach(k=> box(0.34,0.075,0.03,M.white,-2.73,1.0775,-0.75+0.685*k));
  // controller with glowing rings (white, pink rings)
  const ctrl = new THREE.Group(); ctrl.position.set(-2.2,1.07,-1.25); ctrl.rotation.y = 0.5; room.add(ctrl);
  sph(0.07,M.white,0,0.02,0,1.6,0.5,1.1,ctrl);
  [-1,1].forEach(k=>{ const r = new THREE.Mesh(new THREE.TorusGeometry(0.018,0.006,6,14), glow(0xff7ac8)); r.rotation.x = Math.PI/2; r.position.set(0.05*k,0.045,0.02); ctrl.add(r); });
  // orange scented candle + warm glow
  const candle = new THREE.Group(); candle.position.set(-2.45,1.04,0.0); room.add(candle);
  cyl(0.06,0.06,0.12,mat(0xf08a2c),0,0.06,0,candle);
  const flame = sph(0.014,glow(0xffd27a),0,0.14,0,1,1.6,1,candle);
  const candleLight = new THREE.PointLight(0xffa24a, 0.5, 1.6); candleLight.position.set(-2.45,1.25,0.0); room.add(candleLight);
  // green candle
  cyl(0.055,0.055,0.11,mat(0x7fb26a),-2.45,1.095,-1.45,room);
  // mic arm + mic
  const micArm = cyl(0.015,0.015,0.9,M.dark,-2.7,1.4,-1.55); micArm.rotation.z = -0.6; micArm.rotation.x = 0.2;
  cyl(0.07,0.07,0.18,M.dark,-2.42,1.75,-1.45).rotation.z = 1.2;
  sph(0.075,mat(0x55505e),-2.42,1.75,-1.45,1,1,1);

  // PC tower on the floor by the desk
  const pc = new THREE.Group(); pc.position.set(-2.5,0,1.8); room.add(pc);
  box(0.7,1.1,0.45,M.white,0,0.55,0,pc);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.6,0.95), new THREE.MeshBasicMaterial({color:0x2a1d3a, transparent:true, opacity:0.9}));
  glass.position.set(0.355,0.56,0); glass.rotation.y = Math.PI/2; pc.add(glass);
  const fans = [];
  [0.85,0.5,0.15].forEach(y=>{
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.11,0.02,8,24), ledMat);
    ring.position.set(0.36,y+0.05,0); ring.rotation.y = Math.PI/2; pc.add(ring); fans.push(ring);
  });
  const pcLight = new THREE.PointLight(0x8a5cff, 0.6, 2); pcLight.position.set(-2.0,0.6,1.8); room.add(pcLight);

  // desk lamp
  cyl(0.1,0.12,0.04,M.metal,-2.7,1.05,0.95);
  const lampArm = cyl(0.015,0.015,0.5,M.metal,-2.65,1.3,0.95); lampArm.rotation.z = -0.35;
  const lampHead = cyl(0.04,0.12,0.12,M.chair,-2.5,1.52,0.95); lampHead.rotation.z = -1.0;
  const lampLight = new THREE.SpotLight(0xffd9a8, 0.0, 3, 0.7, 0.6); lampLight.position.set(-2.45,1.5,0.95);
  lampLight.target.position.set(-2.2,1.0,0.7); room.add(lampLight, lampLight.target);

  // ---------- cloud accents + original plush pups ----------
  const cloudMat = mat(0xffffff), cloudPink = mat(0xffd9e8);
  function cloud(x,y,z,sc,rotY,flat=0.35,m=cloudMat){
    const g = new THREE.Group(); g.position.set(x,y,z); g.rotation.y = rotY; g.scale.setScalar(sc); room.add(g);
    [[0,0,0.2],[-0.2,-0.03,0.15],[0.2,-0.03,0.15],[-0.36,-0.08,0.1],[0.36,-0.08,0.1],[0.05,0.1,0.14]].forEach(p=>{
      const b = new THREE.Mesh(new THREE.SphereGeometry(p[2],20,14), m); b.position.set(p[0],p[1],0); b.scale.z = flat; b.castShadow = true; g.add(b);
    });
    return g;
  }
  cloud(-1.9,1.55,-2.96,1.1,0);  cloud(1.45,1.35,-2.96,0.8,0,0.35,cloudPink);  cloud(2.4,2.2,-2.96,0.6,0);
  cloud(-2.96,3.25,-0.6,1.2,Math.PI/2);  cloud(-2.96,3.3,2.1,0.8,Math.PI/2,0.35,cloudPink);
  // soft cloud cushions on the floor
  cloud(0.2,0.2,-1.2,1.3,0.4,1.0);  cloud(-1.6,0.16,1.9,0.9,-0.3,1.0,cloudPink);
  // cloud lamp on the desk
  const cloudLamp = cloud(-2.35,1.17,-1.7,0.55,Math.PI/2,1.0,new THREE.MeshBasicMaterial({color:0xfff1d0}));
  const cloudLampLight = new THREE.PointLight(0xffe2b0, 0.5, 2.5); cloudLampLight.position.set(-2.3,1.3,-1.6); room.add(cloudLampLight);
  // little glowing stars
  [[-0.9,3.5,-2.96],[0.9,3.3,-2.96],[2.6,1.3,-2.96],[-2.96,2.2,0.4],[-2.96,1.9,-2.3]].forEach((p,i)=>{
    const st = new THREE.Mesh(new THREE.OctahedronGeometry(0.07), glow(0xfff0a8)); st.position.set(p[0],p[1],p[2]); st.scale.z = 0.4;
    if(p[0]<-2.9) st.rotation.y = Math.PI/2; room.add(st);
  });
  // original plush pup: round tan body, small dark floppy ears, no long ears or curly tail
  const pupFur = mat(0xe0a96d), pupDark = mat(0x6a4630), pupCream = mat(0xf7e6c9);
  function plushPup(x,y,z,rotY,s=1){
    const g = new THREE.Group(); g.position.set(x,y,z); g.rotation.y = rotY; g.scale.setScalar(s); room.add(g);
    sph(0.2,pupFur,0,0.2,0,1,0.95,1,g);
    sph(0.17,pupFur,0,0.5,0.03,1,0.95,1,g);
    sph(0.07,pupCream,0,0.45,0.17,1.2,0.8,0.8,g);
    sph(0.025,pupDark,0,0.48,0.23,1,0.8,0.8,g);
    [-1,1].forEach(k=>{
      sph(0.05,pupDark,0.07*k,0.54,0.17,0.7,1,0.5,g);
      const ear = sph(0.06,pupDark,0.16*k,0.55,0.0,0.6,1.4,0.9,g); ear.rotation.z = 0.35*k;
      sph(0.05,pupFur,0.11*k,0.06,0.12,1,0.8,1.3,g);
    });
    return g;
  }
  plushPup(-0.9,0.04,1.55,0.6);  plushPup(1.3,0.04,-1.75,-0.5,0.9);  plushPup(-2.35,1.04,0.35,1.45,0.55);

  // ---------- gaming chair ----------
  const chair = new THREE.Group(); chair.position.set(-1.5,0,-0.25); chair.rotation.y = -Math.PI/2; room.add(chair);
  cyl(0.05,0.05,0.4,M.metal,0,0.35,0,chair);
  for(let i=0;i<5;i++){
    const a = i/5*Math.PI*2;
    const legB = box(0.42,0.04,0.06,M.chairDark,Math.cos(a)*0.2,0.1,Math.sin(a)*0.2,chair); legB.rotation.y = -a;
    sph(0.04,M.dark,Math.cos(a)*0.4,0.04,Math.sin(a)*0.4,1,1,1,chair);
  }
  box(0.62,0.12,0.6,M.chair,0,0.6,0,chair);
  const back = box(0.6,1.05,0.12,M.chair,0,1.2,-0.32,chair); back.rotation.x = -0.12;
  box(0.36,0.85,0.13,M.chairDark,0,1.2,-0.31,chair).rotation.x = -0.12;
  box(0.4,0.18,0.14,M.chairDark,0,1.82,-0.39,chair).rotation.x = -0.12;
  [-1,1].forEach(s=>{ box(0.08,0.06,0.4,M.chairDark,0.33*s,0.88,0.02,chair); box(0.05,0.25,0.05,M.metal,0.33*s,0.75,0.02,chair); });

  // ---------- the person (original chibi design) ----------
  const P = {
    skin: mat(0xf2c7a5), hair: mat(0xf1eef5), hoodie: mat(0x7a63b8), hood: mat(0x6a54a5),
    pants: mat(0x2e2a3a), shoe: mat(0xf1edf5), phones: mat(0xe9f1fb), cup: mat(0xff8fb1), eye: mat(0x1d1622), white: glow(0xffffff)
  };
  const person = new THREE.Group(); person.position.set(-1.47,0.66,-0.25); person.rotation.y = -Math.PI/2; room.add(person);

  // legs (bent, feet toward desk)
  [-1,1].forEach(s=>{
    sph(0.13,P.pants,0.14*s,0.06,0.18,1,0.9,2.0,person);
    sph(0.11,P.pants,0.14*s,-0.22,0.42,1,2.2,1,person);
    sph(0.1,P.shoe,0.14*s,-0.5,0.5,1,0.7,1.5,person);
  });
  const torso = sph(0.34,P.hoodie,0,0.38,0,1,1.15,0.85,person);
  sph(0.2,P.hood,0,0.62,-0.2,1.5,0.8,0.8,person);
  // hoodie pocket and strings
  box(0.32,0.12,0.04,P.hood,0,0.22,0.27,person);
  [-1,1].forEach(s=> cyl(0.012,0.012,0.18,P.shoe,0.06*s,0.55,0.27,person,6));

  // arms reach forward to keyboard
  function arm(s){
    const pivot = new THREE.Group(); pivot.position.set(0.3*s,0.56,0.02); person.add(pivot);
    const upper = sph(0.09,P.hoodie,0,-0.12,0.08,1,1.8,1,pivot); upper.rotation.x = 0.9;
    const fore = sph(0.08,P.hoodie,0,-0.22,0.34,1,1,2.4,pivot);
    const hand = sph(0.07,P.skin,0,-0.22,0.58,1,0.8,1.1,pivot);
    pivot.rotation.y = -0.25*s;
    return {pivot, hand};
  }
  const armL = arm(-1), armR = arm(1);

  // head
  const headPivot = new THREE.Group(); headPivot.position.set(0,0.78,0.02); person.add(headPivot);
  const head = sph(0.36,P.skin,0,0.28,0,1.05,1,1,headPivot);
  // hair: short white bob (cap + blunt fringe + chin-length sides and back)
  const hairCap = sph(0.39,P.hair,0,0.42,-0.1,1.08,0.95,1.02,headPivot);
  [-0.2,-0.1,0,0.1,0.2].forEach((x,i)=> sph(0.1,P.hair,x,0.5-(i%2)*0.02,0.29,1,1.05,0.55,headPivot));
  [-1,1].forEach(s=>{
    sph(0.14,P.hair,0.34*s,0.12,0.02,0.7,2.0,1.1,headPivot);
    sph(0.12,P.hair,0.3*s,-0.05,-0.02,0.7,1.1,1.0,headPivot);
  });
  sph(0.36,P.hair,0,0.1,-0.2,1.05,1.5,0.8,headPivot);
  // face
  const eyes = [];
  [-1,1].forEach(s=>{
    const g = new THREE.Group(); g.position.set(0.13*s,0.26,0.33); headPivot.add(g);
    const e = sph(0.05,P.eye,0,0,0,1,1.3,0.5,g);
    const hl = sph(0.017,P.white,0.015,0.025,0.025,1,1,1,g);
    eyes.push(g);
  });
  [-1,1].forEach(s=> sph(0.05,mat(0xf4a6b8),0.22*s,0.16,0.3,1,0.55,0.4,headPivot));
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.035,0.01,8,16,Math.PI), P.eye);
  mouth.position.set(0,0.13,0.355); mouth.rotation.z = Math.PI; headPivot.add(mouth);
  // headset
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.38,0.03,8,32,Math.PI), P.phones);
  band.position.set(0,0.3,-0.02); headPivot.add(band);
  [-1,1].forEach(s=>{
    const cup = cyl(0.11,0.11,0.08,P.phones,0.38*s,0.26,0,headPivot); cup.rotation.z = Math.PI/2;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.1,0.018,8,24), glow(0x6fe3ff));
    ring.position.set(0.425*s,0.26,0); ring.rotation.y = Math.PI/2; headPivot.add(ring);
  });
  const micBoom = cyl(0.01,0.01,0.28,P.phones,-0.3,0.1,0.18,headPivot,6); micBoom.rotation.x = 1.2; micBoom.rotation.z = 0.4;

  // ---------- kittens ----------
  const kittens = [];
  const furs = [
    {body:0xf2a65a, ear:0xe08a3c}, {body:0xf7f3ee, ear:0xf4a6b8}, {body:0x9a95a6, ear:0x7e7889},
    {body:0x2b2733, ear:0x3d3746}, {body:0xf3dfc0, ear:0xc9874f}, {body:0xd9d2c8, ear:0x8a7f73}
  ];
  function kitten(fur, x, y, z, rotY, pose, s=1){
    const k = new THREE.Group(); k.position.set(x,y,z); k.rotation.y = rotY; k.scale.setScalar(s); room.add(k);
    const fm = mat(fur.body), em = mat(fur.ear);
    const sleeping = pose === 'sleep';
    const body = sph(0.16,fm,0,0.14,0,1,sleeping?0.7:0.85,1.35,k);
    const headG = new THREE.Group(); headG.position.set(0, sleeping?0.17:0.3, sleeping?0.17:0.18); k.add(headG);
    sph(0.13,fm,0,0,0,1.1,1,1,headG);
    [-1,1].forEach(e=>{
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.05,0.09,12), em);
      ear.position.set(0.07*e,0.12,0); ear.rotation.z = -0.3*e; headG.add(ear);
      const eye = sleeping
        ? new THREE.Mesh(new THREE.TorusGeometry(0.022,0.007,6,12,Math.PI), P.eye)
        : sph(0.022,P.eye,0,0,0,1,1.3,0.6,headG);
      eye.position.set(0.05*e,0.01,0.12); if(sleeping){ eye.rotation.z = Math.PI; headG.add(eye); }
    });
    sph(0.018,mat(0xf4a6b8),0,-0.03,0.13,1,0.8,0.6,headG);
    const tailG = new THREE.Group(); tailG.position.set(0,0.16,-0.2); k.add(tailG);
    const tail = new THREE.Mesh(new THREE.TorusGeometry(0.12,0.025,8,16,Math.PI*0.9), fm);
    tail.rotation.y = Math.PI/2; tail.position.y = 0.08; tailG.add(tail);
    if(!sleeping){ [-1,1].forEach(e=> sph(0.04,fm,0.08*e,0.03,0.17,1,0.8,1.2,k)); }
    const data = {g:k, head:headG, tail:tailG, body, pose, base:new THREE.Vector3(x,y,z), rotY, jump:0, phase:Math.random()*6};
    kittens.push(data); return data;
  }
  // cat tree near the window
  cyl(0.06,0.06,1.5,M.pot,2.3,0.75,-1.3);
  cyl(0.38,0.38,0.06,M.rug,2.3,0.03,-1.3,room,24);
  cyl(0.3,0.3,0.05,M.rug,2.3,0.8,-1.3,room,24);
  cyl(0.28,0.28,0.05,M.rug,2.3,1.5,-1.3,room,24);
  // cat bed on the floor
  const catBed = new THREE.Mesh(new THREE.TorusGeometry(0.3,0.09,10,28), M.book1); catBed.rotation.x = Math.PI/2; catBed.position.set(0.9,0.09,1.4); room.add(catBed);
  cyl(0.3,0.3,0.04,M.pot,0.9,0.03,1.4,room,24);

  kitten(furs[0], 2.3, 1.53, -1.3, 0.6, 'sit');          // top of cat tree
  kitten(furs[1], 0.9, 0.05, 1.4, 1.2, 'sleep');         // in the cat bed
  kitten(furs[2], -2.1, 1.04, 1.12, 1.4, 'sit', 0.85);  // on the desk by the drink
  kitten(furs[3], -1.3, 2.33, -2.85, 0.2, 'sit', 0.8);   // on the shelf
  const walker = kitten(furs[4], 0, 0.04, 0.6, 0, 'walk');  // wandering on the rug
  kitten(furs[5], -2.5, 1.1, 1.8, 1.3, 'sleep', 0.9);    // napping on the PC
  kitten(furs[1], 1.8, 0.04, 0.5, -0.8, 'sit', 0.9);     // on the floor

  // drink on desk
  cyl(0.06,0.05,0.16,P.cup,-2.05,1.12,0.85);

  // ---------- lights ----------
  const hemi = new THREE.HemisphereLight(0xcfc4ff, 0x20162c, 0.45); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 0.35);
  key.position.set(4,7,5); key.castShadow = true; key.shadow.mapSize.set(1024,1024);
  key.shadow.camera.left = -4; key.shadow.camera.right = 4; key.shadow.camera.top = 4; key.shadow.camera.bottom = -4;
  scene.add(key);

  // ---------- screens ----------
  const playing = true;
  function drawScreens(t){
    // left: a tactical-shooter HUD (Valorant-flavored, generic shapes only, no game assets)
    const a = screens[0], ctx = a.ctx, W = a.c.width, H = a.c.height;
    ctx.imageSmoothingEnabled = false;

    // map background: dark slate with the signature orange crates drifting past
    const bg = ctx.createLinearGradient(0,0,0,H); bg.addColorStop(0,'#232c35'); bg.addColorStop(1,'#141b22');
    ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);
    ctx.fillStyle = 'rgba(255,255,255,.03)';
    for(let x=0;x<W;x+=18) ctx.fillRect(x,0,1,H);
    const crateX = ((playing ? t*10 : 0) % (W+60)) - 60;
    [[crateX,88,34,28],[crateX+150,98,24,20]].forEach(([cx,cy,cw,ch])=>{
      ctx.fillStyle = '#b4582f'; ctx.fillRect(cx,cy,cw,ch);
      ctx.fillStyle = '#8f4423'; ctx.fillRect(cx,cy,cw,5);
      ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.strokeRect(cx+0.5,cy+0.5,cw-1,ch-1);
    });

    // round timer pill, top center
    ctx.fillStyle = '#0f1923'; ctx.fillRect(W/2-20,4,40,14);
    ctx.fillStyle = '#ece8e1'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
    ctx.fillText('1:' + String(23 - Math.floor((playing?t*3:0))%24).padStart(2,'0'), W/2, 14);

    // minimap chip, top left
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(15,25,35,.85)'; ctx.fillRect(6,6,30,24);
    ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.strokeRect(6.5,6.5,29,23);
    ctx.fillStyle = '#ff4655'; ctx.fillRect(16,16,3,3);

    // gap crosshair, dead center
    ctx.fillStyle = '#eafff2';
    const cxp = W/2, cyp = H/2 - 4;
    ctx.fillRect(cxp-1,cyp-7,2,4); ctx.fillRect(cxp-1,cyp+3,2,4);
    ctx.fillRect(cxp-7,cyp-1,4,2); ctx.fillRect(cxp+3,cyp-1,4,2);

    // HP + shield, bottom left
    ctx.fillStyle = '#ece8e1'; ctx.font = 'bold 13px monospace'; ctx.fillText('100', 8, H-9);
    ctx.fillStyle = 'rgba(127,212,255,.8)'; ctx.fillRect(40,H-20,12,9);
    ctx.fillStyle = '#7fd4ff'; ctx.font = 'bold 10px monospace'; ctx.fillText('50', 42, H-9);

    // ability row, bottom center: C / Q / E / X, ult glowing
    const slot = 18, abilities = ['C','Q','E','X'], sx0 = W/2 - (slot*4+6*3)/2, sy = H-22;
    abilities.forEach((label,i)=>{
      const x = sx0 + i*(slot+6), ult = i===3;
      ctx.fillStyle = ult ? 'rgba(255,70,85,.25)' : 'rgba(255,255,255,.08)'; ctx.fillRect(x,sy,slot,slot);
      ctx.strokeStyle = ult ? '#ff4655' : 'rgba(255,255,255,.35)'; ctx.lineWidth = ult ? 1.5 : 1;
      ctx.strokeRect(x+0.5,sy+0.5,slot-1,slot-1);
      ctx.fillStyle = ult ? '#ff4655' : '#ece8e1'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
      ctx.fillText(label, x+slot/2, sy+slot-5);
    });

    // ammo + credits, bottom right
    const ammo = Math.max(0, 24 - Math.floor((playing?t*1.3:0))%25);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ece8e1'; ctx.font = 'bold 14px monospace'; ctx.fillText(String(ammo).padStart(2,'0')+' / 50', W-8, H-17);
    ctx.fillStyle = '#9ddc8f'; ctx.font = 'bold 10px monospace'; ctx.fillText('$ 3900', W-8, H-6);
    ctx.textAlign = 'left';
    a.tex.needsUpdate = true;

    const b = screens[1], c2 = b.ctx, W2 = b.c.width, H2 = b.c.height;
    c2.fillStyle = '#120d1c'; c2.fillRect(0,0,W2,H2);
    c2.fillStyle = '#c1a1cf'; c2.fillRect(0,0,W2,18);
    c2.fillStyle = '#120d1c'; c2.font = 'bold 11px monospace'; c2.fillText('LIVE  CHAT', 8, 13);
    const msgs = ['gg!','wkwkwk','ace!!','lanjut bos','woof woof','hype!!','clutch!!'];
    const base = Math.floor(t*1.2);
    c2.font = '11px monospace';
    const rows = Math.floor((H2-60)/14);
    for(let i=0;i<rows;i++){
      const m = msgs[(base+i)%msgs.length];
      c2.fillStyle = ['#7be0b4','#f6c66b','#ff8fb1','#9fd0ff'][(base+i)%4];
      c2.fillText('user' + ((base+i)*7%90+10) + ':', 8, 34+i*14);
      c2.fillStyle = '#ede6ec'; c2.fillText(m, 84, 34+i*14);
    }
    c2.strokeStyle = '#7be0b4'; c2.lineWidth = 2; c2.beginPath();
    for(let x=0;x<W2;x+=4){ const y = H2-18 + Math.sin(x*0.12 + t*8)*(playing?7:1)*Math.sin(x*0.03+t); x?c2.lineTo(x,y):c2.moveTo(x,y); }
    c2.stroke();
    b.tex.needsUpdate = true;
  }

  // ---------- interaction ----------
  let yaw = 0, yawVel = 0, pitch = 0, dragging = false, lastX = 0, lastY = 0, moved = 0;
  const actions = {wave:0, cheer:0};
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();

  stage.addEventListener('pointerdown', e=>{ dragging = true; lastX = e.clientX; lastY = e.clientY; moved = 0; stage.setPointerCapture(e.pointerId); });
  stage.addEventListener('pointermove', e=>{
    if(!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY; moved += Math.abs(dx)+Math.abs(dy);
    yaw = Math.max(-0.9, Math.min(0.9, yaw + dx*0.006)); yawVel = dx*0.006;
    pitch = Math.max(-0.25, Math.min(0.3, pitch + dy*0.003));
  });
  stage.addEventListener('pointerup', e=>{
    dragging = false;
    if(moved < 6){
      const r = stage.getBoundingClientRect();
      pointer.set(((e.clientX-r.left)/r.width)*2-1, -((e.clientY-r.top)/r.height)*2+1);
      raycaster.setFromCamera(pointer, camera);
      const hitKitten = kittens.find(k=> raycaster.intersectObject(k.g, true).length);
      if(hitKitten){ hitKitten.jump = 1; say(['Meow!','Nyaa~','Mrrp!','Miaw!'][Math.floor(Math.random()*4)], hitKitten.g, 0.55); }
      else if(raycaster.intersectObject(person, true).length) cheer();
      else if(raycaster.intersectObject(posterG, true).length) openPoster(POSTER_SRC);
      else if(raycaster.intersectObject(poster2G, true).length) openPoster(POSTER2_SRC);
      else if(raycaster.intersectObject(neon, true).length) cycleRgb();
    }
  });
  stage.addEventListener('pointercancel', ()=>{ dragging = false; });

  function openPoster(src){ lbImg.src = src; lightbox.classList.add('on'); }
  const closeBox = ()=> lightbox.classList.remove('on');
  const onKey = e=>{ if(e.key==='Escape') closeBox(); };
  lightbox.addEventListener('click', closeBox);
  document.addEventListener('keydown', onKey);

  let bubbleTimer;
  let bubbleAnchor = null, bubbleOffset = 1.4;
  function say(text, anchor, offset){
    bubbleAnchor = anchor || person; bubbleOffset = offset != null ? offset : 1.4;
    bubble.textContent = text; bubble.classList.add('on');
    clearTimeout(bubbleTimer); bubbleTimer = setTimeout(()=>bubble.classList.remove('on'), 1400);
  }
  const lines = ['Awoo Suakatachi', 'Valo kuy!', 'Lagi push rank nih', 'Bentar, satu ronde lagi', 'GG!', 'Mau mabar?'];
  let li = 0;
  function cheer(){ actions.cheer = 1; say(lines[li++ % lines.length]); }

  const rgbSet = [0x8a5cff, 0x7be0b4, 0xff6fa8, 0x5cc8ff, 0xf6c66b];
  let rgbIdx = 0;
  function cycleRgb(){
    rgbIdx = (rgbIdx+1) % rgbSet.length;
    const c = rgbSet[rgbIdx];
    ledMat.color.setHex(c); ledLight1.color.setHex(c); ledLight2.color.setHex(c); pcLight.color.setHex(c);
  }

  const night = true;
  function applyMode(){
    if(night){
      scene.background.setHex(0x0e0915); hemi.intensity = 0.45; key.intensity = 0.35;
      skyMat.color.setHex(0x1b2550); stars.forEach(s=>s.visible = true); moon.visible = true;
      lampLight.intensity = 0.9; ledLight1.intensity = ledLight2.intensity = 0.9; neonLight.intensity = 0.8;
    } else {
      scene.background.setHex(0x221a30); hemi.intensity = 0.95; key.intensity = 0.8;
      skyMat.color.setHex(0x9fd0ff); stars.forEach(s=>s.visible = false); moon.visible = false;
      lampLight.intensity = 0; ledLight1.intensity = ledLight2.intensity = 0.35; neonLight.intensity = 0.3;
    }
  }
  applyMode();

  const onWave = ()=>{ actions.wave = 1; say('awwoo suakatachi'); };
  btnWave.addEventListener('click', onWave);
  btnRgb.addEventListener('click', cycleRgb);

  // ---------- resize ----------
  function resize(){
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w/h;
    camera.fov = w/h < 1.45 ? Math.min(75, 2*Math.atan(0.46/(w/h))*180/Math.PI) : 37;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize); ro.observe(stage); resize();

  // ---------- loop ----------
  const clock = new THREE.Clock();
  let blinkT = 2;
  const tmp = new THREE.Vector3();
  function tick(){
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;

    if(!dragging){ yaw += yawVel; yawVel *= 0.9; yaw = Math.max(-0.9, Math.min(0.9, yaw)); }
    const dist = 11.5, baseYaw = Math.PI/4 + 0.15 + yaw, basePitch = 0.42 + pitch;
    camera.position.set(
      camTarget.x + Math.sin(baseYaw)*Math.cos(basePitch)*dist,
      camTarget.y + Math.sin(basePitch)*dist,
      camTarget.z + Math.cos(baseYaw)*Math.cos(basePitch)*dist
    );
    camera.lookAt(camTarget);

    // typing / gaming idle
    const typing = playing ? 1 : 0.15;
    armL.hand.position.y = -0.22 + Math.max(0, Math.sin(t*14*spd))*0.03*typing;
    armR.hand.position.y = -0.22 + Math.max(0, Math.sin(t*11*spd+1))*0.03*typing;
    headPivot.rotation.x = Math.sin(t*4*spd)*0.035*typing;
    headPivot.rotation.z = 0;
    torso.scale.y = 1.15 + Math.sin(t*2*spd)*0.015;

    // wave with right arm
    if(actions.wave > 0){ actions.wave = Math.max(0, actions.wave - dt*0.6); }
    const w = actions.wave;
    if(w > 0){
      const up = Math.sin(Math.min(1, Math.min((1-w)*4, w*4)) * Math.PI/2);
      armR.pivot.rotation.x = -2.0*up;
      armR.pivot.rotation.z = Math.sin(t*14)*0.3*up;
      headPivot.rotation.y = 0.5*up;
    } else { armR.pivot.rotation.x = 0; armR.pivot.rotation.z = 0; }

    // cheer: both arms up, little bounce, head turns to camera
    if(actions.cheer > 0){ actions.cheer = Math.max(0, actions.cheer - dt*0.9); }
    const ch = Math.sin(actions.cheer*Math.PI);
    if(actions.cheer > 0){
      armL.pivot.rotation.x = -2.3*ch; armR.pivot.rotation.x = -2.3*ch;
      headPivot.rotation.y = 0.6*ch;
    } else if(w === 0){ armL.pivot.rotation.x = 0; headPivot.rotation.y = 0; }
    person.position.y = 0.66 + Math.abs(Math.sin(actions.cheer*Math.PI*3))*0.08*ch;

    // blink
    blinkT -= dt;
    let ey = 1.3;
    if(blinkT < 0){ ey = 0.15; if(blinkT < -0.12) blinkT = 2 + Math.random()*3; }
    if(ch > 0.3) ey = 0.3;
    eyes.forEach(g=>{ g.children[0].scale.y = ey; g.children[1].visible = ey > 0.5; });

    // PC fans + neon flicker
    fans.forEach((f,i)=> f.rotation.x += dt*(playing?6:2)*(i%2?1:-1));
    neonMat.color.setHSL(0.78, 0.45, 0.72 + (night ? Math.sin(t*3)*0.04 : -0.1));
    stars.forEach((s,i)=>{ s.scale.setScalar(0.7 + Math.abs(Math.sin(t*1.5 + i))*0.5); });

    kittens.forEach(k=>{
      const ph = t + k.phase;
      k.tail.rotation.y = Math.sin(ph*(k.pose==='sleep'?1.2:3)*spd)*0.5;
      if(k.pose === 'sleep'){ k.body.scale.y = 0.7 + Math.sin(ph*1.6*spd)*0.04; }
      else { k.head.rotation.z = Math.sin(ph*0.8*spd)*0.15; k.head.rotation.y = Math.sin(ph*0.5*spd)*0.3; }
      let hopY = 0;
      if(k.jump > 0){ k.jump = Math.max(0, k.jump - dt*2.2); hopY = Math.sin((1-k.jump)*Math.PI)*0.25; }
      if(k === walker){
        const a = t*0.35*spd;
        k.g.position.set(-0.6 + Math.cos(a)*1.05, 0.04 + Math.abs(Math.sin(t*7*spd))*0.02 + hopY, -0.3 + Math.sin(a)*1.05);
        k.g.rotation.y = -a;
      } else {
        k.g.position.y = k.base.y + hopY;
      }
    });

    drawScreens(t);

    // speech bubble follows the person's head
    tmp.set(0,bubbleOffset,0); (bubbleAnchor || person).localToWorld(tmp); tmp.project(camera);
    bubble.style.left = ((tmp.x*0.5+0.5)*stage.clientWidth) + 'px';
    bubble.style.top = ((-tmp.y*0.5+0.5)*stage.clientHeight) + 'px';

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(tick);
  }
  let rafId = 0;
  tick();

  return function dispose(){
    cancelAnimationFrame(rafId);
    ro.disconnect();
    document.removeEventListener('keydown', onKey);
    lightbox.removeEventListener('click', closeBox);
    btnWave.removeEventListener('click', onWave);
    btnRgb.removeEventListener('click', cycleRgb);
    scene.traverse(o=>{ if(o.geometry) o.geometry.dispose(); if(o.material){ (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{ if(m.map) m.map.dispose(); m.dispose(); }); } });
    renderer.dispose();
    renderer.domElement.remove();
  };
}
