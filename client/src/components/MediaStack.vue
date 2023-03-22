<template>
  <div class="_mediaFocus" @click="last_clicked = false">
    <sl-button
      class="_closeBtn"
      variant="neutral"
      size="medium"
      circle
      @click="$emit('close')"
    >
      <sl-icon name="x-lg" :label="$t('close')"></sl-icon>
    </sl-button>

    <div class="_fileStack">
      <transition-group tag="div" class="_itemsList" name="listComplete">
        <div
          class="u-sameRow"
          v-for="(file, index) in files"
          :key="file.$path"
          @click.stop="last_clicked = file.$path"
        >
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
          <div class="_removeFile">
            <sl-icon-button
              name="dash-square-dotted"
              @click="removeFromSelection(file.$path)"
            />
          </div>
          <ChutierItem
            :file="file"
            :is_clicked="last_clicked === file.$path"
            :is_selected="false"
            :context="'stack'"
            @unclicked="last_clicked = false"
          />
        </div>
      </transition-group>
    </div>

    <div class="_fields">
      <input
        type="text"
        class="is--dark"
        required
        v-model="title"
        placeholder="Titre"
      />
      <input
        type="text"
        class="is--dark"
        v-model="description"
        placeholder="Description"
      />
      <input
        type="text"
        class="is--dark"
        required
        v-model="keywords"
        placeholder="Mot-clé, matériaux, lieux, etc."
      />

      <span class="u-instructions" v-if="keywords.length === 0">
        Corrigez ou complétez le titre et les mots-clés pour partager cette
        pile.
      </span>
    </div>

    <div class="_shareBtn">
      <transition name="scaleInFade" mode="out-in">
        <sl-icon-button
          :key="share_button_is_enabled"
          class="u-shareBtn"
          :class="{
            'is--disabled': !share_button_is_enabled,
          }"
          name="arrow-right-square"
          style="font-size: 1rem"
          :label="$t('share')"
          circle
          @click="shareButtonClicked"
        />
      </transition>
    </div>
  </div>
</template>
<script>
import ChutierItem from "@/components/ChutierItem.vue";
export default {
  props: {
    files: Array,
    shared_space_path: String,
  },
  components: {
    ChutierItem,
  },
  data() {
    return {
      last_clicked: undefined,
      title: "",
      description: "",
      keywords: "",
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    share_button_is_enabled() {
      return this.title.length > 0 && this.keywords.length > 0;
    },
  },
  methods: {
    changeMediaOrder(old_position, new_position) {
      let files_path = this.files.map((f) => f.$path);
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
      array_move(files_path, old_position, new_position);
      this.$emit("updateFocusedMedia", files_path);
    },
    removeFromSelection(path) {
      let files_path = this.files.map((f) => f.$path);
      files_path = files_path.filter((fp) => fp !== path);
      this.$emit("updateFocusedMedia", files_path);
    },
    async shareButtonClicked() {
      const destination_path_to_folder = this.shared_space_path;

      // get fields
      this.title, this.description, this.keywords;

      const additional_meta = {
        title: this.title,
        description: this.description,
        keywords: this.keywords,
        requested_slug: "stack",
        is_stack: true,
        stack_files_metas: [],
      };
      const stack_meta_filename = await this.$api
        .uploadFile({
          path: destination_path_to_folder,
          additional_meta,
        })
        .catch((err) => {
          this.$alertify.delay(4000).error(err);
          throw err;
        });

      const file_metas = [];
      // copy each file to shared space, with a flag to indicate they are part of a stack
      for (const file of this.files) {
        const file_meta = await this.$api.copyFile({
          path: file.$path,
          destination_path_to_folder,
          new_meta: {
            $authors: [this.connected_as.$path],
            belongs_to_stack: stack_meta_filename,
          },
        });
        file_metas.push(file_meta);
        await this.$api.deleteItem({ path: file.$path });
      }

      // add file metas to stack meta
      await this.$api.updateMeta({
        path: destination_path_to_folder + "/" + stack_meta_filename,
        new_meta: {
          stack_files_metas: file_metas,
        },
      });

      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped>
._mediaFocus {
  background: var(--chutier-bg);
  padding: calc(var(--spacing) / 2);
}
._itemsList {
  border: 2px solid #999;
  padding: calc(var(--spacing) / 2);
}
._closeBtn {
  position: absolute;
  top: 0;
  right: 0;
  padding: 5px;
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
  padding: calc(var(--spacing) * 2);
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
</style>
