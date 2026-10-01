import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RenderMode,
  CameraMode,
  LightingPreset,
  MarbleTone,
  SteelFinish,
  FloorColor,
  CameraPreset,
  WallVisibility,
} from '../../types/archviz';
import { RoomBuilder, RoomMeshes } from './RoomBuilder';

interface ThreeCanvasProps {
  renderMode: RenderMode;
  cameraMode: CameraMode;
  lightingPreset: LightingPreset;
  wallVisibility: WallVisibility;
  marbleTone: MarbleTone;
  steelFinish: SteelFinish;
  floorColor: FloorColor;
  showDimensions: boolean;
  isDoorOpen: boolean;
  isTapActive: boolean;
  onToggleTap: () => void;
  activePreset: CameraPreset | null;
  selectedEquipmentId: string | null;
  onSelectEquipment: (id: string | null) => void;
  onToggleDoor: () => void;
  isMeasuring: boolean;
  onMeasuredDistance: (dist: number | null) => void;
  onCaptureScreenshotRef?: (trigger: () => void) => void;
  onFpsUpdate?: (fps: number) => void;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  renderMode,
  cameraMode,
  lightingPreset,
  wallVisibility,
  marbleTone,
  steelFinish,
  floorColor,
  showDimensions,
  isDoorOpen,
  isTapActive,
  onToggleTap,
  activePreset,
  selectedEquipmentId,
  onSelectEquipment,
  onToggleDoor,
  isMeasuring,
  onMeasuredDistance,
  onCaptureScreenshotRef,
  onFpsUpdate,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const roomMeshesRef = useRef<RoomMeshes | null>(null);

  // Interaction & Camera state
  const isPointerDownRef = useRef(false);
  const previousPointerPosRef = useRef({ x: 0, y: 0 });
  const cameraTargetRef = useRef(new THREE.Vector3(-0.3, 1.1, 0));
  const sphericalRef = useRef({ radius: 8.5, theta: 0.65, phi: 1.15 });

  // Shift Panning state
  const [isShiftActive, setIsShiftActive] = useState(false);
  const isShiftRef = useRef(false);

  // Walkthrough state
  const fpPosRef = useRef(new THREE.Vector3(0, 1.68, 1.5));
  const fpYawRef = useRef(0);
  const fpPitchRef = useRef(0);
  const keysDownRef = useRef<{ [key: string]: boolean }>({});

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

