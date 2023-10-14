<template>
  <div class="_openedSection">
    <SingleSection
      ref="section"
      :publication="publication"
      :section="opened_section"
      :can_edit="can_edit"
      @close="$emit('toggleSection', undefined)"
    />
    <div class="_navBtns">
      <div class="_navBtns--content">
        <span v-if="prev_section" class="_navbtn" @click="prevSection">
          <sl-icon name="arrow-left-circle" />
          {{ prev_section.section_title }}
        </span>
        <span v-if="next_section" class="_navbtn" @click="nextSection">
          {{ next_section.section_title }}
          <sl-icon name="arrow-right-circle" />
        </span>
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
  i18n: {
    messages: {
      fr: {},
    },
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
    nextSection() {
      this.scrollToTop();
      this.$emit("toggleSection", this.getFilename(this.next_section.$path));
    },
    prevSection() {
      this.scrollToTop();
      this.$emit("toggleSection", this.getFilename(this.prev_section.$path));
    },
    scrollToTop() {
      const current_height = this.$el.offsetHeight;
      this.$el.setAttribute("style", `height: ${current_height}px`);

      if (this.$route.name === "Projet")
        this.$el.scrollIntoView({
          behavior: "smooth",
          inline: "nearest",
        });
      else window.scrollTo({ top: 0, behavior: "smooth" });

      window.setTimeout(() => this.$el.removeAttribute("style"), 1_000);
      // document.body.scrollIntoView({
      //   behavior: "smooth",
      //   inline: "nearest",
      // });
    },
  },
};
</script>
<style lang="scss" scoped>
._navBtns {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: underline;
  padding-bottom: calc(var(--spacing) * 4);
}
._navBtns--content {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) / 1);
}

._navbtn {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) / 4);

  background: white;
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  border-radius: 6px;
  box-shadow: 0 1px 4px rgb(0 0 0 / 20%);

  &:hover,
  &:focus-visible {
    background: var(--c-gris);
  }
}
</style>
