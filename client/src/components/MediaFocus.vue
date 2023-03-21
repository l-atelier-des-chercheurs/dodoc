<template>
  <div class="_mediaFocus">
    Document à compléter
    <template v-if="files.length > 1">
      {{ files.length }} documents à compléter dans cette pile
    </template>
    <sl-button
      class="_closeBtn"
      variant="default"
      size="medium"
      circle
      @click="$emit('close')"
    >
      <sl-icon name="x-lg" :label="$t('close')"></sl-icon>
    </sl-button>

    <div class="_itemsList">
      <div class="" v-for="file in files" :key="file.$path">
        <MediaContent class="" :file="file" :context="'preview'" />
        <input type="text" />
      </div>
    </div>

    <TitleField
      :field_name="'title'"
      class="_title"
      :content="files[0].$media_filename"
      :required="true"
      :maxlength="40"
      :can_edit="true"
    />
  </div>
</template>
<script>
export default {
  props: {
    files: Array,
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
  methods: {},
};
</script>
<style lang="scss" scoped>
._mediaFocus {
  margin: 2px;
  background: hsl(0, 0%, 100%);
  box-shadow: 0 0px 5px rgb(0 0 0 / 6%);
  border: 2px solid white;
  border-radius: 5px;
  padding: calc(var(--spacing) / 2);
}
._itemsList {
  background: #eee;
  padding: calc(var(--spacing) / 2);
}
._closeBtn {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
