import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

import {
  RenderMode,
  CameraMode,
  LightingPreset,
  MarbleTone,
  SteelFinish,
  FloorColor,
  CameraPreset,
  WallVisibility,
  GlossLevel,
  HotspotItem,
} from '../../types/archviz';
import { TransformMode, TransformData, SceneItemMeta } from '../../types/editor';
import { HOTSPOTS_DATA } from '../../data/equipmentData';
import { RoomBuilder, RoomMeshes } from './RoomBuilder';

export interface ImperativeEditorActions {
  updateTransform: (partial: Partial<TransformData>) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  resetSelected: () => void;
  resetAll: () => void;
  toggleItemVisibility: (id: string) => void;
  deleteItemById: (id: string) => void;
  addItem: (type: 'bin' | 'drain' | 'demarcation') => void;
}

interface ThreeCanvasProps {
  renderMode: RenderMode;
  cameraMode: CameraMode;
  lightingPreset: LightingPreset;
  wallVisibility: WallVisibility;
  marbleTone: MarbleTone;
  steelFinish: SteelFinish;
  floorColor: FloorColor;
  glossLevel?: GlossLevel;
  bloomEnabled?: boolean;
  exposure?: number;
  showDimensions: boolean;
  showHotspots: boolean;
  isDoorOpen: boolean;
  isTapActive: boolean;
  onToggleTap: () => void;
  isCipActive: boolean;
  onToggleCip: () => void;
  activePreset: CameraPreset | null;
  selectedEquipmentId: string | null;
  onSelectEquipment: (id: string | null) => void;
  onToggleDoor: () => void;
  isMeasuring: boolean;
  onMeasuredDistance: (dist: number | null) => void;
  onCaptureScreenshotRef?: (trigger: () => void) => void;
  onFpsUpdate?: (fps: number) => void;
  transformMode?: TransformMode;
  snapEnabled?: boolean;
  lockCameraRotation?: boolean;
  onTransformChange?: (data: TransformData) => void;
  onSceneItemsInitialized?: (items: SceneItemMeta[]) => void;
  imperativeEditorRef?: React.MutableRefObject<ImperativeEditorActions | null>;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  renderMode,
  cameraMode,
  lightingPreset,
  wallVisibility,
  marbleTone,
  steelFinish,
  floorColor,
  glossLevel = 'satin_hospital',
  bloomEnabled = true,
  exposure = 0.95,
  showDimensions,
  showHotspots,
  isDoorOpen,
  isTapActive,
  onToggleTap,
  isCipActive,
  onToggleCip,
  activePreset,
  selectedEquipmentId,
  onSelectEquipment,
  onToggleDoor,
  isMeasuring,
  onMeasuredDistance,
  onCaptureScreenshotRef,
  onFpsUpdate,
  transformMode = 'translate',
  snapEnabled = true,
  lockCameraRotation = false,
  onTransformChange,
  onSceneItemsInitialized,
  imperativeEditorRef,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const roomMeshesRef = useRef<RoomMeshes | null>(null);

  // TransformControls 3D Gizmo state
  const transformControlsRef = useRef<TransformControls | null>(null);
  const isDraggingGizmoRef = useRef<boolean>(false);
  const defaultTransformsRef = useRef<{ [id: string]: TransformData }>({});
  const onTransformChangeRef = useRef(onTransformChange);
  onTransformChangeRef.current = onTransformChange;

  // Hotspots Sprite Group
  const hotspotsGroupRef = useRef<THREE.Group | null>(null);

  // Shift Panning state
  const [isShiftActive, setIsShiftActive] = useState(false);
  const isShiftRef = useRef(false);

  // Walkthrough state
  const fpPosRef = useRef(new THREE.Vector3(0, 1.68, 1.5));
  const fpYawRef = useRef(0);
  const fpPitchRef = useRef(0);
  const keysDownRef = useRef<{ [key: string]: boolean }>({});
  const isPointerDownRef = useRef(false);
  const previousPointerPosRef = useRef({ x: 0, y: 0 });

  // Door Animation State
  const doorCurrentOffsetRef = useRef(0);

  // Measurement State
  const measurePointsRef = useRef<THREE.Vector3[]>([]);
  const measureLineRef = useRef<THREE.Line | null>(null);

  // Transition animation
  const transitionRef = useRef<{
    active: boolean;
    startPos: THREE.Vector3;
    endPos: THREE.Vector3;
    startTarget: THREE.Vector3;
    endTarget: THREE.Vector3;
    progress: number;
  }>({
    active: false,
    startPos: new THREE.Vector3(),
    endPos: new THREE.Vector3(),
    startTarget: new THREE.Vector3(),
    endTarget: new THREE.Vector3(),
    progress: 0,
  });

  const highlightBoxRef = useRef<THREE.BoxHelper | null>(null);

