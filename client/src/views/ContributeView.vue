<template>
  <div class="_myChutier" @click="last_clicked = false">
    <portal-target name="largemedia" multiple />

    <div class="_importFiles" @click.self="selected_items_slugs = []">
      <div class="_importFiles--content">
        <div class="_topRow">
          <AuthorTag
            v-if="connected_as"
            :path="connected_as.$path"
            :show_image_only="true"
            @click="$eventHub.$emit('showAuthorModal')"
          />
          <button
            type="button"
            class="_authorBtn"
            v-else
            @click="$eventHub.$emit('showAuthorModal')"
          >
            {{ $t("login") }}
          </button>

          <div class="_separator" />
          <button
            type="button"
            class="u-button u-button_icon _qrBtn"
            @click="show_qr_code_modal = true"
          >
            <div part="base" class="icon" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-qr-code"
                viewBox="0 0 16 16"
              >
                <path d="M2 2h2v2H2V2Z"></path>
                <path d="M6 0v6H0V0h6ZM5 1H1v4h4V1ZM4 12H2v2h2v-2Z"></path>
                <path d="M6 10v6H0v-6h6Zm-5 1v4h4v-4H1Zm11-9h2v2h-2V2Z"></path>
                <path
                  d="M10 0v6h6V0h-6Zm5 1v4h-4V1h4ZM8 1V0h1v2H8v2H7V1h1Zm0 5V4h1v2H8ZM6 8V7h1V6h1v2h1V7h5v1h-4v1H7V8H6Zm0 0v1H2V8H1v1H0V7h3v1h3Zm10 1h-1V7h1v2Zm-1 0h-1v2h2v-1h-1V9Zm-4 0h2v1h-1v1h-1V9Zm2 3v-1h-1v1h-1v1H9v1h3v-2h1Zm0 0h3v1h-2v1h-1v-2Zm-4-1v1h1v-2H7v1h2Z"
                ></path>
                <path d="M7 12h1v3h4v1H7v-4Zm9 2v2h-3v-1h2v-1h1Z"></path>
              </svg>
            </div>
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
            <b-icon icon="question-square" />
          </button>

          <button
            type="button"
            class="u-button u-button_icon _qrBtn"
            @click="show_lang_modal = !show_lang_modal"
          >
            {{ current_lang_code }}
          </button>
          <LangModal v-if="show_lang_modal" @close="show_lang_modal = false" />

          <button
            type="button"
            class="u-button u-button_icon _qrBtn"
            v-if="is_instance_admin"
            @click="show_admin_settings = !show_admin_settings"
          >
            <b-icon icon="gear" :aria-label="$t('admin_settings')" />
          </button>
          <AdminLumaSettings
            v-if="show_admin_settings"
            @close="show_admin_settings = false"
          />
        </div>
        <template v-if="connected_as">
          <div class="_importButton">
            <ImportFileZone
              :multiple="true"
              :files_to_import.sync="files_to_import"
            />
            <UploadFiles
              v-if="files_to_import.length > 0"
              :files_to_import="files_to_import"
              :path="author_path"
              :allow_caption_edition="true"
              @importedMedias="mediaJustImported($event)"
              @close="files_to_import = []"
            />

            <div class="_importBtns">
              <button
                type="button"
                class="u-button u-button_outline _qrBtn"
                @click="createNote"
              >
                <b-icon icon="file-text" />
                &nbsp; note
              </button>

              <button
                type="button"
                class="u-button u-button_outline _qrBtn"
                @click="show_link_picker = true"
              >
                <b-icon icon="link-45deg" />
                &nbsp; url
              </button>
              <EmbedPicker
                v-if="show_link_picker"
                @embed="createEmbed"
                @close="show_link_picker = false"
              />
            </div>
          </div>
        </template>
      </div>
    </div>

    <div class="_filesList">
      <div class="_middleContent">
        <div class="u-instructions u-spacingBottom">
          <b-icon icon="info-circle" />
          {{ $t("imported_docs") }}
        </div>
        <template v-if="chutier_items && chutier_items.length > 0">
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
              <b-icon
                :icon="
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
              <b-icon icon="plus-square-dotted" />
            </button>
            <button v-else type="button" class="u-buttonLink u-selectBtn">
              <b-icon icon="dash-square-dotted" />
            </button>
            {{ ci.label }}
          </div>
          <transition-group tag="div" class="_items--list" name="listComplete">
            <ChutierItem
              v-for="file in ci.files"
              :key="file.$path"
              :file="file"
              :is_clicked="last_clicked === file.$path"
              :is_selected="selected_items_slugs.includes(file.$path)"
              :draggable="false"
              @toggleSelect="toggleSelect(file.$path)"
              @unclicked="last_clicked = false"
              @click.stop="last_clicked = file.$path"
            />
          </transition-group>
        </div>
      </div>

      <!-- <template v-if="connected_as">
      <DocumentsCreator
        class="_documentsCreator"
        :author_stacks_path="author_stacks_path"
        :selected_items="selected_items"
      />
    </template> -->

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
          <div class="u-sameRow _dbleBtns">
            <button
              type="button"
              class="u-button u-button_black"
              @click="deselectAll"
            >
              <b-icon icon="dash-square-dotted" />
              {{ $t("deselect_all") }}
            </button>
            <button
              type="button"
              class="u-button u-button_black"
              @click="show_confirm_remove_menu = true"
            >
              <b-icon icon="trash" />
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
  </div>
