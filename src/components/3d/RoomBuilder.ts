import * as THREE from 'three';
import {
  MarbleTone,
  FloorColor,
  SteelFinish,
  RenderMode,
  WallVisibility,
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
  dimensionGroup: THREE.Group;
  ceilingLights: THREE.PointLight[];
  setWaterActive: (active: boolean) => void;
  updateWallVisibility: (mode: WallVisibility) => void;
  updateMaterials: (options: {
    marbleTone: MarbleTone;
    floorColor: FloorColor;
    steelFinish: SteelFinish;
    renderMode: RenderMode;
  }) => void;
}

export class RoomBuilder {
  public static readonly WIDTH = 7.24; // X axis
  public static readonly DEPTH = 4.77; // Z axis
  public static readonly HEIGHT = 3.00; // Y axis
  public static readonly DOOR_WIDTH = 3.50; // Door clear width

  public static buildRoom(
    renderer: THREE.WebGLRenderer,
    options: {
      marbleTone: MarbleTone;
      floorColor: FloorColor;
      steelFinish: SteelFinish;
      renderMode: RenderMode;
      wallVisibility: WallVisibility;
    }
  ): RoomMeshes {
    const root = new THREE.Group();
    root.name = 'Hospital_Cleanroom_ArchViz';

    const interactiveObjects: { [id: string]: THREE.Object3D } = {};
    const dimensionGroup = new THREE.Group();
    dimensionGroup.name = 'DimensionMarkers';
    const ceilingLights: THREE.PointLight[] = [];

    const ceilingGroup = new THREE.Group();
    ceilingGroup.name = 'CeilingGroup';
    const frontWallGroup = new THREE.Group();
    frontWallGroup.name = 'FrontWallGroup';
    const sideWallsGroup = new THREE.Group();
    sideWallsGroup.name = 'SideWallsGroup';
    const backWallGroup = new THREE.Group();
    backWallGroup.name = 'BackWallGroup';

    // Environment reflection map
    const cleanroomEnvMap = TextureGenerator.createCleanroomEnvironmentMap(renderer);

    // --- PBR Textures & Materials with Rich Contrast ---
    let marbleTex = TextureGenerator.createMarbleTexture(options.marbleTone);
    let steelTex = TextureGenerator.createBrushedSteelTexture(options.steelFinish);
    let floorTex = TextureGenerator.createFloorTexture(options.floorColor);
    let wallTex = TextureGenerator.createCleanroomWallTexture();

    const wallMaterial = new THREE.MeshStandardMaterial({
      map: wallTex,
      color: 0xf1f5f9,
      roughness: 0.38,
      metalness: 0.04,
      envMap: cleanroomEnvMap,
      envMapIntensity: 0.3,
      side: THREE.DoubleSide,
    });

    const floorMaterial = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.2,
      metalness: 0.15,
      envMap: cleanroomEnvMap,
      envMapIntensity: 0.85,
    });

    const ceilingMaterial = new THREE.MeshStandardMaterial({
      color: 0xedf2f7,
      roughness: 0.65,
      metalness: 0.02,
      side: THREE.DoubleSide,
    });

    const marbleMaterial = new THREE.MeshStandardMaterial({
      map: marbleTex,
      roughness: 0.14,
      metalness: 0.08,
      envMap: cleanroomEnvMap,
      envMapIntensity: 0.95,
    });

    const mirrorSteelMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.08,
      metalness: 0.98,
      envMap: cleanroomEnvMap,
      envMapIntensity: 1.4,
    });

    const chromeFaucetMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.04,
      metalness: 1.0,
      envMap: cleanroomEnvMap,
      envMapIntensity: 1.8,
    });

    const brushedSteelMaterial = new THREE.MeshStandardMaterial({
      map: steelTex,
      color: 0xcfd8e3,
      roughness: options.steelFinish === 'mirror_polish' ? 0.08 : 0.28,
      metalness: 0.92,
      envMap: cleanroomEnvMap,
      envMapIntensity: 1.0,
    });

    const darkSteelMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.85,
      envMap: cleanroomEnvMap,
      envMapIntensity: 0.5,
    });

    // Rich Blue Cleanroom Cabinet Materials
    const blueLockerDoorMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8, // Rich signal cleanroom blue
      roughness: 0.25,
      metalness: 0.12,
      envMap: cleanroomEnvMap,
      envMapIntensity: 0.6,
    });

    const lockerBodyMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Cleanroom off-white/light grey carcass
      roughness: 0.35,
      metalness: 0.08,
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xdff0ff,
      transparent: true,
      opacity: 0.38,
      roughness: 0.03,
      metalness: 0.1,
      transmission: 0.9,
      ior: 1.52,
      envMap: cleanroomEnvMap,
      envMapIntensity: 1.0,
    });

    // 1. FLOOR & DEMARCATION LINES
    const floorGeo = new THREE.PlaneGeometry(RoomBuilder.WIDTH, RoomBuilder.DEPTH);
    const floor = new THREE.Mesh(floorGeo, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    root.add(floor);

    // Yellow safety demarcation line for "Área de Lavagem de Bins"
    const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xeab308 });
    const binZoneWidth = 2.6;
    const binZoneDepth = 3.6;
    const binZoneX = -RoomBuilder.WIDTH / 2 + binZoneWidth / 2 + 0.15;
    const binZoneZ = -0.1;

    const lineThickness = 0.07;
    const createFloorStripe = (w: number, d: number, x: number, z: number) => {
      const g = new THREE.PlaneGeometry(w, d);
      const m = new THREE.Mesh(g, yellowLineMat);
      m.rotation.x = -Math.PI / 2;
      m.position.set(x, 0.002, z);
      root.add(m);
    };

    createFloorStripe(lineThickness, binZoneDepth, binZoneX + binZoneWidth / 2, binZoneZ);
    createFloorStripe(binZoneWidth, lineThickness, binZoneX, binZoneZ + binZoneDepth / 2);
    createFloorStripe(binZoneWidth, lineThickness, binZoneX, binZoneZ - binZoneDepth / 2);

    // 2. CEILING WITH CLEANROOM TROFFERS
    const ceilingGeo = new THREE.PlaneGeometry(RoomBuilder.WIDTH, RoomBuilder.DEPTH);
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMaterial);
    ceiling.position.y = RoomBuilder.HEIGHT;
    ceiling.rotation.x = Math.PI / 2;
    ceiling.receiveShadow = true;
    ceilingGroup.add(ceiling);

    const trofferGeo = new THREE.BoxGeometry(1.2, 0.06, 0.36);
    const trofferGlowMat = new THREE.MeshBasicMaterial({ color: 0xfffdfa });
    const trofferFrameMat = new THREE.MeshStandardMaterial({
      color: 0xb0bac5,
      metalness: 0.9,
      roughness: 0.25,
      envMap: cleanroomEnvMap,
    });

    const trofferPositions = [
      [-2.1, RoomBuilder.HEIGHT - 0.03, -1.2],
      [-2.1, RoomBuilder.HEIGHT - 0.03, 1.2],
      [0.6, RoomBuilder.HEIGHT - 0.03, -1.2],
      [0.6, RoomBuilder.HEIGHT - 0.03, 1.2],
      [2.6, RoomBuilder.HEIGHT - 0.03, -1.2],
      [2.6, RoomBuilder.HEIGHT - 0.03, 1.2],
    ];

    trofferPositions.forEach((pos, idx) => {
      const troffer = new THREE.Group();
      const frame = new THREE.Mesh(trofferGeo, trofferFrameMat);
      const diffuser = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.31), trofferGlowMat);
      diffuser.rotation.x = Math.PI / 2;
      diffuser.position.y = -0.031;
      troffer.add(frame, diffuser);
      troffer.position.set(pos[0], pos[1], pos[2]);
      ceilingGroup.add(troffer);

      // Realistic soft cleanroom lighting (avoiding overblown white wash)
      const pointLight = new THREE.PointLight(0xfff5ea, 0.75, 5.0, 1.6);
      pointLight.position.set(pos[0], RoomBuilder.HEIGHT - 0.25, pos[2]);
      pointLight.castShadow = idx === 0 || idx === 2 || idx === 5;
      if (pointLight.castShadow) {
        pointLight.shadow.mapSize.width = 1024;
        pointLight.shadow.mapSize.height = 1024;
        pointLight.shadow.bias = -0.0008;
      }
      ceilingGroup.add(pointLight);
      ceilingLights.push(pointLight);
    });
    root.add(ceilingGroup);

    // 3. WALLS
    const wallThickness = 0.15;
    const halfW = RoomBuilder.WIDTH / 2;
    const halfD = RoomBuilder.DEPTH / 2;

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

    // Right Wall with cleanroom inspection window
    const rightWallBack = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, RoomBuilder.HEIGHT, 1.3), wallMaterial);
    rightWallBack.position.set(halfW + wallThickness / 2, RoomBuilder.HEIGHT / 2, -halfD + 0.65);
    const rightWallFront = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, RoomBuilder.HEIGHT, 1.3), wallMaterial);
    rightWallFront.position.set(halfW + wallThickness / 2, RoomBuilder.HEIGHT / 2, halfD - 0.65);
    const rightWallTop = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, 0.8, 2.17), wallMaterial);
    rightWallTop.position.set(halfW + wallThickness / 2, RoomBuilder.HEIGHT - 0.4, 0);
    const rightWallBottom = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, 1.0, 2.17), wallMaterial);
    rightWallBottom.position.set(halfW + wallThickness / 2, 0.5, 0);

    const winFrame = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.25, 2.2), darkSteelMaterial);
    winFrame.position.set(halfW + wallThickness / 2, 1.6, 0);
    const winGlass = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.15, 2.1), glassMaterial);
    winGlass.position.set(halfW + wallThickness / 2, 1.6, 0);

    sideWallsGroup.add(rightWallBack, rightWallFront, rightWallTop, rightWallBottom, winFrame, winGlass);
    root.add(sideWallsGroup);

    // Front Wall with 3.50m Sliding Door opening
    const doorClearW = RoomBuilder.DOOR_WIDTH;
    const doorH = 2.40;
    const doorStartX = halfW - doorClearW - 0.3;
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
        envMap: cleanroomEnvMap,
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
      roughness: 0.3,
      envMap: cleanroomEnvMap,
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

    // 4. CANAAN 1000L IBC BINS (HIGH FIDELITY AISI 316L)
    const createBin1000L = (id: string, name: string) => {
      const binGroup = new THREE.Group();
      binGroup.name = name;

      const bodyW = 1.08;
      const bodyH = 0.85;
      const hopperH = 0.55;
      const legH = 0.50;

      const frameMat = brushedSteelMaterial;
      const legGeo = new THREE.CylinderGeometry(0.038, 0.038, legH + hopperH + 0.1, 24);

      const legPositions = [
        [-bodyW / 2 + 0.06, -bodyW / 2 + 0.06],
        [bodyW / 2 - 0.06, -bodyW / 2 + 0.06],
        [-bodyW / 2 + 0.06, bodyW / 2 - 0.06],
        [bodyW / 2 - 0.06, bodyW / 2 - 0.06],
      ];

      legPositions.forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(legGeo, frameMat);
        leg.position.set(lx, (legH + hopperH + 0.1) / 2, lz);
        leg.castShadow = true;
        binGroup.add(leg);

        const wheelGroup = new THREE.Group();
        const tireMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
        const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.045, 24), tireMat);
        tire.rotation.z = Math.PI / 2;
        tire.position.y = 0.07;
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.047, 16), frameMat);
        hub.rotation.z = Math.PI / 2;
        hub.position.y = 0.07;
        const fork = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.08), frameMat);
        fork.position.y = 0.11;
        const brake = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.06), new THREE.MeshStandardMaterial({ color: 0xd97706 }));
        brake.position.set(0.04, 0.08, 0.04);
        wheelGroup.add(tire, hub, fork, brake);
        wheelGroup.position.set(lx, 0, lz);
        wheelGroup.castShadow = true;
        binGroup.add(wheelGroup);
      });

      const ringX = new THREE.Mesh(new THREE.BoxGeometry(bodyW - 0.06, 0.06, 0.06), frameMat);
      ringX.position.set(0, 0.18, -bodyW / 2 + 0.06);
      const ringX2 = ringX.clone();
      ringX2.position.z = bodyW / 2 - 0.06;
      const ringZ = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, bodyW - 0.06), frameMat);
      ringZ.position.set(-bodyW / 2 + 0.06, 0.18, 0);
      const ringZ2 = ringZ.clone();
      ringZ2.position.x = bodyW / 2 - 0.06;
      binGroup.add(ringX, ringX2, ringZ, ringZ2);

      const coneGeo = new THREE.CylinderGeometry(bodyW / 2, 0.13, hopperH, 36);
      const cone = new THREE.Mesh(coneGeo, mirrorSteelMaterial);
      cone.position.set(0, legH + hopperH / 2, 0);
      cone.castShadow = true;
      binGroup.add(cone);

      const valveMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.14, 24), darkSteelMaterial);
      valveMesh.position.set(0, legH - 0.07, 0);
      const valveLever = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.025, 0.045), new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.3 }));
      valveLever.position.set(0.12, legH - 0.07, 0);
      binGroup.add(valveMesh, valveLever);

      const cubicBodyGeo = new THREE.BoxGeometry(bodyW, bodyH, bodyW);
      const cubicBody = new THREE.Mesh(cubicBodyGeo, mirrorSteelMaterial);
      const bodyCenterY = legH + hopperH + bodyH / 2;
      cubicBody.position.set(0, bodyCenterY, 0);
      cubicBody.castShadow = true;
      binGroup.add(cubicBody);

      const manholeGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.09, 32);
      const manhole = new THREE.Mesh(manholeGeo, frameMat);
      manhole.position.set(0, legH + hopperH + bodyH + 0.045, 0);
      const clampRing = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.025, 16, 32), darkSteelMaterial);
      clampRing.rotation.x = Math.PI / 2;
      clampRing.position.set(0, legH + hopperH + bodyH + 0.07, 0);
      const clampLock = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.04), new THREE.MeshStandardMaterial({ color: 0xd97706 }));
      clampLock.position.set(0.22, legH + hopperH + bodyH + 0.07, 0);
      binGroup.add(manhole, clampRing, clampLock);

      const handleMat = frameMat;
      const hGeo = new THREE.TorusGeometry(0.08, 0.015, 12, 24, Math.PI);
      const h1 = new THREE.Mesh(hGeo, handleMat);
      h1.position.set(-0.25, bodyCenterY + 0.18, bodyW / 2 + 0.02);
      const h2 = new THREE.Mesh(hGeo, handleMat);
      h2.position.set(0.25, bodyCenterY + 0.18, bodyW / 2 + 0.02);
      binGroup.add(h1, h2);

      const trunnionGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.18, 24);
      const tL = new THREE.Mesh(trunnionGeo, darkSteelMaterial);
      tL.rotation.z = Math.PI / 2;
      tL.position.set(-bodyW / 2 - 0.09, bodyCenterY, 0);
      const tR = new THREE.Mesh(trunnionGeo, darkSteelMaterial);
      tR.rotation.z = Math.PI / 2;
      tR.position.set(bodyW / 2 + 0.09, bodyCenterY, 0);
      binGroup.add(tL, tR);

      const plate = new THREE.Mesh(
        new THREE.PlaneGeometry(0.36, 0.12),
        new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          metalness: 0.8,
          roughness: 0.2,
          envMap: cleanroomEnvMap,
        })
      );
      plate.position.set(0, bodyCenterY + 0.28, bodyW / 2 + 0.003);
      binGroup.add(plate);

      interactiveObjects[id] = binGroup;
      return binGroup;
    };

    const bin1 = createBin1000L('bin_1000l_1', 'Bin 1000L Inox 316L (#1)');
    bin1.position.set(-2.55, 0, -0.95);
    root.add(bin1);

    const bin2 = createBin1000L('bin_1000l_2', 'Bin 1000L Inox 316L (#2)');
    bin2.position.set(-2.55, 0, 0.95);
    root.add(bin2);

    // 5. STAINLESS STEEL WASH PLATFORM LADDER
    const platformGroup = new THREE.Group();
    platformGroup.name = 'Stainless_Wash_Platform';

    const platW = 0.88;
    const platDeckL = 0.92;
    const platDeckH = 1.38;
    const stairRun = 0.85;

    const deckMesh = new THREE.Mesh(
      new THREE.BoxGeometry(platW, 0.05, platDeckL),
      brushedSteelMaterial
    );
    deckMesh.position.set(0, platDeckH, 0);
    deckMesh.castShadow = true;
    platformGroup.add(deckMesh);

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
      const p = new THREE.Mesh(postGeo, brushedSteelMaterial);
      p.position.set(px, platDeckH / 2, pz);
      p.castShadow = true;
      platformGroup.add(p);

      const caster = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 16), darkSteelMaterial);
      caster.rotation.z = Math.PI / 2;
      caster.position.set(px, 0.045, pz);
      platformGroup.add(caster);
    });

    const railMat = brushedSteelMaterial;
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

    const numSteps = 4;
    for (let s = 1; s <= numSteps; s++) {
      const sY = (platDeckH / (numSteps + 1)) * s;
      const sZ = platDeckL / 2 + (stairRun / (numSteps + 1)) * (numSteps + 1 - s);
      const stepMesh = new THREE.Mesh(
        new THREE.BoxGeometry(platW - 0.08, 0.04, 0.24),
        brushedSteelMaterial
      );
      stepMesh.position.set(0, sY, sZ);
      stepMesh.castShadow = true;
      platformGroup.add(stepMesh);
    }

    platformGroup.position.set(-1.30, 0, 0.0);
    platformGroup.rotation.y = -Math.PI / 2;
    root.add(platformGroup);
    interactiveObjects['platform_stairs'] = platformGroup;

    // 6. OVERHEAD PIPING: WATER & COMPRESSED AIR
    const overheadPipingGroup = new THREE.Group();
    overheadPipingGroup.name = 'Overhead_Piping_System';

    const pipeLength = 3.2;
    const pipeYWater = 2.65;
    const pipeYAir = 2.78;
    const pipeZAir = -0.22;
    const pipeCenterX = -2.55;

    // Water Pipeline
    const waterPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, pipeLength, 24), brushedSteelMaterial);
    waterPipe.rotation.x = Math.PI / 2;
    waterPipe.position.set(pipeCenterX, pipeYWater, 0);
    overheadPipingGroup.add(waterPipe);

    const waterRingMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
    [-1.0, 0.0, 1.0].forEach((zOffset) => {
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 24), waterRingMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(pipeCenterX, pipeYWater, zOffset);
      overheadPipingGroup.add(ring);
    });

    [-0.95, 0.95].forEach((zTarget) => {
      const tee = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), darkSteelMaterial);
      tee.position.set(pipeCenterX, pipeYWater, zTarget);
      const dropPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.55, 16), brushedSteelMaterial);
      dropPipe.position.set(pipeCenterX, pipeYWater - 0.32, zTarget);
      const vBody = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 16), darkSteelMaterial);
      vBody.position.set(pipeCenterX, pipeYWater - 0.58, zTarget);
      const vHandle = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.03), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
      vHandle.position.set(pipeCenterX + 0.08, pipeYWater - 0.58, zTarget);
      const hoseCoilMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.5 });
      const hose = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.45, 12), hoseCoilMat);
      hose.position.set(pipeCenterX, pipeYWater - 0.85, zTarget);
      const sprayGun = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.035, 0.28, 16), mirrorSteelMaterial);
      sprayGun.position.set(pipeCenterX, pipeYWater - 1.15, zTarget);

      overheadPipingGroup.add(tee, dropPipe, vBody, vHandle, hose, sprayGun);
    });

    // Compressed Air Pipeline
    const airPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, pipeLength, 24), brushedSteelMaterial);
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

    [-1.2, 0.0, 1.2].forEach((zHanger) => {
      const rodL = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, RoomBuilder.HEIGHT - pipeYWater, 8), darkSteelMaterial);
      rodL.position.set(pipeCenterX - 0.15, (RoomBuilder.HEIGHT + pipeYWater) / 2, zHanger);
      const rodR = rodL.clone();
      rodR.position.x = pipeCenterX + 0.15;
      const crossBeam = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.02, 0.04), darkSteelMaterial);
      crossBeam.position.set(pipeCenterX, pipeYWater - 0.04, zHanger);
      overheadPipingGroup.add(rodL, rodR, crossBeam);
    });

    root.add(overheadPipingGroup);
    interactiveObjects['overhead_piping'] = overheadPipingGroup;

    // 7. MARBLE COUNTERTOP (RESOLVED CONFLICT: Ends before the right corner to leave clean space for blue cabinets!)
    // "repare que o armario azu está em conflito com a bancada da pia. Tire o armario da pia ou diminua um pouco o tamanho da bancada."
    const counterGroup = new THREE.Group();
    counterGroup.name = 'Marble_Counter_Hospital_Sink';

    const counterStartX = -halfW; // -3.62m
    const counterEndX = 2.15; // Ends well before the right corner (+3.62m), leaving 1.47m clear!
    const counterWidth = counterEndX - counterStartX; // ~5.77m
    const counterCenterX = (counterStartX + counterEndX) / 2; // -0.735m
    const counterDepth = 0.72;
    const counterH = 0.88;
    const counterZ = -halfD + counterDepth / 2 + 0.01;

    // Light Brown Marble Slab with warm rich veins
    const slabThickness = 0.06;
    const marbleSlab = new THREE.Mesh(
      new THREE.BoxGeometry(counterWidth, slabThickness, counterDepth),
      marbleMaterial
    );
    marbleSlab.position.set(counterCenterX, counterH - slabThickness / 2, counterZ);
    marbleSlab.castShadow = true;
    marbleSlab.receiveShadow = true;
    counterGroup.add(marbleSlab);

    // Marble Backsplash
    const splashMesh = new THREE.Mesh(
      new THREE.BoxGeometry(counterWidth, 0.16, 0.03),
      marbleMaterial
    );
    splashMesh.position.set(counterCenterX, counterH + 0.08, -halfD + 0.015);
    counterGroup.add(splashMesh);

    // Marble Right End Cap (Acabamento lateral chanfrado de mármore)
    const endCap = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, counterH, counterDepth),
      marbleMaterial
    );
    endCap.position.set(counterEndX - 0.02, counterH / 2, counterZ);
    counterGroup.add(endCap);

    // Base Cabinets under counter
    const baseCabinetH = counterH - slabThickness;
    const baseCabinet = new THREE.Mesh(
      new THREE.BoxGeometry(counterWidth - 0.04, baseCabinetH, counterDepth - 0.04),
      brushedSteelMaterial
    );
    baseCabinet.position.set(counterCenterX - 0.02, baseCabinetH / 2, counterZ - 0.01);
    baseCabinet.castShadow = true;
    baseCabinet.receiveShadow = true;
    counterGroup.add(baseCabinet);

    // Stainless Cabinet Door Handles
    const numDoors = 8;
    const doorSegW = (counterWidth - 0.1) / numDoors;
    for (let d = 0; d < numDoors; d++) {
      const doorX = counterStartX + (d + 0.5) * doorSegW + 0.05;
      const hMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.03), darkSteelMaterial);
      hMesh.position.set(doorX, counterH * 0.65, counterZ + counterDepth / 2 + 0.005);
      counterGroup.add(hMesh);
    }

    // DROP-IN DOUBLE BOWL SINK (NORMAL PROPORTIONS)
    const sinkX = 0.2;
    const sinkRimW = 1.18;
    const sinkRimD = 0.50;
    const sinkRimH = 0.02;

    const sinkRimMesh = new THREE.Mesh(
      new THREE.BoxGeometry(sinkRimW, sinkRimH, sinkRimD),
      mirrorSteelMaterial
    );
    sinkRimMesh.position.set(sinkX, counterH + sinkRimH / 2, counterZ);
    counterGroup.add(sinkRimMesh);

    // Two Deep Normal Bowls (0.48m x 0.38m x 0.26m)
    const bowlW = 0.48;
    const bowlD = 0.38;
    const bowlDepth = 0.26;

    const bowl1 = new THREE.Mesh(new THREE.BoxGeometry(bowlW, bowlDepth, bowlD), mirrorSteelMaterial);
    bowl1.position.set(sinkX - 0.27, counterH - bowlDepth / 2 + 0.01, counterZ);
    const bowl2 = new THREE.Mesh(new THREE.BoxGeometry(bowlW, bowlDepth, bowlD), mirrorSteelMaterial);
    bowl2.position.set(sinkX + 0.27, counterH - bowlDepth / 2 + 0.01, counterZ);
    counterGroup.add(bowl1, bowl2);

    // Strainers
    const strainer1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.01, 24), darkSteelMaterial);
    strainer1.position.set(sinkX - 0.27, counterH - bowlDepth + 0.015, counterZ);
    const strainer2 = strainer1.clone();
    strainer2.position.x = sinkX + 0.27;
    counterGroup.add(strainer1, strainer2);

    // NORMAL STANDARD SINK FAUCETS (BEAUTIFUL CONTEMPORARY SINGLE-LEVER MIXER)
    // "as torneiras, estão bem feias. Adicione torneiras de pia normais, padrão."
    const createStandardFaucet = (fx: number) => {
      const fGroup = new THREE.Group();

      // Clean chrome base escutcheon ring
      const baseRing = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.015, 24), chromeFaucetMaterial);
      baseRing.position.y = 0.0075;

      // Vertical cylindrical faucet body (standard height ~12cm)
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.12, 24), chromeFaucetMaterial);
      body.position.y = 0.06;

      // Single-lever mixer handle on top
      const handleHub = new THREE.Mesh(new THREE.SphereGeometry(0.022, 16, 16), chromeFaucetMaterial);
      handleHub.position.y = 0.125;
      const handleLever = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.01, 0.08), chromeFaucetMaterial);
      handleLever.position.set(0, 0.13, 0.04);
      handleLever.rotation.x = -0.15;

      // Standard gracefully curved swivel spout reaching over bowl
      // Horizontal run with gentle curve
      const spoutCurve = new THREE.CurvePath<THREE.Vector3>();
      const p1 = new THREE.Vector3(0, 0.10, 0);
      const p2 = new THREE.Vector3(0, 0.18, 0.08);
      const p3 = new THREE.Vector3(0, 0.15, 0.18);
      const curve = new THREE.QuadraticBezierCurve3(p1, p2, p3);
      const spoutGeo = new THREE.TubeGeometry(curve, 20, 0.012, 16, false);
      const spout = new THREE.Mesh(spoutGeo, chromeFaucetMaterial);

      // Aerator nozzle at tip pointing down into bowl
      const aeratorTip = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 16), darkSteelMaterial);
      aeratorTip.position.set(0, 0.14, 0.18);

      fGroup.add(baseRing, body, handleHub, handleLever, spout, aeratorTip);
      fGroup.position.set(fx, counterH, counterZ - 0.14);
      return fGroup;
    };

    const faucet1 = createStandardFaucet(sinkX - 0.27);
    const faucet2 = createStandardFaucet(sinkX + 0.27);
    counterGroup.add(faucet1, faucet2);

    // WATER STREAM & SPLASH SYSTEM (Functional On/Off!)
    const streamH = 0.28;
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
    // Directly aligned under faucet aerator!
    waterStreamMesh.position.set(sinkX - 0.27, counterH + 0.14 - streamH / 2, counterZ - 0.14 + 0.18);
    counterGroup.add(waterStreamMesh);

    // Water surface shimmer / puddle in sink
    const puddleGeo = new THREE.CircleGeometry(0.12, 24);
    const puddleMat = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      roughness: 0.05,
      metalness: 0.1,
      transparent: true,
      opacity: 0.75,
    });
    const waterPuddleMesh = new THREE.Mesh(puddleGeo, puddleMat);
    waterPuddleMesh.rotation.x = -Math.PI / 2;
    waterPuddleMesh.position.set(sinkX - 0.27, counterH - bowlDepth + 0.02, counterZ - 0.14 + 0.18);
    counterGroup.add(waterPuddleMesh);

    // Splash particle droplets
    const splashCount = 50;
    const splashGeo = new THREE.BufferGeometry();
    const splashPos = new Float32Array(splashCount * 3);
    for (let i = 0; i < splashCount; i++) {
      splashPos[i * 3] = sinkX - 0.27 + (Math.random() - 0.5) * 0.10;
      splashPos[i * 3 + 1] = counterH - bowlDepth + 0.02 + Math.random() * 0.12;
      splashPos[i * 3 + 2] = counterZ - 0.14 + 0.18 + (Math.random() - 0.5) * 0.10;
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

    // 8. BLUE CLEANROOM ORGANIZER LOCKERS BATTERY (REPLACING WIRE SHELVES & CORNER COLLISION)
    // "2. as prateleiras de inox, remova elas e adicione no lugar outros armarios azuis organizadores."
    const lockersGroup = new THREE.Group();
    lockersGroup.name = 'Blue_Cleanroom_Cabinets';

    // Helper to create realistic modular cleanroom locker units with dust-proof slanted top
    const createLockerUnit = (doors: number, unitWidth: number, unitDepth: number, unitHeight: number) => {
      const uGroup = new THREE.Group();

      // Main Carcass
      const carcass = new THREE.Mesh(
        new THREE.BoxGeometry(unitWidth, unitHeight, unitDepth),
        lockerBodyMat
      );
      carcass.position.set(0, unitHeight / 2, 0);
      carcass.castShadow = true;
      carcass.receiveShadow = true;
      uGroup.add(carcass);

      // Cleanroom Slanted Dust-proof Top (45° angle per GMP cleanroom standard)
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

      // Plinth base (10cm dark kick-plate)
      const plinth = new THREE.Mesh(
        new THREE.BoxGeometry(unitWidth + 0.01, 0.1, unitDepth + 0.01),
        darkSteelMaterial
      );
      plinth.position.set(0, 0.05, 0);
      uGroup.add(plinth);

      // Modular Blue Doors
      const doorW = (unitWidth - 0.04) / doors;
      const doorH = unitHeight - 0.16;

      for (let d = 0; d < doors; d++) {
        const doorX = -unitWidth / 2 + 0.02 + (d + 0.5) * doorW;

        // Rich Blue Door Panel
        const door = new THREE.Mesh(
          new THREE.BoxGeometry(doorW - 0.015, doorH, 0.03),
          blueLockerDoorMat
        );
        door.position.set(doorX, 0.1 + doorH / 2, unitDepth / 2 + 0.015);
        door.castShadow = true;
        uGroup.add(door);

        // Silver flush handle
        const handle = new THREE.Mesh(
          new THREE.BoxGeometry(0.025, 0.16, 0.02),
          chromeFaucetMaterial
        );
        handle.position.set(doorX + doorW / 2 - 0.06, 0.1 + doorH * 0.55, unitDepth / 2 + 0.035);
        uGroup.add(handle);

        // Nameplate / Document Holder (white acrylic tag slot)
        const tag = new THREE.Mesh(
          new THREE.PlaneGeometry(0.12, 0.05),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        tag.position.set(doorX, 0.1 + doorH * 0.88, unitDepth / 2 + 0.032);
        uGroup.add(tag);

        // Ventilation Louvers (cleanroom air slots)
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

    // Bank A: 3-Door Blue Organizer Cabinet in the Right Back Corner (X = 2.9m, Z = -halfD + 0.28m)
    // Completely separated from marble counter with 0.7m clearance!
    const cornerLockers = createLockerUnit(3, 1.20, 0.52, 2.05);
    cornerLockers.position.set(2.85, 0, -halfD + 0.27);
    lockersGroup.add(cornerLockers);

    // Bank B: 5-Door Continuous Blue Organizer Cabinet along Right Wall (Replacing the wire shelves!)
    // Positioned along the right wall from Z = -0.5m to Z = 1.6m (facing left towards the room)
    const sideWallLockers = createLockerUnit(5, 2.15, 0.52, 2.05);
    sideWallLockers.rotation.y = -Math.PI / 2;
    sideWallLockers.position.set(halfW - 0.27, 0, 0.55);
    lockersGroup.add(sideWallLockers);

    root.add(lockersGroup);
    interactiveObjects['shelving_units'] = lockersGroup; // maintains interactive drawer binding

    // Electrical control panel on right wall beside window
    const elecPanel = new THREE.Group();
    const pBox = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.65, 0.55), brushedSteelMaterial);
    pBox.position.set(halfW - 0.06, 1.6, -1.5);
    const eStop = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 16), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    eStop.rotation.z = Math.PI / 2;
    eStop.position.set(halfW - 0.13, 1.6, -1.4);
    elecPanel.add(pBox, eStop);
    root.add(elecPanel);

    // 9. TECHNICAL DIMENSIONS
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

    // 10. WALL VISIBILITY / CUTAWAY PROGRAMMING
    const updateWallVisibility = (mode: WallVisibility) => {
      if (mode === 'all') {
        ceilingGroup.visible = true;
        frontWallGroup.visible = true;
        sideWallsGroup.visible = true;
        backWallGroup.visible = true;
      } else if (mode === 'cutaway') {
        ceilingGroup.visible = false;
        frontWallGroup.visible = false;
        sideWallsGroup.visible = true;
        backWallGroup.visible = true;
      } else if (mode === 'none') {
        ceilingGroup.visible = false;
        frontWallGroup.visible = false;
        sideWallsGroup.visible = false;
        backWallGroup.visible = false;
      }
    };
    updateWallVisibility(options.wallVisibility);

    // 11. MATERIAL UPDATER
    const updateMaterials = (opts: {
      marbleTone: MarbleTone;
      floorColor: FloorColor;
      steelFinish: SteelFinish;
      renderMode: RenderMode;
    }) => {
      marbleTex.dispose();
      steelTex.dispose();
      floorTex.dispose();

      marbleTex = TextureGenerator.createMarbleTexture(opts.marbleTone);
      steelTex = TextureGenerator.createBrushedSteelTexture(opts.steelFinish);
      floorTex = TextureGenerator.createFloorTexture(opts.floorColor);

      marbleMaterial.map = marbleTex;
      marbleMaterial.needsUpdate = true;

      floorMaterial.map = floorTex;
      floorMaterial.needsUpdate = true;

      brushedSteelMaterial.map = steelTex;
      brushedSteelMaterial.roughness = opts.steelFinish === 'mirror_polish' ? 0.08 : 0.28;
      brushedSteelMaterial.needsUpdate = true;

      const isWire = opts.renderMode === 'wireframe';
      const isClay = opts.renderMode === 'clay';

      [wallMaterial, floorMaterial, ceilingMaterial, marbleMaterial, brushedSteelMaterial, mirrorSteelMaterial, chromeFaucetMaterial, darkSteelMaterial, blueLockerDoorMat, lockerBodyMat].forEach((mat) => {
        mat.wireframe = isWire;
        if (isClay) {
          mat.color.setHex(0xe8ecef);
          mat.roughness = 0.9;
          mat.metalness = 0.0;
        } else {
          if (mat === wallMaterial) mat.color.setHex(0xf1f5f9);
          if (mat === brushedSteelMaterial) mat.color.setHex(0xcfd8e3);
          if (mat === mirrorSteelMaterial) mat.color.setHex(0xe2e8f0);
          if (mat === chromeFaucetMaterial) mat.color.setHex(0xf8fafc);
          if (mat === blueLockerDoorMat) mat.color.setHex(0x1d4ed8);
          if (mat === darkSteelMaterial) mat.color.setHex(0x1e293b);
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
      dimensionGroup,
      ceilingLights,
      setWaterActive,
      updateWallVisibility,
      updateMaterials,
    };
  }
}
