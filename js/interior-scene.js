// ============================================================
// Casa de Simon I. Patino - Uncia
// Recorrido 3D Interior: Un unico visor por estacion, Narrador IA y sin props sueltos
// ============================================================

import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import {
  loadGLB,
  enableShadows,
  disposeObject
} from './glb-loader.js';

// ---------- LOS 9 PUNTOS DE INTERES CON TUS ARCHIVOS EXACTOS ----------
const HOTSPOTS = [
  {
    id: 'spot-1',
    label: '1',
    title: '1. Ingreso para entrar',
    glbModel: './models/casa.glb',
    fallbackGlb: ['./casa.glb', './models/casa-exterior.glb'],
    description: 'Umbral principal del palacio que Sim\u00f3n I. Pati\u00f1o prometi\u00f3 a su esposa Albina Rodr\u00edguez Ocampo cuando vendi\u00f3 sus joyas en Oruro para apoyarlo en La Salvadora. Sus 73 ambientes fueron divididos con puertas acristaladas tras pasar a manos de COMIBOL en 1952.',
    position: { x: -7.85, y: 16.00, z: -10.26 }
  },
  {
    id: 'spot-2',
    label: '2',
    title: '2. Cuarto de cuadros',
    glbModel: './models/casita.glb',
    fallbackGlb: ['./casita.glb', './models/casa.glb'],
    description: 'Galer\u00eda de retratos, maquetas y lienzos de \u00e9poca que documentaban el ascenso del cochabambino Sim\u00f3n I. Pati\u00f1o desde los parajes del cerro Juan del Valle hasta convertirse en uno de los hombres m\u00e1s acaudalados del mundo.',
    position: { x: -6.07, y: 16.00, z: -3.49 }
  },
  {
    id: 'spot-3',
    label: '3',
    title: '3. Sal\u00f3n doctorcitos y festividad',
    glbModel: './models/traje_patino.glb',
    description: 'Sal\u00f3n conmemorativo dedicado a las celebraciones, recepciones de gala y tradiciones festivas de Unc\u00eda y el norte de Potos\u00ed, donde la elegancia del frac y el bast\u00f3n de principios del siglo XX se entrelazaba con la identidad cultural minera.',
    position: { x: -4.78, y: 16.00, z: 7.80 }
  },
  {
    id: 'spot-4',
    label: '4',
    title: '4. Piano',
    glbModel: './models/piano_antiguo.glb',
    description: 'Piano europeo transportado con enorme esfuerzo a trav\u00e9s de los Andes para amenizar las veladas del palacio. Seg\u00fan la leyenda de Unc\u00eda, m\u00e1s de ochenta a\u00f1os despu\u00e9s de la partida de Pati\u00f1o, por las noches a\u00fan parecen escucharse su melod\u00eda y el tintineo de un brindis.',
    position: { x: -9.70, y: 16.00, z: 13.16 }
  },
  {
    id: 'spot-5',
    label: '5',
    title: '5. El T\u00edo',
    glbModel: './models/el_tio.glb',
    description: 'Representaci\u00f3n del \u00abT\u00edo\u00bb de la mina, se\u00f1or y guardi\u00e1n de los socavones de La Salvadora y del cerro Juan del Valle, a quien los m\u00e1s de 5.000 trabajadores mineros entregaban hojas de coca, cigarrillos y alcohol en busca de protecci\u00f3n y vetas ricas.',
    position: { x: -4.85, y: 16.00, z: 23.16 }
  },
  {
    id: 'spot-6',
    label: '6',
    title: '6. Carruaje',
    glbModel: './models/carruaje.glb',
    description: 'En una sala contigua a la capilla privada descansa este carruaje ingl\u00e9s rehabilitado de 1870 en el que Sim\u00f3n I. Pati\u00f1o paseaba por las calles de Unc\u00eda al lado de su esposa Albina antes de la inauguraci\u00f3n del ferrocarril.',
    position: { x: 3.85, y: 16.00, z: 6.89 }
  },
  {
    id: 'spot-7',
    label: '7',
    title: '7. Sal\u00f3n de baile',
    image: './img/salon de baile.png',
    fallbackImages: [
      './salon de baile.png',
      './models/salon de baile.png',
      './img/salon.png',
      './salon.png',
      './models/salon.png'
    ],
    description: 'Imponente sal\u00f3n de baile y recepciones cuyos muros estaban cubiertos de un intenso rojo guindo que contrastaba con la blancura de sus arcos, iluminado bajo techos de cristales italianos de Venecia con murales de sus canales.',
    position: { x: 3.77, y: 16.00, z: -9.46 }
  },
  {
    id: 'spot-8',
    label: '8',
    title: '8. Reserva silla',
    glbModel: './models/carruaje.glb',
    description: 'Ambiente de resguardo de la siller\u00eda se\u00f1orial de madera oscura, mesas de recepci\u00f3n y las bancas originales de madera de la capilla privada que a\u00fan se conservan dentro de la residencia.',
    position: { x: 0.19, y: 16.00, z: -23.99 }
  },
  {
    id: 'spot-9',
    label: '9',
    title: '9. Sala de videos antiguo',
    glbModel: './models/camara_cine.glb',
    description: 'Archivo audiovisual de la \u00e9poca dorada de Unc\u00eda y Catavi, cuando en la localidad se escuchaban hasta 15 idiomas y los proyectores cinematogr\u00e1ficos de 35 mm iluminaban las noches del norte de Potos\u00ed.',
    position: { x: -7.61, y: 16.00, z: -24.82 }
  }
];

