<template>
  <div
    class="_myChutier"
    :class="{ 'is--mobile': $root.is_mobile_view }"
    @click="last_clicked = false"
  >
    <div class="_importFiles" @click.self="selected_items_slugs = []">
      <div class="_dashboard">
        <DLabel :str="$t('dashboard')" />
        <div class="u-spacingBottom" />
        <div class="u-instructions u-spacingBottom">
          <b-icon icon="info-circle" />
          {{ $t("imported_docs") }}
        </div>
      </div>
      <div class="_importFiles--content">
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
              class="u-button u-button_outline"
              @click="createNote"
            >
              <b-icon icon="file-text" />
              &nbsp; note
            </button>

            <button
              type="button"
              class="u-button u-button_outline"
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
      </div>
    </div>

    <div class="_filesList">
      <div class="_middleContent">
        <template v-if="chutier_items && chutier_items.length > 0">
          <label
            for=""
            class="_item--label"
            :class="{
              'is--fullySelected': all_items_selected,
            }"
            @click="!all_items_selected ? selectAll() : deselectAll()"
          >
            <!-- <button
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
            </button> -->
            {{ $t("items_to_share") }} • {{ chutier_items.length }}
          </label>
        </template>

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
              <!-- <button
                v-if="!rangeIsSelected(ci.files.map((f) => f.$path))"
                type="button"
                class="u-buttonLink u-selectBtn"
              >
                <b-icon icon="plus-square-dotted" />
              </button>
              <button v-else type="button" class="u-buttonLink u-selectBtn">
                <b-icon icon="dash-square-dotted" />
              </button> -->
              {{ ci.label }}
            </div>
            <transition-group
              tag="div"
              class="_items--list"
              name="listComplete"
            >
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
        {{ link_to_new_stack }}
      </div>

      <transition name="slideup" mode="out-in">
        <div
          class="_selectionBar"
          v-if="selected_items.length > 0"
          key="selection"
        >
          <div class="_dbleBtns">
            <button
              type="button"
              class="u-button"
              @click="show_pick_existing_mediastack_modal = true"
            >
              <!-- <b-icon icon="plus-square-dotted" /> -->
              {{ $t("add_to_existing_document") }}
            </button>
            <PickExistingMediastackModal
              v-if="show_pick_existing_mediastack_modal"
              @close="show_pick_existing_mediastack_modal = false"
              @stackSelected="moveFilesToStack"
            />
            <button
              type="button"
              class="u-button"
              @click="show_new_mediastack_modal = true"
            >
              <!-- <b-icon icon="plus-square-dotted" /> -->
              {{ $t("create_new_document") }}
            </button>
          </div>
          <div class="u-sameRow _selectionBar-btns">
            <transition name="fade" mode="out-in">
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

            <button type="button" class="u-buttonLink" @click="deselectAll">
              <b-icon icon="dash-square-dotted" /> {{ $t("deselect_all") }}
            </button>
            <button
              type="button"
              class="u-buttonLink"
              @click="show_confirm_remove_menu = true"
            >
              <b-icon icon="trash" />
              {{ $t("remove_select") }}
            </button>
          </div>
        </div>
      </transition>
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

      <transition name="slideup" mode="out-in">
        <div v-if="link_to_new_stack" key="new_stack" class="_newStack">
          <div class="">
            <b-icon icon="check-circle" />
            {{ $t("new_stack_created") }}
          </div>
          <router-link :to="link_to_new_stack" class="u-button">
            {{ $t("go_to_new_stack") }}
          </router-link>
          <button
            type="button"
            class="u-button_icon _closeBtn"
            @click="link_to_new_stack = undefined"
          >
            <b-icon icon="x-lg" />
          </button>
        </div>
      </transition>
    </div>
    <CreateNewMediastackModal
      v-if="show_new_mediastack_modal"
      :selected_items="selected_items"
      @stackPosted="stackPosted"
      @close="show_new_mediastack_modal = false"
    />
  </div>
</template>
<script>
import ImportFileZone from "@/adc-core/ui/ImportFileZone.vue";
import EmbedPicker from "@/adc-core/modals/EmbedPicker.vue";
import ChutierItem from "@/components/chutier/ChutierItem.vue";

