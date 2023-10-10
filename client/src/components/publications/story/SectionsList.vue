<template>
  <div class="_sectionsList">
    <SectionsSummary
      v-if="can_edit || sections.length > 1"
      :sections="sections"
      :opened_section="opened_section"
      :can_edit="can_edit"
      @createSection="$emit('createSection', $event)"
      @openSection="$emit('openSection', $event)"
      @updateOrder="$emit('updateOrder', $event)"
    />
    <transition name="pagechange" mode="out-in">
      <div v-if="opened_section" :key="opened_section.$path">
        <SingleSection
          ref="section"
          :publication="publication"
          :section="opened_section"
          :modules_list="opened_section_modules_list"
          :can_edit="can_edit"
          @remove="$emit('removeSection', opened_section.$path)"
          @close="$emit('closeSection')"
          @addModule="$emit('addModule', $event)"
          @insertModule="$emit('insertModule', $event)"
          @moveModuleTo="$emit('moveModuleTo', $event)"
          @removeModule="$emit('removeModule', $event)"
          @duplicatePublicationMedia="
            $emit('duplicatePublicationMedia', $event)
          "
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
    </transition>
    <PublicationSettings v-if="can_edit">
      <StorySettings :publication="publication" />
    </PublicationSettings>
  </div>
</template>
<script>
import PublicationSettings from "@/components/publications/PublicationSettings.vue";
import StorySettings from "@/components/publications/story/StorySettings.vue";
import SectionsSummary from "@/components/publications/story/SectionsSummary.vue";
import SingleSection from "@/components/publications/story/SingleSection.vue";

export default {
  props: {
    publication: Object,
    sections: Array,
    opened_section: [Boolean, Object],
    opened_section_modules_list: Array,
    modules_list: Array,
    can_edit: Boolean,
  },
  components: {
    PublicationSettings,
    StorySettings,
    SectionsSummary,
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
      this.$emit("openSection", this.next_section.$path);
    },
    prevSection() {
      this.scrollToTop();
      this.$emit("openSection", this.prev_section.$path);
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
._sectionsList {
  position: relative;
  padding: calc(var(--spacing) / 1);
}

._sectionTitle {
}

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
