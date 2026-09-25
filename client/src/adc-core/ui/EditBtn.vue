<template>
  <button
    type="button"
    class="u-button u-button_icon _editBtn"
    :class="{
      'is--unfolded': is_unfolded,
      'is--spinning': is_spinning,
    }"
    :disabled="disabled"
    :style="btn_styles"
    :title="button_label"
    @click="$emit('click')"
  >
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
          icon_size: 0.8,
        };
      else if (this.btn_type === "fullscreen-exit")
        return {
          label: this.$t("exit_fullscreen"),
          icon: "fullscreen-exit",
          icon_size: 0.8,
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
          icon: "check",
          icon_size: 1.5,
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
        icon: "pencil-fill",
        icon_size: 0.8,
      };
    },
    btn_styles() {
      if (this.style_type === "black")
        return `
          --color-icon: white;
        `;

      if (
        this.btn_type === "fullscreen" ||
        this.btn_type === "close" ||
        this.btn_type === "show" ||
        this.btn_type === "hide"
      )
        return `
          --color-icon: var(--c-noir);
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
        `;
      else if (this.btn_type === "remove")
        return `
          --color-icon: var(--c-rouge);
        `;

      if (this.btn_type === "fullscreen-exit")
        return `
          --color-icon: white;
        `;
      return ``;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._editBtn {
  // position: relative;
  // border: none;
  // color: var(--color-icon);

  ._icon {
    // position: relative;
  }

  &.is--spinning {
    ._icon {
      animation: spin 1s linear infinite;
    }
  }
}
</style>
