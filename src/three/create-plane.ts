import * as THREE from "three";

export function createPlane(): { mesh: THREE.Mesh, geometry: THREE.PlaneGeometry, material: THREE.MeshBasicMaterial } {
    const size = { width: 10, depth: 8 };
    const geometry = new THREE.PlaneGeometry(size.width, size.depth);
    const material = new THREE.MeshBasicMaterial({
        color: 0x555555, // Darker grey for the plane
        side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    mesh.position.y = 0; // Plane surface is at y=0

    return { mesh, geometry, material };
}