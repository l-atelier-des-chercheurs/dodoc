<template>
  <div class="_storyTemplate">
    <div class="_settings" v-if="can_edit">
      <details>
        <summary>{{ $t("settings") }}</summary>
        <RangeValueInput
          class="u-spacingBottom"
          :label="$t('story_width')"
          :value="publication.story_width"
          :min="0"
          :max="2400"
          :step="1"
          :ticks="[320, 480, 800, 1200, 2400]"
          :default_value="800"
          :suffix="'px'"
          @save="updatePubliMeta({ story_width: $event })"
        />
        <ToggleInput
          :content="publication.story_is_not_responsive !== true"
          :label="$t('responsive')"
          @update:content="
            updatePubliMeta({ story_is_not_responsive: !$event })
          "
          :options="{
            true: $t('responsive_instr'),
            false: $t('not_responsive_instr'),
          }"
        />
      </details>
    </div>

    <div class="_storyContainer">
      <div class="_storyContent" :style="story_styles">
        <transition-group tag="div" name="StoryModules" appear :duration="700">
          <template v-for="(meta_filename, index) in modules_list">
            <PublicationModule
              class="_mediaPublication"
              :key="meta_filename"
              :publimodule="
                findModuleFromMetaFilename({
                  files: publication.$files,
                  meta_filename,
                })
              "
              :module_position="
                modules_list.length === 1
                  ? 'alone'
                  : index === 0
                  ? 'first'
                  : index === modules_list.length - 1
                  ? 'last'
                  : 'inbetween'
              "
              :can_edit="can_edit"
              @resize="resize({ meta_filename, new_size: $event })"
              @moveUp="moveTo({ meta_filename, dir: -1 })"
              @moveDown="moveTo({ meta_filename, dir: +1 })"
              @duplicate="
                duplicatePublicationMedia({
                  source_meta_filename: meta_filename,
                  copy_meta_filename: $event,
                })
              "
              @remove="removeModuleFromList(meta_filename)"
            />
            <div class="_spacer" :key="'mc_' + index">
              <ModuleCreator
                v-if="can_edit"
                :publication_path="publication.$path"
                :types_available="[
                  'capture',
                  'import',
                  'write',
                  'embed',
                  'table',
                ]"
                @addModules="
                  ({ meta_filenames }) =>
                    insertModuleMetaFilenamesToList({
                      meta_filenames,
                      index: index + 1,
                    })
                "
              />
            </div>
          </template>
        </transition-group>
      </div>
    </div>

    <ModuleCreator
      v-if="can_edit && (!modules_list || modules_list.length === 0)"
      :publication_path="publication.$path"
      :types_available="['capture', 'import', 'write', 'embed', 'table']"
      @addModules="appendModuleMetaFilenameToList"
    />
  </div>
</template>
<script>
import ModuleCreator from "@/components/publications/modules/ModuleCreator.vue";
import PublicationModule from "@/components/publications/modules/PublicationModule.vue";

