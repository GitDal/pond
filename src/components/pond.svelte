<script lang="ts">
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
  import { createPlane } from "../three/create-plane";
  import Keyboard from "./keyboard.svelte";

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
  let duckGroup: THREE.Group;

  // Geometries and Materials (to dispose later)
  let lineMaterial: THREE.LineBasicMaterial;
  let plane: THREE.Mesh;
  let cube: THREE.Mesh;

  let upKeyDown = false;
  let leftKeyDown = false;
  let downKeyDown = false;
  let rightKeyDown = false;

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

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
    plane = createPlane();
    plane.name = "groundPlane";
    scene.add(plane);

    const fullLenght = new Float32Array([
      ...[0.0, 0.0, -0.5],
      ...[0.0, 0.0, 0.5],
    ]);

    const halfLength = new Float32Array([
      ...[0.0, 0.0, -0.25],
      ...[0.0, 0.0, 0.25],
    ]);

    const quarterLength = new Float32Array([
      ...[0.0, 0.0, -0.125],
      ...[0.0, 0.0, 0.125],
    ]);

    lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

    bodyLine = createLine(
      fullLenght,
      lineMaterial,
      new THREE.Vector3(0, 0.35, 0),
    );
    bodyLine.name = "bodyLine";

    headLine = createLine(
      halfLength,
      lineMaterial,
      new THREE.Vector3(0, 0.55, -0.5),
    );
    headLine.name = "headLine";

    rightFootLine = createLine(
      quarterLength,
      lineMaterial,
      new THREE.Vector3(0.125, 0, 0.25),
    );
    rightFootLine.name = "rightFootLine";

    leftFootLine = createLine(
      quarterLength,
      lineMaterial,
      new THREE.Vector3(-0.125, 0, 0.25),
    );
    leftFootLine.name = "leftFootLine";

    tailLine = createLine(
      quarterLength,
      lineMaterial,
      new THREE.Vector3(0, 0.3, 0.5),
    );
    tailLine.rotateX(Math.PI / 6);
    tailLine.name = "tailLine";

    duckGroup = new THREE.Group();
    duckGroup.add(bodyLine);
    duckGroup.add(headLine);
    duckGroup.add(rightFootLine);
    duckGroup.add(leftFootLine);
    duckGroup.add(tailLine);
    scene.add(duckGroup);

    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const material = new THREE.MeshBasicMaterial({ color: "red" });
    cube = new THREE.Mesh(geometry, material);

    scene.add(cube);

    // 7. Animation Loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // put animation logic here
      const delta = clock.getDelta();
      const rotationSpeed = 1; // Speed of rotation

      if (leftKeyDown && !rightKeyDown) {
        rotateLeft(rotationSpeed, delta);
      }

      if (rightKeyDown && !leftKeyDown && headLine.rotation.y > -Math.PI / 2) {
        rotateRight(rotationSpeed, delta);
      }

      renderer.render(scene, camera);
    };

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

    function rotateLeft(speed: number, delta: number) {
      const rotationDelta = (1 + speed) * delta;
      const newRotationY = headLine.rotation.y + rotationDelta;

      if (newRotationY > Math.PI / 3) {
        duckGroup.rotateY(rotationDelta);
      } else {
        headLine.rotateY(rotationDelta);
      }
    }

    function rotateRight(speed: number, delta: number) {
      const rotationDelta = (1 + speed) * delta;
      const newRotationY = headLine.rotation.y - rotationDelta;

      if (newRotationY < -Math.PI / 3) {
        duckGroup.rotateY(-rotationDelta);
      } else {
        headLine.rotateY(-rotationDelta);
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp") {
        upKeyDown = true;
      }
      if (event.key === "ArrowLeft") {
        leftKeyDown = true;
      }
      if (event.key === "ArrowDown") {
        downKeyDown = true;
      }
      if (event.key === "ArrowRight") {
        rightKeyDown = true;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp") {
        upKeyDown = false;
      }
      if (event.key === "ArrowLeft") {
        leftKeyDown = false;
      }
      if (event.key === "ArrowDown") {
        downKeyDown = false;
      }
      if (event.key === "ArrowRight") {
        rightKeyDown = false;
      }
    };

    const handleClick = (event: MouseEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObject(plane);

      if (intersects.length > 0) {
        cube.position.copy(intersects[0].point);
        cube.position.y = 0.05;
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("click", handleClick);

    animate();

    return () => {
      console.log("Cleaning up Three.js scene...");
      window.removeEventListener("click", handleClick);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);

      bodyLine.geometry.dispose();
      headLine.geometry.dispose();
      rightFootLine.geometry.dispose();
      leftFootLine.geometry.dispose();
      tailLine.geometry.dispose();

      cube.geometry.dispose();
      if (Array.isArray(cube.material)) {
        cube.material.forEach((mat) => mat.dispose());
      } else {
        cube.material.dispose();
      }

      plane.geometry.dispose();
      if (Array.isArray(plane.material)) {
        plane.material.forEach((mat) => mat.dispose());
      } else {
        plane.material.dispose();
      }
      lineMaterial.dispose();

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
    position: THREE.Vector3,
  ): THREE.Line {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    const line = new THREE.Line(geometry, material);
    line.position.copy(position);
    return line;
  }
</script>

<div
  class="container"
  bind:this={canvasContainer}
  style="width: 100vw; height: 100vh; overflow: hidden;"
></div>
<div class="debug-container">
  <Keyboard
    isUpPressed={upKeyDown}
    isLeftPressed={leftKeyDown}
    isDownPressed={downKeyDown}
    isRightPressed={rightKeyDown}
  />
</div>

<style>
  .container {
    margin: 0;
    padding: 0;
    display: block;
  }

  .debug-container {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1000;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 10px;
    font-family: monospace;
  }
</style>
