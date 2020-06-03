<template>
  <div
    class="m_publicationview"
    :class="{
      'is--preview': preview_mode,
      'is--fullscreen': $root.app_is_fullscreen,
    }"
    ref="panel"
  >
    <PublicationHeader
      :slugPubliName="slugPubliName"
      :publication="publication"
      :medias="paged_medias"
      @export="show_export_modal = true"
      @close="contact_sheet_mode ? $root.closePublication() : showAllPages()"
    />

    <ExportPagePubli
      v-if="show_export_modal"
      :publication="publication"
      @close="show_export_modal = false"
      :slugPubliName="slugPubliName"
    />

    <PublicationDisplayButtons
      :preview_mode="preview_mode"
      :show_zoom_buttons="!contact_sheet_mode"
      :zoom="zoom"
      :zoom_min="zoom_min"
      :zoom_max="zoom_max"
      @togglePreviewMode="$emit('togglePreviewMode')"
      @setZoom="(val) => (zoom = val)"
      @toggleFullScreen="$emit('toggleFullScreen')"
    />

    <div
      class="m_publicationNavMenu"
      v-if="
        ![
          'export_publication',
          'print_publication',
          'link_publication',
        ].includes($root.state.mode)
      "
    >
      <div class="m_publicationNavMenu--settings">
        <div>
          <button
            type="button"
            class="buttonLink"
            v-if="!contact_sheet_mode"
            @click="showAllPages"
          >{{ $t("show_all_pages") }}</button>
        </div>

        <div
          class="_settings_pane_button"
          v-if="
            ![
              'export_publication',
              'print_publication',
              'link_publication',
            ].includes($root.state.mode) && can_edit_publi
          "
        >
          <button
            type="button"
            class="buttonLink"
            :class="{ 'is--active': page_settings_panel }"
            @click="page_settings_panel = !page_settings_panel"
          >{{ $t("page_settings") }}</button>
        </div>

        <SettingsPane
          v-if="page_settings_panel"
          :slugPubliName="slugPubliName"
          :publication="publication"
          :publications_options="publications_options"
        />
      </div>

      <hr v-if="!contact_sheet_mode" class="margin-none" />

      <div class="m_publicationNavMenu--buttonRow" v-if="!contact_sheet_mode">
        <button type="button" @click="navPage(-1)" :disabled="opened_page_index === 0">
          <img src="/images/i_arrow_left.svg" draggable="false" />
          {{ $t("previous_page") }}
        </button>
        <div class="font-small text-lc">
          <span
            v-html="
              $t('current_page:') +
              ' ' +
              (opened_page_index + 1) +
              '/' +
              this.pagesWithDefault.length
            "
          />
        </div>

        <button
          type="button"
          @click="navPage(+1)"
          :disabled="opened_page_index === pagesWithDefault.length - 1"
        >
          {{ $t("next_page") }}
          <img src="/images/i_arrow_right.svg" draggable="false" />
        </button>
      </div>
    </div>

    <div
      class="m_publicationview--pages"
      ref="page_container"
      :style="
        !!$root.settings.current_publication.page_id
          ? 'overflow: hidden; height: 100%;'
          : ''
      "
      @click.self="$root.settings.current_publication.selected_medias = []"
    >
      <div
        v-if="
          [
            'export_publication',
            'print_publication',
            'link_publication',
          ].includes($root.state.mode)
        "
      >
        <PagePublicationSinglePage
          v-for="(page, pageNumber) in pagesWithDefault"
          :mode="'export'"
          :key="page.id"
          :preview_mode="preview_mode"
          :slugPubliName="slugPubliName"
          :pageNumber="pageNumber"
          :page="page"
          :publication_medias="paged_medias[page.id]"
          :read_only="read_only || !can_edit_publi"
          :pixelsPerMillimeters="pixelsPerMillimeters"
          :zoom="zoom"
        />
      </div>

      <div v-else-if="contact_sheet_mode" class="m_publicationview--pages--contactSheet">
        <transition-group
          tag="div"
          class="m_publicationview--pages--contactSheet--pages"
          name="list-complete"
        >
          <div
            class="m_publicationview--pages--contactSheet--pages--page"
            v-for="(page, pageNumber) in pagesWithDefault"
            :key="page.id"
            @mouseenter="show_buttons = page.id"
            @mouseleave="
              (event) =>
                event.relatedTarget === null ? '' : (show_buttons = false)
            "
          >
            <PagePublicationSinglePage
              :key="page.id"
              :mode="'contact_sheet'"
              :preview_mode="true"
              :slugPubliName="slugPubliName"
              :pageNumber="pageNumber"
              :page="page"
              :publication_medias="paged_medias[page.id]"
              :read_only="read_only || !can_edit_publi"
              :pixelsPerMillimeters="pixelsPerMillimeters"
              :zoom="0.2"
            />
            <span
              class="m_publicationview--pages--contactSheet--pages--page--pageNumber"
            >{{ pageNumber + 1 }}</span>

            <transition name="fade_fast" :duration="150">
              <div
                class="m_publicationview--pages--contactSheet--pages--page--buttons"
                v-if="show_buttons === page.id"
              >
                <button
                  type="button"
                  class="_advanced_menu_button"
                  v-if="can_edit_publi"
                  @click.stop="
                    show_advanced_menu_for_page !== page.id
                      ? (show_advanced_menu_for_page = page.id)
                      : (show_advanced_menu_for_page = false)
                  "
                >
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    x="0px"
                    y="0px"
                    width="168px"
                    height="168px"
                    viewBox="0 0 168 168"
                    style="enable-background: new 0 0 168 168;"
                    xml:space="preserve"
                  >
                    <rect x="73.5" y="37" class="st0" width="21" height="21" />
                    <rect x="73.5" y="73.5" class="st0" width="21" height="21" />
                    <rect x="73.5" y="110" class="st0" width="21" height="21" />
                  </svg>
                </button>

                <div
                  v-if="
                    show_advanced_menu_for_page === page.id && can_edit_publi
                  "
                  class="_advanced_menu"
                  @click.stop
                >
                  <template v-if="!show_advanced_option">
                    <button
                      type="button"
                      class="buttonLink"
                      v-if="pagesWithDefault.length > 1"
                      @click="show_advanced_option = 'move'"
                    >{{ $t("move") }}</button>

                    <button
                      type="button"
                      class="buttonLink"
                      @click="show_advanced_option = 'duplicate'"
                    >{{ $t("duplicate") }}</button>

                    <button
                      type="button"
                      class="buttonLink"
                      @click="removePage(page.id)"
                    >{{ $t("remove") }}</button>
                  </template>

                  <template v-else-if="show_advanced_option === 'move'">
                    <span v-if="pagesWithDefault.length > 1">
                      <label>{{ $t("move_page_position") }}</label>
                      <select
                        @change="updatePagePos({ id: page.id, $event })"
                        :value="pageNumber + 1"
                      >
                        <option v-for="pos in pagesWithDefault.length" :key="pos" v-html="pos" />
                      </select>
                    </span>
                  </template>
                  <template v-else-if="show_advanced_option === 'duplicate'">
                    <form @submit.prevent="duplicatePage({ id: page.id, $event })">
                      <template v-if="pagesWithDefault.length > 1">
                        <label>{{ $t("destination_document") }}</label>
                        <select :value="slugPubliName">
                          <option
                            v-for="{
                              name,
                              slugFolderName: slugPubliName,
                            } in all_recipes_of_this_template"
                            :key="slugPubliName"
                            :value="slugPubliName"
                            v-html="name"
                          />
                        </select>
                      </template>
                      <button type="submit" v-html="$t('duplicate')" class="button bg-bleuvert" />
                    </form>
                  </template>
                </div>

                <button
                  type="button"
                  class="buttonLink"
                  @click.stop="openPage(page.id)"
                >{{ $t("open") }}</button>
              </div>
            </transition>
          </div>
          <button
            type="button"
            class="m_publicationview--pages--contactSheet--pages--page m_publicationview--pages--contactSheet--pages--page_create"
            v-if="can_edit_publi"
            :key="'create_page'"
            @click="insertPageAtIndex(pagesWithDefault.length + 1)"
          >{{ $t("create_empty_page") }}</button>
        </transition-group>

        <button
          type="button"
          class="button-nostyle text-uc button-triangle _show_removed_pages"
          :class="{ 'is--active': show_removed_pages }"
          @click="show_removed_pages = !show_removed_pages"
          v-if="removedPagesWithDefault.length > 0"
        >{{ $t("show_removed_pages") }} ({{ removedPagesWithDefault.length }})</button>

        <transition-group
          tag="div"
          class="m_publicationview--pages--contactSheet--pages m_publicationview--pages--contactSheet--pages_removed"
          name="list-complete"
          v-if="show_removed_pages"
        >
          <div
            class="m_publicationview--pages--contactSheet--pages--page"
            v-for="(page, pageNumber) in removedPagesWithDefault"
            :key="page.id"
            @mouseenter="show_restore_options = page.id"
            @mouseleave="show_restore_options = false"
          >
            <PagePublicationSinglePage
              :mode="'contact_sheet'"
              :preview_mode="true"
              :slugPubliName="slugPubliName"
              :pageNumber="pageNumber"
              :page="page"
              :publication_medias="paged_medias[page.id]"
              :read_only="read_only || !can_edit_publi"
              :pixelsPerMillimeters="pixelsPerMillimeters"
              :zoom="0.1"
            />

            <div
              class="m_publicationview--pages--contactSheet--pages--page--buttons"
              v-if="show_restore_options === page.id && can_edit_publi"
            >
              <!-- <button
                type="button"
                class="_advanced_menu_button"
                @click.stop="
                  show_advanced_menu_for_page !== page.id
                    ? (show_advanced_menu_for_page = page.id)
                    : (show_advanced_menu_for_page = false)
                "
              >
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                  x="0px"
                  y="0px"
                  width="168px"
                  height="168px"
                  viewBox="0 0 168 168"
                  style="enable-background:new 0 0 168 168;"
                  xml:space="preserve"
                >
                  <rect x="73.5" y="37" class="st0" width="21" height="21" />
                  <rect x="73.5" y="73.5" class="st0" width="21" height="21" />
                  <rect x="73.5" y="110" class="st0" width="21" height="21" />
                </svg>
              </button>-->

              <!-- <div
                v-if="show_advanced_menu_for_page === page.id"
                class="_advanced_menu"
                @click.stop
              >
                <button type="button" @click="removePage(page.id)">
                  {{ $t("remove") }}
                </button>
              </div>-->

              <button
                type="button"
                class="buttonLink"
                @click.stop="restorePage(page.id)"
              >{{ $t("restore") }}</button>
              <button
                type="button"
                class="buttonLink"
                @click.stop="removePageForGood(page.id)"
              >{{ $t("remove") }}</button>
            </div>
          </div>
        </transition-group>
      </div>

      <div v-else class="m_publicationview--pages--singlePageBloc">
        <PublicationButtons
          v-if="can_edit_publi && !contact_sheet_mode && !preview_mode"
          :preview_mode="preview_mode"
          :page_medias="
            paged_medias[$root.settings.current_publication.page_id]
          "
          :slugPubliName="slugPubliName"
          :publi="publication.is_model"
          @addMedia="createPubliMedia"
          @insertMedias="
                  ({ metaFileNames }) =>
                    editMediaToPlaceOnPage({
                      metaFileNames,
                    })
                "
        />

        <transition name="fade_fast" mode="out-in" :duration="250">
          <PagePublicationSinglePage
            ref="current_page"
            :mode="'single'"
            :key="$root.settings.current_publication.page_id"
            :preview_mode="preview_mode"
            :slugPubliName="slugPubliName"
            :pageNumber="opened_page_index"
            :page="opened_single_page"
            :publi_is_model="publication.is_model"
            :publication_medias="
              paged_medias[$root.settings.current_publication.page_id]
            "
            :read_only="read_only || !can_edit_publi"
            :pixelsPerMillimeters="pixelsPerMillimeters"
            :zoom="zoom"
          />
        </transition>
      </div>
    </div>

    <div
      class="m_publicationFooter margin-vert-small"
      v-if="
        ['export_publication', 'link_publication'].includes($root.state.mode)
      "
    >
      <a class="js--openInBrowser c-noir" target="_blank" href="https://dodoc.fr/">
        {{ $t("made_with_dodoc") }}
        <img
          :src="
            this.$root.state.mode === 'export_publication'
              ? './_images/i_logo.svg'
              : '/images/i_logo.svg'
          "
          @click="goHome()"
          draggable="false"
        />
      </a>
    </div>
    <div
      ref="mmMeasurer"
      style="height: 10mm; width: 10mm; left: 100%; position: fixed; top: 100%;"
    />
  </div>