const MODEL_URL = new URL('../models/casa-interior.glb?v=3', import.meta.url).href;
const EYE_HEIGHT = 1.65;
const INTERACTION_DISTANCE = 2.8;
const START_POS = { x: -10.63, y: 16.58, z: -13.48 };
const BASE_SPEED = 3.6;
const SPRINT_SPEED = 9.0;

// Sin modelos GLB extra sueltos en los pasillos del interior
const PROPS = [];

// ---------- Referencias del DOM ----------
const wrap = document.getElementById('scene-interior');
const loadingEl = wrap.querySelector('.scene-loading');
const interiorPct = document.getElementById('interior-pct');
const interiorFill = document.getElementById('interior-fill');
const noteEl = wrap.querySelector('.model-note');
const enterPrompt = document.getElementById('enter-prompt');
const crosshair = wrap.querySelector('.crosshair');
const touchControls = wrap.querySelector('.touch-controls');
const interactHUD = document.getElementById('interact-hud');
const lightControlPanel = document.getElementById('light-control-panel');
const interiorDock = document.getElementById('interior-dock');

const panel = document.getElementById('detail-panel');
const panelTag = document.getElementById('panel-tag');
const panelTitle = document.getElementById('panel-title');
const panelDesc = document.getElementById('panel-desc');
const panelClose = panel.querySelector('.close-btn');
const panelGlbViewer = document.getElementById('panel-glb-viewer');
const panelStationImg = document.getElementById('panel-station-img');
const panelMediaHint = document.getElementById('panel-media-hint');

const glbBtnReset    = document.getElementById('glb-btn-reset');
const glbBtnMacro    = document.getElementById('glb-btn-macro');
const glbBtnSpin     = document.getElementById('glb-btn-spin');
const glbBtnNarrator = document.getElementById('glb-btn-narrator');

const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

if (lightControlPanel) lightControlPanel.addEventListener('click', (e) => e.stopPropagation());
if (interiorDock) interiorDock.addEventListener('click', (e) => e.stopPropagation());
if (panel) panel.addEventListener('click', (e) => e.stopPropagation());

// ---------- Narrador de Voz con IA (Web Speech API) ----------
let narratorActive = true;

