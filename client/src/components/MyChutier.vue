<template>
  <div class="_myChutier" v-if="chutier" @click="last_clicked = false">
    <portal-target name="largemedia" multiple />

    <div class="_itemsList" @click.self="selected_items_slugs = []">
      <div class="_topContent">
        <div class="_subscribeBtn">
          <button
            type="button"
            class="u-buttonLink _authorBtn"
            @click="$eventHub.$emit('showAuthorModal')"
          >
            <template v-if="connected_as">
              {{ connected_as.name }}
            </template>
            <template v-else>{{ $t("login") }}</template>
          </button>

          <button
            type="button"
            class="u-button u-button_icon _qrBtn"
            @click="show_qr_code_modal = true"
          >
            <sl-icon name="qr-code" />
          </button>
          <QRModal
            v-if="show_qr_code_modal"
            :url_to_access="url_to_page"
            @close="show_qr_code_modal = false"
          />
          <button
            type="button"
            class="u-button u-button_icon _qrBtn"
            @click="$eventHub.$emit(`app.show_welcome_modal`)"
          >
            <sl-icon name="question-square" />
          </button>
        </div>

        <div class="_importButton">
          <!-- // TODO create component -->
          <div
            class="_importButton--cnt"
            :class="{
              'is--dragover': is_dragover,
            }"
            @dragover="onDragover"
            @dragenter="onDragEnter"
            @dragleave="onDragLeave"
            @drop="onDrop"
          >
            <label
              :for="id + '-add_file'"
              class="u-button u-button_red _importButton--btn"
            >
              <svg width="20" height="17" viewBox="0 0 20 17">
                <path
                  d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"
                />
              </svg>
              <span>
                {{ $t("import") }}
              </span>
            </label>
            <input
              type="file"
              multiple="multiple"
              :id="id + '-add_file'"
              name="file"
              accept=""
              class=""
              @change="updateInputFiles($event)"
            />
            <UploadFiles
              v-if="files_to_import.length > 0"
              class="_uploadFilesList"
              :files_to_import="files_to_import"
              :path="author_path"
              @importedMedias="importedMedias"
              @close="files_to_import = []"
            />

            <button
              type="button"
              class="u-button u-button_white _qrBtn"
              @click="createNote"
            >
              <sl-icon name="file-text" />
              &nbsp; note
            </button>

            <button
              type="button"
              class="u-button u-button_white _qrBtn"
              @click="show_link_picker = true"
            >
              <sl-icon name="link-45deg" />
              &nbsp; url
            </button>
            <LinkPicker
              v-if="show_link_picker"
              @embed="createEmbed"
              @close="show_link_picker = false"
            />

            <!-- <div class="u-instructions">
              {{ $t("or_drag_drop_file_here").toLowerCase() }}
            </div> -->
          </div>
        </div>
      </div>

      <div class="_middleContent">
        <div
          v-if="!chutier_items || chutier_items.length === 0"
          class="u-instructions"
        >
          {{ $t("imported_docs") }}
        </div>
        <template v-else>
          <label
            for=""
            class="_item--label"
            :class="{
              'is--fullySelected': all_items_selected,
            }"
            @click="!all_items_selected ? selectAll() : deselectAll()"
          >
            <button
              type="button"
              class="u-buttonLink u-selectBtn"
              v-if="chutier_items.length > 0"
            >
              <sl-icon
                :name="
                  !all_items_selected
                    ? 'plus-square-dotted'
                    : 'dash-square-dotted'
                "
              />
            </button>
            {{ $t("items_to_share") }} • {{ chutier_items.length }}
          </label>
        </template>
      </div>

      <div class="_items" @click.self="selected_items_slugs = []">
        <div
          class="_item"
          v-for="ci in chutier_items_grouped"
          :key="ci.label"
          @click.self="selected_items_slugs = []"
        >
          <div
            class="_item--label"
            @click="
              rangeIsSelected(ci.files.map((f) => f.$path))
                ? deselectRange(ci.files.map((f) => f.$path))
                : selectRange(ci.files.map((f) => f.$path))
            "
            :class="{
              'is--fullySelected': rangeIsSelected(
                ci.files.map((f) => f.$path)
              ),
            }"
          >
            <button
              v-if="!rangeIsSelected(ci.files.map((f) => f.$path))"
              type="button"
              class="u-buttonLink u-selectBtn"
            >
              <sl-icon name="plus-square-dotted" />
            </button>
            <button v-else type="button" class="u-buttonLink u-selectBtn">
              <sl-icon name="dash-square-dotted" />
            </button>
            {{ ci.label }}
          </div>
          <transition-group tag="div" name="listComplete">
            <ChutierItem
              v-for="file in ci.files"
              :key="file.$path"
              :file="file"
              :is_clicked="last_clicked === file.$path"
              :is_selected="selected_items_slugs.includes(file.$path)"
              :draggable="true"
              @toggleSelect="toggleSelect(file.$path)"
              @unclicked="last_clicked = false"
              @click.stop="last_clicked = file.$path"
            />
          </transition-group>
        </div>
      </div>
    </div>
    <DocumentsCreator
      class="_documentsCreator"
      :author_stacks_path="author_stacks_path"
      :selected_items="selected_items"
    />
    <!-- v-if="selected_items.length > 0" -->

    <transition name="slideup" mode="out-in">
      <div
        class="_selectionBar"
        v-if="selected_items.length > 0"
        key="selection"
      >
        <transition name="slideupFade" mode="out-in">
          <div :key="selected_items.length">
            <template v-if="selected_items.length === 1">
              {{ $t("selected_item") }}
            </template>
            <template v-else>
              {{ $t("selected_items") }}
            </template>
            {{ selected_items.length }}
          </div>
        </transition>
        <!-- <div class="_selectionBar--previews">
          <template v-for="file in selected_items">
            <MediaContent
              v-if="file.$path"
              :key="file.$path"
              :file="file"
              class="_selectionBar--previews--preview"
              :context="'preview'"
            />
          </template>
        </div> -->
        <!-- <button
          type="button"
          class="u-button u-button_bleuvert"
          @click="show_mediastack_modal = true"
        >
          {{ $t("create_stack") }} ({{ selected_items.length }})
        </button> -->

        <div class="u-sameRow _dbleBtns">
          <button
            type="button"
            class="u-button u-button_black"
            @click="deselectAll"
          >
            <sl-icon name="dash-square-dotted" />
            {{ $t("deselect_all") }}
          </button>
          <button
            type="button"
            class="u-button u-button_black"
            @click="show_confirm_remove_menu = true"
          >
            <sl-icon name="trash3" />
            {{ $t("remove_select") }}
          </button>
        </div>
      </div></transition
    >
    <transition name="slideup" mode="out-in">
      <div class="_removeMenu" v-if="show_confirm_remove_menu" key="remove">
        <button
          type="button"
          class="u-buttonLink"
          @click="show_confirm_remove_menu = false"
        >
          {{ $t("cancel") }}
        </button>
        <button
          class="u-button u-button_red"
          type="button"
          autofocus
          @click="removeItemsInSelection"
        >
          {{ $t("confirm_removal") }}
        </button>
      </div>
    </transition>
  </div>
