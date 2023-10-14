<template>
  <div class="_storySectionTemplate">
    <SectionsList
      :publication="publication"
      :opened_section_meta_filename="opened_section_meta_filename"
      :can_edit="can_edit"
      @toggleSection="$emit('toggleSection', $event)"
    />
  </div>
</template>
<script>
import SectionsList from "@/components/publications/story/SectionsList.vue";

export default {
  props: {
    publication: Object,
    opened_section_meta_filename: String,
    can_edit: Boolean,
  },
  components: {
    SectionsList,
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
._storySectionTemplate {
  position: relative;
}
</style>