function speakInteriorStation(title, description) {
  if (!narratorActive || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(title + '. ' + description);
    u.lang = 'es-ES';
    u.rate = 0.96;
    u.pitch = 0.95;
    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('es'));
    if (esVoice) u.voice = esVoice;
    window.speechSynthesis.speak(u);
    if (glbBtnNarrator) {
      glbBtnNarrator.classList.add('active');
      glbBtnNarrator.textContent = 'Narrador IA: Hablando (Pausar)';
    }
  } catch (_) {}
}

function stopInteriorNarration() {
  if ('speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch (_) {}
  }
}

if (glbBtnNarrator) {
  glbBtnNarrator.addEventListener('click', () => {
    narratorActive = !narratorActive;
    if (!narratorActive) {
      stopInteriorNarration();
      glbBtnNarrator.classList.remove('active');
      glbBtnNarrator.textContent = 'Narrador IA: Silencio (Activar)';
    } else {
      glbBtnNarrator.classList.add('active');
      glbBtnNarrator.textContent = 'Narrador IA: Hablando (Pausar)';
      const spot = HOTSPOTS[currentOpenedSpotIndex];
      if (spot) speakInteriorStation(spot.title, spot.description);
    }
  });
}

// ---------- Escena con Atmosfera Vintage Antigua ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x21160d);
scene.fog = new THREE.FogExp2(0x24180e, 0.018);

const camera = new THREE.PerspectiveCamera(
  60, wrap.clientWidth / wrap.clientHeight, 0.05, 200
);
camera.position.set(START_POS.x, START_POS.y, START_POS.z);
const player = camera;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(wrap.clientWidth, wrap.clientHeight);
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
wrap.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(wrap.clientWidth, wrap.clientHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.left = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
wrap.appendChild(labelRenderer.domElement);

// ---------- Iluminacion Vintage / Antigua ----------
const ambientLight = new THREE.AmbientLight(0xffd7a8, 0.95);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0xffe4bd, 0x5c3c20, 0.78);
scene.add(hemiLight);

const pointLights = [];
const posicionesLuces = [
  { x: -7.26, y: 18.20, z: 4.25 },
  { x: -7.04, y: 18.20, z: 13.02 },
  { x: -3.56, y: 18.20, z: 19.38 },
  { x:  2.26, y: 18.20, z: 7.27 },
  { x:  1.80, y: 18.20, z: -23.98 },
  { x: -7.26, y: 18.20, z: -3.38 },
  { x: -6.26, y: 18.20, z: -24.09 },
  { x: -6.68, y: 18.20, z: -14.66 }
];

let userPointIntensity = 15;

posicionesLuces.forEach((pos) => {
  const luz = new THREE.PointLight(0xffa64d, userPointIntensity, 28, 1.45);
  luz.position.set(pos.x, pos.y, pos.z);
  scene.add(luz);
  pointLights.push(luz);
});

const rangePoint = document.getElementById('range-point');
const valPoint = document.getElementById('val-point');
const rangeAmbient = document.getElementById('range-ambient');
const valAmbient = document.getElementById('val-ambient');
const toggleLightPanelBtn = document.getElementById('toggle-light-panel');
const lightPanelContent = document.getElementById('light-panel-content');

let panelExpanded = true;
if (toggleLightPanelBtn && lightPanelContent) {
  toggleLightPanelBtn.addEventListener('click', () => {
    panelExpanded = !panelExpanded;
    lightPanelContent.style.display = panelExpanded ? 'flex' : 'none';
    toggleLightPanelBtn.textContent = panelExpanded ? '-' : '+';
  });
}

if (rangePoint && valPoint) {
  rangePoint.addEventListener('input', (e) => {
    userPointIntensity = parseFloat(e.target.value);
    valPoint.textContent = userPointIntensity;
    pointLights.forEach((l) => { l.intensity = userPointIntensity; });
  });
}

if (rangeAmbient && valAmbient) {
  rangeAmbient.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    valAmbient.textContent = val;
    ambientLight.intensity = val;
  });
}

