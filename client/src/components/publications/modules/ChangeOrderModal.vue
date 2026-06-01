<template>
  <BaseModal2 :title="$t('change_order')" @close="$emit('close')">
    <FilesList
      :mode="'carousel'"
      :medias_with_linked="medias_with_linked"
      :publication_path="publication_path"
      :edit_mode="true"
      @pickMedias="$emit('pickMedias', $event)"
      @reorderMedias="$emit('reorderMedias', $event)"
      @removeMediaAtIndex="$emit('removeMediaAtIndex', $event)"
    />

    <template #footer>
      <div />
      <button type="button" class="u-button" @click="$emit('close')">
        <b-icon icon="x" />
        {{ $t("close") }}
      </button>
    </template>
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
