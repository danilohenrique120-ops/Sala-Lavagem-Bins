import * as THREE from 'three';
import { MarbleTone, FloorColor, SteelFinish } from '../../types/archviz';

export interface PBRTextureSet {
  map: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
}

export class TextureGenerator {
  /**
   * Generates a tangent-space normal map from a grayscale/luminance canvas using Sobel gradients.
   * Produces authentic #8080ff blue tangent-space maps with micro-relief.
   */
  static generateNormalMapFromCanvas(
    sourceCanvas: HTMLCanvasElement,
    strength: number = 2.0
  ): THREE.CanvasTexture {
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;
    const srcCtx = sourceCanvas.getContext('2d')!;
    const srcData = srcCtx.getImageData(0, 0, width, height).data;

    const normalCanvas = document.createElement('canvas');
    normalCanvas.width = width;
    normalCanvas.height = height;
    const normCtx = normalCanvas.getContext('2d')!;
    const normImgData = normCtx.createImageData(width, height);
    const dstData = normImgData.data;

    // Fast luminance calculation
    const getLum = (x: number, y: number): number => {
      const clampedX = (x + width) % width;
      const clampedY = (y + height) % height;
      const idx = (clampedY * width + clampedX) * 4;
      return (srcData[idx] * 0.299 + srcData[idx + 1] * 0.587 + srcData[idx + 2] * 0.114) / 255.0;
    };

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Sobel filter kernels
        const tl = getLum(x - 1, y - 1);
        const l = getLum(x - 1, y);
        const bl = getLum(x - 1, y + 1);
        const tr = getLum(x + 1, y - 1);
        const r = getLum(x + 1, y);
        const br = getLum(x + 1, y + 1);
        const t = getLum(x, y - 1);
        const b = getLum(x, y + 1);

        const dx = (tr + 2.0 * r + br) - (tl + 2.0 * l + bl);
        const dy = (bl + 2.0 * b + br) - (tl + 2.0 * t + tr);

        const nx = -dx * strength;
        const ny = -dy * strength;
        const nz = 1.0;

        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        const normX = nx / len;
        const normY = ny / len;
        const normZ = nz / len;

        const idx = (y * width + x) * 4;
        dstData[idx] = Math.floor((normX * 0.5 + 0.5) * 255);
        dstData[idx + 1] = Math.floor((normY * 0.5 + 0.5) * 255);
        dstData[idx + 2] = Math.floor((normZ * 0.5 + 0.5) * 255);
        dstData[idx + 3] = 255;
      }
    }

    normCtx.putImageData(normImgData, 0, 0);
    const texture = new THREE.CanvasTexture(normalCanvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  /**
   * Generates a spatially varied roughness map based on source surface detail.
   */
  static generateRoughnessMapFromCanvas(
    sourceCanvas: HTMLCanvasElement,
    baseRoughness: number = 0.35,
    range: number = 0.15,
    invert: boolean = false
  ): THREE.CanvasTexture {
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;
    const srcCtx = sourceCanvas.getContext('2d')!;
    const srcData = srcCtx.getImageData(0, 0, width, height).data;

    const roughCanvas = document.createElement('canvas');
    roughCanvas.width = width;
    roughCanvas.height = height;
    const rCtx = roughCanvas.getContext('2d')!;
    const rImgData = rCtx.createImageData(width, height);
    const dstData = rImgData.data;

    for (let i = 0; i < srcData.length; i += 4) {
      let lum = (srcData[i] * 0.299 + srcData[i + 1] * 0.587 + srcData[i + 2] * 0.114) / 255.0;
      if (invert) lum = 1.0 - lum;

      const rough = Math.min(1.0, Math.max(0.0, baseRoughness + (lum - 0.5) * range));
      const val = Math.floor(rough * 255);

      dstData[i] = val;
      dstData[i + 1] = val;
      dstData[i + 2] = val;
      dstData[i + 3] = 255;
    }

    rCtx.putImageData(rImgData, 0, 0);
    const texture = new THREE.CanvasTexture(roughCanvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  /**
   * 1. ULTRA-DETAILED LIGHT CARAMEL / BEIGE MARBLE PBR TEXTURE SET (Matching reference image)
   * High-definition organic veins, crystal depth, normal map relief, and honed roughness.
   */
  static createMarblePBR(tone: MarbleTone = 'emperador_light'): PBRTextureSet {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Warm caramel-cream stone palette matching image.png
    let baseColor1 = '#c4a682';
    let baseColor2 = '#b8946e';
    let baseColor3 = '#a6825c';
    let veinColor1 = '#785330';
    let veinColor2 = '#503318';
    let creamVein = 'rgba(255, 248, 238, 0.7)';

    if (tone === 'crema_marfil') {
      baseColor1 = '#ded0b8';
      baseColor2 = '#c8b698';
      baseColor3 = '#ad997a';
      veinColor1 = '#846949';
      veinColor2 = '#5c452b';
      creamVein = 'rgba(255, 252, 245, 0.75)';
    } else if (tone === 'travertine_warm') {
      baseColor1 = '#cca168';
      baseColor2 = '#b6874e';
      baseColor3 = '#986a34';
      veinColor1 = '#6c3f15';
      veinColor2 = '#4a2507';
      creamVein = 'rgba(255, 242, 220, 0.65)';
    }

    // Smooth directional natural metamorphic rock gradient
    const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
    grad.addColorStop(0, baseColor1);
    grad.addColorStop(0.28, baseColor2);
    grad.addColorStop(0.62, baseColor3);
    grad.addColorStop(0.85, baseColor2);
    grad.addColorStop(1, baseColor1);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Natural stone mineral clouds and mottling (450 multi-scale clouds)
    for (let i = 0; i < 450; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const radius = 25 + Math.random() * 120;
      const alpha = 0.04 + Math.random() * 0.11;
      const radial = ctx.createRadialGradient(x, y, 4, x, y, radius);
      radial.addColorStop(0, `rgba(255, 248, 235, ${alpha * 1.6})`);
      radial.addColorStop(0.35, `rgba(135, 95, 55, ${alpha * 1.0})`);
      radial.addColorStop(0.75, `rgba(75, 45, 20, ${alpha * 0.8})`);
      radial.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = radial;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Micro mineral flecks and crystalline grains
    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() < 0.08) {
        const grain = (Math.random() - 0.5) * 18;
        data[i] = Math.min(255, Math.max(0, data[i] + grain));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Realistic fractal branching marble veins
    const drawVein = (startX: number, startY: number, color: string, width: number, branches: number) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      let currX = startX;
      let currY = startY;
      ctx.moveTo(currX, currY);

      const steps = 30;
      for (let s = 0; s < steps; s++) {
        const nextX = currX + (Math.random() - 0.44) * 85;
        const nextY = currY + 35 + Math.random() * 45;
        const cpX = currX + (Math.random() - 0.5) * 45;
        const cpY = (currY + nextY) / 2 + (Math.random() - 0.5) * 35;
        ctx.quadraticCurveTo(cpX, cpY, nextX, nextY);

        if (branches > 0 && Math.random() > 0.6) {
          drawVein(currX, currY, color, width * 0.55, branches - 1);
        }

        currX = nextX;
        currY = nextY;
      }
      ctx.stroke();
    };

    // Main primary veins, delicate secondary veins, and glowing ivory veins
    for (let v = 0; v < 8; v++) {
      const sx = Math.random() * 1024;
      drawVein(sx, -40, veinColor1, 3.5 + Math.random() * 2.5, 2);
      drawVein(sx + 12, -40, creamVein, 2.0 + Math.random() * 1.5, 1);
      drawVein(Math.random() * 1024, -40, veinColor2, 1.6 + Math.random() * 1.4, 2);
    }

    const albedoTex = new THREE.CanvasTexture(canvas);
    albedoTex.wrapS = THREE.RepeatWrapping;
    albedoTex.wrapT = THREE.RepeatWrapping;
    albedoTex.repeat.set(3, 2);

    // Generate accurate normal and roughness maps
    const normalMap = this.generateNormalMapFromCanvas(canvas, 1.6);
    normalMap.repeat.set(3, 2);

    const roughnessMap = this.generateRoughnessMapFromCanvas(canvas, 0.38, 0.16, false);
    roughnessMap.repeat.set(3, 2);

    return { map: albedoTex, normalMap, roughnessMap };
  }

  /**
   * 2. ULTRA-DETAILED AISI 316L BRUSHED STAINLESS STEEL PBR (Matching reference image)
   * Micro-striations (Scotch-Brite grit 240/320), anisotropic highlights, normal map grooves.
   */
  static createSteelPBR(finish: SteelFinish = 'brushed_316'): PBRTextureSet {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Surgical steel base tone with soft lighting gradient
    const baseShade = finish === 'mirror_polish' ? 224 : finish === 'matte_sanitary' ? 186 : 210;
    const grad = ctx.createLinearGradient(0, 0, 1024, 0);
    grad.addColorStop(0, `rgb(${baseShade - 7}, ${baseShade - 5}, ${baseShade - 2})`);
    grad.addColorStop(0.35, `rgb(${baseShade + 6}, ${baseShade + 7}, ${baseShade + 9})`);
    grad.addColorStop(0.68, `rgb(${baseShade - 4}, ${baseShade - 3}, ${baseShade - 1})`);
    grad.addColorStop(1, `rgb(${baseShade - 8}, ${baseShade - 6}, ${baseShade - 3})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Thousands of high-frequency horizontal brush striations
    const lineCount = finish === 'mirror_polish' ? 2000 : 6500;
    for (let i = 0; i < lineCount; i++) {
      const y = Math.random() * 1024;
      const h = 0.5 + Math.random() * 1.5;
      const isLight = Math.random() > 0.48;
      const alpha = 0.025 + Math.random() * 0.07;
      ctx.fillStyle = isLight
        ? `rgba(255, 255, 255, ${alpha * 1.4})`
        : `rgba(45, 55, 70, ${alpha * 0.95})`;
      const startX = Math.random() * 150;
      const length = 550 + Math.random() * 600;
      ctx.fillRect(startX, y, length, h);
    }

    // Soft anisotropic specular bands (simulating perpendicular light diffusion)
    const specBand = ctx.createLinearGradient(0, 0, 1024, 0);
    specBand.addColorStop(0, 'rgba(255, 255, 255, 0)');
    specBand.addColorStop(0.42, 'rgba(255, 255, 255, 0.08)');
    specBand.addColorStop(0.5, 'rgba(255, 255, 255, 0.14)');
    specBand.addColorStop(0.58, 'rgba(255, 255, 255, 0.08)');
    specBand.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = specBand;
    ctx.fillRect(0, 0, 1024, 1024);

    const albedoTex = new THREE.CanvasTexture(canvas);
    albedoTex.wrapS = THREE.RepeatWrapping;
    albedoTex.wrapT = THREE.RepeatWrapping;
    albedoTex.repeat.set(2, 2);

    // Tangent normal map from brush striations - creates genuine specular anisotropy in WebGL!
    const normalMap = this.generateNormalMapFromCanvas(canvas, 1.4);
    normalMap.repeat.set(2, 2);

    const roughnessMap = this.generateRoughnessMapFromCanvas(
      canvas,
      finish === 'mirror_polish' ? 0.22 : 0.38,
      0.12,
      false
    );
    roughnessMap.repeat.set(2, 2);

    return { map: albedoTex, normalMap, roughnessMap };
  }

  /**
   * 3. MONOLITHIC CLEANROOM RESIN FLOOR PBR (Matching reference image)
   * Light cleanroom grey with micro-orange-peel normal map and subtle non-slip aggregate.
   */
  static createFloorPBR(color: FloorColor = 'clean_grey'): PBRTextureSet {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Base cleanroom off-white / light neutral grey (RAL 7035) matching image.png
    let baseR = 224, baseG = 222, baseB = 216;
    if (color === 'hospital_blue') {
      baseR = 105; baseG = 145; baseB = 175;
    } else if (color === 'surgical_green') {
      baseR = 110; baseG = 158; baseB = 140;
    }

    ctx.fillStyle = `rgb(${baseR}, ${baseG}, ${baseB})`;
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle microscopic resin grain
    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 8;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    const albedoTex = new THREE.CanvasTexture(canvas);
    albedoTex.wrapS = THREE.RepeatWrapping;
    albedoTex.wrapT = THREE.RepeatWrapping;
    albedoTex.repeat.set(8, 6);

    // Procedural "orange peel" epoxy resin normal map
    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 512;
    bumpCanvas.height = 512;
    const bCtx = bumpCanvas.getContext('2d')!;
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 300; i++) {
      const bx = Math.random() * 512;
      const by = Math.random() * 512;
      const br = 8 + Math.random() * 18;
      const bGrad = bCtx.createRadialGradient(bx, by, 0, bx, by, br);
      bGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      bGrad.addColorStop(1, 'rgba(0, 0, 0, 0.08)');
      bCtx.fillStyle = bGrad;
      bCtx.beginPath();
      bCtx.arc(bx, by, br, 0, Math.PI * 2);
      bCtx.fill();
    }

    const normalMap = this.generateNormalMapFromCanvas(bumpCanvas, 1.2);
    normalMap.repeat.set(12, 10);

    const roughnessMap = this.generateRoughnessMapFromCanvas(canvas, 0.52, 0.08, false);
    roughnessMap.repeat.set(8, 6);

    return { map: albedoTex, normalMap, roughnessMap };
  }

  /**
   * 4. BLUE CLEANROOM CABINET POWDER COATING PBR (Matching reference image)
   * Slate-blue with fine electrostatic texture and edge bevels.
   */
  static createCabinetPBR(): PBRTextureSet {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Hospital Slate-Blue (RAL 5014 Bleue Médical) matching image.png
    ctx.fillStyle = '#557f9d';
    ctx.fillRect(0, 0, 512, 512);

    // Fine electrostatic powder-coating stipple
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 10;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    // Soft outer bevel shading
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 508, 508);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 500, 500);

    const albedoTex = new THREE.CanvasTexture(canvas);
    albedoTex.wrapS = THREE.RepeatWrapping;
    albedoTex.wrapT = THREE.RepeatWrapping;

    const normalMap = this.generateNormalMapFromCanvas(canvas, 1.1);
    const roughnessMap = this.generateRoughnessMapFromCanvas(canvas, 0.44, 0.08, false);

    return { map: albedoTex, normalMap, roughnessMap };
  }

  /**
   * 5. CLEANROOM SANDWICH PANEL WALLS PBR
   * Distinct silicone sealant joints with embossed normal grooves.
   */
  static createWallPBR(): PBRTextureSet {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Cleanroom panel off-white (RAL 9002 grey-white)
    ctx.fillStyle = '#edf2f7';
    ctx.fillRect(0, 0, 512, 512);

    // Panel vertical joint seams
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 0, 6, 512);
    ctx.fillRect(506, 0, 6, 512);

    // Inner shadow groove in seam
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(2, 0, 2, 512);
    ctx.fillRect(508, 0, 2, 512);

    const albedoTex = new THREE.CanvasTexture(canvas);
    albedoTex.wrapS = THREE.RepeatWrapping;
    albedoTex.wrapT = THREE.RepeatWrapping;
    albedoTex.repeat.set(6, 1);

    const normalMap = this.generateNormalMapFromCanvas(canvas, 1.8);
    normalMap.repeat.set(6, 1);

    const roughnessMap = this.generateRoughnessMapFromCanvas(canvas, 0.82, 0.06, false);
    roughnessMap.repeat.set(6, 1);

    return { map: albedoTex, normalMap, roughnessMap };
  }

  /**
   * 6. EMBOSSED DIAMOND TREAD PLATE PBR (Chapa xadrez para escadas e piso técnico)
   */
  static createDiamondPlatePBR(): PBRTextureSet {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#b8c3cd';
    ctx.fillRect(0, 0, 512, 512);

    const size = 32;
    for (let y = 0; y < 512; y += size) {
      for (let x = 0; x < 512; x += size) {
        const cx = x + size / 2;
        const cy = y + size / 2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(((x / size + y / size) % 2 === 0 ? 45 : -45) * Math.PI / 180);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.ellipse(-1, -1, 10, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(40, 50, 60, 0.4)';
        ctx.beginPath();
        ctx.ellipse(1, 1, 10, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#c8d3dd';
        ctx.beginPath();
        ctx.ellipse(0, 0, 9, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    const albedoTex = new THREE.CanvasTexture(canvas);
    albedoTex.wrapS = THREE.RepeatWrapping;
    albedoTex.wrapT = THREE.RepeatWrapping;
    albedoTex.repeat.set(8, 8);

    const normalMap = this.generateNormalMapFromCanvas(canvas, 2.5);
    normalMap.repeat.set(8, 8);

    const roughnessMap = this.generateRoughnessMapFromCanvas(canvas, 0.38, 0.12, false);
    roughnessMap.repeat.set(8, 8);

    return { map: albedoTex, normalMap, roughnessMap };
  }

  // --- Backward-compatible wrappers returning the diffuse map ---
  static createMarbleTexture(tone: MarbleTone = 'emperador_light'): THREE.CanvasTexture {
    return this.createMarblePBR(tone).map;
  }

  static createBrushedSteelTexture(finish: SteelFinish = 'brushed_316'): THREE.CanvasTexture {
    return this.createSteelPBR(finish).map;
  }

  static createFloorTexture(color: FloorColor = 'clean_grey'): THREE.CanvasTexture {
    return this.createFloorPBR(color).map;
  }

  static createDiamondPlateTexture(): THREE.CanvasTexture {
    return this.createDiamondPlatePBR().map;
  }

  static createCleanroomWallTexture(): THREE.CanvasTexture {
    return this.createWallPBR().map;
  }

  /**
   * Cleanroom Environment Equirectangular Map with defined lighting contrast
   */
  static createCleanroomEnvironmentMap(renderer: THREE.WebGLRenderer): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Ceiling
    const ceilGrad = ctx.createLinearGradient(0, 0, 0, 256);
    ceilGrad.addColorStop(0, '#e2e8f0');
    ceilGrad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = ceilGrad;
    ctx.fillRect(0, 0, 1024, 256);

    // Overhead rectangular cleanroom lights with contrast
    ctx.fillStyle = '#ffffff';
    for (let x = 80; x < 1000; x += 180) {
      ctx.fillRect(x, 40, 100, 50);
      ctx.fillRect(x, 140, 100, 50);
    }

    // Horizon: Cleanroom walls with subtle warmth
    ctx.fillStyle = '#d5dde5';
    ctx.fillRect(0, 240, 1024, 30);

    // Floor: Deep Blue epoxy reflection
    const floorGrad = ctx.createLinearGradient(0, 270, 0, 512);
    floorGrad.addColorStop(0, '#325470');
    floorGrad.addColorStop(0.5, '#223c52');
    floorGrad.addColorStop(1, '#152736');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, 270, 1024, 242);

    // Floor reflection highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    for (let x = 80; x < 1000; x += 180) {
      ctx.fillRect(x, 320, 100, 35);
    }

    const equirectTexture = new THREE.CanvasTexture(canvas);
    equirectTexture.mapping = THREE.EquirectangularReflectionMapping;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const envMap = pmremGenerator.fromEquirectangular(equirectTexture).texture;
    pmremGenerator.dispose();
    equirectTexture.dispose();

    return envMap;
  }
}
