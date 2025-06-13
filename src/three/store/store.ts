import { writable } from "svelte/store";

export const store = writable({
    upKeyDown: false,
    leftKeyDown: false,
    downKeyDown: false,
    rightKeyDown: false,
});

export type Store = typeof store;