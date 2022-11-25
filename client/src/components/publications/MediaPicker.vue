<template>
  <div class="_mediaPicker">
    <div>
      <sl-button
        variant="edit"
        class="editBtn"
        size="small"
        pill
        v-if="!show_media_picker"
        @click="show_media_picker = true"
      >
        <sl-icon name="plus-circle-fill" :label="$t('edit')" />
        {{ $t("add_media") }}
      </sl-button>
      <sl-button
        size="small"
        variant="default"
        pill
        v-else
        @click="show_media_picker = false"
      >
        <sl-icon name="x-circle" />
        {{ $t("back") }}
      </sl-button>
    </div>

    <template v-if="show_media_picker">
      <!-- OPTIONS -->
      <!-- create a text -->
      <!-- <button type="button" @click="createText">
        {{ $t("create_text") }}
      </button> -->
      <!-- select from this or another project library -->
      <PickMediaFromProjects
        :publication_path="publication_path"
        @selectMedia="$emit('selectMedia', $event)"
        @close="show_media_picker = false"
      />
    </template>
  </div>
</template>
<script>
import PickMediaFromProjects from "@/components/publications/PickMediaFromProjects.vue";

export default {
  props: {
    publication_path: String,
  },
  components: {
    PickMediaFromProjects,
  },
  data() {
    return {
      show_media_picker: false,
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
._mediaPicker {
  width: 100%;
  background: var(--c-gris_clair);
  margin: 0 auto;
}
</style>
