/** Same event type as Puppeteer / Electron offscreen capture (core2/puppeteer.js). */
export const ready_for_export_event = "READY_FOR_EXPORT";

export default {
  methods: {
    setPublicationReadyState(is_ready) {
      if (typeof window === "undefined") return;

      window.dispatchEvent(
        new CustomEvent(ready_for_export_event, {
          detail: { ready: is_ready === true },
        })
      );
    },
  },
};
