import * as THREE from 'three';
import { MarbleTone, FloorColor, SteelFinish } from '../../types/archviz';

export class TextureGenerator {
  /**
   * Generates procedural Light Brown Marble with deep rich contrast and natural veining
   */
  static createMarbleTexture(tone: MarbleTone = 'emperador_light'): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Richer, deeper stone tones (avoiding washed out pale tones)
    let baseColor1 = '#b89a74';
    let baseColor2 = '#9e7d58';
    let baseColor3 = '#846342';
    let veinColor1 = '#5c3d20';
    let veinColor2 = '#3d2410';

    if (tone === 'crema_marfil') {
      baseColor1 = '#dfcfb7';
      baseColor2 = '#c5b194';
      baseColor3 = '#aa9373';
      veinColor1 = '#785f40';
      veinColor2 = '#543f25';
    } else if (tone === 'travertine_warm') {
      baseColor1 = '#cfa068';
      baseColor2 = '#b48148';
      baseColor3 = '#93612d';
      veinColor1 = '#663914';
      veinColor2 = '#442207';
    }

    // Rich marble base gradient
    const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
    grad.addColorStop(0, baseColor1);
    grad.addColorStop(0.35, baseColor2);
    grad.addColorStop(0.7, baseColor3);
    grad.addColorStop(1, baseColor2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Natural stone mineral clouds with depth
    for (let i = 0; i < 350; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const radius = 25 + Math.random() * 95;
      const alpha = 0.06 + Math.random() * 0.12;
      const radial = ctx.createRadialGradient(x, y, 2, x, y, radius);
      radial.addColorStop(0, `rgba(255, 245, 230, ${alpha * 1.6})`);
      radial.addColorStop(0.45, `rgba(110, 75, 45, ${alpha * 1.1})`);
      radial.addColorStop(0.85, `rgba(60, 35, 15, ${alpha * 0.8})`);
      radial.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = radial;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Organic marble veins
    const drawVein = (startX: number, startY: number, color: string, width: number, branches: number) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      let currX = startX;
      let currY = startY;
      ctx.moveTo(currX, currY);

      const steps = 22;
      for (let s = 0; s < steps; s++) {
        const nextX = currX + (Math.random() - 0.42) * 85;
        const nextY = currY + 45 + Math.random() * 45;
        const cpX = currX + (Math.random() - 0.5) * 55;
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

    for (let v = 0; v < 8; v++) {
      drawVein(Math.random() * 1024, -30, veinColor1, 3.5 + Math.random() * 2.5, 2);
      drawVein(Math.random() * 1024, -30, veinColor2, 1.6 + Math.random() * 1.5, 2);
      drawVein(Math.random() * 1024, -30, 'rgba(255,255,255,0.45)', 2.0, 1);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 2);
    return texture;
  }

  /**
   * Stainless Steel brushed texture with realistic anisotropic streaks
   */
  static createBrushedSteelTexture(finish: SteelFinish = 'brushed_316'): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const baseShade = finish === 'mirror_polish' ? 220 : finish === 'matte_sanitary' ? 180 : 205;
    ctx.fillStyle = `rgb(${baseShade}, ${baseShade}, ${baseShade})`;
    ctx.fillRect(0, 0, 512, 512);

    if (finish === 'brushed_316') {
      for (let i = 0; i < 2800; i++) {
        const y = Math.random() * 512;
        const height = 0.8 + Math.random() * 1.8;
        const shade = Math.random() > 0.5 ? 245 : 40;
        ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, 0.08)`;
        ctx.fillRect(0, y, 512, height);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }

  /**
   * Cleanroom Floor Texture (Saturated deep hospital epoxy blue with non-slip grain)
   */
  static createFloorTexture(color: FloorColor = 'hospital_blue'): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Deep rich cleanroom medical blue (RAL 5012 / hospital epoxy)
    let baseR = 62, baseG = 112, baseB = 152;
    if (color === 'surgical_green') {
      baseR = 55; baseG = 125; baseB = 105;
    } else if (color === 'clean_grey') {
      baseR = 120; baseG = 130; baseB = 140;
    }

    ctx.fillStyle = `rgb(${baseR}, ${baseG}, ${baseB})`;
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle epoxy aggregate grain
    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 18;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 4);
    return texture;
  }

  /**
   * Cleanroom Sandwich Wall Panels with distinct joint seams
   */
  static createCleanroomWallTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Slightly warmer off-white (RAL 9002 grey-white)
    ctx.fillStyle = '#eef2f6';
    ctx.fillRect(0, 0, 512, 512);

    // Silicon sealant seam
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 0, 6, 512);
    ctx.fillRect(506, 0, 6, 512);

    // Inner shadow groove in seam
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(2, 0, 2, 512);
    ctx.fillRect(508, 0, 2, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 1);
    return texture;
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
