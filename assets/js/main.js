/* =====================================================
   Future Nexus — Main JS
   ===================================================== */

/* ── Navbar scroll ───────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

/* ── Scroll reveal ───────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── Counter animation ───────────────────────────────── */
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const isFloat = String(target).includes('.');
  const start = performance.now();
  (function update(now) {
    const p = Math.min((now - start) / 2000, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = (isFloat ? (target * eased).toFixed(1) : Math.round(target * eased)) + suffix;
    if (p < 1) requestAnimationFrame(update);
  })(start);
}
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target.dataset.counted) {
      e.target.dataset.counted = 'true';
      animateCounter(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-number[data-target]').forEach(el => counterObs.observe(el));

/* ── Form submit ─────────────────────────────────────── */
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Message Sent!';
    btn.style.background = '#059669';
    setTimeout(() => { btn.textContent = 'Send Message'; btn.style.background = ''; form.reset(); }, 3000);
  });
}

/* ─────────────────────────────────────────────────────
   THREE.JS SCENES
   All use MeshPhongMaterial — no envMap required.
   ───────────────────────────────────────────────────── */
const T = window.THREE;
if (!T) { console.warn('Three.js not loaded'); }

/* ── Helper: set renderer size from canvas DOM size ─── */
function fitRenderer(canvas, camera, renderer) {
  const w = canvas.clientWidth  || canvas.width  || window.innerWidth;
  const h = canvas.clientHeight || canvas.height || window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

/* ══════════════════════════════════════════════════════
   HERO — VR holographic: TorusKnot + orbital rings +
   floating wireframe polyhedra + particle field
   ════════════════════════════════════════════════════ */
(function heroScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || !T) return;

  const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(52, 1, 0.1, 100);
  camera.position.set(0, 0, 7.5);

  fitRenderer(canvas, camera, renderer);
  window.addEventListener('resize', () => fitRenderer(canvas, camera, renderer));

  /* Lights — neon VR palette */
  scene.add(new T.AmbientLight(0x04060f, 3));
  const lCyan    = new T.PointLight(0x22d3ee, 14, 22); lCyan.position.set(5, 4, 3);    scene.add(lCyan);
  const lPurple  = new T.PointLight(0x7c3aed,  9, 22); lPurple.position.set(-5,-3, 2); scene.add(lPurple);
  const lMagenta = new T.PointLight(0xe040fb,  6, 16); lMagenta.position.set(1, 7, 0); scene.add(lMagenta);

  /* ── Central TorusKnot — the holographic VR focal point ── */
  const knotPos = new T.Vector3(2.6, 0, 0);

  const knotSolid = new T.Mesh(
    new T.TorusKnotGeometry(1.35, 0.38, 180, 32),
    new T.MeshPhongMaterial({
      color: 0x030810,
      emissive: 0x010306,
      specular: 0x22d3ee,
      shininess: 160,
    })
  );
  knotSolid.position.copy(knotPos);
  scene.add(knotSolid);

  /* Cyan wireframe overlay */
  const knotWire = new T.Mesh(
    new T.TorusKnotGeometry(1.37, 0.39, 90, 16),
    new T.MeshBasicMaterial({ color: 0x22d3ee, wireframe: true, transparent: true, opacity: 0.22 })
  );
  knotWire.position.copy(knotPos);
  scene.add(knotWire);

  /* Purple wireframe layer — counter-rotates */
  const knotWire2 = new T.Mesh(
    new T.TorusKnotGeometry(1.40, 0.40, 60, 10),
    new T.MeshBasicMaterial({ color: 0xa855f7, wireframe: true, transparent: true, opacity: 0.10 })
  );
  knotWire2.position.copy(knotPos);
  scene.add(knotWire2);

  /* Outer glow shell */
  const knotGlow = new T.Mesh(
    new T.TorusKnotGeometry(1.55, 0.46, 60, 16),
    new T.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.04, side: T.BackSide })
  );
  knotGlow.position.copy(knotPos);
  scene.add(knotGlow);

  /* ── Orbital rings around the knot ── */
  function makeRing(r, tube, col, op, rx, ry) {
    const m = new T.Mesh(
      new T.TorusGeometry(r, tube, 12, 120),
      new T.MeshBasicMaterial({ color: col, transparent: true, opacity: op })
    );
    m.position.copy(knotPos);
    m.rotation.x = rx; m.rotation.y = ry;
    scene.add(m);
    return m;
  }
  const ring1 = makeRing(2.05, 0.008, 0x22d3ee, 0.55, Math.PI / 2.2, 0.2);
  const ring2 = makeRing(2.45, 0.005, 0xa855f7, 0.30, Math.PI / 3,  -Math.PI / 4);
  const ring3 = makeRing(2.80, 0.004, 0xe040fb, 0.18, 0.2,           Math.PI / 5);

  /* ── Floating wireframe polyhedra — VR environment debris ── */
  const floaters = [];
  [
    { geo: new T.OctahedronGeometry(0.58),    color: 0x22d3ee, pos: [-3.2,  2.2, -0.5] },
    { geo: new T.IcosahedronGeometry(0.46, 0),color: 0xa855f7, pos: [-2.0, -2.8,  0.5] },
    { geo: new T.TetrahedronGeometry(0.52),   color: 0xe040fb, pos: [ 5.8,  2.2, -1.5] },
    { geo: new T.OctahedronGeometry(0.36),    color: 0xf59e0b, pos: [-0.8,  3.8, -0.8] },
    { geo: new T.IcosahedronGeometry(0.32, 0),color: 0x22d3ee, pos: [ 5.0, -2.8, -0.8] },
    { geo: new T.TetrahedronGeometry(0.40),   color: 0xa855f7, pos: [-4.5, -1.0,  0.5] },
  ].forEach(({ geo, color, pos }, i) => {
    /* Solid dark body with neon specular */
    const solid = new T.Mesh(geo, new T.MeshPhongMaterial({
      color: 0x030810, emissive: 0x010206, specular: color, shininess: 130,
    }));
    solid.position.set(...pos);
    solid.userData = { basePos: [...pos], phase: Math.random() * Math.PI * 2, spd: 0.004 + i * 0.0008 };
    scene.add(solid);
    floaters.push(solid);

    /* Bright wireframe twin */
    const wire = new T.Mesh(geo.clone(),
      new T.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.55 })
    );
    wire.position.set(...pos);
    wire.userData = solid.userData;
    scene.add(wire);
    floaters.push(wire);
  });

  /* ── Particle field — cyan data-stream dots ── */
  const pCount = 340;
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pPos[i*3]   = (Math.random() - 0.5) * 22;
    pPos[i*3+1] = (Math.random() - 0.5) * 16;
    pPos[i*3+2] = (Math.random() - 0.5) * 10 - 2;
  }
  const pGeo = new T.BufferGeometry();
  pGeo.setAttribute('position', new T.BufferAttribute(pPos, 3));
  const particles = new T.Points(pGeo, new T.PointsMaterial({
    color: 0x22d3ee, size: 0.016, transparent: true, opacity: 0.3,
  }));
  scene.add(particles);

  /* ── Mouse parallax ── */
  let mx = 0, my = 0;
  window.addEventListener('mousemove', e => {
    mx = (e.clientX / innerWidth  - 0.5) * 2;
    my = -(e.clientY / innerHeight - 0.5) * 2;
  });

  let t = 0;
  (function loop() {
    requestAnimationFrame(loop);
    t += 0.005;

    /* Knot slow spin */
    knotSolid.rotation.y += 0.006;
    knotSolid.rotation.x += 0.003;
    knotWire.rotation.y   = knotSolid.rotation.y;
    knotWire.rotation.x   = knotSolid.rotation.x;
    knotWire2.rotation.y  = -knotSolid.rotation.y * 0.6;
    knotWire2.rotation.x  = -knotSolid.rotation.x * 0.6;
    knotGlow.rotation.y   = knotSolid.rotation.y;

    /* Knot gentle float */
    const kFloat = Math.sin(t * 0.55) * 0.22;
    knotSolid.position.y = knotPos.y + kFloat;
    knotWire.position.y  = knotSolid.position.y;
    knotWire2.position.y = knotSolid.position.y;
    knotGlow.position.y  = knotSolid.position.y;

    /* Rings orbit */
    ring1.rotation.z += 0.009;
    ring2.rotation.z -= 0.006;
    ring3.rotation.y += 0.005;
    ring1.position.y = knotSolid.position.y;
    ring2.position.y = knotSolid.position.y;
    ring3.position.y = knotSolid.position.y;

    /* Floating shapes drift */
    floaters.forEach(m => {
      m.rotation.x += m.userData.spd;
      m.rotation.y += m.userData.spd * 0.7;
      const bp = m.userData.basePos;
      m.position.y = bp[1] + Math.sin(t * 0.75 + m.userData.phase) * 0.28;
    });

    /* Particles slow drift */
    particles.rotation.y += 0.0004;

    /* Light pulse */
    lCyan.intensity    = 13 + Math.sin(t * 1.2) * 2.5;
    lMagenta.intensity =  5 + Math.cos(t * 0.9) * 1.5;

    /* Mouse parallax */
    camera.position.x += (mx * 0.5 - camera.position.x) * 0.04;
    camera.position.y += (my * 0.35 - camera.position.y) * 0.04;
    camera.lookAt(new T.Vector3(1, 0, 0));

    renderer.render(scene, camera);
  })();
})();