document.querySelectorAll('[data-light-preset]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-light-preset]').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const mode = btn.dataset.lightPreset;

    if (mode === 'candle') {
      scene.background.setHex(0x21160d);
      scene.fog.color.setHex(0x24180e);
      ambientLight.color.setHex(0xffd7a8);
      ambientLight.intensity = 0.95;
      hemiLight.color.setHex(0xffe4bd);
      hemiLight.groundColor.setHex(0x5c3c20);
      userPointIntensity = 15;
      pointLights.forEach((l) => { l.color.setHex(0xffa64d); l.intensity = 15; });
    } else if (mode === 'chandelier') {
      scene.background.setHex(0x2a1f16);
      scene.fog.color.setHex(0x2a1f16);
      ambientLight.color.setHex(0xffe6c4);
      ambientLight.intensity = 1.25;
      hemiLight.color.setHex(0xfff0d6);
      hemiLight.groundColor.setHex(0x7a5838);
      userPointIntensity = 22;
      pointLights.forEach((l) => { l.color.setHex(0xffc982); l.intensity = 22; });
    } else if (mode === 'museum') {
      scene.background.setHex(0x292420);
      scene.fog.color.setHex(0x292420);
      ambientLight.color.setHex(0xffffff);
      ambientLight.intensity = 1.4;
      hemiLight.color.setHex(0xffffff);
      hemiLight.groundColor.setHex(0xd8cfc4);
      userPointIntensity = 14;
      pointLights.forEach((l) => { l.color.setHex(0xfff4e0); l.intensity = 14; });
    }

    if (rangePoint) rangePoint.value = userPointIntensity;
    if (valPoint) valPoint.textContent = userPointIntensity;
    if (rangeAmbient) rangeAmbient.value = ambientLight.intensity;
    if (valAmbient) valAmbient.textContent = ambientLight.intensity;
  });
});

// ---------- Habitacion de Reemplazo ----------
let floorMesh = null;
const collidables = [];

function buildPlaceholderRoom() {
  const group = new THREE.Group();
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x6b5233, roughness: 0.95 });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.9 });
  const ROOM = 8;

  floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(ROOM, ROOM), floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  group.add(floorMesh);

  const wallH = 3;
  const back = new THREE.Mesh(new THREE.BoxGeometry(ROOM, wallH, 0.2), wallMat);
  back.position.set(0, wallH / 2, -ROOM / 2);
  group.add(back); collidables.push(back);

  enableShadows(group);
  return group;
}

// ---------- Carga del Modelo Interior (casa-interior.glb) ----------
let realModelLoaded = false;
let placeholderGroup = null;
let hotspotsPlaced = false;
let settleFrames = 0;

function finishLoading() {
  if (interiorPct) interiorPct.textContent = '100%';
  if (interiorFill) interiorFill.style.width = '100%';
  setTimeout(() => loadingEl.classList.add('hidden'), 280);
}

function setLoadingProgress(pct, msg) {
  const clamped = Math.min(99, Math.max(0, Math.round(pct)));
  if (interiorPct) interiorPct.textContent = clamped + '%';
  if (interiorFill) interiorFill.style.width = clamped + '%';
  const p = loadingEl.querySelector('.preloader-status');
  if (p && msg) p.textContent = msg;
}

function showFallback() {
  if (realModelLoaded || placeholderGroup) return;
  placeholderGroup = buildPlaceholderRoom();
  scene.add(placeholderGroup);
  player.position.set(0, EYE_HEIGHT, 3);
  settleFrames = 90;
  finishLoading();
  if (noteEl) noteEl.hidden = false;
  placeHotspots();
}

function onModelProgress(xhr) {
  if (xhr.lengthComputable && xhr.total > 0) {
    const pct = Math.round((xhr.loaded / xhr.total) * 100);
    setLoadingProgress(pct, `Cargando los 73 ambientes (${pct}%)...`);
  } else {
    const mb = (xhr.loaded / 1048576).toFixed(1);
    setLoadingProgress(Math.min(92, xhr.loaded / 450000), `Descargando modelo interior (${mb} MB)...`);
  }
}

