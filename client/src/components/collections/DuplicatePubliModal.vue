<template>
  <BaseModal2 :title="modal_title" @close="$emit('close')">
    <div class="u-spacingBottom">
      <DLabel :str="$t('title_of_copy')" />
      <TextInput
        :content.sync="new_title"
        :maxlength="40"
        :required="true"
        ref="titleInput"
      />
    </div>
    <template slot="footer">
      <div />
      <button
        type="button"
        class="u-button u-button_bleuvert"
        :disabled="is_copying"
        @click="duplicate"
      >
        {{ $t("duplicate") }}
      </button>
    </template>
    <div v-if="is_copying">
      <LoaderSpinner />
    </div>
  </BaseModal2>
</template>
<script>
export default {
  props: {
    publication: Object,
    modal_title: String,
  },
  components: {},
  data() {
    return {
      new_title: this.$t("copy_of") + " " + this.publication.title,
      is_copying: false,
    };
  },
  created() {},
  mounted() {},
  i18n: {
    messages: {
      fr: {
        duplicate_success: "La publication a été dupliquée avec succès",
      },
      en: {
        duplicate_success: "The publication has been duplicated successfully",
      },
    },
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async duplicate() {
      this.is_copying = true;

      debugger;
      const copy_publication_path = await this.$api
        .copyFolder({
          path: this.publication.$path,
          new_meta: {
            title: this.new_title,
          },
        })
        .catch((err) => {
          if (err.code === "unique_field_taken") {
            this.$alertify.delay(4000).error(this.$t("title_taken"));
            this.$refs.titleInput.$el.querySelector("input").select();
          } else if (err.code === "not_allowed_to_copy_to_space") {
            this.$alertify
              .delay(4000)
              .error(this.$t("not_allowed_to_copy_to_space"));
          }
          this.is_copying = false;
          throw "fail";
        });
      this.is_copying = false;
      this.$alertify.delay(4000).success(this.$t("duplicate_success"));
    },
  },
};
</script>
<style lang="scss" scoped></style>
