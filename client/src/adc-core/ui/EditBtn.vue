<template>
  <button
    type="button"
    class="u-button _editBtn"
    :class="{
      'is--unfolded': is_unfolded,
      'is--spinning': is_spinning,
    }"
    :disabled="disabled"
    :style="btn_styles"
    @click="$emit('click')"
  >
    <span class="_label" v-if="button_label" :data-position="label_position">
      {{ button_label }}
    </span>
    <b-icon
      class="_icon"
      :icon="btn_props.icon"
      :scale="btn_props.icon_size ? btn_props.icon_size : 1"
    />
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
    button_label() {
      if (this.label !== undefined) return this.label;
      return this.btn_props.label;
    },
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
          icon: "plus",
          icon_size: 1.5,
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
          icon: "plus",
          icon_size: 1.5,
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
        icon: "pencil",
        icon_size: 0.8,
      };
    },
    btn_styles() {
      if (this.style_type === "black")
        return `
          --color-bg: var(--c-noir);
          --color-icon: white;
          --color-icon-hover: white;
          --color-bg-hover: var(--c-noir);
        `;

      if (
        this.btn_type === "fullscreen" ||
        this.btn_type === "close" ||
        this.btn_type === "show" ||
        this.btn_type === "hide"
      )
        return `
          --color-icon: var(--c-noir);
          --color-icon-hover: white;
          --color-bg-hover:  var(--c-noir);
        `;
      // if (this.btn_type === "add")
      //   return `
      //     --color-bg: white;
      //     --color-icon: var(--c-noir);
      //     --color-hover-icon: white;
      //   `;
      else if (this.btn_type === "credits")
        return `
          --color-icon: var(--c-noir);
          --color-icon-hover: var(--c-noir);
          --color-bg-hover: white;
        `;
      else if (this.btn_type === "remove")
        return `
          --color-icon: var(--c-rouge);
        `;

      if (this.btn_type === "fullscreen-exit")
        return `
          --color-bg: var(--c-noir);
          --color-icon: white;
          --color-icon-hover: var(--c-noir);
          --color-bg-hover: white;
        `;
      return ``;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._editBtn {
  --color-bg: rgba(255, 255, 255, 0.5);
  --color-icon: var(--active-color);
  --color-icon-hover: white;
  --color-bg-hover: var(--active-color);

  position: relative;
  // display: inline-flex;
  background: var(--color-bg);
  color: var(--color-icon);
  // border: 1px solid var(--color-bg);

  // box-shadow: 0 1px 40px rgb(0 0 0 / 10%);

  // margin-top: -0.5rem;
  // margin-bottom: -0.5rem;
  // width: 24px;
  // height: 24px;
  // flex: 0 0 24px;
  padding-left: 2px;
  padding: calc(var(--spacing) / 2);

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

    background: var(--color-icon);

    // margin: -1px;
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
    color: var(--color-icon-hover);

    ._label {
      transform: none;
      color: inherit;
      background: var(--color-bg-hover);
      color: var(--color-icon-hover);

      opacity: 1;
      max-width: 40ch;
      // pointer-events: auto;
      // transition: all 0.25s 0.5s cubic-bezier(0.19, 1, 0.22, 1);
      transition: all 0.25s 0s cubic-bezier(0.19, 1, 0.22, 1);
    }
  }
}
</style>
