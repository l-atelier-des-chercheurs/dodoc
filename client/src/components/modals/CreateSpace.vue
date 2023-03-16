<template>
  <BaseModal2 :title="$t('create_a_space')" @close="$emit('close')">
    <form class="input-validation-required" @submit.prevent="createSpace">
      <DLabel :str="$t('title')" />

      <TextInput
        :content.sync="new_space_title"
        :maxlength="40"
        :required="true"
        @toggleValidity="($event) => (allow_save = $event)"
      />

      <br />

      <div class="">
        <ToggleInput
          :content.sync="new_space_is_invisible"
          :label="$t('invisible')"
          :options="{
            true: $t('invisible_status_explanations_spaces'),
            false: $t('visible_status_explanations_spaces'),
          }"
        />
      </div>

      <br />

      <button
        class="u-button u-button_bleuvert"
        type="submit"
        slot="footer"
        :loading="is_creating_space"
      >
        {{ $t("create_and_open") }}
      </button>

      <template v-if="error_msg">
        <br />
        <br />
        <div class="u-errorMsg" v-text="error_msg" />
      </template>
    </form>
  </BaseModal2>
</template>
<script>
export default {
  props: {
    path: String,
  },
  components: {},
  data() {
    return {
      new_space_title: "",
      new_space_is_invisible: false,

      is_creating_space: false,
      allow_save: false,
      error_msg: "",
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async createSpace() {
      this.is_creating_space = true;

      // TODO replace with $api
      try {
        const new_folder_slug = await this.$api.createFolder({
          path: this.path,
          additional_meta: {
            title: this.new_space_title,
            requested_slug: this.new_space_title,
            status: "draft",
            license: "CC",
            $status:
              this.new_space_is_invisible === true ? "invisible" : "draft",
            $authors: [this.$api.tokenpath.token_path],
          },
        });
        setTimeout(() => {
          this.$emit("openNewSpace", new_folder_slug);
        }, 50);
      } catch (err) {
        this.error_msg = "Error: " + err.message;
        setTimeout(() => {
          this.error_msg = "";
        }, 5000);
        this.is_creating_space = false;
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
