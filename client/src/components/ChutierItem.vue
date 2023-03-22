<template>
  <div
    class="_chutierItem"
    :class="{
      'is--clicked': is_clicked,
    }"
  >
    <div class="_rows">
      <div class="u-sameRow">
        <label :for="id" class="_selectBox">
          <input
            type="checkbox"
            :checked="is_selected"
            :name="id"
            @change="$emit('toggleSelect')"
            :id="id"
          />
        </label>
        <div class="_openLarge" @click="show_large = true">
          <MediaContent
            class="_chutierItem--preview"
            :file="file"
            :context="'preview'"
          />
        </div>
        <div class="">
          <div>
            <small>
              <DateField
                :date="file.$date_created"
                :show_detail_initially="false"
              />
            </small>

            <span v-if="!edit_mode">
              {{ text_title }}
            </span>

            <template v-else>
              <input
                type="text"
                required
                v-model="text_title"
                @click="setFocus"
                placeholder="Remplir pour partager"
              />
            </template>
          </div>
        </div>
        <EditBtn v-if="!edit_mode" @click="edit_mode = true" />
      </div>
      <transition name="scaleInFade" mode="out-in">
        <!-- <sl-button
          size="small"
        > -->
        <sl-icon-button
          :key="share_button_is_enabled"
          class="_shareBtn"
          :class="{
            'is--disabled': !share_button_is_enabled,
          }"
          name="arrow-right-square"
          style="font-size: 1rem"
          :label="$t('share')"
          circle
          @click="shareButtonClicked"
        />
        <!-- </sl-button> -->
      </transition>

      <!-- <TitleField
      :field_name="'title'"
      class="_title"
      :content="file.title || file.$media_filename"
      :path="file.$path"
      :required="true"
      :maxlength="40"
      :can_edit="true"
    />
    <TitleField
      :field_name="'description'"
      class="_description"
      :content="file.description"
      :path="file.$path"
      :required="false"
      :maxlength="240"
      :can_edit="true"
    /> -->
      <!-- <DateField :date="file.$date_created" :show_detail_initially="true" /> -->

      <!-- <div class="">
      <button
        type="button"
        class="u-button u-button_transparent"
        @click="remove"
      >
        <sl-icon name="trash3" />
      </button>
      <button
        type="button"
        class="u-button u-button_transparent"
        @click="$emit('focus')"
      >
        {{ $t("share") }}
      </button>
    </div> -->
    </div>

    <div class="_keywords" v-if="edit_mode || keywords || description">
      <div v-if="!edit_mode">
        <div class="" v-if="description">
          {{ description }}
        </div>
        <div class="" v-if="keywords">
          <span class="u-button u-button_orange">
            {{ keywords }}
          </span>
        </div>
      </div>
      <template v-else>
        <input type="text" v-model="description" placeholder="Description" />
        <input
          type="text"
          required
          v-model="keywords"
          placeholder="Mot-clé, matériaux, lieux, etc."
        />

        <span class="u-instructions" v-if="keywords.length === 0">
          Corrigez ou complétez le titre et les mots-clés pour partager ce
          document.
        </span>

        <div class="_suggestions" v-else>
          <button
            type="button"
            class="u-button u-button_orange"
            v-for="cat in panes[0].categories"
            :key="cat"
          >
            {{ cat }}
          </button>
        </div>
      </template>
    </div>

    <!-- <div class="_paneSelector" v-if="is_focused">
      <template v-if="!opened_pane">
        <div class="">
          <label for="">Indiquez aussi au moins l'un de ces trois champs</label>
        </div>
        <div class="_paneSelector--btns">
          <button
            type="button"
            class="u-button"
            v-for="pane in panes"
            :key="pane.key"
            @click="opened_pane = pane.key"
          >
            {{ pane.label }}
          </button>
        </div>
      </template>
      <div class="" v-else>
        {{ $t(opened_pane) }}
        <button type="button" @click="opened_pane = false">
          {{ $t("close") }}
        </button>
      </div>
    </div> -->

    <!-- <details>
      <summary>Avancé</summary> -->

    <!-- <select>
        <option>visible par tout Luma</option>
        <option>collaborateurs de Clay</option>
        <option>collaborateurs Lot 8</option>
      </select> -->

    <!-- <button
          type="button"
          class="_catBtn"
          v-for="cat in categories"
          :key="cat"
        >
          {{ cat }}
        </button>
        <input type="text" /> -->
    <!-- </details> -->

    <div v-if="show_large" class="_largePreview" @click="show_large = false">
      <MediaContent :file="file" :context="'full'" :resolution="1600" />
      <sl-button
        variant="default"
        size="medium"
        class="_closeBtn"
        circle
        @click="show_large = false"
      >
        <sl-icon name="x-lg" :label="$t('close')"></sl-icon>
      </sl-button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    file: Object,
    is_selected: Boolean,
    is_clicked: Boolean,
    shared_space_path: String,
  },
  components: {},
  data() {
    return {
      is_focused: false,
      opened_pane: undefined,
      show_large: false,
      edit_mode: false,
      id: `select_chutier_item_${(
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 3 + 2)}`,

      panes: [
        {
          key: "materials",
          label: this.$t("materials"),
          categories: [
            "abjection",
            "abjections",
            "abjectly",
            "abjectness",
            "abjectnesses",
            "abjects",
            "abjoint",
            "abjointed",
            "abjointing",
            "abjoints",
            "abjunction",
            "abjunctions",
            "abjuration",
            "abjurations",
            "abjure",
            "abjured",
            "abjurer",
            "abjurers",
            "abjures",
            "abjuring",
          ],
        },
        {
          key: "techniques",
          label: this.$t("techniques"),
        },
        {
          key: "implementations",
          label: this.$t("implementations"),
        },
      ],

      text_title:
        this.file.title || this.cleanFilename(this.file.$media_filename) || "",
      description: this.file.description || "",
      keywords: this.file.keywords || "",
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    is_clicked() {
      if (!this.is_clicked && this.edit_mode) {
        // todo save
        this.saveFields();
        this.edit_mode = false;
      }
    },
  },
  computed: {
    share_button_is_enabled() {
      return this.text_title.length > 0 && this.keywords.length > 0;
    },
  },
  methods: {
    async moveToSharedSpace() {
      const destination_path_to_folder = this.shared_space_path;
      await this.$api.copyFile({
        path: this.file.$path,
        destination_path_to_folder,
        new_meta: {
          $authors: [this.connected_as.$path],
        },
      });
      await this.remove();
    },
    async remove() {
      this.$api.deleteItem({ path: this.file.$path });
    },
    cleanFilename() {
      return this.file.$media_filename.substring(
        0,
        this.file.$media_filename.lastIndexOf(".")
      );
    },
    async shareButtonClicked() {
      if (this.share_button_is_enabled) {
        if (this.edit_mode) {
          await this.saveFields();
          await this.moveToSharedSpace();
          return;
        } else {
          await this.moveToSharedSpace();
        }
      } else {
        this.edit_mode = true;
      }
    },
    setFocus() {
      this.is_focused = true;
    },
    openLarge() {
      this.$emit("");
    },
    async saveFields() {
      await this.$api
        .updateMeta({
          path: this.file.$path,
          new_meta: {
            title: this.text_title,
            description: this.description,
            keywords: this.keywords,
          },
        })
        .catch((err) => {
          this.$alertify.delay(4000).error(err);
          throw err;
        });
    },
    save() {},
    cancel() {
      this.edit_mode = false;
      // todo reset
    },
  },
};
</script>
<style lang="scss" scoped>
._chutierItem {
  width: 100%;
  padding: 2px;
  margin: 2px;
  background: hsla(0, 0%, 100%, 0.1);
  box-shadow: 0 0px 5px rgba(255 255 255 / 6%);
  // border: 2px solid black;
  border-radius: 5px;

  &.is--clicked {
    border-color: #333;
  }
  // border: 1px solid black;
}

._rows {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  gap: calc(var(--spacing) / 2);
}

._chutierItem--preview {
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

._catBtn {
  background: #ffbe32;
  border-radius: 5px;
  margin: 2px;
  padding: 2px;
}

._paneSelector {
  text-align: center;
}
._paneSelector--btns {
  min-height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: calc(var(--spacing) / 4);
}
._openLarge {
  display: block;
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
}
._largePreview {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;

  // display: flex;
  // place-content: center;
  background: black;

  ::v-deep ._mediaContent {
    width: 100%;
    height: 100%;

    .u-floatingFsButton {
      display: none;
    }

    ._mediaContent--image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: center;
    }
  }

  ._closeBtn {
    position: absolute;
    top: 0;
    right: 0;
    margin: calc(var(--spacing) / 2);
  }
}

._keywords {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 2);
  padding: calc(var(--spacing) / 2);

  justify-content: center;
}

._shareBtn {
  &.is--disabled {
    opacity: 0.3;
  }

  &::part(base) {
    color: #fff;

    &:hover,
    &:focus {
      color: var(--c-bleuvert);
    }
    &:active {
      color: #ccc;
    }
  }
}
._selectBox {
  height: 70px;
  display: flex;
  place-content: center;
}
</style>