</template>
<script>
import DocumentsCreator from "@/components/chutier/DocumentsCreator.vue";
import LinkPicker from "@/adc-core/modals/LinkPicker.vue";
import ChutierItem from "@/components/chutier/ChutierItem.vue";

export default {
  props: {
    shared_folder_path: String,
  },
  components: {
    DocumentsCreator,
    LinkPicker,
    ChutierItem,
  },
  provide() {
    return {
      $sharedFolderPath: () => this.shared_folder_path,
    };
  },
  i18n: {
    messages: {
      fr: {
        imported_docs:
          "Les médias importés apparaîtront ici. Ils sont et resteront privés tant que vous ne les ajoutez pas à un document partagé.",
      },
      en: {
        imported_docs:
          "Imported medias will appear here. They will stay private until they are added to a shared document.",
      },
    },
  },
  data() {
    return {
      chutier: undefined,

      is_dragover: false,
      files_to_import: [],
      id: `image_select_${(
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 3 + 2)}`,

      last_clicked: undefined,
      selected_items_slugs: [],
      show_mediastack_modal: false,

      max_items_selected: 15,

      show_link_picker: false,
      show_qr_code_modal: false,
      show_confirm_remove_menu: false,
    };
  },
  created() {},
  mounted() {
    this.listChutier();
  },
  beforeDestroy() {},
  watch: {
    // chutier_items() {
    //   this.selected_items_slugs = this.selected_items_slugs.filter(
    //     (item_path) => this.chutier_items.find((ci) => ci.$path === item_path)
    //   );
    // },
    selected_items_slugs() {
      if (
        // this.selected_items_slugs.length === 0 &&
        this.show_confirm_remove_menu
      )
        this.show_confirm_remove_menu = false;

      if (this.selected_items_slugs.length > this.max_items_selected) {
        this.selected_items_slugs = this.selected_items_slugs.slice(
          0,
          this.max_items_selected
        );
        this.$alertify.delay(4000).error(this.$t("too_many_items_selected"));
        setTimeout(() => {
          this.$alertify
            .delay(4000)
            .error(this.$t("max_items_is") + " " + this.max_items_selected);
        }, 500);
      }
    },
    chutier_items() {
      // check if all items still exist, remove them if that's not the case
      const cleaned_up_items = this.selected_items_slugs.filter((fis) =>
        this.chutier_items.some((ci) => ci.$path === fis)
      );
      if (
        JSON.stringify(this.selected_items_slugs) !==
        JSON.stringify(cleaned_up_items)
      )
        this.selected_items_slugs = cleaned_up_items;
    },
  },
  computed: {
    author_path() {
      return this.connected_as.$path;
    },
    author_stacks_path() {
      return this.author_path + "/stacks";
    },
    url_to_page() {
      // for reactivity
      this.$route.path;
      return window.location.href;
    },
    selected_items() {
      return this.selected_items_slugs.map(
        (fis) => this.chutier_items.find((ci) => ci.$path === fis) || false
      );
    },
    all_items_selected() {
      return this.selected_items.length === this.chutier_items.length;
    },
    chutier_items() {
      if (!this.chutier || !this.chutier.$files) return [];
      let _medias = JSON.parse(JSON.stringify(this.chutier.$files));
      _medias = _medias
        .filter((m) => m.is_stack !== true && m.$media_filename)
        .sort((a, b) => {
          const getDate = (f) =>
            new Date(
              f.date_created_corrected || f.$date_created || f.$date_uploaded
            );
          return +getDate(b) - +getDate(a);
        });
      return _medias;
    },
    chutier_items_grouped() {
      return this.groupFilesBy(
        this.chutier_items,
        ["date_created_corrected", "$date_created", "$date_uploaded"],
        "day"
      );
    },
  },
  methods: {
    async listChutier() {
      this.chutier = await this.$api
        .getFolder({
          path: this.author_path,
        })
        .catch((err) => {
          this.fetch_project_error = err.response;
          this.is_loading = false;
        });
    },
    toggleSelect(path) {
      if (this.selected_items_slugs.includes(path))
        this.selected_items_slugs = this.selected_items_slugs.filter(
          (i) => i !== path
        );
      else this.selected_items_slugs.push(path);
    },
    updateInputFiles($event) {
      this.files_to_import = Array.from($event.target.files);
      $event.target.value = "";
    },
    async createNote() {
      const date_str = +new Date();
      const filename = "note-" + date_str + ".txt";

      const meta_filename = await this.$api.uploadText({
        path: this.author_path,
        filename,
        content: "",
        additional_meta: {
          title: "Sans titre",
        },
      });
      setTimeout(() => {
        this.$eventHub.$emit("chutier.item.edit", meta_filename);
      }, 100);
    },
    async createEmbed(full_url) {
      const date_str = +new Date();
      const filename = "url-" + date_str + ".txt";

      const meta_filename = await this.$api.uploadText({
        path: this.author_path,
        filename,
        content: full_url,
        additional_meta: {
          title: "Titre du lien",
          $type: "url",
        },
      });
      this.show_link_picker = false;
      setTimeout(() => {
        this.$eventHub.$emit("chutier.item.edit", meta_filename);
      }, 100);
    },

    async importedMedias($event) {
      $event;
      // console.log("selected_items_slugs = " + $event);
      // this.selected_items_slugs = $event.map(
      //   (i) => this.connected_as.$path + "/" + i
      // );
    },

    onDragover($event) {
      $event.preventDefault();
    },
    onDragEnter($event) {
      $event.preventDefault();
      // const has_files = Array.from($event.target.files).length > 0;
      this.is_dragover = true;
    },
    onDragLeave($event) {
      $event.preventDefault();
      this.is_dragover = false;
    },
    onDrop($event) {
      this.is_dragover = false;
      if ($event.dataTransfer.files?.length > 0)
        this.files_to_import = Array.from($event.dataTransfer.files);
    },

    selectAll() {
      this.selected_items_slugs = this.chutier_items.map((i) => i.$path);
    },
    deselectAll() {
      this.selected_items_slugs = [];
    },
    selectRange(range) {
      this.selected_items_slugs = this.selected_items_slugs.concat(range);
      this.selected_items_slugs = [...new Set(this.selected_items_slugs)];
    },
    deselectRange(range) {
      this.selected_items_slugs = this.selected_items_slugs.filter(
        (si) => !range.includes(si)
      );
    },
    rangeIsSelected(range) {
      if (this.selected_items_slugs.length === 0) return false;
      // for each item in range, make sure it is included in selected_items_slugs
      return !range.find((p) => {
        if (this.selected_items_slugs.includes(p) === false) return true;
        return false;
      });
    },
    async removeItemsInSelection() {
      for (const item_path of this.selected_items_slugs) {
        await this.$api.deleteItem({ path: item_path });
      }
      this.show_confirm_remove_menu = false;
    },
  },
};
</script>
<style lang="scss" scoped>
._myChutier {
  position: relative;
  top: 0;
  height: 100%;
  overflow: hidden;
  // background: #f9f9f9;
  // background: var(--chutier-bg);
  color: white;

  display: flex;
  flex-flow: row nowrap;
}
._itemsList {
  flex: 1 1 auto;
  position: relative;
  top: 0;
  height: 100%;
  overflow: auto;
  padding-bottom: 80px;

  @include scrollbar(4px, 4px, 5px, transparent, white);
}
._documentsCreator {
  flex: 0 0 auto;
}

