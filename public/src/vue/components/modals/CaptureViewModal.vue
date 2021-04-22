<template>
  <Modal
    @close="$emit('close')"
    :read_only="read_only"
    :typeOfModal="'LargeAndNoScroll'"
    :askBeforeClosingModal="askBeforeClosingModal"
    :is_loading="is_sending_content_to_server"
  >
    <template slot="header">
      <span class>{{ $t("capture") }}</span>
    </template>

    <template slot="preview">
      <CaptureView
        :slugFolderName="slugFolderName"
        :type="type"
        :read_only="read_only"
        :can_add_to_fav="false"
        :available_modes="available_modes"
        :return_temp_media="return_temp_media"
        @insertMedias="(metaFileNames) => $emit('insertMedias', metaFileNames)"
        @tempMedia="$emit(tempMedia, $event)"
      />
    </template>
  </Modal>
</template>
<script>
import CaptureView from "../capture/CaptureView.vue";

export default {
  props: {
    slugFolderName: String,
    type: String,
    read_only: Boolean,
    available_modes: Array,
    return_temp_media: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    CaptureView,
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
