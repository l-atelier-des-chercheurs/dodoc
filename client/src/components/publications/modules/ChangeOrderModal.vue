<template>
  <BaseModal2 :title="$t('change_order')" @close="$emit('close')">
    <FilesList
      :mode="'carousel'"
      :medias_with_linked="medias_with_linked"
      :publication_path="publication_path"
      :edit_mode="true"
      @addMedias="$emit('addMedias', $event)"
      @reorderMedias="$emit('reorderMedias', $event)"
      @removeMediaAtIndex="$emit('removeMediaAtIndex', $event)"
    />
    <div slot="footer" class="_actions">
      <button
        type="button"
        class="u-button u-button_bleuvert"
        @click="$emit('close')"
      >
        {{ $t("submit") }}
      </button>
    </div>
  </BaseModal2>
</template>
<script>
import FilesList from "@/components/publications/modules/FilesList.vue";

export default {
  props: {
    medias_with_linked: Array,
    publication_path: String,
  },
  components: {
    FilesList,
  },
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
<style lang="scss" scoped></style>
