import * as THREE from "three";
import { createLine } from "../create-line";
import { store } from "../store/store";

export interface IModel {
    group: THREE.Group;
    tick: (delta: number) => void;
    destroy: () => void;
}

export class Duck implements IModel {
    private rotationSpeed: number = 2;
    private lineMaterial: THREE.LineBasicMaterial;
    private bodyLine: THREE.Line;
    private headLine: THREE.Line;
    private leftFootLine: THREE.Line;
    private rightFootLine: THREE.Line;
    private tailLine: THREE.Line;
    public group: THREE.Group;

    private lookLeft = false;
    private lookRight = false;


    public constructor() {
        store.subscribe(state => {
            this.lookLeft = state.leftKeyDown && !state.rightKeyDown;
            this.lookRight = state.rightKeyDown && !state.leftKeyDown;
        });

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

        this.lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

        this.bodyLine = createLine(
            "bodyLine",
            fullLenght,
            this.lineMaterial,
            new THREE.Vector3(0, 0.35, 0),
        );

        this.headLine = createLine(
            "headLine",
            halfLength,
            this.lineMaterial,
            new THREE.Vector3(0, 0.55, -0.5),
        );

        this.rightFootLine = createLine(
            "rightFootLine",
            quarterLength,
            this.lineMaterial,
            new THREE.Vector3(0.125, 0, 0.25),
        );

        this.leftFootLine = createLine(
            "leftFootLine",
            quarterLength,
            this.lineMaterial,
            new THREE.Vector3(-0.125, 0, 0.25),
        );

        this.tailLine = createLine(
            "tailLine",
            quarterLength,
            this.lineMaterial,
            new THREE.Vector3(0, 0.3, 0.5),
        );
        this.tailLine.rotateX(Math.PI / 6);

        this.group = new THREE.Group();
        this.group.add(this.bodyLine);
        this.group.add(this.headLine);
        this.group.add(this.rightFootLine);
        this.group.add(this.leftFootLine);
        this.group.add(this.tailLine);
    }

    public tick(delta: number) {
        if (this.lookLeft) {
            this.rotateLeft(this.rotationSpeed, delta);
        }

        if (this.lookRight) {
            this.rotateRight(this.rotationSpeed, delta);
        }
    }

    public destroy() {
        this.lineMaterial.dispose();
        this.bodyLine.geometry.dispose();
        this.headLine.geometry.dispose();
        this.rightFootLine.geometry.dispose();
        this.leftFootLine.geometry.dispose();
        this.tailLine.geometry.dispose();
    }

    private rotateLeft(speed: number, delta: number) {
        const rotationDelta = (1 + speed) * delta;
        const newRotationY = this.headLine.rotation.y + rotationDelta;

        if (newRotationY > Math.PI / 3) {
            this.group.rotateY(rotationDelta);
        } else {
            this.headLine.rotateY(rotationDelta);
        }
    }

    private rotateRight(speed: number, delta: number) {
        const rotationDelta = (1 + speed) * delta;
        const newRotationY = this.headLine.rotation.y - rotationDelta;

        if (newRotationY < -Math.PI / 3) {
            this.group.rotateY(-rotationDelta);
        } else {
            this.headLine.rotateY(-rotationDelta);
        }
    }
}