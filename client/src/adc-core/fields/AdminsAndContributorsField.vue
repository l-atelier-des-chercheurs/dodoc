<template>
  <div class="_adminsAndContributorsField">
    <!-- <template v-for="author_type of ['contributors', 'admins']">
      {{ author_type }}
    </template> -->
    <div class="">
      <DLabel
        v-if="show_label"
        :str="custom_label ? custom_label : $t('admins_and_contributors')"
        @toggleInstructions="show_modal = true"
      />
      <!-- :instructions="$t('admins_and_contributors_instr')" -->
      <div class="u-listOfAvatars">
        <AuthorTag
          v-for="atpath in subset_participants_path"
          :path="atpath"
          :key="atpath"
          :show_image_only="true"
          :mode="'link'"
        />
        <button
          type="button"
          class="u-button u-button_white _unshortenListBtn"
          v-if="all_participants_path.length > 10"
          :key="'shorten_list'"
          @click="shorten_list = !shorten_list"
        >
          <template v-if="shorten_list">
            <b-icon icon="plus" />{{
              all_participants_path.length - subset_participants_path.length
            }}
          </template>
          <b-icon v-else key="minus" icon="dash" />
        </button>
        <div class="u-instructions _indicators" key="instructions">
          <template v-if="admins_path === 'everyone'">
            {{ $t("everyone_can_edit") }}
          </template>
          <template v-else-if="contributors_path === 'everyone'">
            {{ $t("everyone_can_contribute") }}
          </template>
          <template
            v-else-if="admins_path === 'noone' && contributors_path === 'noone'"
          >
            {{ $t("noone") }}
          </template>
        </div>
        <div class="" key="more_informations">
          <!-- <button
            type="button"
            class="u-button u-button_icon"
            v-if="!can_edit"
            @click="show_modal = true"
          >
            {{ $t("more_informations") }}
          </button> -->
          <EditBtn v-if="can_edit" class="_edit" @click="show_modal = true" />
        </div>
      </div>
    </div>

    <EditAdminsAndContributorsField
      v-if="show_modal"
      :modal_title="custom_label ? custom_label : $t('admins_and_contributors')"
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
    show_label: {
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

      // if currently connected user is in the list, move it to first position
      if (this.connected_as?.$path && p.includes(this.connected_as?.$path)) {
        p = p.filter((p) => p !== this.connected_as?.$path);
        p.unshift(this.connected_as?.$path);
      }

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
      if (this.folder.$admins && this.folder.$admins.length > 0)
        return this.folder.$admins;
      return "noone";
    },
    contributors_path() {
      if (this.folder.$contributors && this.folder.$contributors.length > 0)
        return this.folder.$contributors;
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
  // display: inline-flex;
  // gap: 0;
}

._unshortenListBtn {
  min-width: 25px;
  height: 25px;
  // border: 1px solid white;
  // background: rgba(0, 0, 0, 0.1);
  border-radius: 15px;
  padding: calc(var(--spacing) / 2);
  // font-weight: 400;
  font-size: var(--sl-font-size-small);
}

._indicators {
  // padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
}

._edit {
  /* Hide edit button by default on devices that support hover */
  @media (hover: hover) {
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  /* Always show on touch devices */
  @media (hover: none) {
    opacity: 1;
  }
}

/* Show edit button on hover for devices that support hover */
._adminsAndContributorsField:hover ._edit {
  @media (hover: hover) {
    opacity: 1;
  }
}
</style>
