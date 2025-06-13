import * as THREE from "three";
import { store } from "../store/store";

export const handleKeyUp = (event: KeyboardEvent) => {
    switch (event.key) {
        case "ArrowUp":
            store.update(state => ({ ...state, upKeyDown: false }))
            break;
        case "ArrowLeft":
            store.update(state => ({ ...state, leftKeyDown: false }))
            break;
        case "ArrowDown":
            store.update(state => ({ ...state, downKeyDown: false }))
            break;
        case "ArrowRight":
            store.update(state => ({ ...state, rightKeyDown: false }))
            break;
        default:
            // Do nothing for other keys
            break;
    }
};