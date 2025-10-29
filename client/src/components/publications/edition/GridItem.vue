<template>
  <div class="_gridItem">
    <div class="_gridItem--header">{{ area.id }}</div>
    <div class="_gridItem--content">
      <button
        v-if="!area_text_meta"
        type="button"
        class="u-button u-button_bleuvert"
        @click="$emit('createText', area.id)"
      >
        {{ $t("add_text") }}
      </button>
      <div v-else>
        <CollaborativeEditor3
          :content="area_text_meta.$content"
          :path="area_text_meta.$path"
          :custom_formats="[]"
          :save_format="'raw'"
          :content_type="'markdown'"
          :can_edit="true"
          :mode="'always_active'"
          ref="collaborativeEditor"
        >
          <template #custom_buttons>
            <button
              type="button"
              class="u-button u-button_bleumarine _customBtn"
              @click="show_media_picker = !show_media_picker"
            >
              {{ $t("import_medias") }}
            </button>
          </template>
        </CollaborativeEditor3>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    area: {
      type: Object,
      required: true,
    },
    area_text_meta: {
      type: Object,
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
  computed: {},
  methods: {},
};
</script>

<style lang="scss" scoped>
._gridItem {
  border: 1px solid var(--c-gris);
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  border-radius: var(--input-border-radius);
}

._gridItem--header {
  font-weight: bold;
  margin-bottom: calc(var(--spacing) * 1);
}

._gridItem--content {
}
</style>
