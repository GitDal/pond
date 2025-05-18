<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';

  let canvasContainer: HTMLDivElement; // This will be our mount point for the Three.js canvas

  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let sphere: THREE.Mesh;
  let animationFrameId: number;

  onMount(() => {
    // 1. Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222); // A dark grey background

    // 2. Camera
    const aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    camera.position.z = 5; // Move camera back a bit

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvasContainer.appendChild(renderer.domElement); // Append canvas to our div

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.8); // Stronger white light
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);

    // 5. Geometry & Material (for the sphere)
    const geometry = new THREE.SphereGeometry(1, 32, 16); // Radius 1, 32 width segments, 16 height segments
    const material = new THREE.MeshStandardMaterial({
      color: 0x0077ff, // A nice blue
      roughness: 0.5,
      metalness: 0.1,
    });
    sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // 6. Animation Loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Simple animation: rotate the sphere
      sphere.rotation.x += 0.005;
      sphere.rotation.y += 0.005;

      renderer.render(scene, camera);
    };
    animate();

    // 7. Handle window resize
    const handleResize = () => {
      if (camera && renderer) {
        const newAspectRatio = window.innerWidth / window.innerHeight;
        camera.aspect = newAspectRatio;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    // Cleanup function: Svelte's onMount can return a function that
    // will be called when the component is destroyed.
    return () => {
      console.log('Cleaning up Three.js scene...');
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer) {
        renderer.dispose(); // Dispose of the renderer's resources
      }
      if (geometry) geometry.dispose();
      if (material) material.dispose();
      // If scene has many children, you might want to traverse and dispose them
      // scene.traverse(object => {
      //   if (object.geometry) object.geometry.dispose();
      //   if (object.material) {
      //     if (Array.isArray(object.material)) {
      //       object.material.forEach(mat => mat.dispose());
      //     } else {
      //       object.material.dispose();
      //     }
      //   }
      // });
      if (canvasContainer && renderer.domElement) {
        canvasContainer.removeChild(renderer.domElement);
      }
    };
  });

  // onDestroy is an alternative to returning a function from onMount for cleanup.
  // Generally, returning from onMount is preferred for onMount-specific cleanup.
  // onDestroy(() => {
  //   console.log("Scene component is being destroyed");
  //   // Any additional cleanup not tied directly to onMount logic could go here.
  // });
</script>

<div bind:this={canvasContainer} style="width: 100vw; height: 100vh; overflow: hidden;">
  <!-- The Three.js canvas will be appended here -->
</div>

<style>
  /* Ensure the div takes up the full screen and hides scrollbars */
  div {
    margin: 0;
    padding: 0;
    display: block; /* Important for canvas to behave correctly */
  }
</style>