export default {
  props: {
    publication: Object,
    can_edit: Boolean,
  },
  components: {
    ModuleCreator,
    PublicationModule,
  },
  data() {
    return {
      medias: [],
      fetch_publication_error: null,
    };
  },
  created() {},
  async mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    story_styles() {
      const width = (this.publication.story_width || 800) + "px";
      if (this.publication.story_is_not_responsive === true)
        return { width, maxWidth: "none" };
      else return { maxWidth: width };
    },
    modules_list() {
      if (
        this.publication.modules_list &&
        Array.isArray(this.publication.modules_list)
      ) {
        const modules_list = this.publication.modules_list.reduce(
          (acc, meta_filename) => {
            const _module = this.findModuleFromMetaFilename({
              files: this.publication.$files,
              meta_filename,
            });
            if (_module) {
              acc.push(meta_filename);
            }
            return acc;
          },
          []
        );
        return modules_list;
      }
      return [];
    },
  },
  methods: {
    async appendModuleMetaFilenameToList({ meta_filenames }) {
      const meta_filename = meta_filenames.at(-1);

      const modules_list = this.modules_list.slice();
      modules_list.push(meta_filename);

      await this.updateMeta({
        new_meta: {
          modules_list,
        },
      });

      this.toggleNewModuleEdit({ meta_filename });
    },
    async insertModuleMetaFilenamesToList({ meta_filenames, index }) {
      const meta_filename = meta_filenames.at(-1);
      const modules_list = this.modules_list.slice();
      modules_list.splice(index, 0, meta_filename);

      await this.updateMeta({
        new_meta: {
          modules_list,
        },
      });
      this.toggleNewModuleEdit({ meta_filename });
    },
    async updatePubliMeta(new_meta) {
      return await this.$api.updateMeta({
        path: this.publication.$path,
        new_meta,
      });
    },
    async updateMeta({ new_meta }) {
      this.fetch_status = "pending";
      this.fetch_error = null;
      try {
        this.response = await this.$api.updateMeta({
          path: this.publication.$path,
          new_meta,
        });
        this.fetch_status = "success";
      } catch (e) {
        this.fetch_status = "error";
        this.fetch_error = e.response.data;
      }
    },
    async moveTo({ meta_filename, dir }) {
      let modules_list = this.modules_list.slice();
      const target_meta_index = modules_list.findIndex(
        (m) => m === meta_filename
      );
      if (target_meta_index + dir < 0) return false;
      else if (target_meta_index + dir > modules_list.length - 1) return false;

      modules_list.move(target_meta_index, target_meta_index + dir);
      this.response = await this.updatePubliMeta({ modules_list });
    },
    async duplicatePublicationMedia({
      source_meta_filename,
      copy_meta_filename,
    }) {
      source_meta_filename;
      copy_meta_filename;

      let modules_list = this.modules_list.slice();
      const position_of_original_media = modules_list.findIndex(
        (_mf) => _mf === source_meta_filename
      );

      modules_list.splice(
        position_of_original_media + 1,
        0,
        copy_meta_filename
      );

      this.response = await this.updatePubliMeta({ modules_list });
    },
    async removeModuleFromList(meta_filename) {
      let modules_list = this.modules_list.slice();
      modules_list = modules_list.filter((_mf) => _mf !== meta_filename);

      this.response = await this.updatePubliMeta({ modules_list });
    },
    toggleNewModuleEdit({ meta_filename }) {
      setTimeout(() => {
        console.log(`emit module.enable_edit.${meta_filename}`);
        this.$eventHub.$emit(`module.enable_edit.${meta_filename}`);
      }, 50);
    },
  },
};
</script>
<style lang="scss" scoped>
._storyTemplate {
  display: flex;
  justify-content: center;
  flex-flow: column nowrap;
  align-items: center;
  margin: 0 auto;
  padding-bottom: calc(var(--spacing) * 4);
}

._settings {
  position: relative;
  top: 0;
  right: 0;
  display: flex;
  justify-content: flex-end;
  // width: 100%;
  background: white;
  padding: calc(var(--spacing) / 8) calc(var(--spacing) / 4);
  margin: calc(var(--spacing) / 2) auto 0;
  max-width: 240px;
}

._storyContainer {
  width: 100%;
  // overflow: auto;
}
._storyContent {
  width: 100%;
  // background: white;
  max-width: 800px;
  padding: calc(var(--spacing) * 1) 0;
  margin: calc(var(--spacing) / 2) auto;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);

  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
}

._mediaPublication {
  position: relative;
  // margin-bottom: calc(var(--spacing) * 2);
  margin-bottom: 0;

  ::v-deep {
    ._content {
      min-height: calc(24px * 3);
    }
    ._floatingEditBtn[data-action="disable"] {
      display: none;
    }
  }
}
._spacer {
  min-height: 3rem;
  padding: calc(var(--spacing) / 4) 0;
}
</style>
