import * as THREE from "three";

export interface IntelligencePanelInstance {
  group: THREE.Group;
  panelMesh: THREE.Mesh;
  edgesMesh: THREE.LineSegments;
  iconGroup: THREE.Group;
  connectionLine: THREE.Line;
  connectionPoints: THREE.Points;
  curve: THREE.QuadraticBezierCurve3;
  targetPos: THREE.Vector3;
  initialRot: THREE.Euler;
  floatOffset: number;
  floatSpeed: number;
  id: "threat-intelligence" | "url-analysis" | "zero-trust";
  route: string;
  isHovered: boolean;
  update: (elapsed: number, delta: number, isScanning: boolean) => void;
  dispose: () => void;
}

// Helper to create a crisp canvas texture for panel text & HUD markings
function createPanelCanvasTexture(
  panelId: "threat-intelligence" | "url-analysis" | "zero-trust"
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  // Clear with transparent background
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Subtle dark smoked panel background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGrad.addColorStop(0, "rgba(7, 28, 24, 0.82)");
  bgGrad.addColorStop(1, "rgba(16, 43, 36, 0.90)");
  ctx.fillStyle = bgGrad;

  // Draw rounded card background with subtle inner shadow
  const r = 36;
  ctx.beginPath();
  ctx.roundRect(16, 16, canvas.width - 32, canvas.height - 32, r);
  ctx.fill();

  // Subtle interior grid lines
  ctx.strokeStyle = "rgba(240, 229, 208, 0.05)";
  ctx.lineWidth = 1;
  for (let x = 60; x < canvas.width - 60; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 40);
    ctx.lineTo(x, canvas.height - 40);
    ctx.stroke();
  }
  for (let y = 60; y < canvas.height - 60; y += 60) {
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(canvas.width - 40, y);
    ctx.stroke();
  }

  // Content configuration by panel
  let statusText = "INTELLIGENCE ENGINE";
  let statusColor = "#21C997";
  let titleText = "THREAT INTELLIGENCE";
  let subtitleText = "Real-time threat intelligence monitoring";
  let techTag = "SYS::THREAT_DETECTOR_V4 // ZERO-TRUST";

  if (panelId === "url-analysis") {
    statusText = "URL INSPECTION";
    statusColor = "#A855F7";
    titleText = "URL ANALYSIS";
    subtitleText = "Deep URL and domain security inspection";
    techTag = "DOM::SSRF_AIRGAP_GUARD // PUNYCODE_SAFE";
  } else if (panelId === "zero-trust") {
    statusText = "ZERO-TRUST ARCHITECTURE";
    statusColor = "#21C997";
    titleText = "ZERO-TRUST PROTECTION";
    subtitleText = "Verify every connection. Trust nothing.";
    techTag = "AUTH::ZERO_TRUST_ENGINE // 5_STAGES";
  }

  // Top Status Badge (Pill)
  const badgeX = 52;
  const badgeY = 56;
  ctx.fillStyle = "rgba(7, 28, 24, 0.85)";
  ctx.strokeStyle = statusColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, 320, 48, 24);
  ctx.fill();
  ctx.stroke();

  // Status Indicator Glow Dot
  ctx.fillStyle = statusColor;
  ctx.beginPath();
  ctx.arc(badgeX + 26, badgeY + 24, 6, 0, Math.PI * 2);
  ctx.fill();

  // Status Text
  ctx.font = "bold 18px 'JetBrains Mono Variable', 'JetBrains Mono', monospace";
  ctx.fillStyle = statusColor;
  ctx.fillText(statusText, badgeX + 44, badgeY + 31);

  // Technical Header Tag (Right aligned)
  ctx.font = "14px 'JetBrains Mono Variable', 'JetBrains Mono', monospace";
  ctx.fillStyle = "rgba(184, 198, 187, 0.65)";
  ctx.textAlign = "right";
  ctx.fillText(techTag, canvas.width - 56, badgeY + 30);
  ctx.textAlign = "left";

  // Panel Title (Uppercase, bold, ivory)
  ctx.font = "bold 44px 'Space Grotesk Variable', 'Space Grotesk', sans-serif";
  ctx.fillStyle = "#F2E9D8";
  ctx.fillText(titleText, 52, 290);

  // Panel Subtitle (Refined ivory/muted text)
  ctx.font = "500 24px 'Inter Variable', 'Inter', sans-serif";
  ctx.fillStyle = "rgba(184, 198, 187, 0.88)";
  ctx.fillText(subtitleText, 52, 336);

  // Fine technical divider line
  ctx.strokeStyle = "rgba(240, 229, 208, 0.12)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(52, 376);
  ctx.lineTo(canvas.width - 52, 376);
  ctx.stroke();

  // Bottom Interactive Link Pill
  ctx.font = "bold 16px 'JetBrains Mono Variable', 'JetBrains Mono', monospace";
  ctx.fillStyle = statusColor;
  ctx.fillText("TAP TO INSPECT MODULE →", 52, 424);

  // Subtle corner technical marks
  ctx.strokeStyle = statusColor;
  ctx.lineWidth = 3;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(24, 48);
  ctx.lineTo(24, 24);
  ctx.lineTo(48, 24);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(canvas.width - 48, canvas.height - 24);
  ctx.lineTo(canvas.width - 24, canvas.height - 24);
  ctx.lineTo(canvas.width - 24, canvas.height - 48);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

