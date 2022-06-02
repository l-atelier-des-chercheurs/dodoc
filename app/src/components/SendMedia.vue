<template>
  <div>
    <input type="file" multiple @change="updateInputFiles($event)" />
    <UploadFiles :selected_files="selected_files" />
  </div>
</template>
<script>
import UploadFiles from "@/components/fields/UploadFiles";

export default {
  props: {},
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
