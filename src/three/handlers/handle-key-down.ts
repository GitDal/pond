import { store } from "../store/store";

export const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
        case "ArrowUp":
            store.update(state => ({ ...state, upKeyDown: true }))
            break;
        case "ArrowLeft":
            store.update(state => ({ ...state, leftKeyDown: true }))
            break;
        case "ArrowDown":
            store.update(state => ({ ...state, downKeyDown: true }))
            break;
        case "ArrowRight":
            store.update(state => ({ ...state, rightKeyDown: true }))
            break;
        default:
            // Do nothing for other keys
            break;
    }
};