// -----------------------------------------------------------------------------
// CUSTOM 3D ICONS BUILDERS
// -----------------------------------------------------------------------------

// 1. THREAT INTELLIGENCE ICON: 3D Holographic Radar + Shield + Detection Nodes
function createThreatIntelligenceIcon(): THREE.Group {
  const iconGroup = new THREE.Group();

  // Radar circular rings
  const radarRingGeo1 = new THREE.RingGeometry(0.55, 0.58, 24);
  const radarRingMat = new THREE.MeshBasicMaterial({
    color: 0x21c997,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.65,
  });
  const ring1 = new THREE.Mesh(radarRingGeo1, radarRingMat);
  iconGroup.add(ring1);

  const radarRingGeo2 = new THREE.RingGeometry(0.35, 0.38, 20);
  const ring2 = new THREE.Mesh(radarRingGeo2, radarRingMat);
  iconGroup.add(ring2);

  // Crosshairs
  const crossGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-0.6, 0, 0),
    new THREE.Vector3(0.6, 0, 0),
    new THREE.Vector3(0, -0.6, 0),
    new THREE.Vector3(0, 0.6, 0),
  ]);
  const crossMat = new THREE.LineBasicMaterial({
    color: 0x21c997,
    transparent: true,
    opacity: 0.35,
  });
  const crossLines = new THREE.LineSegments(crossGeo, crossMat);
  iconGroup.add(crossLines);

  // Rotating Radar Sweep Line
  const sweepGeo = new THREE.PlaneGeometry(0.55, 0.04);
  sweepGeo.translate(0.275, 0, 0); // pivot at center
  const sweepMat = new THREE.MeshBasicMaterial({
    color: 0x21c997,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
  });
  const sweepMesh = new THREE.Mesh(sweepGeo, sweepMat);
  iconGroup.add(sweepMesh);

  // Mini Central Shield Symbol
  const shieldShape = new THREE.Shape();
  shieldShape.moveTo(0, 0.22);
  shieldShape.bezierCurveTo(0.12, 0.22, 0.2, 0.18, 0.22, 0.1);
  shieldShape.bezierCurveTo(0.23, 0.02, 0.16, -0.12, 0, -0.26);
  shieldShape.bezierCurveTo(-0.16, -0.12, -0.23, 0.02, -0.22, 0.1);
  shieldShape.bezierCurveTo(-0.2, 0.18, -0.12, 0.22, 0, 0.22);

  const miniShieldGeo = new THREE.ShapeGeometry(shieldShape);
  const miniShieldMat = new THREE.MeshBasicMaterial({
    color: 0xa855f7,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
  });
  const miniShield = new THREE.Mesh(miniShieldGeo, miniShieldMat);
  miniShield.position.z = 0.05;
  iconGroup.add(miniShield);

  // Threat Detection Nodes (Small glowing spheres)
  const nodeGeo = new THREE.SphereGeometry(0.04, 12, 12);
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0x21c997 });
  const nodePositions = [
    new THREE.Vector3(0.28, 0.22, 0.04),
    new THREE.Vector3(-0.32, 0.14, 0.04),
    new THREE.Vector3(0.18, -0.32, 0.04),
  ];

  nodePositions.forEach((pos) => {
    const node = new THREE.Mesh(nodeGeo, nodeMat);
    node.position.copy(pos);
    iconGroup.add(node);
  });

  iconGroup.userData = { sweepMesh };
  return iconGroup;
}

