// Three.js diorama (r128 API). Call createRoom(refs) from a client effect; it returns
// { setPlaying(on), dispose() }.
import * as THREE from 'three';

export function createRoom(refs){
  const { stage, bubble, lightbox, lbImg, btnWave } = refs;
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
  const jettoAim = new THREE.Vector3(-1.5, 1.35, -0.25), aim = new THREE.Vector3();

  const ramp = new Uint8Array([70,70,70,255, 150,150,150,255, 255,255,255,255]);
  const gradientMap = new THREE.DataTexture(ramp, 3, 1, THREE.RGBAFormat);
  gradientMap.minFilter = gradientMap.magFilter = THREE.NearestFilter; gradientMap.needsUpdate = true;
  const mat = (c) => new THREE.MeshToonMaterial({color:c, gradientMap});
  const glow = (c) => new THREE.MeshBasicMaterial({color:c});
  // a dimmer toon ramp for pale, top-lit things (Jetto's hair and ears): several lights hit them
  // from above and the normal ramp burns the lavender out to white
  const softRamp = new Uint8Array([60,60,60,255, 120,120,120,255, 180,180,180,255]);
  const softGradient = new THREE.DataTexture(softRamp, 3, 1, THREE.RGBAFormat);
  softGradient.minFilter = softGradient.magFilter = THREE.NearestFilter; softGradient.needsUpdate = true;
  const matSoft = (c) => new THREE.MeshToonMaterial({color:c, gradientMap:softGradient});

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
  const V3 = (x,y,z) => new THREE.Vector3(x,y,z);
  // a tube along a curve whose radius r(u) changes from base (u=0) to tip (u=1): tails, mostly
  function taper(points, r, m, parent, seg=24, RS=10){
    const curve = new THREE.CatmullRomCurve3(points);
    const geo = new THREE.TubeGeometry(curve, seg, 1, RS, false), pos = geo.attributes.position, q = new THREE.Vector3();
    for(let i=0;i<pos.count;i++){
      const u = Math.floor(i/(RS+1))/seg, p = curve.getPointAt(u);
      q.set(pos.getX(i),pos.getY(i),pos.getZ(i)).sub(p).multiplyScalar(r(u)).add(p);
      pos.setXYZ(i,q.x,q.y,q.z);
    }
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, m); mesh.castShadow = true; parent.add(mesh); return mesh;
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
  // ---------- Cinnamoroll line art (drawn here on canvases; no official artwork is used) ----------
  const INK = '#8a766e';
  const RUG_TURN = Math.PI - 0.75; // spins the rug so its lettering reads from the default camera
  function ell(c,x,y,rx,ry,rot,fill,lw=7){ c.beginPath(); c.ellipse(x,y,rx,ry,rot,0,Math.PI*2); if(fill){ c.fillStyle = fill; c.fill(); } if(lw){ c.lineWidth = lw; c.strokeStyle = INK; c.stroke(); } }
  function teddy(c,x,y,s,fur){
    c.save(); c.translate(x,y); c.scale(s,s);
    ell(c,0,70,48,58,0,fur); ell(c,-42,-38,16,16,0,fur); ell(c,42,-38,16,16,0,fur); ell(c,0,0,55,48,0,fur);
    c.fillStyle = INK; [[-18,-6],[18,-6]].forEach(([a,b])=>{ c.beginPath(); c.arc(a,b,5,0,Math.PI*2); c.fill(); });
    ell(c,0,12,12,8,0,null,4);
    c.fillStyle = '#f2a0b0'; c.beginPath(); c.moveTo(0,52); c.lineTo(-24,38); c.lineTo(-24,66); c.closePath(); c.moveTo(0,52); c.lineTo(24,38); c.lineTo(24,66); c.closePath(); c.fill();
    c.restore();
  }
  // asleep on its tummy with a yellow bear under its chin (for the rug)
  function cinnaSleeping(c,x,y,s){
    c.save(); c.translate(x,y); c.scale(s,s); c.lineCap = c.lineJoin = 'round';
    ell(c,-60,40,190,95,0,'#fff');                                           // body
    ell(c,-230,-10,52,48,0,'#fff');                                          // tail
    c.beginPath(); for(let a=0;a<Math.PI*3;a+=0.08){ const r = 3 + a*4.6; const px = -230+Math.cos(a)*r, py = -10+Math.sin(a)*r; a ? c.lineTo(px,py) : c.moveTo(px,py); } c.lineWidth = 7; c.strokeStyle = INK; c.stroke();
    ell(c,-10,10,165,72,0.5,'#fff'); ell(c,190,10,150,62,-0.35,'#fff');      // ears draped over
    teddy(c,100,95,0.9,'#f3dc6a');
    ell(c,100,-20,140,105,0,'#fff');                                         // head
    c.lineWidth = 6; c.strokeStyle = INK;
    [[60,-10],[140,-10]].forEach(([a,b])=>{ c.beginPath(); c.arc(a,b,14,0.2,Math.PI-0.2); c.stroke(); }); // closed eyes
    [[40,25],[165,22]].forEach(([a,b])=> ell(c,a,b,22,13,0,'rgba(244,160,176,.8)',0));
    c.restore();
  }

  // the round rug: a fluffy light-blue Cinnamoroll rug with clouds, stars and little bears
  const rugCanvas = document.createElement('canvas'); rugCanvas.width = rugCanvas.height = 1024;
  {
    const c = rugCanvas.getContext('2d');
    let seed = 7; const rnd = ()=> (seed = (seed*16807) % 2147483647) / 2147483647;
    c.fillStyle = '#9fd5ef'; c.fillRect(0,0,1024,1024);
    for(let i=0;i<9000;i++){ c.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,.18)' : 'rgba(60,120,160,.10)'; c.fillRect(rnd()*1024, rnd()*1024, 3, 3); } // fluffy pile
    c.lineWidth = 26; c.strokeStyle = '#86c3e2'; c.beginPath(); c.arc(512,512,498,0,Math.PI*2); c.stroke();
    const cloud = (x,y,s)=>{ c.save(); c.translate(x,y); c.scale(s,s); c.beginPath(); c.arc(-28,6,22,Math.PI*0.5,Math.PI*1.5); c.arc(0,-10,28,Math.PI,0); c.arc(30,6,20,Math.PI*1.5,Math.PI*0.5); c.closePath(); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 5; c.strokeStyle = INK; c.stroke(); c.restore(); };
    const star = (x,y,r)=>{ c.beginPath(); for(let i=0;i<10;i++){ const a = -Math.PI/2 + i*Math.PI/5, rr = i%2 ? r*0.45 : r; c.lineTo(x+Math.cos(a)*rr, y+Math.sin(a)*rr); } c.closePath(); c.fillStyle = '#f6d65a'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#c9a43a'; c.stroke(); };
    [[300,180,1.2],[760,250,1],[190,560,1],[850,560,1.1],[520,250,0.9]].forEach(a=> cloud(...a));
    [[210,330],[420,150],[620,180],[880,400],[150,720],[860,760],[640,710],[380,710]].forEach(([x,y])=> star(x,y,18));
    [[180,430,0.5],[820,180,0.45],[860,660,0.5],[230,800,0.45]].forEach(([x,y,s])=> teddy(c,x,y,s,'#f3dc6a'));
    cinnaSleeping(c,520,560,1.05);
    c.font = 'italic 700 92px Georgia, \"Times New Roman\", serif'; c.textAlign = 'center';
    c.lineWidth = 10; c.strokeStyle = '#fff'; c.strokeText('Cinnamoroll',512,850); // on the near side, so Jetto's chair never hides it
    c.fillStyle = '#9a6a55'; c.fillText('Cinnamoroll',512,850);
  }
  const rugTex = new THREE.CanvasTexture(rugCanvas); rugTex.encoding = THREE.sRGBEncoding;
  rugTex.anisotropy = 4;
  // The owner's Cinnamoroll picture replaces the drawn rug once it loads (the drawing stays if the
  // file is missing): a 1024px square crop, laid across the circle with a darker blue rim on top.
  // Canvas top is the far side of the rug, so the picture stands upright for the default camera.
  {
    const img = new Image();
    img.onload = ()=>{
      const c = rugCanvas.getContext('2d');
      // a touch smaller than the rug so the ear tips clear the rim; the picture's own glittery
      // blue fills the thin slivers left at the edges
      c.fillStyle = '#93d2f2'; c.fillRect(0,0,1024,1024);
      c.imageSmoothingQuality = 'high';
      const s = 980; c.drawImage(img, 512 - s/2, 512 - s/2, s, s);
      c.lineWidth = 26; c.strokeStyle = '#6fb9e3'; c.beginPath(); c.arc(512,512,498,0,Math.PI*2); c.stroke();
      rugTex.needsUpdate = true;
    };
    img.src = '/kamar/rug-cinnamoroll.jpg';
  }
  const rugTop = new THREE.MeshToonMaterial({map:rugTex, gradientMap}), rugSide = mat(0x86c3e2);
  const rug = new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.5,0.03,64), [rugSide, rugTop, rugSide]);
  rug.position.set(-0.6,0.015,-0.3); rug.rotation.y = RUG_TURN; rug.receiveShadow = true; room.add(rug);

  // Cinnamoroll pictures the owner picked for the walls. The cut-out PNGs are stuck on like
  // die-cut stickers (transparent parts show the wall), the one with its own blue ground hangs in a
  // white frame. All of them open in the lightbox when clicked, like the posters.
  const wallPics = [];
  function wallPic(src, w, h, x, y, z, rotY, framed){
    const g = new THREE.Group(); g.position.set(x,y,z); g.rotation.y = rotY; room.add(g);
    if(framed){ const f = new THREE.Mesh(new THREE.BoxGeometry(w+0.07,h+0.07,0.04), M.white); f.castShadow = true; g.add(f); }
    const tex = new THREE.TextureLoader().load(src); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 4;
    const art = new THREE.Mesh(new THREE.PlaneGeometry(w,h),
      new THREE.MeshBasicMaterial({map:tex, transparent:!framed, alphaTest:framed ? 0 : 0.05, polygonOffset:true, polygonOffsetFactor:-2}));
    art.position.z = framed ? 0.025 : 0; g.add(art);
    wallPics.push({g, src}); return g;
  }
  const BACK = -2.985, LEFT = -2.985;
  wallPic('/kamar/cinna-outline.png', 1.25, 0.70, 1.45, 3.45, BACK, 0);              // above the window, 1000 x 558
  wallPic('/kamar/cinna-crown.png',   0.66, 0.45, 2.6, 3.05, BACK, 0);               // right of the window, 618 x 421
  wallPic('/kamar/cinna-teddy.png',   0.64, 0.40, -1.3, 3.6, BACK + 0.02, 0, true);  // framed, above the shelves, 1092 x 686
  wallPic('/kamar/cinna-stand.png',   0.90, 0.43, LEFT, 3.38, 1.25, Math.PI/2);      // left wall, above the character sheet, 526 x 249

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

  const POSTER2_SRC = '/kamar/poster-meadow.jpg'; // 1600 x 1094
  const poster2G = new THREE.Group(); poster2G.position.set(-0.2,1.62,-2.97); room.add(poster2G);
  const p2Frame = new THREE.Mesh(new THREE.BoxGeometry(1.2,0.846,0.05), M.trim); p2Frame.castShadow = true; poster2G.add(p2Frame);
  const poster2Tex = new THREE.TextureLoader().load(POSTER2_SRC); poster2Tex.encoding = THREE.sRGBEncoding;
  const p2Art = new THREE.Mesh(new THREE.PlaneGeometry(1.12,0.766), new THREE.MeshBasicMaterial({map:poster2Tex}));
  p2Art.position.z = 0.03; poster2G.add(p2Art);

  // small framed Cinnamoroll polaroid on the left wall, above the desk (the owner's picture);
  // clicking it opens a bigger copy in the lightbox
  const CINNA_SRC = '/kamar/cinna-polaroid.jpg';
  const cinnaTex = new THREE.TextureLoader().load(CINNA_SRC); cinnaTex.encoding = THREE.sRGBEncoding; cinnaTex.anisotropy = 4;
  const cinnaG = new THREE.Group(); cinnaG.position.set(-2.97,2.75,-2.0); cinnaG.rotation.y = Math.PI/2; room.add(cinnaG);
  const cFrame = new THREE.Mesh(new THREE.BoxGeometry(0.7,0.7,0.05), M.white); cFrame.castShadow = true; cinnaG.add(cFrame);
  const cArt = new THREE.Mesh(new THREE.PlaneGeometry(0.62,0.62), new THREE.MeshBasicMaterial({map:cinnaTex}));
  cArt.position.z = 0.03; cinnaG.add(cArt);

  // Cipet, as a die-cut sticker on the left wall above the monitors, between the Cinnamoroll doodle
  // and the character sheet. Its PNG is cut out, so the transparent parts show the wall; clicking it
  // opens the full picture in the lightbox like the posters.
  const CIPET_SRC = '/kamar/cipet.png';
  const cipetTex = new THREE.TextureLoader().load(CIPET_SRC); cipetTex.encoding = THREE.sRGBEncoding;
  const cipet = new THREE.Mesh(new THREE.PlaneGeometry(0.82,0.886), // 992 x 1072 source
    new THREE.MeshBasicMaterial({map:cipetTex, transparent:true, alphaTest:0.05}));
  cipet.position.set(-2.985,2.55,-0.25); cipet.rotation.y = Math.PI/2; room.add(cipet);

  // six faint purple paw prints (the site's paw icon) scattered over both walls at 35% opacity, in
  // mixed sizes and tilts so they read as random, each placed in a gap clear of the furniture and
  // frames. They pulse softly at night, where the neon paw sign used to be.
  const pawTex = new THREE.TextureLoader().load('/kamar/apple-touch-icon.png'); pawTex.encoding = THREE.sRGBEncoding;
  const neonMat = new THREE.MeshBasicMaterial({map:pawTex, transparent:true, opacity:0.35, alphaTest:0.05, depthWrite:false, polygonOffset:true, polygonOffsetFactor:-2});
  // [wall, across, height, size, tilt]: across is x on the back wall, z on the left wall
  [['back', 0.12, 2.75, 0.42, 0.3], ['back', 2.75, 1.5, 0.2, -0.45], ['back', -2.65, 2.55, 0.3, 0.55],
   ['back', 0.55, 0.85, 0.16, -0.2], ['left', 2.6, 2.35, 0.36, 0.35], ['left', -2.55, 1.75, 0.22, -0.3]]
    .forEach(([wall, a, y, s, tilt])=>{
      const paw = new THREE.Mesh(new THREE.PlaneGeometry(s,s), neonMat);
      if(wall === 'back') paw.position.set(a, y, -2.985);
      else { paw.position.set(-2.985, y, a); paw.rotation.y = Math.PI/2; }
      paw.rotateZ(tilt); room.add(paw);
    });
  const neonLight = new THREE.PointLight(0xc1a1cf, 0.8, 4); neonLight.position.set(0.1,2.7,-2.6); room.add(neonLight);

  // LED strips along the top of both walls
  // LED strips, PC fans and their glow share one blue (owner pick, no longer cycled)
  const LED = 0x4fb0ff;
  const ledMat = new THREE.MeshBasicMaterial({color:LED});
  const ledBack = new THREE.Mesh(new THREE.BoxGeometry(6,0.05,0.05), ledMat); ledBack.position.set(0,3.92,-2.98); room.add(ledBack);
  const ledLeft = new THREE.Mesh(new THREE.BoxGeometry(0.05,0.05,6), ledMat); ledLeft.position.set(-2.98,3.92,0); room.add(ledLeft);
  const ledLight1 = new THREE.PointLight(LED, 0.9, 6); ledLight1.position.set(0,3.6,-2.5); room.add(ledLight1);
  const ledLight2 = new THREE.PointLight(LED, 0.9, 6); ledLight2.position.set(-2.5,3.6,0); room.add(ledLight2);

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

  // monitors: the landscape one plays a looping clip of her Valorant stream, the portrait one is a canvas
  function makeScreen(w,h){
    const c = document.createElement('canvas'); c.width = 256; c.height = Math.round(256*h/w);
    const tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding;
    return {c, ctx:c.getContext('2d'), tex};
  }
  const screens = [];
  function monitor(z, rotY, w, h, cy, map){
    const g = new THREE.Group(); g.position.set(-2.72,1.04,z); g.rotation.y = rotY; room.add(g);
    box(0.06,cy-h/2+0.05,0.06,M.metal,0,(cy-h/2+0.05)/2,0,g);
    box(0.3,0.03,0.24,M.metal,0,0.015,0,g);
    box(0.06,h+0.06,w+0.06,M.dark,0,cy,0,g);
    const s = map ? null : makeScreen(w,h);
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(w,h), new THREE.MeshBasicMaterial({map: map || s.tex}));
    plane.position.set(0.035,cy,0); plane.rotation.y = Math.PI/2; g.add(plane);
    if(s) screens.push(s); return g;
  }
  // muted + playsInline so browsers (iOS included) let it autoplay
  const gameVideo = document.createElement('video');
  Object.assign(gameVideo, {src:'/kamar/gameplay.webm', muted:true, loop:true, playsInline:true, autoplay:true});
  gameVideo.setAttribute('muted',''); gameVideo.setAttribute('playsinline','');
  // if the browser still blocks autoplay, start it on the visitor's first tap or click
  const kickVideo = ()=>{ if(gameVideo.paused) gameVideo.play().catch(()=>{}); };
  gameVideo.play().catch(()=> window.addEventListener('pointerdown', kickVideo, {once:true}));
  const gameTex = new THREE.VideoTexture(gameVideo); gameTex.encoding = THREE.sRGBEncoding;
  // both are angled with their outer edges toward the chair, wrapping round her like a real setup
  monitor(-0.75, -0.2, 1.15, 0.65, 0.68, gameTex).position.y += 0.09;   // landscape, right side, on riser
  monitor(0.42, 0.25, 0.52, 0.92, 0.78);   // portrait, left side
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
  // Cinnamoroll gamepad on the desk by the cream pup: white shell with cloud-blue grips, sticks,
  // d-pad and ABXY, pink face buttons, rainbow-lit stick rings and Cinnamoroll's face in the middle.
  // Local +z is the player's side (grips); it lies turned towards her chair, between the pup and
  // the drink, scaled up a little to match the room's chunky chibi props.
  {
    const pad = new THREE.Group(); pad.position.set(-2.3,1.04,0.62); pad.rotation.y = Math.PI/2 - 0.35; pad.scale.setScalar(1.35); room.add(pad);
    const shell = mat(0xf4f4f8), sky = mat(0x3f9fe2), pink = mat(0xf0709f); // deeper than the photo: the toon light washes pale colours out
    sph(0.1,shell,0,0.03,-0.005,1.3,0.36,0.72,pad);                                   // body
    [-1,1].forEach(s=>{
      sph(0.05,sky,0.088*s,0.022,0.06,0.9,0.62,1.45,pad).rotation.y = 0.45*s;        // grips
      box(0.07,0.02,0.03,sky,0.075*s,0.035,-0.072,pad);                               // shoulder buttons
    });
    // sticks with glowing rings: left stick up-left, right stick down-centre like the photo
    [[-0.055,-0.018],[0.028,0.03]].forEach(([x,z])=>{
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.024,0.005,6,20), glow(0xffb3e0)); ring.rotation.x = Math.PI/2; ring.position.set(x,0.062,z); pad.add(ring);
      cyl(0.019,0.022,0.022,sky,x,0.072,z,pad,16);
    });
    // d-pad
    box(0.042,0.01,0.013,sky,-0.028,0.062,0.034,pad); box(0.013,0.01,0.042,sky,-0.028,0.062,0.034,pad);
    // ABXY in a diamond on the right
    [[0.072,-0.042],[0.072,0.006],[0.05,-0.018],[0.094,-0.018]].forEach(([x,z])=> sph(0.011,sky,x,0.064,z,1,0.6,1,pad));
    // small pink buttons either side of the face, and the home button below the sticks
    [[-0.022,-0.05],[0.022,-0.05],[-0.026,-0.032],[0.026,-0.032]].forEach(([x,z])=> sph(0.006,pink,x,0.064,z,1,0.6,1,pad));
    box(0.016,0.006,0.008,pink,0,0.064,0.048,pad);
    // Cinnamoroll's face, painted between the pink buttons
    const fc = document.createElement('canvas'); fc.width = 128; fc.height = 80;
    const f = fc.getContext('2d'); f.lineWidth = 5; f.strokeStyle = '#4f9fd8'; f.fillStyle = '#ffffff'; f.lineJoin = f.lineCap = 'round';
    f.beginPath(); f.ellipse(30,40,26,13,-0.25,0,Math.PI*2); f.fill(); f.stroke();                // ears
    f.beginPath(); f.ellipse(98,40,26,13,0.25,0,Math.PI*2); f.fill(); f.stroke();
    f.beginPath(); f.ellipse(64,42,30,24,0,0,Math.PI*2); f.fill(); f.stroke();                    // head
    f.fillStyle = '#4f9fd8'; [[54,40],[74,40]].forEach(([x,y])=>{ f.beginPath(); f.ellipse(x,y,3.5,5,0,0,Math.PI*2); f.fill(); });
    f.fillStyle = 'rgba(246,160,190,.8)'; [[47,50],[81,50]].forEach(([x,y])=>{ f.beginPath(); f.ellipse(x,y,5,3,0,0,Math.PI*2); f.fill(); });
    const faceTex = new THREE.CanvasTexture(fc); faceTex.encoding = THREE.sRGBEncoding;
    const logo = new THREE.Mesh(new THREE.PlaneGeometry(0.05,0.031), new THREE.MeshBasicMaterial({map:faceTex, transparent:true}));
    logo.rotation.x = -Math.PI/2; logo.position.set(0,0.0655,-0.04); pad.add(logo);
  }
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
  const pcLight = new THREE.PointLight(LED, 0.6, 2); pcLight.position.set(-2.0,0.6,1.8); room.add(pcLight);

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
  // the big white one lies just off the rug's right edge, long side along the rim, so the rug stays clear
  cloud(1.3,0.2,-0.35,1.3,Math.PI/2,1.0);  cloud(-1.6,0.16,1.9,0.9,-0.3,1.0,cloudPink);
  // cloud lamp on the desk
  const cloudLamp = cloud(-2.35,1.17,-1.7,0.55,Math.PI/2,1.0,new THREE.MeshBasicMaterial({color:0xfff1d0}));
  const cloudLampLight = new THREE.PointLight(0xffe2b0, 0.5, 2.5); cloudLampLight.position.set(-2.3,1.3,-1.6); room.add(cloudLampLight);
  // little glowing stars
  [[-0.9,3.5,-2.96],[0.9,3.3,-2.96],[2.6,1.3,-2.96],[-2.96,2.2,0.4],[-2.96,1.9,-2.3]].forEach((p,i)=>{
    const st = new THREE.Mesh(new THREE.OctahedronGeometry(0.07), glow(0xfff0a8)); st.position.set(p[0],p[1],p[2]); st.scale.z = 0.4;
    if(p[0]<-2.9) st.rotation.y = Math.PI/2; room.add(st);
  });
  // ---------- puppies: sitting, floppy-eared, tails that wag ----------
  const pups = [];
  const dogEye = mat(0x1d1622), dogNose = mat(0x231c22), shine = new THREE.MeshBasicMaterial({color:0xffffff});
  function puppy(x,y,z,rotY,s=1,coat={body:0xd99a5b, light:0xf6e6cf, ear:0x8a5634, collar:0x8a5cd6}){
    const g = new THREE.Group(); g.position.set(x,y,z); g.rotation.y = rotY; g.scale.setScalar(s); room.add(g);
    const fm = mat(coat.body), lm = mat(coat.light), em = mat(coat.ear);
    sph(0.15,fm,0,0.12,-0.07,1.05,0.8,1.15,g);                              // haunches
    sph(0.11,fm,0,0.26,0.05,0.95,1.5,0.95,g).rotation.x = -0.3;             // upright chest
    sph(0.075,lm,0,0.25,0.12,0.9,1.5,0.6,g).rotation.x = -0.3;              // pale chest
    [-1,1].forEach(e=>{
      cyl(0.032,0.028,0.2,fm,0.055*e,0.1,0.13,g,10);                        // front legs
      sph(0.036,lm,0.055*e,0.018,0.155,1,0.55,1.35,g);                      // front paws
      sph(0.07,fm,0.11*e,0.035,-0.02,0.7,0.5,1.5,g);                        // folded hind legs
    });
    const head = new THREE.Group(); head.position.set(0,0.45,0.1); g.add(head);
    sph(0.1,fm,0,0,0,1.05,0.95,1,head);                                     // skull
    sph(0.055,lm,0,-0.035,0.085,0.95,0.75,1.15,head);                       // muzzle
    sph(0.022,dogNose,0,-0.012,0.145,1.2,0.85,0.8,head);                    // nose
    sph(0.016,mat(0xf08aa0),0,-0.07,0.12,1,0.5,1.2,head);                   // tongue
    [-1,1].forEach(e=>{
      sph(0.02,dogEye,0.042*e,0.02,0.085,1,1.1,0.6,head);
      sph(0.006,shine,0.046*e,0.03,0.096,1,1,1,head);
      sph(0.05,em,0.09*e,-0.02,0,0.45,1.25,0.85,head).rotation.z = 0.25*e;  // floppy ears
    });
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.075,0.014,8,24), mat(coat.collar));
    collar.position.set(0,0.37,0.07); collar.rotation.x = Math.PI/2 - 0.3; g.add(collar);
    sph(0.015,mat(0xf6c66b),0,0.33,0.15,1,1,0.4,g);                         // tag
    const tail = new THREE.Group(); tail.position.set(0,0.12,-0.2); g.add(tail);
    taper([V3(0,0,0),V3(0,0.04,-0.06),V3(0,0.12,-0.08),V3(0,0.18,-0.04)], u=>0.028*(1-u*0.6), fm, tail);
    const data = {g, head, tail, phase:Math.random()*6, wag:0};
    pups.push(data); return data;
  }
  puppy(-0.9,0,1.55,0.6);                                                                         // tan
  puppy(1.3,0,-1.75,-0.5,0.9,{body:0x2f2a2a, light:0xf3ece4, ear:0x2f2a2a, collar:0xff6fa8});     // black and white
  puppy(-2.35,1.04,0.35,1.45,0.55,{body:0xf2ece2, light:0xfbf7f1, ear:0xc99a6a, collar:0x5cc8ff}); // cream, on the desk

  // ---------- gaming chair ----------
  // the chair is swivelled round to face the default camera, so Jetto faces the visitor
  const FACE = Math.PI/4 + 0.15;
  const chair = new THREE.Group(); chair.position.set(-1.5,0,-0.25); chair.rotation.y = FACE; room.add(chair);
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

  // ---------- Jetto (chibi take on her own character sheet, used with the artist's permission) ----------
  // Local axes: +z is where she faces (the default camera, see FACE), -x is her right.
  // The tail sweeps out past the chair on her left (+x) so it still shows from the front.
  const ARM_REST = 0.5; // arms lowered so her hands rest on her lap
  const P = {
    skin: mat(0xf7dccd), hair: matSoft(0x7a62b4), hairDark: matSoft(0x4f3d80),
    jacket: mat(0xf3f0f8), lining: mat(0x7d4fc4), top: mat(0x1f1a28), strap: mat(0xc9c4d6),
    shorts: mat(0xefebf5), sock: mat(0x2a2433), shoe: mat(0xf4f1f8), bandage: mat(0xf6efe6), plaster: mat(0xe8b98f),
    earOut: matSoft(0x735ba8), earIn: matSoft(0xd8c8ec), clip: mat(0xf29ac0),
    furLight: mat(0xd2cbe0), furMid: mat(0x948ba9), furDark: mat(0x3a2f4d),
    phones: mat(0xf1edf8),
    cup: mat(0xff8fb1), eye: mat(0x1d1622), white: glow(0xffffff)
  };
  const person = new THREE.Group(); person.position.set(-1.5,0.66,-0.25); person.rotation.y = FACE; room.add(person);

  // legs (bent, feet toward desk): white shorts, black socks; thigh-high on her right, plaster on her left knee
  [-1,1].forEach(s=>{
    sph(0.12,P.skin,0.14*s,0.06,0.2,1,0.85,1.9,person);
    sph(0.145,P.shorts,0.14*s,0.08,0.06,1,0.9,1.15,person);
    sph(0.11,P.sock,0.14*s,-0.22,0.42,1,2.2,1,person);
    if(s<0) sph(0.115,P.sock,0.14*s,0.04,0.33,1,0.85,0.9,person);
    else box(0.07,0.05,0.02,P.plaster,0.14*s,0.0,0.43,person).rotation.z = 0.5;
    sph(0.1,P.shoe,0.14*s,-0.5,0.5,1,0.7,1.5,person);
    box(0.1,0.02,0.1,P.lining,0.14*s,-0.46,0.56,person);
  });
  // hips + purple belt
  sph(0.3,P.shorts,0,0.12,0,1,0.55,0.85,person);
  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.27,0.025,8,32), P.lining);
  belt.position.set(0,0.2,0); belt.rotation.x = Math.PI/2; belt.scale.y = 0.85; person.add(belt);
  // bare midriff, then the open white cropped jacket over a black crop top
  sph(0.26,P.skin,0,0.3,0,1,0.55,0.8,person);
  const torsoBaseY = 0.78;
  const torso = sph(0.33,P.jacket,0,0.52,-0.02,1.02,torsoBaseY,0.82,person);
  sph(0.27,P.top,0,0.5,0.06,0.82,0.62,0.84,person);
  // quilted purple collar with lapels framing the open front
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.19,0.065,10,28), P.lining);
  collar.position.set(0,0.7,-0.01); collar.rotation.x = Math.PI/2; collar.scale.set(1.15,0.9,1); person.add(collar);
  [-1,1].forEach(s=>{ const l = sph(0.09,P.lining,0.16*s,0.6,0.2,0.75,1.3,0.45,person); l.rotation.z = 0.35*s; });
  // chest strap with a little bow, dark turtleneck, star pendant
  box(0.42,0.035,0.03,P.strap,0,0.5,0.28,person);
  box(0.07,0.045,0.035,P.lining,0,0.5,0.3,person);
  cyl(0.1,0.11,0.1,P.top,0,0.75,0.02,person);
  const pendant = new THREE.Mesh(new THREE.OctahedronGeometry(0.035), glow(0x8fdcff)); pendant.position.set(0,0.62,0.27); pendant.scale.z = 0.5; person.add(pendant);

  // white vet's coat: the skirt hangs open at the front from the waist down over the seat
  const coatMat = mat(0xf3f0f8); coatMat.side = THREE.DoubleSide;
  const coat = new THREE.Mesh(new THREE.CylinderGeometry(0.31,0.43,0.36,40,1,true,0.5,Math.PI*2-1.0), coatMat);
  coat.position.set(0,0.13,-0.01); coat.castShadow = true; person.add(coat);
  // stethoscope draped round the collar: two tubes down the front, a silver chest piece on one end
  const stethMat = mat(0x2e2a3a), silver = mat(0xd4d2dc);
  taper([V3(-0.23,0.7,0.1),V3(-0.21,0.6,0.24),V3(-0.14,0.47,0.3),V3(-0.08,0.41,0.315)], ()=>0.013, stethMat, person);
  taper([V3(0.23,0.7,0.1),V3(0.22,0.58,0.25),V3(0.17,0.46,0.31),V3(0.15,0.37,0.33)], ()=>0.013, stethMat, person);
  const chestPiece = cyl(0.04,0.04,0.02,silver,0.15,0.34,0.34,person); chestPiece.rotation.x = Math.PI/2;
  sph(0.018,silver,-0.08,0.41,0.32,1,1,1,person);

  // big wolf tail like her figure's: a fat purple core plus pointed fur locks that fan out
  // towards the tip, swept out past the chair and curling up
  const tailG = new THREE.Group(); tailG.position.set(0.22,0.06,-0.2); person.add(tailG);
  {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0,0,0), new THREE.Vector3(0.22,-0.04,-0.1), new THREE.Vector3(0.42,0.08,-0.18),
      new THREE.Vector3(0.52,0.38,-0.14), new THREE.Vector3(0.6,0.66,-0.1), new THREE.Vector3(0.72,0.86,-0.04)
    ]);
    const TS = 80, RS = 28;
    const geo = new THREE.TubeGeometry(curve, TS, 1, RS, false);
    const pos = geo.attributes.position, cols = [];
    const light = new THREE.Color(0x6a50ad), mid = new THREE.Color(0x4f3891), dark = new THREE.Color(0x2c1d56), c = new THREE.Color();
    for(let i=0;i<pos.count;i++){
      const u = Math.floor(i/(RS+1))/TS;
      const r = 0.035 + 0.2*Math.pow(Math.sin(Math.PI*Math.min(1,u*1.05)),0.75)*(1-0.25*u);
      const p = curve.getPointAt(u);
      const v = new THREE.Vector3(pos.getX(i),pos.getY(i),pos.getZ(i)).sub(p);
      // the tube was built with radius 1, so v is the unit offset from the spine
      v.multiplyScalar(r).add(p); pos.setXYZ(i,v.x,v.y,v.z);
      if(u < 0.4) c.copy(light); else if(u < 0.6) c.copy(light).lerp(mid,(u-0.4)/0.2); else c.copy(mid).lerp(dark,Math.min(1,(u-0.6)/0.15));
      cols.push(c.r,c.g,c.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols,3));
    geo.computeVertexNormals();
    const tail = new THREE.Mesh(geo, new THREE.MeshToonMaterial({color:0xffffff, vertexColors:true, gradientMap}));
    tail.castShadow = true; tailG.add(tail);
    // fur locks: thinner pointed tubes riding on the core's surface at different angles round it,
    // flaring outwards near the end so the silhouette reads as clumps of fur, not a smooth sausage
    const frames = curve.computeFrenetFrames(40, false);
    const lockMats = [mat(0x755cbb), mat(0x553d97), mat(0x6249a8), mat(0x422d7c)];
    const coreR = u => 0.035 + 0.2*Math.pow(Math.sin(Math.PI*Math.min(1,u*1.05)),0.75)*(1-0.25*u);
    for(let k=0;k<9;k++){
      const a = k/9*Math.PI*2 + 0.3, u0 = 0.18 + (k%3)*0.08;
      const pts = [];
      for(let j=0;j<=6;j++){
        const u = u0 + (1-u0)*j/6, fi = Math.min(40, Math.round(u*40));
        const dir = frames.normals[fi].clone().multiplyScalar(Math.cos(a)).add(frames.binormals[fi].clone().multiplyScalar(Math.sin(a)));
        const p = curve.getPointAt(Math.min(1,u)).add(dir.multiplyScalar(coreR(u)*0.62 + Math.pow(j/6,2)*0.1));
        if(j === 6) p.add(frames.tangents[fi].clone().multiplyScalar(0.06 + (k%2)*0.05));
        pts.push(p);
      }
      const rMax = 0.08 + (k%3)*0.02;
      taper(pts, u=> 0.004 + rMax*Math.pow(Math.sin(Math.PI*Math.min(1,0.15+u*0.9)),0.8)*(1-u*0.85), lockMats[k%4], tailG, 32, 16);
    }
  }

  // arms: short white sleeves with purple cuffs, bandage on her right forearm
  function arm(s){
    const pivot = new THREE.Group(); pivot.position.set(0.3*s,0.56,0.02); person.add(pivot);
    const upper = sph(0.1,P.jacket,0,-0.12,0.08,1,1.6,1.05,pivot); upper.rotation.x = 0.9;
    const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.075,0.018,6,16), P.lining); cuff.position.set(0,-0.2,0.18); pivot.add(cuff);
    const fore = sph(0.065,P.skin,0,-0.22,0.36,1,1,2.6,pivot);
    if(s<0){ [0.3,0.37,0.44].forEach(z=>{ const b = cyl(0.07,0.07,0.035,P.bandage,0,-0.22,z,pivot,12); b.rotation.x = Math.PI/2; }); }
    const hand = sph(0.065,P.skin,0,-0.22,0.58,1,0.8,1.1,pivot);
    pivot.rotation.y = -0.25*s; pivot.rotation.x = ARM_REST;
    return {pivot, hand};
  }
  const armL = arm(-1), armR = arm(1);

  // head
  const headPivot = new THREE.Group(); headPivot.position.set(0,0.78,0.02); person.add(headPivot);
  const head = sph(0.36,P.skin,0,0.28,0,1.05,1,1,headPivot);
  // hair: lavender bob over a deeper purple under-layer, with a fringe of pointed strands
  sph(0.37,P.hairDark,0,0.2,-0.2,1.07,1.15,0.8,headPivot);
  const hairCap = sph(0.39,P.hair,0,0.43,-0.1,1.08,0.95,1.02,headPivot);
  // fringe: flattened, pointed strands following the curve of the forehead, longest in the middle,
  // the outer ones turned out only slightly and kept inside the hair's outline, so none pokes
  // out as a spike from the side; they stop just above the eyes like on her figure
  [[-34,0.18],[-24,0.24],[-12,0.27],[0,0.25],[12,0.27],[24,0.24],[34,0.18]].forEach(([deg,len])=>{
    const phi = deg*Math.PI/180, R = 0.37;
    const g = new THREE.Group(); g.position.set(R*Math.sin(phi),0.46,R*Math.cos(phi)-0.04); g.rotation.order = 'YXZ';
    g.rotation.set(-0.33,phi,phi*0.2); headPivot.add(g);
    const strand = new THREE.Mesh(new THREE.ConeGeometry(0.065,len,10), P.hair); strand.rotation.x = Math.PI; strand.scale.z = 0.4; strand.castShadow = true; g.add(strand);
  });
  // A lock grows from a narrow root (so its open top end can't poke out through the hair cap),
  // keeps its width almost all the way down, then closes in a rounded end, so the bob reads soft
  // from every angle, never spiky.
  const softLock = rMax => u => rMax*Math.min(1, 0.3 + u*4)*Math.sqrt(Math.max(0, 1 - Math.pow(u, 6)));
  // sidelocks like her figure's: three flat locks per side that hang from the temples to chin
  // level, hugging the cheeks and turning out just slightly at the ends. Each side is a group
  // squashed in x so the round tubes lie flat against the face; x offsets are doubled to match.
  [-1,1].forEach(s=>{
    const side = new THREE.Group(); side.position.set(0.355*s,0,0); side.scale.x = 0.5; headPivot.add(side);
    [[0.17,-0.05,0.085,P.hair],[0.06,-0.03,0.09,P.hair],[-0.06,-0.01,0.08,s<0?P.hairDark:P.hair]].forEach(([z,tipY,rMax,m])=>{
      taper([V3(0,0.52,z-0.02),V3(0.03*s,0.32,z+0.01),V3(0.02*s,0.13,z+0.02),V3(0.05*s,tipY,z)],
        softLock(rMax), m, side, 40, 14);
    });
  });
  sph(0.35,P.hair,0,0.22,-0.24,1.04,1.15,0.72,headPivot);
  // back of the bob: a ring of overlapping flat locks from behind the headset round to the nape,
  // ending evenly at jaw level with rounded ends that turn out a touch, like the back view on her
  // sheet. Each lock's group faces outwards (local +z) and is squashed radially so it lies flat.
  for(let k=0;k<9;k++){
    const a = Math.PI + (k-4)*0.35;
    const spoke = new THREE.Group(); spoke.position.z = -0.12; spoke.rotation.y = a; headPivot.add(spoke);
    const lock = new THREE.Group(); lock.position.z = 0.42; lock.scale.z = 0.5; spoke.add(lock);
    const tipY = -0.03 + Math.abs(k-4)*0.006;
    taper([V3(0,0.48,-0.18),V3(0,0.3,0),V3(0,0.1,0.03),V3(0.01*(k-4),tipY,0.07)],
      softLock(0.11), k===8?P.hairDark:P.hair, lock, 40, 14); // k = 8 sits on her right (-x)
  }
  // side tuft, pink X clips on the other side of the fringe (no bone ornament: its white stick
  // poked out past the hair and read as a stray line)
  sph(0.07,P.hair,-0.36,0.5,-0.02,1,1.3,1,headPivot);
  [-1,1].forEach(k=>{ const c = box(0.1,0.018,0.012,P.clip,0.19,0.49,0.31,headPivot); c.rotation.set(-0.3,0.5,0.7*k); });
  // wolf ears: big and lavender like the hair, tilted outwards, with pale fluff spilling out of the base
  [-1,1].forEach(s=>{
    const ear = new THREE.Group(); ear.position.set(0.25*s,0.8,-0.06); ear.rotation.set(-0.1,0,-0.38*s); headPivot.add(ear);
    const outer = new THREE.Mesh(new THREE.ConeGeometry(0.16,0.38,16), P.earOut); outer.scale.z = 0.5; outer.castShadow = true; ear.add(outer);
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.105,0.27,16), P.earIn); inner.scale.z = 0.35; inner.position.set(0,-0.04,0.05); ear.add(inner);
    [[-0.045,-0.12],[0.045,-0.12],[0,-0.1]].forEach(([x,y])=> sph(0.04,P.earIn,x,y,0.065,1,1,0.6,ear));
  });
  // face: painted like a figure's printed face, on a patch of sphere just outside the head.
  // Big anime eyes (amber right, blue left) with heavy lashes and highlights, hatched blush and a
  // little fanged smirk. A second "shut" version is swapped in to blink and when she's happy.
  // The patch spans phi PI/2 +/- 0.8 and theta 1.0..2.15, so the canvas is 1024 x 700 (same
  // pixels per unit both ways) and u runs from her right (-x) to her left.
  const FACE_PHI = 1.6, FACE_THETA0 = 1.0, FACE_THETA = 1.15;
  function paintFace(shut){
    const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 700;
    const c = cv.getContext('2d'); c.lineCap = c.lineJoin = 'round';
    const LASH = '#2b1730';
    // blush with a few hatch strokes
    [[226,588],[798,588]].forEach(([x,y])=>{
      const g = c.createRadialGradient(x,y,4,x,y,78); g.addColorStop(0,'rgba(246,140,165,.6)'); g.addColorStop(1,'rgba(246,140,165,0)');
      c.fillStyle = g; c.beginPath(); c.ellipse(x,y,82,40,0,0,Math.PI*2); c.fill();
      c.strokeStyle = 'rgba(214,96,128,.55)'; c.lineWidth = 5;
      [-24,0,24].forEach(dx=>{ c.beginPath(); c.moveTo(x+dx-8,y+10); c.lineTo(x+dx+8,y-10); c.stroke(); });
    });
    // eyes: s = -1 for her right eye (canvas left, amber), +1 for her left (canvas right, blue)
    [[272,-1,['#7a3b0c','#e8901c','#ffe07a']],[752,1,['#16307a','#2f8fe6','#a8ecff']]].forEach(([cx,s,[top,mid,bot]])=>{
      const cy = 420, w = 214, h = 280;
      if(shut){
        // closed, smiling eyes: a lash curve bowing upward with a flick at the outer corner
        c.strokeStyle = LASH; c.lineWidth = 20;
        c.beginPath(); c.moveTo(cx - s*w*0.48, cy+20); c.quadraticCurveTo(cx, cy-48, cx + s*w*0.5, cy+18); c.stroke();
        c.lineWidth = 12; c.beginPath(); c.moveTo(cx + s*w*0.5, cy+18); c.lineTo(cx + s*w*0.68, cy+4); c.stroke();
        return;
      }
      c.save();
      c.beginPath(); c.ellipse(cx,cy,w/2,h/2,0,0,Math.PI*2); c.fillStyle = '#ffffff'; c.fill(); c.clip();
      const ig = c.createLinearGradient(0,cy-h*0.45,0,cy+h*0.5);
      ig.addColorStop(0,top); ig.addColorStop(0.55,mid); ig.addColorStop(1,bot);
      c.beginPath(); c.ellipse(cx,cy+h*0.04,w*0.44,h*0.47,0,0,Math.PI*2); c.fillStyle = ig; c.fill();
      c.beginPath(); c.ellipse(cx,cy+h*0.02,w*0.2,h*0.24,0,0,Math.PI*2); c.fillStyle = top; c.fill();      // pupil
      c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 6;                                             // glint ring
      c.beginPath(); c.ellipse(cx,cy+h*0.1,w*0.32,h*0.3,0,0.15*Math.PI,0.85*Math.PI); c.stroke();
      c.fillStyle = '#ffffff';                                                                              // highlights
      c.beginPath(); c.ellipse(cx - s*w*0.13, cy - h*0.17, w*0.15, h*0.12, -0.3*s, 0, Math.PI*2); c.fill();
      c.beginPath(); c.arc(cx + s*w*0.16, cy + h*0.2, w*0.065, 0, Math.PI*2); c.fill();
      c.beginPath(); c.arc(cx - s*w*0.02, cy + h*0.3, w*0.035, 0, Math.PI*2); c.fill();
      c.restore();
      // heavy upper lash with an outer wing, thin lower lash at the outer corner
      c.strokeStyle = LASH; c.lineWidth = 24;
      c.beginPath(); c.moveTo(cx - s*w*0.5, cy - h*0.16); c.quadraticCurveTo(cx - s*w*0.05, cy - h*0.66, cx + s*w*0.52, cy - h*0.28); c.stroke();
      c.lineWidth = 14; c.beginPath(); c.moveTo(cx + s*w*0.5, cy - h*0.28); c.lineTo(cx + s*w*0.72, cy - h*0.36); c.stroke();
      c.lineWidth = 7; c.beginPath(); c.moveTo(cx + s*w*0.2, cy + h*0.5); c.quadraticCurveTo(cx + s*w*0.42, cy + h*0.4, cx + s*w*0.5, cy + h*0.22); c.stroke();
    });
    // small smirk with one fang
    c.strokeStyle = '#5a2638'; c.lineWidth = 8;
    c.beginPath(); c.moveTo(470,622); c.quadraticCurveTo(512,652,556,620); c.stroke();
    c.fillStyle = '#ffffff'; c.lineWidth = 3.5;
    c.beginPath(); c.moveTo(522,634); c.lineTo(544,628); c.lineTo(535,662); c.closePath(); c.fill(); c.stroke();
    const tx = new THREE.CanvasTexture(cv); tx.encoding = THREE.sRGBEncoding; tx.anisotropy = 4; return tx;
  }
  const faceOpen = paintFace(false), faceShut = paintFace(true);
  const faceMat = new THREE.MeshToonMaterial({map:faceOpen, gradientMap, transparent:true, alphaTest:0.04, polygonOffset:true, polygonOffsetFactor:-2});
  const face = new THREE.Mesh(new THREE.SphereGeometry(0.3612, 56, 40, Math.PI/2 - FACE_PHI/2, FACE_PHI, FACE_THETA0, FACE_THETA), faceMat);
  face.position.set(0,0.28,0); face.scale.set(1.05,1,1); headPivot.add(face);
  // headset: band sits between the ears
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.38,0.03,8,32,Math.PI), P.phones);
  band.position.set(0,0.3,-0.02); headPivot.add(band);
  [-1,1].forEach(s=>{
    const cup = cyl(0.11,0.11,0.08,P.phones,0.38*s,0.26,0,headPivot); cup.rotation.z = Math.PI/2;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.1,0.018,8,24), glow(0xb48cff));
    ring.position.set(0.425*s,0.26,0); ring.rotation.y = Math.PI/2; headPivot.add(ring);
  });

  // smoother Jetto: she is the close-up subject, so her round parts get a much finer mesh than the
  // room's props, and her materials shade with a soft gradient instead of hard toon bands
  {
    const ramp = vals=>{
      const tx = new THREE.DataTexture(new Uint8Array(vals.flatMap(v=>[v,v,v,255])), vals.length, 1, THREE.RGBAFormat);
      tx.minFilter = tx.magFilter = THREE.LinearFilter; tx.needsUpdate = true; return tx;
    };
    const smooth = ramp([85,150,210,255]), smoothSoft = ramp([65,110,150,180]);
    const done = new Set();
    person.traverse(o=>{
      if(!o.isMesh) return;
      const g = o.geometry, p = g.parameters;
      if(g.type === 'SphereGeometry') o.geometry = new THREE.SphereGeometry(p.radius, 56, 40, p.phiStart, p.phiLength, p.thetaStart, p.thetaLength);
      else if(g.type === 'ConeGeometry') o.geometry = new THREE.ConeGeometry(p.radius, p.height, 32);
      else if(g.type === 'TorusGeometry') o.geometry = new THREE.TorusGeometry(p.radius, p.tube, 16, 64, p.arc);
      else if(g.type === 'CylinderGeometry') o.geometry = new THREE.CylinderGeometry(p.radiusTop, p.radiusBottom, p.height, 32, p.heightSegments, p.openEnded, p.thetaStart, p.thetaLength);
      if(o.geometry !== g) g.dispose();
      const m = o.material;
      if(m.isMeshToonMaterial && !done.has(m)){
        done.add(m); m.gradientMap = m.gradientMap === softGradient ? smoothSoft : smooth; m.needsUpdate = true;
      }
    });
  }

  // ---------- kittens ----------
  const kittens = [];
  const furs = [
    {body:0xe7a15c, ear:0xf2b3a6, light:0xf6e4cf, stripe:0xb4672c, eye:0x9bcf5a},  // orange tabby
    {body:0xf5f2ee, ear:0xf4b6c2, light:0xffffff, eye:0x7fb8e8},                   // white
    {body:0x9a95a6, ear:0xd9a9b4, light:0xd8d3de, stripe:0x635d70, eye:0xe8c04a},  // grey tabby
    {body:0x2b2733, ear:0x6b5560, light:0x3a3442, eye:0xf0c23a},                   // black
    {body:0xf0dcc0, ear:0xe8b8a8, light:0xfbf1e4, eye:0x7fb8e8},                   // cream
    {body:0xd9d2c8, ear:0xe0b4b0, light:0xf3eee8, stripe:0xa0958a, eye:0x9bcf5a}   // pale tabby
  ];
  const catNose = mat(0xe58fa4), catIris = {};
  function kitten(fur, x, y, z, rotY, pose, s=1){
    const k = new THREE.Group(); k.position.set(x,y,z); k.rotation.y = rotY; k.scale.setScalar(s); room.add(k);
    const fm = mat(fur.body), em = mat(fur.ear), lm = mat(fur.light);
    const iris = catIris[fur.eye] || (catIris[fur.eye] = mat(fur.eye));
    const sleeping = pose === 'sleep', walking = pose === 'walk';
    const legs = [];
    let body, headPos;
    if(walking){
      body = sph(0.1,fm,0,0.15,0,0.85,0.8,1.9,k);
      sph(0.08,lm,0,0.125,0.06,0.75,0.6,1.2,k);                             // pale belly
      [[-1,1],[1,1],[-1,-1],[1,-1]].forEach(([sx,sz])=>{
        const leg = new THREE.Group(); leg.position.set(0.045*sx,0.13,0.11*sz); k.add(leg);
        cyl(0.022,0.018,0.12,fm,0,-0.06,0,leg,10);
        sph(0.022,lm,0,-0.12,0.008,1,0.6,1.3,leg);
        legs.push({leg, ph: sx*sz > 0 ? 0 : Math.PI});                      // diagonal pairs move together
      });
      headPos = [0,0.25,0.21];
    } else if(sleeping){
      body = sph(0.15,fm,0,0.085,0,1.15,0.7,1.05,k);                        // curled-up loaf
      headPos = [0.07,0.09,0.13];
    } else {
      body = sph(0.12,fm,0,0.1,-0.05,1.1,0.85,1.15,k);                      // haunches
      sph(0.085,fm,0,0.2,0.05,0.95,1.45,0.95,k).rotation.x = -0.25;         // upright chest
      sph(0.06,lm,0,0.19,0.105,0.9,1.4,0.6,k).rotation.x = -0.25;           // pale bib
      [-1,1].forEach(e=>{
        cyl(0.022,0.02,0.15,fm,0.04*e,0.08,0.11,k,10);                      // front legs
        sph(0.024,lm,0.04*e,0.013,0.125,1,0.6,1.35,k);                      // front paws
        sph(0.05,fm,0.085*e,0.025,0,0.75,0.45,1.5,k);                       // hind feet tucked at the sides
      });
      headPos = [0,0.35,0.09];
    }

    const headG = new THREE.Group(); headG.position.set(...headPos); k.add(headG);
    if(sleeping) headG.rotation.set(0.3,0.5,0.45);                          // chin down on its paws
    sph(0.08,fm,0,0,0,1.08,0.92,0.95,headG);                                // cranium
    [-1,1].forEach(e=> sph(0.045,fm,0.035*e,-0.025,0.035,1,0.85,0.9,headG)); // cheeks
    sph(0.034,lm,0,-0.03,0.065,1.15,0.75,0.8,headG);                        // muzzle
    sph(0.011,catNose,0,-0.012,0.093,1.2,0.8,0.8,headG);                    // nose
    if(fur.stripe != null){                                                 // tabby "M" on the forehead
      const sm = mat(fur.stripe);
      [-0.022,0,0.022].forEach((sx,i)=>{ const b = box(0.009,0.006,0.045,sm,sx,0.07-(i%2)*0.004,0.01,headG); b.rotation.x = -0.4; });
    }
    [-1,1].forEach(e=>{
      const ear = new THREE.Group(); ear.position.set(0.05*e,0.065,-0.005); ear.rotation.set(-0.15,0,-0.35*e); headG.add(ear);
      const o = new THREE.Mesh(new THREE.ConeGeometry(0.034,0.07,4), fm); o.rotation.y = Math.PI/4; o.scale.z = 0.55; o.castShadow = true; ear.add(o);
      const i = new THREE.Mesh(new THREE.ConeGeometry(0.022,0.05,4), em); i.rotation.y = Math.PI/4; i.scale.z = 0.3; i.position.set(0,-0.006,0.012); ear.add(i);
      if(sleeping){
        const lid = new THREE.Mesh(new THREE.TorusGeometry(0.016,0.004,6,12,Math.PI), P.eye);
        lid.position.set(0.032*e,0.008,0.068); lid.rotation.z = Math.PI; headG.add(lid);
      } else {
        const eye = sph(0.019,iris,0.032*e,0.01,0.066,1,0.85,0.55,headG);
        box(0.006,0.028,0.006,P.eye,0,0,0.017,eye);                          // slit pupil
        sph(0.005,P.white,0.032*e+0.006,0.018,0.077,1,1,1,headG);
      }
      for(let w=0; w<3; w++){                                               // whiskers
        const wh = cyl(0.0022,0.0012,0.1,P.white,0.07*e,-0.028+w*0.01,0.068,headG,4);
        wh.rotation.z = Math.PI/2 + (w-1)*0.18*e; wh.rotation.y = -0.25*e; wh.castShadow = false;
      }
    });

    // tail: a tapered tube. Sitting cats wrap it round their feet, sleeping ones round the body,
    // and the walker carries it up like a question mark
    const tailG = new THREE.Group(); k.add(tailG);
    const rT = u => 0.022*(1-u*0.6);
    if(walking){ tailG.position.set(0,0.17,-0.17); taper([V3(0,0,0),V3(0,0.05,-0.08),V3(0,0.17,-0.12),V3(0,0.24,-0.07)], rT, fm, tailG); }
    else if(sleeping){ tailG.position.set(-0.13,0.03,-0.05); taper([V3(0,0,0),V3(-0.05,0,0.1),V3(-0.01,0,0.21),V3(0.1,0,0.26)], rT, fm, tailG); }
    else { tailG.position.set(0,0.025,-0.16); taper([V3(0,0,0),V3(0.08,0,-0.04),V3(0.16,0,0.05),V3(0.14,0,0.15),V3(0.06,0,0.21)], rT, fm, tailG); }

    const data = {g:k, head:headG, tail:tailG, body, legs, pose, base:new THREE.Vector3(x,y,z), rotY, jump:0, phase:Math.random()*6};
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
    // the chat monitor; the game monitor is a VideoTexture and updates itself
    const b = screens[0], c2 = b.ctx, W2 = b.c.width, H2 = b.c.height;
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

  // zoom: mouse wheel / trackpad scroll, or a two-finger pinch on touch screens
  const ZOOM_MIN = 4.5, ZOOM_MAX = 15;
  let zoom = 11.5;
  const clampZoom = z => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
  const onWheel = e=>{ e.preventDefault(); zoom = clampZoom(zoom * Math.exp(e.deltaY*0.0012)); };
  stage.addEventListener('wheel', onWheel, {passive:false});
  const touches = new Map();
  let pinchStart = 0, zoomStart = zoom;
  const pinchDist = ()=>{ const [a,b] = [...touches.values()]; return Math.hypot(a.x-b.x, a.y-b.y) || 1; };

  stage.addEventListener('pointerdown', e=>{
    touches.set(e.pointerId, {x:e.clientX, y:e.clientY});
    if(touches.size === 2){ pinchStart = pinchDist(); zoomStart = zoom; moved = 99; }
    dragging = true; lastX = e.clientX; lastY = e.clientY; if(touches.size === 1) moved = 0; stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', e=>{
    if(touches.has(e.pointerId)) touches.set(e.pointerId, {x:e.clientX, y:e.clientY});
    if(touches.size === 2){ zoom = clampZoom(zoomStart * pinchStart / pinchDist()); return; }
    if(!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY; moved += Math.abs(dx)+Math.abs(dy);
    yaw = Math.max(-0.9, Math.min(0.9, yaw + dx*0.006)); yawVel = dx*0.006;
    pitch = Math.max(-0.25, Math.min(0.3, pitch + dy*0.003));
  });
  stage.addEventListener('pointerup', e=>{
    touches.delete(e.pointerId);
    dragging = touches.size > 0; lastX = e.clientX; lastY = e.clientY;
    if(dragging) return;
    if(moved < 6){
      const r = stage.getBoundingClientRect();
      pointer.set(((e.clientX-r.left)/r.width)*2-1, -((e.clientY-r.top)/r.height)*2+1);
      raycaster.setFromCamera(pointer, camera);
      const hitKitten = kittens.find(k=> raycaster.intersectObject(k.g, true).length);
      const hitPup = !hitKitten && pups.find(p=> raycaster.intersectObject(p.g, true).length);
      if(hitKitten){ hitKitten.jump = 1; say(['Meow!','Nyaa~','Mrrp!','Miaw!'][Math.floor(Math.random()*4)], hitKitten.g, 0.55); }
      else if(hitPup){ hitPup.wag = 1; say(['Guk!','Guk guk!','Arf!','Woof!'][Math.floor(Math.random()*4)], hitPup.g, 0.7); }
      else if(raycaster.intersectObject(person, true).length) cheer();
      else if(raycaster.intersectObject(posterG, true).length) openPoster(POSTER_SRC);
      else if(raycaster.intersectObject(poster2G, true).length) openPoster(POSTER2_SRC);
      else if(raycaster.intersectObject(cinnaG, true).length) openPoster(CINNA_SRC);
      else if(raycaster.intersectObject(cipet).length) openPoster(CIPET_SRC);
      else { const pic = wallPics.find(p=> raycaster.intersectObject(p.g, true).length); if(pic) openPoster(pic.src); }
    }
  });
  stage.addEventListener('pointercancel', e=>{ touches.delete(e.pointerId); dragging = false; });

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
    // longer lines stay up longer so they can be read
    clearTimeout(bubbleTimer); bubbleTimer = setTimeout(()=>bubble.classList.remove('on'), Math.max(1400, 600 + text.length*70));
  }
  const lines = ['Awoo Suakatachi', 'Valo kuy!', 'Lagi push rank nih', 'Bentar, satu ronde lagi', 'GG!', 'Mau mabar?',
    'Clutch dulu, woof!', 'Ada cheater? Booo, payah!', 'Awoo! Ace!'];
  let li = 0;
  function cheer(){ actions.cheer = 1; say(lines[li++ % lines.length]); }

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

  // the "Awoo Jetto" button: she waves and says something different each time (never the same line twice running)
  // Lines in her persona: half-husky vet, greets her Suaka fam with "Awoo", Cipet is her assistant,
  // Cheeda her tiny form, and her likes/dislikes from the profile (plain milk, Padang satay, Mondays).
  const chat = ['Awoo awoo~', 'Awoo Suakatachi', 'Udah makan belum, Suaka?', 'Jangan lupa minum air ya~',
    'Minum susu putih dulu~', 'Makasih udah mampir!', 'Dokter Jetto siap periksa~', 'Anabulmu sehat kan?',
    'Jangan begadang ya!', 'Kucingnya lucu kan?', 'Cipet, jangan nempel terus~', 'Elus kepala Cheeda dong~',
    'Pengen sate padang...', 'Hari Senin lagi? Huhu', 'Semangat hari ini! Woof~', 'Valo kuy!'];
  let lastChat = -1;
  const onWave = ()=>{
    let i; do { i = Math.floor(Math.random()*chat.length); } while(i === lastChat);
    lastChat = i; actions.wave = 1; say(chat[i]);
  };
  btnWave.addEventListener('click', onWave);

  // the "Main" button swivels her chair between facing the visitor and facing the monitors
  let playMode = false;
  function setPlaying(on){
    playMode = !!on;
    say(playMode ? 'Valo kuy!' : 'Udahan dulu~');
  }

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
  let faceAngle = FACE;
  let blinkT = 2;
  const tmp = new THREE.Vector3();
  function tick(){
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;

    if(!dragging){ yaw += yawVel; yawVel *= 0.9; yaw = Math.max(-0.9, Math.min(0.9, yaw)); }
    const dist = zoom, baseYaw = Math.PI/4 + 0.15 + yaw, basePitch = 0.42 + pitch;
    // zooming in drifts the aim from the room's centre towards Jetto
    const zin = Math.max(0, Math.min(1, (11.5 - zoom)/(11.5 - ZOOM_MIN)));
    aim.copy(camTarget).lerp(jettoAim, zin*0.85);
    camera.position.set(
      aim.x + Math.sin(baseYaw)*Math.cos(basePitch)*dist,
      aim.y + Math.sin(basePitch)*dist,
      aim.z + Math.cos(baseYaw)*Math.cos(basePitch)*dist
    );
    camera.lookAt(aim);

    // swivel between facing us (FACE) and facing the monitors (-PI/2); pb is 0 facing us, 1 at the desk
    const faceTarget = playMode ? -Math.PI/2 : FACE;
    faceAngle += (faceTarget - faceAngle)*Math.min(1, dt*(reduce ? 12 : 4));
    chair.rotation.y = person.rotation.y = faceAngle;
    const pb = (FACE - faceAngle)/(FACE + Math.PI/2);
    const rest = ARM_REST*(1-pb); // hands on her lap, or reaching for the keyboard
    // idle: head sways when relaxing, nods along while gaming, fingers tap the keys
    headPivot.rotation.x = Math.sin(t*1.3*spd)*0.03*(1-pb) + Math.sin(t*4*spd)*0.035*pb;
    headPivot.rotation.z = Math.sin(t*0.9*spd)*0.05*(1-pb);
    headPivot.rotation.y = 0;
    armL.hand.position.y = -0.22 + Math.max(0, Math.sin(t*14*spd))*0.03*pb;
    armR.hand.position.y = -0.22 + Math.max(0, Math.sin(t*11*spd+1))*0.03*pb;
    torso.scale.y = torsoBaseY + Math.sin(t*2*spd)*0.012;
    // tail: a lazy sway, wagging fast while she cheers
    const wag = actions.cheer > 0 ? Math.sin(t*16)*0.35 : Math.sin(t*1.6*spd)*0.12;
    tailG.rotation.y = wag; tailG.rotation.z = Math.sin(t*1.1*spd)*0.05;

    // wave ("Awoo Jetto") with the arm on her left (+x), head tipping away from it
    if(actions.wave > 0){ actions.wave = Math.max(0, actions.wave - dt*0.6); }
    const w = actions.wave;
    const up = w > 0 ? Math.sin(Math.min(1, Math.min((1-w)*4, w*4)) * Math.PI/2) : 0;
    if(w > 0){
      headPivot.rotation.z = 0.15*up*(1-pb);
      headPivot.rotation.y = 0.5*up*pb; // at the desk she looks back over her shoulder
    }

    // cheer: both arms up in a V, little bounce, a slight happy head tilt
    if(actions.cheer > 0){ actions.cheer = Math.max(0, actions.cheer - dt*0.9); }
    const ch = Math.sin(actions.cheer*Math.PI);
    if(actions.cheer > 0){
      headPivot.rotation.z = -0.06*ch*(1-pb);
      headPivot.rotation.y = 0.6*ch*pb;
    }
    person.position.y = 0.66 + Math.abs(Math.sin(actions.cheer*Math.PI*3))*0.08*ch;

    // Arm poses. At rest each arm is turned in (yaw -0.25*s) so the hands meet on her lap; raised
    // with that yaw the hand ends up inside her head, so both poses swing the arm out to the side as
    // it lifts. They were solved against her head + hair outline to stay clear through the whole
    // motion: the wave keeps the hand beside her cheek, waving +-0.2 rad; the cheer opens a V.
    const poseArm = (arm, s, wave)=>{
      let rx = rest, ry = -0.25*s, rz = 0;
      if(ch > 0){ rx = rest + (-1.75 - rest)*ch; ry = s*(-0.25 + 0.4*ch); rz = s*1.1*ch; }
      else if(wave > 0){ rx = rest + (-1.6 - rest)*wave; ry = s*(-0.25 + 0.45*wave); rz = s*(0.85 + 0.2*Math.sin(t*14))*wave; }
      arm.pivot.rotation.set(rx, ry, rz);
    };
    poseArm(armR, 1, up); poseArm(armL, -1, 0);

    // blink
    blinkT -= dt;
    let ey = 1.3;
    if(blinkT < 0){ ey = 0.15; if(blinkT < -0.12) blinkT = 2 + Math.random()*3; }
    if(ch > 0.3) ey = 0.3;
    faceMat.map = ey > 0.5 ? faceOpen : faceShut;

    // PC fans + neon flicker
    fans.forEach((f,i)=> f.rotation.x += dt*(playing?6:2)*(i%2?1:-1));
    neonMat.color.setScalar(night ? 0.92 + Math.sin(t*3)*0.08 : 1); // paw prints: true colour by day, a gentle pulse at night
    stars.forEach((s,i)=>{ s.scale.setScalar(0.7 + Math.abs(Math.sin(t*1.5 + i))*0.5); });

    kittens.forEach(k=>{
      const ph = t + k.phase;
      k.tail.rotation.y = Math.sin(ph*(k.pose==='sleep'?1.2:3)*spd)*(k.pose==='walk' ? 0.35 : k.pose==='sleep' ? 0.06 : 0.12);
      k.legs.forEach(l=>{ l.leg.rotation.x = Math.sin(t*7*spd + l.ph)*0.45; });
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

    pups.forEach(p=>{
      const ph = t + p.phase;
      if(p.wag > 0) p.wag = Math.max(0, p.wag - dt*0.7);
      p.tail.rotation.y = Math.sin(ph*(p.wag > 0 ? 20 : 5)*spd)*(p.wag > 0 ? 0.6 : 0.22);
      p.head.rotation.z = Math.sin(ph*0.7*spd)*0.1 + Math.sin(p.wag*Math.PI)*0.3;
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

  return { setPlaying, dispose(){
    cancelAnimationFrame(rafId);
    window.removeEventListener('pointerdown', kickVideo);
    gameVideo.pause(); gameVideo.removeAttribute('src'); gameVideo.load();
    ro.disconnect();
    document.removeEventListener('keydown', onKey);
    lightbox.removeEventListener('click', closeBox);
    btnWave.removeEventListener('click', onWave);
    stage.removeEventListener('wheel', onWheel);
    scene.traverse(o=>{ if(o.geometry) o.geometry.dispose(); if(o.material){ (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{ if(m.map) m.map.dispose(); m.dispose(); }); } });
    renderer.dispose();
    renderer.domElement.remove();
  }};
}
