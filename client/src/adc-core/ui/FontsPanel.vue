<template>
  <div>
    <template v-if="!opened_font_item_path">
      <div>
        <div v-for="font in fonts" :key="font.$path" class="_fontRow">
          <h3>
            {{ font.title }}
          </h3>
          <button
            type="button"
            class="u-buttonLink"
            @click="openFontItem(font.$path)"
            v-text="$t('open')"
          />
        </div>
      </div>

      <br />

      <button
        type="button"
        class="u-button u-button_bleuvert"
        :class="{
          'is--active': show_create_font,
        }"
        @click="show_create_font = !show_create_font"
      >
        {{ $t("add") }}
      </button>

      <form
        class="input-validation-required"
        v-if="show_create_font"
        @submit.prevent="createFont"
      >
        <fieldset>
          <legend class="u-label">{{ $t("add_font") }}</legend>

          <TextInput
            :content.sync="new_font_title"
            :label_str="'font_name'"
            :required="true"
            :input_type="'text'"
          />

          <br />
          <br />

          <button
            slot="footer"
            class="u-button u-button_bleuvert"
            :disabled="new_font_title.length === 0"
            type="submit"
          >
            {{ $t("create") }}
          </button>
        </fieldset>
      </form>
    </template>
    <template v-else>
      <FontItem
        :font_path="opened_font_item_path"
        @toggle="opened_font_item_path = false"
      />
    </template>
    <!-- 
    LIST OF FONTS 

    CREATE 

    FONT NAME

    FONT FILES : 
    400 normal
    400 ital
    700 normal
    700 ital
-->
  </div>
</template>
<script>
import FontItem from "@/adc-core/ui/FontItem.vue";

export default {
  props: {},
  components: {
    FontItem,
  },
  data() {
    return {
      fonts: undefined,
      show_create_font: false,

      opened_font_item_path: false,

      new_font_title: "",

      path: "fonts",
    };
  },
  created() {},
  async mounted() {
    this.fonts = await this.$api
      .getFolders({
        path: this.path,
      })
      .catch((err) => {
        this.fetch_fonts_error = err.response;
        return;
      });
    this.$api.join({ room: this.path });
  },
  beforeDestroy() {
    this.$api.leave({ room: this.path });
  },
  watch: {},
  computed: {},
  methods: {
    async createFont() {
      const font_slug = await this.$api.createFolder({
        path: this.path,
        additional_meta: {
          title: this.new_font_title,
          requested_slug: this.new_font_title,
          $status: "public",
        },
      });
      this.openFontItem(this.path + "/" + font_slug);
    },
    openFontItem(path) {
      this.opened_font_item_path = path;
    },
  },
};
</script>
<style lang="scss" scoped>
._fontRow {
  display: flex;
  justify-content: space-between;
  align-content: center;
  border-bottom: 2px solid var(--c-gris);
  padding: calc(var(--spacing) / 2) 0;
}
</style>
