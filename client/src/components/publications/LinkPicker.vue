<template>
  <BaseModal2 @close="$emit('close')">
    <div class="_linkPicker">
      <div class="_urlBox">
        <DLabel :str="$t('input_url')" :instructions="$t('input_url_instr')" />
        <input type="url" v-model="full_url" placeholder="https://" />
      </div>

      <IframePreview class="_iframePreview" :full_url="full_url" />

      <div class="_selectBtn" v-if="full_url">
        <button type="button" class="u-buttonLink" @click="$emit('close')">
          {{ $t("cancel") }}
        </button>
        <button
          type="button"
          class="u-button u-button_bleuvert"
          @click="$emit('embed', full_url)"
        >
          {{ $t("embed") }}
        </button>
      </div>
    </div>
  </BaseModal2>
</template>
<script>
export default {
  props: {
    publication_path: String,
  },
  components: {},
  data() {
    return {
      full_url: "https://",
    };
  },
  async created() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._linkPicker {
  width: 100%;
  // background: var(--c-gris_clair);
  margin: 0 auto;
}
._urlBox {
  margin-bottom: calc(var(--spacing) * 1);
}

._addMediaBtn {
  text-align: center;
  padding: calc(var(--spacing) * 1);
}

._selectBtn {
  display: flex;
  place-items: center;
  justify-content: center;
  width: 100%;
  gap: calc(var(--spacing) / 1);

  background: white;
}
</style>
