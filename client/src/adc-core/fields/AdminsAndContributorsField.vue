<template>
  <div class="_adminsAndContributorsField">
    <!-- <template v-for="author_type of ['contributors', 'admins']">
      {{ author_type }}
    </template> -->
    <div class="">
      <DLabel
        v-if="show_labels"
        :str="custom_label ? custom_label : $t('admins_and_contributors')"
      />
      <!-- :instructions="$t('admins_and_contributors_instr')" -->
      <transition-group
        tag="div"
        class="u-listOfAvatars"
        v-if="all_participants_path.length > 0"
        name="listComplete"
      >
        <AuthorTag
          v-for="atpath in subset_participants_path"
          :path="atpath"
          :key="atpath"
          :show_image_only="true"
          :mode="'link'"
        />
        <button
          type="button"
          class="u-button u-button_icon _unshortenListBtn"
          v-if="all_participants_path.length > 10"
          :key="'shorten_list'"
          @click="shorten_list = !shorten_list"
        >
          <transition name="fade_fast" mode="out-in">
            <div key="plus" v-if="shorten_list">
              +
              {{
                all_participants_path.length - subset_participants_path.length
              }}
            </div>
            <b-icon v-else key="minus" icon="dash" />
          </transition>
        </button>
      </transition-group>

      <div class="u-instructions">
        <div v-if="admins_path === 'everyone'">
          {{ $t("everyone_can_edit") }}
        </div>
        <div v-else-if="contributors_path === 'everyone'">
          {{ $t("everyone_can_contribute") }}
        </div>
      </div>
      <div class="">
        <button type="button" class="u-buttonLink" @click="show_modal = true">
          {{ $t("more_informations") }}
        </button>
      </div>
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
  </div>
</template>
<script>
export default {
  props: {
    folder: Object,
    can_edit: Boolean,
    custom_label: String,
    admin_label: String,
    admin_instructions: String,
    contrib_instructions: String,
    show_labels: {
      type: Boolean,
      default: true,
    },
  },
  components: {},
  data() {
    return {
      edit_mode: false,
      show_modal: false,
      shorten_list: true,
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
      // p = p.concat(p).concat(p);
      // p = p.concat(p).concat(p);
      return p;
    },
    subset_participants_path() {
      if (this.all_participants_path.length > 10 && this.shorten_list)
        return this.all_participants_path.slice(0, 10);
      return this.all_participants_path;
    },
    admins_path() {
      if (this.folder.$admins) return this.folder.$admins;
      return "noone";
    },
    contributors_path() {
      if (this.folder.$contributors) return this.folder.$contributors;
      return "noone";
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

._floatingTopRight {
  position: absolute !important;
  top: 0;
  right: 0;
}

.u-listOfAvatars {
  gap: 0;
}

._unshortenListBtn {
  min-width: 30px;
  height: 30px;
  border: 2px solid var(--c-gris);
  border-radius: 15px;
}
</style>
