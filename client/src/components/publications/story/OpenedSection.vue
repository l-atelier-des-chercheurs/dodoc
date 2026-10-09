<template>
  <div class="_openedSection">
    <SingleSection
      ref="section"
      :publication="publication"
      :section="opened_section"
      :can_edit="can_edit"
      @prevSection="prevSection"
      @nextSection="nextSection"
    />

    <div class="_navBtns">
      <div class="_navBtns--content">
        <button
          type="button"
          class="u-linkList"
          v-if="prev_section"
          @click="prevSection"
        >
          <b-icon icon="arrow-left-square" />
          <span>
            {{ prev_section.section_title }}
          </span>
        </button>

        <button
          type="button"
          class="u-linkList"
          v-if="next_section"
          @click="nextSection"
        >
          <span>
            {{ next_section.section_title }}
          </span>
          <b-icon icon="arrow-right-square" />
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import SingleSection from "@/components/publications/story/SingleSection.vue";

export default {
  props: {
    publication: Object,
    sections: Array,
    opened_section_meta_filename: String,
    can_edit: Boolean,
  },
  components: {
    SingleSection,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    opened_section() {
      return this.sections.find(
        (s) => this.getFilename(s.$path) === this.opened_section_meta_filename
      );
    },
    opened_section_index() {
      return this.sections.findIndex(
        (s) => s.$path === this.opened_section?.$path
      );
    },
    next_section() {
      if (this.opened_section_index < this.sections.length - 1)
        return this.sections[this.opened_section_index + 1];
      return false;
    },
    prev_section() {
      if (this.opened_section_index > 0)
        return this.sections[this.opened_section_index - 1];
      return false;
    },
  },
  methods: {
    // scroll to top is handled by SectionsList when the opened section changes
    nextSection() {
      if (this.next_section?.$path)
        this.$emit("toggleSection", this.getFilename(this.next_section.$path));
    },
    prevSection() {
      if (this.prev_section?.$path)
        this.$emit("toggleSection", this.getFilename(this.prev_section.$path));
    },
  },
};
</script>
<style lang="scss" scoped>
._navBtns {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: calc(var(--spacing) * 4);
}
._navBtns--content {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) / 1);
}
</style>
