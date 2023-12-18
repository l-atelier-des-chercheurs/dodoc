<template>
  <div class="_stackDisplay">
    <LoaderSpinner v-if="is_loading" />
    <template v-else>
      <button
        class="u-button u-button_icon _closeStack"
        @click="$emit('close')"
      >
        <b-icon icon="x-lg" :label="$t('close')" />
      </button>

      <StackCarousel
        v-if="context === 'archive'"
        class="_topCarousel"
        :files="stack_files_in_order"
      />

      <div class="_allFields">
        <div class="_dateFields">
          <div class="">
            <DateField
              :label="$t('created')"
              :field_name="'date_created_corrected'"
              :date="date_created_corrected"
              :path="stack.$path"
              :input_type="'datetime-local'"
              :can_edit="can_edit"
            />
          </div>
          <div class="">
            <DateField
              :label="$t('date_sent')"
              :field_name="'date_modified'"
              :date="stack.$date_modified"
              :path="stack.$path"
              :input_type="'datetime-local'"
              :can_edit="false"
            />
          </div>
        </div>

        <hr />

        <div class="">
          <TitleField
            :label="$t('title')"
            :field_name="'title'"
            :content="stack.title"
            :path="stack.$path"
            :tag="'h1'"
            :can_edit="can_edit"
          />
        </div>

        <hr />

        <div class="">
          <KeywordsField
            :label="$t('keywords')"
            :field_name="'keywords'"
            :keywords="stack.keywords"
            :path="stack.$path"
            :can_edit="can_edit"
          />
        </div>

        <hr />

        <div>
          <TitleField
            :label="$t('description')"
            :field_name="'description'"
            :content="stack.description"
            :path="stack.$path"
            :input_type="'markdown'"
            :can_edit="can_edit"
          />
        </div>

        <transition-group tag="div" class="_fileStack" name="listComplete">
          <div
            class="u-sameRow"
            v-for="(file, index) in stack_files_in_order"
            :key="file.$path"
          >
            <div class="_removeFile">
              <sl-icon-button
                name="dash-square-dotted"
                @click="removeMediaFromStack(file.$path)"
              />
            </div>

            <select
              class="is--dark _changeOrderSelect"
              :value="index + 1"
              @change="changeMediaOrder(index, +$event.target.value - 1)"
            >
              <option
                v-for="(a, i) in new Array(stack_files_in_order.length).fill(
                  null
                )"
                :key="i + 1"
                v-text="i + 1"
              />
            </select>
            <ChutierItem :file="file" :is_selected="false" :context="'stack'" />
          </div>
        </transition-group>

        <template v-if="can_edit">
          <DownloadFolder :path="stack.$path" />
          <RemoveMenu :remove_text="$t('remove_stack')" @remove="removeStack" />
        </template>
      </div>

      <div class="_bottomBtns" v-if="context === 'chutier'">
        <button
          type="button"
          class="u-button u-button_red"
          @click="$emit('close')"
        >
          {{ $t("publish") }}
        </button>
      </div>
    </template>
  </div>
</template>
<script>
import ChutierItem from "@/components/chutier/ChutierItem.vue";
import KeywordsField from "@/components/KeywordsField.vue";
import StackCarousel from "@/components/archive/StackCarousel.vue";

