<template>
  <div>
    <SharedFolder2
      :shared_folder_path="shared_folder_path"
      @changeCorpus="changeCorpus"
    />
  </div>
</template>
<script>
import SharedFolder2 from "@/components/archive/SharedFolder2.vue";
export default {
  props: {},
  components: {
    SharedFolder2,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    shared_folder_path() {
      if (this.$route.params.folder_slug) {
        return "folders/" + this.$route.params.folder_slug;
      } else {
        return "";
      }
    },
  },
  methods: {
    changeCorpus(path) {
      const slug = path.split("/").pop();
      this.$router.push(`/explore/${slug}`);
    },
  },
};
</script>
<style lang="scss" scoped></style>
