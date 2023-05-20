<template>
  <div>
    <div class="_summary">
      <DLabel :str="$t('summary')" />

      <SlickList class="_list" axis="y" :value="sections" @input="updateOrder">
        <SlickItem
          v-for="(section, index) of sections"
          :key="section.$path"
          :index="index"
          class="_item"
          :class="{
            'is--active': isActive(section.$path),
          }"
        >
          <span v-handle class="_inlineBtn">
            <sl-icon-button name="grip-vertical" label="Déplacer" />
          </span>
          <span v-if="section.section_title" class="_title">{{
            section.section_title
          }}</span>
          <span
            v-else
            class="_title"
            v-html="'<i>' + $t('untitled') + '</i>'"
          />
          <small>
            ({{ section.modules_list ? section.modules_list.length : 0 }})
          </small>
          <button
            type="button"
            class="u-buttonLink"
            v-if="!isActive(section.$path)"
            @click="openSection(section.$path)"
          >
            {{ $t("open") }}
          </button>
        </SlickItem>
      </SlickList>
      <hr />
      <!-- <div class="" v-for="(section, index) of sections" :key="section.$path">
        <button
          type="button"
          class="u-button"
          @click="openSection(section.$path)"
        >
          <span
            v-html="section.section_title || $t('section') + ' ' + (index + 1)"
          />
        </button>
        <button
          type="button"
          class="u-button"
          @click="removeSection(section.$path)"
        >
          remove
        </button>
      </div> -->
      <button type="button" class="u-buttonLink" @click="createSection">
        {{ $t("create_section") }}
      </button>
    </div>

    <transition name="pagechange" mode="out-in">
      <div v-if="opened_section" :key="opened_section.$path">
        <SingleSection
          :publication="publication"
          :section="opened_section"
          :can_edit="can_edit"
          @remove="removeSection(opened_section.$path)"
          @close="closeSection"
        />
      </div>
    </transition>
  </div>
</template>
<script>
import SingleSection from "@/components/publications/story/SingleSection.vue";
import { SlickList, SlickItem, HandleDirective } from "vue-slicksort";

export default {
  props: {
    publication: Object,
    section_opened_meta: String,
    can_edit: Boolean,
  },
  components: {
    SingleSection,
    SlickItem,
    SlickList,
  },
  directives: { handle: HandleDirective },
  data() {
    return {
      opened_section_meta_filename: false,
      fruits: ["Apples", "Bananas" /* etc. */],
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    sections_list() {
      return this.publication.sections_list || [];
    },
    sections() {
      const all_sections = this.publication.$files
        ? this.publication.$files.filter((f) =>
            Object.prototype.hasOwnProperty.call(f, "section_type")
          )
        : [];

      if (all_sections.length === 0 || !this.publication.sections_list)
        return [];

      return this.publication.sections_list.map(({ meta_filename }) => {
        return all_sections.find((s) => s.$path.endsWith("/" + meta_filename));
      });
    },
    opened_section() {
      return this.publication.$files?.find((f) =>
        f.$path.endsWith("/" + this.section_opened_meta)
      );
    },
  },
  methods: {
    async createSection() {
      const section_meta_filename = await this.$api
        .uploadFile({
          path: this.publication.$path,
          additional_meta: {
            section_type: "-",
            requested_slug: "section",
          },
        })
        .catch((err) => {
          this.$alertify.delay(4000).error(err);
          throw err;
        });

      let sections_list = this.sections_list.slice();
      sections_list.push({
        meta_filename: section_meta_filename,
      });
      await this.updatePubliMeta({
        sections_list,
      });
      this.$emit("toggleSection", section_meta_filename);
    },
    async removeSection(path) {
      const section_meta_filename = this.getFilename(path);
      let sections_list = this.sections_list.slice();
      sections_list = sections_list.filter(
        (f) => f.meta_filename !== section_meta_filename
      );
      this.updatePubliMeta({
        sections_list,
      });
      await this.$api.deleteItem({
        path,
      });
    },
    async updatePubliMeta(new_meta) {
      return await this.$api.updateMeta({
        path: this.publication.$path,
        new_meta,
      });
    },
    isActive(path) {
      return this.opened_section && path === this.opened_section.$path;
    },
    openSection(path) {
      const section_meta_filename = this.getFilename(path);
      this.$emit("toggleSection", section_meta_filename);
    },
    closeSection() {
      this.$emit("toggleSection", false);
    },
    updateOrder(items) {
      const sections_list = items.map((i) => {
        return {
          meta_filename: this.getFilename(i.$path),
        };
      });

      if (JSON.stringify(sections_list) === JSON.stringify(this.sections_list))
        return "no_update_necessary";

      this.updatePubliMeta({
        sections_list,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._summary {
  background: white;
  padding: calc(var(--spacing) / 2);

  margin: 0 auto;
  max-width: 60ch;
}

._list {
  color: black;
}
</style>
<style lang="scss">
._item {
  z-index: 10000;

  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: calc(var(--spacing) / 2);

  &.is--active {
    ._title {
      background: var(--c-orange);
      padding: calc(var(--spacing) / 8) calc(var(--spacing) / 2);
      border-radius: 4px;
    }
  }

  // color: black;
  // background: blue;
}
</style>
