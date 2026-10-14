import { INTRO_KEY, MODE_KEY, THEME_KEY } from "@/lib/storage/keys";

/**
 * Runs in <head> before first paint so the page never flashes the wrong theme.
 * Resolves "system" to light or dark and writes it to <html data-theme>. Also marks
 * <html data-intro="pending"> on a first visit, which shows the navy intro cover on
 * /start until the intro itself mounts.
 */
export const THEME_SCRIPT = `(function(){var d=document.documentElement;try{var s=localStorage;var t=s.getItem(${JSON.stringify(
  THEME_KEY,
)});var dark=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);d.dataset.theme=dark?"dark":"light";if(s.getItem(${JSON.stringify(
  INTRO_KEY,
)})!=="seen"&&s.getItem(${JSON.stringify(MODE_KEY)})!=="demo")d.dataset.intro="pending"}catch(e){d.dataset.theme="light"}})();`;
