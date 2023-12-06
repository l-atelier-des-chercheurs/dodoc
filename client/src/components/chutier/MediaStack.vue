<template>
  <ChutierPane @close="$emit('close')">
    <div class="_mediaFocus">
      <div class="_fileStack">
        <transition-group tag="div" class="_itemsList" name="listComplete">
          <div
            class="u-sameRow"
            v-for="(file, index) in files"
            :key="file.$path"
          >
            <div class="_removeFile">
              <sl-icon-button
                name="dash-square-dotted"
                @click="removeFromSelection(file.$path)"
              />
            </div>

            <select
              class="is--dark _changeOrderSelect"
              :value="index + 1"
              @change="changeMediaOrder(index, +$event.target.value - 1)"
            >
              <option
                v-for="(a, i) in new Array(files.length).fill(null)"
                :key="i + 1"
                v-text="i + 1"
              />
            </select>
            <ChutierItem :file="file" :is_selected="false" :context="'stack'" />
          </div>
        </transition-group>
      </div>

      <div class="_fields">
        <small>
          <input
            class="is--dark"
            type="datetime-local"
            v-model="date_created_corrected"
            step="1"
          />
        </small>

        <DateField
          :field_name="'date_created_corrected'"
          :label="$t('date_created')"
          :date="date_created_corrected"
          :path="stack.$path"
          :input_type="'datetime-local'"
          :can_edit="true"
        />

        <span class="u-instructions">
          {{ $t("complete_or_correct_title_kw") }}
        </span>

        <TitleField
          :label="$t('title')"
          :field_name="'title'"
          :content="stack.title"
          :path="stack.$path"
          :input_type="'markdown'"
          :can_edit="true"
        />

        <KeywordsField
          :label="$t('keywords')"
          :field_name="'keywords'"
          :content="stack.keywords"
          :path="stack.$path"
          :can_edit="true"
        />

        <TitleField
          :label="$t('description')"
          :field_name="'description'"
          :content="stack.description"
          :path="stack.$path"
          :input_type="'markdown'"
          :can_edit="true"
        />
      </div>

      <div class="_shareBtn">
        <transition name="scaleInFade" mode="out-in">
          <RemoveMenu @remove="removeStack" />
          <button
            type="button"
            v-if="shared_folder_path"
            :key="share_button_is_enabled"
            class="u-buttonLink"
            :disabled="!share_button_is_enabled"
            @click="shareButtonClicked"
          >
            {{ $t("publish") }}&nbsp;
            <sl-icon name="arrow-right-square" style="font-size: 1rem" circle />
          </button>
        </transition>
      </div>
    </div>
  </ChutierPane>
</template>
<script>
import ChutierPane from "@/components/chutier/ChutierPane.vue";
import KeywordsField from "@/components/KeywordsField.vue";
import ChutierItem from "@/components/chutier/ChutierItem.vue";

export default {
  props: {
    stack: Object,
    files: Array,
  },
  components: {
    ChutierPane,
    KeywordsField,
    ChutierItem,
  },
  inject: {
    $sharedFolderPath: {
      default: false,
    },
  },

  data() {
    return {
      title: "",
      description: "",
      keywords: [],
      date_created_corrected: this.datetimeLocal(
        this.stack.date_created_corrected ||
          this.stack.$date_created ||
          this.stack.$date_uploaded
      ),
    };
  },
  created() {
    const file_dates = this.files.map(
      (f) => f.date_created_corrected || f.$date_created || f.$date_uploaded
    );
    file_dates.sort((a, b) => +new Date(b) - +new Date(a));
    this.date_created_corrected = this.datetimeLocal(file_dates[0]);
  },
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    share_button_is_enabled() {
      return this.stack.title?.length > 0 && this.stack.keywords?.length > 0;
    },
    shared_folder_path() {
      if (this.$sharedFolderPath) return this.$sharedFolderPath();
      return false;
    },
  },
  methods: {
    async changeMediaOrder(old_position, new_position) {
      let meta_filenames = this.files.map((f) => this.getFilename(f.$path));

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
      await this.$api.updateMeta({
        path: this.stack.$path,
        new_meta: {
          stack_files_metas: meta_filenames,
        },
      });
    },
    removeFromSelection(path) {
      let files_path = this.files.map((f) => f.$path);
      files_path = files_path.filter((fp) => fp !== path);
      this.$emit("updateFocusedMedia", files_path);
    },
    async shareButtonClicked() {
      const path_to_destination_type = this.shared_folder_path + "/stacks";
      await this.$api.copyFolder({
        path: this.path,
        path_to_destination_type,
        new_meta: {},
      });
    },
    async removeStack() {
      await this.$api.deleteItem({ path: this.stack.$path });
      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped>
._mediaFocus {
  // background: var(--chutier-bg);
  background: transparent;
  padding: calc(var(--spacing) / 2);
}
._itemsList {
  border: 2px solid #999;
  padding: calc(var(--spacing) / 2);
}

._openLarge {
  display: block;
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
}

._docPreview {
  position: relative;
  height: 70px;
  border-radius: 2px;
  width: 70px;
  flex: 0 0 auto;
  overflow: hidden;

  ::v-deep ._mediaContent--image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
}

._changeOrderSelect {
  flex: 0 0 50px;
}

._fields {
  padding: calc(var(--spacing) * 1);
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 1);
}

sl-icon-button::part(base) {
  color: white;
}
._removeFile {
}
._shareBtn {
  display: flex;
  justify-content: center;
}
._descriptionField {
  resize: vertical;
}
</style>
