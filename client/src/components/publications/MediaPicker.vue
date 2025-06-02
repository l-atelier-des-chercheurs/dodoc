<template>
  <div class="_mediaPicker">
    <PickExistingMediastackModal
      :modal_title="$t('pick_medias')"
      :select_mode="select_mode"
      @close="$emit('close')"
      @mediasSelected="mediasSelected"
    />
  </div>
</template>
<script>
import PickExistingMediastackModal from "@/components/PickExistingMediastackModal.vue";

export default {
  props: {
    publication_path: String,
    select_mode: {
      type: String,
      default: "multiple",
    },
    pick_from_types: [String, Array],
  },
  components: {
    PickExistingMediastackModal,
  },
  data() {
    return {};
  },
  async created() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    mediasSelected(medias) {
      this.$emit("pickMedias", medias);
      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped>
._mediaPicker {
  position: absolute;
}
</style>
