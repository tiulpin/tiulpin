import { QuartzComponent, QuartzComponentConstructor } from "./types"
// @ts-ignore
import script from "./scripts/tweaks.inline"

const Tweaks: QuartzComponent = () => {
  return (
    <>
      <button id="tweaks-toggle" class="tweaks-toggle" type="button" title="Reader settings (⌘.)" aria-label="Reader settings">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round">
          <circle cx="8" cy="8" r="2" />
          <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M3 13l1.5-1.5M11.5 4.5L13 3" />
        </svg>
      </button>

      <div id="tweaks-panel" class="tweaks" role="dialog" aria-label="Reader settings">
        <div class="tweaks-head">
          <span>READER</span>
          <button id="tweaks-close" class="tweaks-x" aria-label="Close">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>
        <div class="tweaks-body">
          <div class="tweak-row">
            <div class="tweak-label"><span>Theme</span><span class="tweak-val" data-val="theme"></span></div>
            <div class="tweak-seg">
              <button data-theme="dark" type="button">Dark</button>
              <button data-theme="light" type="button">Light</button>
            </div>
          </div>
          <div class="tweak-row">
            <div class="tweak-label"><span>Body family</span><span class="tweak-val" data-val="family">Serif</span></div>
            <div class="tweak-seg">
              <button data-family="Serif" type="button">Serif</button>
              <button data-family="Sans" type="button">Sans</button>
              <button data-family="Mono" type="button">Mono</button>
            </div>
          </div>
          <div class="tweak-row">
            <div class="tweak-label"><span>Text size</span><span class="tweak-val" data-val="size">18px</span></div>
            <input class="tweak-slider" type="range" min="14" max="22" step="1" data-slider="size" />
          </div>
          <div class="tweak-row">
            <div class="tweak-label"><span>Line height</span><span class="tweak-val" data-val="leading">1.70</span></div>
            <input class="tweak-slider" type="range" min="1.4" max="2.0" step="0.05" data-slider="leading" />
          </div>
          <div class="tweak-row">
            <div class="tweak-label"><span>Line width</span><span class="tweak-val" data-val="measure">680px</span></div>
            <input class="tweak-slider" type="range" min="560" max="820" step="20" data-slider="measure" />
          </div>
        </div>
      </div>
    </>
  )
}

Tweaks.afterDOMLoaded = script

Tweaks.css = `
.tweaks-toggle {
  position: fixed;
  bottom: 16px;
  right: 16px;
  width: 36px; height: 36px;
  border-radius: 8px;
  background: var(--bg-island);
  border: 1px solid var(--border-island);
  color: var(--ink);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-pop);
  z-index: 80;
  transition: background 120ms ease, color 120ms ease;
}
.tweaks-toggle:hover { background: var(--bg-island-2); color: var(--ink-strong); }
.tweaks-toggle.hidden { display: none; }

.tweaks {
  position: fixed;
  bottom: 16px;
  right: 16px;
  width: 280px;
  background: var(--bg-island);
  border: 1px solid var(--border-island);
  border-radius: 8px;
  box-shadow: var(--shadow-pop);
  font-family: var(--font-mono);
  font-size: 12px;
  z-index: 80;
  overflow: hidden;
  display: none;
}
.tweaks.open { display: block; }

.tweaks-head {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 8px 0 12px;
  border-bottom: 1px solid var(--border-faint);
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-mute);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.tweaks-x {
  margin-left: auto;
  border: 0; background: transparent;
  width: 22px; height: 22px;
  border-radius: 3px;
  cursor: pointer;
  color: var(--ink-mute);
  display: inline-flex; align-items: center; justify-content: center;
}
.tweaks-x:hover { background: var(--hover); color: var(--ink-strong); }

.tweaks-body { padding: 12px; display: flex; flex-direction: column; gap: 14px; }

.tweak-row { display: flex; flex-direction: column; gap: 6px; }
.tweak-label {
  display: flex; align-items: center; justify-content: space-between;
  color: var(--ink-mute);
  font-family: var(--font-mono);
  font-size: 11px;
}
.tweak-val { color: var(--ink-strong); }

.tweak-seg {
  display: grid;
  grid-auto-flow: column; grid-auto-columns: 1fr;
  background: var(--bg-island-2);
  border: 1px solid var(--border-faint);
  border-radius: 4px;
  overflow: hidden;
}
.tweak-seg button {
  border: 0; background: transparent;
  font-family: var(--font-mono); font-size: 11px;
  color: var(--ink-mute);
  height: 26px;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;
}
.tweak-seg button:hover { color: var(--ink-strong); background: var(--hover); }
.tweak-seg button.on { background: var(--accent); color: #fff; }

.tweak-slider {
  -webkit-appearance: none; appearance: none;
  width: 100%; height: 4px;
  background: var(--bg-island-2);
  border: 1px solid var(--border-faint);
  border-radius: 2px;
  outline: none;
  margin: 4px 0;
}
.tweak-slider::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none;
  width: 14px; height: 14px;
  background: var(--accent);
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid var(--bg-island);
}
.tweak-slider::-moz-range-thumb {
  width: 14px; height: 14px;
  background: var(--accent);
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid var(--bg-island);
}

@media (max-width: 600px) {
  .tweaks { width: calc(100vw - 32px); }
}
`

export default (() => Tweaks) satisfies QuartzComponentConstructor
