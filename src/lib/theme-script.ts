import { INTRO_KEY, MODE_KEY, THEME_KEY } from "@/lib/storage/keys";

/**
 * Runs in <head> before first paint so the page never flashes the wrong theme.
 * Light is the default; dark only when someone picked it, or picked "follow the system"
 * on a dark system. Writes the result to <html data-theme>. Also marks
 * <html data-intro="pending"> on a first visit, which keeps the welcome screen hidden
 * on /start until the intro mounts over it, and <html data-framed> inside the phone view.
 */
export const THEME_SCRIPT = `(function(){var d=document.documentElement;try{var s=localStorage;var t=s.getItem(${JSON.stringify(
  THEME_KEY,
)});var dark=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);d.dataset.theme=dark?"dark":"light";if(s.getItem(${JSON.stringify(
  INTRO_KEY,
)})!=="seen"&&s.getItem(${JSON.stringify(MODE_KEY)})!=="demo")d.dataset.intro="pending"}catch(e){d.dataset.theme="light"}try{if(window.self!==window.top)d.dataset.framed=""}catch(e){d.dataset.framed=""}})();`;
