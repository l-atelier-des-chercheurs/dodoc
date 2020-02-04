<template>
  <div class="m_selector">
    <div class="m_selector--content">
      <div v-if="selected_medias.length > 0">
        {{ selected_medias.length }} medias selected
      </div>

      <button type="button" class="buttonLink" @click="$emit('deselect')">
        Deselect
      </button>
      <button type="button" class="buttonLink" @click="confirmRemoveSelection">
        Remove selection
      </button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    selected_medias: Array
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    confirmRemoveSelection() {
      this.$alertify
        .okBtn(this.$t("yes"))
        .cancelBtn(this.$t("cancel"))
        .confirm(
          this.$t("sureToRemoveSelection"),
          () => {
            this.$emit("removeSelection");
          },
          () => {}
        );
    }
  }
};
</script>
<style lang="scss" scoped>
.m_selector {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  pointer-events: none;
  z-index: 100;

  > .m_selector--content {
    background-color: var(--c-noir);
    color: white;
    max-width: 220px;
    margin: 0 auto 20px;
    padding: 0.5em 1em;
    border-radius: 2px;
    text-align: center;

    pointer-events: auto;
  }
}

button {
  color: inherit !important;
}
</style>
