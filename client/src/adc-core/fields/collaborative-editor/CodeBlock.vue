<template>
  <div class="code-block">
    <button
      type="button"
      class="u-button u-button_small copy-btn"
      :class="{ copied: copied }"
      @click="copyToClipboard"
      :title="copied ? $t('copied') : $t('copy_to_clipboard')"
    >
      <span v-if="!copied">
        <b-icon icon="clipboard" />
      </span>
      <span v-else>
        <b-icon icon="check" />
        {{ $t("copied") }}
      </span>
    </button>
    <pre class="code-content"><code>{{ code }}</code></pre>
  </div>
</template>

<script>
export default {
  name: "CodeBlock",
  props: {
    code: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      copied: false,
    };
  },
  methods: {
    async copyToClipboard() {
      try {
        await navigator.clipboard.writeText(this.code);
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 2000);
      } catch (err) {
        console.error("Failed to copy text: ", err);
        // Fallback for older browsers
        this.fallbackCopyTextToClipboard(this.code);
      }
    },
    fallbackCopyTextToClipboard(text) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 2000);
      } catch (err) {
        console.error("Fallback: Oops, unable to copy", err);
      }
      document.body.removeChild(textArea);
    },
  },
};
</script>

<style lang="scss" scoped>
.code-block {
  position: relative;
  border-radius: var(--border-radius);
  margin: 0.5rem 0;
  border: 1px solid var(--c-gris);
  overflow: hidden;
  font-family: "Fira Code", monospace;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.copy-btn {
  position: absolute;
  top: 0;
  right: 0;
  background: transparent;
  cursor: pointer;

  transition: all 0.1s ease;

  &:hover {
  }

  &.copied {
  }
}

.code-content {
  background: var(--c-gris_clair);
  color: var(--c-noir);
  padding: calc(var(--spacing) / 2);
  margin: 0;
  overflow-x: auto;

  code {
    background: none;
    color: inherit;
    padding: 0;
    font-family: inherit;
  }
}
</style>
