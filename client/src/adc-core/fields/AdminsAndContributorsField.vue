<template>
  <div>
    <!-- <template v-for="author_type of ['contributors', 'admins']">
      {{ author_type }}
    </template> -->

    <div v-for="author_section of show_section" :key="author_section">
      <DLabel :str="$t(author_section)" />
      <div class="_listOfAvatars">
        <template
          v-if="
            Array.isArray(getCorrespondingPaths(author_section)) &&
            getCorrespondingPaths(author_section).length > 0
          "
        >
          <AuthorTag
            v-for="atpath in getCorrespondingPaths(author_section)"
            :path="atpath"
            :key="atpath"
            :edit_mode="false"
            :links_to_author_page="true"
            :show_image_only="false"
          />
        </template>
        <div
          v-else-if="getCorrespondingPaths(author_section) === 'everyone'"
          :key="'everyone'"
        >
          {{ $t("everyone_can_contribute") }}
        </div>
        <div v-else :key="'none'">
          {{ $t("none") }}
        </div>
      </div>
    </div>

    <EditBtn v-if="can_edit" @click="edit_mode = true" />

    <EditAdminsAndContributorsField
      v-if="edit_mode"
      :folder_path="folder.$path"
      :admins_path="admins_path"
      :contributors_path="contributors_path"
      :admin_instructions="admin_instructions"
      :contrib_instructions="contrib_instructions"
      @closeModal="edit_mode = false"
    />

    <!-- <AuthorField
      :label="$t('admins')"
      :field="'$admins'"
      :authors_paths="folder.$admins"
      :path="folder.$path"
      :can_edit="can_edit"
      :instructions="admin_instructions"
    />
    <AuthorField
      :label="$t('contributors')"
      :field="'$contributors'"
      :authors_paths="folder.$contributors"
      :path="folder.$path"
      :can_edit="can_edit"
      :instructions="contrib_instructions"
    /> -->
  </div>
</template>
<script>
export default {
  props: {
    folder: Object,
    can_edit: Boolean,
    admin_instructions: String,
    contrib_instructions: String,
    show_section: {
      type: Array,
      default: () => ["admins", "contributors"],
    },
  },
  components: {},
  data() {
    return {
      edit_mode: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    // all_participants_path() {
    //   let p = [];
    //   if (Array.isArray(this.admins_path)) p = p.concat(this.admins_path);
    //   if (Array.isArray(this.contributors_path))
    //     p = p.concat(this.contributors_path);
    //   p = [...new Set(p)];
    //   return p;
    // },
    admins_path() {
      return this.folder.$admins;
    },
    contributors_path() {
      return this.folder.$contributors;
    },
  },
  methods: {
    closeModal() {
      this.edit_mode = false;
    },
    getCorrespondingPaths(author_section) {
      if (author_section === "contributors") return this.contributors_path;
      if (author_section === "admins") return this.admins_path;
    },
  },
};
</script>
<style lang="scss" scoped>
._listOfAvatars {
  display: flex;
  flex-flow: row wrap;
  align-items: flex-end;
  gap: calc(var(--spacing) / 4);
}
</style>
