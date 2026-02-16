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

      <CreateFontModal
        v-if="show_create_font"
        :path="path"
        @close="show_create_font = false"
        @created="openFontItem"
      />
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
import CreateFontModal from "@/adc-core/ui/CreateFontModal.vue";

export default {
  props: {},
  components: {
    FontItem,
    CreateFontModal,
  },
  data() {
    return {
      fonts: undefined,
      show_create_font: false,

      opened_font_item_path: false,

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
