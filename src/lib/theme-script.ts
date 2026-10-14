import { THEME_KEY } from "@/lib/storage/keys";

/**
 * Runs in <head> before first paint so the page never flashes the wrong theme.
 * Resolves "system" to light or dark and writes it to <html data-theme>.
 */
export const THEME_SCRIPT = `(function(){var d=document.documentElement;try{var t=localStorage.getItem(${JSON.stringify(
  THEME_KEY,
)});var dark=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);d.dataset.theme=dark?"dark":"light"}catch(e){d.dataset.theme="light"}})();`;
