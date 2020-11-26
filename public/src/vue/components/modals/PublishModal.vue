<template>
  <Modal
    @close="$emit('close')"
    :read_only="read_only"
    :typeOfModal="'SmallAndScroll'"
    :is_loading="is_sending_content_to_server"
  >
    <template slot="header">
      <div class>{{ $t("finalize_story") }}</div>
    </template>

    <template slot="sidebar">
      <div class="margin-bottom-small">
        Une fois validé, votre document ne pourra plus être modifié. Il pourra
        être partagé avec d'autres via un lien web.
      </div>

      <div class="margin-bottom-small">
        <button type="button" class="bg-gris" @click="$emit('close')">
          Continuer l’édition
        </button>
      </div>
      <div class="margin-bottom-small">
        <button type="button" class="bg-bleumarine" @click="submit()">
          Valider sans partager
        </button>
      </div>
      <div class="margin-bottom-small">
        <button
          type="button"
          class="bg-bleuvert"
          @click="submit({ is_public: true })"
        >
          Valider et partager
        </button>
      </div>

      <div
        class="margin-bottom-small"
        v-if="publication.viewing_limited_to === 'everybody'"
      >
        <CreateQRCode :type="'publications'" :slugFolderName="slugPubliName" />
      </div>
      <div
        class="margin-bottom-small"
        v-if="publication.date_submitted && can_edit_publi"
      >
        <small>
          <button
            type="button"
            class="button-redthin"
            @click="removeSubmittedDate()"
          >
            {{ $t("remove_published_date") }}
          </button>
        </small>
      </div>
    </template>
    <template slot="submit_button">{{ $t("create") }}</template>
  </Modal>
</template>
<script>
import CreateQRCode from "./qr/CreateQRCode.vue";

export default {
  props: {
    read_only: Boolean,
    slugPubliName: String,
    publication: Object,
    can_edit_publi: Boolean,
  },
  components: {
    CreateQRCode,
  },
  data() {
    return {
      is_sending_content_to_server: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    submit({ is_public = false } = {}) {
      var now = this.$moment();

      const editing_limited_to = "nobody";
      let viewing_limited_to = undefined;

      if (is_public) viewing_limited_to = "everybody";
      else
        viewing_limited_to = this.$root.current_author
          ? "only_authors"
          : "everybody";

      this.$root
        .editFolder({
          type: "publications",
          slugFolderName: this.slugPubliName,
          data: {
            date_submitted: now,
            editing_limited_to,
            viewing_limited_to,
          },
        })
        .then((fdata) => {
          if (fdata.viewing_limited_to !== "everybody") this.$emit("close");
        });
    },
    removeSubmittedDate() {
      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data: {
          date_submitted: "",
        },
      });
    },
  },
};
</script>
<style lang="scss" scoped></style>
