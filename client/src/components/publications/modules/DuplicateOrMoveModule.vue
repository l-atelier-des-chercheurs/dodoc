<template>
  <div>
    <button type="button" class="u-buttonLink" @click="show_modal = true">
      <b-icon icon="file-plus" />
      {{ $t("duplicate_or_move") }}…
    </button>

    <DuplicateOrMoveModal
      v-if="show_modal"
      :scope.sync="scope"
      :scope_options="scope_options"
      :can_confirm="destination_is_valid"
      :move_disabled_reason="is_already_there && $t('module_already_there')"
      :is_copying="is_copying"
      @close="show_modal = false"
      @confirm="confirm"
    >
      <template v-if="scope === 'other_project'">
        <div class="u-spacingBottom u-instructions">
          <small>{{ $t("dmmod_instr") }}</small>
        </div>
        <SpaceProjectPicker
          class="u-spacingBottom"
          :path="publimodule.$path"
          :excluded_project_path="source_project_path"
          @newProjectSelected="pickOtherProject"
        />
      </template>

      <div
        class="u-spacingBottom"
        v-if="scope !== 'same_publication' && destination_project_path"
      >
        <DLabel :str="$t('publication')" />
        <LoaderSpinner v-if="!destination_publications" />
        <small
          v-else-if="destination_publications.length === 0"
          class="u-instructions"
        >
          {{ $t("no_compatible_publications") }}
        </small>
        <select v-else v-model="destination_publication_path">
          <option
            v-for="publication in destination_publications"
            :key="publication.$path"
            :value="publication.$path"
            v-text="makePublicationTitle(publication)"
          />
        </select>
      </div>

      <div v-if="destination_publication_path">
        <LoaderSpinner v-if="!destination_publication" />
        <template v-else>
          <template v-if="destination_kind === 'section'">
            <DLabel :str="$t('section')" />
            <small
              v-if="destination_sections.length === 0"
              class="u-instructions"
            >
              {{ $t("no_sections") }}
            </small>
            <select v-else v-model="destination_section_path">
              <option
                v-for="section in destination_sections"
                :key="section.$path"
                :value="section.$path"
                v-text="makeSectionTitle(section)"
              />
            </select>
          </template>
          <template v-else-if="destination_kind === 'page'">
            <DLabel :str="$t('page')" />
            <select v-model="destination_page_id">
              <option
                v-for="(page, index) in destination_publication.pages"
                :key="page.id"
                :value="page.id"
                v-text="makePageTitle(page, index)"
              />
            </select>
          </template>

          <p class="u-instructions u-spacingTop" v-if="placement_instr">
            <small>{{ placement_instr }}</small>
          </p>
        </template>
      </div>
    </DuplicateOrMoveModal>
  </div>
</template>
<script>
import SpaceProjectPicker from "@/components/fields/SpaceProjectPicker.vue";
import DuplicateOrMoveModal from "@/components/DuplicateOrMoveModal.vue";

