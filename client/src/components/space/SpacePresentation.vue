<template>
  <div class="_spacePresentation">
    <!-- <div class="_topHero"> -->
    <!-- <img
        src="https://latelier-des-chercheurs.fr/thumbs/ateliers/chepa-le-journal-pour-tou-te-s/cover-1280x800-q60.jpg"
      /> -->
    <div class="_coverField">
      <CoverField
        :context="context"
        :cover="space.$cover"
        :path="space.$path"
        :can_edit="can_edit"
      />
      <!-- </div> -->
    </div>
    <div class="_titleField">
      <TitleField
        :field_name="'title'"
        class="_title"
        :tag="'h1'"
        :content="space.title"
        :path="space.$path"
        :maxlength="280"
        :can_edit="can_edit"
        :instructions="$t('project_title_instructions')"
      />
    </div>
    <div class="_descriptionField">
      <TitleField
        :field_name="'description'"
        class="_description"
        :label="$t('description')"
        :content="space.description"
        :path="space.$path"
        :maxlength="480"
        :can_edit="can_edit"
        :instructions="$t('project_description_instructions')"
      />
    </div>
    <div class="_openSpace" v-if="context === 'list' || context === 'tiny'">
      <!-- class="u-button u-button_bleuvert" -->
      <router-link :to="{ path: createURLFromPath(space.$path) }">
        <div class="_clickZone" />
        <!-- {{ $t("open") }} -->
      </router-link>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    space: Object,
    context: String,
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
  methods: {},
};
</script>
<style lang="scss" scoped>
._spacePresentation {
  position: relative;

  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) * 2);

  // border: 2px solid white;
  background: white;
  overflow: hidden;
  background: var(--panel-color);
  box-shadow: var(--panel-shadows);
  // border: var(--panel-borders);
  border-radius: var(--panel-radius);

  margin-bottom: calc(var(--spacing) / 2);

  > * {
    flex: 1 1 33%;
  }
}

._topHero {
  // position: relative;
  // width: 100%;
}

._coverField {
  position: relative;
  // flex: 1 1 50%;
  width: 120px;
  aspect-ratio: 1/1;
  flex: 0 0 auto;
}
._titleField {
  // position: absolute;
}
._descriptionField {
}

._openSpace {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;

  ._clickZone {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
</style>