const fallbackTimer = setTimeout(() => {
  if (!realModelLoaded) showFallback();
}, 90000);

async function loadInterior() {
  try {
    const gltf = await loadGLB(MODEL_URL, onModelProgress);
    clearTimeout(fallbackTimer);
    realModelLoaded = true;

    if (placeholderGroup) {
      scene.remove(placeholderGroup);
      disposeObject(placeholderGroup);
      placeholderGroup = null;
    }
    collidables.length = 0;
    floorMesh = null;

    const model = gltf.scene;
    model.traverse((n) => {
      if (n.isMesh) {
        n.castShadow = true;
        n.receiveShadow = true;
        if (n.material) {
          const mats = Array.isArray(n.material) ? n.material : [n.material];
          mats.forEach((m) => { m.side = THREE.DoubleSide; });
        }
        collidables.push(n);
        if (!floorMesh && /floor|piso|suelo/i.test(n.name)) floorMesh = n;
      }
    });

    scene.add(model);
    player.position.set(START_POS.x, START_POS.y, START_POS.z);
    settleFrames = 90;

    finishLoading();
    if (noteEl) noteEl.hidden = true;
    placeHotspots();
  } catch (error) {
    clearTimeout(fallbackTimer);
    console.error('ERROR AL CARGAR GLB:', MODEL_URL, error.message);
    showFallback();
  }
}

loadInterior();

if (noteEl) {
  const closeBtn = noteEl.querySelector('button');
  if (closeBtn) closeBtn.addEventListener('click', () => { noteEl.hidden = true; });
}

// ---------- Marcadores 3D (1 al 9) y Apertura de Cuadro Unico ----------
let currentOpenedSpotIndex = 0;
let currentGlbFallbackIdx = 0;
let currentImgFallbackIdx = 0;

// Si un archivo .glb (como casa.glb o casita.glb) esta en otra ruta, probar respaldos automaticamente
if (panelGlbViewer) {
  panelGlbViewer.addEventListener('error', () => {
    const spot = HOTSPOTS[currentOpenedSpotIndex];
    if (spot && Array.isArray(spot.fallbackGlb) && currentGlbFallbackIdx < spot.fallbackGlb.length) {
      panelGlbViewer.src = spot.fallbackGlb[currentGlbFallbackIdx++];
    }
  });
}

// Si la imagen salon de baile.png esta en raiz o en img/ o en models/, probar respaldos automaticamente
if (panelStationImg) {
  panelStationImg.addEventListener('error', () => {
    const spot = HOTSPOTS[currentOpenedSpotIndex];
    if (spot && Array.isArray(spot.fallbackImages) && currentImgFallbackIdx < spot.fallbackImages.length) {
      panelStationImg.src = spot.fallbackImages[currentImgFallbackIdx++];
    }
  });
}

function placeHotspots() {
  if (hotspotsPlaced) return;
  hotspotsPlaced = true;

  HOTSPOTS.forEach((spot, index) => {
    const el = document.createElement('div');
    el.className = 'hotspot';
    el.title = spot.title;
    el.innerHTML = `<span class="hotspot-label">${spot.label}</span>`;
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      openPanelByIndex(index);
    });
    const obj = new CSS2DObject(el);
    obj.position.set(spot.position.x, spot.position.y, spot.position.z);
    scene.add(obj);
  });
}

document.querySelectorAll('.room-jump-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const idx = parseInt(btn.dataset.spotIndex, 10);
    const spot = HOTSPOTS[idx];
    if (!spot) return;

    player.position.set(spot.position.x, spot.position.y + 0.5, spot.position.z + 1.1);
    settleFrames = 45;
    openPanelByIndex(idx);
  });
});

