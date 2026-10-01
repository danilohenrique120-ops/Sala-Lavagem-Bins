export type RenderMode = 'lumen' | 'ssr' | 'clay' | 'wireframe';
export type CameraMode = 'orbit' | 'walkthrough' | 'top';
export type LightingPreset = 'daylight' | 'cleanroom_1000lux' | 'uvc_sanitization' | 'standby';
export type WallVisibility = 'all' | 'cutaway' | 'none';
export type GlossLevel = 'satin_hospital' | 'balanced' | 'high_gloss';

export type MarbleTone = 'emperador_light' | 'crema_marfil' | 'travertine_warm';
export type SteelFinish = 'brushed_316' | 'mirror_polish' | 'matte_sanitary';
export type FloorColor = 'hospital_blue' | 'surgical_green' | 'clean_grey';

export interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  description: string;
  dimensions: {
    width: number; // in meters
    depth: number;
    height: number;
  };
  material: string;
  normative: string;
  features: string[];
  operationalRole: string;
}

export interface CameraPreset {
  id: string;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
}

export interface HotspotItem {
  id: string;
  title: string;
  subtitle: string;
  position: [number, number, number];
  equipmentId: string;
}
