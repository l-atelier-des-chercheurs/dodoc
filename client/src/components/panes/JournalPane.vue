<template>
  <div class="_journal" ref="journal">
    <div class="_journal--items">
      <div class="_createForm" v-if="can_edit">
        <sl-button
          variant="text"
          @click="show_create_entry = !show_create_entry"
        >
          <sl-icon name="plus" label="Panneaux" />
          {{ $t("create") }}
        </sl-button>
        <form
          v-if="show_create_entry"
          class="input-validation-required"
          @submit.prevent="createText"
        >
          <sl-input name="title" label="Titre" required />
          <br />
          <select name="Type de bloc" id="cars">
            <option value="volvo">Texte et image</option>
            <option value="saab">Caroussel d'images</option>
            <option value="mercedes">Vidéo</option>
            <option value="audi">Player audio</option>
          </select>

          <br />
          <sl-button type="submit" variant="primary">Créer</sl-button>
        </form>
      </div>

      <div
        v-for="file of files"
        :key="file.slug"
        :file="file"
        :project_slug="project.slug"
        :class="{
          'was--justOpened': file.slug === entry_just_opened,
        }"
      >
        <!-- <div>
          <div class="_journal--entry--title">
            {{ file.title }}
          </div>
        </div> -->

        <JournalItem
          :file="file"
          :project_slug="project.slug"
          :line_selected="line_selected"
          :scrollingContainer="$refs.journal"
          :can_edit="can_edit"
          @close="closeEntry"
          @lineClicked="lineClicked"
        />

        <!-- <sl-icon name="arrow-right" style="font-size: 1.4em" /> -->
      </div>
    </div>

    <transition name="fade">
      <div class="_overlay" v-if="entry_opened" @click="closeEntry" />
    </transition>

    <!-- <transition name="slideup">
      <JournalItem
        v-if="entry_opened"
        :file="entry_opened"
        :project_slug="project.slug"
        :line_selected="line_selected"
        :scrollingContainer="$refs.journal"
        @close="closeEntry"
        @lineClicked="lineClicked"
      />
    </transition> -->
  </div>
</template>
<script>
import JournalItem from "./JournalItem.vue";

export default {
  props: {
    project: Object,
    opened_journal_entry: Object,
    can_edit: Boolean,
  },
  components: {
    JournalItem,
  },
  data() {
    return {
      show_create_entry: false,
      entry_just_opened: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    entry_opened() {
      if (!this.opened_journal_entry) return false;
      return this.files.find((f) => f.slug === this.opened_journal_entry.slug);
    },
    line_selected() {
      if (!this.opened_journal_entry) return false;
      return this.opened_journal_entry.line;
    },
    files() {
      return this.project.$files.filter((f) => f.is_journal === true) || [];
    },
  },
  methods: {
    async createText($event) {
      const formData = new FormData($event.target);
      const formProps = Object.fromEntries(formData);

      const title = formProps.title;
      if (!title) throw new Error("Missing title");

      const meta_filename = await this.$api.uploadText({
        path: this.project.$path,
        filename: "journal-" + title + ".txt",
        additional_meta: {
          is_journal: true,
          title,
        },
      });

      const journal_items = this.project.journal_items?.slice() || [];
      journal_items.push(meta_filename);

      // TODO use updateItem

      await this.$axios.patch(`/projects/${this.project.slug}`, {
        journal_items,
      });

      this.show_create_entry = false;
    },
    openEntry({ slug }) {
      this.$emit("update:opened_journal_entry", { slug });
    },
    closeEntry() {
      this.entry_just_opened = this.opened_journal_entry.slug;
      this.$emit("update:opened_journal_entry", {});
    },
    lineClicked(line) {
      let opened_journal_entry = JSON.parse(
        JSON.stringify(this.opened_journal_entry)
      );
      opened_journal_entry.line = line;
      this.$emit("update:opened_journal_entry", opened_journal_entry);
    },
  },
};
</script>
<style lang="scss" scoped>
._journal {
  position: relative;
  // background: var(--color-Journal);
  height: 100%;
  overflow: auto;
}

._journal--items {
  // height: 100%;
  // width: 100%;
  // position: absolute;
  // top: 0;
  // overflow: auto;
}

._createForm {
  padding: var(--spacing);
  max-width: 66ch;
  margin: 0 auto;
  // background: white;
  text-align: center;
}

._journal--entry {
  background: white;
  margin-bottom: 1px;
  width: 100%;
  text-align: left;
  padding: calc(var(--spacing) / 1);
  cursor: pointer;

  // display: flex;
  // flex-flow: row wrap;
  // justify-content: space-between;
  // align-items: center;

  ._journal--entry--title {
    font-size: var(--sl-font-size-x-large);
  }

  &.was--justOpened {
    color: #999;
  }
  &:hover {
    background: var(--c-gris);
  }
}
._overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
}
</style>