._adminBtn {
  margin-bottom: calc(var(--spacing) / -4);
  pointer-events: auto;
}

._topContent {
  // position: sticky;
  // z-index: 1;
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 2);
  align-items: center;
  top: 0;
  padding: calc(var(--spacing) / 2);

  // backdrop-filter: blur(6px);
  // mask: linear-gradient(black 75%, transparent 100%);
}

._subscribeBtn {
  display: flex;
  justify-content: flex-start;
  align-items: center;

  padding: 0 calc(var(--spacing) / 2);
  gap: calc(var(--spacing) / 2);
}

._qrBtn {
  sl-icon {
    font-size: 130%;
  }
}

._middleContent {
  padding: 0 calc(var(--spacing) / 1);
}
._importBtn {
  // padding: calc(var(--spacing) / 1) 0;
}

._items {
  flex: 1 1 auto;
  padding: calc(var(--spacing) * 2) calc(var(--spacing) / 1);
}
._item {
  margin-bottom: calc(var(--spacing) * 2);
}

._item--label {
  // width: 100%;
  // text-align: center;
  display: inline-block;
  cursor: pointer;
  font-weight: 500;
  margin-bottom: 4px;

  opacity: 0.6;
  transition: all 0.25s ease-out;

  &:hover {
    opacity: 0.9;
  }

  &.is--fullySelected {
    opacity: 1;
  }
}

