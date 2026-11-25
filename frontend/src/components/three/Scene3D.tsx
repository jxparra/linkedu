"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * Escenas 3D de fondo, cada una con objetos de su sección:
 * - estudio: fichas, lápices de fosforito, libros y polvo de tiza (portada e Inicio)
 * - social: una red de personas (nodos unidos por líneas) que gira despacio
 * - foros: bocadillos de conversación que suben
 * - empleo: maletines y documentos flotando
 *
 * Los colores salen de los tokens de globals.css y cambian solos con el modo oscuro.
 * Se para cuando no se ve (otra pestaña o fuera de pantalla) y, con «reducir movimiento», se queda quieta.
 */
export type SceneKind = "estudio" | "social" | "foros" | "empleo";

type Palette = Record<"brand" | "mark" | "empleo" | "foros" | "card" | "ink" | "edge" | "page", THREE.Color>;

/** Con `onDark` (escena sobre la pizarra) el verde de marca pasa al color tiza, para que se vea sobre el fondo oscuro. */
function readPalette(onDark: boolean): Palette {
  const css = getComputedStyle(document.documentElement);
  const c = (name: string, fallback: string) => new THREE.Color((css.getPropertyValue(name).trim() || fallback) as THREE.ColorRepresentation);
  return {
    brand: onDark ? c("--color-spine-ink", "#a9c4b8") : c("--color-brand-600", "#2b5b4b"),
    mark: c("--color-mark", "#ffe24a"),
    empleo: c("--color-empleo", "#a66f00"),
    foros: c("--color-foros", "#b83a63"),
    card: c("--color-card", "#ffffff"),
    ink: c("--color-ink", "#1b1e1c"),
    edge: c("--color-edge", "#c8ccc6"),
    page: c("--color-page", "#f1f2ee"),
  };
}

/** Número pseudoaleatorio estable (misma escena en cada visita). */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

type Floater = {
  obj: THREE.Object3D;
  base: THREE.Vector3;
  amp: number;
  phase: number;
  spin: THREE.Vector3;
  speed: number;
};

type Built = {
  update: (t: number, dt: number) => void;
  recolor: (p: Palette) => void;
  /** Reparte los objetos por el espacio visible (ancho × alto en unidades 3D), sin deformarlos */
  fit?: (w: number, h: number) => void;
};

/** Materiales con nombre de color: así se pueden repintar al cambiar de tema. */
class Materials {
  list: {
    m: THREE.MeshStandardMaterial | THREE.LineBasicMaterial | THREE.PointsMaterial;
    key: keyof Palette;
    mix?: [keyof Palette, number];
  }[] = [];
  std(key: keyof Palette, p: Palette, opts: THREE.MeshStandardMaterialParameters = {}, mix?: [keyof Palette, number]) {
    const m = new THREE.MeshStandardMaterial({
      roughness: 0.65,
      metalness: 0.05,
      ...opts,
    });
    this.list.push({ m, key, mix });
    this.paint(p);
    return m;
  }
  line(key: keyof Palette, p: Palette, opacity: number) {
    const m = new THREE.LineBasicMaterial({ transparent: true, opacity });
    this.list.push({ m, key });
    this.paint(p);
    return m;
  }
  points(key: keyof Palette, p: Palette, size: number, opacity: number) {
    const m = new THREE.PointsMaterial({
      size,
      transparent: true,
      opacity,
      depthWrite: false,
    });
    this.list.push({ m, key });
    this.paint(p);
    return m;
  }
  paint(p: Palette) {
    for (const { m, key, mix } of this.list) {
      const col = p[key].clone();
      if (mix) col.lerp(p[mix[0]], mix[1]);
      m.color.copy(col);
    }
  }
}

