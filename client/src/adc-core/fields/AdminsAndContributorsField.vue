<template>
  <div class="_adminsAndContributorsField">
    <!-- <template v-for="author_type of ['contributors', 'admins']">
      {{ author_type }}
    </template> -->
    <div class="">
      <DLabel :str="$t('admins_and_contributors')" />
      <!-- :instructions="$t('admins_and_contributors_instr')" -->

      <div class="_listOfAvatars">
        <AuthorTag
          v-for="atpath in all_participants_path"
          :path="atpath"
          :key="atpath"
          :edit_mode="false"
          :links_to_author_page="true"
          :show_image_only="false"
        />
      </div>
      <button type="button" class="u-buttonLink" @click="show_modal = true">
        {{ $t("more_informations") }}
      </button>
    </div>

    <EditAdminsAndContributorsField
      v-if="show_modal"
      :folder="folder"
      :admins_path="admins_path"
      :contributors_path="contributors_path"
      :admin_label="admin_label"
      :admin_instructions="admin_instructions"
      :contrib_instructions="contrib_instructions"
      :can_edit="can_edit"
      @closeModal="show_modal = false"
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
    admin_label: String,
    admin_instructions: String,
    contrib_instructions: String,
  },
  components: {},
  data() {
    return {
      edit_mode: false,
      show_modal: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    all_participants_path() {
      let p = [];
      if (Array.isArray(this.admins_path)) p = p.concat(this.admins_path);
      if (Array.isArray(this.contributors_path))
        p = p.concat(this.contributors_path);
      p = [...new Set(p)];
      return p;
    },
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
  },
};
</script>
<style lang="scss" scoped>
._adminsAndContributorsField {
  > ._lists {
    position: relative;
    // border: 2px solid var(--c-gris);
    display: flex;
    flex-flow: row wrap;
    // padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
    gap: calc(var(--spacing) / 2);

    > * {
      flex: 1 1 200px;
    }
  }
}
._listOfAvatars {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 4);
}

._floatingTopRight {
  position: absolute !important;
  top: 0;
  right: 0;
}
</style>
