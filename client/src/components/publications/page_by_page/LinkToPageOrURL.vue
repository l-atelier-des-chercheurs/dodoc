<template>
  <BaseModal2 :title="$t('on_click')" @close="$emit('close')">
    <div class="u-spacingBottom">
      <RadioCheckboxInput
        :value.sync="type_of_link"
        :options="options"
        :can_edit="true"
      />
    </div>

    <div class="_options" v-if="type_of_link === 'url'">
      <TextInput
        :content.sync="content_url"
        :input_type="'url'"
        :placeholder="$t('url_to_open')"
      />
    </div>
    <div class="_options" v-else-if="type_of_link === 'page'">
      {{ $t("page_number") }} =
      <b>
        <template v-if="selected_page_id">
          {{ selected_page_id }}
        </template>
        <template v-else>
          {{ $t("no_page_selected") }}
        </template>
      </b>

      <EditBtn :label_position="'right'" @click="show_page_select = true" />

      <SelectPage
        v-if="show_page_select"
        :pages="pages"
        :current_page_id="current_page_id"
        :allow_save="allow_save"
        @submit="linkToPage"
        @close="show_page_select = false"
      />
    </div>

    <SaveCancelButtons slot="footer" @save="save" @cancel="$emit('close')" />
  </BaseModal2>
</template>
<script>
import SelectPage from "@/components/publications/page_by_page/SelectPage.vue";

export default {
  props: {
    on_click: Object,
    pages: Array,
    current_page_id: String,
    path: String,
  },
  components: {
    SelectPage,
  },
  data() {
    return {
      type_of_link: this.on_click?.type || "",
      content_url: this.on_click?.url || "",
      content_page_id: this.on_click?.page_id || "",
      show_page_select: false,

      options: [
        {
          key: "",
          label: this.$t("do_nothing"),
        },
        {
          key: "url",
          label: this.$t("open_webpage"),
        },
        {
          key: "page",
          label: this.$t("navigate_to_page"),
        },
      ],
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    // on_click: {
    //   handler(newVal) {
    //     this.type_of_link = newVal.type || "none";
    //   },
    //   deep: true,
    // },
    type_of_link: {
      handler(newVal, oldVal) {
        if (newVal === "page" && oldVal !== "page" && !this.content_page_id) {
          this.show_page_select = true;
        }
      },
    },
  },
  computed: {
    selected_page_id() {
      return (
        this.pages.findIndex((page) => page.id === this.content_page_id) + 1
      );
    },
    active_page_number() {
      return (
        this.pages.findIndex((page) => page.id === this.current_page_id) + 1
      );
    },
    allow_save() {
      if (this.type_of_link === "page") {
        return this.content_page_id.length > 0;
      } else if (this.type_of_link === "url") {
        return this.content_url.length > 0;
      } else if (this.type_of_link === "") {
        return true;
      }
      return false;
    },
  },
  methods: {
    linkToPage(page_id) {
      this.content_page_id = page_id;
      this.show_page_select = false;
    },
    save() {
      let on_click;
      if (this.type_of_link === "url") {
        on_click = {
          type: this.type_of_link,
          url: this.content_url,
        };
      } else if (this.type_of_link === "page") {
        on_click = {
          type: this.type_of_link,
          page_id: this.content_page_id,
        };
      } else {
        on_click = {};
      }
      this.$emit("save", { on_click });
      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped>
._options {
  margin-bottom: calc(var(--spacing) / 1);
}
</style>
