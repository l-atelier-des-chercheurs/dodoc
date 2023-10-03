<template>
  <div class="_pageTemplate">
    <RadioSwitch
      v-if="can_edit"
      class="_switch"
      :content.sync="current_view"
      :options="[
        {
          label: $t('settings'),
          value: 'settings',
        },
        {
          label:
            publication.page_spreads === true
              ? $t('list_of_spreads')
              : $t('list_of_pages'),
          value: 'pages',
        },
      ]"
    />

    <PageSettings
      v-if="current_view === 'settings' && can_edit"
      :publication="publication"
    />
    <PagesList
      v-else
      :publication="publication"
      :page_opened_id="page_opened_id"
      :can_edit="can_edit"
      @togglePage="$emit('togglePage', $event)"
    />
  </div>
</template>
<script>
import PageSettings from "@/components/publications/page_by_page/PageSettings.vue";
import PagesList from "@/components/publications/page_by_page/PagesList.vue";

export default {
  props: {
    publication: Object,
    page_opened_id: String,
    can_edit: Boolean,
  },
  components: {
    PageSettings,
    PagesList,
  },
  data() {
    return {
      current_view: "pages",
    };
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
