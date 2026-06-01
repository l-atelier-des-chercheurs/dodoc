import { createPopper } from "@popperjs/core";

const TOOLTIP_STYLE_ID = "d-title-popper-style";
const TOOLTIP_CLASS_NAME = "d-title-popper";
const SHOW_DELAY_MS = 800;

let active_tooltip = null;
let is_initialized = false;
let show_timeout_id = null;
let scheduled_target_el = null;

function clear_scheduled_show() {
  if (show_timeout_id) clearTimeout(show_timeout_id);
  show_timeout_id = null;
  scheduled_target_el = null;
}

function inject_tooltip_styles() {
  if (document.getElementById(TOOLTIP_STYLE_ID)) return;

  const style_el = document.createElement("style");
  style_el.id = TOOLTIP_STYLE_ID;
  style_el.textContent = `
    .${TOOLTIP_CLASS_NAME} {
      background: var(--c-noir);
      color: white;
      border-radius: var(--border-radius);
      max-width: 320px;
      padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
      pointer-events: none;
      position: relative;
      white-space: pre-wrap;
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.25s cubic-bezier(0.19, 1, 0.22, 1);
    }
      
    .${TOOLTIP_CLASS_NAME}[data-show="true"] {
      opacity: 1;
    }
  `;
  document.head.appendChild(style_el);
}

function get_tooltip_target(node) {
  if (!(node instanceof Element)) return null;

  const target_el = node.closest("a[title], button[title]");
  if (!target_el) return null;
  if (target_el.hasAttribute("disabled")) return null;
  if (target_el.getAttribute("data-tooltip-disabled") === "true") return null;

  const title_text = target_el.getAttribute("title")?.trim();
  if (!title_text) return null;

  return target_el;
}

function hide_active_tooltip() {
  clear_scheduled_show();

  if (!active_tooltip) return;

  const { target_el, tooltip_el, popper_instance, title_text } = active_tooltip;

  popper_instance.destroy();
  tooltip_el.remove();

  // Restore original title so native behavior still exists when JS is disabled.
  if (title_text && !target_el.getAttribute("title")) {
    target_el.setAttribute("title", title_text);
  }

  active_tooltip = null;
}

function show_tooltip(target_el) {
  const title_text = target_el.getAttribute("title")?.trim();
  if (!title_text) {
    hide_active_tooltip();
    return;
  }

  if (active_tooltip?.target_el === target_el) return;

  hide_active_tooltip();

  const tooltip_el = document.createElement("div");
  tooltip_el.className = TOOLTIP_CLASS_NAME;
  tooltip_el.setAttribute("role", "tooltip");
  tooltip_el.textContent = title_text;

  document.body.appendChild(tooltip_el);

  // Remove title to prevent browser-native tooltip from appearing.
  target_el.removeAttribute("title");

  const popper_instance = createPopper(target_el, tooltip_el, {
    placement: "top",
    modifiers: [
      { name: "offset", options: { offset: [0, 8] } },
      { name: "preventOverflow", options: { padding: 8 } },
      { name: "flip", options: { padding: 8 } },
    ],
  });

  active_tooltip = { target_el, tooltip_el, popper_instance, title_text };

  requestAnimationFrame(() => {
    tooltip_el.setAttribute("data-show", "true");
    popper_instance.update();
  });
}

function schedule_show_tooltip(target_el) {
  if (active_tooltip?.target_el === target_el) return;
  if (scheduled_target_el === target_el) return;

  clear_scheduled_show();
  scheduled_target_el = target_el;

  show_timeout_id = setTimeout(() => {
    const next_target_el = scheduled_target_el;
    clear_scheduled_show();
    if (!next_target_el || !next_target_el.isConnected) return;
    show_tooltip(next_target_el);
  }, SHOW_DELAY_MS);
}

function on_mouse_over(event) {
  const target_el = get_tooltip_target(event.target);
  if (!target_el) return;
  schedule_show_tooltip(target_el);
}

function on_focus_in(event) {
  const target_el = get_tooltip_target(event.target);
  if (!target_el) return;
  schedule_show_tooltip(target_el);
}

function on_mouse_out(event) {
  if (scheduled_target_el) {
    const pending_target = scheduled_target_el;
    if (pending_target.contains(event.target)) {
      const next_target = event.relatedTarget;
      if (!next_target || !pending_target.contains(next_target)) {
        clear_scheduled_show();
      }
    }
  }

  if (!active_tooltip) return;

  const current_target = active_tooltip.target_el;
  if (!current_target.contains(event.target)) return;

  const next_target = event.relatedTarget;
  if (next_target && current_target.contains(next_target)) return;

  hide_active_tooltip();
}

function on_focus_out(event) {
  if (scheduled_target_el) {
    const pending_target = scheduled_target_el;
    if (pending_target.contains(event.target)) {
      const next_target = event.relatedTarget;
      if (!next_target || !pending_target.contains(next_target)) {
        clear_scheduled_show();
      }
    }
  }

  if (!active_tooltip) return;

  const current_target = active_tooltip.target_el;
  if (!current_target.contains(event.target)) return;

  const next_target = event.relatedTarget;
  if (next_target && current_target.contains(next_target)) return;

  hide_active_tooltip();
}

function on_keydown(event) {
  if (event.key === "Escape") hide_active_tooltip();
}

export function init_title_popper() {
  if (is_initialized) return;
  is_initialized = true;

  inject_tooltip_styles();

  document.addEventListener("mouseover", on_mouse_over, true);
  document.addEventListener("focusin", on_focus_in, true);
  document.addEventListener("mouseout", on_mouse_out, true);
  document.addEventListener("focusout", on_focus_out, true);
  document.addEventListener("scroll", hide_active_tooltip, true);
  document.addEventListener("pointerdown", hide_active_tooltip, true);
  document.addEventListener("keydown", on_keydown, true);
}