export default {
  props: {
    publimodule: Object,
  },
  components: {
    SpaceProjectPicker,
    DuplicateOrMoveModal,
  },
  data() {
    return {
      show_modal: false,

      source_publication: undefined,

      scope: undefined,
      destination_project_path: undefined,
      destination_publications: undefined,
      destination_publication_path: undefined,
      destination_publication: undefined,
      destination_section_path: undefined,
      destination_page_id: undefined,

      is_copying: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    async show_modal() {
      this.is_copying = false;
      this.scope = undefined;
      if (!this.show_modal) return;

      // needed to preselect the current section of the module
      this.source_publication = await this.$api.getFolder({
        path: this.source_publication_path,
      });
      this.scope = "same_publication";
    },
    scope() {
      this.destination_project_path = undefined;
      this.destination_publications = undefined;
      this.destination_publication_path = undefined;

      if (this.scope === "same_publication") {
        this.destination_project_path = this.source_project_path;
        this.destination_publication_path = this.source_publication_path;
      } else if (this.scope === "same_project") {
        this.loadDestinationPublications(this.source_project_path);
      }
      // other_project: waits for SpaceProjectPicker
    },
    async destination_publication_path(path) {
      this.destination_publication = undefined;
      this.destination_section_path = undefined;
      this.destination_page_id = undefined;
      if (!path) return;

      const publication = await this.$api.getFolder({ path });
      // user may have picked another publication in the meantime
      if (path !== this.destination_publication_path) return;
      this.destination_publication = publication;

      // preselect current location of the module when possible, or first item
      if (this.destination_kind === "section") {
        const current_section =
          this.is_same_publication &&
          this.destination_sections.find((s) =>
            this.source_section_paths.includes(s.$path)
          );
        this.destination_section_path = (
          current_section || this.destination_sections[0]
        )?.$path;
      } else if (this.destination_kind === "page") {
        const pages = publication.pages || [];
        const current_page =
          this.is_same_publication &&
          pages.find((p) => p.id === this.publimodule.page_id);
        this.destination_page_id = (current_page || pages[0])?.id;
      }
    },
  },
  computed: {
    module_meta_filename() {
      return this.getFilename(this.publimodule.$path);
    },
    source_publication_path() {
      return this.getParent(this.publimodule.$path);
    },
    source_project_path() {
      return this.getParent(this.getParent(this.source_publication_path));
    },
    scope_options() {
      return [
        { key: "same_publication", label: this.$t("in_this_publication") },
        {
          key: "same_project",
          label: this.$t("in_another_publication_of_project"),
        },
        { key: "other_project", label: this.$t("in_another_project") },
      ];
    },
    is_same_publication() {
      return this.destination_publication_path === this.source_publication_path;
    },
    destination_kind() {
      const publication = this.destination_publication;
      if (!publication) return false;
      if (publication.template === "page_by_page") return "page";
      if (publication.template === "story") return "story";
      return "section";
    },
    compatible_templates() {
      // modules laid out on pages (position, size, shapes) only make sense
      // in other page by page publications, and flowing modules (stories,
      // chapters, maps) only in publications that flow
      if (this.source_publication?.template === "page_by_page")
        return ["page_by_page"];
      return ["story", "story_with_sections", "cartography", "edition"];
    },
    destination_sections() {
      if (!this.destination_publication) return [];
      const sections = this.getSectionsWithProps({
        publication: this.destination_publication,
        group: "sections_list",
      });
      // in editions, only story chapters hold modules
      if (this.destination_publication.template === "edition")
        return sections.filter((s) => s.section_type === "story");
      return sections;
    },
    destination_is_valid() {
      if (!this.source_publication || !this.destination_publication)
        return false;
      if (this.destination_kind === "section")
        return !!this.destination_section_path;
      if (this.destination_kind === "page") return !!this.destination_page_id;
      return true;
    },
    is_already_there() {
      // moving to the exact same place does nothing
      if (!this.is_same_publication) return false;
      if (this.destination_kind === "section")
        return this.source_section_paths.includes(
          this.destination_section_path
        );
      if (this.destination_kind === "page")
        return this.publimodule.page_id === this.destination_page_id;
      return true;
    },
    source_section_paths() {
      if (!this.source_publication?.$files) return [];
      return this.source_publication.$files
        .filter((f) => f.modules_list?.includes(this.module_meta_filename))
        .map((f) => f.$path);
    },
    placement_instr() {
      if (this.destination_kind === "section")
        return this.$t("module_added_at_end_of_section");
      if (this.destination_kind === "story")
        return this.$t("module_added_at_end_of_publication");
      if (this.destination_kind === "page")
        return this.$t("module_added_to_page");
      return false;
    },
  },
  methods: {
    async loadDestinationPublications(project_path) {
      const scope = this.scope;
      this.destination_project_path = project_path;
      this.destination_publications = undefined;
      this.destination_publication_path = undefined;

      const publications = await this.$api.getFolders({
        path: project_path + "/publications",
      });
      // user may have changed their choice in the meantime
      if (
        scope !== this.scope ||
        project_path !== this.destination_project_path
      )
        return;

      this.destination_publications = publications
        .filter(
          (p) =>
            this.compatible_templates.includes(p.template) &&
            p.$path !== this.source_publication_path &&
            this.canContributeToPublication(p)
        )
        .sort((a, b) => a.title.localeCompare(b.title));

      this.destination_publication_path =
        this.destination_publications[0]?.$path;
    },
    pickOtherProject(project_path) {
      // the picker starts on the current project before switching to another
      if (project_path === this.source_project_path) return;
      this.loadDestinationPublications(project_path);
    },
    canContributeToPublication(publication) {
      try {
        return this.canLoggedinContributeToFolder({ folder: publication });
      } catch (err) {
        // parent project may not be loaded yet, server will check rights anyway
        return true;
      }
    },
    makePublicationTitle(publication) {
      return publication.title + " (" + this.$t(publication.template) + ")";
    },
    makeSectionTitle(section) {
      const title = section.section_title || this.$t("untitled");
      if (this.source_section_paths.includes(section.$path))
        return "• " + title;
      return title;
    },
    makePageTitle(page, index) {
      const title = this.$t("page") + " " + (index + 1);
      if (this.is_same_publication && page.id === this.publimodule.page_id)
        return "• " + title;
      return title;
    },

    async confirm({ remove_original }) {
      this.is_copying = true;

      try {
        if (remove_original && this.is_same_publication) {
          // same publication: no need to copy anything, only change its place
          await this.attachToDestination(this.module_meta_filename);
          await this.detachFromSource();
          this.notifyDestination({ remove_original });
          this.show_modal = false;
          return;
        }

        const copy_meta_filename = await this.duplicateModuleWithSourceMedias({
          og_module: this.publimodule,
          addtl_meta_to_module: this.makePlacementMeta(),
          path_to_destination_folder: this.is_same_publication
            ? ""
            : this.destination_publication_path,
        });
        await this.attachToDestination(copy_meta_filename);

        this.notifyDestination({ remove_original });

        if (remove_original) {
          await this.detachFromSource();
          // this component is destroyed with the module
          await this.deleteModuleWithLocalMedias({
            publimodule: this.publimodule,
          });
          return;
        }

        if (this.is_same_publication && this.destination_kind === "page")
          setTimeout(() => {
            this.$eventHub.$emit(
              "module.setActive",
              this.destination_publication_path + "/" + copy_meta_filename
            );
          }, 100);
        this.show_modal = false;
      } catch (err) {
        this.$alertify.delay(4000).error(err?.code || err);
        this.is_copying = false;
      }
    },

    notifyDestination({ remove_original }) {
      let destination;
      if (this.destination_kind === "page") {
        const page_index = this.destination_publication.pages.findIndex(
          (p) => p.id === this.destination_page_id
        );
        destination = this.$t("to_page_n", { number: page_index + 1 });
      } else if (this.destination_kind === "section") {
        const section = this.destination_sections.find(
          (s) => s.$path === this.destination_section_path
        );
        destination = this.$t("to_section_x", {
          title: section.section_title || this.$t("untitled"),
        });
      }

      if (!this.is_same_publication) {
        const title = this.destination_publication.title;
        destination = destination
          ? this.$t("x_of_publication_y", { place: destination, title })
          : this.$t("to_publication_x", { title });
      }

      let message = remove_original
        ? this.$t("module_moved_to", { destination })
        : this.$t("module_duplicated_to", { destination });
      if (!destination)
        message = remove_original
          ? this.$t("module_moved")
          : this.$t("module_duplicated");

      // computed now: when moved, this component is destroyed with the module
      this.toastWithLink({ message, navigation: this.makeNavigationToCopy() });
    },
    makePlacementMeta() {
      if (this.destination_kind !== "page") return {};

      const meta = { page_id: this.destination_page_id };

      // keep size and position, with an offset when duplicated on the same
      // page so the copy is visible
      const is_same_page =
        this.is_same_publication &&
        this.publimodule.page_id === this.destination_page_id;
      const offset = is_same_page ? 10 : 0;
      meta.x = (this.publimodule.x || 0) + offset;
      meta.y = (this.publimodule.y || 0) + offset;
      return meta;
    },
    async attachToDestination(meta_filename) {
      if (this.destination_kind === "page") {
        // page_id is already set in the copy, unless the module was only moved
        if (meta_filename === this.module_meta_filename)
          await this.$api.updateMeta({
            path: this.publimodule.$path,
            new_meta: this.makePlacementMeta(),
          });
        return;
      }

      let path_to_update, list;
      if (this.destination_kind === "story") {
        path_to_update = this.destination_publication.$path;
        list = this.destination_publication.modules_list;
      } else {
        const section = this.destination_sections.find(
          (s) => s.$path === this.destination_section_path
        );
        path_to_update = section.$path;
        list = section.modules_list;
      }

      const modules_list = Array.isArray(list) ? list.slice() : [];
      modules_list.push(meta_filename);
      await this.$api.updateMeta({
        path: path_to_update,
        new_meta: { modules_list },
      });
    },
    async detachFromSource() {
      // module can be listed in the publication itself (story)
      // or in its sections (story_with_sections, cartography, edition)
      const containers = [
        this.source_publication,
        ...this.source_publication.$files,
      ];
      for (const container of containers) {
        if (!container.modules_list?.includes(this.module_meta_filename))
          continue;
        // when moving inside the same publication, the module has just been
        // added to the destination section, which must keep it
        if (
          this.is_same_publication &&
          container.$path === this.destination_section_path
        )
          continue;
        await this.$api.updateMeta({
          path: container.$path,
          new_meta: {
            modules_list: container.modules_list.filter(
              (mf) => mf !== this.module_meta_filename
            ),
          },
        });
      }
    },
    makeNavigationToCopy() {
      const pane = {
        type: "publish",
        folder: this.getFilename(this.destination_publication_path),
      };
      if (this.destination_kind === "section")
        pane.section = this.getFilename(this.destination_section_path);
      else if (this.destination_kind === "page")
        pane.page_id = this.destination_page_id;

      return this.makeNavigationToProjectPane({
        project_path: this.destination_project_path,
        pane,
      });
    },
  },
};
</script>
<style lang="scss" scoped></style>