// 2. URL ANALYSIS ICON: 3D Magnifying Glass + Wireframe Globe + Scanning Arc
function createUrlAnalysisIcon(): THREE.Group {
  const iconGroup = new THREE.Group();

  // Floating Holographic Wireframe Globe
  const globeGeo = new THREE.SphereGeometry(0.38, 10, 8);
  const globeMat = new THREE.MeshBasicMaterial({
    color: 0xa855f7,
    wireframe: true,
    transparent: true,
    opacity: 0.55,
  });
  const globeMesh = new THREE.Mesh(globeGeo, globeMat);
  iconGroup.add(globeMesh);

  // Magnifying Rim Ring
  const magRimGeo = new THREE.TorusGeometry(0.48, 0.03, 8, 24);
  const magRimMat = new THREE.MeshStandardMaterial({
    color: 0xc4a5ff,
    emissive: 0xa855f7,
    emissiveIntensity: 0.6,
    metalness: 0.9,
    roughness: 0.15,
  });
  const magRim = new THREE.Mesh(magRimGeo, magRimMat);
  magRim.position.z = 0.08;
  iconGroup.add(magRim);

  // Magnifying Handle
  const handleGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.35, 8);
  const handleMesh = new THREE.Mesh(handleGeo, magRimMat);
  handleMesh.position.set(0.42, -0.42, 0.08);
  handleMesh.rotation.z = -Math.PI / 4;
  iconGroup.add(handleMesh);

  // Scanning Arc Beam across globe
  const arcGeo = new THREE.RingGeometry(0.39, 0.42, 24, 1, 0, Math.PI * 0.7);
  const arcMat = new THREE.MeshBasicMaterial({
    color: 0x21c997,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8,
  });
  const scanningArc = new THREE.Mesh(arcGeo, arcMat);
  scanningArc.position.z = 0.12;
  iconGroup.add(scanningArc);

  iconGroup.userData = { globeMesh, scanningArc };
  return iconGroup;
}

// 3. ZERO-TRUST PROTECTION ICON: Metallic Shield + Fingerprint Biometric Pattern
function createZeroTrustIcon(): THREE.Group {
  const iconGroup = new THREE.Group();

  // Outer Shield Crest
  const shieldShape = new THREE.Shape();
  shieldShape.moveTo(0, 0.45);
  shieldShape.bezierCurveTo(0.24, 0.45, 0.42, 0.36, 0.46, 0.22);
  shieldShape.bezierCurveTo(0.48, 0.08, 0.34, -0.22, 0, -0.52);
  shieldShape.bezierCurveTo(-0.34, -0.22, -0.48, 0.08, -0.46, 0.22);
  shieldShape.bezierCurveTo(-0.42, 0.36, -0.24, 0.45, 0, 0.45);

  const shieldGeo = new THREE.ShapeGeometry(shieldShape);
  const shieldMat = new THREE.MeshStandardMaterial({
    color: 0x123b30,
    emissive: 0x21c997,
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
  });
  const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
  iconGroup.add(shieldMesh);

  // Protective Outer Ring
  const ringGeo = new THREE.RingGeometry(0.56, 0.59, 24);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xf2e9d8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  iconGroup.add(ringMesh);

  // Fingerprint Arcs (Biometric Authentication Pattern)
  const fpMat = new THREE.LineBasicMaterial({
    color: 0x21c997,
    transparent: true,
    opacity: 0.85,
    linewidth: 1.5,
  });

  const fpGroup = new THREE.Group();
  [0.1, 0.18, 0.26, 0.34].forEach((radius, i) => {
    const arcPoints = [];
    const startAngle = -Math.PI * 0.7 + i * 0.1;
    const endAngle = Math.PI * 0.7 - i * 0.1;
    for (let a = startAngle; a <= endAngle; a += 0.2) {
      arcPoints.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius * 1.25, 0.06));
    }
    const fpGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);
    const fpLine = new THREE.Line(fpGeo, fpMat);
    fpGroup.add(fpLine);
  });
  iconGroup.add(fpGroup);

  iconGroup.userData = { fpGroup, ringMesh };
  return iconGroup;
}

