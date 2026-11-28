"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import {
  createIntelligencePanel,
  type IntelligencePanelInstance,
} from "./floating-intelligence-panels";

interface PhantomCoreCanvasProps {
  isScanning?: boolean;
  scanStageIndex?: number;
  className?: string;
  onClickCore?: () => void;
}

export function PhantomCoreCanvas({
  isScanning = false,
  scanStageIndex = 0,
  className,
  onClickCore,
}: PhantomCoreCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const isScanningRef = useRef(isScanning);
  const scanStageRef = useRef(scanStageIndex);

  // Keep refs in sync for the animation loop
  useEffect(() => {
    isScanningRef.current = isScanning;
    scanStageRef.current = scanStageIndex;
  }, [isScanning, scanStageIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement("canvas");
      const hasWebGL = Boolean(
        window.WebGLRenderingContext &&
          (testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl"))
      );
      if (!hasWebGL) return;
    } catch {
      return;
    }

    let animationFrameId: number;
    let isVisible = true;
    let isIntersecting = true;
    let isReducedMotion = false;
    if (typeof window !== "undefined") {
      isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    // Pause rendering loop completely when scrolled out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
      },
      { rootMargin: "60px" }
    );
    observer.observe(container);

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 750;
    const isMobile = width < 768 || (typeof window !== "undefined" && "ontouchstart" in window);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 12.0);

    // Renderer setup with capped pixel ratio (1.0 on mobile, max 1.5 on desktop)
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Root Core Group
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // -------------------------------------------------------------------------
    // 1. CENTRAL HOLOGRAPHIC SHIELD GEOMETRY
    // -------------------------------------------------------------------------
    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(0, 1.85);
    shieldShape.bezierCurveTo(0.9, 1.85, 1.45, 1.6, 1.55, 1.05);
    shieldShape.bezierCurveTo(1.65, 0.35, 1.25, -0.7, 0, -2.1);
    shieldShape.bezierCurveTo(-1.25, -0.7, -1.65, 0.35, -1.55, 1.05);
    shieldShape.bezierCurveTo(-1.45, 1.6, -0.9, 1.85, 0, 1.85);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.18,
      bevelEnabled: true,
      bevelSegments: 1,
      steps: 1,
      bevelSize: 0.06,
      bevelThickness: 0.08,
    };

    const shieldGeometry = new THREE.ExtrudeGeometry(shieldShape, extrudeSettings);
    shieldGeometry.center();

    // High-performance Standard PBR material with emissive rim glow (eliminates transmission multi-pass)
    const shieldMaterial = new THREE.MeshStandardMaterial({
      color: 0x0c2720,
      emissive: 0x19a97d,
      emissiveIntensity: 0.45,
      metalness: 0.8,
      roughness: 0.25,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });

    const shieldMesh = new THREE.Mesh(shieldGeometry, shieldMaterial);
    coreGroup.add(shieldMesh);

    // Subtle edge highlight wireframe on the shield
    const edgesGeometry = new THREE.EdgesGeometry(shieldGeometry, 24);
    const edgesMaterial = new THREE.LineBasicMaterial({
      color: 0xc4a5ff,
      transparent: true,
      opacity: 0.65,
    });
    const shieldEdges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    shieldMesh.add(shieldEdges);

    // Inner Crest Emblem
    const innerShape = new THREE.Shape();
    innerShape.moveTo(0, 1.3);
    innerShape.bezierCurveTo(0.65, 1.3, 1.05, 1.1, 1.12, 0.75);
    innerShape.bezierCurveTo(1.18, 0.25, 0.9, -0.45, 0, -1.45);
    innerShape.bezierCurveTo(-0.9, -0.45, -1.18, 0.25, -1.12, 0.75);
    innerShape.bezierCurveTo(-1.05, 1.1, -0.65, 1.3, 0, 1.3);

    const innerGeometry = new THREE.ShapeGeometry(innerShape);
    innerGeometry.center();
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
    });
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
    innerMesh.position.z = 0.22;
    shieldMesh.add(innerMesh);

    // -------------------------------------------------------------------------
    // 2. ORBITAL RING SYSTEM (3 Concentric Tilted Rings - Optimized Polycount)
    // -------------------------------------------------------------------------
    interface RingData {
      mesh: THREE.Mesh;
      rotSpeed: { x: number; y: number; z: number };
      initialRot: { x: number; y: number; z: number };
    }
    const rings: RingData[] = [];

    // Ring 1 (Inner Emerald Ring)
    const ring1Geo = new THREE.TorusGeometry(2.7, 0.02, 8, 64);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0x21c997,
      emissive: 0x21c997,
      emissiveIntensity: 0.7,
      metalness: 0.8,
      roughness: 0.2,
    });
    const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1Mesh.rotation.set(1.15, 0.35, 0.2);
    coreGroup.add(ring1Mesh);
    rings.push({
      mesh: ring1Mesh,
      rotSpeed: { x: 0.003, y: 0.005, z: 0.002 },
      initialRot: { x: 1.15, y: 0.35, z: 0.2 },
    });

    // Ring 2 (Middle Electric Violet Ring)
    const ring2Geo = new THREE.TorusGeometry(3.6, 0.025, 8, 72);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0xa855f7,
      emissiveIntensity: 0.75,
      metalness: 0.85,
      roughness: 0.2,
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.set(-0.75, 1.25, -0.4);
    coreGroup.add(ring2Mesh);
    rings.push({
      mesh: ring2Mesh,
      rotSpeed: { x: -0.004, y: 0.003, z: 0.005 },
      initialRot: { x: -0.75, y: 1.25, z: -0.4 },
    });

    // Ring 3 (Outer Lavender Ring)
    const ring3Geo = new THREE.TorusGeometry(4.45, 0.02, 8, 80);
    const ring3Mat = new THREE.MeshStandardMaterial({
      color: 0xc4a5ff,
      emissive: 0xc4a5ff,
      emissiveIntensity: 0.65,
      metalness: 0.9,
      roughness: 0.15,
    });
    const ring3Mesh = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3Mesh.rotation.set(0.85, -0.9, 0.5);
    coreGroup.add(ring3Mesh);
    rings.push({
      mesh: ring3Mesh,
      rotSpeed: { x: 0.002, y: -0.004, z: 0.003 },
      initialRot: { x: 0.85, y: -0.9, z: 0.5 },
    });

    // Segmented Horizon Ring
    const horizonGeo = new THREE.RingGeometry(4.85, 4.92, 36);
    const horizonMat = new THREE.MeshBasicMaterial({
      color: 0x21c997,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      wireframe: true,
    });
    const horizonMesh = new THREE.Mesh(horizonGeo, horizonMat);
    horizonMesh.rotation.x = Math.PI / 2.3;
    coreGroup.add(horizonMesh);

    // -------------------------------------------------------------------------
    // 3. FIVE ILLUMINATED SECURITY NODES (Submit, Extract, Investigate, Evaluate, Protect)
    // -------------------------------------------------------------------------
    const stageNodes: THREE.Mesh[] = [];
    const stageNodeAngles = [0, 1.25, 2.5, 3.75, 5.0];

    stageNodeAngles.forEach((angle, idx) => {
      const nodeGeo = new THREE.SphereGeometry(0.12, 8, 8);
      const isEmerald = idx % 2 === 0;
      const nodeMat = new THREE.MeshStandardMaterial({
        color: isEmerald ? 0x21c997 : 0xa855f7,
        emissive: isEmerald ? 0x21c997 : 0xa855f7,
        emissiveIntensity: 1.2,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);

      const radius = 3.6;
      nodeMesh.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.45,
        Math.sin(angle) * radius * 0.8
      );
      ring2Mesh.add(nodeMesh);
      stageNodes.push(nodeMesh);
    });

    // -------------------------------------------------------------------------
    // 4. DIGITAL NETWORK WIREFRAME SPHERE (Optimized Single Sub-division)
    // -------------------------------------------------------------------------
    const icosaGeo = new THREE.IcosahedronGeometry(5.6, 1);
    const icosaMat = new THREE.MeshBasicMaterial({
      color: 0x173d30,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
    });
    const icosaMesh = new THREE.Mesh(icosaGeo, icosaMat);
    coreGroup.add(icosaMesh);

    const pointsMat = new THREE.PointsMaterial({
      color: 0xc4a5ff,
      size: 0.07,
      transparent: true,
      opacity: 0.55,
    });
    const networkPoints = new THREE.Points(icosaGeo, pointsMat);
    icosaMesh.add(networkPoints);

    // -------------------------------------------------------------------------
    // 5. FLOATING CYBER PARTICLES (Calibrated Count for 60 FPS)
    // -------------------------------------------------------------------------
    const particleCount = isMobile ? 24 : 50;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const emeraldColor = new THREE.Color(0x21c997);
    const violetColor = new THREE.Color(0xa855f7);
    const lavenderColor = new THREE.Color(0xc4a5ff);

    for (let i = 0; i < particleCount; i++) {
      const r = 3.5 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = r * Math.cos(phi);

      const chosenColor =
        i % 3 === 0 ? emeraldColor : i % 3 === 1 ? violetColor : lavenderColor;
      particleColors[i * 3] = chosenColor.r;
      particleColors[i * 3 + 1] = chosenColor.g;
      particleColors[i * 3 + 2] = chosenColor.b;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.065,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
    });
    const particleField = new THREE.Points(particleGeo, particleMat);
    coreGroup.add(particleField);

    // -------------------------------------------------------------------------
    // 6. HOLOGRAPHIC SCANNING BEAM & RIPPLE
    // -------------------------------------------------------------------------
    const scanBeamGeo = new THREE.PlaneGeometry(3.2, 0.08);
    const scanBeamMat = new THREE.MeshBasicMaterial({
      color: 0x21c997,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
    });
    const scanBeam = new THREE.Mesh(scanBeamGeo, scanBeamMat);
    scanBeam.position.set(0, 0, 0.28);
    shieldMesh.add(scanBeam);

    const rippleGeo = new THREE.RingGeometry(0.1, 0.16, 32);
    const rippleMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const rippleMesh = new THREE.Mesh(rippleGeo, rippleMat);
    rippleMesh.position.z = 0.3;
    shieldMesh.add(rippleMesh);

    // -------------------------------------------------------------------------
    // 7. CINEMATIC LIGHTING
    // -------------------------------------------------------------------------
    const ambientLight = new THREE.AmbientLight(0x071c18, 2.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x21c997, 3.2);
    dirLight1.position.set(-6, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 2.8);
    dirLight2.position.set(6, -4, 4);
    scene.add(dirLight2);

    const corePointLight = new THREE.PointLight(0xc4a5ff, 2.5, 10);
    corePointLight.position.set(0, 0, 1.2);
    scene.add(corePointLight);

    // -------------------------------------------------------------------------
    // 8. THREE FLOATING 3D SECURITY INTELLIGENCE PANELS
    // -------------------------------------------------------------------------
    const centerPos = new THREE.Vector3(0, 0, 0);
    const panels: IntelligencePanelInstance[] = [];

    // Panel 1: THREAT INTELLIGENCE (Upper Left)
    const panel1 = createIntelligencePanel(
      "threat-intelligence",
      new THREE.Vector3(-5.3, 1.85, -0.6),
      new THREE.Euler(-0.06, 0.28, 0.04),
      centerPos,
      "/analyze"
    );
    scene.add(panel1.group);
    scene.add(panel1.connectionLine);
    scene.add(panel1.connectionPoints);
    panels.push(panel1);

    // Panel 2: URL ANALYSIS (Upper Right)
    const panel2 = createIntelligencePanel(
      "url-analysis",
      new THREE.Vector3(5.3, 1.75, -0.7),
      new THREE.Euler(-0.05, -0.28, -0.03),
      centerPos,
      "/website-checker"
    );
    scene.add(panel2.group);
    scene.add(panel2.connectionLine);
    scene.add(panel2.connectionPoints);
    panels.push(panel2);

    // Panel 3: ZERO-TRUST PROTECTION (Lower Right flank)
    const panel3 = createIntelligencePanel(
      "zero-trust",
      new THREE.Vector3(4.6, -2.35, -0.4),
      new THREE.Euler(0.12, -0.18, 0.05),
      centerPos,
      "/how-it-works"
    );
    scene.add(panel3.group);
    scene.add(panel3.connectionLine);
    scene.add(panel3.connectionPoints);
    panels.push(panel3);

    // Responsive panel placement based on screen width
    const applyResponsiveLayout = (w: number) => {
      if (w < 820) {
        // Mobile / Small Tablet: scale down & tuck gracefully
        panel1.group.scale.set(0.62, 0.62, 0.62);
        panel2.group.scale.set(0.62, 0.62, 0.62);
        panel3.group.scale.set(0.62, 0.62, 0.62);
        panel1.targetPos.set(-3.2, 2.5, -0.6);
        panel2.targetPos.set(3.2, 2.4, -0.7);
        panel3.targetPos.set(2.8, -2.8, -0.4);
        camera.position.z = 13.5;
      } else if (w < 1240) {
        // Tablet / Mid Desktop
        panel1.group.scale.set(0.78, 0.78, 0.78);
        panel2.group.scale.set(0.78, 0.78, 0.78);
        panel3.group.scale.set(0.78, 0.78, 0.78);
        panel1.targetPos.set(-4.2, 1.9, -0.6);
        panel2.targetPos.set(4.2, 1.8, -0.7);
        panel3.targetPos.set(3.8, -2.3, -0.4);
        camera.position.z = 12.5;
      } else {
        // Desktop
        panel1.group.scale.set(1.0, 1.0, 1.0);
        panel2.group.scale.set(1.0, 1.0, 1.0);
        panel3.group.scale.set(1.0, 1.0, 1.0);
        panel1.targetPos.set(-5.3, 1.85, -0.6);
        panel2.targetPos.set(5.3, 1.75, -0.7);
        panel3.targetPos.set(4.6, -2.35, -0.4);
        camera.position.z = 12.0;
      }
    };

    applyResponsiveLayout(width);

    // -------------------------------------------------------------------------
    // 9. MOUSE TRACKING & INTERACTIVE RAYCASTING (Throttled & Event-Driven)
    // -------------------------------------------------------------------------
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;
    let mouseMoved = false;
    const raycaster = new THREE.Raycaster();
    const mouseNorm = new THREE.Vector2(-999, -999);

    const handleMouseMove = (e: MouseEvent) => {
      mouseMoved = true;
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      targetMouseX = (e.clientX - halfW) / halfW;
      targetMouseY = (e.clientY - halfH) / halfH;

      const rect = renderer.domElement.getBoundingClientRect();
      mouseNorm.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNorm.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    let rippleProgress = 1;
    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const clickMouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(clickMouse, camera);

      const panelMeshes = panels.map((p) => p.panelMesh);
      const intersects = raycaster.intersectObjects(panelMeshes, false);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        const matched = panels.find((p) => p.panelMesh === hitMesh);
        if (matched) {
          rippleProgress = 0;
          router.push(matched.route);
          return;
        }
      }

      rippleProgress = 0;
      if (onClickCore) onClickCore();
    };

    window.addEventListener("click", handleClick);

    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || 750;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      applyResponsiveLayout(w);
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // -------------------------------------------------------------------------
    // 10. ANIMATION LOOP
    // -------------------------------------------------------------------------
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible || !isIntersecting) return;

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth mouse interpolation (skip heavy parallax if reduced motion)
      if (!isReducedMotion) {
        currentMouseX += (targetMouseX - currentMouseX) * 0.05;
        currentMouseY += (targetMouseY - currentMouseY) * 0.05;

        // Core parallax tilt
        coreGroup.rotation.y = currentMouseX * 0.22;
        coreGroup.rotation.x = -currentMouseY * 0.14;
      }

      // Central shield floating motion & breathing
      const isScanActive = isScanningRef.current;
      const floatSpeed = isScanActive ? 2.6 : 1.2;
      const floatAmp = isScanActive ? 0.14 : 0.07;
      if (!isReducedMotion) {
        shieldMesh.position.y = Math.sin(elapsed * floatSpeed) * floatAmp;
        shieldMesh.rotation.y = Math.sin(elapsed * 0.8) * 0.05;
      }

      // Shield material glow response
      if (isScanActive) {
        shieldMaterial.emissiveIntensity = 0.7 + Math.sin(elapsed * 6) * 0.25;
        corePointLight.intensity = 3.6 + Math.sin(elapsed * 6) * 1.2;
      } else {
        shieldMaterial.emissiveIntensity = 0.45;
        corePointLight.intensity = 2.4;
      }

      // Orbital rings rotation (halted if user prefers reduced motion)
      if (!isReducedMotion) {
        rings.forEach((r) => {
          const speedMultiplier = isScanActive ? 1.8 : 1.0;
          r.mesh.rotation.x += r.rotSpeed.x * speedMultiplier;
          r.mesh.rotation.y += r.rotSpeed.y * speedMultiplier;
          r.mesh.rotation.z += r.rotSpeed.z * speedMultiplier;
        });

        horizonMesh.rotation.z += 0.0012;
        icosaMesh.rotation.y += 0.0018;
        icosaMesh.rotation.x += 0.001;
        particleField.rotation.y = elapsed * 0.015;
      }

      // Scanning beam sweeping across shield
      const scanCycle = (elapsed * (isScanActive ? 1.6 : 0.7)) % 2.4;
      const scanY = 1.6 - (scanCycle / 2.4) * 3.2;
      scanBeam.position.y = scanY;
      scanBeamMat.opacity = isScanActive ? 0.9 : 0.55;

      // Click ripple wave
      if (rippleProgress < 1) {
        rippleProgress += delta * 1.6;
        const scale = 1 + rippleProgress * 28;
        rippleMesh.scale.set(scale, scale, scale);
        rippleMat.opacity = (1 - rippleProgress) * 0.85;
      } else {
        rippleMat.opacity = 0;
      }

      // Stage nodes pulse synchronization
      const activeStage = scanStageRef.current;
      stageNodes.forEach((node, idx) => {
        if (isScanActive && idx === activeStage) {
          const pulse = 1 + Math.sin(elapsed * 8) * 0.4;
          node.scale.set(pulse * 1.4, pulse * 1.4, pulse * 1.4);
          (node.material as THREE.MeshStandardMaterial).emissiveIntensity = 2.4;
        } else if (isScanActive && idx < activeStage) {
          node.scale.set(1.15, 1.15, 1.15);
          (node.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.6;
        } else {
          node.scale.set(1.0, 1.0, 1.0);
          (node.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.85;
        }
      });

      // Raycast test for panel hover (Only executed when mouse position actually changes!)
      if (mouseMoved) {
        mouseMoved = false;
        raycaster.setFromCamera(mouseNorm, camera);
        const panelMeshes = panels.map((p) => p.panelMesh);
        const intersects = raycaster.intersectObjects(panelMeshes, false);
        const hoveredMesh = intersects.length > 0 ? intersects[0].object : null;
        panels.forEach((panel) => {
          panel.isHovered = panel.panelMesh === hoveredMesh;
        });
      }

      // Update all 3 floating intelligence panels
      panels.forEach((panel) => {
        panel.update(elapsed, delta, isScanActive);
      });

      renderer.render(scene, camera);
    };

    animate();

    // -------------------------------------------------------------------------
    // CLEANUP & RESOURCE DISPOSAL
    // -------------------------------------------------------------------------
    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      panels.forEach((p) => p.dispose());

      shieldGeometry.dispose();
      shieldMaterial.dispose();
      edgesGeometry.dispose();
      edgesMaterial.dispose();
      innerGeometry.dispose();
      innerMaterial.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      horizonGeo.dispose();
      horizonMat.dispose();
      icosaGeo.dispose();
      icosaMat.dispose();
      pointsMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      scanBeamGeo.dispose();
      scanBeamMat.dispose();
      rippleGeo.dispose();
      rippleMat.dispose();

      stageNodes.forEach((node) => {
        node.geometry.dispose();
        (node.material as THREE.Material).dispose();
      });

      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, [onClickCore, router]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
