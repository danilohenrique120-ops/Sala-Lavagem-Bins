/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo } from 'react';
import {
  RenderMode,
  CameraMode,
  LightingPreset,
  MarbleTone,
  SteelFinish,
  FloorColor,
  CameraPreset,
  WallVisibility,
} from './types/archviz';
import { EQUIPMENT_LIST } from './data/equipmentData';
import { ThreeCanvas } from './components/3d/ThreeCanvas';
import { HeaderNav } from './components/ui/HeaderNav';
import { CameraToolbar } from './components/ui/CameraToolbar';
import { EquipmentDrawer } from './components/ui/EquipmentDrawer';
import { MaterialConfigurator } from './components/ui/MaterialConfigurator';
import { TechnicalBlueprintModal } from './components/ui/TechnicalBlueprintModal';
import { WalkthroughGuide } from './components/ui/WalkthroughGuide';

export default function App() {
  // Render & Lighting Configuration
  const [renderMode, setRenderMode] = useState<RenderMode>('lumen');
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>('cleanroom_1000lux');
  const [marbleTone, setMarbleTone] = useState<MarbleTone>('emperador_light');
  const [steelFinish, setSteelFinish] = useState<SteelFinish>('mirror_polish');
  const [floorColor, setFloorColor] = useState<FloorColor>('hospital_blue');

  // Wall Visibility Programming (all walls, cutaway inside, no walls)
  const [wallVisibility, setWallVisibility] = useState<WallVisibility>('all');

  // Navigation & Camera
  const [cameraMode, setCameraMode] = useState<CameraMode>('orbit');
  const [activePreset, setActivePreset] = useState<CameraPreset | null>(null);

  // Overlays & Toggles
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [isDoorOpen, setIsDoorOpen] = useState<boolean>(false);
  const [isTapActive, setIsTapActive] = useState<boolean>(true);

  // Measurement Tool
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);
  const [measuredDistance, setMeasuredDistance] = useState<number | null>(null);

  // Modals & Drawers
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [isMaterialsOpen, setIsMaterialsOpen] = useState<boolean>(false);
  const [isBlueprintOpen, setIsBlueprintOpen] = useState<boolean>(false);

  // Performance FPS
  const [fps, setFps] = useState<number>(60);

  // Screenshot trigger ref
  const screenshotTriggerRef = useRef<(() => void) | null>(null);

  // Selected Equipment Entity
  const selectedEquipment = useMemo(() => {
    if (!selectedEquipmentId) return null;
    return EQUIPMENT_LIST.find((item) => item.id === selectedEquipmentId) || null;
  }, [selectedEquipmentId]);

  const handleSelectPreset = (preset: CameraPreset) => {
    setActivePreset(preset);
  };

  const handleToggleDoor = () => {
    setIsDoorOpen((prev) => !prev);
  };

  const handleToggleTap = () => {
    setIsTapActive((prev) => !prev);
  };

  const handleCycleWallVisibility = () => {
    setWallVisibility((prev) => {
      if (prev === 'all') return 'cutaway';
      if (prev === 'cutaway') return 'none';
      return 'all';
    });
  };

  const handleToggleMeasure = () => {
    setIsMeasuring((prev) => !prev);
    setMeasuredDistance(null);
  };

  const handleTakeScreenshot = () => {
    if (screenshotTriggerRef.current) {
      screenshotTriggerRef.current();
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* 3D WebGL Viewport */}
      <ThreeCanvas
        renderMode={renderMode}
        cameraMode={cameraMode}
        lightingPreset={lightingPreset}
        wallVisibility={wallVisibility}
        marbleTone={marbleTone}
        steelFinish={steelFinish}
        floorColor={floorColor}
        showDimensions={showDimensions}
        isDoorOpen={isDoorOpen}
        isTapActive={isTapActive}
        onToggleTap={handleToggleTap}
        activePreset={activePreset}
        selectedEquipmentId={selectedEquipmentId}
        onSelectEquipment={setSelectedEquipmentId}
        onToggleDoor={handleToggleDoor}
        isMeasuring={isMeasuring}
        onMeasuredDistance={setMeasuredDistance}
        onCaptureScreenshotRef={(trigger) => {
          screenshotTriggerRef.current = trigger;
        }}
        onFpsUpdate={setFps}
      />

      {/* Header Navigation with Realtime Metrics & Dimensions */}
      <HeaderNav
        fps={fps}
        renderMode={renderMode}
        onSelectRenderMode={setRenderMode}
        lightingPreset={lightingPreset}
        onSelectLighting={setLightingPreset}
        wallVisibility={wallVisibility}
        onCycleWallVisibility={handleCycleWallVisibility}
        showDimensions={showDimensions}
        onToggleDimensions={() => setShowDimensions((prev) => !prev)}
        onOpenMaterials={() => setIsMaterialsOpen((prev) => !prev)}
        onOpenBlueprint={() => setIsBlueprintOpen(true)}
        onTakeScreenshot={handleTakeScreenshot}
      />

      {/* Walkthrough & Camera Navigation Controls Guide */}
      <WalkthroughGuide cameraMode={cameraMode} />

      {/* Floating Camera & Actions Toolbar */}
      <CameraToolbar
        cameraMode={cameraMode}
        onSelectCameraMode={(mode) => {
          setCameraMode(mode);
          if (mode === 'top') {
            setActivePreset(null);
          }
        }}
        activePresetId={activePreset?.id || null}
        onSelectPreset={handleSelectPreset}
        isDoorOpen={isDoorOpen}
        onToggleDoor={handleToggleDoor}
        isTapActive={isTapActive}
        onToggleTap={handleToggleTap}
        wallVisibility={wallVisibility}
        onCycleWallVisibility={handleCycleWallVisibility}
        isMeasuring={isMeasuring}
        onToggleMeasure={handleToggleMeasure}
        measuredDistance={measuredDistance}
      />

      {/* Equipment Detailed Technical Specs Drawer */}
      <EquipmentDrawer
        item={selectedEquipment}
        onClose={() => setSelectedEquipmentId(null)}
        onSelectPreset={handleSelectPreset}
      />

      {/* Material & Lighting Shader Configurator */}
      <MaterialConfigurator
        isOpen={isMaterialsOpen}
        onClose={() => setIsMaterialsOpen(false)}
        renderMode={renderMode}
        onSelectRenderMode={setRenderMode}
        lightingPreset={lightingPreset}
        onSelectLighting={setLightingPreset}
        marbleTone={marbleTone}
        onSelectMarble={setMarbleTone}
        steelFinish={steelFinish}
        onSelectSteel={setSteelFinish}
        floorColor={floorColor}
        onSelectFloor={setFloorColor}
      />

      {/* Technical CAD Blueprint Modal Overlay */}
      <TechnicalBlueprintModal
        isOpen={isBlueprintOpen}
        onClose={() => setIsBlueprintOpen(false)}
        onSelectPreset={handleSelectPreset}
      />
    </div>
  );
}