/* ══════════════════════════════════════════════════════
   ABOUT — floating geometric shapes background
   ════════════════════════════════════════════════════ */
(function aboutScene() {
  const canvas = document.getElementById('about-canvas');
  if (!canvas || !T) return;

  const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  fitRenderer(canvas, camera, renderer);
  window.addEventListener('resize', () => fitRenderer(canvas, camera, renderer));

  scene.add(new T.AmbientLight(0x0d0020, 3));
  const pl1 = new T.PointLight(0x7c3aed, 6, 20); pl1.position.set(5, 5, 5); scene.add(pl1);
  const pl2 = new T.PointLight(0x22d3ee, 3, 20); pl2.position.set(-5,-3, 3); scene.add(pl2);

  const shapes = [];
  const configs = [
    { geo: new T.OctahedronGeometry(0.45),    color: 0x7c3aed, pos: [-4,  2, -1] },
    { geo: new T.TetrahedronGeometry(0.55),   color: 0xa855f7, pos: [ 4, -2,  0] },
    { geo: new T.IcosahedronGeometry(0.4, 0), color: 0x22d3ee, pos: [-3, -3,  1] },
    { geo: new T.OctahedronGeometry(0.35),    color: 0xe040fb, pos: [ 3,  3, -2] },
    { geo: new T.TetrahedronGeometry(0.42),   color: 0xf59e0b, pos: [ 0, -1,  2] },
    { geo: new T.IcosahedronGeometry(0.3, 0), color: 0x7c3aed, pos: [-1,  3,  0] },
  ];

  configs.forEach(({ geo, color, pos }, i) => {
    const mat = new T.MeshPhongMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.25,
      specular: 0xffffff,
      shininess: 80,
      transparent: true,
      opacity: 0.55,
    });
    const mesh = new T.Mesh(geo, mat);
    mesh.position.set(...pos);
    mesh.userData = { speed: 0.003 + i * 0.001, yOffset: Math.random() * Math.PI * 2 };
    scene.add(mesh);
    shapes.push(mesh);

    const wm = new T.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.3 });
    const wMesh = new T.Mesh(geo.clone(), wm);
    wMesh.position.set(...pos);
    wMesh.userData = mesh.userData;
    scene.add(wMesh);
    shapes.push(wMesh);
  });

  let t = 0;
  (function loop() {
    requestAnimationFrame(loop);
    t += 0.01;
    shapes.forEach(m => {
      m.rotation.x += m.userData.speed;
      m.rotation.y += m.userData.speed * 0.7;
      m.position.y += Math.sin(t + m.userData.yOffset) * 0.003;
    });
    renderer.render(scene, camera);
  })();
})();
