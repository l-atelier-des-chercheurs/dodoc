<template>
  <div class="_pageTemplate">
    <RadioSwitch
      v-if="can_edit"
      :content.sync="current_view"
      :options="[
        {
          label: $t('settings'),
          value: 'settings',
        },
        {
          label: $t('pages'),
          value: 'pages',
        },
      ]"
    />

    <br />

    <PageSettings
      v-if="current_view === 'settings' && can_edit"
      :publication="publication"
    />
    <PagesList v-else :publication="publication" />
  </div>
</template>
<script>
import PageSettings from "@/components/publications/page_by_page/PageSettings.vue";
import PagesList from "@/components/publications/page_by_page/PagesList.vue";

export default {
  props: {
    publication: Object,
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
<style lang="scss" scoped></style>
