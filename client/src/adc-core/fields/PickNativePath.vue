<template>
  <div class="_pickNativePath">
    <DLabel
      :str="$t('path_to_content')"
      :instructions="$t('path_to_content_instructions')"
    />

    <div class="_sameLine">
      <div class="u-filename">
        <span :style="{ textDecoration: new_path ? 'line-through' : 'none' }">{{
          path_to_storage
        }}</span>
      </div>
      <EditBtn
        v-if="can_edit && !edit_mode"
        :label_position="'left'"
        @click="changeStorage"
      />
    </div>
    <div class="u-filename" v-if="new_path">
      {{ new_path }}
    </div>

    <template v-if="can_edit">
      <div class="u-spacingBottom" />

      <div v-if="edit_mode" class="u-spacingBottom">
        <!-- <button
        type="button"
        class="u-button u-button_bleuvert"
        @click="changeStorage"
      >
        Sélectionner un chemin sur le disque
      </button> -->
        <div class="_footer">
          <SaveCancelButtons
            :is_saving="is_saving"
            :allow_save="allow_save"
            @save="updatePath"
            @cancel="cancel"
          />
        </div>
      </div>

      <template v-else>
        <template v-if="path_is_changed">
          <div class="u-errorMsg">
            {{ $t("restart_to_apply") }}
          </div>
          <button
            type="button"
            class="u-button u-button_red"
            @click="restartApp"
          >
            {{ $t("restart") }}
          </button>
        </template>
        <template v-else>
          <div class="">
            <button
              type="button"
              class="u-button u-button_bleumarine u-button_small"
              @click="openInFinder({ absolute_path: path_to_storage })"
            >
              {{ $t("open_in_finder") }}
            </button>
          </div>
        </template>
      </template>
    </template>
  </div>
</template>
<script>
export default {
  props: {
    can_edit: {
      type: Boolean,
    },
  },
  components: {},
  data() {
    return {
      field_name: "pathToUserContent",
      edit_mode: false,
      is_saving: false,
      path_to_storage: undefined,
      new_path: undefined,

      current_character_count: undefined,
      allow_save: true,

      path_is_changed: false,
    };
  },
  created() {},
  async mounted() {
    this.path_to_storage = await this.$api.getStoragePath();
  },
  beforeDestroy() {},
  watch: {
    path_to_storage() {
      // this.new_path = this.path_to_storage;
      // this.current_path = this.path_to_storage;
    },
  },
  computed: {},
  methods: {
    changeStorage() {
      window.electronAPI.send("toMain", {
        type: "get_path",
      });
      window.electronAPI.receive("fromMain", ({ type, path_to_content }) => {
        if (type === "new_path") {
          this.new_path = path_to_content;
          this.edit_mode = true;
        }
      });
    },
    cancel() {
      this.edit_mode = false;
      this.is_saving = false;
      this.new_path = undefined;

      this.$nextTick(() => {
        // this.content = "";
        // this.$nextTick(() => {
        // this.content = this.new_path;
        // });
      });

      // todo interrupt updateMeta
    },
    async updatePath() {
      this.is_saving = true;
      await new Promise((r) => setTimeout(r, 50));

      try {
        await this.$api.updateMeta({
          path: "_storagePath",
          new_meta: {
            new_path: this.new_path,
          },
        });

        this.edit_mode = false;
        this.is_saving = false;
        this.path_is_changed = true;
      } catch (e) {
        this.is_saving = false;

        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("couldntbesaved"));
        this.$alertify.closeLogOnClick(true).error(e.response.data);
      }
    },
    restartApp() {
      this.$api.restartApp();
    },
  },
};
</script>
<style lang="scss" scoped>
._pickNativePath {
  width: 100%;

  ._content {
    white-space: break-spaces;
    margin-right: calc(var(--spacing) / 2);
  }
}

._footer {
  // display: flex;
  // justify-content: flex-start;
  // align-items: center;
  // flex-flow: row wrap;
  // font-size: 1rem;
  width: 250px;
  font-weight: 400;
  margin: 0;
  padding: calc(var(--spacing) / 4) 0;
  gap: calc(var(--spacing) / 4);
}

._container {
  margin: 0;
}

._cont {
  display: inline-grid;
  align-items: stretch;

  &::after,
  textarea {
    grid-area: 2/1;

    width: auto;
    min-width: 1em;
    font: inherit;
    margin: 0;
    resize: none;
    padding: 0.25em;
  }

  &::after {
    content: attr(data-value) " ";
    visibility: hidden;
    white-space: break-spaces;
  }
}

._sameLine {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 4);
}
</style>
