<template>
  <BaseModal2 :size="'full'" @close="$emit('close')">
    <div class="_modalContent">
      <div class="_topContent">
        <!-- <pre>
         {{ file }}
        </pre> -->
        <div class="_openedFile">
          <transition name="scaleInFade_fast" mode="out-in">
            <div :key="current_file_shown.$path" class="_openedFile--container">
              <div class="_openedFile--media">
                <MediaContent
                  :file="current_file_shown"
                  :context="'full'"
                  :resolution="1600"
                />
              </div>
              <div class="_openedFile--title" v-if="file._stack_files">
                <!-- // todo date title editor -->
                <div class="_date">
                  <DateField
                    v-if="file.date_created_corrected"
                    :date="file.date_created_corrected"
                  />
                  <span v-else v-html="'–'" />
                </div>
                <div v-text="current_file_shown.title || '–'" class="_title" />
              </div>
            </div>
          </transition>
        </div>

        <div class="_otherFromStacks">
          <template v-if="file._stack_files">
            <div
              v-for="(file, index) in file._stack_files"
              :key="file.$path"
              :class="{
                'is--shown': current_file_index_shown === index,
              }"
              @click="current_file_index_shown = index"
            >
              <MediaContent :file="file" :context="'full'" :resolution="1600" />
            </div>
          </template>
          <sl-icon-button
            name="plus-circle"
            circle
            class="_appendMedia"
            disabled
          />
        </div>
      </div>
      <div class="_bottomContent">
        <!-- date shown only for single medias, no stack dates -->
        <div v-if="!file._stack_files">
          <DateField
            v-if="file.date_created_corrected"
            :date="file.date_created_corrected"
          />
        </div>

        <!-- media title or stack title -->
        <h1>
          {{ file.title }}
        </h1>
        <hr />
        <p>
          {{ file.description || "–" }}
        </p>
        <hr />
        <div
          class=""
          v-if="
            (file.keywords &&
              Array.isArray(file.keywords) &&
              file.keywords.length > 0) ||
            edit_mode
          "
        >
          <KeywordsField
            :edit_mode="edit_mode"
            :keywords="file.keywords"
            @cancelEdit="[]"
          />
        </div>

        <sl-icon-button
          name="trash3"
          circle
          class="_removeBtn"
          @click="removeMedia(file.$path)"
        />
      </div>
    </div>
  </BaseModal2>
</template>
<script>
import KeywordsField from "@/components/KeywordsField.vue";

export default {
  props: {
    file: Object,
  },
  components: {
    KeywordsField,
  },
  data() {
    return {
      current_file_index_shown: 0,
      edit_mode: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    current_file_shown() {
      if (this.file._stack_files)
        return this.file._stack_files[this.current_file_index_shown];
      return this.file;
    },
  },
  methods: {
    removeMedia(path) {
      this.$api.deleteItem({ path });
    },
  },
};
</script>
<style lang="scss" scoped>
._modalContent {
  // position: absolute;
  // background: white;

  background: #efefef;
  padding: 0;
  min-height: 100%;
}

._topContent {
  background: #d9d9d9;
  height: 50vh;
  // padding: calc(var(--spacing) * 1) calc(var(--spacing) * 2);

  display: flex;
  flex-flow: row wrap;

  > * {
    flex: 4 1 320px;
    position: relative;

    &._otherFromStacks {
      flex: 1 1 100px;
    }
  }
}

._openedFile {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

._openedFile--container {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  margin: calc(var(--spacing) / 2) calc(var(--spacing) * 2);

  display: flex;
  flex-flow: column nowrap;
  justify-content: stretch;
}
._openedFile--media {
  flex: 1 1 auto;
  overflow: hidden;
  position: relative;
  margin: calc(var(--spacing) * 2);

  ::v-deep {
    ._mediaContent {
      // position: absolute;
      // width: 100%;
      // height: 100%;
      // pointer-events: auto;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;

      ._mediaContent--image {
        position: absolute;
        width: 100%;
        height: 100%;

        object-fit: contain;
        max-width: none;
      }
    }
  }
}
._openedFile--title {
  flex: 0 0 auto;
  background: #efefef;
  padding: calc(var(--spacing) * 1) calc(var(--spacing) * 1);
  margin: calc(var(--spacing) * 1);
  margin-top: 0;
}
._date {
  margin-bottom: calc(var(--spacing) * 1);
}
._title {
}

._otherFromStacks {
  flex: 1 1 100px;
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) * 2);
  padding: calc(var(--spacing) * 2);
  overflow: auto;
  height: 100%;

  > * {
    cursor: pointer;
    &.is--shown {
      opacity: 0.5;
    }
  }
}

._appendMedia {
  display: flex;
  align-content: center;
  justify-content: center;
  font-size: 175%;
}

._bottomContent {
  padding: calc(var(--spacing) * 2) calc(var(--spacing) * 3);

  h1 {
    font-weight: 300;
    font-size: var(--sl-font-size-x-large);
  }
  hr {
    border-color: #cccccc;
    max-width: 50px;
    margin: calc(var(--spacing) * 2) 0;
  }
}
</style>
