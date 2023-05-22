<template>
  <div class="_spacePresentation" :data-context="context">
    <!-- <div class="_topHero"> -->
    <!-- <img
        src="https://latelier-des-chercheurs.fr/thumbs/ateliers/chepa-le-journal-pour-tou-te-s/cover-1280x800-q60.jpg"
      /> -->
    <div class="_spaceCover">
      <CoverField
        :context="context"
        :cover="space.$cover"
        :path="space.$path"
        :can_edit="can_edit"
      />

      <transition name="toggleLock" mode="out-in">
        <sl-icon
          v-if="space.$status === 'private'"
          :key="space.$status"
          name="file-lock2-fill"
          class="_icon _private"
        />
      </transition>
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
          :label="
            context === 'full' && can_edit && !space.title ? $t('title') : ''
          "
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
          :label="
            context === 'full' && can_edit && !space.subtitle
              ? $t('subtitle')
              : ''
          "
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
        :input_type="'markdown'"
        :maxlength="480"
        :can_edit="can_edit"
      />

      <template v-if="context === 'full'">
        <!-- :show_section="['contributors']" -->
        <AdminsAndContributorsField
          :folder="space"
          :can_edit="can_edit"
          :admin_label="$t('referent')"
          :admin_instructions="$t('space_admin_instructions')"
          :contrib_instructions="$t('space_contrib_instructions')"
        />

        <div class="u-mediaOptions" v-if="can_edit">
          <RemoveMenu :remove_text="$t('remove_space')" @remove="removeSpace" />
        </div>
      </template>
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
  methods: {
    async removeSpace() {
      // this.fetch_status = "pending";
      // this.fetch_error = null;

      try {
        const response = await this.$api.deleteItem({
          path: this.space.$path,
        });
        response;
        // this.response = response.data;
        // this.fetch_status = "success";
      } catch (e) {
        // this.fetch_status = "error";
        // this.fetch_error = e.response.data;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._spacePresentation {
  position: relative;

  display: flex;
  flex-flow: row wrap;
  align-items: center;

  width: 100%;
  margin: 0 auto;

  // overflow: hidden;
  // border-radius: var(--panel-radius);
  // box-shadow: var(--panel-shadows);
  // border: var(--panel-borders);

  // margin-bottom: calc(var(--spacing) / 2);
  transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);
  &[data-context="full"] {
    gap: calc(var(--spacing) / 2);
  }
  &[data-context="list"] {
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    &:hover,
    &:focus-visible {
      transform: translateY(-6px);
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
    }
  }
}

._topHero {
  // position: relative;
  // width: 100%;
}

._spaceCover {
  position: relative;
  aspect-ratio: 1/1;
  align-self: flex-start;
  // border: 1px solid var(--c-gris);

  flex: 1 0 80px;
  // max-width: 120px;
  // overflow: hidden;
  // border-radius: var(--panel-radius);
  // margin-right: calc(var(--spacing) / 1);
  // margin-bottom: calc(var(--spacing) / 4);
}
._textBloc {
  padding: calc(var(--spacing) / 2);
  flex: 5 1 0;

  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 1);
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
  // margin-top: calc(var(--spacing) / 2);
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
