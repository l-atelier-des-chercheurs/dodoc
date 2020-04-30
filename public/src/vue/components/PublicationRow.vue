<template>
  <tr @click.exact="openPublication">
    <td>
      {{ publication.name }}
      <ProtectedLock
        :editing_limited_to="publication.editing_limited_to"
        :is_protected="!can_edit_publi"
      />
    </td>
    <td width="150px">
      <small>
        {{ $root.formatDateToHuman(publication.date_created) }}
      </small>
    </td>
    <td class="font-folder_title">
      <template v-if="attached_project">
        {{ attached_project.name }}
      </template>
      <template v-else>
        —
      </template>
    </td>
    <td>
      <AccessController
        :folder="publication"
        :context="'short'"
        :type="'publications'"
        @openFolder="openPublication"
      />
      <button
        v-if="can_see_publi"
        type="button"
        class="m_project--presentation--buttons--openButton button-redthin"
        @click.exact="openPublication"
      >
        <span class>{{ $t("open") }}</span>
      </button>
    </td>
  </tr>
</template>
<script>
import AccessController from "./subcomponents/AccessController.vue";
import ProtectedLock from "./subcomponents/ProtectedLock.vue";

export default {
  props: {
    publication: Object,
  },
  components: { AccessController, ProtectedLock },
  data() {
    return {
      show_input_pwd: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    show_input_pwd() {
      if (this.show_input_pwd) {
        this.$nextTick(() => {
          if (!!this.$refs.passwordField) this.$refs.passwordField.focus();
        });
      }
    },
  },
  computed: {
    attached_project() {
      return Object.values(this.$root.store.projects).find(
        (_p) => _p.slugFolderName === this.publication.attached_to_project
      );
    },
    slugPubliName() {
      return this.publication.slugFolderName;
    },
    can_edit_publi() {
      return this.$root.canEditFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
      });
    },
    can_see_publi() {
      return this.$root.canSeeFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
      });
    },
  },
  methods: {
    openPublication(slugPubliName) {
      if (this.$root.state.dev_mode === "debug")
        console.log(
          `METHODS • Publication: openPublication / slugPubliName = ${slugPubliName}`
        );

      if (this.can_see_publi) this.$root.openPublication(this.slugPubliName);
    },
    publi_password() {
      if (this.password !== "has_pass") return "";

      return this.$root.getFolderPassword({
        type: "publications",
        slugFolderName: this.slugPubliName,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.font-folder_title {
  font-size: 70%;
}
</style>
