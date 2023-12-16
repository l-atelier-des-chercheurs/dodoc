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
        <div class="">
          <KeywordsField
            :label="$t('keywords')"
            :field_name="'keywords'"
            :content="stack.keywords"
            :path="stack.$path"
            :can_edit="can_edit"
          />
        </div>
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

        <div class="_fileStack">
          <transition-group tag="div" class="_itemsList" name="listComplete">
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
              <ChutierItem
                v-if="context === 'chutier'"
                :file="file"
                :is_selected="false"
                :context="'stack'"
              />
            </div>
          </transition-group>
        </div>
      </div>

      <div class="">
        <div class="_shareBtn">
          <RemoveMenu :remove_text="$t('remove_stack')" @remove="removeStack" />
          <button type="button" class="u-buttonLink" @click="$emit('close')">
            {{ $t("save_as_draft") }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
import ChutierItem from "@/components/chutier/ChutierItem.vue";
import KeywordsField from "@/components/KeywordsField.vue";

export default {
  props: {
    stack_path: String,
    context: String,
  },
  components: {
    ChutierItem,
    KeywordsField,
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
  overflow: hidden;
  inset: 0;
  z-index: 100;
  padding: calc(var(--spacing) * 2);
}
._allFields {
  > * {
    margin-bottom: calc(var(--spacing) * 2);
    padding-bottom: calc(var(--spacing) * 2);
    border-bottom: 2px solid hsl(257, 4%, 35%);
  }
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
  padding: calc(var(--spacing) / 1);
}

._itemsList {
  border: 2px solid #999;
  padding: calc(var(--spacing) / 2);
}

._changeOrderSelect {
  flex: 0 0 50px;
}
</style>