function openPanelByIndex(index) {
  if (index < 0 || index >= HOTSPOTS.length) return;
  currentOpenedSpotIndex = index;
  currentGlbFallbackIdx = 0;
  currentImgFallbackIdx = 0;
  const spot = HOTSPOTS[index];

  document.querySelectorAll('.room-jump-btn').forEach((b, i) => {
    b.classList.toggle('active', i === index);
  });

  if (panelTag) panelTag.textContent = `Estaci\u00f3n ${index + 1} de ${HOTSPOTS.length} - Recorrido 3D`;
  panelTitle.textContent = spot.title;
  panelDesc.textContent = spot.description;

  // Mostrar IMAGEN (en Salon de Baile) o UN UNICO MODELO GLB en las demas estaciones
  if (spot.image) {
    if (panelGlbViewer) panelGlbViewer.style.display = 'none';
    if (glbBtnReset) glbBtnReset.style.display = 'none';
    if (glbBtnMacro) glbBtnMacro.style.display = 'none';
    if (glbBtnSpin)  glbBtnSpin.style.display = 'none';
    if (panelMediaHint) panelMediaHint.textContent = 'Registro Fotogr\u00e1fico del Sal\u00f3n';

    if (panelStationImg) {
      panelStationImg.style.display = 'block';
      panelStationImg.src = spot.image;
    }
  } else {
    if (panelStationImg) panelStationImg.style.display = 'none';
    if (glbBtnReset) glbBtnReset.style.display = 'inline-block';
    if (glbBtnMacro) glbBtnMacro.style.display = 'inline-block';
    if (glbBtnSpin)  glbBtnSpin.style.display = 'inline-block';
    if (panelMediaHint) panelMediaHint.textContent = 'Arrastra para girar - Rueda para acercar';

    if (panelGlbViewer && spot.glbModel) {
      panelGlbViewer.style.display = 'block';
      panelGlbViewer.src = spot.glbModel;
      panelGlbViewer.cameraOrbit = '30deg 72deg 105%';
      panelGlbViewer.fieldOfView = '42deg';
      panelGlbViewer.autoRotate = true;
    }
  }

  panel.classList.add('open');
  speakInteriorStation(spot.title, spot.description);
  clearMoveState();
  if (controlsLocked) controls.unlock();
  if (interactHUD) interactHUD.style.display = 'none';
}

function openPanel(spot) {
  const idx = HOTSPOTS.findIndex((s) => s.id === spot.id);
  openPanelByIndex(idx >= 0 ? idx : 0);
}

if (glbBtnReset && panelGlbViewer) {
  glbBtnReset.addEventListener('click', () => {
    panelGlbViewer.cameraOrbit = '30deg 72deg 105%';
    panelGlbViewer.fieldOfView = '42deg';
  });
}
if (glbBtnMacro && panelGlbViewer) {
  glbBtnMacro.addEventListener('click', () => {
    panelGlbViewer.autoRotate = false;
    panelGlbViewer.cameraOrbit = '0deg 65deg 52%';
    panelGlbViewer.fieldOfView = '24deg';
  });
}
if (glbBtnSpin && panelGlbViewer) {
  glbBtnSpin.addEventListener('click', () => {
    panelGlbViewer.autoRotate = !panelGlbViewer.autoRotate;
  });
}

document.getElementById('panel-prev-spot').addEventListener('click', () => {
  const prev = (currentOpenedSpotIndex - 1 + HOTSPOTS.length) % HOTSPOTS.length;
  const spot = HOTSPOTS[prev];
  player.position.set(spot.position.x, spot.position.y + 0.5, spot.position.z + 1.1);
  settleFrames = 45;
  openPanelByIndex(prev);
});

document.getElementById('panel-next-spot').addEventListener('click', () => {
  const next = (currentOpenedSpotIndex + 1) % HOTSPOTS.length;
  const spot = HOTSPOTS[next];
  player.position.set(spot.position.x, spot.position.y + 0.5, spot.position.z + 1.1);
  settleFrames = 45;
  openPanelByIndex(next);
});

function closePanel() {
  stopInteriorNarration();
  panel.classList.remove('open');
  if (!isTouch) controls.lock();
}
panelClose.addEventListener('click', closePanel);

