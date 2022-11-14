<template>
  <div>
    <div class="_topLabel" v-if="label">
      <label for="" class="u-label">{{ label }}</label>
    </div>

    <div class="_authors">
      <template v-for="author_slug in new_authors_slugs">
        <AuthorTag
          :slug="author_slug"
          :key="author_slug"
          :edit_mode="edit_mode"
          @remove="removeAuthor(author_slug)"
        />
      </template>
      <!-- <sl-button
        v-if="edit_mode && add_new_author === false"
        variant="default"
        class=""
        size="small"
        pill
        @click="add_new_author = true"
      >
        <sl-icon name="plus-square" :label="$t('add')" />

      </sl-button> -->

      <template v-if="can_edit">
        <EditBtn v-if="!edit_mode" @click="enableEditMode" />
      </template>
    </div>

    <div class="_footer" v-if="edit_mode">
      <!-- <TextInput
          :content.sync="new_tag_name"
          :maxlength="maxlength"
          :required="true"
          @toggleValidity="($event) => (allow_save_newkeyword = $event)"
          @onEnter="onEnter"
        /> -->

      <div class="u-wips" />

      <div class="_topLabel">
        <label for="" class="u-label">{{ $t("add_authors") }}</label>
      </div>
      <AuthorPicker
        :current_authors="new_authors_slugs"
        @addAuthor="addAuthor"
      />

      <div>
        <SaveCancelButtons
          class="_scb"
          :is_saving="is_saving"
          :allow_save="allow_save"
          @save="updateAuthors"
          @cancel="cancel"
        />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    label: {
      type: String,
      default: "",
    },
    authors_slugs: {
      type: Array,
      default: () => [],
    },
    path: String,
    can_edit: {
      type: Boolean,
    },
  },
  components: {},
  data() {
    return {
      edit_mode: false,
      is_saving: false,
      new_authors_slugs: JSON.parse(JSON.stringify(this.authors_slugs)),
      // new_authors_slugs: ["pauline", "louis"],
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    authors_slugs() {
      this.new_authors_slugs = JSON.parse(JSON.stringify(this.authors_slugs));
    },
  },
  computed: {
    allow_save() {
      debugger;
      return (
        JSON.stringify(this.new_authors_slugs) !==
        JSON.stringify(this.authors_slugs)
      );
    },
    // authors_list() {
    // return [
    //   {
    //     name: "Louis",
    //     slug: "louis",
    //     image:
    //       "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    //   },
    //   {
    //     name: "Pauline",
    //     slug: "pauline",
    //     image:
    //       "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&crop=left&q=80",
    //   },
    //   {
    //     name: "Sarah",
    //     slug: "sarah",
    //     image:
    //       "https://images.unsplash.com/photo-1490150028299-bf57d78394e0?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80&crop=right",
    //   },
    // ];
    // },
  },
  methods: {
    enableEditMode() {
      this.edit_mode = true;
    },
    addAuthor(slug) {
      this.new_authors_slugs.push(slug);
    },
    removeAuthor(slug) {
      this.new_authors_slugs = this.new_authors_slugs.filter((a) => a !== slug);
    },
    cancel() {
      this.edit_mode = false;
      this.is_saving = false;
      this.new_authors_slugs = JSON.parse(JSON.stringify(this.authors_slugs));

      this.$nextTick(() => {
        // this.content = "";
        // this.$nextTick(() => {
        // this.content = this.new_authors_slugs;
        // });
      });

      // todo interrupt updateMeta
    },
    async updateAuthors() {
      this.is_saving = true;
      await new Promise((r) => setTimeout(r, 50));

      try {
        const new_meta = {
          $authors: this.new_authors_slugs,
        };

        await this.$api.updateMeta({
          path: this.path,
          new_meta,
        });

        this.edit_mode = false;
        this.is_saving = false;
      } catch (e) {
        this.is_saving = false;

        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.couldntbesaved"));
        this.$alertify.closeLogOnClick(true).error(e.response.data);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._authors {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 4);
}

._footer {
  margin-top: calc(var(--spacing) / 4);
}
</style>
