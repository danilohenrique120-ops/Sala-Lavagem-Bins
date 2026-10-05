import * as THREE from 'three';
import {
  MarbleTone,
  FloorColor,
  SteelFinish,
  RenderMode,
  WallVisibility,
  GlossLevel,
} from '../../types/archviz';
import { TextureGenerator } from './TextureGenerator';

export interface RoomMeshes {
  root: THREE.Group;
  interactiveObjects: { [id: string]: THREE.Object3D };
  doorLeft: THREE.Mesh;
  doorRight: THREE.Mesh;
  waterStreamMesh: THREE.Mesh;
  waterSplashParticles: THREE.Points;
  waterPuddleMesh: THREE.Mesh;
  cipSprayGroup: THREE.Group;
  dimensionGroup: THREE.Group;
  ceilingLights: THREE.SpotLight[];
  fillLight: THREE.HemisphereLight;
  setWaterActive: (active: boolean) => void;
  setCipActive: (active: boolean) => void;
  updateWallVisibility: (mode: WallVisibility) => void;
  updateMaterials: (options: {
    marbleTone: MarbleTone;
    floorColor: FloorColor;
    steelFinish: SteelFinish;
    renderMode: RenderMode;
    glossLevel?: GlossLevel;
  }) => void;
}

export class RoomBuilder {
  public static readonly WIDTH = 7.24; // X axis
  public static readonly DEPTH = 4.77; // Z axis
  public static readonly HEIGHT = 3.00; // Y axis
  public static readonly DOOR_WIDTH = 3.50; // Door clear width

  public static buildRoom(
    renderer: THREE.WebGLRenderer,
    envMap: THREE.Texture,
    options: {
      marbleTone: MarbleTone;
      floorColor: FloorColor;
      steelFinish: SteelFinish;
      renderMode: RenderMode;
      wallVisibility: WallVisibility;
      glossLevel?: GlossLevel;
    }
  ): RoomMeshes {
    const root = new THREE.Group();
    root.name = 'Hospital_Cleanroom_ArchViz';

    const interactiveObjects: { [id: string]: THREE.Object3D } = {};
    const dimensionGroup = new THREE.Group();
    dimensionGroup.name = 'DimensionMarkers';
    const ceilingLights: THREE.SpotLight[] = [];

    const ceilingGroup = new THREE.Group();
    ceilingGroup.name = 'CeilingGroup';
    const frontWallGroup = new THREE.Group();
    frontWallGroup.name = 'FrontWallGroup';
    const sideWallsGroup = new THREE.Group();
    sideWallsGroup.name = 'SideWallsGroup';
    const backWallGroup = new THREE.Group();
    backWallGroup.name = 'BackWallGroup';
    const covingsGroup = new THREE.Group();
    covingsGroup.name = 'SanitaryCovingsGroup';

    // --- Ultra-HD PBR Textures Sets (with Tangent Normal & Roughness Maps) ---
    let marblePBR = TextureGenerator.createMarblePBR(options.marbleTone);
    let steelPBR = TextureGenerator.createSteelPBR(options.steelFinish);
    let floorPBR = TextureGenerator.createFloorPBR(options.floorColor);
    let wallPBR = TextureGenerator.createWallPBR();
    let cabinetPBR = TextureGenerator.createCabinetPBR();
    let diamondPlatePBR = TextureGenerator.createDiamondPlatePBR();

    const gloss = options.glossLevel || 'satin_hospital';
    const isSatin = gloss === 'satin_hospital';
    const isGlossy = gloss === 'high_gloss';

    // 1. PBR Hospital Stainless Steel (AISI 316L): satin/brushed realistic finish with anisotropic normal striations
    const steelRoughness = options.steelFinish === 'mirror_polish'
      ? (isGlossy ? 0.16 : isSatin ? 0.28 : 0.22)
      : options.steelFinish === 'matte_sanitary'
      ? (isGlossy ? 0.48 : isSatin ? 0.65 : 0.55)
      : (isGlossy ? 0.26 : isSatin ? 0.44 : 0.35);

    const stainlessSteelMaterial = new THREE.MeshStandardMaterial({
      map: steelPBR.map,
      normalMap: steelPBR.normalMap,
      normalScale: new THREE.Vector2(0.35, 0.35),
      roughnessMap: steelPBR.roughnessMap,
      color: 0xc8d2db,
      metalness: options.steelFinish === 'matte_sanitary' ? 0.62 : 0.82,
      roughness: steelRoughness,
      envMap: envMap,
      envMapIntensity: isGlossy ? 0.35 : isSatin ? 0.16 : 0.24,
    });

    const mirrorSteelMaterial = new THREE.MeshStandardMaterial({
      map: steelPBR.map,
      normalMap: steelPBR.normalMap,
      normalScale: new THREE.Vector2(0.2, 0.2),
      roughnessMap: steelPBR.roughnessMap,
      color: 0xd4dce4,
      metalness: 0.85,
      roughness: isGlossy ? 0.18 : isSatin ? 0.32 : 0.24,
      envMap: envMap,
      envMapIntensity: isGlossy ? 0.38 : isSatin ? 0.18 : 0.26,
    });

    const diamondPlateMat = new THREE.MeshStandardMaterial({
      map: diamondPlatePBR.map,
      normalMap: diamondPlatePBR.normalMap,
      normalScale: new THREE.Vector2(1.2, 1.2),
      roughnessMap: diamondPlatePBR.roughnessMap,
      color: 0xc4cdd5,
      roughness: 0.38,
      metalness: 0.75,
      envMap: envMap,
      envMapIntensity: 0.22,
    });

    const chromeFaucetMaterial = new THREE.MeshStandardMaterial({
      color: 0xe0e6ec,
      metalness: 0.90,
      roughness: isGlossy ? 0.12 : isSatin ? 0.24 : 0.18,
      envMap: envMap,
      envMapIntensity: isGlossy ? 0.42 : isSatin ? 0.22 : 0.32,
    });

    const darkSteelMaterial = new THREE.MeshStandardMaterial({
      color: 0x243042,
      metalness: 0.65,
      roughness: 0.55,
      envMap: envMap,
      envMapIntensity: 0.12,
    });

    // 2. Monolithic Sanitary Epoxy Floor: satin anti-slip finish with micro orange-peel normal map
    const floorRoughness = isGlossy ? 0.28 : isSatin ? 0.62 : 0.46;
    const floorMaterial = new THREE.MeshStandardMaterial({
      map: floorPBR.map,
      normalMap: floorPBR.normalMap,
      normalScale: new THREE.Vector2(0.25, 0.25),
      roughnessMap: floorPBR.roughnessMap,
      roughness: floorRoughness,
      metalness: 0.02,
      envMap: envMap,
      envMapIntensity: isGlossy ? 0.20 : isSatin ? 0.05 : 0.10,
    });

    // 3. Countertop: Honed natural stone / marble with realistic normal map veins and depth
    const marbleRoughness = isGlossy ? 0.22 : isSatin ? 0.48 : 0.35;
    const marbleMaterial = new THREE.MeshStandardMaterial({
      map: marblePBR.map,
      normalMap: marblePBR.normalMap,
      normalScale: new THREE.Vector2(0.45, 0.45),
      roughnessMap: marblePBR.roughnessMap,
      roughness: marbleRoughness,
      metalness: 0.01,
      envMap: envMap,
      envMapIntensity: isGlossy ? 0.28 : isSatin ? 0.12 : 0.18,
    });

    // 4. Cleanroom Walls & Ceiling: Matte sanitary panels with silicone joint normal maps
    const wallMaterial = new THREE.MeshStandardMaterial({
      map: wallPBR.map,
      normalMap: wallPBR.normalMap,
      normalScale: new THREE.Vector2(0.5, 0.5),
      roughnessMap: wallPBR.roughnessMap,
      color: 0xe8edf2,
      roughness: 0.85,
      metalness: 0.0,
      envMap: envMap,
      envMapIntensity: 0.02,
      side: THREE.DoubleSide,
    });

    const covingMaterial = new THREE.MeshStandardMaterial({
      color: 0xd1d9e2,
      roughness: 0.70,
      metalness: 0.04,
      envMap: envMap,
      envMapIntensity: 0.06,
    });

    const ceilingMaterial = new THREE.MeshStandardMaterial({
      color: 0xdde3ea,
      roughness: 0.88,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });

    // Cleanroom Slate-Blue matching image.png with electrostatic powder coating normal map
    const blueLockerDoorMat = new THREE.MeshStandardMaterial({
      map: cabinetPBR.map,
      normalMap: cabinetPBR.normalMap,
      normalScale: new THREE.Vector2(0.25, 0.25),
      roughnessMap: cabinetPBR.roughnessMap,
      color: 0x5b85a3,
      roughness: isGlossy ? 0.28 : isSatin ? 0.46 : 0.38,
      metalness: 0.06,
      envMap: envMap,
      envMapIntensity: isGlossy ? 0.25 : isSatin ? 0.12 : 0.18,
    });

    const lockerBodyMat = new THREE.MeshStandardMaterial({
      color: 0x788390,
      roughness: 0.45,
      metalness: 0.25,
      envMap: envMap,
      envMapIntensity: 0.15,
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xdff0ff,
      transparent: true,
      opacity: 0.36,
      roughness: 0.03,
      metalness: 0.1,
      transmission: 0.9,
      ior: 1.52,
      envMap: envMap,
      envMapIntensity: 1.2,
    });

    // Room half dimensions and key reference coordinates
    const halfW = RoomBuilder.WIDTH / 2;
    const halfD = RoomBuilder.DEPTH / 2;
    const binZoneX = -2.55;
    const binZoneZ = 0.0;

    // --- 1. FLOOR & DEMARCATION LINES ---
    const floorGeo = new THREE.PlaneGeometry(RoomBuilder.WIDTH, RoomBuilder.DEPTH);
    const floor = new THREE.Mesh(floorGeo, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    root.add(floor);

    // Industrial Yellow Safety Boundary Lines (Polyurethane Satin Finish)
    const yellowLineMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.30,
      metalness: 0.15,
      envMap: envMap,
      envMapIntensity: 0.3,
    });

    const lineThickness = 0.08;

    // Helper to create an individual, independently editable yellow demarcation stripe
    const createDemarcationStripe = (
      name: string,
      length: number,
      orientation: 'x' | 'z',
      centerX: number,
      centerZ: number
    ) => {
      const g = new THREE.Group();
      g.name = name;
      g.position.set(centerX, 0.0025, centerZ);

      const stripeW = orientation === 'x' ? length : lineThickness;
      const stripeL = orientation === 'z' ? length : lineThickness;

      const stripeMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(stripeW, stripeL),
        yellowLineMat
      );
      stripeMesh.rotation.x = -Math.PI / 2;
      stripeMesh.receiveShadow = true;
      g.add(stripeMesh);

      // Edge bevel contrast borders for high visibility cGMP floor markings
      const borderMat = new THREE.MeshBasicMaterial({ color: 0xeab308, transparent: true, opacity: 0.85 });
      const borderGeo = new THREE.PlaneGeometry(
        orientation === 'x' ? length : 0.006,
        orientation === 'z' ? length : 0.006
      );
      const b1 = new THREE.Mesh(borderGeo, borderMat);
      b1.rotation.x = -Math.PI / 2;
      b1.position.set(
        orientation === 'z' ? -lineThickness / 2 + 0.003 : 0,
        0.0004,
        orientation === 'x' ? -lineThickness / 2 + 0.003 : 0
      );
      const b2 = new THREE.Mesh(borderGeo, borderMat);
      b2.rotation.x = -Math.PI / 2;
      b2.position.set(
        orientation === 'z' ? lineThickness / 2 - 0.003 : 0,
        0.0004,
        orientation === 'x' ? lineThickness / 2 - 0.003 : 0
      );
      g.add(b1, b2);

