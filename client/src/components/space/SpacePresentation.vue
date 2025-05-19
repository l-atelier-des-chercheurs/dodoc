<template>
  <div
    class="_spacePresentation"
    :data-context="context"
    :class="{
      'is--own': is_own_space,
      'u-card2': context === 'list',
    }"
  >
    <div class="_spaceCover">
      <CoverField
        :context="context"
        :cover="space.$cover"
        :path="space.$path"
        :ratio="'square'"
        :can_edit="can_edit"
      />

      <transition name="toggleLock" mode="out-in">
        <StatusTag
          v-if="space.$status === 'private'"
          class="_icon"
          :key="space.$status"
          :show_label="false"
          :status="space.$status"
          :can_edit="false"
          :mode="'inactive'"
        />
      </transition>

      <!-- </div> -->
    </div>
    <div class="_textBloc">
      <div class="_statusOptions" v-if="can_edit">
        <StatusTag
          :status="space.$status || 'public'"
          :status_options="['public', 'private']"
          :path="space.$path"
          :can_edit="can_edit"
        />

        <DropDown :show_label="false" :right="true">
          <DownloadFolder
            :modal_title="$t('download_space', { name: space.title })"
            :path="space.$path"
          />

          <button
            type="button"
            class="u-buttonLink"
            @click="show_bin_modal = true"
          >
            <b-icon icon="recycle" />
            {{ $t("bin") }}
          </button>
          <BinFolder
            v-if="show_bin_modal"
            :modal_title="$t('restore_projects')"
            :path="space.$path"
            :subfolders_type="'projects'"
            @close="show_bin_modal = false"
          />

          <RemoveMenu
            :modal_title="$t('remove_space', { name: space.title })"
            @remove="removeSpace"
          />
        </DropDown>
      </div>

      <div class="">
        <TitleField
          :field_name="'title'"
          :label="context === 'full' ? $t('title') : ''"
          class="_title"
          :tag="context === 'full' ? 'h1' : 'h2'"
          :content="space.title"
          :path="space.$path"
          :required="true"
          :maxlength="280"
          :can_edit="can_edit"
        />
        <!-- :label="can_edit ? $t('subtitle') : undefined" -->
        <TitleField
          :field_name="'subtitle'"
          v-if="can_edit || space.subtitle"
          :label="$t('subtitle')"
          :show_label="context === 'full' && can_edit && !space.subtitle"
          class="_subtitle"
          :content="space.subtitle"
          :path="space.$path"
          :maxlength="280"
          :can_edit="can_edit"
        />
      </div>
      <TitleField
        v-if="context === 'full' && (space.description || can_edit)"
        :label="$t('description')"
        :show_label="context === 'full'"
        :field_name="'description'"
        :input_type="'editor'"
        :custom_formats="['bold', 'italic', 'link']"
        :content="space.description"
        :path="space.$path"
        :maxlength="1280"
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
      </template>
    </div>
    <!-- <div class="_descriptionField">
    </div> -->

    <router-link
      class="js--showCursor _openSpace"
      v-if="context === 'list'"
      :to="{ path: createURLFromPath(space.$path) }"
      :title="$t('open') + ' ' + space.title"
    />
  </div>
</template>
<script>
import BinFolder from "@/adc-core/fields/BinFolder.vue";

export default {
  props: {
    space: Object,
    context: String,
    position_in_list: String,
    can_edit: Boolean,
  },
  components: {
    BinFolder,
  },
  data() {
    return {
      show_bin_modal: false,
    };
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
  gap: calc(var(--spacing) / 1);

  // width: 100%;
  // max-width: 120ch;

  padding: 0;
  border-radius: 6px;

  // border-bottom: 2px solid var(--c-gris);
  // box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  background: white;

  transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);

  &[data-context="full"] {
    margin: calc(var(--spacing) * 2) auto;
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
  flex: 1 2 240px;
  // max-width: 120px;
  // overflow: hidden;
  // border-radius: var(--panel-radius);
  // margin-right: calc(var(--spacing) / 1);
  // margin-bottom: calc(var(--spacing) / 4);
}
._textBloc {
  // padding: calc(var(--spacing) / 2);
  flex: 3 1 240px;
  overflow: hidden;

  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 1);
}
._subtitle {
  color: var(--c-gris_fonce);
  font-size: var(--sl-font-size-medium);
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
}

._icon {
  position: absolute;
  top: 0;
  right: 0;
  margin: calc(var(--spacing) / 1);
}

._statusOptions {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: flex-end;
}
</style>
