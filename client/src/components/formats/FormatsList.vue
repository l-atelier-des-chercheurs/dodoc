<template>
  <div class="_formatsList">
    <div class="u-spacingBottom u-instructions">
      {{ $t("format_instr") }}
    </div>
    <div class="u-spacingBottom">
      <button
        type="button"
        class="u-button u-button_white"
        @click="show_create_format = true"
      >
        <b-icon icon="plus-circle" />&nbsp;
        {{ $t("create_a_format") }}
      </button>
      <CreateFolder
        v-if="show_create_format"
        :modal_name="$t('create_a_format')"
        :path="'formats'"
        :default_folder_status="'private'"
        @close="show_create_format = false"
        @openNew="openNewFormat"
      />
    </div>

    <table class="_list">
      <!-- <thead>
    <tr>
      <th colspan="2">The table header</th>
    </tr>
  </thead> -->
      <tbody>
        <tr v-for="format in sorted_formats" :key="format.$path">
          <td>
            <h3>{{ format.title }}</h3>
          </td>
          <td>
            <AuthorTag
              v-for="atpath in format.$admins"
              :key="atpath"
              :path="atpath"
              :mode="'link'"
            />
          </td>
          <td>
            <button
              type="button"
              class="u-button u-button_black"
              @click="$emit('toggleFormat', getFilename(format.$path))"
            >
              {{ $t("open") }}
              <!-- <AdminsAndContributorsField :folder="format" :can_edit="can_edit" /> -->
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <!-- </BaseModal2> -->
</template>
<script>
export default {
  props: {
    shared_folder: Object,
  },
  components: {},
  data() {
    return {
      show_create_format: false,
      formats: [],
      path: "formats",
    };
  },
  i18n: {
    messages: {
      fr: {
        formats: "Formats",
        create_a_format: "Créer un format",
        format_instr:
          "Les formats regroupent des médias dans l’espace partagé pour les partager.",
      },
    },
  },
  async created() {
    this.formats = await this.$api.getFolders({
      path: this.path,
    });
    this.$api.join({ room: this.path });
  },
  mounted() {},
  beforeDestroy() {
    this.$api.leave({ room: this.path });
  },
  watch: {},
  computed: {
    can_edit() {
      return this.canLoggedinEditFolder({ folder: this.stack });
    },
    sorted_formats() {
      return this.formats.slice().sort((a, b) => {
        return a.title.localeCompare(b.title);
      });
    },
  },
  methods: {
    openNewFormat(new_folder_slug) {
      this.show_create_format = false;
      this.$emit("toggleFormat", new_folder_slug);
    },
  },
};
</script>
<style lang="scss" scoped>
._formatsList {
  > * {
  }
}
._list {
  width: 100%;

  tr:nth-child(2n) {
    // background-color: var(--c-gris);
  }
  tr:nth-child(2n + 1) {
    // background-color: var(--c-gris_clair);
  }
  tr > td:last-child {
    text-align: right;
  }
}
</style>
