<template>
  <button
    type="button"
    class="u-button u-button_verysmall _editBtn"
    :class="{
      'is--unfolded': is_unfolded,
      'is--spinning': is_spinning,
    }"
    :disabled="disabled"
    :style="btn_styles"
    @click="$emit('click')"
  >
    <span class="_label" :data-position="label_position">
      <template v-if="label">{{ label }}</template>
      <template v-else>{{ btn_props.label }}</template>
    </span>
    <b-icon class="_icon" :icon="btn_props.icon" />
  </button>
</template>
<script>
export default {
  props: {
    label: String,
    btn_type: {
      type: String,
      default: "edit",
    },
    label_position: {
      type: String,
      default: "right",
    },
    style_type: {
      type: String,
      default: "default",
    },
    is_unfolded: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    is_spinning: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    btn_props() {
      if (this.btn_type === "fullscreen")
        return {
          label: this.$t("fullscreen"),
          icon: "fullscreen",
        };
      else if (this.btn_type === "fullscreen-exit")
        return {
          label: this.$t("exit_fullscreen"),
          icon: "fullscreen-exit",
        };
      else if (this.btn_type === "add")
        return {
          label: this.$t("add"),
          icon: "plus-lg",
        };
      else if (this.btn_type === "order")
        return {
          label: this.$t("change_order"),
          icon: "arrow-left-right",
        };
      else if (this.btn_type === "close")
        return {
          label: this.$t("close"),
          icon: "x-lg",
        };
      else if (this.btn_type === "check")
        return {
          label: this.$t("save"),
          icon: "check-lg",
        };
      else if (this.btn_type === "credits")
        return {
          label: this.$t("informations"),
          icon: "info-circle",
        };
      else if (this.btn_type === "remove")
        return {
          label: this.$t("remove"),
          icon: "trash",
        };
      else if (this.btn_type === "show")
        return {
          label: this.$t("show"),
          icon: "eye-fill",
        };
      else if (this.btn_type === "hide")
        return {
          label: this.$t("hide"),
          icon: "eye-slash-fill",
        };
      else if (this.btn_type === "create_page")
        return {
          label: this.$t("create_page"),
          icon: "plus-lg",
        };
      else if (this.btn_type === "regenerate_thumbs")
        return {
          label: this.$t("regenerate_thumbs"),
          icon: "arrow-clockwise",
        };
      else if (this.btn_type === "duplicate")
        return {
          label: this.$t("duplicate"),
          icon: "file-plus",
        };
      return {
        label: this.$t("edit"),
        icon: "pencil-fill",
      };
    },
    btn_styles() {
      if (this.style_type === "black")
        return `
          --color1: var(--c-noir);
          --color2: white;
          --color-text: var(--c-noir);
        `;

      if (
        this.btn_type === "fullscreen" ||
        this.btn_type === "close" ||
        this.btn_type === "show" ||
        this.btn_type === "hide"
      )
        return `
          --color2: var(--c-noir);
        `;
      // if (this.btn_type === "add")
      //   return `
      //     --color1: white;
      //     --color2: var(--c-noir);
      //     --color-hover-icon: white;
      //   `;
      else if (this.btn_type === "credits")
        return `
          --color2: var(--c-noir);
        `;
      else if (this.btn_type === "remove")
        return `
          --color2: var(--c-rouge);
        `;

      if (this.btn_type === "fullscreen-exit")
        return `
          --color1: var(--c-noir);
          --color2: white;
          --color-text: var(--c-noir);
        `;
      return ``;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._editBtn {
  --color1: rgba(255, 255, 255, 0.5);
  --color2: var(--active-color);
  --color-text: white;

  position: relative;
  display: inline-flex;
  background: var(--color1);
  color: var(--color2);
  // border: 1px solid var(--color1);

  // box-shadow: 0 1px 40px rgb(0 0 0 / 10%);

  // margin-top: -0.5rem;
  // margin-bottom: -0.5rem;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;

  border-radius: 50%;
  transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);

  &:hover,
  &:active,
  &:focus-visible {
    z-index: 2;
    // transform: scale(1.2);
  }

  ._icon {
    position: relative;
    // z-index: 1;
  }

  ._label {
    position: absolute;
    top: 0;
    height: calc(100% + 2px);

    background: var(--color2);
    color: var(--color-text);

    margin: -1px;
    padding: calc(var(--spacing) / 2) calc(var(--spacing) / 2);

    display: flex;
    align-items: center;
    border-radius: 1rem;
    white-space: nowrap;

    max-width: 0;
    overflow: hidden;

    pointer-events: none;
    opacity: 0;
    transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);

    &[data-position="right"] {
      left: 0;
      padding-left: 100%;
      transform: translateX(15px);
    }
    &[data-position="left"] {
      right: 0;
      padding-right: 100%;
      transform: translateX(-15px);
    }
  }

  &.is--unfolded {
    ._label {
      pointer-events: auto;
    }
  }

  &.is--spinning {
    ._icon {
      animation: spin 1s linear infinite;
    }
  }

  &:hover,
  &:active,
  &:focus-visible,
  &.is--unfolded {
    background: var(--color2);
    color: var(--color-text);

    ._label {
      transform: none;
      color: inherit;
      opacity: 1;
      max-width: 40ch;
      // pointer-events: auto;
      // transition: all 0.25s 0.5s cubic-bezier(0.19, 1, 0.22, 1);
      transition: all 0.25s 0s cubic-bezier(0.19, 1, 0.22, 1);
    }
  }
}
</style>
