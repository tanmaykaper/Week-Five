import {
  Color,
  DoubleSide,
  Group,
  LatheGeometry,
  Mesh,
  MeshPhysicalMaterial,
  NeutralToneMapping,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { COHORT_SPOTS, DOT_ANGLE, DR, OUTER, R0, SHED_WEEKS, type Vec3 } from "./geometry";

/**
 * The pool: one light 3D scene shared by the intro, the welcome screen and setup.
 *
 * Everything the story changes lives in two plain objects, `rig` (the camera) and
 * `state` (the dropper, the drop, the ripple and the map), so GSAP can scrub them
 * and pages can tween between poses. The render loop reads them every frame and only
 * draws when something changed or the water is meant to be moving.
 */

export interface Rig {
  /** Camera position. */
  camX: number;
  camY: number;
  camZ: number;
  /** The point the camera looks at. */
  tx: number;
  ty: number;
  tz: number;
  fov: number;
  /** Moves the look-at point across the screen, as a fraction of the viewport (positive is right and down). */
  shiftX: number;
  shiftY: number;
}

export interface PoolState {
  /** Dropper position, tilt (around z) and slow turn (around y). */
  dX: number;
  dY: number;
  dZ: number;
  tilt: number;
  spin: number;
  /** 0 is a relaxed bulb, 1 fully squeezed. */
  squeeze: number;
  /** Liquid in the glass, 0 to 1. */
  level: number;
  /** A drop growing at the tip, 0 to 1. */
  drop: number;
  /** The drop's fall from the tip (0) to the water (1). */
  fall: number;
  /** Age of the impact ripple in scene seconds; 0 means no ripple. Scrubbable. */
  ripple: number;
  /** How far the 24 week rings have spread, 0 to 1. */
  map: number;
  /** Which week is "you are here" (0 for none). Fractional values move the marker smoothly. */
  week: number;
  /** Season overlap in weeks, drawn as rain on the rings (0, 0 for none). */
  seasonFrom: number;
  seasonTo: number;
  /** Weeks to pick out in the accent (0, 0 for none), and how strongly, 0 to 1. */
  focusFrom: number;
  focusTo: number;
  focus: number;
  /** Strength of the shed window band and the photo-day dots, 0 to 1. */
  shed: number;
  dots: number;
  /** Other people's drops landing (the cohort), 0 to 1. */
  cohort: number;
  /** HTML labels over the rings, 0 to 1. */
  labels: number;
  /** Small idle ripples on the surface, 0 to 1. */
  idle: number;
}

export interface Label {
  el: HTMLElement;
  at: Vec3;
  /** Extra opacity factor for this label (multiplied by state.labels). */
  weight?: () => number;
}

const GROUND = "#f1f4f7";

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const VERT = /* glsl */ `
varying vec3 vWorld;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const FRAG = /* glsl */ `
precision highp float;
varying vec3 vWorld;
uniform vec3 uCam;
uniform float uTime, uRipple, uMap, uWeek, uShed, uDots, uIdle, uCalm, uFocus;
uniform vec2 uSeason, uFocusWeeks;
uniform vec3 uSrc[6];
uniform vec3 uShadow;
uniform vec3 uBg, uWater, uSkyLow, uSkyHigh, uInk, uAccent, uAmber, uRain;

const float R0 = ${R0.toFixed(4)};
const float DR = ${DR.toFixed(4)};
const float OUTER = ${OUTER.toFixed(4)};
const float DOT_ANGLE = ${DOT_ANGLE.toFixed(4)};
const vec2 SHED = vec2(${SHED_WEEKS[0].toFixed(1)}, ${SHED_WEEKS[1].toFixed(1)});

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

// d/dr of a ripple train  env(x) * sin(k x),  x = r - front
float train(float r, float front, float k, float w) {
  float x = r - front;
  float env = exp(-x * x / (w * w));
  return env * (k * cos(k * x) - 2.0 * x / (w * w) * sin(k * x));
}

// ring radius for a (possibly fractional) week
float rr(float w) { return R0 + (w - 1.0) * DR; }

void main() {
  vec2 p = vWorld.xz;
  float r = length(p);
  vec2 dir = r > 1e-4 ? p / r : vec2(0.0);
  vec2 grad = vec2(0.0);

  // 1. The drop's ripple: three trains spreading from the origin, fading with age and distance.
  if (uRipple > 0.0) {
    float front = uRipple * 1.6;
    float amp = 0.0042 * exp(-uRipple * 0.3) / sqrt(0.6 + r);
    float g = train(r, front, 15.0, 0.34) + 0.7 * train(r, front - 0.55, 13.0, 0.3) + 0.45 * train(r, front - 1.05, 11.0, 0.28);
    grad += dir * g * amp;
  }

  // 2. Other people's drops.
  for (int i = 0; i < 6; i++) {
    vec3 s = uSrc[i];
    if (s.z <= 0.0) continue;
    vec2 d = p - s.xy;
    float rs = length(d);
    float g = train(rs, s.z * 1.1, 22.0, 0.16) + 0.6 * train(rs, s.z * 1.1 - 0.3, 20.0, 0.14);
    grad += (rs > 1e-4 ? d / rs : vec2(0.0)) * g * 0.0024 * exp(-s.z * 0.9);
  }

  // 3. Idle water: two slow swells from far away.
  grad += uIdle * 0.005 * vec2(cos(p.x * 1.7 + p.y * 0.6 + uTime * 0.7), cos(p.y * 2.1 - p.x * 0.5 + uTime * 0.55));

  // 4. The map: the ripple frozen into 24 week rings.
  float reach = uMap * (OUTER + DR);
  float fi = (r - R0) / DR;
  float wi = clamp(floor(fi + 0.5), 0.0, 23.0);
  float week = wi + 1.0;
  float ri = R0 + wi * DR;
  float aa = max(fwidth(r), 1e-4);
  float dpx = abs(r - ri) / aa;
  float shown = smoothstep(reach, reach - DR * 1.5, ri);
  float isNow = uWeek > 0.5 ? 1.0 - smoothstep(0.35, 0.65, abs(week - floor(uWeek + 0.5))) : 0.0;
  float done = uWeek > 0.5 ? step(week, uWeek - 0.5) : 0.0;
  float inShed = step(SHED.x - 0.5, week) * step(week, SHED.y + 0.5);
  float inFocus = uFocusWeeks.y > 0.0 ? step(uFocusWeeks.x - 0.5, week) * step(week, uFocusWeeks.y + 0.5) * uFocus : 0.0;
  float arc = atan(p.y, p.x) * r;
  float dash = mix(1.0, step(0.42, fract(arc / 0.09)), inShed * uShed);
  float lineW = mix(mix(1.15, 1.9, inFocus), 2.6, isNow);
  float line = (1.0 - smoothstep(lineW * 0.5, lineW * 0.5 + 1.0, dpx)) * shown * dash;
  // a faint embossed lip on each ring so it catches the light
  float bump = (r - ri) / (DR * 0.18);
  grad += dir * (-2.0 * bump * exp(-bump * bump)) * 0.006 * shown * uMap;

  // 5. Rain over the weeks that overlap the user's monsoon.
  float rainMask = 0.0;
  if (uSeason.y > 0.0) {
    float inner = rr(uSeason.x) - DR * 0.5;
    float outer = rr(uSeason.y) + DR * 0.5;
    rainMask = smoothstep(inner - 0.04, inner + 0.04, r) * (1.0 - smoothstep(outer - 0.04, outer + 0.04, r)) * shown;
    vec2 cell = floor(p / 0.26);
    float h = hash(cell);
    vec2 c = (cell + 0.3 + 0.4 * vec2(h, hash(cell + 7.3))) * 0.26;
    float phase = fract(uTime * 0.45 + h);
    vec2 d = p - c;
    float rc = length(d);
    float g = train(rc, phase * 0.13, 70.0, 0.025) * (1.0 - phase);
    grad += (rc > 1e-4 ? d / rc : vec2(0.0)) * g * 0.0011 * rainMask * step(0.35, h + uCalm);
  }

  // Shade: fresnel sky reflection, a soft key light, and a slight emboss from the slope.
  vec3 n = normalize(vec3(-grad.x * 9.0, 1.0, -grad.y * 9.0));
  vec3 v = normalize(uCam - vWorld);
  float fres = 0.05 + 0.95 * pow(1.0 - max(dot(n, v), 0.0), 5.0);
  vec3 refl = reflect(-v, n);
  vec3 sky = mix(uSkyLow, uSkyHigh, smoothstep(0.0, 0.85, refl.y));
  vec3 col = mix(uWater, sky, fres);
  vec3 L = normalize(vec3(-0.45, 0.75, 0.5));
  col *= clamp(1.0 + (dot(n, L) - L.y) * 1.5, 0.82, 1.12);
  col += pow(max(dot(refl, L), 0.0), 260.0) * 0.45;
  col = min(col, vec3(1.0));

  // A soft shadow under the dropper.
  float sh = exp(-dot(p - uShadow.xy, p - uShadow.xy) / 0.22) * uShadow.z;
  col *= 1.0 - sh * 0.1;

  // Bands: the shed window (a quiet tint) and the monsoon overlap (a rain tint).
  float shedBand = smoothstep(rr(SHED.x) - DR * 0.5 - 0.01, rr(SHED.x) - DR * 0.5 + 0.01, r) * (1.0 - smoothstep(rr(SHED.y) + DR * 0.5 - 0.01, rr(SHED.y) + DR * 0.5 + 0.01, r));
  col = mix(col, uAccent, shedBand * 0.055 * uShed * shown);
  col = mix(col, uRain, rainMask * 0.2);

  // Lines: future weeks faint, past weeks firmer, this week in the accent.
  vec3 lineCol = mix(uInk, uAccent, max(isNow, inFocus));
  float lineA = mix(0.17, 0.42, done);
  lineA = mix(lineA, 0.32, inShed * uShed * (1.0 - isNow) * (1.0 - done));
  lineA = mix(lineA, 0.8, inFocus);
  lineA = mix(lineA, 0.95, isNow);
  col = mix(col, lineCol, line * lineA * uMap);

  // Photo days: a small amber dot on every fourth ring.
  float isPhoto = step(mod(week, 4.0), 0.5);
  vec2 dp = vec2(cos(DOT_ANGLE), sin(DOT_ANGLE)) * ri;
  float dd = length(p - dp);
  float dotA = (1.0 - smoothstep(0.034, 0.034 + aa * 1.2, dd)) * isPhoto * uDots * shown;
  col = mix(col, uAmber, dotA);

  // Fog into the page ground, so the water has no edge.
  float dist = length(vWorld - uCam);
  col = mix(col, uBg, smoothstep(9.0, 34.0, dist));

  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

function lathe(profile: [number, number][], segments = 64) {
  return new LatheGeometry(
    profile.map(([x, y]) => new Vector2(x, y)),
    segments,
  );
}

/** A hanging drop, pointed end up, 0.13 tall, base at y = 0. */
function dropGeometry() {
  const a = 0.045;
  const h = 0.135;
  const pts: [number, number][] = [];
  for (let i = 0; i <= 24; i++) {
    const y = (i / 24) * h;
    const r = y <= a ? Math.sqrt(Math.max(0, a * a - (y - a) * (y - a))) : a * Math.pow((h - y) / (h - a), 1.35);
    pts.push([Math.max(r, i === 0 || i === 24 ? 0 : 0.0005), y]);
  }
  return lathe(pts, 40);
}

export class PoolEngine {
  readonly rig: Rig;
  readonly state: PoolState;
  readonly labels: Label[] = [];
  /** True until a page has posed the pool for the first time. */
  private fresh = true;

  /** The first caller gets true (and should place the camera without a glide); everyone after gets false. */
  claim(): boolean {
    const was = this.fresh;
    this.fresh = false;
    return was;
  }

  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(35, 1, 0.05, 120);
  private water: Mesh<PlaneGeometry, ShaderMaterial>;
  private dropper = new Group();
  private bulb: Mesh;
  private liquid: Mesh;
  private liquidPlane = new Plane(new Vector3(0, -1, 0), 0);
  private dropMesh: Mesh;
  private cohortDrops: Mesh[] = [];
  private tip = new Vector3();
  private tmp = new Vector3();
  private raf = 0;
  private lastSig = "";
  private started = performance.now();
  private tween: { from: Record<string, number>; to: Record<string, number>; start: number; ms: number; done?: () => void } | null =
    null;
  private width = 1;
  private height = 1;
  private reduced: boolean;
  private onFirstFrame?: () => void;
  private disposed = false;

  constructor(canvas: HTMLCanvasElement, opts: { reduced: boolean; rig: Rig; state: PoolState; onFirstFrame?: () => void }) {
    this.reduced = opts.reduced;
    this.rig = { ...opts.rig };
    this.state = { ...opts.state };
    this.onFirstFrame = opts.onFirstFrame;

    const renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = NeutralToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.localClippingEnabled = true;
    renderer.setClearColor(new Color(GROUND), 1);
    this.renderer = renderer;

    const pmrem = new PMREMGenerator(renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
    pmrem.dispose();
    this.scene.background = new Color(GROUND);

    // The water.
    const uniforms = {
      uCam: { value: new Vector3() },
      uTime: { value: 0 },
      uRipple: { value: 0 },
      uMap: { value: 0 },
      uWeek: { value: 0 },
      uShed: { value: 0 },
      uDots: { value: 0 },
      uIdle: { value: 0 },
      uCalm: { value: this.reduced ? 1 : 0 },
      uSeason: { value: new Vector2() },
      uFocusWeeks: { value: new Vector2() },
      uFocus: { value: 0 },
      uSrc: { value: Array.from({ length: 6 }, () => new Vector3()) },
      uShadow: { value: new Vector3() },
      uBg: { value: new Color(GROUND) },
      uWater: { value: new Color("#e3e9ef") },
      uSkyLow: { value: new Color("#fbfcfd") },
      uSkyHigh: { value: new Color("#d6e0ea") },
      uInk: { value: new Color("#0f1e33") },
      uAccent: { value: new Color("#22548a") },
      uAmber: { value: new Color("#c98a12") },
      uRain: { value: new Color("#3f7fc7") },
    };
    this.water = new Mesh(
      new PlaneGeometry(240, 240),
      new ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, toneMapped: false }),
    );
    this.water.rotation.x = -Math.PI / 2;
    this.scene.add(this.water);

    // The dropper: glass pipette, liquid, collar and a navy bulb. Built from lathes, about 2.4 tall.
    const glassProfile: [number, number][] = [
      [0.0, 0.0],
      [0.014, 0.004],
      [0.022, 0.04],
      [0.042, 0.32],
      [0.066, 0.58],
      [0.084, 0.74],
      [0.09, 0.82],
      [0.09, 1.6],
      [0.098, 1.63],
      [0.0, 1.63],
    ];
    const glass = new Mesh(
      lathe(glassProfile),
      new MeshPhysicalMaterial({
        color: new Color("#f3f7fb"),
        transmission: 1,
        thickness: 0.28,
        roughness: 0.06,
        ior: 1.52,
        metalness: 0,
        envMapIntensity: 1.7,
        specularIntensity: 1,
        attenuationColor: new Color("#9fbbdc"),
        attenuationDistance: 0.45,
        side: DoubleSide,
      }),
    );
    const liquidProfile: [number, number][] = [
      [0.0, 0.02],
      [0.01, 0.025],
      [0.016, 0.05],
      [0.034, 0.33],
      [0.056, 0.59],
      [0.073, 0.74],
      [0.078, 0.82],
      [0.078, 1.58],
      [0.0, 1.58],
    ];
    this.liquid = new Mesh(
      lathe(liquidProfile, 48),
      new MeshPhysicalMaterial({
        color: new Color("#9dc0e8"),
        roughness: 0.12,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        emissive: new Color("#3d72b5"),
        emissiveIntensity: 0.12,
        clippingPlanes: [this.liquidPlane],
      }),
    );
    const collar = new Mesh(
      lathe([
        [0.0, 1.6],
        [0.128, 1.6],
        [0.136, 1.62],
        [0.136, 1.75],
        [0.124, 1.77],
        [0.0, 1.77],
      ]),
      new MeshPhysicalMaterial({ color: new Color("#f4f6f8"), roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.2 }),
    );
    this.bulb = new Mesh(
      lathe([
        [0.0, 0.0],
        [0.084, 0.0],
        [0.1, 0.03],
        [0.122, 0.12],
        [0.134, 0.24],
        [0.13, 0.38],
        [0.112, 0.48],
        [0.078, 0.55],
        [0.036, 0.585],
        [0.0, 0.592],
      ]),
      new MeshPhysicalMaterial({
        color: new Color("#16294a"),
        roughness: 0.42,
        clearcoat: 0.35,
        clearcoatRoughness: 0.35,
        sheen: 0.4,
        sheenColor: new Color("#5b7fb8"),
      }),
    );
    this.bulb.position.y = 1.76;

    // The dropper pivots around its middle.
    const body = new Group();
    body.add(glass, this.liquid, collar, this.bulb);
    body.position.y = -1.18;
    this.dropper.add(body);
    this.scene.add(this.dropper);

    const dropMat = new MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 1,
      thickness: 0.09,
      roughness: 0.02,
      ior: 1.33,
      envMapIntensity: 1.6,
      attenuationColor: new Color("#9cc1ea"),
      attenuationDistance: 0.25,
    });
    this.dropMesh = new Mesh(dropGeometry(), dropMat);
    this.scene.add(this.dropMesh);

    const small = new SphereGeometry(0.045, 24, 16);
    for (let i = 0; i < COHORT_SPOTS.length; i++) {
      const m = new Mesh(small, dropMat);
      m.visible = false;
      this.cohortDrops.push(m);
      this.scene.add(m);
    }

    this.resize();
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }

  /** Match the canvas to its box. */
  resize() {
    const canvas = this.renderer.domElement;
    const box = canvas.parentElement?.getBoundingClientRect();
    const w = Math.max(1, Math.round(box?.width ?? window.innerWidth));
    const h = Math.max(1, Math.round(box?.height ?? window.innerHeight));
    if (w === this.width && h === this.height) return;
    this.width = w;
    this.height = h;
    this.renderer.setSize(w, h, false);
    this.lastSig = "";
  }

  get aspect() {
    return this.width / this.height;
  }

  /** Ease the camera and the scene to a pose. Interrupts any tween already running. */
  to(pose: Partial<Rig & PoolState>, ms = 1100): Promise<void> {
    const from: Record<string, number> = {};
    const target: Record<string, number> = {};
    const all = { ...this.rig, ...this.state } as Record<string, number>;
    for (const [k, v] of Object.entries(pose)) {
      if (typeof v !== "number") continue;
      from[k] = all[k]!;
      target[k] = v;
    }
    this.tween?.done?.();
    if (this.reduced || ms <= 0) {
      this.apply(target);
      this.tween = null;
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.tween = { from, to: target, start: performance.now(), ms, done: resolve };
    });
  }

  /** Set values immediately. */
  set(pose: Partial<Rig & PoolState>) {
    this.tween = null;
    this.apply(pose as Record<string, number>);
  }

  private apply(values: Record<string, number>) {
    for (const [k, v] of Object.entries(values)) {
      if (typeof v !== "number" || Number.isNaN(v)) continue;
      if (k in this.rig) (this.rig as unknown as Record<string, number>)[k] = v;
      else if (k in this.state) (this.state as unknown as Record<string, number>)[k] = v;
    }
  }

  /** Lay HTML labels over points on the water. They are positioned every frame. */
  setLabels(labels: Label[]) {
    this.labels.splice(0, this.labels.length, ...labels);
    this.lastSig = "";
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.renderer.dispose();
    this.scene.traverse((o) => {
      const m = o as Mesh;
      m.geometry?.dispose();
      const mat = m.material as { dispose?: () => void } | undefined;
      mat?.dispose?.();
    });
  }

  private loop(now: number) {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    if (document.visibilityState === "hidden") return;

    if (this.tween) {
      const t = Math.min(1, (now - this.tween.start) / this.tween.ms);
      const e = ease(t);
      const values: Record<string, number> = {};
      for (const k of Object.keys(this.tween.to)) values[k] = this.tween.from[k]! + (this.tween.to[k]! - this.tween.from[k]!) * e;
      this.apply(values);
      if (t >= 1) {
        const done = this.tween.done;
        this.tween = null;
        done?.();
      }
    }

    const s = this.state;
    const moving = !this.reduced && (s.idle > 0 || (s.seasonTo > 0 && s.map > 0));
    const sig = `${Object.values(this.rig).join()}|${Object.values(s).join()}|${this.width}x${this.height}`;
    if (!moving && sig === this.lastSig) return;
    this.lastSig = sig;
    this.draw(now);
  }

  private draw(now: number) {
    const { rig, state: s } = this;
    const time = this.reduced ? 2.0 : (now - this.started) / 1000;

    // Camera, with the look-at point shifted across the screen (portrait and landscape framings differ).
    this.camera.fov = rig.fov;
    this.camera.aspect = this.aspect;
    this.camera.position.set(rig.camX, rig.camY, rig.camZ);
    this.camera.lookAt(rig.tx, rig.ty, rig.tz);
    this.camera.setViewOffset(this.width, this.height, -rig.shiftX * this.width, -rig.shiftY * this.height, this.width, this.height);
    this.camera.updateProjectionMatrix();

    // Dropper.
    this.dropper.position.set(s.dX, s.dY, s.dZ);
    this.dropper.rotation.set(0, s.spin, s.tilt);
    this.dropper.visible = s.dY < 12;
    const k = s.squeeze;
    this.bulb.scale.set(1 - 0.2 * k, 1 - 0.06 * k, 1 - 0.2 * k);
    this.dropper.updateMatrixWorld(true);
    // The liquid's surface stays level in the world, wherever the dropper points.
    this.tmp.set(0, -1.18 + 0.03 + s.level * 1.53, 0).applyMatrix4(this.dropper.matrixWorld);
    this.liquidPlane.constant = this.tmp.y;
    this.liquid.visible = s.level > 0.002;
    this.tip.set(0, -1.18, 0).applyMatrix4(this.dropper.matrixWorld);

    // The drop: grows at the tip, then falls to the water.
    const d = this.dropMesh;
    d.visible = s.drop > 0.01 && s.fall < 0.999;
    const grow = Math.min(1, s.drop);
    const stretch = 1 + 0.25 * s.fall * (1 - s.fall) * 4;
    d.scale.set(grow, grow * stretch, grow);
    d.rotation.set(0, 0, 0);
    const hang = 0.135 * grow;
    const startY = this.tip.y - hang;
    d.position.set(this.tip.x, startY + (0.0 - startY) * s.fall, this.tip.z);

    // Cohort drops: each falls from above its spot, then rings out.
    const sources = this.water.material.uniforms.uSrc!.value as Vector3[];
    COHORT_SPOTS.forEach((spot, i) => {
      const start = i / COHORT_SPOTS.length;
      const local = (s.cohort - start) * COHORT_SPOTS.length;
      const m = this.cohortDrops[i]!;
      const falling = local > 0 && local < 0.45;
      m.visible = falling && s.cohort > 0;
      if (falling) m.position.set(spot[0], 2.4 * (1 - local / 0.45), spot[2]);
      const age = local > 0.45 ? (local - 0.45) * 2.2 : 0;
      sources[i]!.set(spot[0], spot[2], s.cohort > 0 ? age : 0);
    });

    const u = this.water.material.uniforms;
    u.uCam!.value.copy(this.camera.position);
    u.uTime!.value = time;
    u.uRipple!.value = s.ripple;
    u.uMap!.value = s.map;
    u.uWeek!.value = s.week;
    u.uShed!.value = s.shed;
    u.uDots!.value = s.dots;
    u.uIdle!.value = this.reduced ? 0 : s.idle;
    (u.uSeason!.value as Vector2).set(s.seasonFrom, s.seasonTo);
    (u.uFocusWeeks!.value as Vector2).set(s.focusFrom, s.focusTo);
    u.uFocus!.value = s.focus;
    const shadowStrength = this.dropper.visible ? Math.max(0, 1 - (this.tip.y - 0.2) / 3.2) : 0;
    (u.uShadow!.value as Vector3).set(this.tip.x, this.tip.z, shadowStrength);

    this.renderer.render(this.scene, this.camera);
    this.placeLabels();

    if (this.onFirstFrame) {
      const cb = this.onFirstFrame;
      this.onFirstFrame = undefined;
      cb();
    }
  }

  private placeLabels() {
    const base = this.state.labels;
    for (const label of this.labels) {
      const a = base * (label.weight ? label.weight() : 1);
      if (a <= 0.01) {
        label.el.style.opacity = "0";
        label.el.style.visibility = "hidden";
        continue;
      }
      this.tmp.set(label.at[0], label.at[1], label.at[2]).project(this.camera);
      const behind = this.tmp.z > 1;
      const x = (this.tmp.x * 0.5 + 0.5) * this.width;
      const y = (-this.tmp.y * 0.5 + 0.5) * this.height;
      label.el.style.visibility = behind ? "hidden" : "visible";
      label.el.style.opacity = String(Math.min(1, a));
      label.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    }
  }
}