  // 1. INITIALIZE THREE.JS SCENE WITH UNREAL ENGINE STANDARDS
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1120); // Dark cleanroom slate
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    camera.position.set(0.65, 3.35, 5.05);
    cameraRef.current = camera;

    // WebGLRenderer with PCFSoftShadowMap & ACES Filmic
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = exposure; // Calibrated for authentic cleanroom lighting
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // IBL Environment Map: RoomEnvironment with PMREMGenerator
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    const envTexture = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    scene.environment = envTexture;
    // Calibrate environment intensity to avoid blinding specular reflections
    (scene as any).environmentIntensity = 0.35;

    // OrbitControls with Damping enabled
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(-0.25, 1.15, -0.45);
    controls.maxPolarAngle = Math.PI / 2.05; // avoid going under floor
    controls.minDistance = 1.2;
    controls.maxDistance = 18;
    controls.screenSpacePanning = true;
    controlsRef.current = controls;

    // Build the 3D Room & Equipment
    const room = RoomBuilder.buildRoom(renderer, envTexture, {
      marbleTone,
      floorColor,
      steelFinish,
      renderMode,
      wallVisibility,
      glossLevel,
    });
    scene.add(room.root);
    roomMeshesRef.current = room;

    room.setWaterActive(isTapActive);
    room.setCipActive(isCipActive);

    // Record initial transforms and notify parent of scene items
    const initialItems: SceneItemMeta[] = [];
    const nameMap: { [key: string]: { name: string; cat: string } } = {
      demarcation_counter_right: { name: 'Faixa Amarela: Lateral da Bancada', cat: 'Demarcações do Piso' },
      demarcation_counter_front: { name: 'Faixa Amarela: Frontal da Bancada', cat: 'Demarcações do Piso' },
      demarcation_bay_divider: { name: 'Faixa Amarela: Divisória Baia dos Bins', cat: 'Demarcações do Piso' },
      demarcation_front_corridor: { name: 'Faixa Amarela: Corredor da Porta', cat: 'Demarcações do Piso' },
      floor_drain: { name: 'Canaleta Linear de Dreno Inox', cat: 'Drenagem & Piso' },
      bin_1000l_1: { name: 'Bin Farmacêutico 1000L (#1)', cat: 'IBC Inox 316L' },
      bin_1000l_2: { name: 'Bin Farmacêutico 1000L (#2)', cat: 'IBC Inox 316L' },
      platform_stairs: { name: 'Plataforma Móvel com Escada', cat: 'Acesso & Operação' },
      marble_counter_sink: { name: 'Bancada 3,00m & Cuba Profunda Central', cat: 'Lavagem & Bancada' },
      shelving_units: { name: 'Armário Sanitário de Canto', cat: 'Mobiliário Sanitário' },
      overhead_piping: { name: 'Tubulações Aéreas Água & Ar', cat: 'Utilidades Aéreas' },
      sliding_door: { name: 'Porta de Correr 3,50m', cat: 'Acesso Principal' },
      bumper_rail_left: { name: 'Bate-Rodas Inox: Parede Esquerda', cat: 'Proteção Sanitária' },
      bumper_rail_right: { name: 'Bate-Rodas Inox: Parede Direita', cat: 'Proteção Sanitária' },
      bumper_rail_back: { name: 'Bate-Rodas Inox: Parede Traseira', cat: 'Proteção Sanitária' },
      bumper_rail_front: { name: 'Bate-Rodas Inox: Parede Frontal', cat: 'Proteção Sanitária' },
      hose_reel_mount: { name: 'Suporte de Parede Inox (Carretel)', cat: 'Lavagem & Utilidades' },
      wash_hose_coiled: { name: 'Mangueira de Lavagem com Pistola', cat: 'Lavagem & Utilidades' },
      cleanroom_window_left: { name: 'Janela Farmacêutica Esquerda (Atrás da Pia)', cat: 'Esquadrias & Visores' },
      cleanroom_window_right: { name: 'Janela Farmacêutica Direita (Atrás da Pia)', cat: 'Esquadrias & Visores' },
    };

    for (const [id, obj] of Object.entries(room.interactiveObjects)) {
      defaultTransformsRef.current[id] = {
        position: { x: Number(obj.position.x.toFixed(3)), y: Number(obj.position.y.toFixed(3)), z: Number(obj.position.z.toFixed(3)) },
        rotation: {
          x: Number(THREE.MathUtils.radToDeg(obj.rotation.x).toFixed(1)),
          y: Number(THREE.MathUtils.radToDeg(obj.rotation.y).toFixed(1)),
          z: Number(THREE.MathUtils.radToDeg(obj.rotation.z).toFixed(1)),
        },
        scale: { x: Number(obj.scale.x.toFixed(2)), y: Number(obj.scale.y.toFixed(2)), z: Number(obj.scale.z.toFixed(2)) },
      };
      const meta = nameMap[id] || { name: obj.name || id, cat: 'Elemento da Sala' };
      initialItems.push({
        id,
        name: meta.name,
        category: meta.cat,
        visible: obj.visible,
        defaultTransform: defaultTransformsRef.current[id],
      });
    }

    if (onSceneItemsInitialized) {
      onSceneItemsInitialized(initialItems);
    }

    // TransformControls 3D Interactive Gizmo
    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.size = 0.85;
    transformControls.setMode(transformMode);
    if (snapEnabled) {
      transformControls.setTranslationSnap(0.05);
      transformControls.setRotationSnap(THREE.MathUtils.degToRad(15));
      transformControls.setScaleSnap(0.05);
    }
    transformControlsRef.current = transformControls;
    const gizmoHelper = transformControls.getHelper();
    scene.add(gizmoHelper);

    transformControls.addEventListener('dragging-changed', (event: any) => {
      isDraggingGizmoRef.current = Boolean(event.value);
      if (controlsRef.current) {
        controlsRef.current.enabled = !event.value;
      }
    });

    transformControls.addEventListener('change', () => {
      const obj = transformControls.object;
      if (!obj) return;
      if (highlightBoxRef.current) {
        highlightBoxRef.current.setFromObject(obj);
      }
      if (onTransformChangeRef.current) {
        onTransformChangeRef.current({
          position: {
            x: Number(obj.position.x.toFixed(3)),
            y: Number(obj.position.y.toFixed(3)),
            z: Number(obj.position.z.toFixed(3)),
          },
          rotation: {
            x: Number(THREE.MathUtils.radToDeg(obj.rotation.x).toFixed(1)),
            y: Number(THREE.MathUtils.radToDeg(obj.rotation.y).toFixed(1)),
            z: Number(THREE.MathUtils.radToDeg(obj.rotation.z).toFixed(1)),
          },
          scale: {
            x: Number(obj.scale.x.toFixed(2)),
            y: Number(obj.scale.y.toFixed(2)),
            z: Number(obj.scale.z.toFixed(2)),
          },
        });
      }
    });

    // 3D Floating Hotspots Group (Kept empty - blue circle markers removed per user request)
    const hotspotsGroup = new THREE.Group();
    hotspotsGroup.name = 'HotspotsGroup';
    hotspotsGroup.visible = false;
    scene.add(hotspotsGroup);
    hotspotsGroupRef.current = hotspotsGroup;

    // Highlight helper for selected items
    const dummyObj = new THREE.Object3D();
    const boxHelper = new THREE.BoxHelper(dummyObj, 0x38bdf8);
    boxHelper.visible = false;
    scene.add(boxHelper);
    highlightBoxRef.current = boxHelper;

    // EffectComposer Post-Processing: UnrealBloomPass & OutputPass
    let composer: EffectComposer | null = null;
    try {
      composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      // UnrealBloomPass: threshold 0.96 (prevents metal glow), strength 0.10, radius 0.20
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        0.10,
        0.20,
        0.96
      );
      bloomPass.enabled = bloomEnabled;
      bloomPassRef.current = bloomPass;
      composer.addPass(bloomPass);

      const outputPass = new OutputPass();
      composer.addPass(outputPass);
      composerRef.current = composer;
    } catch (err) {
      console.warn('Post-processing fallback to direct render:', err);
    }

    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (composerRef.current) {
        composerRef.current.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    let frameId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let lastFpsUpdate = performance.now();

    const animate = (time: number) => {
      frameId = requestAnimationFrame(animate);

      frameCount++;
      if (time - lastFpsUpdate >= 500) {
        const fps = Math.round((frameCount * 1000) / (time - lastFpsUpdate));
        if (onFpsUpdate) onFpsUpdate(fps);
        frameCount = 0;
        lastFpsUpdate = time;
      }

      const delta = (time - lastTime) / 1000;
      lastTime = time;

      // 1. Camera Transition Animation
      if (transitionRef.current.active) {
        transitionRef.current.progress += delta * 1.8;
        const t = Math.min(1, transitionRef.current.progress);
        const easeT = 0.5 - 0.5 * Math.cos(t * Math.PI);

        camera.position.lerpVectors(transitionRef.current.startPos, transitionRef.current.endPos, easeT);
        controls.target.lerpVectors(
          transitionRef.current.startTarget,
          transitionRef.current.endTarget,
          easeT
        );

        if (t >= 1) {
          transitionRef.current.active = false;
        }
      } else if (cameraMode === 'walkthrough') {
        // First Person Walkthrough
        controls.enabled = false;
        const speed = 2.4 * delta;
        const forward = new THREE.Vector3(
          -Math.sin(fpYawRef.current),
          0,
          -Math.cos(fpYawRef.current)
        ).normalize();
        const right = new THREE.Vector3(
          Math.cos(fpYawRef.current),
          0,
          -Math.sin(fpYawRef.current)
        ).normalize();

        const moveDir = new THREE.Vector3();
        if (keysDownRef.current['KeyW'] || keysDownRef.current['ArrowUp']) moveDir.add(forward);
        if (keysDownRef.current['KeyS'] || keysDownRef.current['ArrowDown']) moveDir.sub(forward);
        if (keysDownRef.current['KeyA'] || keysDownRef.current['ArrowLeft']) moveDir.sub(right);
        if (keysDownRef.current['KeyD'] || keysDownRef.current['ArrowRight']) moveDir.add(right);

        if (moveDir.lengthSq() > 0) {
          moveDir.normalize().multiplyScalar(speed);
          fpPosRef.current.add(moveDir);

          const halfW = RoomBuilder.WIDTH / 2 - 0.45;
          const halfD = RoomBuilder.DEPTH / 2 - 0.45;
          fpPosRef.current.x = Math.max(-halfW, Math.min(halfW, fpPosRef.current.x));
          fpPosRef.current.z = Math.max(-halfD, Math.min(halfD, fpPosRef.current.z));
        }

        camera.position.copy(fpPosRef.current);
        const lookDir = new THREE.Vector3(
          -Math.sin(fpYawRef.current) * Math.cos(fpPitchRef.current),
          Math.sin(fpPitchRef.current),
          -Math.cos(fpYawRef.current) * Math.cos(fpPitchRef.current)
        );
        camera.lookAt(fpPosRef.current.clone().add(lookDir));
      } else {
        controls.enabled = true;
        controls.update(); // smooth damping
      }

      // 2. Door Sliding Animation
      const targetDoorOffset = isDoorOpen ? 1.55 : 0;
      doorCurrentOffsetRef.current = THREE.MathUtils.lerp(
        doorCurrentOffsetRef.current,
        targetDoorOffset,
        delta * 3.5
      );

      if (room.doorLeft && room.doorRight) {
        const doorClearW = RoomBuilder.DOOR_WIDTH;
        const halfW = RoomBuilder.WIDTH / 2;
        const doorStartX = halfW - doorClearW - 0.3;
        const doorCenterX = doorStartX + doorClearW / 2;
        const doorLeafW = doorClearW / 2 + 0.08;

        room.doorLeft.position.x = doorCenterX - doorLeafW / 2 - doorCurrentOffsetRef.current;
        room.doorRight.position.x = doorCenterX + doorLeafW / 2 + doorCurrentOffsetRef.current;
      }

      // 3. Water Particles Simulation when Tap Active
      if (room.waterSplashParticles && room.waterSplashParticles.visible) {
        const posAttr = room.waterSplashParticles.geometry.attributes.position as THREE.BufferAttribute;
        const count = posAttr.count;
        for (let i = 0; i < count; i++) {
          let y = posAttr.getY(i);
          y -= delta * 0.4;
          if (y < 0.61) {
            y = 0.63 + Math.random() * 0.08;
          }
          posAttr.setY(i, y);
        }
        posAttr.needsUpdate = true;
      }

      // 4. CIP Wash Water Spray Simulation Particles
      if (room.cipSprayGroup && room.cipSprayGroup.visible) {
        room.cipSprayGroup.children.forEach((child) => {
          if (child instanceof THREE.Points) {
            const posAttr = child.geometry.attributes.position as THREE.BufferAttribute;
            const count = posAttr.count;
            for (let i = 0; i < count; i++) {
              let y = posAttr.getY(i);
              y -= delta * 1.8;
              if (y < 1.35) {
                y = 2.65 - Math.random() * 0.15;
              }
              posAttr.setY(i, y);
            }
            posAttr.needsUpdate = true;
          }
        });
      }

      // Render via Composer with Bloom or standard fallback
      if (composerRef.current) {
        composerRef.current.render();
      } else {
        renderer.render(scene, camera);
      }
    };

    frameId = requestAnimationFrame(animate);

    // Keyboard handlers with Shift Pan detection
    const handleKeyDown = (e: KeyboardEvent) => {
      keysDownRef.current[e.code] = true;
      if (e.key === 'Shift') {
        isShiftRef.current = true;
        setIsShiftActive(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysDownRef.current[e.code] = false;
      if (e.key === 'Shift') {
        isShiftRef.current = false;
        setIsShiftActive(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    if (onCaptureScreenshotRef) {
      onCaptureScreenshotRef(() => {
        if (composerRef.current) {
          composerRef.current.render();
        } else {
          renderer.render(scene, camera);
        }
        const link = document.createElement('a');
        link.download = `ArchViz_UE5_Sala_Limpa_${new Date().toISOString().slice(0, 10)}.png`;
        link.href = renderer.domElement.toDataURL('image/png');
        link.click();
      });
    }

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      transformControls.dispose();
      controls.dispose();
      renderer.dispose();
      pmremGenerator.dispose();
      roomEnv.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Sync Water Active State
  useEffect(() => {
    if (roomMeshesRef.current) {
      roomMeshesRef.current.setWaterActive(isTapActive);
    }
  }, [isTapActive]);

  // Sync CIP Wash Simulation Active State
  useEffect(() => {
    if (roomMeshesRef.current) {
      roomMeshesRef.current.setCipActive(isCipActive);
    }
  }, [isCipActive]);

  // Sync Hotspots Visibility
  useEffect(() => {
    if (hotspotsGroupRef.current) {
      hotspotsGroupRef.current.visible = showHotspots;
    }
  }, [showHotspots]);

  // Sync Wall Visibility Mode
  useEffect(() => {
    if (roomMeshesRef.current) {
      roomMeshesRef.current.updateWallVisibility(wallVisibility);
    }
  }, [wallVisibility]);

  // Update Materials / Tone / Finishes / Render Mode / Gloss
  useEffect(() => {
    if (!roomMeshesRef.current) return;
    roomMeshesRef.current.updateMaterials({
      marbleTone,
      floorColor,
      steelFinish,
      renderMode,
      glossLevel,
    });
  }, [marbleTone, floorColor, steelFinish, renderMode, glossLevel]);

  // Update Exposure Dynamically
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.toneMappingExposure = exposure;
    }
  }, [exposure]);

  // Update Bloom Pass Toggle
  useEffect(() => {
    if (bloomPassRef.current) {
      bloomPassRef.current.enabled = bloomEnabled;
    }
  }, [bloomEnabled]);

  // Update Dimensions Visibility
  useEffect(() => {
    if (!roomMeshesRef.current) return;
    roomMeshesRef.current.dimensionGroup.visible = showDimensions;
  }, [showDimensions]);

  // Update Lighting Presets with balanced, realistic hospital illumination
  useEffect(() => {
    if (!sceneRef.current || !rendererRef.current || !roomMeshesRef.current) return;
    const scene = sceneRef.current;
    const spots = roomMeshesRef.current.ceilingLights;
    const fill = roomMeshesRef.current.fillLight;

    if (lightingPreset === 'cleanroom_1000lux') {
      // "Inspeção Técnica (1000 Lux)" - Crisp neutral white without harsh blinding glare
      rendererRef.current.toneMappingExposure = exposure * 1.05;
      scene.background = new THREE.Color(0x0f172a);
      spots.forEach((sp) => {
        sp.color.setHex(0xf8fafc);
        sp.intensity = 1.35;
      });
      fill.color.setHex(0xdbeafe);
      fill.intensity = 0.32;
    } else if (lightingPreset === 'daylight') {
      // "Modo Diurno Hospitalar" - Soft, pleasant natural cleanroom daylight
      rendererRef.current.toneMappingExposure = exposure;
      scene.background = new THREE.Color(0x0a101d);
      spots.forEach((sp) => {
        sp.color.setHex(0xfff7ed);
        sp.intensity = 1.05;
      });
      fill.color.setHex(0xfef3c7);
      fill.intensity = 0.28;
    } else if (lightingPreset === 'uvc_sanitization') {
      // "Desinfecção UV-C" - Deep ultraviolet glow with moody shadows
      rendererRef.current.toneMappingExposure = exposure * 0.9;
      scene.background = new THREE.Color(0x090314);
      spots.forEach((sp) => {
        sp.color.setHex(0x7c3aed);
        sp.intensity = 1.8;
      });
      fill.color.setHex(0x4338ca);
      fill.intensity = 0.5;
    } else if (lightingPreset === 'standby') {
      // "Modo Standby Noturno"
      rendererRef.current.toneMappingExposure = exposure * 0.75;
      scene.background = new THREE.Color(0x050810);
      spots.forEach((sp, i) => {
        sp.color.setHex(0xfde047);
        sp.intensity = i % 2 === 0 ? 0.6 : 0.05;
      });
      fill.color.setHex(0x1e293b);
      fill.intensity = 0.15;
    }
  }, [lightingPreset, exposure]);

  // Camera Preset Transitions
  useEffect(() => {
    if (!activePreset || !cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    transitionRef.current = {
      active: true,
      startPos: camera.position.clone(),
      endPos: new THREE.Vector3(...activePreset.position),
      startTarget: controls.target.clone(),
      endTarget: new THREE.Vector3(...activePreset.target),
      progress: 0,
    };

    if (cameraMode === 'walkthrough') {
      fpPosRef.current.set(...activePreset.position);
      const dir = new THREE.Vector3(...activePreset.target).sub(fpPosRef.current).normalize();
      fpYawRef.current = Math.atan2(-dir.x, -dir.z);
      fpPitchRef.current = Math.asin(dir.y);
    }
  }, [activePreset, cameraMode]);

  // Selected Equipment Highlight & TransformControls Gizmo Attachment
  useEffect(() => {
    const box = highlightBoxRef.current;
    const tc = transformControlsRef.current;
    if (!roomMeshesRef.current) return;

    if (selectedEquipmentId && roomMeshesRef.current.interactiveObjects[selectedEquipmentId]) {
      const obj = roomMeshesRef.current.interactiveObjects[selectedEquipmentId];
      if (box) {
        box.setFromObject(obj);
        box.visible = true;
      }
      if (tc) {
        tc.attach(obj);
      }
      if (onTransformChange) {
        onTransformChange({
          position: {
            x: Number(obj.position.x.toFixed(3)),
            y: Number(obj.position.y.toFixed(3)),
            z: Number(obj.position.z.toFixed(3)),
          },
          rotation: {
            x: Number(THREE.MathUtils.radToDeg(obj.rotation.x).toFixed(1)),
            y: Number(THREE.MathUtils.radToDeg(obj.rotation.y).toFixed(1)),
            z: Number(THREE.MathUtils.radToDeg(obj.rotation.z).toFixed(1)),
          },
          scale: {
            x: Number(obj.scale.x.toFixed(2)),
            y: Number(obj.scale.y.toFixed(2)),
            z: Number(obj.scale.z.toFixed(2)),
          },
        });
      }
    } else {
      if (box) box.visible = false;
      if (tc) tc.detach();
    }
  }, [selectedEquipmentId]);

  // Sync transformMode
  useEffect(() => {
    if (transformControlsRef.current && transformMode) {
      transformControlsRef.current.setMode(transformMode);
    }
  }, [transformMode]);

  // Sync snapEnabled
  useEffect(() => {
    if (transformControlsRef.current) {
      if (snapEnabled) {
        transformControlsRef.current.setTranslationSnap(0.05);
        transformControlsRef.current.setRotationSnap(THREE.MathUtils.degToRad(15));
        transformControlsRef.current.setScaleSnap(0.05);
      } else {
        transformControlsRef.current.setTranslationSnap(null);
        transformControlsRef.current.setRotationSnap(null);
        transformControlsRef.current.setScaleSnap(null);
      }
    }
  }, [snapEnabled]);

  // Sync Camera Rotation Lock (Stops screen from spinning while editing)
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enableRotate = !lockCameraRotation;
    }
  }, [lockCameraRotation]);

  // Wire Imperative Actions to Ref
  useEffect(() => {
    if (!imperativeEditorRef) return;
    imperativeEditorRef.current = {
      updateTransform: (partial) => {
        if (!selectedEquipmentId || !roomMeshesRef.current) return;
        const obj = roomMeshesRef.current.interactiveObjects[selectedEquipmentId];
        if (!obj) return;

        if (partial.position) {
          if (partial.position.x !== undefined) obj.position.x = partial.position.x;
          if (partial.position.y !== undefined) obj.position.y = partial.position.y;
          if (partial.position.z !== undefined) obj.position.z = partial.position.z;
        }
        if (partial.rotation) {
          if (partial.rotation.x !== undefined) obj.rotation.x = THREE.MathUtils.degToRad(partial.rotation.x);
          if (partial.rotation.y !== undefined) obj.rotation.y = THREE.MathUtils.degToRad(partial.rotation.y);
          if (partial.rotation.z !== undefined) obj.rotation.z = THREE.MathUtils.degToRad(partial.rotation.z);
        }
        if (partial.scale) {
          if (partial.scale.x !== undefined) obj.scale.x = partial.scale.x;
          if (partial.scale.y !== undefined) obj.scale.y = partial.scale.y;
          if (partial.scale.z !== undefined) obj.scale.z = partial.scale.z;
        }

        if (highlightBoxRef.current) highlightBoxRef.current.setFromObject(obj);
        if (transformControlsRef.current) transformControlsRef.current.attach(obj);
      },
      deleteSelected: () => {
        if (!selectedEquipmentId || !roomMeshesRef.current) return;
        const obj = roomMeshesRef.current.interactiveObjects[selectedEquipmentId];
        if (!obj) return;
        obj.visible = false;
        if (transformControlsRef.current) transformControlsRef.current.detach();
        if (highlightBoxRef.current) highlightBoxRef.current.visible = false;
        onSelectEquipment(null);
      },
      duplicateSelected: () => {
        if (!selectedEquipmentId || !roomMeshesRef.current || !sceneRef.current) return;
        const srcObj = roomMeshesRef.current.interactiveObjects[selectedEquipmentId];
        if (!srcObj) return;

        const clone = srcObj.clone(true);
        const newId = `${selectedEquipmentId}_copy_${Date.now() % 10000}`;
        clone.name = `${srcObj.name || selectedEquipmentId} (Cópia)`;
        clone.position.x += 0.35;
        clone.position.z += 0.35;
        clone.visible = true;

        sceneRef.current.add(clone);
        roomMeshesRef.current.interactiveObjects[newId] = clone;

        defaultTransformsRef.current[newId] = {
          position: { x: Number(clone.position.x.toFixed(3)), y: Number(clone.position.y.toFixed(3)), z: Number(clone.position.z.toFixed(3)) },
          rotation: {
            x: Number(THREE.MathUtils.radToDeg(clone.rotation.x).toFixed(1)),
            y: Number(THREE.MathUtils.radToDeg(clone.rotation.y).toFixed(1)),
            z: Number(THREE.MathUtils.radToDeg(clone.rotation.z).toFixed(1)),
          },
          scale: { x: Number(clone.scale.x.toFixed(2)), y: Number(clone.scale.y.toFixed(2)), z: Number(clone.scale.z.toFixed(2)) },
        };

        onSelectEquipment(newId);
      },
      resetSelected: () => {
        if (!selectedEquipmentId || !roomMeshesRef.current) return;
        const obj = roomMeshesRef.current.interactiveObjects[selectedEquipmentId];
        const def = defaultTransformsRef.current[selectedEquipmentId];
        if (!obj || !def) return;

        obj.position.set(def.position.x, def.position.y, def.position.z);
        obj.rotation.set(
          THREE.MathUtils.degToRad(def.rotation.x),
          THREE.MathUtils.degToRad(def.rotation.y),
          THREE.MathUtils.degToRad(def.rotation.z)
        );
        obj.scale.set(def.scale.x, def.scale.y, def.scale.z);
        obj.visible = true;

        if (highlightBoxRef.current) highlightBoxRef.current.setFromObject(obj);
        if (transformControlsRef.current) transformControlsRef.current.attach(obj);
        if (onTransformChange) onTransformChange(def);
      },
      resetAll: () => {
        if (!roomMeshesRef.current) return;
        for (const [id, def] of Object.entries(defaultTransformsRef.current)) {
          const obj = roomMeshesRef.current.interactiveObjects[id];
          if (obj) {
            obj.position.set(def.position.x, def.position.y, def.position.z);
            obj.rotation.set(
              THREE.MathUtils.degToRad(def.rotation.x),
              THREE.MathUtils.degToRad(def.rotation.y),
              THREE.MathUtils.degToRad(def.rotation.z)
            );
            obj.scale.set(def.scale.x, def.scale.y, def.scale.z);
            obj.visible = true;
          }
        }
        if (selectedEquipmentId && roomMeshesRef.current.interactiveObjects[selectedEquipmentId]) {
          const obj = roomMeshesRef.current.interactiveObjects[selectedEquipmentId];
          if (highlightBoxRef.current) highlightBoxRef.current.setFromObject(obj);
          if (transformControlsRef.current) transformControlsRef.current.attach(obj);
          const def = defaultTransformsRef.current[selectedEquipmentId];
          if (def && onTransformChange) onTransformChange(def);
        }
      },
      toggleItemVisibility: (id: string) => {
        if (!roomMeshesRef.current) return;
        const obj = roomMeshesRef.current.interactiveObjects[id];
        if (!obj) return;
        obj.visible = !obj.visible;
        if (!obj.visible && selectedEquipmentId === id) {
          if (transformControlsRef.current) transformControlsRef.current.detach();
          if (highlightBoxRef.current) highlightBoxRef.current.visible = false;
          onSelectEquipment(null);
        }
      },
      deleteItemById: (id: string) => {
        if (!roomMeshesRef.current) return;
        const obj = roomMeshesRef.current.interactiveObjects[id];
        if (!obj) return;
        obj.visible = false;
        if (selectedEquipmentId === id) {
          if (transformControlsRef.current) transformControlsRef.current.detach();
          if (highlightBoxRef.current) highlightBoxRef.current.visible = false;
          onSelectEquipment(null);
        }
      },
      addItem: (type) => {
        if (!roomMeshesRef.current || !sceneRef.current) return;
        let baseId = 'bin_1000l_1';
        const defaultPos = new THREE.Vector3(-0.6, 0, 0);
        if (type === 'drain') {
          baseId = 'floor_drain';
          defaultPos.set(0, 0, 0.4);
        } else if (type === 'demarcation') {
          baseId = 'floor_demarcation';
          defaultPos.set(0.6, 0.002, 0.6);
        }

        const srcObj = roomMeshesRef.current.interactiveObjects[baseId];
        if (!srcObj) return;

        const clone = srcObj.clone(true);
        const newId = `${type}_novo_${Date.now() % 10000}`;
        clone.position.copy(defaultPos);
        clone.visible = true;

        sceneRef.current.add(clone);
        roomMeshesRef.current.interactiveObjects[newId] = clone;

        defaultTransformsRef.current[newId] = {
          position: { x: Number(clone.position.x.toFixed(3)), y: Number(clone.position.y.toFixed(3)), z: Number(clone.position.z.toFixed(3)) },
          rotation: {
            x: Number(THREE.MathUtils.radToDeg(clone.rotation.x).toFixed(1)),
            y: Number(THREE.MathUtils.radToDeg(clone.rotation.y).toFixed(1)),
            z: Number(THREE.MathUtils.radToDeg(clone.rotation.z).toFixed(1)),
          },
          scale: { x: Number(clone.scale.x.toFixed(2)), y: Number(clone.scale.y.toFixed(2)), z: Number(clone.scale.z.toFixed(2)) },
        };

        onSelectEquipment(newId);
      },
    };
  });

  // Top Ortho Camera Switch
  useEffect(() => {
    if (cameraMode === 'top' && cameraRef.current && controlsRef.current) {
      transitionRef.current = {
        active: true,
        startPos: cameraRef.current.position.clone(),
        endPos: new THREE.Vector3(-0.3, 9.5, 0.01),
        startTarget: controlsRef.current.target.clone(),
        endTarget: new THREE.Vector3(-0.3, 0, 0),
        progress: 0,
      };
    }
  }, [cameraMode]);

  // Pointer Interaction Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isPointerDownRef.current = true;
    previousPointerPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current || !cameraRef.current) return;
    const deltaX = e.clientX - previousPointerPosRef.current.x;
    const deltaY = e.clientY - previousPointerPosRef.current.y;
    previousPointerPosRef.current = { x: e.clientX, y: e.clientY };

    // Shift Key Camera Pan (Horizontal & Vertical move)
    const isPanMode =
      e.shiftKey ||
      isShiftRef.current ||
      keysDownRef.current['ShiftLeft'] ||
      keysDownRef.current['ShiftRight'] ||
      e.buttons === 2 ||
      e.buttons === 4;

    if (isPanMode && controlsRef.current) {
      const right = new THREE.Vector3().setFromMatrixColumn(cameraRef.current.matrix, 0);
      const up = new THREE.Vector3().setFromMatrixColumn(cameraRef.current.matrix, 1);

      const dist = cameraRef.current.position.distanceTo(controlsRef.current.target);
      const panSpeed = 0.0018 * Math.max(1.5, dist);
      const panOffset = new THREE.Vector3()
        .addScaledVector(right, -deltaX * panSpeed)
        .addScaledVector(up, deltaY * panSpeed);

      controlsRef.current.target.add(panOffset);
      cameraRef.current.position.add(panOffset);

      if (cameraMode === 'walkthrough') {
        fpPosRef.current.add(panOffset);
      }
      return;
    }

    if (cameraMode === 'walkthrough') {
      fpYawRef.current += deltaX * 0.0035;
      fpPitchRef.current -= deltaY * 0.0035;
      fpPitchRef.current = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, fpPitchRef.current));
    }
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
  };

  const handleClick = (e: React.MouseEvent) => {
    // 0. If user just finished dragging the 3D Gizmo, ignore click to maintain selection
    if (isDraggingGizmoRef.current) {
      isDraggingGizmoRef.current = false;
      return;
    }

    if (!mountRef.current || !cameraRef.current || !roomMeshesRef.current || !sceneRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    // 1. Check Hotspots click first
    if (showHotspots && hotspotsGroupRef.current) {
      const hsHits = raycaster.intersectObjects(hotspotsGroupRef.current.children, true);
      if (hsHits.length > 0) {
        const hsObj = hsHits[0].object;
        if (hsObj.userData && hsObj.userData.equipmentId) {
          onSelectEquipment(hsObj.userData.equipmentId);
          return;
        }
      }
    }

    // 2. Measuring Tool
    if (isMeasuring) {
      const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
      if (intersects.length > 0) {
        const pt = intersects[0].point;
        measurePointsRef.current.push(pt);

        if (measurePointsRef.current.length === 1) {
          onMeasuredDistance(null);
        } else if (measurePointsRef.current.length === 2) {
          const p1 = measurePointsRef.current[0];
          const p2 = measurePointsRef.current[1];
          const dist = p1.distanceTo(p2);
          onMeasuredDistance(dist);

          if (measureLineRef.current) sceneRef.current.remove(measureLineRef.current);
          const lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
          const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 3 });
          const line = new THREE.Line(lineGeo, lineMat);
          sceneRef.current.add(line);
          measureLineRef.current = line;

          measurePointsRef.current = [];
        }
      }
      return;
    }

    // 3. Equipment Selection Picking
    const interactiveDict = roomMeshesRef.current.interactiveObjects;
    let clickedId: string | null = null;

    for (const [id, obj] of Object.entries(interactiveDict)) {
      if (!obj.visible) continue;
      const hits = raycaster.intersectObject(obj, true);
      if (hits.length > 0) {
        clickedId = id;
        break;
      }
    }

    if (clickedId === 'sliding_door' && !selectedEquipmentId) {
      onToggleDoor();
    }

    onSelectEquipment(clickedId);
  };

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full select-none outline-none overflow-hidden ${
        isShiftActive ? 'cursor-move' : 'cursor-grab active:cursor-grabbing'
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handleClick}
      onContextMenu={(e) => e.preventDefault()}
      tabIndex={0}
    >
      {/* Shift Pan Indicator Badge */}
      {isShiftActive && (
        <div className="absolute top-16 right-6 z-20 pointer-events-none flex items-center gap-2 px-3 py-1.5 bg-blue-950/90 border border-blue-400 text-blue-200 rounded-lg text-xs font-mono shadow-xl backdrop-blur-md animate-pulse">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
          <span>Shift Ativo: Arraste para mover (Pan H/V)</span>
        </div>
      )}

      {/* Camera Rotation Locked Indicator Badge */}
      {lockCameraRotation && (
        <div className="absolute bottom-20 left-6 z-20 pointer-events-none flex items-center gap-2 px-3 py-1.5 bg-rose-950/90 border border-rose-500/60 text-rose-200 rounded-lg text-xs font-mono shadow-xl backdrop-blur-md animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
          <span>Giro da Tela Travado (Modo Edição)</span>
        </div>
      )}
    </div>
  );
};