function floatAll(list: Floater[], t: number, dt: number) {
  for (const f of list) {
    f.obj.position.y = f.base.y + Math.sin(t * f.speed + f.phase) * f.amp;
    f.obj.position.x = f.base.x + Math.cos(t * f.speed * 0.7 + f.phase) * f.amp * 0.4;
    f.obj.rotation.x += f.spin.x * dt;
    f.obj.rotation.y += f.spin.y * dt;
    f.obj.rotation.z += f.spin.z * dt;
  }
}

function spread(r: () => number, i: number, n: number, w: number, h: number, depth: [number, number]) {
  // Reparte en columnas para que no se amontonen
  const col = (i % Math.ceil(Math.sqrt(n * 1.6))) / Math.ceil(Math.sqrt(n * 1.6));
  return new THREE.Vector3((col - 0.5) * w + (r() - 0.5) * 1.6, (r() - 0.5) * h, depth[0] + r() * (depth[1] - depth[0]));
}

function buildEstudio(scene: THREE.Scene, p: Palette, mats: Materials, dense: boolean, margins: boolean): Built {
  const r = rng(7);
  const list: Floater[] = [];
  const cardGeo = new RoundedBoxGeometry(1.5, 1, 0.05, 3, 0.07);
  const stripeGeo = new THREE.BoxGeometry(1.5, 0.12, 0.06);
  const lineGeo = new THREE.BoxGeometry(1, 0.05, 0.058);
  const cardMat = mats.std("card", p, { roughness: 0.85 });
  const stripeMat = mats.std("brand", p);
  const lineMat = mats.std("edge", p);
  const pencilGeo = new THREE.CylinderGeometry(0.07, 0.07, 1.5, 6);
  const tipGeo = new THREE.ConeGeometry(0.07, 0.22, 6);
  const leadGeo = new THREE.ConeGeometry(0.025, 0.08, 6);
  const pencilMat = mats.std("mark", p, { roughness: 0.4 });
  const woodMat = new THREE.MeshStandardMaterial({
    color: 0xe9c99a,
    roughness: 0.9,
  });
  const leadMat = mats.std("ink", p);
  const bookGeo = new RoundedBoxGeometry(1.1, 0.24, 1.4, 2, 0.04);
  const pagesGeo = new THREE.BoxGeometry(1.02, 0.18, 1.3);
  const pagesMat = mats.std("page", p, { roughness: 1 });
  const bookMats = [mats.std("brand", p), mats.std("empleo", p), mats.std("foros", p)];

  // `margins`: fondo de Inicio. Solo fichas y lápices, y en los márgenes, nunca detrás del feed
  const n = dense ? 20 : margins ? 14 : 18;
  for (let i = 0; i < n; i++) {
    const kind = margins ? i % 2 : i % 3;
    const g = new THREE.Group();
    if (kind === 0) {
      const card = new THREE.Mesh(cardGeo, cardMat);
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.y = 0.44;
      g.add(card, stripe);
      for (let l = 0; l < 3; l++) {
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.scale.x = 0.55 + r() * 0.4;
        line.position.set(-0.2 + (1 - line.scale.x) * -0.25, 0.15 - l * 0.22, 0);
        g.add(line);
      }
    } else if (kind === 1) {
      const body = new THREE.Mesh(pencilGeo, pencilMat);
      const tip = new THREE.Mesh(tipGeo, woodMat);
      tip.position.y = 0.86;
      const lead = new THREE.Mesh(leadGeo, leadMat);
      lead.position.y = 0.98;
      g.add(body, tip, lead);
    } else {
      const book = new THREE.Mesh(bookGeo, bookMats[i % 3]);
      const pages = new THREE.Mesh(pagesGeo, pagesMat);
      pages.position.x = 0.06;
      g.add(book, pages);
    }
    const base = spread(r, i, n, 18, 9, [-7, 0.5]);
    if (margins) base.x = (i % 2 ? 1 : -1) * (6.5 + r() * 3);
    g.position.copy(base);
    g.rotation.set(r() * Math.PI, r() * Math.PI, r() * Math.PI);
    scene.add(g);
    list.push({
      obj: g,
      base,
      amp: 0.15 + r() * 0.35,
      phase: r() * Math.PI * 2,
      spin: new THREE.Vector3((r() - 0.5) * 0.25, (r() - 0.5) * 0.3, (r() - 0.5) * 0.15),
      speed: 0.35 + r() * 0.35,
    });
  }

  // Polvo de tiza
  const dust = new THREE.BufferGeometry();
  const pts = new Float32Array(260 * 3);
  for (let i = 0; i < pts.length; i += 3) {
    pts[i] = (r() - 0.5) * 22;
    pts[i + 1] = (r() - 0.5) * 12;
    pts[i + 2] = -8 + r() * 8;
  }
  dust.setAttribute("position", new THREE.BufferAttribute(pts, 3));
  const dustPts = new THREE.Points(dust, mats.points("mark", p, 0.06, 0.8));
  scene.add(dustPts);

  return {
    update(t, dt) {
      floatAll(list, t, dt);
      dustPts.rotation.y = t * 0.02;
      dustPts.position.y = Math.sin(t * 0.2) * 0.2;
    },
    recolor: (pal) => mats.paint(pal),
  };
}

