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

    // Industrial Yellow Safety Boundary Lines (matching image.png)
    const yellowLineMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.30,
      metalness: 0.15,
      envMap: envMap,
      envMapIntensity: 0.3,
    });

    const lineThickness = 0.07;
    const cornerX = -0.65;
    const frontZ = 1.65;

    // Front boundary stripe (from left wall to corner)
    const frontStripeW = cornerX - (-halfW);
    const frontStripe = new THREE.Mesh(
      new THREE.PlaneGeometry(frontStripeW, lineThickness),
      yellowLineMat
    );
    frontStripe.rotation.x = -Math.PI / 2;
    frontStripe.position.set(-halfW + frontStripeW / 2, 0.002, frontZ);
    root.add(frontStripe);

    // Side boundary stripe (from frontZ to rear wall)
    const sideStripeL = frontZ - (-halfD);
    const sideStripe = new THREE.Mesh(
      new THREE.PlaneGeometry(lineThickness, sideStripeL),
      yellowLineMat
    );
    sideStripe.rotation.x = -Math.PI / 2;
    sideStripe.position.set(cornerX, 0.002, -halfD + sideStripeL / 2);
    root.add(sideStripe);

    // --- 2. SANITARY TRENCH DRAIN INOX (Below Bins) ---
    // "Adicione no piso, logo abaixo dos bins, uma grelha/canaleta linear de dreno em aço inox para escoamento da lavagem."
    const drainGroup = new THREE.Group();
    drainGroup.name = 'Stainless_Floor_Trench_Drain';

    const drainW = 0.26;
    const drainL = 3.60;
    const drainD = 0.06;
    const drainX = binZoneX - 0.2;
    const drainZ = binZoneZ;

    // Trench recessed trough
    const troughGeo = new THREE.BoxGeometry(drainW, drainD, drainL);
    const troughMesh = new THREE.Mesh(troughGeo, darkSteelMaterial);
    troughMesh.position.set(drainX, -drainD / 2 + 0.001, drainZ);
    drainGroup.add(troughMesh);

    // Perforated stainless drain grating
    const grateFrame = new THREE.Mesh(
      new THREE.BoxGeometry(drainW, 0.015, drainL),
      stainlessSteelMaterial
    );
    grateFrame.position.set(drainX, 0.005, drainZ);
    drainGroup.add(grateFrame);

    // Grating cross slots simulation
    const slotMat = darkSteelMaterial;
    for (let s = -drainL / 2 + 0.05; s < drainL / 2 - 0.04; s += 0.08) {
      const slot = new THREE.Mesh(new THREE.BoxGeometry(drainW - 0.04, 0.018, 0.025), slotMat);
      slot.position.set(drainX, 0.006, drainZ + s);
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

    // --- 10. MARBLE COUNTERTOP WITH 15CM BACKSPLASH & DEEP DOUBLE HOSPITAL SINK ---
    // "Tampo da bancada com textura de mármore claro (clearcoat: 0.8, roughness: 0.15), frontão/espelho de parede alto (15cm) e cuba embutida profunda em aço inox com ralo e torneira hospitalar com alavanca longa médica (acionamento clínico de cotovelo)."
    const counterGroup = new THREE.Group();
    counterGroup.name = 'Marble_Counter_Hospital_Sink';

    const counterStartX = -halfW;
    const counterEndX = 2.15;
    const counterWidth = counterEndX - counterStartX; // ~5.77m
    const counterCenterX = (counterStartX + counterEndX) / 2;
    const counterDepth = 0.72;
    const counterH = 0.88;
    const counterZ = -halfD + counterDepth / 2 + 0.01;

    // Polished Marble Slab (Clearcoat 0.8)
    const slabThickness = 0.06;
    const marbleSlab = new THREE.Mesh(
      new THREE.BoxGeometry(counterWidth, slabThickness, counterDepth),
      marbleMaterial
    );
    marbleSlab.position.set(counterCenterX, counterH - slabThickness / 2, counterZ);
    marbleSlab.castShadow = true;
    marbleSlab.receiveShadow = true;
    counterGroup.add(marbleSlab);

    // High 15cm Frontão / Espelho de Parede (Backsplash)
    const splashH = 0.15;
    const splashMesh = new THREE.Mesh(
      new THREE.BoxGeometry(counterWidth, splashH, 0.03),
      marbleMaterial
    );
    splashMesh.position.set(counterCenterX, counterH + splashH / 2, -halfD + 0.015);
    counterGroup.add(splashMesh);

    // Marble Right End Cap
    const endCap = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, counterH, counterDepth),
      marbleMaterial
    );
    endCap.position.set(counterEndX - 0.02, counterH / 2, counterZ);
    counterGroup.add(endCap);

    // Stainless Sanitary Base Cabinet
    const baseCabinetH = counterH - slabThickness;
    const baseCabinet = new THREE.Mesh(
      new THREE.BoxGeometry(counterWidth - 0.04, baseCabinetH, counterDepth - 0.04),
      stainlessSteelMaterial
    );
    baseCabinet.position.set(counterCenterX - 0.02, baseCabinetH / 2, counterZ - 0.01);
    baseCabinet.castShadow = true;
    baseCabinet.receiveShadow = true;
    counterGroup.add(baseCabinet);

    // 6 Blue Cabinet Doors & Horizontal Dark Handles (Matching image.png exactly)
    const numDoors = 6;
    const doorSegW = (counterWidth - 0.08) / numDoors;
    for (let d = 0; d < numDoors; d++) {
      const doorX = counterStartX + (d + 0.5) * doorSegW + 0.04;

      // Blue Door Panel
      const doorMesh = new THREE.Mesh(
        new THREE.BoxGeometry(doorSegW - 0.015, baseCabinetH - 0.06, 0.024),
        blueLockerDoorMat
      );
      doorMesh.position.set(doorX, baseCabinetH / 2 + 0.01, counterZ + counterDepth / 2 + 0.012);
      doorMesh.castShadow = true;
      counterGroup.add(doorMesh);

      // Dark Horizontal Pull Handle
      const hMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.018, 0.022),
        darkSteelMaterial
      );
      hMesh.position.set(doorX, baseCabinetH * 0.72, counterZ + counterDepth / 2 + 0.026);
      counterGroup.add(hMesh);
    }

    // Wide Inset Stainless Single Wash Basin (Matching image.png)
    const sinkX = 0.65;
    const sinkRimW = 1.25;
    const sinkRimD = 0.52;
    const sinkRimH = 0.02;

    const sinkRimMesh = new THREE.Mesh(
      new THREE.BoxGeometry(sinkRimW, sinkRimH, sinkRimD),
      stainlessSteelMaterial
    );
    sinkRimMesh.position.set(sinkX, counterH + sinkRimH / 2, counterZ);
    counterGroup.add(sinkRimMesh);

    const bowlW = 1.12;
    const bowlD = 0.44;
    const bowlDepth = 0.25;

    const bowl = new THREE.Mesh(
      new THREE.BoxGeometry(bowlW, bowlDepth, bowlD),
      stainlessSteelMaterial
    );
    bowl.position.set(sinkX, counterH - bowlDepth / 2 + 0.01, counterZ);
    counterGroup.add(bowl);

    // Single Central Stainless Perforated Strainer
    const strainer = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.01, 24),
      darkSteelMaterial
    );
    strainer.position.set(sinkX, counterH - bowlDepth + 0.015, counterZ);
    counterGroup.add(strainer);

    // Single Hospital Clinical Gooseneck Faucet with Dual Medical Elbow Levers
    const faucetGroup = new THREE.Group();

    const baseRing = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.042, 0.018, 24), chromeFaucetMaterial);
    baseRing.position.y = 0.009;

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.16, 24), chromeFaucetMaterial);
    body.position.y = 0.08;

    // Dual Medical Elbow Lever Handles (Left & Right)
    const leverHubL = new THREE.Mesh(new THREE.SphereGeometry(0.02, 16, 16), chromeFaucetMaterial);
    leverHubL.position.set(-0.06, 0.10, 0);
    const leverArmL = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.16, 0.012), chromeFaucetMaterial);
    leverArmL.position.set(-0.08, 0.17, 0);
    leverArmL.rotation.z = 0.22;

    const leverHubR = new THREE.Mesh(new THREE.SphereGeometry(0.02, 16, 16), chromeFaucetMaterial);
    leverHubR.position.set(0.06, 0.10, 0);
    const leverArmR = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.16, 0.012), chromeFaucetMaterial);
    leverArmR.position.set(0.08, 0.17, 0);
    leverArmR.rotation.z = -0.22;

    // Tall curved swivel gooseneck spout
    const spoutCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 0.14, 0),
      new THREE.Vector3(0, 0.32, 0.12),
      new THREE.Vector3(0, 0.24, 0.22)
    );
    const spoutGeo = new THREE.TubeGeometry(spoutCurve, 24, 0.014, 16, false);
    const spout = new THREE.Mesh(spoutGeo, chromeFaucetMaterial);

    const aerator = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.02, 16), darkSteelMaterial);
    aerator.position.set(0, 0.23, 0.22);

    faucetGroup.add(baseRing, body, leverHubL, leverArmL, leverHubR, leverArmR, spout, aerator);
    faucetGroup.position.set(sinkX, counterH, counterZ - 0.16);
    counterGroup.add(faucetGroup);

    // Water Stream & Splash
    const streamH = 0.30;
    const waterStreamGeo = new THREE.CylinderGeometry(0.01, 0.014, streamH, 16);
    const waterStreamMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.8,
      roughness: 0.05,
      transmission: 0.92,
      ior: 1.33,
    });
    const waterStreamMesh = new THREE.Mesh(waterStreamGeo, waterStreamMat);
    waterStreamMesh.position.set(sinkX, counterH + 0.23 - streamH / 2, counterZ - 0.16 + 0.22);
    counterGroup.add(waterStreamMesh);

    const puddleGeo = new THREE.CircleGeometry(0.14, 24);
    const puddleMat = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      roughness: 0.05,
      metalness: 0.1,
      transparent: true,
      opacity: 0.75,
    });
    const waterPuddleMesh = new THREE.Mesh(puddleGeo, puddleMat);
    waterPuddleMesh.rotation.x = -Math.PI / 2;
    waterPuddleMesh.position.set(sinkX, counterH - bowlDepth + 0.016, counterZ);
    counterGroup.add(waterPuddleMesh);

    const splashCount = 50;
    const splashGeo = new THREE.BufferGeometry();
    const splashPos = new Float32Array(splashCount * 3);
    for (let i = 0; i < splashCount; i++) {
      splashPos[i * 3] = sinkX + (Math.random() - 0.5) * 0.10;
      splashPos[i * 3 + 1] = counterH - bowlDepth + 0.02 + Math.random() * 0.12;
      splashPos[i * 3 + 2] = counterZ + (Math.random() - 0.5) * 0.10;
    }
    splashGeo.setAttribute('position', new THREE.BufferAttribute(splashPos, 3));
    const splashMat = new THREE.PointsMaterial({
      color: 0xbfdbfe,
      size: 0.022,
      transparent: true,
      opacity: 0.8,
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

    // Bank B: Open Cleanroom Shelving Unit with 5 Blue Shelves and Sloped Top (matching image.png)
    const createSlopedShelfUnit = (unitWidth: number, unitDepth: number, unitHeight: number) => {
      const sGroup = new THREE.Group();

      // Outer metallic chassis (sides and back)
      const back = new THREE.Mesh(new THREE.BoxGeometry(unitWidth, unitHeight, 0.025), lockerBodyMat);
      back.position.set(0, unitHeight / 2, -unitDepth / 2 + 0.012);
      const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.025, unitHeight, unitDepth), lockerBodyMat);
      sideL.position.set(-unitWidth / 2 + 0.012, unitHeight / 2, 0);
      const sideR = new THREE.Mesh(new THREE.BoxGeometry(0.025, unitHeight, unitDepth), lockerBodyMat);
      sideR.position.set(unitWidth / 2 - 0.012, unitHeight / 2, 0);
      sGroup.add(back, sideL, sideR);

      // Slanted 30° cleanroom anti-dust top
      const slantH = 0.26;
      const slantShape = new THREE.Shape();
      slantShape.moveTo(-unitDepth / 2, 0);
      slantShape.lineTo(unitDepth / 2, 0);
      slantShape.lineTo(-unitDepth / 2, slantH);
      slantShape.closePath();
      const slantMesh = new THREE.Mesh(
        new THREE.ExtrudeGeometry(slantShape, { depth: unitWidth, bevelEnabled: false }),
        lockerBodyMat
      );
      slantMesh.rotation.y = Math.PI / 2;
      slantMesh.position.set(-unitWidth / 2, unitHeight, 0);
      sGroup.add(slantMesh);

      // 5 Vibrant Blue Horizontal Shelves
      const numShelves = 5;
      for (let i = 0; i < numShelves; i++) {
        const shelfY = 0.12 + (i / (numShelves - 1)) * (unitHeight - 0.32);
        const shelf = new THREE.Mesh(
          new THREE.BoxGeometry(unitWidth - 0.05, 0.025, unitDepth - 0.03),
          blueLockerDoorMat
        );
        shelf.position.set(0, shelfY, 0.01);
        shelf.castShadow = true;
        shelf.receiveShadow = true;
        sGroup.add(shelf);
      }

      return sGroup;
    };

    const sideWallShelves = createSlopedShelfUnit(1.35, 0.48, 2.05);
    sideWallShelves.rotation.y = -Math.PI / 2;
    sideWallShelves.position.set(halfW - 0.26, 0, 0.65);
    lockersGroup.add(sideWallShelves);

    root.add(lockersGroup);
    interactiveObjects['shelving_units'] = lockersGroup;

    // Electrical Automation Command Panel on right wall
    const elecPanel = new THREE.Group();
    const pBox = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.65, 0.55), stainlessSteelMaterial);
    pBox.position.set(halfW - 0.06, 1.6, -1.5);
    const eStop = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 16), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    eStop.rotation.z = Math.PI / 2;
    eStop.position.set(halfW - 0.13, 1.6, -1.4);
    elecPanel.add(pBox, eStop);
    root.add(elecPanel);

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