</template>
<script>
import PublicationHeader from "../subcomponents/PublicationHeader.vue";
import PublicationDisplayButtons from "../subcomponents/PublicationDisplayButtons.vue";
import ExportPagePubli from "../modals/ExportPagePubli.vue";
import PagePublicationSinglePage from "./PagePublicationSinglePage.vue";
import SettingsPane from "./SettingsPane.vue";
import PublicationButtons from "./subcomponents/PublicationButtons.vue";

export default {
  props: {
    slugPubliName: String,
    publication: Object,
    paged_medias: Object,
    read_only: Boolean,
    can_edit_publi: Boolean,
    can_see_publi: Boolean,
    preview_mode: Boolean,
  },
  components: {
    PublicationHeader,
    PublicationDisplayButtons,
    ExportPagePubli,
    PagePublicationSinglePage,
    SettingsPane,
    PublicationButtons,
  },
  data() {
    return {
      publication_defaults: {
        page_by_page: {
          width: 210,
          height: 297,
          style: "standard",
          margin_left: 10,
          margin_right: 10,
          margin_top: 20,
          margin_bottom: 20,
          gridstep: 5,
          snap_to_grid: true,
          header_left: "",
          header_right: "",
          show_page_number: true,
        },
      },

      show_removed_pages: false,
      show_buttons: false,
      show_restore_options: false,

      page_settings_panel: false,

      contact_sheet_mode: true,

      show_advanced_menu_for_page: false,
      show_advanced_option: false,

      zoom: 1,
      zoom_min: 0.2,
      zoom_max: 2,

      pixelsPerMillimeters: 0,
      show_export_modal: false,
    };
  },
  created() {
    // when opening a publi, we’ll need to use the medias field to request some actual content
    this.$root.setPublicationZoom(this.zoom);
  },
  mounted() {
    this.$eventHub.$on("publication.addMedia", this.addMedia);

    this.$eventHub.$on("publication.just_added_media", mdata => {
      this.$nextTick(() => {
        if (mdata.type && mdata.type === "text") {
          this.$eventHub.$emit(
            "publication.set_media_to_edit_mode",
            mdata.metaFileName
          );
        } else {
          this.$eventHub.$emit(
            "publication.selectNewMedia",
            mdata.metaFileName
          );
        }
      });
    });

    this.pixelsPerMillimeters = this.$refs.hasOwnProperty("mmMeasurer")
      ? this.$refs.mmMeasurer.offsetWidth / 10
      : 3.78;

    this.$nextTick(() => {
      this.updatePageSizeAccordingToPanel();
      this.$eventHub.$on(
        "activity_panels_resized",
        this.updatePageSizeAccordingToPanel
      );
    });
  },
  beforeDestroy() {
    this.$eventHub.$off("publication.addMedia", this.addMedia);

    this.$eventHub.$off(
      "activity_panels_resized",
      this.updatePageSizeAccordingToPanel
    );
  },

  watch: {
    show_buttons: function() {
      this.show_advanced_menu_for_page = false;
      this.show_advanced_option = false;
    },
    "$root.app_is_fullscreen": function() {
      setTimeout(() => {
        this.updatePageSizeAccordingToPanel();
      }, 500);
    },
    publications_options: {
      handler() {
        if (this.$root.state.dev_mode === "debug") {
          console.log(`WATCH • Publication: publications_options`);
        }

        document.getElementsByTagName("body")[0].style = `
          --page-width: ${this.publications_options.width}mm;
          --page-height: ${this.publications_options.height}mm
        `;
      },
      deep: true,
      immediate: true,
    },
    zoom: function() {
      if (this.$root.state.dev_mode === "debug")
        console.log(`WATCH • Publication: zoom`);

      this.zoom = Math.min(this.zoom_max, Math.max(this.zoom_min, this.zoom));
      this.$root.setPublicationZoom(this.zoom);
    },
    "$root.settings.publi_zoom": function() {
      if (this.$root.state.dev_mode === "debug")
        console.log(`WATCH • Publication: $root.settings.publi_zoom`);

      this.zoom = this.$root.settings.publi_zoom;
    },
  },
  computed: {
    opened_single_page() {
      if (this.opened_page_index === false) return false;
      return this.pagesWithDefault[this.opened_page_index];
    },
    opened_page_index() {
      if (!this.$root.settings.current_publication.page_id) return false;

      const index = this.pagesWithDefault.findIndex(
        p => p.id === this.$root.settings.current_publication.page_id
      );
      return index;
    },
    all_recipes_of_this_template() {
      const filtered_recipes = Object.values(
        this.$root.store.publications
      ).filter(r => r.template === "page_by_page");
      let sorted_recipes = this.$_.sortBy(filtered_recipes, "date_created");
      sorted_recipes = sorted_recipes.reverse();
      return sorted_recipes;
    },
    publications_options() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`COMPUTED • publications_options`);
      }
      // set default values to options
      if (!this.publication.hasOwnProperty("template")) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error("Missing template in publication");
      }
      if (
        !this.publication_defaults.hasOwnProperty(this.publication.template)
      ) {
        console.log(
          "No defaults for this template. Returning original publication object."
        );
        return this.publication;
      }

      let publication_options = this.publication_defaults[
        this.publication.template
      ];
      for (let k of Object.keys(publication_options)) {
        if (this.publication.hasOwnProperty(k)) {
          publication_options[k] = this.publication[k];
        }
      }

      return publication_options;
    },
    pagesWithDefault() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`COMPUTED • pagesWithDefault`);
      }

      if (
        !this.publication.hasOwnProperty("pages") ||
        this.publication.pages.length === 0
      ) {
        return [];
      }

      let defaultPages = this.mergePageObjectWithDefault(
        this.publication.pages
      );

      if (this.$root.settings.url_queries.hasOwnProperty("page")) {
        const idx = this.$root.settings.url_queries.page - 1;
        defaultPages = defaultPages.slice(idx, idx + 1);
      }

      return defaultPages;
    },
    removedPagesWithDefault() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`COMPUTED • removedPagesWithDefault`);
      }

      if (
        !this.publication.hasOwnProperty("removed_pages") ||
        this.publication.removed_pages.length === 0
      ) {
        return [];
      }

      let removedDefaultPages = this.mergePageObjectWithDefault(
        this.publication.removed_pages
      );

      return removedDefaultPages;
    },
  },
  methods: {
    generateID() {
      return (
        +new Date() +
        "_" +
        (Math.random().toString(36) + "00000000000000000").slice(2, 3)
      );
    },
    mergePageObjectWithDefault(pages) {
      return pages.reduce((acc, page) => {
        let _page = JSON.parse(JSON.stringify(page));
        Object.keys(this.publications_options).map(k => {
          const option = this.publications_options[k];
          if (typeof option === "number") {
            if (_page.hasOwnProperty(k) && !Number.isNaN(_page[k])) {
              _page[k] = Number.parseInt(_page[k]);
            } else {
              _page[k] = option;
            }
          } else if (typeof option === "string") {
            if (_page.hasOwnProperty(k) && typeof _page[k] === "string") {
              // page[k] = page[k];
            } else {
              _page[k] = option;
            }
          } else if (typeof option === "boolean") {
            _page[k] = option;
          }
        });
        acc.push(_page);
        return acc;
      }, []);
    },

    getHighestZNumberAmongstMedias(page_medias) {
      if (!page_medias) return 0;

      const medias_with_z = page_medias
        .filter(m => m.hasOwnProperty("z_index"))
        .map(m => {
          return m.z_index;
        });

      if (medias_with_z.length === 0) return 0;

      return Math.max(...medias_with_z);
    },
    updatePagePos({ id, $event }) {
      if (this.$root.state.dev_mode === "debug")
        console.log(`METHODS • Publication: openPage id = ${id}`);

      if (
        !this.publication.hasOwnProperty("pages") ||
        this.publication.pages.length === 0
      )
        return;

      const prev_pos = this.pagesWithDefault.findIndex(p => p.id === id);
      const new_pos = $event.target.value - 1;
      let pages = this.publication.pages.slice();

      // https://stackoverflow.com/a/5306832/10622612
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

      array_move(pages, prev_pos, new_pos);

      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data: {
          pages,
        },
      });

      this.show_buttons = false;
    },
    openPage(id) {
      if (this.$root.state.dev_mode === "debug")
        console.log(`METHODS • Publication: openPage id = ${id}`);

      this.$root.settings.current_publication.page_id = id;
      this.contact_sheet_mode = false;

      this.$nextTick(() => {
        this.updatePageSizeAccordingToPanel();
      });
    },
    showAllPages() {
      if (this.$root.state.dev_mode === "debug")
        console.log(`METHODS • Publication: showAllPages`);
      this.$root.settings.current_publication.page_id = false;
      this.contact_sheet_mode = true;
    },
    restorePage(id) {
      if (this.$root.state.dev_mode === "debug")
        console.log(`METHODS • Publication: restorePage id = ${id}`);

      let pages = Array.isArray(this.publication.pages)
        ? this.publication.pages.slice()
        : [];
      let page_to_restore = this.publication.removed_pages.find(
        p => p.id === id
      );
      pages.push(page_to_restore);

      let removed_pages = this.publication.removed_pages.filter(
        p => p.id !== id
      );

      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data: {
          pages,
          removed_pages,
        },
      });
    },
    removePageForGood(id) {
      if (this.$root.state.dev_mode === "debug")
        console.log(`METHODS • Publication: removePageForGood id = ${id}`);

      let removed_pages = this.publication.removed_pages.filter(
        p => p.id !== id
      );

      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data: {
          removed_pages,
        },
      });

      this.paged_medias[id].map(m => {
        this.$root.removeMedia({
          type: "publications",
          slugFolderName: this.slugPubliName,
          slugMediaName: m.metaFileName,
        });
      });
    },
    navPage(relative_index) {
      const new_index = this.opened_page_index + relative_index;

      if (
        this.opened_page_index === false &&
        new_index < 0 &&
        new_index >= this.pagesWithDefault.length
      )
        return;

      this.openPage(this.pagesWithDefault[new_index].id);
    },
    createPubliMedia(values) {
      // ajouter du text dans la publi
      // qui ne possède pas de lien
      this.addMedia({ values });
    },

    addMedia({ values }) {
      if (this.$root.state.dev_mode === "debug")
        console.log(`PagePublication • METHODS: addMedia`);

      Object.assign(values, this.prepareMetaToPlaceOnPage());

      this.$emit("addMedia", { values });
    },
    editMediaToPlaceOnPage({ metaFileNames }) {
      if (this.$root.state.dev_mode === "debug")
        console.log(`PagePublication • METHODS: addMedia`);

      debugger;

      metaFileNames.map((metaFileName, index) => {
        const _values = this.prepareMetaToPlaceOnPage();

        _values.x += 10 * index;
        _values.y += 10 * index;

        this.$emit("editPubliMedia", {
          metaFileName: metaFileName,
          val: _values,
        });

        const catchMediaEdition = d => {
          if (metaFileName === d.metaFileName) {
            this.$nextTick(() => {
              this.$eventHub.$emit("publication.selectNewMedia", metaFileName);
            });
          } else {
            this.$eventHub.$once(
              `socketio.media_just_edited`,
              catchMediaEdition
            );
          }
        };
        this.$eventHub.$once(
          `publication.media_just_edited`,
          catchMediaEdition
        );
      });
    },
    prepareMetaToPlaceOnPage() {
      if (!this.$root.settings.current_publication.page_id) {
        console.log(`METHODS • Publication: addMedia missing page id`);
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error("Missing page id to add media properly");
      }

      let values = {};

      values.page_id = this.$root.settings.current_publication.page_id;

      values.x = this.publications_options.margin_left;
      values.y = this.publications_options.margin_top;

      values.z_index =
        this.getHighestZNumberAmongstMedias(
          this.paged_medias[this.$root.settings.current_publication.page_id]
        ) + 1;

      // get current scroll
      if (this.$refs.current_page) {
        const posx_in_cm =
          this.$refs.current_page.$el.scrollLeft / this.pixelsPerMillimeters;
        if (!Number.isNaN(posx_in_cm))
          values.x = Math.max(values.x, posx_in_cm);

        const posy_in_cm =
          this.$refs.current_page.$el.scrollTop / this.pixelsPerMillimeters;
        if (!Number.isNaN(posy_in_cm))
          values.y = Math.max(values.y, posy_in_cm);
      }

      return values;
    },

    insertPageAtIndex(index) {
      if (this.$root.state.dev_mode === "debug")
        console.log(`METHODS • Publication: insertPageAtIndex ${index}`);

      // insert page in page array
      let pages = [];
      if (
        this.publication.hasOwnProperty("pages") &&
        this.publication.pages.length > 0
      ) {
        pages = this.publication.pages.slice();
      }

      pages.splice(index, 0, {
        id: this.generateID(),
      });

      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data: {
          pages,
        },
      });
    },
    duplicatePage({ id, $event }) {
      if (this.$root.state.dev_mode === "debug")
        console.log(`METHODS • Publication: duplicatePage`);

      const slugPubliName_to_copy_to = !!$event.target.elements[0].value
        ? $event.target.elements[0].value
        : this.slugPubliName;

      const publi_to_copy_to = Object.values(
        this.$root.store.publications
      ).find(p => p.slugFolderName === slugPubliName_to_copy_to);

      let index_of_page_to_copy = publi_to_copy_to.pages.length;
      if (slugPubliName_to_copy_to === this.slugPubliName)
        index_of_page_to_copy = this.publication.pages.findIndex(
          p => p.id === id
        );

      const page_to_copy = JSON.parse(
        JSON.stringify(this.publication.pages.find(p => p.id === id))
      );

      // create new id
      const new_id = this.generateID();
      page_to_copy.id = new_id;

      // find pages of the publi to copy to
      let pages = Array.isArray(publi_to_copy_to.pages)
        ? publi_to_copy_to.pages.slice()
        : [];
      pages.splice(index_of_page_to_copy + 1, 0, page_to_copy);

      this.show_buttons = false;

      this.$root.editFolder({
        type: "publications",
        slugFolderName: slugPubliName_to_copy_to,
        data: {
          pages,
        },
      });

      // get all medias of page
      const medias_to_copy = this.paged_medias[id];

      medias_to_copy.map(m => {
        // copy all medias of page with new page ID
        this.$socketio.copyMediaToFolder({
          type: "publications",
          from_slugFolderName: this.slugPubliName,
          to_slugFolderName: slugPubliName_to_copy_to,
          slugMediaName: m.metaFileName,
          meta_to_edit: {
            page_id: new_id,
          },
        });
      });

      // TODO : same publi or another one
    },

    removePage(id) {
      if (this.$root.state.dev_mode === "debug")
        console.log(`METHODS • Publication: removePage`);

      if (!this.publication.hasOwnProperty("pages")) return;

      // this.$alertify
      //   .okBtn(this.$t("yes"))
      //   .cancelBtn(this.$t("cancel"))
      //   .confirm(
      //     this.$t("sureToRemovePage"),
      //     () => {
      let pages = this.publication.pages.filter(p => p.id !== id);
      let page_to_remove = this.publication.pages.find(p => p.id === id);

      let removed_pages = Array.isArray(this.publication.removed_pages)
        ? this.publication.removed_pages.slice()
        : [];
      removed_pages.unshift(page_to_remove);

      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data: {
          pages,
          removed_pages,
        },
      });
      //   },
      //   () => {}
      // );
    },
    updatePageSizeAccordingToPanel() {
      if (this.$refs.current_page && this.$refs.current_page.$el) {
        const panel_el = this.$refs.current_page.$el;
        const current_page_el = panel_el.querySelector(".m_page");

        this.zoom = (panel_el.offsetWidth * 0.6) / current_page_el.offsetWidth;
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
