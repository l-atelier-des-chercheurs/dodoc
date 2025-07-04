<template>
  <BaseModal2 :title="modal_title" @close="$emit('close')">
    <div class="u-spacingBottom">
      <DLabel :str="$t('new_title')" />
      <input
        ref="titleInput"
        v-model="new_title"
        type="text"
        class="u-input"
        :placeholder="$t('enter_new_title')"
        autofocus
        @keyup.enter="duplicatePublication"
      />
    </div>

    <div class="u-instructions u-spacingBottom" v-if="publication">
      {{
        $t("duplicate_publication_instructions", {
          original_title: publication.title,
        })
      }}
    </div>

    <template slot="footer">
      <div />
      <button
        type="button"
        class="u-button u-button_bleuvert"
        :disabled="!new_title.trim() || is_duplicating"
        @click="duplicatePublication"
      >
        <template v-if="is_duplicating">
          <LoaderSpinner />
          {{ $t("duplicating") }}
        </template>
        <template v-else>
          <b-icon icon="file-plus" />
          {{ $t("duplicate") }}
        </template>
      </button>
    </template>
  </BaseModal2>
</template>

<script>
export default {
  props: {
    modal_title: String,
    publication: Object,
  },
  data() {
    return {
      new_title: "",
      is_duplicating: false,
    };
  },
  i18n: {
    messages: {
      fr: {
        new_title: "Nouveau titre",
        enter_new_title: "Saisir le nouveau titre",
        duplicate_publication_instructions:
          "Créer une copie de « {original_title} » avec un nouveau titre",
        duplicating: "Duplication en cours...",
      },
      en: {
        new_title: "New title",
        enter_new_title: "Enter the new title",
        duplicate_publication_instructions:
          "Create a copy of « {original_title} » with a new title",
        duplicating: "Duplicating...",
      },
    },
  },
  created() {
    if (this.publication) {
      this.new_title = this.$t("copy_of") + " " + this.publication.title;
    }
  },
  mounted() {
    // Focus the input field when modal opens
    this.$nextTick(() => {
      if (this.$refs.titleInput) {
        this.$refs.titleInput.focus();
      }
    });
  },
  methods: {
    async duplicatePublication() {
      if (!this.new_title.trim() || this.is_duplicating) return;

      this.is_duplicating = true;

      try {
        // Create a copy of the publication with the new title
        const new_meta = {
          title: this.new_title.trim(),
        };

        const new_publication_path = await this.$api.copyFile({
          path: this.publication.$path,
          new_meta,
        });

        this.$alertify
          .delay(4000)
          .success(this.$t("publication_duplicated_successfully"));

        // Emit close event and optionally navigate to new publication
        this.$emit("close");

        // Navigate to the new publication
        const new_publication_slug = this.getFilename(new_publication_path);
        this.$router.push(`/publish/${new_publication_slug}`);
      } catch (err) {
        console.error("Error duplicating publication:", err);
        this.$alertify
          .delay(4000)
          .error(this.$t("error_duplicating_publication"));
      } finally {
        this.is_duplicating = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.u-input {
  width: 100%;
  padding: calc(var(--spacing) / 2);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: var(--sl-font-size-normal);

  &:focus {
    outline: none;
    border-color: var(--active-color);
  }
}
</style>
