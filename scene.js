/* ============================================================
   AragveliPalazzolo — WebGL scene
   A liquid-gold form with orbiting rings and drifting dust. It sits
   fixed behind the page and travels between sections as you scroll.
   ============================================================ */

/* Ashima Arts 3D simplex noise (MIT). */
const NOISE_GLSL = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

const canvas = document.querySelector('.gl');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function fail() {
  document.documentElement.classList.add('no-webgl');
  if (canvas) canvas.remove();
}

try {
  await start();
} catch (err) {
  console.warn('[scene] WebGL unavailable, using fallback.', err);
  fail();
}

async function start() {
  const THREE = await import('three');
  const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
  pmrem.dispose();

  const key = new THREE.DirectionalLight(0xffe0b0, 2.2);
  key.position.set(4, 5, 6);
  const rim = new THREE.DirectionalLight(0x9fb4ff, 1.1);
  rim.position.set(-6, -2, -4);
  scene.add(key, rim);

  /* ---------- Liquid gold form ---------- */

  const uniforms = {
    uTime: { value: 0 },
    uAmp: { value: 0.2 },
    uFreq: { value: 0.7 }
  };

  const gold = new THREE.MeshPhysicalMaterial({
    color: 0xe7c37f,
    metalness: 1,
    roughness: 0.16,
    clearcoat: 0.8,
    clearcoatRoughness: 0.12,
    iridescence: 0.25,
    iridescenceIOR: 1.6,
    envMapIntensity: 1.25
  });

  gold.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uTime;
        uniform float uAmp;
        uniform float uFreq;
        ${NOISE_GLSL}
        vec3 displace(vec3 p) {
          vec3 n = normalize(p);
          float a = snoise(n * uFreq + vec3(0.0, uTime * 0.22, uTime * 0.12));
          float b = snoise(n * uFreq * 1.9 - vec3(uTime * 0.17)) * 0.18;
          return n * (length(p) + (a + b) * uAmp);
        }`
      )
      .replace(
        '#include <beginnormal_vertex>',
        `vec3 dPos = displace(position);
        vec3 baseN = normalize(position);
        vec3 tng = normalize(cross(baseN, abs(baseN.y) > 0.99 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0)));
        vec3 btg = normalize(cross(baseN, tng));
        vec3 p1 = displace(position + tng * 0.012);
        vec3 p2 = displace(position + btg * 0.012);
        vec3 objectNormal = normalize(cross(p1 - dPos, p2 - dPos));`
      )
      .replace('#include <begin_vertex>', 'vec3 transformed = dPos;');
  };

  const group = new THREE.Group();
  scene.add(group);

  const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(1.15, 64), gold);
  group.add(blob);

  /* ---------- Orbit rings ---------- */

  const ringMat = new THREE.MeshPhysicalMaterial({
    color: 0xf1d59e,
    metalness: 1,
    roughness: 0.22,
    envMapIntensity: 1.4
  });

  const rings = [
    { r: 1.85, t: 0.007, tilt: [1.15, 0.2, 0], speed: [0.0, 0.16, 0.05] },
    { r: 2.2, t: 0.005, tilt: [0.4, -0.7, 0.3], speed: [0.08, -0.1, 0.0] },
    { r: 2.6, t: 0.003, tilt: [-0.9, 0.5, 0.2], speed: [-0.05, 0.0, 0.09] }
  ].map((cfg) => {
    const pivot = new THREE.Group();
    pivot.rotation.set(...cfg.tilt);
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(cfg.r, cfg.t, 12, 240), ringMat);
    pivot.add(mesh);

    // A single bead rides each ring, so the orbit reads as motion.
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.035 + cfg.t * 2, 24, 24), ringMat);
    bead.position.set(cfg.r, 0, 0);
    mesh.add(bead);

    group.add(pivot);
    return { pivot, mesh, cfg };
  });

  /* ---------- Gold dust ---------- */

  const DUST = window.innerWidth < 700 ? 700 : 1400;
  const dustPos = new Float32Array(DUST * 3);
  const dustSeed = new Float32Array(DUST);
  for (let i = 0; i < DUST; i++) {
    const r = 3 + Math.random() * 9;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    dustPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    dustPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.6;
    dustPos[i * 3 + 2] = r * Math.cos(ph) - 3;
    dustSeed[i] = Math.random();
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  dustGeo.setAttribute('aSeed', new THREE.BufferAttribute(dustSeed, 1));

  const dustMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: uniforms.uTime,
      uPixel: { value: 1 }
    },
    vertexShader: `
      attribute float aSeed;
      uniform float uTime;
      uniform float uPixel;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        p.y += sin(uTime * 0.3 + aSeed * 40.0) * 0.25;
        p.x += cos(uTime * 0.2 + aSeed * 25.0) * 0.18;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (2.0 + aSeed * 5.0) * uPixel * (6.0 / -mv.z);
        vAlpha = (0.25 + 0.75 * (0.5 + 0.5 * sin(uTime * (0.6 + aSeed) + aSeed * 60.0))) * smoothstep(18.0, 6.0, -mv.z);
      }`,
    fragmentShader: `
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vec3(1.0, 0.82, 0.55) * a, a * vAlpha * 0.8);
      }`
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  /* ---------- Scroll choreography ----------
     Each section names where the form should be while it is on screen;
     the scene eases between those poses as the page scrolls. */

  const POSES = {
    wide: {
      '.hero': { x: 1.75, y: 0.25, s: 1.0, amp: 0.14, spin: 0 },
      '.gallery': { x: 0, y: 0, s: 0.55, amp: 0.22, spin: 1 },
      '.about': { x: 2.5, y: 0.9, s: 0.5, amp: 0.13, spin: 2 },
      '.services': { x: -2.4, y: -0.9, s: 0.55, amp: 0.18, spin: 3 },
      '.projects': { x: 3.2, y: 1.8, s: 0.001, amp: 0.2, spin: 4 },
      '.contact': { x: 2.5, y: 0.75, s: 0.72, amp: 0.16, spin: 5 }
    },
    narrow: {
      '.hero': { x: 0.35, y: 1.25, s: 0.62, amp: 0.14, spin: 0 },
      '.gallery': { x: 0, y: 0, s: 0.45, amp: 0.14, spin: 1 },
      '.about': { x: 0.6, y: 1.6, s: 0.4, amp: 0.13, spin: 2 },
      '.services': { x: -0.6, y: 2.0, s: 0.35, amp: 0.17, spin: 3 },
      '.projects': { x: 0.8, y: 2.3, s: 0.001, amp: 0.14, spin: 4 },
      '.contact': { x: 0.5, y: 2.0, s: 0.45, amp: 0.15, spin: 5 }
    }
  };

  let stops = [];

  function measure() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);

    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    dustMat.uniforms.uPixel.value = dpr;

    const set = camera.aspect < 0.9 ? POSES.narrow : POSES.wide;
    // Pull the side poses in on mid-width screens so the form stays framed.
    const xScale = Math.min(1, camera.aspect / 1.6);

    stops = Object.keys(set)
      .map((sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const top = el.getBoundingClientRect().top + window.scrollY;
        const pose = { ...set[sel], x: set[sel].x * xScale };
        // A pose is fully reached when its section's top hits mid-viewport.
        return { at: Math.max(0, top - h * 0.5), pose };
      })
      .filter(Boolean)
      .sort((a, b) => a.at - b.at);
    stops[0].at = 0;
  }

  function poseAt(y) {
    if (y <= stops[0].at) return stops[0].pose;
    for (let i = 0; i < stops.length - 1; i++) {
      const a = stops[i];
      const b = stops[i + 1];
      if (y < b.at) {
        let t = (y - a.at) / (b.at - a.at);
        t = t * t * (3 - 2 * t);
        const out = {};
        for (const k in a.pose) out[k] = a.pose[k] + (b.pose[k] - a.pose[k]) * t;
        return out;
      }
    }
    return stops[stops.length - 1].pose;
  }

  measure();
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  // Late layout shifts (fonts, iframes) move the section anchors.
  setTimeout(measure, 1500);

  /* ---------- Pointer ---------- */

  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  window.addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  /* ---------- Loop ---------- */

  const state = { x: 0, y: 0, s: 0, amp: 0.2, spin: 0, intro: 0, vel: 0 };
  const first = poseAt(window.scrollY);
  Object.assign(state, first, { s: 0 });

  let ready = document.body.classList.contains('is-ready');
  let readyAt = ready ? performance.now() : 0;
  window.addEventListener('app:ready', () => {
    ready = true;
    readyAt = performance.now();
  });

  let lastScroll = window.scrollY;
  let running = true;
  const clock = new THREE.Clock();

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) {
      clock.getDelta();
      requestAnimationFrame(frame);
    }
  });

  function frame() {
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = reduceMotion ? 0 : clock.elapsedTime;
    const y = window.scrollY;
    const target = poseAt(y);

    // Scroll speed stirs the surface; it settles once the page rests.
    const v = Math.abs(y - lastScroll) / Math.max(dt, 0.001);
    lastScroll = y;
    state.vel += (Math.min(v / 2500, 1) - state.vel) * 0.08;

    if (ready) {
      const p = Math.min((performance.now() - readyAt) / 2200, 1);
      state.intro = reduceMotion ? 1 : 1 - Math.pow(1 - p, 4);
    }

    const k = reduceMotion ? 1 : 1 - Math.pow(0.0015, dt);
    state.x += (target.x - state.x) * k;
    state.y += (target.y - state.y) * k;
    state.s += (target.s - state.s) * k;
    state.amp += (target.amp - state.amp) * k;
    state.spin += (target.spin - state.spin) * k;

    pointer.sx += (pointer.x - pointer.sx) * 0.05;
    pointer.sy += (pointer.y - pointer.sy) * 0.05;

    uniforms.uTime.value = t;
    uniforms.uAmp.value = state.amp + state.vel * 0.14 + (1 - state.intro) * 0.3;

    const scale = state.s * (0.35 + 0.65 * state.intro);
    group.position.set(state.x + pointer.sx * 0.18, state.y - pointer.sy * 0.14, 0);
    group.scale.setScalar(scale);
    group.rotation.set(
      pointer.sy * 0.35 + state.spin * 0.25,
      t * 0.12 + pointer.sx * 0.5 + state.spin * 0.6 + (1 - state.intro) * -2.4,
      0
    );

    rings.forEach(({ mesh, cfg }, i) => {
      mesh.rotation.x += cfg.speed[0] * dt * (1 + state.vel * 4);
      mesh.rotation.y += cfg.speed[1] * dt * (1 + state.vel * 4);
      mesh.rotation.z += (cfg.speed[2] + 0.25 + i * 0.12) * dt * (1 + state.vel * 4);
      mesh.scale.setScalar(0.6 + 0.4 * Math.min(state.intro * 1.2, 1));
    });

    dust.rotation.y = t * 0.015 + y * 0.00008;
    dust.position.y = y * 0.0009;

    camera.position.x = pointer.sx * 0.25;
    camera.position.y = -pointer.sy * 0.18;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(() => {
    canvas.classList.add('is-ready');
    frame();
  });
}