function buildSocial(scene: THREE.Scene, p: Palette, mats: Materials, fill = false): Built {
  const r = rng(21);
  const group = new THREE.Group();
  // En la cabecera a toda pantalla hay más gente y la red ocupa todo el alto, sin acercarse a la cámara
  const n = fill ? 72 : 46;
  const nodes: THREE.Vector3[] = [];
  for (let i = 0; i < n; i++) {
    // Nube aplastada: más ancha que alta, como una franja
    const v = fill
      ? // Más densa a la derecha (raíz cuadrada) y más clara a la izquierda, donde están el título y el buscador
        new THREE.Vector3(Math.sqrt(r()) * 18 - 9, (r() - 0.5) * 9, -4 + (r() - 0.5) * 3)
      : new THREE.Vector3((r() - 0.5) * 16, (r() - 0.5) * 5, (r() - 0.5) * 6);
    nodes.push(v);
  }
  const orig = nodes.map((v) => v.clone());
  const sphere = new THREE.SphereGeometry(1, 20, 14);
  const people = new THREE.InstancedMesh(sphere, mats.std("brand", p, { roughness: 0.4 }), n);
  const highlights = new THREE.InstancedMesh(sphere, mats.std("mark", p, { roughness: 0.35, emissiveIntensity: 0.2 }), 6);
  const dummy = new THREE.Object3D();
  const sizes = nodes.map(() => (fill ? 0.08 + r() * 0.1 : 0.12 + r() * 0.16));
  for (let i = 0; i < 6; i++) {
    dummy.position.copy(nodes[i * 7]);
    dummy.scale.setScalar(sizes[i * 7] * 1.5);
    dummy.updateMatrix();
    highlights.setMatrixAt(i, dummy.matrix);
  }
  // Une cada nodo con sus 2 vecinos más cercanos
  const pairs: [number, number][] = [];
  nodes.forEach((a, i) => {
    const near = nodes
      .map((b, j) => ({ j, d: a.distanceTo(b) }))
      .filter((x) => x.j !== i)
      .sort((x, y) => x.d - y.d)
      .slice(0, 2);
    near.forEach(({ j }) => pairs.push([i, j]));
  });
  const lines = new THREE.BufferGeometry();
  const segPos = new Float32Array(pairs.length * 6);
  lines.setAttribute("position", new THREE.BufferAttribute(segPos, 3));
  // Coloca personas y enlaces según `nodes` (se repite al repartir la red por la cabecera)
  const place = () => {
    nodes.forEach((v, i) => {
      dummy.position.copy(v);
      dummy.scale.setScalar(sizes[i]);
      dummy.updateMatrix();
      people.setMatrixAt(i, dummy.matrix);
    });
    people.instanceMatrix.needsUpdate = true;
    pairs.forEach(([a, b], k) => segPos.set([nodes[a].x, nodes[a].y, nodes[a].z, nodes[b].x, nodes[b].y, nodes[b].z], k * 6));
    lines.attributes.position.needsUpdate = true;
    lines.computeBoundingSphere();
  };
  place();
  const links = new THREE.LineSegments(lines, mats.line("brand", p, fill ? 0.3 : 0.45));
  group.add(people, highlights, links);
  scene.add(group);

  return {
    update(t) {
      // A lo ancho de la pantalla, un giro pequeño: con el de siempre los extremos se saldrían de la franja
      group.rotation.y = Math.sin(t * 0.12) * (fill ? 0.12 : 0.5);
      group.rotation.x = Math.sin(t * 0.09) * (fill ? 0.06 : 0.12);
      // Los destacados «laten», como alguien que acaba de publicar
      for (let i = 0; i < 6; i++) {
        dummy.position.copy(nodes[i * 7]);
        dummy.scale.setScalar(sizes[i * 7] * (1.4 + Math.sin(t * 2 + i) * 0.25));
        dummy.updateMatrix();
        highlights.setMatrixAt(i, dummy.matrix);
      }
      highlights.instanceMatrix.needsUpdate = true;
    },
    recolor: (pal) => mats.paint(pal),
    // Como `fitter`: los nodos se separan para llenar lo que se ve, sin cambiar de tamaño
    fit: fill
      ? (w, h) => {
          nodes.forEach((v, i) => v.set((orig[i].x / 18) * w, (orig[i].y / 9) * h, orig[i].z));
          place();
        }
      : undefined,
  };
}

