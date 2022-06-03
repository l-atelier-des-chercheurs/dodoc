<template>
  <div>
    <input type="file" multiple @change="updateInputFiles($event)" />

    <UploadFiles
      v-if="selected_files.length > 0"
      :selected_files="selected_files"
      :folder_type="folder_type"
      :folder_slug="folder_slug"
    />
  </div>
</template>
<script>
import UploadFiles from "@/components/fields/UploadFiles";

export default {
  props: {
    folder_type: String,
    folder_slug: String,
  },
  components: { UploadFiles },
  data() {
    return {
      selected_files: [],
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    updateInputFiles($event) {
      this.selected_files = Array.from($event.target.files);
      $event.target.value = "";
    },
  },
};
</script>
<style lang="scss" scoped></style>
