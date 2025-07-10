<template>
  <div>
    <template v-if="!opened_font_item_path">
      <div class="u-instructions u-spacingBottom">
        <p>
          {{ $t("fonts_instr") }}
        </p>
      </div>

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

      <BaseModal2
        v-if="show_create_font"
        :title="$t('add_font')"
        @close="show_create_font = false"
      >
        <TextInput
          :content.sync="new_font_title"
          :label_str="'font_name'"
          :required="true"
          :input_type="'text'"
          :autofocus="true"
          :maxlength="40"
        />

        <div class="u-spacingBottom" />

        <template #footer>
          <button
            class="u-button u-button_bleuvert"
            :disabled="new_font_title.length === 0"
            type="submit"
            @click="createFont"
          >
            {{ $t("create") }}
          </button>
        </template>
      </BaseModal2>
    </template>
    <template v-else>
      <FontItem
        :font_path="opened_font_item_path"
        @close="opened_font_item_path = false"
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
  background-color: var(--c-gris_clair);
  padding: calc(var(--spacing) / 2);

  &:not(:last-child) {
    margin-bottom: calc(var(--spacing) / 2);
  }
}
</style>