function buildForos(scene: THREE.Scene, p: Palette, mats: Materials, fill = false): Built {
  const r = rng(33);
  const list: Floater[] = [];
  const bubbleGeo = new RoundedBoxGeometry(1.4, 0.8, 0.22, 4, 0.2);
  const tailGeo = new THREE.ConeGeometry(0.16, 0.34, 3);
  const dotGeo = new THREE.SphereGeometry(0.07, 12, 8);
  const mainMat = mats.std("foros", p, { roughness: 0.5 });
  const lightMat = mats.std("card", p, { roughness: 0.8 });
  const dotMat = mats.std("ink", p);
  const dotLight = mats.std("card", p);
  // En la cabecera a toda pantalla: más burbujas, algo más pequeñas y sin acercarse a la cámara
  const n = fill ? 24 : 16;
  let top = 5.5; // altura a la que una burbuja vuelve a empezar abajo
  for (let i = 0; i < n; i++) {
    const own = i % 3 === 0;
    const g = new THREE.Group();
    const bubble = new THREE.Mesh(bubbleGeo, own ? mainMat : lightMat);
    const tail = new THREE.Mesh(tailGeo, own ? mainMat : lightMat);
    tail.position.set(own ? 0.45 : -0.45, -0.48, 0);
    tail.rotation.z = own ? -0.5 : 0.5;
    g.add(bubble, tail);
    for (let d = 0; d < 3; d++) {
      const dot = new THREE.Mesh(dotGeo, own ? dotLight : dotMat);
      dot.position.set((d - 1) * 0.28, 0, 0.12);
      g.add(dot);
    }
    const s = fill ? 0.6 + r() * 0.35 : 0.7 + r() * 0.6;
    g.scale.setScalar(s);
    const base = spread(r, i, n, fill ? 18 : 17, 9, fill ? [-8, -2] : [-6, 0]);
    g.position.copy(base);
    g.rotation.set((r() - 0.5) * 0.5, (r() - 0.5) * 0.8, (r() - 0.5) * 0.3);
    scene.add(g);
    list.push({
      obj: g,
      base,
      amp: 0.2,
      phase: r() * 6,
      spin: new THREE.Vector3(0, (r() - 0.5) * 0.2, 0),
      speed: 0.5 + r() * 0.3,
    });
  }
  // Se crea una vez: guarda las posiciones de partida para repartirlas en cada cambio de tamaño
  const fitAll = fill ? fitter(list) : null;
  return {
    update(t, dt) {
      for (const f of list) {
        // Suben despacio y vuelven a empezar abajo: la conversación no para
        f.base.y += dt * 0.35;
        if (f.base.y > top) f.base.y = -top;
        f.obj.children.slice(2).forEach((dot, k) => (dot.position.y = Math.max(0, Math.sin(t * 5 - k * 0.6)) * 0.08));
      }
      floatAll(list, t, dt);
    },
    recolor: (pal) => mats.paint(pal),
    fit: fitAll
      ? (w, h) => {
          fitAll(w, h);
          top = h / 2 + 1; // suben por todo el alto visible y salen por arriba antes de volver a empezar
        }
      : undefined,
  };
}