export default {
  props: {},
  components: {
    ImportFileZone,
    EmbedPicker,
    ChutierItem,
    CreateNewMediastackModal: () =>
      import("@/components/chutier/CreateNewMediastackModal.vue"),
    PickExistingMediastackModal: () =>
      import("@/components/PickExistingMediastackModal.vue"),
  },
  provide() {
    return {};
  },
  i18n: {
    messages: {
      fr: {
        imported_docs:
          "Les médias importés apparaissent ici. Seul vous pouvez les voir et les modifier. Sélectionnez-en un ou plusieurs pour créer un document partagé.",
        add_to_existing_document: "Ajouter à un document existant",
        create_new_document: "Créer un nouveau document",
        dashboard: "Dashboard",
        new_stack_created: "Nouveau document créé",
        go_to_new_stack: "Aller au nouveau document",
        too_many_items_selected:
          "Vous ne pouvez sélectionner que {max_items_selected} médias maximum.",
      },
      en: {
        imported_docs:
          "Imported medias will appear here. Only you can see and edit them. Select one or more to create a shared document.",
        add_to_existing_document: "Add to existing document",
        create_new_document: "Create a new document",
        dashboard: "Dashboard",
        new_stack_created: "New document created",
        go_to_new_stack: "Go to new document",
        too_many_items_selected:
          "You can only select {max_items_selected} media maximum.",
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

      link_to_new_stack: undefined,

      max_items_selected: 15,

      show_link_picker: false,
      show_confirm_remove_menu: false,

      show_pick_existing_mediastack_modal: false,
      show_new_mediastack_modal: false,
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
        this.$alertify.delay(4000).error(
          this.$t("too_many_items_selected", {
            max_items_selected: this.max_items_selected,
          })
        );
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
    async stackPosted(new_stack_slug) {
      // this.link_to_new_stack = `/explore/${new_stack_slug}`;
      this.show_new_mediastack_modal = false;
    },
    async moveFilesToStack(stack) {
      this.show_pick_existing_mediastack_modal = false;
      const selected_items = this.selected_items;
      const copied_meta_filenames = [];
      for (const item of selected_items) {
        const copied_meta_filename = await this.$api.copyFile({
          path: item.$path,
          path_to_destination_folder: stack.$path,
        });
        copied_meta_filenames.push(copied_meta_filename);
        await this.$api.deleteItem({ path: item.$path });
      }

      const stack_files_metas = stack.stack_files_metas || [];
      stack_files_metas.push(...copied_meta_filenames);
      await this.$api.updateMeta({
        path: stack.$path,
        new_meta: {
          stack_files_metas,
        },
      });

      this.selected_items_slugs = [];
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
  color: var(--h-700);

  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;

  &.is--mobile {
    min-height: calc(100% - 50px);
    flex-flow: column nowrap;
    overflow: auto;
  }

  > ._importFiles {
    flex: 1 0 320px;

    @media (max-width: 600px) {
      flex: 0 0 auto;
    }
  }

  > ._filesList {
    flex: 5 1 0;
    overflow: auto;
  }
}
._importFiles {
  position: relative;
  top: 0;
  height: 100%;
  overflow: auto;
  // border-right: 1px solid var(--border-color);

  @include scrollbar(4px, 4px, 5px, transparent, white);

  @media (max-width: 600px) {
    overflow: hidden;
    height: auto;
  }
}
._importFiles--content {
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  // height: 100%;
  max-width: 400px;
  margin: 0 auto;
  // padding: calc(var(--spacing) * 1);
  padding-bottom: calc(var(--spacing) * 4);

  ::v-deep .u-dropzone {
    padding: calc(var(--spacing) * 2);
  }

  @media (max-width: 600px) {
    height: auto;
  }
}

._filesList {
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

._middleContent {
  height: 100%;
  width: 100%;
  overflow: auto;
  padding: calc(var(--spacing) * 2);
}

._items {
  padding-bottom: calc(var(--spacing) * 6);
}
._item {
  margin: calc(var(--spacing) * 1) 0;
}

._item--label {
  // width: 100%;
  // text-align: center;
  display: inline-block;
  cursor: pointer;
  // font-weight: 500;
  margin-bottom: 4px;
  color: currentColor;

  // opacity: 0.8;
  transition: all 0.25s ease-out;

  &:hover,
  &:focus-visible {
    color: var(--h-500);
  }

  &.is--fullySelected {
    // opacity: 1;
    color: var(--active-color);
  }
}

._selectionBar,
._removeMenu,
._newStack {
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
  background: white;
  border-top: 1px solid var(--border-color);
  // color: white;
  padding: calc(var(--spacing) * 1);
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
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  gap: calc(var(--spacing) / 1);
  padding-bottom: calc(var(--spacing) / 4);
  width: 100%;
}
._dbleBtns > * {
  flex: 0 1 250px;
  // gap: calc(var(--spacing) / 4);
  // display: flex;
  // flex-flow: column nowrap;
  // padding: calc(var(--spacing) / 1);
}

._selectionBar-btns {
  // margin: calc(var(--spacing) / 2) 0;
  gap: calc(var(--spacing) * 2);
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

._dashboard {
  min-height: 30ch;
  background: var(--h-50);

  margin: calc(var(--spacing) * 2);
  padding: calc(var(--spacing) / 1);
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
  // display: flex;
  // flex-flow: row wrap;
  // justify-content: flex-start;
  // align-items: flex-start;
  // gap: calc(var(--spacing) / 1);

  // display: grid;
  // grid-auto-rows: max-content;
  // grid-gap: calc(var(--spacing) / 1);
  // align-items: stretch;
  // grid-template-columns: repeat(
  //   auto-fill,
  //   minmax(var(--item-width, 320px), 1fr)
  // );

  columns: 3 28em;

  > * {
    flex: 1 1 28em;
    margin-bottom: calc(var(--spacing) / 4);
    // max-width: 22em;
  }
}
._closeBtn {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
