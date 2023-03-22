<template>
  <div class="_myChutier" v-if="chutier" @click="last_clicked = false">
    <div class="_topContent">
      <div class="_subscribeBtn">
        <button
          type="button"
          class="u-button u-button_bleumarine _authorBtn"
          @click="$emit('showAuthorModal')"
        >
          <template v-if="connected_as">
            {{ connected_as.name }}
          </template>
          <template v-else>{{ $t("login") }}</template>
        </button>
      </div>

      <div class="_importBtn">
        <input
          type="file"
          multiple="multiple"
          :id="id + '-add_file'"
          name="file"
          accept=""
          class="inputfile-2"
          @change="updateInputFiles($event)"
        />
        <label :for="id + '-add_file'">
          <!-- <svg width="20" height="17" viewBox="0 0 20 17">
            <path
              d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"
            />
          </svg> -->
          {{ $t("import") }}
        </label>
        <UploadFiles
          v-if="selected_files.length > 0"
          :selected_files="selected_files"
          :path="path"
          @close="selected_files = []"
          @importedMedias="importedMedias"
        />
      </div>

      <button type="button" @click="$emit('close')">{{ $t("fold") }}</button>
    </div>
    <div class="_middleContent">
      <label for="">Éléments à traiter : {{ chutier_items.length }} </label>
      <br />
      <button
        type="button"
        class="u-buttonLink"
        @click="selectAll"
        v-if="chutier_items.length > 0"
      >
        Sélectionner tout
      </button>
    </div>

    <div class="_items">
      <div class="_item" v-for="ci in chutier_items_grouped" :key="ci.label">
        <div class="_item--label">
          <DateField :date="ci.label" :show_detail_initially="false" />

          <button
            v-if="!rangeIsSelected(ci.files.map((f) => f.$path))"
            type="button"
            class="u-buttonLink"
            @click="selectRange(ci.files.map((f) => f.$path))"
          >
            Sélectionner tout
          </button>
          <button
            v-else
            type="button"
            class="u-buttonLink"
            @click="deselectRange(ci.files.map((f) => f.$path))"
          >
            Déselectionner
          </button>
        </div>
        <transition-group tag="div" name="listComplete">
          <div
            v-for="file in ci.files"
            class="_item--files"
            :key="file.$path"
            @click.stop="last_clicked = file.$path"
          >
            <ChutierItem
              :file="file"
              :is_clicked="last_clicked === file.$path"
              :is_selected="selected_items.includes(file.$path)"
              :shared_space_path="shared_space_path"
              @toggleSelect="toggleSelect(file.$path)"
              @focus="focusItem(file.$path)"
            />
          </div>
        </transition-group>
      </div>
    </div>
    <div class="_selectionBar" v-if="selected_items.length > 0">
      <button
        type="button"
        class="u-button u-button_bleuvert"
        @click="setSelectionAsFocus"
      >
        {{ $t("create_stack") }} ({{ selected_items.length }})
      </button>
      <button
        type="button"
        class="u-buttonLink"
        @click="removeItemsInSelection"
      >
        Supprimer la sélection
      </button>
      <button type="button" class="u-buttonLink" @click="deselectAll">
        Déselectionner tout
      </button>
    </div>

    <MediaFocus
      v-if="focused_items.length > 0"
      class="_mediaFocusInPane"
      :files="focused_items"
      @close="focused_items_slugs = []"
    />
  </div>
</template>
<script>
import ChutierItem from "@/components/ChutierItem.vue";
import MediaFocus from "@/components/MediaFocus.vue";