/**
 * Reparto proporcional: los objetos se crean en un espacio de 18 × 9 unidades y, al conocer el tamaño real
 * de lo que se ve, se separan o se juntan para llenarlo entero. El tamaño de cada objeto no cambia.
 */
function fitter(list: Floater[]) {
  const orig = list.map((f) => f.base.clone());
  return (w: number, h: number) =>
    list.forEach((f, i) => {
      f.base.x = (orig[i].x / 18) * w;
      f.base.y = (orig[i].y / 9) * h;
    });
}

function buildEmpleo(scene: THREE.Scene, p: Palette, mats: Materials, fill = false): Built {
  const r = rng(45);
  const list: Floater[] = [];
  const caseGeo = new RoundedBoxGeometry(1.3, 0.9, 0.38, 3, 0.08);
  const bandGeo = new THREE.BoxGeometry(1.32, 0.08, 0.4);
  const handleGeo = new THREE.TorusGeometry(0.2, 0.045, 8, 20, Math.PI);
  const docGeo = new RoundedBoxGeometry(0.9, 1.2, 0.03, 2, 0.04);
  const docLineGeo = new THREE.BoxGeometry(0.6, 0.05, 0.035);
  const caseMat = mats.std("empleo", p, { roughness: 0.45 });
  const bandMat = mats.std("ink", p, { roughness: 0.5 });
  const docMat = mats.std("card", p, { roughness: 0.9 });
  const lineMat = mats.std("edge", p);
  const checkMat = mats.std("brand", p);
  const n = fill ? 26 : 18;
  for (let i = 0; i < n; i++) {
    const g = new THREE.Group();
    if (i % 2 === 0) {
      const body = new THREE.Mesh(caseGeo, caseMat);
      const band = new THREE.Mesh(bandGeo, bandMat);
      const handle = new THREE.Mesh(handleGeo, bandMat);
      handle.position.y = 0.45;
      g.add(body, band, handle);
    } else {
      g.add(new THREE.Mesh(docGeo, docMat));
      for (let l = 0; l < 4; l++) {
        const line = new THREE.Mesh(docLineGeo, l === 0 ? checkMat : lineMat);
        line.position.set(0, 0.38 - l * 0.22, 0);
        line.scale.x = l === 0 ? 0.6 : 0.7 + r() * 0.3;
        g.add(line);
      }
    }
    // En la cabecera a toda pantalla: un poco más pequeños y sin acercarse a la cámara, para que ninguno salga gigante o cortado
    const base = spread(r, i, n, 18, 9, fill ? [-8, -2] : [-7, 0]);
    if (fill) g.scale.setScalar(0.7 + r() * 0.25);
    g.position.copy(base);
    g.rotation.set((r() - 0.5) * 1.2, r() * Math.PI, (r() - 0.5) * 0.6);
    scene.add(g);
    list.push({
      obj: g,
      base,
      amp: 0.2 + r() * 0.3,
      phase: r() * 6,
      spin: new THREE.Vector3((r() - 0.5) * 0.15, (r() - 0.5) * 0.35, (r() - 0.5) * 0.1),
      speed: 0.3 + r() * 0.4,
    });
  }
  return {
    update: (t, dt) => floatAll(list, t, dt),
    recolor: (pal) => mats.paint(pal),
    fit: fill ? fitter(list) : undefined,
  };
}