      return g;
    };

    // --- SEPARATE DEMARCATION STRIPES FOLLOWING THE RED PATH ---
    // "exclua essa demarcação no chao amarela e faça outra demarcação amarela seguindo esse sentido da linha vermelha na imagem, mas faça faixas separadas para eu conseguir editar"

    // 1. Faixa Lateral Direita da Bancada (along Z, between bench right edge and blue lockers)
    const demCounterRight = createDemarcationStripe(
      'Faixa_Lateral_Direita_Bancada',
      1.24,
      'z',
      2.38,
      -1.77
    );
    root.add(demCounterRight);
    interactiveObjects['demarcation_counter_right'] = demCounterRight;

    // 2. Faixa Frontal da Bancada (along X, in front of the 3.00m counter)
    const demCounterFront = createDemarcationStripe(
      'Faixa_Frontal_Bancada',
      3.23,
      'x',
      0.765,
      -1.15
    );
    root.add(demCounterFront);
    interactiveObjects['demarcation_counter_front'] = demCounterFront;
    interactiveObjects['floor_demarcation'] = demCounterFront; // Legacy alias

    // 3. Faixa Divisória Baia dos Bins (along Z, between bins/platform and dry room corridor)
    const demBayDivider = createDemarcationStripe(
      'Faixa_Divisoria_Baia_Bins',
      2.80,
      'z',
      -0.85,
      0.25
    );
    root.add(demBayDivider);
    interactiveObjects['demarcation_bay_divider'] = demBayDivider;

    // 4. Faixa Corredor Frontal / Porta (along X, in front towards 3.50m door)
    const demFrontCorridor = createDemarcationStripe(
      'Faixa_Corredor_Frontal_Porta',
      1.50,
      'x',
      -0.10,
      1.65
    );
    root.add(demFrontCorridor);
    interactiveObjects['demarcation_front_corridor'] = demFrontCorridor;

    // --- 2. SANITARY TRENCH DRAIN INOX (Below Bins - Editable) ---
    const drainGroup = new THREE.Group();
    drainGroup.name = 'Stainless_Floor_Trench_Drain';

    const drainW = 0.26;
    const drainL = 3.60;
    const drainD = 0.06;
    const drainX = binZoneX - 0.2;
    const drainZ = binZoneZ;
    drainGroup.position.set(drainX, 0, drainZ);

    // Trench recessed trough (relative to group center)
    const troughGeo = new THREE.BoxGeometry(drainW, drainD, drainL);
    const troughMesh = new THREE.Mesh(troughGeo, darkSteelMaterial);
    troughMesh.position.set(0, -drainD / 2 + 0.001, 0);
    drainGroup.add(troughMesh);

    // Perforated stainless drain grating
    const grateFrame = new THREE.Mesh(
      new THREE.BoxGeometry(drainW, 0.015, drainL),
      stainlessSteelMaterial
    );
    grateFrame.position.set(0, 0.005, 0);
    drainGroup.add(grateFrame);

    // Grating cross slots simulation
    const slotMat = darkSteelMaterial;
    for (let s = -drainL / 2 + 0.05; s < drainL / 2 - 0.04; s += 0.08) {
      const slot = new THREE.Mesh(new THREE.BoxGeometry(drainW - 0.04, 0.018, 0.025), slotMat);
      slot.position.set(0, 0.006, s);
      drainGroup.add(slot);
    }
    root.add(drainGroup);
    interactiveObjects['floor_drain'] = drainGroup;

    // --- 3. SANITARY COVING (Meia-cana RDC 50 ANVISA) ---
    // "rodapé sanitário arredondado (meia-cana RDC 50) no encontro com o piso para realismo hospitalar"
    const covingRadius = 0.05;

    const createCovingSegment = (length: number, posX: number, posZ: number, rotY: number) => {
      const covingShape = new THREE.Shape();
      covingShape.moveTo(0, 0);
      covingShape.lineTo(covingRadius, 0);
      covingShape.absarc(0, covingRadius, covingRadius, 0, Math.PI / 2, true);
      covingShape.lineTo(0, covingRadius);
      covingShape.closePath();

      const extrudeSettings = { depth: length, bevelEnabled: false };
      const geom = new THREE.ExtrudeGeometry(covingShape, extrudeSettings);
      const mesh = new THREE.Mesh(geom, covingMaterial);
      mesh.rotation.y = rotY;
      mesh.position.set(posX, 0, posZ);
      covingsGroup.add(mesh);
    };

    // Back wall coving (along top wall)
    createCovingSegment(RoomBuilder.WIDTH, -halfW, -halfD + covingRadius, 0);
    // Left wall coving
    createCovingSegment(RoomBuilder.DEPTH, -halfW + covingRadius, -halfD, Math.PI / 2);
    // Right wall coving
    createCovingSegment(RoomBuilder.DEPTH, halfW, -halfD, Math.PI / 2);
    // Front wall coving (avoiding door opening)
    const doorClearW = RoomBuilder.DOOR_WIDTH;
    const doorStartX = halfW - doorClearW - 0.3;
    createCovingSegment(doorStartX - (-halfW), -halfW, halfD, 0);

    root.add(covingsGroup);

    // --- 4. CEILING WITH 6 RECESSED HERMETIC CLEANROOM LED TROFFERS ---
    const ceilingGeo = new THREE.PlaneGeometry(RoomBuilder.WIDTH, RoomBuilder.DEPTH);
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMaterial);
    ceiling.position.y = RoomBuilder.HEIGHT;
    ceiling.rotation.x = Math.PI / 2;
    ceiling.receiveShadow = true;
    ceilingGroup.add(ceiling);

    const trofferGeo = new THREE.BoxGeometry(1.22, 0.06, 0.38);
    const trofferGlowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const trofferFrameMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.2,
      envMap: envMap,
    });

    const trofferPositions: [number, number, number][] = [
      [-2.1, RoomBuilder.HEIGHT - 0.03, -1.2],
      [-2.1, RoomBuilder.HEIGHT - 0.03, 1.2],
      [0.6, RoomBuilder.HEIGHT - 0.03, -1.2],
      [0.6, RoomBuilder.HEIGHT - 0.03, 1.2],
      [2.5, RoomBuilder.HEIGHT - 0.03, -1.2],
      [2.5, RoomBuilder.HEIGHT - 0.03, 1.2],
    ];

    trofferPositions.forEach((pos, idx) => {
      const troffer = new THREE.Group();
      const frame = new THREE.Mesh(trofferGeo, trofferFrameMat);
      const diffuser = new THREE.Mesh(new THREE.PlaneGeometry(1.16, 0.32), trofferGlowMat);
      diffuser.rotation.x = Math.PI / 2;
      diffuser.position.y = -0.031;
      troffer.add(frame, diffuser);
      troffer.position.set(pos[0], pos[1], pos[2]);
      ceilingGroup.add(troffer);

      // Hospital Cleanroom LED Spot: 4500K neutral white, soft diffused illumination (no blinding glare)
      const spotLight = new THREE.SpotLight(0xf8fafc, 0.85, 6.2, Math.PI / 3, 0.6, 1.4);
      spotLight.position.set(pos[0], RoomBuilder.HEIGHT - 0.1, pos[2]);
      spotLight.target.position.set(pos[0], 0, pos[2]);
      spotLight.castShadow = true;
      spotLight.shadow.mapSize.width = 1024;
      spotLight.shadow.mapSize.height = 1024;
      spotLight.shadow.bias = -0.0006;
      spotLight.shadow.radius = 2.5; // soft PCF contact shadows

      ceilingGroup.add(spotLight);
      ceilingGroup.add(spotLight.target);
      ceilingLights.push(spotLight);
    });

    // Subtle fill HemisphereLight preventing 100% black shadows
    const fillLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.22);
    root.add(fillLight);
    root.add(ceilingGroup);

    // --- 5. WALLS ---
    const wallThickness = 0.15;

    // Back Wall
    const topWall = new THREE.Mesh(
      new THREE.BoxGeometry(RoomBuilder.WIDTH, RoomBuilder.HEIGHT, wallThickness),
      wallMaterial
    );
    topWall.position.set(0, RoomBuilder.HEIGHT / 2, -halfD - wallThickness / 2);
    topWall.receiveShadow = true;
    backWallGroup.add(topWall);
    root.add(backWallGroup);

    // Side Walls: Left Wall
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, RoomBuilder.HEIGHT, RoomBuilder.DEPTH),
      wallMaterial
    );
    leftWall.position.set(-halfW - wallThickness / 2, RoomBuilder.HEIGHT / 2, 0);
    leftWall.receiveShadow = true;
    sideWallsGroup.add(leftWall);

    // Right Wall (Solid Cleanroom Panel Wall - black window removed per user request)
    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, RoomBuilder.HEIGHT, RoomBuilder.DEPTH),
      wallMaterial
    );
    rightWall.position.set(halfW + wallThickness / 2, RoomBuilder.HEIGHT / 2, 0);
    rightWall.receiveShadow = true;
    sideWallsGroup.add(rightWall);
    root.add(sideWallsGroup);

    // Front Wall with 3.50m Sliding Door opening
    const doorH = 2.40;
    const doorCenterX = doorStartX + doorClearW / 2;

    const bwlW = doorStartX - (-halfW);
    if (bwlW > 0) {
      const bwl = new THREE.Mesh(new THREE.BoxGeometry(bwlW, RoomBuilder.HEIGHT, wallThickness), wallMaterial);
      bwl.position.set(-halfW + bwlW / 2, RoomBuilder.HEIGHT / 2, halfD + wallThickness / 2);
      frontWallGroup.add(bwl);
    }

    const bwrW = halfW - (doorStartX + doorClearW);
    if (bwrW > 0) {
      const bwr = new THREE.Mesh(new THREE.BoxGeometry(bwrW, RoomBuilder.HEIGHT, wallThickness), wallMaterial);
      bwr.position.set(halfW - bwrW / 2, RoomBuilder.HEIGHT / 2, halfD + wallThickness / 2);
      frontWallGroup.add(bwr);
    }

    const lintelH = RoomBuilder.HEIGHT - doorH;
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(doorClearW, lintelH, wallThickness), wallMaterial);
    lintel.position.set(doorCenterX, doorH + lintelH / 2, halfD + wallThickness / 2);
    frontWallGroup.add(lintel);

    const trackMesh = new THREE.Mesh(
      new THREE.BoxGeometry(doorClearW + 0.6, 0.16, 0.22),
      new THREE.MeshStandardMaterial({
        color: 0x8896a6,
        metalness: 0.9,
        roughness: 0.25,
        envMap: envMap,
      })
    );
    trackMesh.position.set(doorCenterX, doorH + 0.08, halfD + wallThickness / 2 + 0.08);
    frontWallGroup.add(trackMesh);

    // Sliding Door Leaves
    const doorLeafW = doorClearW / 2 + 0.08;
    const doorLeafGeo = new THREE.BoxGeometry(doorLeafW, doorH - 0.04, 0.06);
    const doorLeafMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.3,
      roughness: 0.28,
      envMap: envMap,
    });

    const doorLeft = new THREE.Mesh(doorLeafGeo, doorLeafMat);
    doorLeft.castShadow = true;
    doorLeft.receiveShadow = true;
    doorLeft.position.set(doorCenterX - doorLeafW / 2, (doorH - 0.04) / 2, halfD + wallThickness / 2 + 0.06);
    const doorGlassL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.8, 0.07), glassMaterial);
    doorGlassL.position.set(0, 0.2, 0);
    doorLeft.add(doorGlassL);

    const doorRight = new THREE.Mesh(doorLeafGeo, doorLeafMat);
    doorRight.castShadow = true;
    doorRight.receiveShadow = true;
    doorRight.position.set(doorCenterX + doorLeafW / 2, (doorH - 0.04) / 2, halfD + wallThickness / 2 + 0.06);
    const doorGlassR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.8, 0.07), glassMaterial);
    doorGlassR.position.set(0, 0.2, 0);
    doorRight.add(doorGlassR);

    frontWallGroup.add(doorLeft, doorRight);
    root.add(frontWallGroup);
    interactiveObjects['sliding_door'] = doorLeft;

    // --- 6. HIGH-PRECISION CANAAN 1000L IBC BINS ---
    const createBin1000L = (id: string, name: string) => {
      const binGroup = new THREE.Group();
      binGroup.name = name;

      const bodyW = 1.08;
      const bodyH = 0.85;
      const hopperH = 0.55;
      const legH = 0.50;

      const frameMat = stainlessSteelMaterial;
      const legGeo = new THREE.CylinderGeometry(0.038, 0.038, legH + hopperH + 0.1, 24);

      const legPositions = [
        [-bodyW / 2 + 0.06, -bodyW / 2 + 0.06],
        [bodyW / 2 - 0.06, -bodyW / 2 + 0.06],
        [-bodyW / 2 + 0.06, bodyW / 2 - 0.06],
        [bodyW / 2 - 0.06, bodyW / 2 - 0.06],
      ];

      // 4 Industrial Polyurethane Swivel Casters with Brake Pedals & Corner Gusset Reinforcements
      legPositions.forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(legGeo, frameMat);
        leg.position.set(lx, (legH + hopperH + 0.1) / 2, lz);
        leg.castShadow = true;
        binGroup.add(leg);

        // Corner gusset reinforcement plate
        const gusset = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.008), darkSteelMaterial);
        gusset.position.set(lx * 0.9, legH + 0.05, lz * 0.9);
        binGroup.add(gusset);

        // Polyurethane red/orange wheel with stainless fork and foot pedal
        const wheelGroup = new THREE.Group();
        const tireMat = new THREE.MeshStandardMaterial({
          color: 0xc2410c, // Industrial Polyurethane orange/red
          roughness: 0.35,
          metalness: 0.1,
        });
        const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.045, 24), tireMat);
        tire.rotation.z = Math.PI / 2;
        tire.position.y = 0.07;

        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.047, 16), frameMat);
        hub.rotation.z = Math.PI / 2;
        hub.position.y = 0.07;

        const fork = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.08), frameMat);
        fork.position.y = 0.11;

        // Realistic brake pedal
        const brake = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.06), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
        brake.position.set(0.04, 0.08, 0.04);
        wheelGroup.add(tire, hub, fork, brake);
        wheelGroup.position.set(lx, 0, lz);
        wheelGroup.castShadow = true;
        binGroup.add(wheelGroup);
      });

      // Bottom frame base ring
      const ringX = new THREE.Mesh(new THREE.BoxGeometry(bodyW - 0.06, 0.06, 0.06), frameMat);
      ringX.position.set(0, 0.18, -bodyW / 2 + 0.06);
      const ringX2 = ringX.clone();
      ringX2.position.z = bodyW / 2 - 0.06;
      const ringZ = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, bodyW - 0.06), frameMat);
      ringZ.position.set(-bodyW / 2 + 0.06, 0.18, 0);
      const ringZ2 = ringZ.clone();
      ringZ2.position.x = bodyW / 2 - 0.06;
      binGroup.add(ringX, ringX2, ringZ, ringZ2);

      // Conical Hopper Funnel
      const coneGeo = new THREE.CylinderGeometry(bodyW / 2, 0.13, hopperH, 36);
      const cone = new THREE.Mesh(coneGeo, stainlessSteelMaterial);
      cone.position.set(0, legH + hopperH / 2, 0);
      cone.castShadow = true;
      binGroup.add(cone);

      // Sanitary Tri-Clamp Butterfly Discharge Valve with quick-locking blue lever
      const valveMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.14, 24), darkSteelMaterial);
      valveMesh.position.set(0, legH - 0.07, 0);
      const triClampFlange = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.015, 12, 24), stainlessSteelMaterial);
      triClampFlange.rotation.x = Math.PI / 2;
      triClampFlange.position.set(0, legH - 0.02, 0);
      const valveLever = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.025, 0.045), new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.3 }));
      valveLever.position.set(0.12, legH - 0.07, 0);
      binGroup.add(valveMesh, triClampFlange, valveLever);

      // Cubic Upper Body (Brushed AISI 316L matching image.png)
      const cubicBodyGeo = new THREE.BoxGeometry(bodyW, bodyH, bodyW);
      const cubicBody = new THREE.Mesh(cubicBodyGeo, stainlessSteelMaterial);
      const bodyCenterY = legH + hopperH + bodyH / 2;
      cubicBody.position.set(0, bodyCenterY, 0);
      cubicBody.castShadow = true;
      binGroup.add(cubicBody);

      // Top Inspection Manhole with clamp ring and locking arm
      const manholeGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.09, 32);
      const manhole = new THREE.Mesh(manholeGeo, frameMat);
      manhole.position.set(0, legH + hopperH + bodyH + 0.045, 0);
      const clampRing = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.025, 16, 32), darkSteelMaterial);
      clampRing.rotation.x = Math.PI / 2;
      clampRing.position.set(0, legH + hopperH + bodyH + 0.07, 0);
      const clampLock = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.04), new THREE.MeshStandardMaterial({ color: 0xd97706 }));
      clampLock.position.set(0.22, legH + hopperH + bodyH + 0.07, 0);
      binGroup.add(manhole, clampRing, clampLock);

      // Visor de Nível em Policarbonato Graduado na lateral
      const levelTubeGeo = new THREE.CylinderGeometry(0.015, 0.015, bodyH * 0.75, 16);
      const levelTube = new THREE.Mesh(levelTubeGeo, glassMaterial);
      levelTube.position.set(bodyW / 2 + 0.015, bodyCenterY, 0.25);
      const levelBracket1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.03), darkSteelMaterial);
      levelBracket1.position.set(bodyW / 2 + 0.01, bodyCenterY + bodyH * 0.35, 0.25);
      const levelBracket2 = levelBracket1.clone();
      levelBracket2.position.y = bodyCenterY - bodyH * 0.35;
      binGroup.add(levelTube, levelBracket1, levelBracket2);

      // Recessed Front Pocket Plate matching image.png
      const frontPocket = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.12, 0.02),
        darkSteelMaterial
      );
      frontPocket.position.set(0, bodyCenterY + 0.22, bodyW / 2 + 0.01);
      binGroup.add(frontPocket);

      // Ergonomic curved stainless front grab handles flanking the pocket
      const hGeo = new THREE.TorusGeometry(0.065, 0.012, 12, 24, Math.PI);
      const h1 = new THREE.Mesh(hGeo, frameMat);
      h1.position.set(-0.26, bodyCenterY + 0.22, bodyW / 2 + 0.02);
      const h2 = new THREE.Mesh(hGeo, frameMat);
      h2.position.set(0.26, bodyCenterY + 0.22, bodyW / 2 + 0.02);
      binGroup.add(h1, h2);

      // Side Trunnion Boss on right side for lifter/blender (as in image.png)
      const trunnionGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.18, 24);
      const tR = new THREE.Mesh(trunnionGeo, darkSteelMaterial);
      tR.rotation.z = Math.PI / 2;
      tR.position.set(bodyW / 2 + 0.09, bodyCenterY + 0.08, 0);
      binGroup.add(tR);

      // Technical Canaan Identification Nameplate
      const plate = new THREE.Mesh(
        new THREE.PlaneGeometry(0.36, 0.12),
        new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          metalness: 0.8,
          roughness: 0.2,
          envMap: envMap,
        })
      );
      plate.position.set(0, bodyCenterY + 0.28, bodyW / 2 + 0.003);
      binGroup.add(plate);

      interactiveObjects[id] = binGroup;
      return binGroup;
    };

    const bin1 = createBin1000L('bin_1000l_1', 'Bin 1000L Inox AISI 316L (#1)');
    bin1.position.set(-2.55, 0, -1.15);
    root.add(bin1);

    const bin2 = createBin1000L('bin_1000l_2', 'Bin 1000L Inox AISI 316L (#2)');
    bin2.position.set(-2.55, 0, 1.15);
    root.add(bin2);

    // --- 7. STAINLESS STEEL WASH PLATFORM & STAIRCASE WITH STRUCTURAL FIXINGS ---
    // "ajuste ela para o lado para ficar centralizado e não ter colisao com o bin. E adicione as fixações dos degrais."
    const platformGroup = new THREE.Group();
    platformGroup.name = 'Stainless_Wash_Platform';

    const platW = 0.76; // Clean, non-colliding width
    const platDeckL = 0.90;
    const platDeckH = 1.32;
    const stairRun = 0.95;
    const stepW = platW - 0.08; // 0.68m
    const stepD = 0.24;
    const stepThickness = 0.038;

    const deckMesh = new THREE.Mesh(
      new THREE.BoxGeometry(platW, 0.05, platDeckL),
      diamondPlateMat
    );
    deckMesh.position.set(0, platDeckH, 0);
    deckMesh.castShadow = true;
    platformGroup.add(deckMesh);

    // Safety Toe-board / Rodapé sanitário de 10cm
    const toeMat = darkSteelMaterial;
    const toeL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.1, platDeckL), toeMat);
    toeL.position.set(-platW / 2 + 0.01, platDeckH + 0.05, 0);
    const toeR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.1, platDeckL), toeMat);
    toeR.position.set(platW / 2 - 0.01, platDeckH + 0.05, 0);
    const toeB = new THREE.Mesh(new THREE.BoxGeometry(platW, 0.1, 0.02), toeMat);
    toeB.position.set(0, platDeckH + 0.05, -platDeckL / 2 + 0.01);
    platformGroup.add(toeL, toeR, toeB);

    const postGeo = new THREE.CylinderGeometry(0.024, 0.024, platDeckH, 16);
    const postPos = [
      [-platW / 2 + 0.04, -platDeckL / 2 + 0.04],
      [platW / 2 - 0.04, -platDeckL / 2 + 0.04],
      [-platW / 2 + 0.04, platDeckL / 2 - 0.04],
      [platW / 2 - 0.04, platDeckL / 2 - 0.04],
    ];
    postPos.forEach(([px, pz]) => {
      const p = new THREE.Mesh(postGeo, stainlessSteelMaterial);
      p.position.set(px, platDeckH / 2, pz);
      p.castShadow = true;
      platformGroup.add(p);

      const caster = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 16), darkSteelMaterial);
      caster.rotation.z = Math.PI / 2;
      caster.position.set(px, 0.045, pz);
      platformGroup.add(caster);
    });

    const railMat = stainlessSteelMaterial;
    const topRailGeoZ = new THREE.BoxGeometry(0.03, 0.03, platDeckL);
    const topRailGeoX = new THREE.BoxGeometry(platW, 0.03, 0.03);

    const railL = new THREE.Mesh(topRailGeoZ, railMat);
    railL.position.set(-platW / 2 + 0.03, platDeckH + 1.1, 0);
    const railR = new THREE.Mesh(topRailGeoZ, railMat);
    railR.position.set(platW / 2 - 0.03, platDeckH + 1.1, 0);
    const railB = new THREE.Mesh(topRailGeoX, railMat);
    railB.position.set(0, platDeckH + 1.1, -platDeckL / 2 + 0.03);

    const midRailL = railL.clone();
    midRailL.position.y = platDeckH + 0.55;
    const midRailR = railR.clone();
    midRailR.position.y = platDeckH + 0.55;
    const midRailB = railB.clone();
    midRailB.position.y = platDeckH + 0.55;
    platformGroup.add(railL, railR, railB, midRailL, midRailR, midRailB);

    const railPostGeo = new THREE.CylinderGeometry(0.018, 0.018, 1.1, 16);
    postPos.forEach(([px, pz]) => {
      const rp = new THREE.Mesh(railPostGeo, railMat);
      rp.position.set(px, platDeckH + 0.55, pz);
      platformGroup.add(rp);
    });

    // --- STRUCTURAL STAIR STRINGERS & MECHANICAL FIXINGS (Fixações dos Degraus) ---
    const stairAngle = Math.atan2(platDeckH, stairRun);
    const stringerLen = Math.sqrt(platDeckH * platDeckH + stairRun * stairRun) + 0.10;
    const stringerGeo = new THREE.BoxGeometry(0.035, 0.08, stringerLen);

    const stringerCenterY = platDeckH / 2;
    const stringerCenterZ = platDeckL / 2 + stairRun / 2;

    const stringerL = new THREE.Mesh(stringerGeo, stainlessSteelMaterial);
    stringerL.position.set(-stepW / 2 - 0.02, stringerCenterY, stringerCenterZ);
    stringerL.rotation.x = stairAngle;
    stringerL.castShadow = true;

    const stringerR = new THREE.Mesh(stringerGeo, stainlessSteelMaterial);
    stringerR.position.set(stepW / 2 + 0.02, stringerCenterY, stringerCenterZ);
    stringerR.rotation.x = stairAngle;
    stringerR.castShadow = true;

    platformGroup.add(stringerL, stringerR);

    // Floor Base Anchor Mounting Plates & Bolts at foot of stringers
    const footZ = platDeckL / 2 + stairRun;
    [-stepW / 2 - 0.02, stepW / 2 + 0.02].forEach((sx) => {
      const footPlate = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.016, 0.12), stainlessSteelMaterial);
      footPlate.position.set(sx, 0.008, footZ);
      const bolt1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.025, 6), darkSteelMaterial);
      bolt1.position.set(sx - 0.025, 0.02, footZ - 0.03);
      const bolt2 = bolt1.clone();
      bolt2.position.set(sx + 0.025, 0.02, footZ + 0.03);
      platformGroup.add(footPlate, bolt1, bolt2);
    });

    // Steps, Structural Gusset Brackets & Hex Fixing Bolts
    const boltGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.022, 6);
    boltGeo.rotateZ(Math.PI / 2);

    const numSteps = 4;
    for (let s = 1; s <= numSteps; s++) {
      const sY = (platDeckH / (numSteps + 1)) * s;
      const sZ = platDeckL / 2 + (stairRun / (numSteps + 1)) * (numSteps + 1 - s);

      // Diamond plate tread step
      const stepMesh = new THREE.Mesh(
        new THREE.BoxGeometry(stepW, stepThickness, stepD),
        diamondPlateMat
      );
      stepMesh.position.set(0, sY, sZ);
      stepMesh.castShadow = true;
      platformGroup.add(stepMesh);

      // Structural Left & Right Mounting Brackets (Cantoneiras de fixação) with Hex Fasteners
      [-stepW / 2, stepW / 2].forEach((sideX) => {
        const isLeft = sideX < 0;
        const bracketMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.025, 0.045, stepD - 0.04),
          stainlessSteelMaterial
        );
        bracketMesh.position.set(isLeft ? sideX + 0.012 : sideX - 0.012, sY - 0.022, sZ);
        bracketMesh.castShadow = true;

        const hexBoltF = new THREE.Mesh(boltGeo, darkSteelMaterial);
        hexBoltF.position.set(isLeft ? sideX - 0.025 : sideX + 0.025, sY - 0.015, sZ - 0.06);

        const hexBoltB = new THREE.Mesh(boltGeo, darkSteelMaterial);
        hexBoltB.position.set(isLeft ? sideX - 0.025 : sideX + 0.025, sY - 0.015, sZ + 0.06);

        platformGroup.add(bracketMesh, hexBoltF, hexBoltB);
      });
    }

    // Centered exactly at z = 0.00 between bins (no collision with bins)
    platformGroup.position.set(-1.22, 0, 0.0);
    platformGroup.rotation.y = -Math.PI / 2;
    root.add(platformGroup);
    interactiveObjects['platform_stairs'] = platformGroup;

    // --- 8. OVERHEAD SANITARY PIPING WITH UNISTRUT HANGERS & 90° SWEEP BENDS ---
    // "Tubos aéreos de água pressurizada e ar comprimido conectados com curvas suaves de 90°, abraçadeiras nos trilhos/suportes unistrut, manômetros com ponteiros nos canos e mangueira espiralada suspensa com pistola sanitária de alta pressão."
    const overheadPipingGroup = new THREE.Group();
    overheadPipingGroup.name = 'Overhead_Piping_System';

    const pipeLength = 3.2;
    const pipeYWater = 2.65;
    const pipeYAir = 2.78;
    const pipeZAir = -0.22;
    const pipeCenterX = -2.55;

    // Unistrut Channel Trapeze Ceiling Hangers
    [-1.2, 0.0, 1.2].forEach((zHanger) => {
      const rodL = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, RoomBuilder.HEIGHT - pipeYWater, 8), darkSteelMaterial);
      rodL.position.set(pipeCenterX - 0.18, (RoomBuilder.HEIGHT + pipeYWater) / 2, zHanger);
      const rodR = rodL.clone();
      rodR.position.x = pipeCenterX + 0.18;

      // Realistic slotted Unistrut cross-beam (41x41mm profile)
      const unistrutBeam = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.04, 0.04), darkSteelMaterial);
      unistrutBeam.position.set(pipeCenterX, pipeYWater - 0.04, zHanger);

      // Pipe cushion clamps (abraçadeiras de tubulação)
      const clampW = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.008, 8, 16), stainlessSteelMaterial);
      clampW.position.set(pipeCenterX, pipeYWater, zHanger);
      const clampA = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.008, 8, 16), stainlessSteelMaterial);
      clampA.position.set(pipeCenterX, pipeYAir, zHanger + pipeZAir);

      overheadPipingGroup.add(rodL, rodR, unistrutBeam, clampW, clampA);
    });

    // Water Pipeline with 90° sweep elbows
    const waterPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, pipeLength, 24), stainlessSteelMaterial);
    waterPipe.rotation.x = Math.PI / 2;
    waterPipe.position.set(pipeCenterX, pipeYWater, 0);
    overheadPipingGroup.add(waterPipe);

    // 90° Sweep Elbows at ends of water line
    const elbowW1 = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.035, 16, 24, Math.PI / 2), stainlessSteelMaterial);
    elbowW1.position.set(pipeCenterX, pipeYWater + 0.08, -pipeLength / 2);
    elbowW1.rotation.y = Math.PI / 2;
    const elbowW2 = elbowW1.clone();
    elbowW2.position.z = pipeLength / 2;
    elbowW2.rotation.y = -Math.PI / 2;
    overheadPipingGroup.add(elbowW1, elbowW2);

    const waterRingMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
    [-1.0, 0.0, 1.0].forEach((zOffset) => {
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 24), waterRingMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(pipeCenterX, pipeYWater, zOffset);
      overheadPipingGroup.add(ring);
    });

    [-1.15, 1.15].forEach((zTarget) => {
      const tee = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), darkSteelMaterial);
      tee.position.set(pipeCenterX, pipeYWater, zTarget);
      const dropPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.55, 16), stainlessSteelMaterial);
      dropPipe.position.set(pipeCenterX, pipeYWater - 0.32, zTarget);
      const vBody = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 16), darkSteelMaterial);
      vBody.position.set(pipeCenterX, pipeYWater - 0.58, zTarget);
      const vHandle = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.03), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
      vHandle.position.set(pipeCenterX + 0.08, pipeYWater - 0.58, zTarget);

      // Coiled Washdown Hose with Stainless High-Pressure Spray Gun
      const hoseCoilMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.5 });
      const hose = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.45, 12), hoseCoilMat);
      hose.position.set(pipeCenterX, pipeYWater - 0.85, zTarget);

      const sprayGun = new THREE.Group();
      const gunHandle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.14, 0.04), darkSteelMaterial);
      const gunBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.28, 16), mirrorSteelMaterial);
      gunBarrel.rotation.x = Math.PI / 2;
      gunBarrel.position.set(0, 0.05, 0.14);
      const gunTrigger = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.05, 0.02), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
      gunTrigger.position.set(0, 0.01, 0.04);
      sprayGun.add(gunHandle, gunBarrel, gunTrigger);
      sprayGun.position.set(pipeCenterX, pipeYWater - 1.15, zTarget);

      overheadPipingGroup.add(tee, dropPipe, vBody, vHandle, hose, sprayGun);
    });

    // Compressed Air Pipeline
    const airPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, pipeLength, 24), stainlessSteelMaterial);
    airPipe.rotation.x = Math.PI / 2;
    airPipe.position.set(pipeCenterX, pipeYAir, pipeZAir);
    overheadPipingGroup.add(airPipe);

    const airRingMat = new THREE.MeshStandardMaterial({ color: 0xeab308 });
    [-0.9, 0.1, 1.1].forEach((zOffset) => {
      const aRing = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.07, 24), airRingMat);
      aRing.rotation.x = Math.PI / 2;
      aRing.position.set(pipeCenterX, pipeYAir, zOffset);
      overheadPipingGroup.add(aRing);
    });

    // Pneumatic Pressure Regulator & Dial Manometer with Needle
    const regulator = new THREE.Group();
    const regBody = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), darkSteelMaterial);
    regBody.position.set(pipeCenterX, pipeYAir, 0.0);

    const gaugeBody = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.03, 24), mirrorSteelMaterial);
    gaugeBody.rotation.z = Math.PI / 2;
    gaugeBody.position.set(pipeCenterX + 0.07, pipeYAir, 0.0);

    const gaugeFace = new THREE.Mesh(new THREE.CircleGeometry(0.058, 24), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    gaugeFace.rotation.y = Math.PI / 2;
    gaugeFace.position.set(pipeCenterX + 0.086, pipeYAir, 0.0);

    const gaugeNeedle = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.04, 0.002), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    gaugeNeedle.rotation.x = 0.5;
    gaugeNeedle.position.set(pipeCenterX + 0.088, pipeYAir + 0.01, 0.0);

    regulator.add(regBody, gaugeBody, gaugeFace, gaugeNeedle);
    overheadPipingGroup.add(regulator);

    const airDrop = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 12), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
    airDrop.position.set(pipeCenterX, pipeYAir - 0.32, 0.0);
    const airGun = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.15, 0.04), darkSteelMaterial);
    airGun.position.set(pipeCenterX, pipeYAir - 0.6, 0.0);
    overheadPipingGroup.add(airDrop, airGun);

    root.add(overheadPipingGroup);
    interactiveObjects['overhead_piping'] = overheadPipingGroup;

    // --- 9. INTERACTIVE CIP WASH WATER SPRAY SIMULATION ---
    // "Botão interativo 'Testar Lavagem CIP': cria um efeito de spray d'água animado por partículas saindo dos tubos e caindo dentro dos bins."
    const cipSprayGroup = new THREE.Group();
    cipSprayGroup.name = 'CIP_Wash_Spray_Simulation';

    const createCipSprayCone = (targetZ: number) => {
      const sprayConeGroup = new THREE.Group();
      const sprayCount = 180;
      const sprayGeo = new THREE.BufferGeometry();
      const sprayPos = new Float32Array(sprayCount * 3);

      for (let i = 0; i < sprayCount; i++) {
        const progress = Math.random();
        const spread = progress * 0.25;
        const angle = Math.random() * Math.PI * 2;
        sprayPos[i * 3] = pipeCenterX + Math.cos(angle) * spread;
        sprayPos[i * 3 + 1] = pipeYWater - 0.6 - progress * 0.65;
        sprayPos[i * 3 + 2] = targetZ + Math.sin(angle) * spread;
      }
      sprayGeo.setAttribute('position', new THREE.BufferAttribute(sprayPos, 3));

      const sprayMat = new THREE.PointsMaterial({
        color: 0x93c5fd,
        size: 0.035,
        transparent: true,
        opacity: 0.85,
      });

      const points = new THREE.Points(sprayGeo, sprayMat);
      sprayConeGroup.add(points);
      return sprayConeGroup;
    };

    const spray1 = createCipSprayCone(-1.15);
    const spray2 = createCipSprayCone(1.15);
    cipSprayGroup.add(spray1, spray2);
    cipSprayGroup.visible = false;
    root.add(cipSprayGroup);

    const setCipActive = (active: boolean) => {
      cipSprayGroup.visible = active;
    };

    // --- 10. MARBLE COUNTERTOP (3.00M) WITH 15CM BACKSPLASH & DEEP SINK AT CENTER ---
    // "bancada com 3 metros de largura, com a quantidade de portas adequadas. Mude a posição da pia e torneira para o centro da bancada. pia com a bandeija mais funda."
    const counterGroup = new THREE.Group();
    counterGroup.name = 'Marble_Counter_Hospital_Sink';

    const counterWidth = 3.00; // Exactly 3.00m width per user request
    const counterDepth = 0.72; // 0.72m depth
    const counterH = 0.88;     // 0.88m height
    const counterCenterX = 0.85; // Clean alignment between demarcation (-0.65) and lockers (2.35)
    const counterCenterZ = -halfD + counterDepth / 2 + 0.01;

    counterGroup.position.set(counterCenterX, 0, counterCenterZ);

    // Polished Marble Slab (Clearcoat 0.8) - 3.00m wide
    const slabThickness = 0.06;
    const marbleSlab = new THREE.Mesh(
      new THREE.BoxGeometry(counterWidth, slabThickness, counterDepth),
      marbleMaterial
    );
    marbleSlab.position.set(0, counterH - slabThickness / 2, 0);
    marbleSlab.castShadow = true;
    marbleSlab.receiveShadow = true;
    counterGroup.add(marbleSlab);

    // High 15cm Frontão / Espelho de Parede (Backsplash)
    const splashH = 0.15;
    const splashMesh = new THREE.Mesh(
      new THREE.BoxGeometry(counterWidth, splashH, 0.03),
      marbleMaterial
    );
    splashMesh.position.set(0, counterH + splashH / 2, -counterDepth / 2 + 0.015);
    counterGroup.add(splashMesh);

    // Marble Left & Right End Caps (Acabamentos laterais)
    const endCapL = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, counterH, counterDepth),
      marbleMaterial
    );
    endCapL.position.set(-counterWidth / 2 + 0.02, counterH / 2, 0);
    const endCapR = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, counterH, counterDepth),
      marbleMaterial
    );
    endCapR.position.set(counterWidth / 2 - 0.02, counterH / 2, 0);
    counterGroup.add(endCapL, endCapR);

    // Stainless Sanitary Base Cabinet (2.96m wide)
    const baseCabinetH = counterH - slabThickness;
    const baseCabinet = new THREE.Mesh(
      new THREE.BoxGeometry(counterWidth - 0.04, baseCabinetH, counterDepth - 0.04),
      stainlessSteelMaterial
    );
    baseCabinet.position.set(0, baseCabinetH / 2, -0.01);
    baseCabinet.castShadow = true;
    baseCabinet.receiveShadow = true;
    counterGroup.add(baseCabinet);

    // Recessed sanitary plinth / toe kick (rodapé sanitário recuado 8cm)
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(counterWidth - 0.08, 0.09, counterDepth - 0.12),
      darkSteelMaterial
    );
    plinth.position.set(0, 0.045, -0.03);
    counterGroup.add(plinth);

    // 6 Cabinet Doors (3 symmetric double-door pairs of ~0.49m each, perfectly proportioned for 3.00m)
    const numDoors = 6;
    const doorSegW = (counterWidth - 0.08) / numDoors;
    const cabDoorH = baseCabinetH - 0.06;
    for (let d = 0; d < numDoors; d++) {
      const doorX = -counterWidth / 2 + 0.04 + (d + 0.5) * doorSegW;

      // Hospital Cleanroom Blue Door Panel (with subtle beveled edge)
      const doorMesh = new THREE.Mesh(
        new THREE.BoxGeometry(doorSegW - 0.015, cabDoorH, 0.024),
        blueLockerDoorMat
      );
      doorMesh.position.set(doorX, baseCabinetH / 2 + 0.01, counterDepth / 2 + 0.012);
      doorMesh.castShadow = true;
      counterGroup.add(doorMesh);

      // Stainless Steel Horizontal Pull Handle
      const hMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.018, 0.022),
        darkSteelMaterial
      );
      hMesh.position.set(doorX, baseCabinetH * 0.72, counterDepth / 2 + 0.026);
      counterGroup.add(hMesh);

      // Vertical door gap seam for realistic CAD paneling
      if (d > 0) {
        const seam = new THREE.Mesh(
          new THREE.BoxGeometry(0.004, cabDoorH, 0.005),
          darkSteelMaterial
        );
        seam.position.set(-counterWidth / 2 + 0.04 + d * doorSegW, baseCabinetH / 2 + 0.01, counterDepth / 2 + 0.025);
        counterGroup.add(seam);
      }
    }

    // --- DEEP INSET SANITARY HOSPITAL SINK (CENTERED ON COUNTER) ---
    // "preciso que faça uma pia com a bandeija mais funda... Mude a posição da pia e torneira para o centro da bancada"
    const sinkX = 0; // Exactly in the center of the 3.00m counter!
    const sinkZ = 0.02;

    const sinkRimW = 1.30;
    const sinkRimD = 0.56;
    const sinkRimH = 0.025;

    // Stainless top perimeter rim with beveled anti-drip hygienic lip
    const sinkRimMesh = new THREE.Mesh(
      new THREE.BoxGeometry(sinkRimW, sinkRimH, sinkRimD),
      stainlessSteelMaterial
    );
    sinkRimMesh.position.set(sinkX, counterH + sinkRimH / 2, sinkZ);
    counterGroup.add(sinkRimMesh);

    // Deeper Basin (Bandeja Mais Funda: 0.40m = 40cm depth!)
    const bowlW = 1.18;
    const bowlD = 0.48;
    const bowlDepth = 0.40; // Extra deep 40cm wash basin!

    const bowl = new THREE.Mesh(
      new THREE.BoxGeometry(bowlW, bowlDepth, bowlD),
      stainlessSteelMaterial
    );
    bowl.position.set(sinkX, counterH - bowlDepth / 2 + 0.01, sinkZ);
    bowl.castShadow = true;
    bowl.receiveShadow = true;
    counterGroup.add(bowl);

    // Inner bottom sloping hygienic bevel for total water drainage
    const innerBottom = new THREE.Mesh(
      new THREE.BoxGeometry(bowlW - 0.04, 0.015, bowlD - 0.04),
      stainlessSteelMaterial
    );
    innerBottom.position.set(sinkX, counterH - bowlDepth + 0.012, sinkZ);
    counterGroup.add(innerBottom);

    // Overflow safety drain slot (ladrão sanitário)
    const overflowSlot = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.015, 0.008),
      darkSteelMaterial
    );
    overflowSlot.position.set(sinkX, counterH - 0.05, sinkZ - bowlD / 2 + 0.005);
    counterGroup.add(overflowSlot);

    // Single Central Stainless Perforated Strainer (ralo tipo cesto)
    const strainer = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.05, 0.015, 24),
      darkSteelMaterial
    );
    strainer.position.set(sinkX, counterH - bowlDepth + 0.018, sinkZ);
    counterGroup.add(strainer);

    // --- HOSPITAL CLINICAL GOOSENECK FAUCET (CENTERED) ---
    // Single Hospital Clinical Gooseneck Faucet with Dual Medical Elbow Levers
    const faucetGroup = new THREE.Group();
    const faucetX = 0; // Centered
    const faucetZ = sinkZ - 0.22; // Behind the centered basin

    const baseRing = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.046, 0.02, 24), chromeFaucetMaterial);
    baseRing.position.y = 0.01;

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.20, 24), chromeFaucetMaterial);
    body.position.y = 0.10;

    // Dual Medical Elbow Lever Handles (Left & Right - Clinic contact-free operation)
    const leverHubL = new THREE.Mesh(new THREE.SphereGeometry(0.022, 16, 16), chromeFaucetMaterial);
    leverHubL.position.set(-0.065, 0.12, 0);
    const leverArmL = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.18, 0.012), chromeFaucetMaterial);
    leverArmL.position.set(-0.09, 0.19, 0);
    leverArmL.rotation.z = 0.24;

    const leverHubR = new THREE.Mesh(new THREE.SphereGeometry(0.022, 16, 16), chromeFaucetMaterial);
    leverHubR.position.set(0.065, 0.12, 0);
    const leverArmR = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.18, 0.012), chromeFaucetMaterial);
    leverArmR.position.set(0.09, 0.19, 0);
    leverArmR.rotation.z = -0.24;

    // Tall curved swivel gooseneck spout (elevated to easily fit deep containers)
    const spoutCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 0.16, 0),
      new THREE.Vector3(0, 0.38, 0.14),
      new THREE.Vector3(0, 0.28, 0.24)
    );
    const spoutGeo = new THREE.TubeGeometry(spoutCurve, 24, 0.015, 16, false);
    const spout = new THREE.Mesh(spoutGeo, chromeFaucetMaterial);

    const aerator = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.024, 16), darkSteelMaterial);
    aerator.position.set(0, 0.27, 0.24);

    faucetGroup.add(baseRing, body, leverHubL, leverArmL, leverHubR, leverArmR, spout, aerator);
    faucetGroup.position.set(faucetX, counterH, faucetZ);
    counterGroup.add(faucetGroup);

    // Water Stream & Splash (Centered and extending down into 40cm deep basin)
    const streamDropTargetZ = faucetZ + 0.24;
    const streamH = 0.44; // Extended stream to reach the 40cm deep floor of the basin
    const waterStreamGeo = new THREE.CylinderGeometry(0.01, 0.014, streamH, 16);
    const waterStreamMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.82,
      roughness: 0.05,
      transmission: 0.92,
      ior: 1.33,
    });
    const waterStreamMesh = new THREE.Mesh(waterStreamGeo, waterStreamMat);
    waterStreamMesh.position.set(sinkX, counterH + 0.27 - streamH / 2, streamDropTargetZ);
    counterGroup.add(waterStreamMesh);

    const puddleGeo = new THREE.CircleGeometry(0.16, 24);
    const puddleMat = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      roughness: 0.05,
      metalness: 0.1,
      transparent: true,
      opacity: 0.75,
    });
    const waterPuddleMesh = new THREE.Mesh(puddleGeo, puddleMat);
    waterPuddleMesh.rotation.x = -Math.PI / 2;
    waterPuddleMesh.position.set(sinkX, counterH - bowlDepth + 0.02, streamDropTargetZ);
    counterGroup.add(waterPuddleMesh);

    const splashCount = 55;
    const splashGeo = new THREE.BufferGeometry();
    const splashPos = new Float32Array(splashCount * 3);
    for (let i = 0; i < splashCount; i++) {
      splashPos[i * 3] = sinkX + (Math.random() - 0.5) * 0.12;
      splashPos[i * 3 + 1] = counterH - bowlDepth + 0.025 + Math.random() * 0.14;
      splashPos[i * 3 + 2] = streamDropTargetZ + (Math.random() - 0.5) * 0.12;
    }
    splashGeo.setAttribute('position', new THREE.BufferAttribute(splashPos, 3));
    const splashMat = new THREE.PointsMaterial({
      color: 0xbfdbfe,
      size: 0.024,
      transparent: true,
      opacity: 0.85,
    });
    const waterSplashParticles = new THREE.Points(splashGeo, splashMat);
    counterGroup.add(waterSplashParticles);

    const setWaterActive = (active: boolean) => {
      waterStreamMesh.visible = active;
      waterPuddleMesh.visible = active;
      waterSplashParticles.visible = active;
    };
    setWaterActive(true);

    root.add(counterGroup);
    interactiveObjects['marble_counter_sink'] = counterGroup;

    // --- 11. BLUE CLEANROOM ORGANIZER LOCKERS BATTERY ---
    const lockersGroup = new THREE.Group();
    lockersGroup.name = 'Blue_Cleanroom_Cabinets';

    const createLockerUnit = (doors: number, unitWidth: number, unitDepth: number, unitHeight: number) => {
      const uGroup = new THREE.Group();

      const carcass = new THREE.Mesh(
        new THREE.BoxGeometry(unitWidth, unitHeight, unitDepth),
        lockerBodyMat
      );
      carcass.position.set(0, unitHeight / 2, 0);
      carcass.castShadow = true;
      carcass.receiveShadow = true;
      uGroup.add(carcass);

      // Slanted 45° Dust-tight Cleanroom Top per cGMP
      const slantH = 0.20;
      const slantShape = new THREE.Shape();
      slantShape.moveTo(-unitDepth / 2, 0);
      slantShape.lineTo(unitDepth / 2, 0);
      slantShape.lineTo(-unitDepth / 2, slantH);
      slantShape.closePath();
      const slantExtrude = new THREE.ExtrudeGeometry(slantShape, { depth: unitWidth, bevelEnabled: false });
      const slantMesh = new THREE.Mesh(slantExtrude, lockerBodyMat);
      slantMesh.rotation.y = Math.PI / 2;
      slantMesh.position.set(-unitWidth / 2, unitHeight, 0);
      uGroup.add(slantMesh);

      const plinth = new THREE.Mesh(
        new THREE.BoxGeometry(unitWidth + 0.01, 0.1, unitDepth + 0.01),
        darkSteelMaterial
      );
      plinth.position.set(0, 0.05, 0);
      uGroup.add(plinth);

      const doorW = (unitWidth - 0.04) / doors;
      const doorH = unitHeight - 0.16;

      for (let d = 0; d < doors; d++) {
        const doorX = -unitWidth / 2 + 0.02 + (d + 0.5) * doorW;

        const door = new THREE.Mesh(
          new THREE.BoxGeometry(doorW - 0.015, doorH, 0.03),
          blueLockerDoorMat
        );
        door.position.set(doorX, 0.1 + doorH / 2, unitDepth / 2 + 0.015);
        door.castShadow = true;
        uGroup.add(door);

        // Elegant chrome metallic handle
        const handle = new THREE.Mesh(
          new THREE.BoxGeometry(0.025, 0.16, 0.02),
          chromeFaucetMaterial
        );
        handle.position.set(doorX + doorW / 2 - 0.06, 0.1 + doorH * 0.55, unitDepth / 2 + 0.035);
        uGroup.add(handle);

        const tag = new THREE.Mesh(
          new THREE.PlaneGeometry(0.12, 0.05),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        tag.position.set(doorX, 0.1 + doorH * 0.88, unitDepth / 2 + 0.032);
        uGroup.add(tag);

        // Respiros / venezianas nos armários
        for (let l = 0; l < 4; l++) {
          const louver = new THREE.Mesh(
            new THREE.BoxGeometry(doorW * 0.5, 0.008, 0.005),
            darkSteelMaterial
          );
          louver.position.set(doorX, 0.1 + doorH * 0.2 + l * 0.025, unitDepth / 2 + 0.032);
          uGroup.add(louver);
        }
      }

      return uGroup;
    };

    // Bank A: 2-Door Cleanroom Locker Unit in right back corner (matching image.png)
    const cornerLockers = createLockerUnit(2, 0.95, 0.52, 2.05);
    cornerLockers.position.set(2.88, 0, -halfD + 0.27);
    lockersGroup.add(cornerLockers);

    root.add(lockersGroup);
    interactiveObjects['shelving_units'] = lockersGroup;

    // --- 11.5. MODULAR STAINLESS STEEL WHEEL STOPS / BUMPER RAILS (SEPARATE PER WALL) ---
    // "adicione um bate-rodas de inox no rodapé das paredes, mas de forma separada para que seja possivel excluir de alguma parede se eu quiser"
    const createBumperRailSegment = (
      name: string,
      length: number,
      orientation: 'x' | 'z',
      posX: number,
      posZ: number
    ) => {
      const g = new THREE.Group();
      g.name = name;
      g.position.set(posX, 0, posZ);

      const railRadius = 0.024; // Ø48mm sanitary stainless tube
      const railH = 0.12;       // 12cm height
      const halfL = length / 2;

      // Main upper horizontal rail tube
      const railGeo = new THREE.CylinderGeometry(railRadius, railRadius, length - 0.08, 20);
      const railMesh = new THREE.Mesh(railGeo, stainlessSteelMaterial);
      railMesh.castShadow = true;
      railMesh.receiveShadow = true;

      if (orientation === 'z') {
        railMesh.rotation.x = Math.PI / 2;
        railMesh.position.set(0, railH, 0);
      } else {
        railMesh.rotation.z = Math.PI / 2;
        railMesh.position.set(0, railH, 0);
      }
      g.add(railMesh);

      // Spherical sanitary domed end caps (prevents snagging of garments and hoses)
      const capGeo = new THREE.SphereGeometry(railRadius, 16, 16);
      const cap1 = new THREE.Mesh(capGeo, stainlessSteelMaterial);
      const cap2 = new THREE.Mesh(capGeo, stainlessSteelMaterial);
      if (orientation === 'z') {
        cap1.position.set(0, railH, -halfL + 0.04);
        cap2.position.set(0, railH, halfL - 0.04);
      } else {
        cap1.position.set(-halfL + 0.04, railH, 0);
        cap2.position.set(halfL - 0.04, railH, 0);
      }
      g.add(cap1, cap2);

      // Secondary lower guard runner (duplo trilho para reter rodízios de IBC e paleteiras)
      const lowerRailRadius = 0.016;
      const lowerRailH = 0.05;
      const lowerRailGeo = new THREE.CylinderGeometry(lowerRailRadius, lowerRailRadius, length - 0.12, 16);
      const lowerRailMesh = new THREE.Mesh(lowerRailGeo, stainlessSteelMaterial);
      lowerRailMesh.castShadow = true;
      if (orientation === 'z') {
        lowerRailMesh.rotation.x = Math.PI / 2;
        lowerRailMesh.position.set(0, lowerRailH, 0);
      } else {
        lowerRailMesh.rotation.z = Math.PI / 2;
        lowerRailMesh.position.set(0, lowerRailH, 0);
      }
      g.add(lowerRailMesh);

      // Support Posts (Pilaretes de fixação ao piso com canoplas sanitárias cGMP)
      const numPosts = Math.max(2, Math.floor(length / 0.85) + 1);
      const postRadius = 0.02;
      const postGeo = new THREE.CylinderGeometry(postRadius, postRadius, railH, 16);
      const flangeGeo = new THREE.CylinderGeometry(0.042, 0.045, 0.016, 20);

      for (let p = 0; p < numPosts; p++) {
        const offset = -halfL + 0.14 + (p / (numPosts - 1)) * (length - 0.28);

        const post = new THREE.Mesh(postGeo, stainlessSteelMaterial);
        post.position.set(
          orientation === 'z' ? 0 : offset,
          railH / 2,
          orientation === 'z' ? offset : 0
        );
        post.castShadow = true;
        g.add(post);

        const flange = new THREE.Mesh(flangeGeo, stainlessSteelMaterial);
        flange.position.set(
          orientation === 'z' ? 0 : offset,
          0.008,
          orientation === 'z' ? offset : 0
        );
        g.add(flange);
      }

      return g;
    };

    // 1. Parede Esquerda (Baia dos Bins) - individual
    const bumperLeft = createBumperRailSegment(
      'Bate_Rodas_Parede_Esquerda',
      4.10,
      'z',
      -halfW + 0.08,
      0
    );
    root.add(bumperLeft);
    interactiveObjects['bumper_rail_left'] = bumperLeft;

    // 2. Parede Direita (Corredor Lateral) - individual
    const bumperRight = createBumperRailSegment(
      'Bate_Rodas_Parede_Direita',
      3.70,
      'z',
      halfW - 0.08,
      0.18
    );
    root.add(bumperRight);
    interactiveObjects['bumper_rail_right'] = bumperRight;

    // 3. Parede Traseira (Fundos da Baia dos Bins) - individual
    const bumperBack = createBumperRailSegment(
      'Bate_Rodas_Parede_Traseira',
      2.60,
      'x',
      -2.00,
      -halfD + 0.08
    );
    root.add(bumperBack);
    interactiveObjects['bumper_rail_back'] = bumperBack;

    // 4. Parede Frontal (Ao lado da Porta de 3,50m) - individual
    const bumperFront = createBumperRailSegment(
      'Bate_Rodas_Parede_Frontal',
      3.50,
      'x',
      -1.50,
      halfD - 0.08
    );
    root.add(bumperFront);
    interactiveObjects['bumper_rail_front'] = bumperFront;

    // --- 11.6. WALL-MOUNTED HOSE REEL & SANITARY WASH HOSE (SEPARATELY EDITABLE) ---
    // "aqui nesta parede atras dos Bins, preciso que adicine um suporte na parede para enrolar mangueira e com a mangueira enrolada para lavagem dos bins. De forma que seja editavel também, tanto o suporte quanto a mangueira"
    
    // Group 1: Stainless Steel Wall Mount Bracket (Suporte de Parede Inox)
    const hoseMountGroup = new THREE.Group();
    hoseMountGroup.name = 'Hose_Reel_Mount_Stainless';
    hoseMountGroup.position.set(-2.55, 1.35, -halfD + 0.05);

    // Wall backplate (placa traseira de fixação)
    const plateW = 0.38;
    const plateH = 0.42;
    const backPlate = new THREE.Mesh(
      new THREE.BoxGeometry(plateW, plateH, 0.015),
      stainlessSteelMaterial
    );
    backPlate.position.set(0, 0, 0.008);
    backPlate.castShadow = true;
    hoseMountGroup.add(backPlate);

    // 4 Corner Mounting Hex Cap Bolts
    const mountBoltGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.012, 16);
    const boltOffsets = [
      [-plateW / 2 + 0.04, plateH / 2 - 0.04],
      [plateW / 2 - 0.04, plateH / 2 - 0.04],
      [-plateW / 2 + 0.04, -plateH / 2 + 0.04],
      [plateW / 2 - 0.04, -plateH / 2 + 0.04],
    ];
    boltOffsets.forEach(([bx, by]) => {
      const bolt = new THREE.Mesh(mountBoltGeo, darkSteelMaterial);
      bolt.rotation.x = Math.PI / 2;
      bolt.position.set(bx, by, 0.018);
      hoseMountGroup.add(bolt);
    });

    // Curved saddle cradle (berço semicircular em chapa curva inox para apoiar as voltas)
    const saddleRadius = 0.16;
    const saddleDepth = 0.22;
    const saddleCurve = new THREE.CylinderGeometry(saddleRadius, saddleRadius, saddleDepth, 24, 1, false, Math.PI, Math.PI);
    const saddleMesh = new THREE.Mesh(saddleCurve, stainlessSteelMaterial);
    saddleMesh.rotation.z = Math.PI / 2;
    saddleMesh.rotation.y = Math.PI / 2;
    saddleMesh.position.set(0, 0.06, saddleDepth / 2 + 0.015);
    saddleMesh.castShadow = true;
    hoseMountGroup.add(saddleMesh);

    // Front retaining tabs (abas verticais frontais que impedem a mangueira de escorregar para frente)
    const tabGeo = new THREE.BoxGeometry(0.024, 0.14, 0.012);
    const tabL = new THREE.Mesh(tabGeo, stainlessSteelMaterial);
    tabL.position.set(-saddleRadius + 0.02, 0.11, saddleDepth + 0.015);
    const tabR = new THREE.Mesh(tabGeo, stainlessSteelMaterial);
    tabR.position.set(saddleRadius - 0.02, 0.11, saddleDepth + 0.015);
    const tabCenter = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.18, 0.012), stainlessSteelMaterial);
    tabCenter.position.set(0, 0.13, saddleDepth + 0.015);
    hoseMountGroup.add(tabL, tabR, tabCenter);

    // Side Holster Bracket for the Wash Spray Gun (coldre lateral para engate da pistola)
    const holsterRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.028, 0.06, 20),
      stainlessSteelMaterial
    );
    holsterRing.position.set(plateW / 2 + 0.05, -0.05, 0.12);
    const holsterArm = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.015, 0.12),
      stainlessSteelMaterial
    );
    holsterArm.position.set(plateW / 2 + 0.02, -0.05, 0.06);
    hoseMountGroup.add(holsterRing, holsterArm);

    root.add(hoseMountGroup);
    interactiveObjects['hose_reel_mount'] = hoseMountGroup;

    // Group 2: Coiled Cleanroom Wash Hose with Spray Gun (Mangueira Enrolada com Pistola)
    const washHoseGroup = new THREE.Group();
    washHoseGroup.name = 'Sanitary_Wash_Hose_Coiled';
    washHoseGroup.position.set(-2.55, 1.35, -halfD + 0.05 + saddleDepth / 2 + 0.02);

    const hoseMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb, // Cleanroom FDA braided blue hose
      roughness: 0.32,
      metalness: 0.12,
    });

    // 4 Realistic coiled concentric loops around the saddle
    const loopRadii = [0.17, 0.185, 0.20, 0.215];
    const loopOffsetsZ = [-0.07, -0.025, 0.025, 0.07];
    loopRadii.forEach((rad, idx) => {
      const loopGeo = new THREE.TorusGeometry(rad, 0.013, 16, 40);
      const loopMesh = new THREE.Mesh(loopGeo, hoseMat);
      loopMesh.rotation.y = (Math.random() - 0.5) * 0.06;
      loopMesh.position.set((Math.random() - 0.5) * 0.015, 0.06 - (rad - 0.17) * 0.4, loopOffsetsZ[idx]);
      loopMesh.castShadow = true;
      washHoseGroup.add(loopMesh);
    });

    // Natural hanging gravitational loop (laço de mangueira pendendo suavemente)
    const hangCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-0.16, 0.0, 0.04),
      new THREE.Vector3(-0.20, -0.42, 0.08),
      new THREE.Vector3(0.05, -0.44, 0.10),
      new THREE.Vector3(0.18, -0.15, 0.06)
    );
    const hangGeo = new THREE.TubeGeometry(hangCurve, 32, 0.013, 16, false);
    const hangMesh = new THREE.Mesh(hangGeo, hoseMat);
    hangMesh.castShadow = true;
    washHoseGroup.add(hangMesh);

    // Lead connecting hose up towards the overhead utilities
    const leadCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.14, 0.14, -0.06),
      new THREE.Vector3(-0.18, 0.55, -0.04),
      new THREE.Vector3(-0.18, 0.90, -0.02)
    );
    const leadGeo = new THREE.TubeGeometry(leadCurve, 24, 0.013, 16, false);
    const leadMesh = new THREE.Mesh(leadGeo, hoseMat);
    washHoseGroup.add(leadMesh);

    // Industrial Cleanroom Wash Spray Gun (Pistola de Alta Pressão em Inox)
    const gunGroup = new THREE.Group();
    // Gun body
    const gunBody = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.16, 0.05), stainlessSteelMaterial);
    gunBody.position.set(0, 0.06, 0);
    // Ergonomic blue rubber handle insulation
    const gunGrip = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.12, 0.035), hoseMat);
    gunGrip.position.set(0, 0.04, -0.01);
    // Barrel & conical nozzle
    const gunBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.016, 0.16, 16), stainlessSteelMaterial);
    gunBarrel.rotation.x = Math.PI / 2;
    gunBarrel.position.set(0, 0.12, 0.10);
    const gunNozzle = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.04, 16), chromeFaucetMaterial);
    gunNozzle.rotation.x = Math.PI / 2;
    gunNozzle.position.set(0, 0.12, 0.20);
    // Trigger & guard
    const trigger = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.07, 0.018), darkSteelMaterial);
    trigger.position.set(0, 0.05, 0.025);
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.10, 0.008), stainlessSteelMaterial);
    guard.position.set(0, 0.05, 0.042);
    // Swivel inlet at base
    const swivelInlet = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.04, 16), chromeFaucetMaterial);
    swivelInlet.position.set(0, -0.03, 0);

    gunGroup.add(gunBody, gunGrip, gunBarrel, gunNozzle, trigger, guard, swivelInlet);
    // Position the spray gun sitting in the holster on the right side
    gunGroup.rotation.x = 0.25;
    gunGroup.rotation.z = -0.15;
    gunGroup.position.set(plateW / 2 + 0.05, 0.04, 0.02);
    gunGroup.castShadow = true;
    washHoseGroup.add(gunGroup);

    root.add(washHoseGroup);
    interactiveObjects['wash_hose_coiled'] = washHoseGroup;

    // --- 11.7. PHARMACEUTICAL CLEANROOM OBSERVATION WINDOWS (BEHIND SINK) ---
    // "adicoine duas janelas nessa parede atras da pia, janelas quadradas com a borda preta, estilo fabrica farmaceutica. também editavel"

    const blackFrameMat = new THREE.MeshStandardMaterial({
      color: 0x18181b, // Satin black anodized aluminum cleanroom frame
      roughness: 0.35,
      metalness: 0.70,
      envMap: envMap,
      envMapIntensity: 0.4,
    });

    const blackFritMat = new THREE.MeshBasicMaterial({
      color: 0x09090b, // Ceramic black silk-screen perimeter frit
    });

    const cleanroomGlassMat = new THREE.MeshStandardMaterial({
      color: 0xdbeafe, // Cleanroom tint safety glass
      roughness: 0.08,
      metalness: 0.20,
      transparent: true,
      opacity: 0.50,
      envMap: envMap,
      envMapIntensity: 0.9,
    });

    const corridorBgMat = new THREE.MeshBasicMaterial({
      color: 0xe2e8f0, // Soft clean illuminated adjacent cleanroom corridor
    });

    const createCleanroomWindow = (name: string, posX: number, posY: number, posZ: number, size = 0.95) => {
      const wGroup = new THREE.Group();
      wGroup.name = name;
      wGroup.position.set(posX, posY, posZ);

      const frameThick = 0.05; // 5cm frame profile width
      const frameDepth = 0.024; // 2.4cm protruding flush frame
      const innerW = size - frameThick * 2;
      const innerH = size - frameThick * 2;

      // 1. Black Anodized Outer Frame (Top, Bottom, Left, Right)
      const topBar = new THREE.Mesh(new THREE.BoxGeometry(size, frameThick, frameDepth), blackFrameMat);
      topBar.position.set(0, size / 2 - frameThick / 2, 0);

      const bottomBar = new THREE.Mesh(new THREE.BoxGeometry(size, frameThick, frameDepth), blackFrameMat);
      bottomBar.position.set(0, -size / 2 + frameThick / 2, 0);

      const leftBar = new THREE.Mesh(new THREE.BoxGeometry(frameThick, innerH, frameDepth), blackFrameMat);
      leftBar.position.set(-size / 2 + frameThick / 2, 0, 0);

      const rightBar = new THREE.Mesh(new THREE.BoxGeometry(frameThick, innerH, frameDepth), blackFrameMat);
      rightBar.position.set(size / 2 - frameThick / 2, 0, 0);

      topBar.castShadow = true;
      bottomBar.castShadow = true;
      leftBar.castShadow = true;
      rightBar.castShadow = true;
      wGroup.add(topBar, bottomBar, leftBar, rightBar);

      // 2. Interior Black Ceramic Frit Border (cGMP screen print on glass perimeter)
      const fritW = 0.035;
      const fritTop = new THREE.Mesh(new THREE.PlaneGeometry(innerW, fritW), blackFritMat);
      fritTop.position.set(0, innerH / 2 - fritW / 2, 0.006);
      const fritBottom = new THREE.Mesh(new THREE.PlaneGeometry(innerW, fritW), blackFritMat);
      fritBottom.position.set(0, -innerH / 2 + fritW / 2, 0.006);
      const fritLeft = new THREE.Mesh(new THREE.PlaneGeometry(fritW, innerH - fritW * 2), blackFritMat);
      fritLeft.position.set(-innerW / 2 + fritW / 2, 0, 0.006);
      const fritRight = new THREE.Mesh(new THREE.PlaneGeometry(fritW, innerH - fritW * 2), blackFritMat);
      fritRight.position.set(innerW / 2 - fritW / 2, 0, 0.006);
      wGroup.add(fritTop, fritBottom, fritLeft, fritRight);

      // 3. Double Flush Safety Cleanroom Glazing
      const glassPane = new THREE.Mesh(new THREE.PlaneGeometry(innerW, innerH), cleanroomGlassMat);
      glassPane.position.set(0, 0, 0.007);
      wGroup.add(glassPane);

      // 4. Adjacent Corridor View Backing (gives realistic cleanroom depth)
      const backing = new THREE.Mesh(new THREE.PlaneGeometry(innerW, innerH), corridorBgMat);
      backing.position.set(0, 0, -0.002);
      const corridorFloorDivider = new THREE.Mesh(
        new THREE.PlaneGeometry(innerW, 0.008),
        new THREE.MeshBasicMaterial({ color: 0x94a3b8 })
      );
      corridorFloorDivider.position.set(0, -0.22, -0.001);
      wGroup.add(backing, corridorFloorDivider);

      return wGroup;
    };

    const windowSize = 0.95;
    const windowY = 1.75;
    const windowZ = -halfD + 0.012;

    // Window 1: Left window behind sink (centered at X = 0.10)
    const windowLeft = createCleanroomWindow(
      'Janela_Farmaceutica_Esquerda',
      0.10,
      windowY,
      windowZ,
      windowSize
    );
    root.add(windowLeft);
    interactiveObjects['cleanroom_window_left'] = windowLeft;

    // Window 2: Right window behind sink (centered at X = 1.60)
    const windowRight = createCleanroomWindow(
      'Janela_Farmaceutica_Direita',
      1.60,
      windowY,
      windowZ,
      windowSize
    );
    root.add(windowRight);
    interactiveObjects['cleanroom_window_right'] = windowRight;

    // --- 11.8. STAINLESS STEEL UTENSIL BOARD (QUADRO DE UTENSÍLIOS) ---
    // "Poderia reproduzir este suporte de inox da imagem em anexo? Colocar na parede ao lado da janela, porem de forma editavel para que seja possível movimenta-lo e rotaciona-lo."

    const utensilBoardGroup = new THREE.Group();
    utensilBoardGroup.name = 'Quadro_Utensilios_Inox';
    // Placed on the back wall beside the left window, directly above the counter / sink
    utensilBoardGroup.position.set(-1.05, 1.65, -halfD + 0.03);

    const boardW = 1.25;
    const boardH = 0.80;
    const boardD = 0.012;

    const mirrorSteelMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.12,
      metalness: 0.95,
      envMap: envMap,
      envMapIntensity: 1.0,
    });

    // 1. Backing Plate (Chapa Espelho Inox AISI 304)
    const backPlateMesh = new THREE.Mesh(
      new THREE.BoxGeometry(boardW, boardH, boardD),
      mirrorSteelMat
    );
    backPlateMesh.castShadow = true;
    backPlateMesh.receiveShadow = true;
    utensilBoardGroup.add(backPlateMesh);

    // 4 Corner Standoff Wall Spacers
    const standoffGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.02, 16);
    const standoffOffsets = [
      [-boardW / 2 + 0.035, boardH / 2 - 0.035],
      [boardW / 2 - 0.035, boardH / 2 - 0.035],
      [-boardW / 2 + 0.035, -boardH / 2 + 0.035],
      [boardW / 2 - 0.035, -boardH / 2 + 0.035],
    ];
    standoffOffsets.forEach(([soX, soY]) => {
      const so = new THREE.Mesh(standoffGeo, mirrorSteelMat);
      so.rotation.x = Math.PI / 2;
      so.position.set(soX, soY, -0.005);
      utensilBoardGroup.add(so);
    });

    // 2. Identification Header ("QUADRO DE UTENSÍLIOS")
    const boardCanvas = document.createElement('canvas');
    boardCanvas.width = 512;
    boardCanvas.height = 64;
    const boardCtx = boardCanvas.getContext('2d')!;
    boardCtx.fillStyle = '#1d4ed8'; // Industrial pharmaceutical blue
    boardCtx.fillRect(0, 0, 512, 64);
    boardCtx.fillStyle = '#ffffff';
    boardCtx.font = 'bold 30px sans-serif';
    boardCtx.textAlign = 'center';
    boardCtx.textBaseline = 'middle';
    boardCtx.fillText('QUADRO DE UTENSÍLIOS', 256, 32);
    const boardLabelTex = new THREE.CanvasTexture(boardCanvas);
    const boardLabelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.28, 0.036),
      new THREE.MeshBasicMaterial({ map: boardLabelTex })
    );
    boardLabelMesh.position.set(0.02, boardH / 2 - 0.045, boardD / 2 + 0.002);
    utensilBoardGroup.add(boardLabelMesh);

    // 3. Conical Stainless Steel Utensils (Pás dosadoras e copos cônicos em inox invertidos)
    const createConicalScoop = (
      topR: number,
      bottomR: number,
      height: number,
      hasHandle = true,
      tiltForward = -0.22,
      tiltSide = 0.08
    ) => {
      const g = new THREE.Group();
      // Main conical body (inverted: top is wider, bottom is narrower)
      const coneGeo = new THREE.CylinderGeometry(bottomR, topR, height, 20);
      const coneMesh = new THREE.Mesh(coneGeo, mirrorSteelMat);
      coneMesh.castShadow = true;
      g.add(coneMesh);

      // Hollow interior lip simulation (ring at wide rim)
      const rimGeo = new THREE.TorusGeometry(topR, 0.003, 8, 20);
      const rimMesh = new THREE.Mesh(rimGeo, mirrorSteelMat);
      rimMesh.rotation.x = Math.PI / 2;
      rimMesh.position.set(0, -height / 2, 0);
      g.add(rimMesh);

      // Ergonomic Stainless Steel D-Handle
      if (hasHandle) {
        const handleCurve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(topR + 0.005, -height / 3, 0),
          new THREE.Vector3(topR + 0.045, 0, 0),
          new THREE.Vector3(bottomR + 0.005, height / 3, 0)
        );
        const handleGeo = new THREE.TubeGeometry(handleCurve, 12, 0.006, 8, false);
        const handleMesh = new THREE.Mesh(handleGeo, mirrorSteelMat);
        g.add(handleMesh);
      }

      // Mounting peg from backplate to scoop
      const peg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.006, 0.006, 0.08, 12),
        mirrorSteelMat
      );
      peg.rotation.x = Math.PI / 2;
      peg.position.set(0, 0, -0.04);
      g.add(peg);

      g.rotation.x = tiltForward;
      g.rotation.z = tiltSide;
      return g;
    };

    // Columns of conical scoops on the left and center
    const scoopConfigs = [
      // Top Row
      { x: -0.45, y: 0.17, topR: 0.065, botR: 0.045, h: 0.26, handle: true, tF: -0.25, tS: 0.12 },
      { x: -0.28, y: 0.17, topR: 0.058, botR: 0.040, h: 0.25, handle: true, tF: -0.22, tS: 0.10 },
      { x: -0.12, y: 0.19, topR: 0.045, botR: 0.030, h: 0.24, handle: false, tF: -0.20, tS: 0.06 },
      { x: 0.04, y: 0.16, topR: 0.062, botR: 0.042, h: 0.32, handle: true, tF: -0.24, tS: 0.14 },

      // Middle Row
      { x: -0.44, y: -0.06, topR: 0.060, botR: 0.042, h: 0.25, handle: true, tF: -0.22, tS: 0.10 },
      { x: -0.28, y: -0.06, topR: 0.055, botR: 0.038, h: 0.24, handle: true, tF: -0.20, tS: 0.08 },
      { x: -0.12, y: -0.05, topR: 0.050, botR: 0.035, h: 0.23, handle: false, tF: -0.18, tS: 0.06 },
      { x: 0.04, y: -0.08, topR: 0.055, botR: 0.038, h: 0.26, handle: true, tF: -0.22, tS: 0.10 },

      // Bottom Row
      { x: -0.42, y: -0.28, topR: 0.068, botR: 0.046, h: 0.26, handle: true, tF: 0.20, tS: -0.10 },
      { x: -0.27, y: -0.28, topR: 0.052, botR: 0.036, h: 0.23, handle: true, tF: -0.18, tS: 0.08 },
      { x: -0.12, y: -0.26, topR: 0.048, botR: 0.032, h: 0.22, handle: false, tF: -0.18, tS: 0.05 },
      { x: 0.04, y: -0.27, topR: 0.050, botR: 0.034, h: 0.23, handle: true, tF: -0.20, tS: 0.08 },
    ];

    scoopConfigs.forEach((cfg) => {
      const sc = createConicalScoop(cfg.topR, cfg.botR, cfg.h, cfg.handle, cfg.tF, cfg.tS);
      sc.position.set(cfg.x, cfg.y, boardD / 2 + 0.08);
      utensilBoardGroup.add(sc);
    });

    // 4. Right Utility Section (Dispenser, Tape Holder, Squeeze Bottles & Mini Funnels)
    // Upper: Stainless Steel Tape Dispenser with Grey Tape Roll
    const tapeHolder = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.09, 0.06),
      mirrorSteelMat
    );
    tapeHolder.position.set(0.36, 0.16, boardD / 2 + 0.04);
    const tapeRoll = new THREE.Mesh(
      new THREE.TorusGeometry(0.036, 0.016, 16, 24),
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5, metalness: 0.2 })
    );
    tapeRoll.position.set(0.36, 0.22, boardD / 2 + 0.05);
    utensilBoardGroup.add(tapeHolder, tapeRoll);

    // Upper: Stainless Sheet Metal Document Pocket
    const docPocket = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.20, 0.035),
      mirrorSteelMat
    );
    docPocket.position.set(0.20, 0.16, boardD / 2 + 0.025);
    docPocket.castShadow = true;
    utensilBoardGroup.add(docPocket);

    // Middle: Stainless Wire/Sheet Caddy Shelf with Squeeze Bottles
    const caddyShelf = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.06, 0.10),
      mirrorSteelMat
    );
    caddyShelf.position.set(0.35, -0.05, boardD / 2 + 0.06);
    utensilBoardGroup.add(caddyShelf);

    // Squeeze Bottle Helper (Frascos borrifadores com bico dosador)
    const createSqueezeBottle = (capColor: number) => {
      const bGroup = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.35,
        metalness: 0.05,
        transparent: true,
        opacity: 0.85,
      });
      const bottleBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.026, 0.026, 0.12, 16),
        bodyMat
      );
      bottleBody.position.set(0, 0.06, 0);
      bGroup.add(bottleBody);

      const bottleNeck = new THREE.Mesh(
        new THREE.ConeGeometry(0.026, 0.03, 16),
        bodyMat
      );
      bottleNeck.position.set(0, 0.135, 0);
      bGroup.add(bottleNeck);

      const capMat = new THREE.MeshStandardMaterial({ color: capColor, roughness: 0.3 });
      const capMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 16), capMat);
      capMesh.position.set(0, 0.155, 0);
      bGroup.add(capMesh);

      const nozzleCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 0.165, 0),
        new THREE.Vector3(0, 0.205, 0.01),
        new THREE.Vector3(0.025, 0.19, 0.02)
      );
      const nozzleGeo = new THREE.TubeGeometry(nozzleCurve, 10, 0.003, 8, false);
      const nozzleMesh = new THREE.Mesh(nozzleGeo, capMat);
      bGroup.add(nozzleMesh);

      return bGroup;
    };

    // Bottle 1: Álcool 70% (Blue Cap)
    const bottleAlcohol = createSqueezeBottle(0x2563eb);
    bottleAlcohol.position.set(0.31, -0.05, boardD / 2 + 0.07);
    bottleAlcohol.castShadow = true;

    // Bottle 2: Detergente Neutro (White Cap)
    const bottleSoap = createSqueezeBottle(0xf1f5f9);
    bottleSoap.position.set(0.40, -0.05, boardD / 2 + 0.07);
    bottleSoap.castShadow = true;
    utensilBoardGroup.add(bottleAlcohol, bottleSoap);

    // Lower: Stainless Rail with 3 Small Conical Funnels / Mini Scoops
    const funnelRail = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.012, 0.07),
      mirrorSteelMat
    );
    funnelRail.position.set(0.35, -0.22, boardD / 2 + 0.04);
    utensilBoardGroup.add(funnelRail);

    const funnelPositions = [0.27, 0.35, 0.43];
    funnelPositions.forEach((fX) => {
      const funnel = new THREE.Mesh(
        new THREE.ConeGeometry(0.032, 0.09, 16),
        mirrorSteelMat
      );
      funnel.rotation.x = -0.22;
      funnel.position.set(fX, -0.24, boardD / 2 + 0.06);
      utensilBoardGroup.add(funnel);
    });

    // 5. Left Safety Handle (Triângulo de acionamento em inox)
    const triP1 = new THREE.Vector3(-boardW / 2 - 0.01, 0.28, 0.05);
    const triP2 = new THREE.Vector3(-boardW / 2 - 0.09, 0.12, 0.05);
    const triP3 = new THREE.Vector3(-boardW / 2 + 0.04, 0.12, 0.05);
    const triPoints = [triP1, triP2, triP3, triP1];
    const triGeo = new THREE.BufferGeometry().setFromPoints(triPoints);
    const triLine = new THREE.Line(triGeo, new THREE.LineBasicMaterial({ color: 0x94a3b8, linewidth: 3 }));
    utensilBoardGroup.add(triLine);

    root.add(utensilBoardGroup);
    interactiveObjects['quadro_utensilios'] = utensilBoardGroup;

    // --- 12. TECHNICAL DIMENSION LINES ---
    const createDimLine = (start: THREE.Vector3, end: THREE.Vector3, labelText: string, offset: THREE.Vector3) => {
      const g = new THREE.Group();
      const points = [start.clone().add(offset), end.clone().add(offset)];
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2 })
      );
      g.add(line);

      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 80;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(0, 0, 256, 80);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, 128, 40);

      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), depthTest: false }));
      sprite.scale.set(0.85, 0.28, 1);
      const mid = points[0].clone().add(points[1]).multiplyScalar(0.5);
      mid.y += 0.18;
      sprite.position.copy(mid);
      g.add(sprite);

      return g;
    };

    dimensionGroup.add(
      createDimLine(new THREE.Vector3(-halfW, 0.05, -halfD), new THREE.Vector3(halfW, 0.05, -halfD), '7,24 m', new THREE.Vector3(0, 0.1, -0.3)),
      createDimLine(new THREE.Vector3(halfW, 0.05, -halfD), new THREE.Vector3(halfW, 0.05, halfD), '4,77 m', new THREE.Vector3(0.3, 0.1, 0)),
      createDimLine(new THREE.Vector3(-halfW, 0, halfD), new THREE.Vector3(-halfW, RoomBuilder.HEIGHT, halfD), '3,00 m', new THREE.Vector3(-0.3, 0, 0)),
      createDimLine(new THREE.Vector3(doorStartX, 0.05, halfD + 0.15), new THREE.Vector3(doorStartX + doorClearW, 0.05, halfD + 0.15), '3,50 m (Porta)', new THREE.Vector3(0, 0.1, 0.35))
    );
    root.add(dimensionGroup);

    // --- 13. WALL VISIBILITY / CUTAWAY PROGRAMMING ---
    const updateWallVisibility = (mode: WallVisibility) => {
      if (mode === 'all') {
        ceilingGroup.visible = true;
        frontWallGroup.visible = true;
        sideWallsGroup.visible = true;
        backWallGroup.visible = true;
        covingsGroup.visible = true;
      } else if (mode === 'cutaway') {
        ceilingGroup.visible = false;
        frontWallGroup.visible = false;
        sideWallsGroup.visible = true;
        backWallGroup.visible = true;
        covingsGroup.visible = true;
      } else if (mode === 'none') {
        ceilingGroup.visible = false;
        frontWallGroup.visible = false;
        sideWallsGroup.visible = false;
        backWallGroup.visible = false;
        covingsGroup.visible = false;
      }
    };
    updateWallVisibility(options.wallVisibility);

    // --- 14. MATERIAL UPDATER ---
    const updateMaterials = (opts: {
      marbleTone: MarbleTone;
      floorColor: FloorColor;
      steelFinish: SteelFinish;
      renderMode: RenderMode;
      glossLevel?: GlossLevel;
    }) => {
      marblePBR.map.dispose();
      marblePBR.normalMap.dispose();
      marblePBR.roughnessMap.dispose();
      steelPBR.map.dispose();
      steelPBR.normalMap.dispose();
      steelPBR.roughnessMap.dispose();
      floorPBR.map.dispose();
      floorPBR.normalMap.dispose();
      floorPBR.roughnessMap.dispose();

      marblePBR = TextureGenerator.createMarblePBR(opts.marbleTone);
      steelPBR = TextureGenerator.createSteelPBR(opts.steelFinish);
      floorPBR = TextureGenerator.createFloorPBR(opts.floorColor);

      const gloss = opts.glossLevel || 'satin_hospital';
      const isSatin = gloss === 'satin_hospital';
      const isGlossy = gloss === 'high_gloss';

      marbleMaterial.map = marblePBR.map;
      marbleMaterial.normalMap = marblePBR.normalMap;
      marbleMaterial.roughnessMap = marblePBR.roughnessMap;
      marbleMaterial.roughness = isGlossy ? 0.22 : isSatin ? 0.48 : 0.35;
      marbleMaterial.envMapIntensity = isGlossy ? 0.28 : isSatin ? 0.12 : 0.18;
      marbleMaterial.needsUpdate = true;

      floorMaterial.map = floorPBR.map;
      floorMaterial.normalMap = floorPBR.normalMap;
      floorMaterial.roughnessMap = floorPBR.roughnessMap;
      floorMaterial.roughness = isGlossy ? 0.28 : isSatin ? 0.62 : 0.46;
      floorMaterial.envMapIntensity = isGlossy ? 0.20 : isSatin ? 0.05 : 0.10;
      floorMaterial.needsUpdate = true;

      const steelRoughness = opts.steelFinish === 'mirror_polish'
        ? (isGlossy ? 0.16 : isSatin ? 0.28 : 0.22)
        : opts.steelFinish === 'matte_sanitary'
        ? (isGlossy ? 0.48 : isSatin ? 0.65 : 0.55)
        : (isGlossy ? 0.26 : isSatin ? 0.44 : 0.35);

      stainlessSteelMaterial.map = steelPBR.map;
      stainlessSteelMaterial.normalMap = steelPBR.normalMap;
      stainlessSteelMaterial.roughnessMap = steelPBR.roughnessMap;
      stainlessSteelMaterial.roughness = steelRoughness;
      stainlessSteelMaterial.envMapIntensity = isGlossy ? 0.35 : isSatin ? 0.16 : 0.24;
      stainlessSteelMaterial.needsUpdate = true;

      mirrorSteelMaterial.map = steelPBR.map;
      mirrorSteelMaterial.normalMap = steelPBR.normalMap;
      mirrorSteelMaterial.roughnessMap = steelPBR.roughnessMap;
      mirrorSteelMaterial.roughness = isGlossy ? 0.18 : isSatin ? 0.32 : 0.24;
      mirrorSteelMaterial.envMapIntensity = isGlossy ? 0.38 : isSatin ? 0.18 : 0.26;
      mirrorSteelMaterial.needsUpdate = true;

      chromeFaucetMaterial.roughness = isGlossy ? 0.12 : isSatin ? 0.24 : 0.18;
      chromeFaucetMaterial.envMapIntensity = isGlossy ? 0.42 : isSatin ? 0.22 : 0.32;
      chromeFaucetMaterial.needsUpdate = true;

      blueLockerDoorMat.roughness = isGlossy ? 0.28 : isSatin ? 0.48 : 0.38;
      blueLockerDoorMat.envMapIntensity = isGlossy ? 0.25 : isSatin ? 0.12 : 0.18;
      blueLockerDoorMat.needsUpdate = true;

      const isWire = opts.renderMode === 'wireframe';
      const isClay = opts.renderMode === 'clay';

      [wallMaterial, floorMaterial, ceilingMaterial, marbleMaterial, stainlessSteelMaterial, mirrorSteelMaterial, chromeFaucetMaterial, darkSteelMaterial, blueLockerDoorMat, lockerBodyMat, covingMaterial].forEach((mat) => {
        mat.wireframe = isWire;
        if (isClay) {
          mat.color.setHex(0xe8ecef);
          mat.roughness = 0.9;
          mat.metalness = 0.0;
        } else {
          if (mat === wallMaterial) mat.color.setHex(0xe8edf2);
          if (mat === stainlessSteelMaterial) mat.color.setHex(0xc8d2db);
          if (mat === mirrorSteelMaterial) mat.color.setHex(0xd4dce4);
          if (mat === chromeFaucetMaterial) mat.color.setHex(0xe0e6ec);
          if (mat === blueLockerDoorMat) mat.color.setHex(0x5b85a3);
          if (mat === lockerBodyMat) mat.color.setHex(0x788390);
          if (mat === darkSteelMaterial) mat.color.setHex(0x243042);
          if (mat === covingMaterial) mat.color.setHex(0xd1d9e2);
        }
      });
    };

    return {
      root,
      interactiveObjects,
      doorLeft,
      doorRight,
      waterStreamMesh,
      waterSplashParticles,
      waterPuddleMesh,
      cipSprayGroup,
      dimensionGroup,
      ceilingLights,
      fillLight,
      setWaterActive,
      setCipActive,
      updateWallVisibility,
      updateMaterials,
    };
  }
}