// ---------- Proximidad y Tecla "E" ----------
let activeHotspot = null;
const spotVec = new THREE.Vector3();

function checkProximityInteraction() {
  if (panel.classList.contains('open')) {
    activeHotspot = null;
    if (interactHUD) interactHUD.style.display = 'none';
    return;
  }

  const playerPos = player.position;
  let nearestSpot = null;
  let minDistance = INTERACTION_DISTANCE;

  HOTSPOTS.forEach((spot) => {
    spotVec.set(spot.position.x, spot.position.y, spot.position.z);
    const dist = playerPos.distanceTo(spotVec);
    if (dist < minDistance) {
      minDistance = dist;
      nearestSpot = spot;
    }
  });

  activeHotspot = nearestSpot;

  if (activeHotspot && interactHUD) {
    if (isTouch) {
      interactHUD.innerHTML = `Toca para ver historia y modelo 3D: <strong>${activeHotspot.title}</strong>`;
      interactHUD.style.pointerEvents = 'auto';
      interactHUD.onclick = () => openPanel(activeHotspot);
    } else {
      interactHUD.innerHTML = `Presiona <kbd>E</kbd> para ver historia y pieza: <strong>${activeHotspot.title}</strong>`;
      interactHUD.style.pointerEvents = 'none';
    }
    interactHUD.style.display = 'block';
  } else if (interactHUD) {
    interactHUD.style.display = 'none';
  }
}

// ---------- Controles Primera Persona ----------
const controls = new PointerLockControls(camera, renderer.domElement);
scene.add(camera);
let controlsLocked = false;

const move = { forward: false, back: false, left: false, right: false, sprint: false };

function clearMoveState() {
  move.forward = move.back = move.left = move.right = move.sprint = false;
}

if (!isTouch) {
  enterPrompt.addEventListener('click', () => {
    if (!panel.classList.contains('open')) controls.lock();
  });

  controls.addEventListener('lock', () => {
    controlsLocked = true;
    enterPrompt.style.display = 'none';
    crosshair.style.display = 'block';
  });

  controls.addEventListener('unlock', () => {
    controlsLocked = false;
    crosshair.style.display = 'none';
    if (!panel.classList.contains('open')) enterPrompt.style.display = 'flex';
    clearMoveState();
  });

  document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyE') {
      if (panel.classList.contains('open')) {
        closePanel();
        return;
      } else if (activeHotspot) {
        openPanel(activeHotspot);
        return;
      }
    }

    if (e.code === 'Escape') closePanel();

    switch (e.code) {
      case 'KeyW': case 'ArrowUp': move.forward = true; break;
      case 'KeyS': case 'ArrowDown': move.back = true; break;
      case 'KeyA': case 'ArrowLeft': move.left = true; break;
      case 'KeyD': case 'ArrowRight': move.right = true; break;
      case 'ShiftLeft': case 'ShiftRight': move.sprint = true; break;
    }
  });

  document.addEventListener('keyup', (e) => {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp': move.forward = false; break;
      case 'KeyS': case 'ArrowDown': move.back = false; break;
      case 'KeyA': case 'ArrowLeft': move.left = false; break;
      case 'KeyD': case 'ArrowRight': move.right = false; break;
      case 'ShiftLeft': case 'ShiftRight': move.sprint = false; break;
    }
  });
} else {
  enterPrompt.style.display = 'none';
  touchControls.classList.add('active');

  let lastX = null, lastY = null;
  let yaw = 0, pitch = 0;

  renderer.domElement.addEventListener('touchstart', (e) => {
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
  }, { passive: true });

  renderer.domElement.addEventListener('touchmove', (e) => {
    if (lastX === null) return;
    const dx = e.touches[0].clientX - lastX;
    const dy = e.touches[0].clientY - lastY;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
    yaw -= dx * 0.0035;
    pitch -= dy * 0.0035;
    pitch = Math.max(-1.3, Math.min(1.3, pitch));
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
  }, { passive: true });

  renderer.domElement.addEventListener('touchend', () => { lastX = null; lastY = null; });

  function bindHold(id, key) {
    const btn = document.getElementById(id);
    if (!btn) return;
    const start = (e) => { e.preventDefault(); move[key] = true; };
    const end = () => { move[key] = false; };
    btn.addEventListener('touchstart', start, { passive: false });
    btn.addEventListener('touchend', end);
    btn.addEventListener('touchcancel', end);
  }
  bindHold('btn-forward', 'forward');
  bindHold('btn-back', 'back');
  bindHold('btn-left', 'left');
  bindHold('btn-right', 'right');
}

