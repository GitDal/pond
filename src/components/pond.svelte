<script lang="ts">
    import { onMount } from "svelte";
    import * as THREE from "three";
    import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
    import { createPlane } from "../three/create-plane";
    import Keyboard from "./keyboard.svelte";
    import { store } from "../three/store/store";
    import { Duck, type IModel } from "../three/models/duck";
    import { handleKeyDown } from "../three/handlers/handle-key-down";
    import { handleKeyUp } from "../three/handlers/handle-key-up";

    let canvasContainer: HTMLDivElement;

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let animationFrameId: number;
    let clock: THREE.Clock;
    
    let plane: THREE.Mesh;
    let cube: THREE.Mesh;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const models: Array<IModel> = [];

    $: upKeyDown = $store.upKeyDown;
    $: leftKeyDown = $store.leftKeyDown;
    $: downKeyDown = $store.downKeyDown;
    $: rightKeyDown = $store.rightKeyDown;

    onMount(() => {
        clock = new THREE.Clock();

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x222222);

        const aspectRatio = window.innerWidth / window.innerHeight;
        camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
        camera.position.set(0, 5, 7); // Adjusted camera to view the plane
        camera.lookAt(0, 0, 0);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true; // Enable shadows
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        canvasContainer.appendChild(renderer.domElement);

        plane = createPlane();
        plane.name = "groundPlane";
        scene.add(plane);

        const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const material = new THREE.MeshBasicMaterial({ color: "red" });
        cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        const duck = new Duck();
        models.push(duck);

        models.forEach((models) => scene.add(models.group));

        new OrbitControls(camera, renderer.domElement);

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

        const handleResize = () => {
            if (camera && renderer) {
                const newAspectRatio = window.innerWidth / window.innerHeight;
                camera.aspect = newAspectRatio;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            }
        };

        window.addEventListener("resize", handleResize);
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("click", handleClick);

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            const delta = clock.getDelta();
            models.forEach((model) => model.tick(delta));

            renderer.render(scene, camera);
        };

        animate();

        return () => {
            console.log("Cleaning up Three.js scene...");
            window.removeEventListener("click", handleClick);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationFrameId);

            models.forEach((model) => model.destroy());

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

            if (renderer) {
                renderer.dispose();
                if (canvasContainer && renderer.domElement) {
                    canvasContainer.removeChild(renderer.domElement);
                }
            }
        };
    });
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