export default function Scene3D({
  kind,
  dense = false,
  onDark = false,
  ambient = false,
  fill = false,
  className = "",
}: {
  kind: SceneKind;
  dense?: boolean;
  onDark?: boolean;
  /** Fondo fijo de pantalla completa: objetos en los márgenes y se para tras 8 s sin mover el ratón */
  ambient?: boolean;
  /** La escena llena todo el espacio que ocupa, repartiendo los objetos en proporción (cabeceras de Social, Foros y Empleo) */
  fill?: boolean;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch {
      return; // Sin WebGL: la página se ve igual, sin el fondo 3D
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.style.display = "block";
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 60);
    camera.position.set(0, 0, 11);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a9a90, 1.6));
    const sun = new THREE.DirectionalLight(0xffffff, 1.8);
    sun.position.set(4, 6, 8);
    scene.add(sun);

    const mats = new Materials();
    let palette = readPalette(onDark);
    const built =
      kind === "social"
        ? buildSocial(scene, palette, mats, fill)
        : kind === "foros"
          ? buildForos(scene, palette, mats, fill)
          : kind === "empleo"
            ? buildEmpleo(scene, palette, mats, fill)
            : buildEstudio(scene, palette, mats, dense, ambient);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = { x: 0, y: 0 };
    let lastMove = performance.now();
    let running = false;
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      lastMove = performance.now();
      if (ambient && !running) sync(); // vuelve a moverse al mover el ratón
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const resize = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      // En bandas anchas y bajas se acerca la cámara para que los objetos no queden diminutos
      camera.position.z = w / h > 3 ? 8 : 11;
      camera.updateProjectionMatrix();
      if (built.fit) {
        // Tamaño visible a la profundidad media de los objetos (z ≈ -3), con un margen para que no se corten
        const dist = camera.position.z + 3;
        const visH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        built.fit(visH * camera.aspect * 0.9, visH * 0.66);
      }
      if (reduce.matches || !running) renderer.render(scene, camera);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    const clock = new THREE.Clock();
    let raf = 0;
    let visible = true;
    let acc = 0;
    const frame = () => {
      const delta = clock.getDelta();
      acc += delta;
      // 30 fotogramas por segundo bastan para un fondo y gastan la mitad de batería
      if (acc < 1 / 30) {
        raf = requestAnimationFrame(frame);
        return;
      }
      const dt = Math.min(acc, 0.05);
      acc = 0;
      const t = clock.elapsedTime;
      if (ambient && performance.now() - lastMove > 8000) {
        running = false; // quieto hasta que se mueva el ratón
        return;
      }
      built.update(t, dt);
      // La cámara sigue un poco al ratón: da profundidad sin marear
      camera.position.x += (pointer.x * 0.8 - camera.position.x) * 0.04;
      camera.position.y += (-pointer.y * 0.5 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, -2);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      if (reduce.matches) {
        running = false;
        built.update(1, 0);
        renderer.render(scene, camera);
        return;
      }
      running = true;
      clock.getDelta();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    function sync() {
      if (visible && document.visibilityState === "visible") start();
      else stop();
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    reduce.addEventListener("change", sync);

    // Repinta al cambiar entre claro y oscuro
    const mo = new MutationObserver(() => {
      palette = readPalette(onDark);
      built.recolor(palette);
      if (reduce.matches) renderer.render(scene, camera);
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // Entrada: la escena aparece con un fundido cuando ya está lista
    requestAnimationFrame(() => el.setAttribute("data-ready", ""));

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduce.removeEventListener("change", sync);
      window.removeEventListener("pointermove", onMove);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose();
      });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [kind, dense, onDark, ambient, fill]);

  return <div ref={host} aria-hidden className={`scene-3d ${className}`} />;
}
