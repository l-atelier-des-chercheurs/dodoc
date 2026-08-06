import { createPopper } from "@popperjs/core";

const TOOLTIP_STYLE_ID = "d-title-popper-style";
const TOOLTIP_CLASS_NAME = "d-title-popper";
const TITLE_STASH_ATTR = "data-d-title-popper";
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

function read_title_text(target_el) {
  return (
    target_el.getAttribute("title")?.trim() ||
    target_el.getAttribute(TITLE_STASH_ATTR)?.trim() ||
    ""
  );
}

/**
 * Strip `title` immediately on hover so the browser never arms its native tooltip.
 * Stash the text in a data attribute for the delayed custom tooltip (and Vue rebinds).
 */
function stash_and_clear_title(target_el) {
  const from_title = target_el.getAttribute("title")?.trim();
  if (from_title) {
    target_el.setAttribute(TITLE_STASH_ATTR, from_title);
    target_el.removeAttribute("title");
    return from_title;
  }
  return target_el.getAttribute(TITLE_STASH_ATTR)?.trim() || "";
}

function restore_title(target_el) {
  const title_text = target_el.getAttribute(TITLE_STASH_ATTR)?.trim();
  if (!title_text) return;
  target_el.removeAttribute(TITLE_STASH_ATTR);
  if (!target_el.getAttribute("title")) {
    target_el.setAttribute("title", title_text);
  }
}

function get_tooltip_target(node) {
  if (!(node instanceof Element)) return null;

  const target_el = node.closest(
    `a[title], button[title], a[${TITLE_STASH_ATTR}], button[${TITLE_STASH_ATTR}]`,
  );
  if (!target_el) return null;
  if (target_el.hasAttribute("disabled")) return null;
  if (target_el.getAttribute("data-tooltip-disabled") === "true") return null;

  if (!read_title_text(target_el)) return null;

  return target_el;
}

function hide_active_tooltip() {
  if (scheduled_target_el) {
    restore_title(scheduled_target_el);
  }
  clear_scheduled_show();

  if (!active_tooltip) return;

  const { target_el, tooltip_el, popper_instance } = active_tooltip;

  popper_instance.destroy();
  tooltip_el.remove();
  restore_title(target_el);

  active_tooltip = null;
}

function show_tooltip(target_el) {
  const title_text = stash_and_clear_title(target_el);
  if (!title_text) {
    hide_active_tooltip();
    return;
  }

  if (active_tooltip?.target_el === target_el) return;

  hide_active_tooltip();

  // Keep stash while custom tooltip is visible (do not restore yet).
  target_el.setAttribute(TITLE_STASH_ATTR, title_text);
  target_el.removeAttribute("title");

  const tooltip_el = document.createElement("div");
  tooltip_el.className = TOOLTIP_CLASS_NAME;
  tooltip_el.setAttribute("role", "tooltip");
  tooltip_el.textContent = title_text;

  document.body.appendChild(tooltip_el);

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

  // Clear native `title` before the browser's own delay (~1s) fires.
  stash_and_clear_title(target_el);

  show_timeout_id = setTimeout(() => {
    const next_target_el = scheduled_target_el;
    clear_scheduled_show();
    if (!next_target_el || !next_target_el.isConnected) return;
    show_tooltip(next_target_el);
  }, SHOW_DELAY_MS);
}

function cancel_pending_or_active_for_leave(event) {
  if (scheduled_target_el) {
    const pending_target = scheduled_target_el;
    if (pending_target.contains(event.target)) {
      const next_target = event.relatedTarget;
      if (!next_target || !pending_target.contains(next_target)) {
        restore_title(pending_target);
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
  cancel_pending_or_active_for_leave(event);
}

function on_focus_out(event) {
  cancel_pending_or_active_for_leave(event);
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
