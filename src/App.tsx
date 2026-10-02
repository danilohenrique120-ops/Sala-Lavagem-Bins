/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo, useEffect } from 'react';
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
} from './types/archviz';
import { TransformMode, TransformData, SceneItemMeta } from './types/editor';
import { EQUIPMENT_LIST } from './data/equipmentData';
import { ThreeCanvas, ImperativeEditorActions } from './components/3d/ThreeCanvas';
import { HeaderNav } from './components/ui/HeaderNav';
import { CameraToolbar, CAMERA_PRESETS } from './components/ui/CameraToolbar';
import { EquipmentDrawer } from './components/ui/EquipmentDrawer';
import { MaterialConfigurator } from './components/ui/MaterialConfigurator';
import { TechnicalBlueprintModal } from './components/ui/TechnicalBlueprintModal';
import { WalkthroughGuide } from './components/ui/WalkthroughGuide';
import { ObjectEditorPanel } from './components/ui/ObjectEditorPanel';
import { SceneOutlinerDrawer } from './components/ui/SceneOutlinerDrawer';

export default function App() {
  // Render & Lighting Configuration
  const [renderMode, setRenderMode] = useState<RenderMode>('lumen');
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>('daylight');
  const [marbleTone, setMarbleTone] = useState<MarbleTone>('emperador_light');
  const [steelFinish, setSteelFinish] = useState<SteelFinish>('brushed_316');
  const [floorColor, setFloorColor] = useState<FloorColor>('clean_grey');
  const [glossLevel, setGlossLevel] = useState<GlossLevel>('satin_hospital');
  const [bloomEnabled, setBloomEnabled] = useState<boolean>(false);
  const [exposure, setExposure] = useState<number>(0.95);

  // Wall Visibility Programming (all walls, cutaway inside, no walls)
  const [wallVisibility, setWallVisibility] = useState<WallVisibility>('all');

  // Navigation & Camera
  const [cameraMode, setCameraMode] = useState<CameraMode>('orbit');
  const [activePreset, setActivePreset] = useState<CameraPreset | null>(CAMERA_PRESETS[0]);

  // Overlays & Toggles
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [showHotspots, setShowHotspots] = useState<boolean>(false);
  const [isDoorOpen, setIsDoorOpen] = useState<boolean>(false);
  const [isTapActive, setIsTapActive] = useState<boolean>(true);
  const [isCipActive, setIsCipActive] = useState<boolean>(false);

  // 3D Layout Editor State
  const [transformMode, setTransformMode] = useState<TransformMode>('translate');
  const [snapEnabled, setSnapEnabled] = useState<boolean>(true);
  const [lockCameraRotation, setLockCameraRotation] = useState<boolean>(true);
  const [currentTransform, setCurrentTransform] = useState<TransformData | null>(null);
  const [sceneItems, setSceneItems] = useState<SceneItemMeta[]>([]);
  const [isOutlinerOpen, setIsOutlinerOpen] = useState<boolean>(false);
  const imperativeEditorRef = useRef<ImperativeEditorActions | null>(null);

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

  // Selected Scene Item for Editor Panel
  const selectedSceneItem = useMemo(() => {
    if (!selectedEquipmentId) return null;
    const found = sceneItems.find((item) => item.id === selectedEquipmentId);
    if (found) return found;
    if (selectedEquipment) {
      return {
        id: selectedEquipment.id,
        name: selectedEquipment.name,
        category: selectedEquipment.category,
        visible: true,
      };
    }
    return {
      id: selectedEquipmentId,
      name: selectedEquipmentId,
      category: 'Elemento da Sala',
      visible: true,
    };
  }, [selectedEquipmentId, sceneItems, selectedEquipment]);

  // Keyboard Shortcuts (W, E, R, Del, Esc, Ctrl+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement as HTMLElement)?.tagName;
      if (['INPUT', 'TEXTAREA'].includes(activeTag)) return;

      if (e.key === 'w' || e.key === 'W') {
        setTransformMode('translate');
      } else if (e.key === 'e' || e.key === 'E') {
        setTransformMode('rotate');
      } else if (e.key === 'r' || e.key === 'R') {
        setTransformMode('scale');
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedEquipmentId && imperativeEditorRef.current) {
          imperativeEditorRef.current.deleteSelected();
          setSceneItems((prev) =>
            prev.map((i) => (i.id === selectedEquipmentId ? { ...i, visible: false } : i))
          );
        }
      } else if (e.key === 'Escape') {
        setSelectedEquipmentId(null);
      } else if (e.key === 'l' || e.key === 'L') {
        setLockCameraRotation((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        if (selectedEquipmentId && imperativeEditorRef.current) {
          imperativeEditorRef.current.duplicateSelected();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  const handleToggleCip = () => {
    setIsCipActive((prev) => !prev);
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

  // Editor Actions
  const handleUpdateTransform = (data: Partial<TransformData>) => {
    if (imperativeEditorRef.current) {
      imperativeEditorRef.current.updateTransform(data);
    }
    if (currentTransform) {
      setCurrentTransform({
        position: { ...currentTransform.position, ...(data.position || {}) },
        rotation: { ...currentTransform.rotation, ...(data.rotation || {}) },
        scale: { ...currentTransform.scale, ...(data.scale || {}) },
      });
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedEquipmentId || !imperativeEditorRef.current) return;
    const idToDelete = selectedEquipmentId;
    imperativeEditorRef.current.deleteSelected();
    setSceneItems((prev) =>
      prev.map((i) => (i.id === idToDelete ? { ...i, visible: false } : i))
    );
  };

  const handleDuplicateSelected = () => {
    if (imperativeEditorRef.current) {
      imperativeEditorRef.current.duplicateSelected();
    }
  };

  const handleResetSelected = () => {
    if (imperativeEditorRef.current) {
      imperativeEditorRef.current.resetSelected();
    }
  };

  const handleResetAll = () => {
    if (imperativeEditorRef.current) {
      imperativeEditorRef.current.resetAll();
      setSceneItems((prev) => prev.map((i) => ({ ...i, visible: true })));
    }
  };

  const handleToggleItemVisibility = (id: string) => {
    if (imperativeEditorRef.current) {
      imperativeEditorRef.current.toggleItemVisibility(id);
      setSceneItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, visible: !i.visible } : i))
      );
    }
  };

  const handleDeleteItem = (id: string) => {
    if (imperativeEditorRef.current) {
      imperativeEditorRef.current.deleteItemById(id);
      setSceneItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, visible: false } : i))
      );
    }
  };

  const handleAddItem = (type: 'bin' | 'drain' | 'demarcation') => {
    if (imperativeEditorRef.current) {
      imperativeEditorRef.current.addItem(type);
      const typeLabel =
        type === 'bin'
          ? 'Bin Farmacêutico 1000L Extra'
          : type === 'drain'
          ? 'Canaleta de Dreno Extra'
          : 'Demarcação de Piso Extra';
      const catLabel =
        type === 'bin'
          ? 'IBC Inox 316L'
          : type === 'drain'
          ? 'Drenagem Sanitária'
          : 'Sinalização Operacional';

      setSceneItems((prev) => [
        ...prev,
        {
          id: `${type}_novo_${Date.now() % 10000}`,
          name: typeLabel,
          category: catLabel,
          visible: true,
          isCustom: true,
        },
      ]);
    }
  };

  const handleExportLayout = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      roomDimensions: { width: 7.24, depth: 4.77, height: 3.00 },
      sceneItems: sceneItems.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        visible: item.visible,
      })),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Layout_Sala_Bins_1000L_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* 3D WebGL Viewport with Interactive Transform Gizmo */}
      <ThreeCanvas
        renderMode={renderMode}
        cameraMode={cameraMode}
        lightingPreset={lightingPreset}
        wallVisibility={wallVisibility}
        marbleTone={marbleTone}
        steelFinish={steelFinish}
        floorColor={floorColor}
        glossLevel={glossLevel}
        bloomEnabled={bloomEnabled}
        exposure={exposure}
        showDimensions={showDimensions}
        showHotspots={showHotspots}
        isDoorOpen={isDoorOpen}
        isTapActive={isTapActive}
        onToggleTap={handleToggleTap}
        isCipActive={isCipActive}
        onToggleCip={handleToggleCip}
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
        transformMode={transformMode}
        snapEnabled={snapEnabled}
        lockCameraRotation={lockCameraRotation}
        onTransformChange={setCurrentTransform}
        onSceneItemsInitialized={setSceneItems}
        imperativeEditorRef={imperativeEditorRef}
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
        isOutlinerOpen={isOutlinerOpen}
        onToggleOutliner={() => setIsOutlinerOpen((prev) => !prev)}
      />

      {/* Floating 3D Object Editor Panel (When Item is Selected) */}
      <ObjectEditorPanel
        selectedItem={selectedSceneItem}
        transformMode={transformMode}
        onSelectTransformMode={setTransformMode}
        snapEnabled={snapEnabled}
        onToggleSnap={() => setSnapEnabled((prev) => !prev)}
        lockCameraRotation={lockCameraRotation}
        onToggleLockCameraRotation={() => setLockCameraRotation((prev) => !prev)}
        transformData={currentTransform}
        onUpdateTransform={handleUpdateTransform}
        onDeleteSelected={handleDeleteSelected}
        onDuplicateSelected={handleDuplicateSelected}
        onResetSelected={handleResetSelected}
        onClose={() => setSelectedEquipmentId(null)}
        onOpenOutliner={() => setIsOutlinerOpen(true)}
      />

      {/* Scene Outliner Drawer (All Room Items, Visibility, Add, Delete, Export) */}
      <SceneOutlinerDrawer
        isOpen={isOutlinerOpen}
        onClose={() => setIsOutlinerOpen(false)}
        items={sceneItems}
        selectedId={selectedEquipmentId}
        onSelectItem={(id) => {
          setSelectedEquipmentId(id);
        }}
        onToggleVisibility={handleToggleItemVisibility}
        onDeleteItem={handleDeleteItem}
        onAddItem={handleAddItem}
        onResetAll={handleResetAll}
        onExportLayout={handleExportLayout}
        onImportLayout={() => {}}
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
        isCipActive={isCipActive}
        onToggleCip={handleToggleCip}
        showHotspots={showHotspots}
        wallVisibility={wallVisibility}
        onCycleWallVisibility={handleCycleWallVisibility}
        isMeasuring={isMeasuring}
        onToggleMeasure={handleToggleMeasure}
        measuredDistance={measuredDistance}
        isOutlinerOpen={isOutlinerOpen}
        onToggleOutliner={() => setIsOutlinerOpen((prev) => !prev)}
        hasSelectedItem={!!selectedEquipmentId}
        lockCameraRotation={lockCameraRotation}
        onToggleLockCameraRotation={() => setLockCameraRotation((prev) => !prev)}
      />

      {/* Equipment Detailed Technical Specs Drawer (Shown when not editing or via info) */}
      {selectedEquipment && !currentTransform && (
        <EquipmentDrawer
          item={selectedEquipment}
          onClose={() => setSelectedEquipmentId(null)}
          onSelectPreset={handleSelectPreset}
        />
      )}

      {/* Material & Lighting Shader Configurator */}
      <MaterialConfigurator
        isOpen={isMaterialsOpen}
        onClose={() => setIsMaterialsOpen(false)}
        lightingPreset={lightingPreset}
        onSelectLighting={setLightingPreset}
        glossLevel={glossLevel}
        onSelectGloss={setGlossLevel}
        bloomEnabled={bloomEnabled}
        onToggleBloom={() => setBloomEnabled((prev) => !prev)}
        exposure={exposure}
        onSelectExposure={setExposure}
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
