<template>
  <div class="_spacePresentation" :data-context="context">
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
      <sl-icon
        v-if="space.$status === 'private'"
        name="file-lock2-fill"
        class="_icon _private"
      />
      <!-- </div> -->
    </div>
    <div class="_textBloc">
      <StatusTag
        v-if="can_edit"
        :status="space.$status || 'public'"
        :status_options="['public', 'private']"
        :path="space.$path"
        :can_edit="can_edit"
      />

      <!-- :label="can_edit ? $t('title') : undefined" -->
      <div class="">
        <TitleField
          :field_name="'title'"
          class="_title"
          :tag="context === 'full' ? 'h1' : 'h3'"
          :content="space.title"
          :path="space.$path"
          :maxlength="280"
          :can_edit="can_edit"
        />
        <!-- :label="can_edit ? $t('subtitle') : undefined" -->
        <TitleField
          :field_name="'subtitle'"
          v-if="can_edit || space.subtitle"
          :tag="context === 'full' ? 'h2' : 'h4'"
          class="_subtitle"
          :content="space.subtitle"
          :path="space.$path"
          :maxlength="280"
          :can_edit="can_edit"
        />
      </div>

      <TitleField
        v-if="context === 'full' && (can_edit || space.description)"
        :field_name="'description'"
        class="_description"
        :label="can_edit ? $t('description') : undefined"
        :content="space.description"
        :path="space.$path"
        :maxlength="480"
        :can_edit="can_edit"
      />
    </div>
    <!-- <div class="_descriptionField">
    </div> -->
    <div class="_openSpace" v-if="context === 'list'">
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
  // gap: calc(var(--spacing) / 4);

  // border: 2px solid white;
  // margin: calc(var(--spacing) / 2) 0;

  width: 100%;
  // max-width: 100ch;
  margin: 0 auto;

  // background: white;
  overflow: hidden;
  background: var(--panel-color);
  // box-shadow: var(--panel-shadows);
  // border: var(--panel-borders);

  // margin-bottom: calc(var(--spacing) / 2);
  transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);

  &[data-context="list"]:hover {
    border-radius: var(--panel-radius);
    box-shadow: var(--panel-shadows);
    background: white;

    gap: calc(var(--spacing) / 2);
  }
}

._topHero {
  // position: relative;
  // width: 100%;
}

._coverField {
  position: relative;
  aspect-ratio: 1/1;
  align-self: flex-start;

  flex: 1 0 80px;
  max-width: 140px;
  border-radius: var(--panel-radius);
  // margin-right: calc(var(--spacing) / 1);
  // margin-bottom: calc(var(--spacing) / 4);
}
._textBloc {
  padding: calc(var(--spacing) / 2);
  flex: 1 1 0;

  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 2);
}
._subtitle {
  color: var(--c-gris_fonce);
  // font-weight: 400;
}
._description {
  // padding: calc(var(--spacing) / 2) calc(var(--spacing) / 1);
  display: block;
  max-width: 88ch;
  // flex: 4 1 33%;
  margin-top: calc(var(--spacing) / 2);
  font-size: var(--sl-font-size-small);
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

._icon {
  position: absolute;
  top: 0;
  right: 0;
  margin: calc(var(--spacing) / 1);
}
</style>
