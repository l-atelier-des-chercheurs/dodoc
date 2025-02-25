<template>
  <BaseModal2 :title="$t('create_a_publication')" @close="$emit('close')">
    <form class="input-validation-required" @submit.prevent="createPublication">
      <DLabel :str="$t('title')" />
      <TextInput
        :content.sync="new_publication_title"
        :maxlength="40"
        :required="true"
        :autofocus="true"
        ref="titleInput"
        @toggleValidity="($event) => (allow_save = $event)"
      />

      <br />

      <div class="">
        <ToggleInput
          :content.sync="new_publication_is_private"
          :label="$t('private')"
          :options="{
            true: $t('private_status_explanations'),
            false: $t('public_status_explanations'),
          }"
        />
      </div>

      <br />

      <div class="_templates">
        <!-- <select v-model="new_publication_template">
          <option
            v-for="option in template_options"
            :key="option.key"
            :value="option.key"
            v-text="option.label"
            :disabled="option.disabled"
          />
        </select> -->
        <div
          class="_templates--item"
          v-for="template in template_options"
          :class="{
            'is--active': new_publication_template === template.key,
          }"
          :key="template.key"
        >
          <strong>{{ template.label }}</strong>
          <div class="" v-html="template.icon" />
          <button
            type="submit"
            class="u-button u-button_bleuvert_fonce"
            name="action"
            :disabled="template.disabled === true"
            @click="new_publication_template = template.key"
          >
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              viewBox="0 0 168 168"
              style="enable-background: new 0 0 168 168"
              xml:space="preserve"
            >
              <polygon
                style="fill: white"
                points="132.3,73.4 132.3,94.4 94.6,94.4 94.6,132.1 73.6,132.1 73.6,94.4 35.9,94.4 35.9,73.4 
		73.6,73.4 73.6,35.7 94.6,35.7 94.6,73.4 		"
              />
            </svg>

            <span>
              {{ $t("create") }}
            </span>
          </button>
        </div>
      </div>

      <!-- <button
        class="u-button u-button_bleuvert"
        type="submit"
        slot="footer"
        :loading="is_creating_publication"
      >
        {{ $t("create_and_open") }}
      </button> -->

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
    project_path: String,
    template_options: Array,
  },
  components: {},
  data() {
    return {
      new_publication_title: "",
      new_publication_is_private: false,
      new_publication_template: "page_by_page",

      is_creating_publication: false,

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
    async createPublication() {
      this.is_creating_publication = true;
      this.new_publication_title = this.cleanUpString(
        this.new_publication_title
      );

      let additional_meta = {
        title: this.new_publication_title,
        template: this.new_publication_template,
        requested_slug: this.new_publication_title,
        $status:
          this.new_publication_is_private === true ? "private" : "public",
        // $admins: "everyone",
        $admins: "parent_contributors",
      };

      if (this.new_publication_template === "page_by_page") {
        additional_meta.layout_mode = "print";
        additional_meta.page_width = 210;
        additional_meta.page_height = 297;
        additional_meta.pages = [{ id: "first_page" }];
      } else if (this.new_publication_template === "edition") {
        additional_meta.page_width = 210;
        additional_meta.page_height = 297;
      }

      try {
        const new_folder_slug = await this.$api.createFolder({
          path: `${this.project_path}/publications`,
          additional_meta,
        });
        this.$emit("openPubli", new_folder_slug);
      } catch ({ code }) {
        if (code === "unique_field_taken") {
          this.$alertify.delay(4000).error(this.$t("title_taken"));
          this.$refs.titleInput.$el.querySelector("input").select();
        }
        this.is_creating_publication = false;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._templates {
  display: grid;
  grid-auto-rows: max-content;
  grid-gap: calc(var(--spacing) / 4);
  align-items: stretch;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
}

._templates--item {
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  text-align: center;
  align-items: center;

  background: var(--c-bleuvert);
  border-radius: 4px;
  padding: calc(var(--spacing) / 2);

  &.is--active {
    border: 2px solid white;
    outline: 2px solid var(--c-bleuvert_fonce);
  }
}
._label ::v-deep label {
  color: black !important;
}
</style>