</template>
<script>
import ImportFileZone from "@/adc-core/ui/ImportFileZone.vue";
import DocumentsCreator from "@/components/chutier/DocumentsCreator.vue";
import EmbedPicker from "@/adc-core/modals/EmbedPicker.vue";
import ChutierItem from "@/components/chutier/ChutierItem.vue";
import AdminLumaSettings from "@/components/AdminLumaSettings.vue";
import LangModal from "@/adc-core/lang/LangModal.vue";

export default {
  props: {
    shared_folder_path: String,
  },
  components: {
    ImportFileZone,
    DocumentsCreator,
    EmbedPicker,
    ChutierItem,
    AdminLumaSettings,
    LangModal,
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
          "Les médias importés apparaissent ici. Ils restent privés tant que vous ne les ajoutez pas à un document partagé.",
      },
      en: {
        imported_docs:
          "Imported medias will appear here. They stay private until they are added to a shared document.",
      },
    },
  },
  data() {
    return {
      chutier: undefined,
      show_admin_settings: false,

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
      show_lang_modal: false,
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
    current_lang_code() {
      this.$i18n.availableLocales;
      return this.$i18n.locale;
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
        this.$eventHub.$emit("chutierItem.editText", meta_filename);
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
        this.$eventHub.$emit("chutierItem.editText", meta_filename);
      }, 100);
    },

    async mediaJustImported($event) {
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
  --sd-separator: var(--h-700);
  --sd-textcolor: white;
  --sd-bg: var(--h-900);

  position: relative;
  top: 0;
  height: calc(100% - 50px);
  overflow: hidden;
  color: var(--h-600);

  display: flex;
  flex-flow: row nowrap;
  justify-content: center;

  @media (max-width: 600px) {
    flex-flow: column nowrap;
  }
}
._importFiles {
  flex: 1 1 0;
  position: relative;
  top: 0;
  height: 100%;
  overflow: auto;
  border-right: 1px solid var(--h-500);

  @include scrollbar(4px, 4px, 5px, transparent, white);
}
._importFiles--content {
  display: flex;
  flex-flow: column nowrap;
  justify-content: safe center;
  height: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding-bottom: 40px;

  ::v-deep .u-dropzone {
    padding: calc(var(--spacing) * 2);
  }
}

._documentsCreator {
  flex: 0 0 auto;
}

._filesList {
  flex: 1 1 0;
  position: relative;
}

._adminBtn {
  margin-bottom: calc(var(--spacing) / -4);
  pointer-events: auto;
}

._topContent {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 2);
  align-items: center;
  top: 0;
  padding: calc(var(--spacing) / 2);

  // backdrop-filter: blur(6px);
  // mask: linear-gradient(black 75%, transparent 100%);
}

._topRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: calc(var(--spacing) / 2);
  margin: calc(var(--spacing) / 1) calc(var(--spacing) / 1) 0;
  color: var(--h-500);

  ._separator {
    flex: 1 1 auto;
  }
}

._qrBtn {
}

._middleContent {
  margin: calc(var(--spacing) / 1);
}

._items {
  flex: 1 1 auto;
  margin: calc(var(--spacing) * 1) calc(var(--spacing) / 1);
}
._item {
  margin: calc(var(--spacing) * 1) 0;
}

._item--label {
  // width: 100%;
  // text-align: center;
  display: inline-block;
  cursor: pointer;
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--h-400);

  // opacity: 0.8;
  transition: all 0.25s ease-out;

  &:hover,
  &:focus-visible {
    color: var(--h-200);
  }

  &.is--fullySelected {
    // opacity: 1;
    color: var(--active-color);
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
  background: var(--h-700);
  color: white;
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

._authorBtn {
  text-transform: none;
}
._importButton {
  // width: 100%;
  margin: calc(var(--spacing) / 1) calc(var(--spacing) / 1);
  --dropzone-color1: transparent;
  // --dropzone-color2: var(--h-900);
  --dropzone-color2: var(--r-200);
  color: var(--active-color);
}

._importBtns {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  gap: calc(var(--spacing) / 1);
  margin: calc(var(--spacing) / 1) 0;

  transition: all 0.15 cubic-bezier(0.19, 1, 0.22, 1);

  &.is--dragover {
    border: 2px dashed white;
    background-color: var(--c-rouge);
  }

  .u-button {
    flex: 1 1 0;
    border-radius: 5px;
    padding: calc(var(--spacing) / 2);
    align-items: center;

    svg {
      width: 1rem;
      height: 1rem;
    }
  }
}

._items--list {
  column-count: 2;
  column-gap: var(--spacing);
}
</style>
