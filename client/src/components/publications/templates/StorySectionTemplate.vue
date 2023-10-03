<template>
  <div>
    <SectionedPublication
      :template="publication.template"
      :publication="publication"
      :section_opened_meta="section_opened_meta"
      :can_edit="can_edit"
      @toggleSection="$emit('toggleSection', $event)"
    />
  </div>
</template>
<script>
import SectionedPublication from "@/components/publications/logic/SectionedPublication.vue";

export default {
  props: {
    publication: Object,
    section_opened_meta: String,
    can_edit: Boolean,
  },
  components: {
    SectionedPublication,
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
._switch {
  margin: calc(var(--spacing) * 1) 0;
}
</style>