export default {
  props: {
    stack_path: String,
    context: String,
  },
  components: {
    ChutierItem,
    KeywordsField,
    StackCarousel,
  },
  inject: {
    $sharedFolderPath: {
      default: false,
    },
  },
  data() {
    return {
      is_loading: true,
    };
  },
  i18n: {
    messages: {
      fr: {},
    },
  },
  async created() {
    this.stack = await this.$api.getFolder({
      path: this.stack_path,
    });
    this.$api.join({ room: this.stack.$path });
    this.is_loading = false;

    this.date_created_corrected = this.datetimeLocal(
      this.stack.date_created_corrected ||
        this.stack.$date_created ||
        this.stack.$date_uploaded
    );

    // check if $preview is set to first image
    if (this.stack_files_in_order.length > 0) {
      const first_file_path = this.stack_files_in_order[0].$path;
      if (this.stack.$preview?.$path !== first_file_path) {
        await this.$api.updateMeta({
          path: this.stack.$path,
          new_meta: {
            $preview: this.getFilename(first_file_path),
          },
        });
      }
    }
  },
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    can_edit() {
      if (!this.stack) return false;
      return this.canLoggedinEditFolder({ folder: this.stack });
    },
    stack_files() {
      if (this.stack?.$files && this.stack.$files.length > 0)
        return this.stack.$files;
      return [];
    },
    stack_files_in_order() {
      if (this.stack_files.length === 0 || !this.stack?.stack_files_metas)
        return [];

      return this.stack.stack_files_metas.reduce((acc, meta_filename) => {
        const file = this.stack_files.find(
          (f) => this.getFilename(f.$path) === meta_filename
        );
        if (file) acc.push(file);
        return acc;
      }, []);
    },
  },
  methods: {
    async changeMediaOrder(old_position, new_position) {
      let meta_filenames = this.stack_files_in_order.map((f) =>
        this.getFilename(f.$path)
      );

      function array_move(arr, old_index, new_index) {
        if (new_index >= arr.length) {
          var k = new_index - arr.length + 1;
          while (k--) {
            arr.push(undefined);
          }
        }
        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
        return arr; // for testing
      }
      array_move(meta_filenames, old_position, new_position);

      let new_meta = {
        stack_files_metas: meta_filenames,
      };

      if (
        !this.stack.$preview?.$path ||
        this.getFilename(this.stack.$preview?.$path) !== meta_filenames.at(0)
      )
        new_meta.$preview = meta_filenames.at(0);

      await this.$api.updateMeta({
        path: this.stack.$path,
        new_meta,
      });
    },

    async removeMediaFromStack(file_path) {
      await this.$api.copyFile({
        path: file_path,
        path_to_destination_folder: this.connected_as.$path,
        new_meta: {},
      });
      await this.$api.deleteItem({ path: file_path });

      let stack_files_metas = this.stack?.stack_files_metas.slice();
      stack_files_metas = stack_files_metas.filter((m) => m !== file_path);
      await this.$api.updateMeta({
        path: this.stack.$path,
        new_meta: {
          stack_files_metas,
        },
      });
    },
    async removeStack() {
      await this.$api.deleteItem({ path: this.stack.$path });
      this.$emit("close");
    },
    closeOnRemove({ path }) {
      if (path === this.stack.$path) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .log(this.$t("notifications.stack_was_removed"));
        this.$emit("close");
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._stackDisplay {
  position: absolute;
  inset: 0;
  z-index: 100;

  background: var(--sd-bg);
  color: var(--sd-textcolor);

  display: flex;
  flex-flow: column nowrap;

  > ._allFields {
    overflow: auto;
    flex: 1 1 0;
    padding: calc(var(--spacing) * 2);
  }
  > ._bottomBtns {
    flex: 0 0 auto;
    padding: calc(var(--spacing) * 2);
  }
}

._topCarousel {
  height: 60vh;
  width: 100%;
  background: white;
}

._allFields > * {
  // padding-bottom: calc(var(--spacing) * 2);
}

hr {
  border-color: var(--sd-separator);
}
._dateFields {
  display: flex;
  flex-flow: row nowrap;
  gap: calc(var(--spacing) * 1);

  > * {
    flex: 1 1 50px;
  }
}

._closeStack {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
  padding: calc(var(--spacing) / 1);
}

._fileStack {
  border: 2px solid var(--sd-separator);
  padding: calc(var(--spacing) / 2);
  margin: calc(var(--spacing) * 2) 0;
}

._changeOrderSelect {
  flex: 0 0 50px;
}
</style>