._selectionBar,
._removeMenu {
  position: absolute;
  z-index: 10;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  gap: calc(var(--spacing) / 2);

  // box-shadow: 0 2px 6px 0 black;
  background: var(--c-noir);
  padding: calc(var(--spacing) / 2);
  // padding-bottom: calc(var(--spacing) * 2);
}
._removeMenu {
  position: absolute;
  padding-top: calc(var(--spacing) * 2);
  min-height: 130px;
}

._selectionBar--previews {
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  // border: 1px solid #999;
  padding: calc(var(--spacing) / 2);
  gap: calc(var(--spacing) / 4);

  ::v-deep ._mediaContent--image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
}

._selectionBar--previews--preview {
  flex: 0 1 20px;
  aspect-ratio: 1/1;
  overflow: hidden;
}

._dbleBtns {
  gap: calc(var(--spacing) / 10);
  display: flex;
  flex-flow: row wrap;
  align-content: stretch;
  align-items: stretch;
  width: 100%;
}
._dbleBtns > * {
  flex: 1 1 120px;
  gap: calc(var(--spacing) / 4);
  display: flex;
  flex-flow: column nowrap;
}

._uploadFilesList {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--chutier-bg);
  z-index: 1;

  ::v-deep {
    ._uploadFile {
      background: black !important;
    }
  }
}

._importButton {
  width: 100%;
  // padding: calc(var(--spacing) / 2);
  padding-bottom: 0;

  ._importButton--cnt {
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    align-items: center;
    gap: calc(var(--spacing) / 3) calc(var(--spacing) / 2);

    width: 100%;
    max-width: none;

    border: 2px dotted var(--c-rouge);
    border-radius: 10px;
    box-shadow: 0 1px 10px rgb(0 0 0 / 20%);
    padding: calc(var(--spacing) / 2);

    transition: all 0.15 cubic-bezier(0.19, 1, 0.22, 1);

    &.is--dragover {
      // border-color: transparent;
      border: 2px dashed white;
      // border-width: 0px;

      > * {
        pointer-events: none;

        &:not(._importButton--btn) {
          opacity: 0;
        }
      }
    }
    &.is--dragover {
      background-color: var(--c-rouge);
    }

    .u-button {
      padding: calc(var(--spacing) / 1.5);
      border-radius: 5px;
    }
  }
  .u-button {
    flex: 1 1 0;
    align-items: center;

    &._importButton--btn {
      flex-basis: 100%;
    }

    // display: flex;
    // flex-flow: row nowrap;
    // background: var(--c-rouge);
    // color: white;
    // cursor: pointer;
    svg {
      width: 1rem;
      height: 1rem;
    }
  }
  .u-instructions {
    color: white;
  }
}
</style>
