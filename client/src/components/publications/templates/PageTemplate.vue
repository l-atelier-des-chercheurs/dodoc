<template>
  <div class="_pageTemplate">
    <PagesList
      :publication="publication"
      :page_opened_id="page_opened_id"
      :can_edit="can_edit"
      @togglePage="$emit('togglePage', $event)"
    />
    <PublicationSettings v-if="can_edit">
      <PageSettings :publication="publication" />
    </PublicationSettings>
  </div>
</template>
<script>
import PublicationSettings from "@/components/publications/PublicationSettings.vue";
import PageSettings from "@/components/publications/page_by_page/PageSettings.vue";
import PagesList from "@/components/publications/page_by_page/PagesList.vue";

export default {
  props: {
    publication: Object,
    page_opened_id: String,
    can_edit: Boolean,
  },
  components: {
    PublicationSettings,
    PageSettings,
    PagesList,
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
._pageTemplate {
  position: relative;
  background: var(--c-gris_clair);
}
</style>
