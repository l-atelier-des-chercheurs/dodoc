<template>
  <div class="_spacePresentation">
    <div class="_coverField">
      <!-- <img
        src="https://latelier-des-chercheurs.fr/thumbs/ateliers/chepa-le-journal-pour-tou-te-s/cover-1280x800-q60.jpg"
      /> -->
    </div>
    <div class="_titleField">
      <TitleField
        :field_name="'title'"
        class="_title"
        :label="$t('title')"
        :tag="'h1'"
        :content="space.title"
        :path="space.$path"
        :maxlength="280"
        :can_edit="can_edit"
        :instructions="$t('project_title_instructions')"
      />
    </div>
    <div class="_descriptionField">
      <TitleField
        :field_name="'description'"
        class="_description"
        :label="$t('description')"
        :content="space.description"
        :path="space.$path"
        :maxlength="480"
        :can_edit="can_edit"
        :instructions="$t('project_description_instructions')"
      />
      <RemoveMenu
        v-if="can_edit"
        :remove_text="$t('remove_space')"
        @remove="removeSpace"
      />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    space: Object,
    can_edit: Boolean,
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async removeSpace() {
      this.fetch_status = "pending";
      this.fetch_error = null;

      try {
        const response = await this.$api.deleteItem({
          path: this.space.$path,
        });
        this.response = response.data;
        this.fetch_status = "success";
      } catch (e) {
        this.fetch_status = "error";
        this.fetch_error = e.response.data;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._spacePresentation {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  border: 2px solid white;
  background: white;
  gap: calc(var(--spacing) / 1);

  > * {
    flex: 1 1 33%;
  }
}
._titleField {
}
._descriptionField {
}
</style>
