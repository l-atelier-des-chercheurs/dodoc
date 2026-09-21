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

    waitForImagesInElement(el) {
      if (!el) return Promise.resolve();

      const images = el.querySelectorAll("img");
      if (images.length === 0) return Promise.resolve();

      return Promise.all(
        [...images].map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) resolve();
              else {
                img.addEventListener("load", resolve, { once: true });
                img.addEventListener("error", resolve, { once: true });
              }
            })
        )
      );
    },

    signalPublicationReadyAfterRender({ wait_for_images = true } = {}) {
      this.setPublicationReadyState(false);

      this.$nextTick(async () => {
        if (wait_for_images) {
          await this.waitForImagesInElement(this.$el);
        }
        setTimeout(() => this.setPublicationReadyState(true), 100);
      });
    },
  },
};
