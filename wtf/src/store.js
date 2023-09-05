import { writable } from "svelte/store";

export const Flash = writable("");

export const showSideBar = writable(true);

export const nowUser = writable("未登入");