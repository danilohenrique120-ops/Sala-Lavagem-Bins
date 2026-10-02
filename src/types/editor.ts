export type TransformMode = 'translate' | 'rotate' | 'scale';
export type TransformSpace = 'world' | 'local';

export interface TransformData {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number }; // In degrees
  scale: { x: number; y: number; z: number };
}

export interface SceneItemMeta {
  id: string;
  name: string;
  category: string;
  visible: boolean;
  isCustom?: boolean;
  defaultTransform?: TransformData;
}