// ---------- Movimiento y Colisiones ----------
const raycaster = new THREE.Raycaster();
const downRay = new THREE.Raycaster();
const DOWN = new THREE.Vector3(0, -1, 0);
const tmpForward = new THREE.Vector3();
const tmpRight = new THREE.Vector3();
const tmpMove = new THREE.Vector3();
const tmpOrigin = new THREE.Vector3();

function tryMove(dt) {
  const currentSpeed = (move.sprint ? SPRINT_SPEED : BASE_SPEED) * dt;

  camera.getWorldDirection(tmpForward);
  tmpForward.y = 0;
  tmpForward.normalize();
  tmpRight.crossVectors(tmpForward, camera.up).normalize();

  tmpMove.set(0, 0, 0);
  if (move.forward) tmpMove.add(tmpForward);
  if (move.back) tmpMove.addScaledVector(tmpForward, -1);
  if (move.right) tmpMove.add(tmpRight);
  if (move.left) tmpMove.addScaledVector(tmpRight, -1);

  if (tmpMove.lengthSq() === 0) return false;

  tmpMove.normalize().multiplyScalar(currentSpeed);

  tmpOrigin.copy(player.position);
  tmpOrigin.y -= EYE_HEIGHT * 0.45;

  if (collidables.length) {
    raycaster.set(tmpOrigin, tmpMove.clone().normalize());
    raycaster.far = tmpMove.length() + 0.4;
    const hits = raycaster.intersectObjects(collidables, false);
    if (hits.length && hits[0].distance < tmpMove.length() + 0.4) return false;
  }

  player.position.add(tmpMove);
  return true;
}

function snapToFloor(dt) {
  downRay.set(
    new THREE.Vector3(player.position.x, player.position.y + 3, player.position.z),
    DOWN
  );
  const targets = floorMesh ? [floorMesh, ...collidables] : collidables;
  if (!targets.length) return;
  const hits = downRay.intersectObjects(targets, false);
  if (hits.length) {
    const targetY = hits[0].point.y + EYE_HEIGHT;
    if (Math.abs(player.position.y - targetY) < 2.0) {
      player.position.y += (targetY - player.position.y) * Math.min(1, dt * 10);
    }
  }
}

// ---------- Bucle Principal ----------
const coordDebugEl = document.getElementById('coord-debug');
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1);
  const elapsed = clock.elapsedTime;

  pointLights.forEach((l, i) => {
    const flicker = 1 + Math.sin(elapsed * 4.5 + i * 1.7) * 0.045;
    l.intensity = userPointIntensity * flicker;
  });

  if ((controlsLocked || isTouch) && !panel.classList.contains('open')) {
    const moved = tryMove(dt);
    if (moved || settleFrames > 0) {
      snapToFloor(dt);
      if (settleFrames > 0) settleFrames--;
    }
  }

  checkProximityInteraction();

  if (coordDebugEl) {
    const p = camera.position;
    coordDebugEl.textContent = `x: ${p.x.toFixed(2)} - y: ${p.y.toFixed(2)} - z: ${p.z.toFixed(2)}`;
  }

  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = wrap.clientWidth / wrap.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(wrap.clientWidth, wrap.clientHeight);
  labelRenderer.setSize(wrap.clientWidth, wrap.clientHeight);
});