export default {
  props: {
    shared_space_path: String,
  },
  components: {
    ChutierItem,
    MediaFocus,
  },
  data() {
    return {
      chutier: undefined,
      selected_files: [],
      id: `image_select_${(
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 3 + 2)}`,

      last_clicked: undefined,
      selected_items: [],
      focused_items_slugs: [],
    };
  },
  created() {},
  mounted() {
    this.listChutier();
    this.$api.join({ room: this.path });
  },
  beforeDestroy() {
    this.$api.leave({ room: this.path });
  },
  watch: {
    chutier_items() {
      this.selected_items = this.selected_items.filter((item_path) =>
        this.chutier_items.find((ci) => ci.$path === item_path)
      );
    },
  },
  computed: {
    path() {
      return this.connected_as.$path;
    },
    focused_items() {
      return this.focused_items_slugs.map((fis) =>
        this.chutier_items.find((ci) => ci.$path === fis)
      );
    },
    chutier_items() {
      if (!this.chutier || !this.chutier.$files) return [];
      const _medias = JSON.parse(JSON.stringify(this.chutier.$files));
      _medias.sort(
        (a, b) => +new Date(b.$date_uploaded) - +new Date(a.$date_uploaded)
      );
      return _medias;
    },
    chutier_items_grouped() {
      const grouped = this.chutier_items.reduce((group, file) => {
        // var key = file.$date_uploaded;

        var dateObj = new Date(file.$date_created);
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();
        const key = year + "/" + month + "/" + day;

        if (!Object.prototype.hasOwnProperty.call(group, key)) group[key] = [];
        group[key].push(file);
        return group;
      }, {});

      let ordered = [];
      for (const k in grouped)
        if (!Object.prototype.hasOwnProperty.call(ordered, k)) ordered.push(k);
      ordered.sort();
      ordered.reverse();

      return ordered.map((o) => {
        return {
          label: o,
          files: grouped[o],
        };
      });
    },
  },
  methods: {
    async listChutier() {
      this.chutier = await this.$api
        .getFolder({
          path: this.path,
        })
        .catch((err) => {
          this.fetch_project_error = err.response;
          this.is_loading = false;
        });
    },
    toggleSelect(path) {
      if (this.selected_items.includes(path))
        this.selected_items = this.selected_items.filter((i) => i !== path);
      else this.selected_items.push(path);
    },
    focusItem(path) {
      this.focused_items_slugs = [path];
    },
    setSelectionAsFocus() {
      this.focused_items_slugs = JSON.parse(
        JSON.stringify(this.selected_items)
      );
    },
    updateInputFiles($event) {
      this.selected_files = Array.from($event.target.files);
      $event.target.value = "";
    },
    async importedMedias($event) {
      // await new Promise((r) => setTimeout(r, 1000));
      this.selected_items = $event.map(
        (i) => this.connected_as.$path + "/" + i
      );
    },
    selectAll() {
      this.selected_items = this.chutier_items.map((i) => i.$path);
    },
    deselectAll() {
      this.selected_items = [];
    },
    selectRange(range) {
      this.selected_items = this.selected_items.concat(range);
      this.selected_items = [...new Set(this.selected_items)];
    },
    deselectRange(range) {
      this.selected_items = this.selected_items.filter(
        (si) => !range.includes(si)
      );
    },

    rangeIsSelected(range) {
      if (this.selected_items.length === 0) return false;
      // for each item in range, make sure it is included in selected_items
      return !range.find((p) => {
        if (this.selected_items.includes(p) === false) return true;
        return false;
      });
    },
    async removeItemsInSelection() {
      for (const item_path of this.selected_items) {
        await this.$api.deleteItem({ path: item_path });
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._myChutier {
  --chutier-bg: rgba(33, 36, 39, 1);

  height: 100%;
  overflow: auto;
  background: #f9f9f9;
  background: var(--chutier-bg);
  color: white;

  // padding: 0 calc(var(--spacing) / 1);
}
._topContent {
  position: sticky;
  z-index: 1;
  display: flex;
  gap: calc(var(--spacing) / 2);
  top: 0;
  padding: calc(var(--spacing) / 1);

  backdrop-filter: blur(6px);
  mask: linear-gradient(black 75%, transparent 100%);
}
._middleContent {
  padding: 0 calc(var(--spacing) / 1);
}
._importBtn {
  // padding: calc(var(--spacing) / 1) 0;
}

._items {
  padding: calc(var(--spacing) / 1);
}
._item {
  margin-bottom: calc(var(--spacing) / 1);
}
._item--files {
  &.is--lastClicked {
    border: 2px solid red;
  }
}

._item--label {
  // width: 100%;
  // text-align: center;
  font-weight: 500;
  // display: flex;
  // gap: calc(var(--spacing) / 4);
  // align-items: flex-end;
  // justify-content: space-between;
}

._selectionBar {
  position: sticky;
  bottom: 0;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  gap: calc(var(--spacing) / 2);

  // border-top: 1px solid black;
  background: var(--chutier-bg);
  padding: calc(var(--spacing) / 1);
}
._mediaFocusInPane {
  position: absolute;
  z-index: 10;
  top: 0;
  width: 100%;
  height: 100%;
  background: var(--chutier-bg);
}
</style>
