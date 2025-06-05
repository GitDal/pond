<script lang="ts">
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
  import { createPlane } from "../three/create-plane";

  let canvasContainer: HTMLDivElement;

  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let animationFrameId: number;
  let clock: THREE.Clock;

  // Meshes
  let bodyLine: THREE.Line;
  let headLine: THREE.Line;
  let leftFootLine: THREE.Line;
  let rightFootLine: THREE.Line;
  let tailLine: THREE.Line;

  // Geometries and Materials (to dispose later)
  let lineMaterial: THREE.LineBasicMaterial;
  let planeGeometry: THREE.PlaneGeometry;
  let planeMaterial: THREE.MeshBasicMaterial;

  onMount(() => {
    clock = new THREE.Clock();

    // 1. Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    // 2. Camera
    const aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    camera.position.set(0, 5, 7); // Adjusted camera to view the plane
    camera.lookAt(0, 0, 0);

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; // Enable shadows
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    canvasContainer.appendChild(renderer.domElement);

    // 5. Ground Plane
    const {
      mesh: plane,
      geometry: planeGeo,
      material: planeMat,
    } = createPlane();
    planeGeometry = planeGeo;
    planeMaterial = planeMat;
    scene.add(plane);

    const bodyVertices = new Float32Array([
      ...[0.0, 0.5, 0.0],
      ...[0.0, 0.5, 1.0],
    ]);
    const headVertices = new Float32Array([
      ...[0.0, 0.75, -0.25],
      ...[0.0, 0.75, 0.25],
    ]);
    const tailVertices = new Float32Array([
      ...[0.0, 0.4, 1.0],
      ...[0.0, 0.35, 1.25],
    ]);
    const leftFootVertices = new Float32Array([
      ...[-0.25, 0.0, 0.5],
      ...[-0.25, 0.0, 0.75],
    ]);
    const rightFootVertices = new Float32Array([
      ...[0.25, 0.0, 0.5],
      ...[0.25, 0.0, 0.75],
    ]);

    lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

    bodyLine = createLine(bodyVertices, lineMaterial);
    headLine = createLine(headVertices, lineMaterial);
    tailLine = createLine(tailVertices, lineMaterial);
    leftFootLine = createLine(leftFootVertices, lineMaterial);
    rightFootLine = createLine(rightFootVertices, lineMaterial);

    const duckGroup = new THREE.Group();

    duckGroup.add(bodyLine);
    duckGroup.add(headLine);
    duckGroup.add(tailLine);
    duckGroup.add(leftFootLine);
    duckGroup.add(rightFootLine);
    scene.add(duckGroup);

    // 7. Animation Loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // put animation logic here

      renderer.render(scene, camera);
    };
    animate();

    // Orbit control:
    new OrbitControls(camera, renderer.domElement);

    // 8. Handle window resize
    const handleResize = () => {
      if (camera && renderer) {
        const newAspectRatio = window.innerWidth / window.innerHeight;
        camera.aspect = newAspectRatio;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      console.log("Cleaning up Three.js scene...");
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);

      // Cleanup?
      // planeGeometry?.dispose();
      // planeMaterial?.dispose();
      // lineMaterial?.dispose();

      // Dispose of renderer and remove canvas
      if (renderer) {
        renderer.dispose();
        if (canvasContainer && renderer.domElement) {
          canvasContainer.removeChild(renderer.domElement);
        }
      }
    };
  });

  function createLine(
    vertices: Float32Array,
    material: THREE.Material,
  ): THREE.Line {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    return new THREE.Line(geometry, material);
  }
</script>

<div
  bind:this={canvasContainer}
  style="width: 100vw; height: 100vh; overflow: hidden;"
></div>

<style>
  div {
    margin: 0;
    padding: 0;
    display: block;
  }
</style>
