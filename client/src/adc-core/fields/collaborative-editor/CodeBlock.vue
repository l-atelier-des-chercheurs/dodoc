<template>
  <div class="code-block-container">
    <div v-if="explanation" class="code-explanation">
      {{ explanation }}
    </div>
    <div class="code-block">
      <button
        type="button"
        class="u-button u-button_verysmall copy-btn"
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
    explanation: {
      type: String,
      default: null,
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
.code-block-container {
  margin: calc(var(--spacing) / 2) 0;
}

.code-block {
  position: relative;
  border-radius: var(--border-radius);
  border: 1px solid var(--c-gris);
  overflow: hidden;
  font-family: "Fira Code", monospace;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.copy-btn {
  position: absolute;
  top: calc(var(--spacing) / 8);
  right: calc(var(--spacing) / 4);
  background: transparent;
  cursor: pointer;

  transition: all 0.1s ease;

  &:hover {
  }

  &.copied {
  }
}

.code-explanation {
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  border-radius: var(--border-radius);
  border: 1px solid var(--c-gris);
  border-radius: var(--border-radius) var(--border-radius) 0 0;
  // background: var(--c-gris_clair);
  font-size: var(--sl-font-size-small);
  color: var(--c-noir);
  font-family: inherit;

  + .code-block {
    border-top: none;
    border-radius: 0 0 var(--border-radius) var(--border-radius);
  }
}

.code-content {
  background: var(--c-gris_clair);
  color: var(--c-noir);
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
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
