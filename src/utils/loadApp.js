export const LOAD_APP_EVENT = "ssh:load-app";

export function requestAppLoad() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(LOAD_APP_EVENT));
  }
}
