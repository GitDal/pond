<script lang="ts">
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

  let canvasContainer: HTMLDivElement;

  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let sphere: THREE.Mesh;
  let groundPlane: THREE.Mesh;
  let animationFrameId: number;
  let clock: THREE.Clock;

  // Sphere properties
  const sphereRadius = 0.5; // Smaller sphere
  let sphereVelocity = new THREE.Vector3();
  const moveSpeed = 2; // units per second

  // Plane properties
  const planeSize = { width: 10, depth: 8 };

  // Jump properties
  let isJumping = false;
  let yVelocity = 0;
  const jumpStrength = 7;
  const gravity = 20; // A bit strong for a snappier jump

  // Geometries and Materials (to dispose later)
  let sphereGeometry: THREE.SphereGeometry;
  let sphereMaterial: THREE.MeshStandardMaterial;
  let planeGeometry: THREE.PlaneGeometry;
  let planeMaterial: THREE.MeshStandardMaterial;

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

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    // Configure shadow properties for the directional light
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);

    // 5. Ground Plane
    planeGeometry = new THREE.PlaneGeometry(planeSize.width, planeSize.depth);
    planeMaterial = new THREE.MeshStandardMaterial({
      color: 0x555555, // Darker grey for the plane
      side: THREE.DoubleSide,
      roughness: 0.8,
    });
    groundPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    groundPlane.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    groundPlane.position.y = 0; // Plane surface is at y=0
    groundPlane.receiveShadow = true; // Plane receives shadows
    scene.add(groundPlane);

    // 6. Sphere
    sphereGeometry = new THREE.SphereGeometry(sphereRadius, 32, 16);
    sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0xffaa00, // Orange sphere
      roughness: 0.3,
      metalness: 0.2,
    });
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.castShadow = true; // Sphere casts shadows
    sphere.position.y = sphereRadius; // Start sphere on top of the plane
    scene.add(sphere);

    // Initialize random movement direction
    const angle = Math.random() * Math.PI * 2;
    sphereVelocity.x = Math.cos(angle) * moveSpeed;
    sphereVelocity.z = Math.sin(angle) * moveSpeed;

    // 7. Animation Loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const deltaTime = clock.getDelta();

      // --- Sphere Movement Logic ---

      // Y-axis movement (Jump and Gravity)
      if (isJumping || sphere.position.y > sphereRadius) {
        yVelocity -= gravity * deltaTime;
        sphere.position.y += yVelocity * deltaTime;

        // Check for landing
        if (sphere.position.y <= sphereRadius) {
          sphere.position.y = sphereRadius;
          yVelocity = 0;
          isJumping = false;
        }
      }

      // XZ-plane movement
      sphere.position.x += sphereVelocity.x * deltaTime;
      sphere.position.z += sphereVelocity.z * deltaTime;

      // Boundary checks for XZ plane
      const halfPlaneWidth = planeSize.width / 2;
      const halfPlaneDepth = planeSize.depth / 2;

      // Check X boundaries
      if (sphere.position.x + sphereRadius > halfPlaneWidth) {
        sphere.position.x = halfPlaneWidth - sphereRadius;
        sphereVelocity.x *= -1;
      } else if (sphere.position.x - sphereRadius < -halfPlaneWidth) {
        sphere.position.x = -halfPlaneWidth + sphereRadius;
        sphereVelocity.x *= -1;
      }

      // Check Z boundaries
      if (sphere.position.z + sphereRadius > halfPlaneDepth) {
        sphere.position.z = halfPlaneDepth - sphereRadius;
        sphereVelocity.z *= -1;
      } else if (sphere.position.z - sphereRadius < -halfPlaneDepth) {
        sphere.position.z = -halfPlaneDepth + sphereRadius;
        sphereVelocity.z *= -1;
      }

      // Simple rotation (optional)
      // sphere.rotation.x += 0.5 * deltaTime;
      // sphere.rotation.y += 0.5 * deltaTime;

      // Temporary: Randomly initiate a jump if on the ground
      if (!isJumping && Math.random() < 0.003) {
        // Low probability per frame
        isJumping = true;
        yVelocity = jumpStrength;
      }

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

      // Dispose of geometries and materials
      sphereGeometry?.dispose();
      sphereMaterial?.dispose();
      planeGeometry?.dispose();
      planeMaterial?.dispose();

      // Dispose of renderer and remove canvas
      if (renderer) {
        renderer.dispose();
        if (canvasContainer && renderer.domElement) {
          canvasContainer.removeChild(renderer.domElement);
        }
      }
      // You might want to traverse the scene to dispose of all objects
      // if you add many more dynamically.
      // scene.traverse(object => {
      //    if (object.geometry) object.geometry.dispose();
      //    if (object.material) {
      //        if (Array.isArray(object.material)) {
      //            object.material.forEach(mat => mat.dispose());
      //        } else {
      //            object.material.dispose();
      //        }
      //    }
      // });
    };
  });
</script>

<div
  bind:this={canvasContainer}
  style="width: 100vw; height: 100vh; overflow: hidden;"
>
</div>

<style>
  div {
    margin: 0;
    padding: 0;
    display: block;
  }
</style>