// -----------------------------------------------------------------------------
// PANEL FACTORY FUNCTION
// -----------------------------------------------------------------------------
export function createIntelligencePanel(
  panelId: "threat-intelligence" | "url-analysis" | "zero-trust",
  targetPos: THREE.Vector3,
  initialRot: THREE.Euler,
  corePos: THREE.Vector3,
  route: string
): IntelligencePanelInstance {
  const group = new THREE.Group();
  group.position.copy(targetPos);
  group.rotation.copy(initialRot);

  // 1. BEVELED SMOKED-GLASS SLAB (Genuine 3D Geometry)
  const panelW = 2.65;
  const panelH = 1.45;
  const panelShape = new THREE.Shape();
  const radius = 0.14;
  panelShape.moveTo(-panelW / 2 + radius, -panelH / 2);
  panelShape.lineTo(panelW / 2 - radius, -panelH / 2);
  panelShape.quadraticCurveTo(panelW / 2, -panelH / 2, panelW / 2, -panelH / 2 + radius);
  panelShape.lineTo(panelW / 2, panelH / 2 - radius);
  panelShape.quadraticCurveTo(panelW / 2, panelH / 2, panelW / 2 - radius, panelH / 2);
  panelShape.lineTo(-panelW / 2 + radius, panelH / 2);
  panelShape.quadraticCurveTo(-panelW / 2, panelH / 2, -panelW / 2, panelH / 2 - radius);
  panelShape.lineTo(-panelW / 2, -panelH / 2 + radius);
  panelShape.quadraticCurveTo(-panelW / 2, -panelH / 2, -panelW / 2 + radius, -panelH / 2);

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.05,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: 0.025,
    bevelThickness: 0.025,
  };
  const panelGeometry = new THREE.ExtrudeGeometry(panelShape, extrudeSettings);
  panelGeometry.center();

  // Optimized Smoked Holographic Glass Material (Standard PBR with zero multi-pass transmission overhead)
  const panelMaterial = new THREE.MeshStandardMaterial({
    color: 0x071c18,
    emissive: panelId === "url-analysis" ? 0x1f0b38 : 0x07221b,
    emissiveIntensity: 0.45,
    metalness: 0.8,
    roughness: 0.3,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide,
  });

  const panelMesh = new THREE.Mesh(panelGeometry, panelMaterial);
  group.add(panelMesh);

  // Beveled Metallic Edge Highlight Frame
  const edgeGeo = new THREE.EdgesGeometry(panelGeometry, 22);
  const edgeColor =
    panelId === "url-analysis" ? 0xa855f7 : panelId === "zero-trust" ? 0xf2e9d8 : 0x21c997;
  const edgeMat = new THREE.LineBasicMaterial({
    color: edgeColor,
    transparent: true,
    opacity: 0.75,
  });
  const edgesMesh = new THREE.LineSegments(edgeGeo, edgeMat);
  panelMesh.add(edgesMesh);

  // 2. TEXT & HUD PLANE TEXTURE
  const textTexture = createPanelCanvasTexture(panelId);
  const textGeo = new THREE.PlaneGeometry(panelW - 0.08, panelH - 0.08);
  const textMat = new THREE.MeshBasicMaterial({
    map: textTexture,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
  });
  const textMesh = new THREE.Mesh(textGeo, textMat);
  textMesh.position.z = 0.04;
  panelMesh.add(textMesh);

  // 3. EMBEDDED 3D CUSTOM ICON
  let iconGroup: THREE.Group;
  if (panelId === "threat-intelligence") {
    iconGroup = createThreatIntelligenceIcon();
  } else if (panelId === "url-analysis") {
    iconGroup = createUrlAnalysisIcon();
  } else {
    iconGroup = createZeroTrustIcon();
  }

  // Position icon on top-right of panel
  iconGroup.position.set(0.78, 0.18, 0.08);
  iconGroup.scale.set(0.85, 0.85, 0.85);
  panelMesh.add(iconGroup);

  // 4. HOLOGRAPHIC COMMUNICATION SPLINE TRAIL TO CENTRAL PHANTOM CORE
  // Arc from panel inner edge toward core
  const startPt = targetPos.clone().add(new THREE.Vector3(targetPos.x > 0 ? -0.8 : 0.8, 0, 0));
  const midPt = new THREE.Vector3(
    (startPt.x + corePos.x) / 2,
    (startPt.y + corePos.y) / 2 + (targetPos.y > 0 ? 0.6 : -0.6),
    (startPt.z + corePos.z) / 2 + 0.4
  );
  const endPt = corePos.clone();

  const curve = new THREE.QuadraticBezierCurve3(startPt, midPt, endPt);
  const curvePoints = curve.getPoints(20);
  const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
  const curveMat = new THREE.LineBasicMaterial({
    color: edgeColor,
    transparent: true,
    opacity: 0.35,
  });
  const connectionLine = new THREE.Line(curveGeo, curveMat);

  // Traveling Data Pulse Particles along the Spline
  const dataParticleGeo = new THREE.BufferGeometry().setFromPoints([
    curvePoints[0],
    curvePoints[7] || curvePoints[0],
    curvePoints[14] || curvePoints[0],
  ]);
  const dataParticleMat = new THREE.PointsMaterial({
    color: edgeColor,
    size: 0.08,
    transparent: true,
    opacity: 0.85,
  });
  const connectionPoints = new THREE.Points(dataParticleGeo, dataParticleMat);

  const instance: IntelligencePanelInstance = {
    group,
    panelMesh,
    edgesMesh,
    iconGroup,
    connectionLine,
    connectionPoints,
    curve,
    targetPos,
    initialRot,
    floatOffset: Math.random() * Math.PI * 2,
    floatSpeed: 0.9 + Math.random() * 0.3,
    id: panelId,
    route,
    isHovered: false,

    update(elapsed: number, delta: number, isScanning: boolean) {
      // Independent gentle floating motion
      const floatY = Math.sin(elapsed * this.floatSpeed + this.floatOffset) * 0.06;
      const swayRotZ = Math.sin(elapsed * 0.6 + this.floatOffset) * 0.012;

      this.group.position.y = this.targetPos.y + floatY;
      this.group.rotation.z = this.initialRot.z + swayRotZ;

      // Icon specific animations
      if (this.id === "threat-intelligence" && this.iconGroup.userData.sweepMesh) {
        this.iconGroup.userData.sweepMesh.rotation.z -= delta * (isScanning ? 3.5 : 1.8);
      } else if (this.id === "url-analysis" && this.iconGroup.userData.globeMesh) {
        this.iconGroup.userData.globeMesh.rotation.y += delta * 0.6;
        if (this.iconGroup.userData.scanningArc) {
          this.iconGroup.userData.scanningArc.rotation.z += delta * (isScanning ? 3.0 : 1.4);
        }
      } else if (this.id === "zero-trust" && this.iconGroup.userData.ringMesh) {
        this.iconGroup.userData.ringMesh.rotation.z -= delta * 0.4;
        if (this.iconGroup.userData.fpGroup) {
          const pulse = 0.8 + Math.sin(elapsed * (isScanning ? 5 : 2)) * 0.2;
          this.iconGroup.userData.fpGroup.scale.set(pulse, pulse, 1);
        }
      }

      // Hover response: enhance brightness and edge glow
      if (this.isHovered) {
        panelMaterial.emissiveIntensity = THREE.MathUtils.lerp(
          panelMaterial.emissiveIntensity,
          0.85,
          0.1
        );
        edgeMat.opacity = THREE.MathUtils.lerp(edgeMat.opacity, 1.0, 0.1);
        curveMat.opacity = THREE.MathUtils.lerp(curveMat.opacity, 0.7, 0.1);
      } else {
        panelMaterial.emissiveIntensity = THREE.MathUtils.lerp(
          panelMaterial.emissiveIntensity,
          isScanning ? 0.6 : 0.4,
          0.05
        );
        edgeMat.opacity = THREE.MathUtils.lerp(edgeMat.opacity, isScanning ? 0.85 : 0.7, 0.05);
        curveMat.opacity = THREE.MathUtils.lerp(curveMat.opacity, isScanning ? 0.5 : 0.35, 0.05);
      }

      // Animate data packet along pre-sampled curve points (zero allocations)
      const t1 = (elapsed * (isScanning ? 0.5 : 0.22) + this.floatOffset) % 1;
      const idx = Math.min(Math.floor(t1 * curvePoints.length), curvePoints.length - 1);
      const pt1 = curvePoints[idx];
      const posAttr = connectionPoints.geometry.attributes.position;
      if (posAttr && pt1) {
        posAttr.setXYZ(0, pt1.x, pt1.y, pt1.z);
        posAttr.needsUpdate = true;
      }
    },

    dispose() {
      panelGeometry.dispose();
      panelMaterial.dispose();
      edgeGeo.dispose();
      edgeMat.dispose();
      textGeo.dispose();
      textMat.dispose();
      textTexture.dispose();
      curveGeo.dispose();
      curveMat.dispose();
      dataParticleGeo.dispose();
      dataParticleMat.dispose();
    },
  };

  return instance;
}
