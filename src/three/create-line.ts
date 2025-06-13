import * as THREE from "three";

export function createLine(
    name: string,
    vertices: Float32Array,
    material: THREE.Material,
    position: THREE.Vector3,
): THREE.Line {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    const line = new THREE.Line(geometry, material);
    line.name = name;
    line.position.copy(position);
    return line;
}