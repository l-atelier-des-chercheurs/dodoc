<template>
  <div class="_chapterPreview">
    <!-- {{ section.section_type }} -->
    <div class="_order" v-if="can_edit">
      <select
        :value="index"
        size="small"
        @change="
          $emit('moveSection', {
            old_position: index,
            new_position: +$event.target.value,
          })
        "
      >
        <option
          v-for="p in number_of_sections"
          :key="p - 1"
          :value="p - 1"
          v-text="p"
        />
      </select>
    </div>

    <h2 class="_item--title">
      <template v-if="section.section_title">
        {{ section.section_title }}
      </template>
      <template v-else>
        <i>{{ $t("untitled") }}</i>
      </template>
    </h2>
    <div class="_item--content">
      <div class="_item--content--text" v-if="previewContent(section)">
        <CollaborativeEditor3 :content="previewContent(section)" />
      </div>
    </div>

    <button
      type="button"
      class="u-button u-button_small u-button_bleuvert"
      @click="$emit('open')"
    >
      {{ $t("open") }}
    </button>
  </div>
</template>
<script>
export default {
  props: {
    section: Object,
    index: Number,
    number_of_sections: Number,
    can_edit: Boolean,
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    previewContent(section) {
      const sub_content = section._main_text?.$content;
      if (sub_content) {
        return sub_content.substring(0, 100) + "...";
      }
      return "";
    },
  },
};
</script>
<style lang="scss" scoped>
._chapterPreview {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) / 2);
  align-items: flex-start;
}

._order {
  width: 5ch;
}
</style>
