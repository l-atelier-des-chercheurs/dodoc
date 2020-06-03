<template>
  <Modal
    @close="$emit('close')"
    @submit="editThisChat"
    :read_only="read_only"
    :typeOfModal="'LargeAndNoScroll'"
    :askBeforeClosingModal="askBeforeClosingModal"
    :is_loading="is_sending_content_to_server"
  >
    <template slot="header">
      <span class>{{ $t("edit_a_chat") }}</span>
    </template>

    <template slot="preview">
      <CaptureView
        :slugFolderName="slugFolderName"
        :type="type"
        :read_only="read_only"
        :can_add_to_fav="false"
        :available_modes="available_modes"
        @insertMedias="
            (metaFileNames) => $emit('insertMedias', metaFileNames)
          "
      />
    </template>
  </Modal>
</template>
<script>
import Modal from "./BaseModal.vue";
import CaptureView from "../../CaptureView.vue";

export default {
  props: {
    slugFolderName: String,
    type: String,
    read_only: Boolean,
    available_modes: Array,
  },
  components: {
    Modal,
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
<style lang="scss" scoped>
</style>

