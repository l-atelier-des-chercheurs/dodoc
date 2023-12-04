<template>
  <div
    class="_spacePresentation"
    :data-context="context"
    :class="{
      'is--own': is_own_space,
      'u-card2': context === 'list',
    }"
  >
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

      <div class="_icon _pinSpace" v-if="is_instance_admin">
        <button
          v-if="$listeners.movePin"
          type="button"
          class="u-button u-button_icon"
          :disabled="['alone', 'first'].includes(position_in_list)"
          @click="$emit('movePin', -1)"
        >
          <b-icon icon="arrow-left-circle-fill" :aria-label="$t('move_left')" />
        </button>
        <button
          v-if="$listeners.addToPins"
          type="button"
          class="u-button u-button_icon"
          @click="$emit('addToPins')"
        >
          <b-icon icon="pin" :aria-label="$t('pin')" />
        </button>
        <button
          v-if="$listeners.removeFromPins"
          type="button"
          class="u-button u-button_icon"
          @click="$emit('removeFromPins')"
        >
          <b-icon icon="pin-fill" :aria-label="$t('unpin')" />
        </button>
        <button
          v-if="$listeners.movePin"
          type="button"
          class="u-button u-button_icon"
          :disabled="['alone', 'last'].includes(position_in_list)"
          @click="$emit('movePin', +1)"
        >
          <b-icon
            icon="arrow-right-circle-fill"
            :aria-label="$t('move_right')"
          />
        </button>
      </div>
      <div
        class="_icon _pinSpace _pinSpace_indicator"
        v-else-if="$listeners.removeFromPins"
      >
        <b-icon icon="pin-fill" :aria-label="$t('unpin')" />
      </div>

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
        :label="can_edit && !space.description ? $t('description') : undefined"
        :content="space.description"
        :path="space.$path"
        :input_type="'markdown'"
        :maxlength="480"
        :can_edit="can_edit"
      />

      <template v-if="context === 'full'">
        <AdminsAndContributorsField
          :folder="space"
          :can_edit="can_edit"
          :admin_label="$t('referent')"
          :admin_instructions="$t('space_admin_instructions')"
          :contrib_instructions="$t('space_contrib_instructions')"
        />

        <div class="u-mediaOptions" v-if="can_edit">
          <DownloadFolder :path="space.$path" />
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
    position_in_list: String,
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
  computed: {
    is_own_space() {
      return this.isOwnItem({ folder: this.space });
    },
  },
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
  padding: calc(var(--spacing) / 4);
  border-radius: 7px;

  // overflow: hidden;
  // border-radius: var(--panel-radius);
  // box-shadow: var(--panel-shadows);
  // border: 2px solid var(--c-gris_clair);
  background: white;

  // margin-bottom: calc(var(--spacing) / 2);
  transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);

  &[data-context="full"] {
    gap: calc(var(--spacing) / 2);
  }
  &[data-context="list"] {
    flex-flow: row nowrap;
    // box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
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
  border-radius: 4px;
  overflow: hidden;
  flex: 1 0 180px;
  // max-width: 120px;
  // overflow: hidden;
  // border-radius: var(--panel-radius);
  // margin-right: calc(var(--spacing) / 1);
  // margin-bottom: calc(var(--spacing) / 4);
}
._textBloc {
  padding: calc(var(--spacing) / 2);
  flex: 5 1 180px;
  overflow: hidden;

  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 1);
}
._subtitle {
  color: var(--c-gris_fonce);
  font-size: var(--sl-font-size-large);
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

._pinSpace {
  left: 0;
  right: auto;
  z-index: 100;
  color: var(--c-orange);

  display: flex;
  flex-flow: row nowrap;
  gap: calc(var(--spacing) / 2);

  > button {
    display: block;
    pointer-events: auto;
  }
}

._pinSpace_indicator {
  pointer-events: none;
}
</style>
