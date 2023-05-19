<template>
  <div class="_pickNativePath">
    <DLabel
      :str="$t('path_to_content')"
      :instructions="$t('path_to_content_instructions')"
    />

    <div class="u-spacingBottom _sameLine">
      <input type="text" required readonly v-model="new_path" />
      <EditBtn v-if="can_edit && !edit_mode" @click="enableEditMode" />
    </div>

    <div v-if="can_edit" class="u-spacingBottom">
      <template v-if="edit_mode">
        <button
          type="button"
          class="u-button u-button_bleuvert"
          @click="changeStorage"
        >
          Sélectionner un chemin sur le disque
        </button>

        <br />
        <br />

        <div class="_footer">
          <SaveCancelButtons
            class="_scb"
            :is_saving="is_saving"
            :allow_save="allow_save"
            @save="updatePath"
            @cancel="cancel"
          />
        </div>
      </template>
    </div>

    <div class="" v-if="$root.app_infos.is_electron && is_instance_admin">
      <div class="u-spacingBottom" />
      <button
        type="button"
        class="u-button u-button_bleumarine u-button_small"
        @click="openInFinder(new_path)"
      >
        {{ $t("open_in_finder") }}
      </button>
    </div>
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
      new_path: this.path_to_storage,

      current_character_count: undefined,
      allow_save: false,
    };
  },
  created() {},
  async mounted() {
    this.path_to_storage = await this.$api.getStoragePath();
  },
  beforeDestroy() {},
  watch: {
    path_to_storage() {
      this.new_path = this.path_to_storage;
    },
  },
  computed: {},
  methods: {
    enableEditMode() {
      this.edit_mode = true;
    },
    changeStorage() {
      window.electronAPI.send("toMain", {
        type: "get_path",
      });
      window.electronAPI.receive("fromMain", ({ type, path_to_content }) => {
        if (type === "new_path") {
          this.new_path = path_to_content;
          this.edit_mode = true;
          this.allow_save = this.new_path !== this.path_to_storage;
        }
      });
    },
    openInFinder(absolute_path) {
      window.electronAPI.send("toMain", {
        type: "open_path",
        absolute_path,
      });
    },
    cancel() {
      this.edit_mode = false;
      this.is_saving = false;
      this.new_path = this.path_to_storage;

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
      } catch (e) {
        this.is_saving = false;

        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.couldntbesaved"));
        this.$alertify.closeLogOnClick(true).error(e.response.data);
      }
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
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: row wrap;
  font-size: 1rem;
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

._scb {
}

._sameLine {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 4);
}
</style>