  // 1. INITIALIZE THREE.JS SCENE
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d); // Deep architectural slate
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 100);
    camera.position.set(4.6, 3.8, 5.6);
    camera.lookAt(cameraTargetRef.current);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // Calibrated exposure for rich, contrasty, non-washed out textures
    renderer.toneMappingExposure = 0.96;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Atmospheric balanced ambient lighting (rich shadows, no blown-out white)
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 0.45);
    scene.add(ambientLight);

    // Directional sunlight bounce with contact shadows
    const sunLight = new THREE.DirectionalLight(0xe2e8f0, 0.65);
    sunLight.position.set(7.0, 5.5, 2.0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 15;
    sunLight.shadow.camera.left = -5;
    sunLight.shadow.camera.right = 5;
    sunLight.shadow.camera.top = 5;
    sunLight.shadow.camera.bottom = -5;
    sunLight.shadow.bias = -0.0006;
    scene.add(sunLight);

    // Build the 3D Room & Equipment
    const room = RoomBuilder.buildRoom(renderer, {
      marbleTone,
      floorColor,
      steelFinish,
      renderMode,
      wallVisibility,
    });
    scene.add(room.root);
    roomMeshesRef.current = room;

    // Sync water state immediately
    room.setWaterActive(isTapActive);

    const dummyObj = new THREE.Object3D();
    const boxHelper = new THREE.BoxHelper(dummyObj, 0x38bdf8);
    boxHelper.visible = false;
    scene.add(boxHelper);
    highlightBoxRef.current = boxHelper;

    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
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
        cameraTargetRef.current.lerpVectors(
          transitionRef.current.startTarget,
          transitionRef.current.endTarget,
          easeT
        );
        camera.lookAt(cameraTargetRef.current);

        if (t >= 1) {
          transitionRef.current.active = false;
        }
      } else if (cameraMode === 'walkthrough') {
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

      renderer.render(scene, camera);
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
        renderer.render(scene, camera);
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
      renderer.dispose();
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

  // Sync Wall Visibility Mode
  useEffect(() => {
    if (roomMeshesRef.current) {
      roomMeshesRef.current.updateWallVisibility(wallVisibility);
    }
  }, [wallVisibility]);

  // Update Materials / Tone / Finishes / Render Mode
  useEffect(() => {
    if (!roomMeshesRef.current) return;
    roomMeshesRef.current.updateMaterials({
      marbleTone,
      floorColor,
      steelFinish,
      renderMode,
    });
  }, [marbleTone, floorColor, steelFinish, renderMode]);

  // Update Dimensions Visibility
  useEffect(() => {
    if (!roomMeshesRef.current) return;
    roomMeshesRef.current.dimensionGroup.visible = showDimensions;
  }, [showDimensions]);

  // Update Lighting Presets with balanced rich contrast
  useEffect(() => {
    if (!sceneRef.current || !rendererRef.current || !roomMeshesRef.current) return;
    const scene = sceneRef.current;
    const lights = roomMeshesRef.current.ceilingLights;

    if (lightingPreset === 'cleanroom_1000lux') {
      rendererRef.current.toneMappingExposure = 1.05;
      scene.background = new THREE.Color(0x0f172a);
      lights.forEach((l) => {
        l.color.setHex(0xfaf5ee);
        l.intensity = 0.95;
      });
    } else if (lightingPreset === 'daylight') {
      rendererRef.current.toneMappingExposure = 0.92;
      scene.background = new THREE.Color(0x0a0f1d);
      lights.forEach((l) => {
        l.color.setHex(0xfff7ed);
        l.intensity = 0.65;
      });
    } else if (lightingPreset === 'uvc_sanitization') {
      rendererRef.current.toneMappingExposure = 0.85;
      scene.background = new THREE.Color(0x090314);
      lights.forEach((l) => {
        l.color.setHex(0x9333ea);
        l.intensity = 1.4;
      });
    } else if (lightingPreset === 'standby') {
      rendererRef.current.toneMappingExposure = 0.7;
      scene.background = new THREE.Color(0x07090e);
      lights.forEach((l, i) => {
        l.color.setHex(0xfde047);
        l.intensity = i % 2 === 0 ? 0.45 : 0.04;
      });
    }
  }, [lightingPreset]);

  // Camera Preset Transitions
  useEffect(() => {
    if (!activePreset || !cameraRef.current) return;
    const camera = cameraRef.current;

    transitionRef.current = {
      active: true,
      startPos: camera.position.clone(),
      endPos: new THREE.Vector3(...activePreset.position),
      startTarget: cameraTargetRef.current.clone(),
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

  // Selected Equipment Highlight
  useEffect(() => {
    if (!highlightBoxRef.current || !roomMeshesRef.current) return;
    const box = highlightBoxRef.current;

    if (selectedEquipmentId && roomMeshesRef.current.interactiveObjects[selectedEquipmentId]) {
      const obj = roomMeshesRef.current.interactiveObjects[selectedEquipmentId];
      box.setFromObject(obj);
      box.visible = true;
    } else {
      box.visible = false;
    }
  }, [selectedEquipmentId]);

  // Top Ortho Camera Switch
  useEffect(() => {
    if (cameraMode === 'top' && cameraRef.current) {
      transitionRef.current = {
        active: true,
        startPos: cameraRef.current.position.clone(),
        endPos: new THREE.Vector3(-0.3, 9.5, 0.01),
        startTarget: cameraTargetRef.current.clone(),
        endTarget: new THREE.Vector3(-0.3, 0, 0),
        progress: 0,
      };
    }
  }, [cameraMode]);

  // Pointer Interaction Handlers (Orbit, Shift Pan, First Person, Measure)
  const handlePointerDown = (e: React.PointerEvent) => {
    isPointerDownRef.current = true;
    previousPointerPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current || !cameraRef.current) return;
    const deltaX = e.clientX - previousPointerPosRef.current.x;
    const deltaY = e.clientY - previousPointerPosRef.current.y;
    previousPointerPosRef.current = { x: e.clientX, y: e.clientY };

    // 5. SHIFT KEY CAMERA PANNING (Horizontal & Vertical Move)
    // "adicione a função para eu apertar a tecla "shift" no teclado, eu consida mover a camera horizontalmente e verticalmente."
    const isPanMode =
      e.shiftKey ||
      isShiftRef.current ||
      keysDownRef.current['ShiftLeft'] ||
      keysDownRef.current['ShiftRight'] ||
      e.buttons === 2 ||
      e.buttons === 4;

    if (isPanMode) {
      // Local camera axes
      const right = new THREE.Vector3().setFromMatrixColumn(cameraRef.current.matrix, 0);
      const up = new THREE.Vector3().setFromMatrixColumn(cameraRef.current.matrix, 1);

      // Pan factor proportional to camera zoom distance
      const panSpeed = 0.0022 * Math.max(1.5, sphericalRef.current.radius);
      const panOffset = new THREE.Vector3()
        .addScaledVector(right, -deltaX * panSpeed)
        .addScaledVector(up, deltaY * panSpeed);

      cameraTargetRef.current.add(panOffset);
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
    } else if (cameraMode === 'orbit') {
      sphericalRef.current.theta -= deltaX * 0.006;
      sphericalRef.current.phi -= deltaY * 0.006;
      sphericalRef.current.phi = Math.max(0.15, Math.min(Math.PI / 2.1, sphericalRef.current.phi));

      const { radius, theta, phi } = sphericalRef.current;
      const target = cameraTargetRef.current;

      cameraRef.current.position.set(
        target.x + radius * Math.sin(phi) * Math.sin(theta),
        target.y + radius * Math.cos(phi),
        target.z + radius * Math.sin(phi) * Math.cos(theta)
      );
      cameraRef.current.lookAt(target);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isPointerDownRef.current = false;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!mountRef.current || !cameraRef.current || !roomMeshesRef.current || !sceneRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

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

    const interactiveDict = roomMeshesRef.current.interactiveObjects;
    let clickedId: string | null = null;

    for (const [id, obj] of Object.entries(interactiveDict)) {
      const hits = raycaster.intersectObject(obj, true);
      if (hits.length > 0) {
        clickedId = id;
        break;
      }
    }

    if (clickedId === 'sliding_door') {
      onToggleDoor();
    } else if (clickedId === 'marble_counter_sink') {
      onToggleTap();
    }

    onSelectEquipment(clickedId);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (cameraMode !== 'orbit' || !cameraRef.current) return;
    sphericalRef.current.radius += e.deltaY * 0.005;
    sphericalRef.current.radius = Math.max(2.0, Math.min(16, sphericalRef.current.radius));

    const { radius, theta, phi } = sphericalRef.current;
    const target = cameraTargetRef.current;
    cameraRef.current.position.set(
      target.x + radius * Math.sin(phi) * Math.sin(theta),
      target.y + radius * Math.cos(phi),
      target.z + radius * Math.sin(phi) * Math.cos(theta)
    );
    cameraRef.current.lookAt(target);
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
      onWheel={handleWheel}
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
    </div>
  );
};
