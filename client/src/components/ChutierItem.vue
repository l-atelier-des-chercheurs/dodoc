<template>
  <div class="_chutierItem">
    <div class="_rows">
      <div class="u-sameRow">
        <input
          type="checkbox"
          :checked="is_selected"
          @change="$emit('toggleSelect')"
          class="_selectBox"
        />
        <MediaContent
          class="_chutierItem--preview"
          :file="file"
          :context="'preview'"
        />
      </div>

      <input
        type="text"
        v-model="text_title"
        @click="setFocus"
        placeholder="Remplir pour partager"
      />
      <transition name="scaleInFade" mode="out-in">
        <button
          type="button"
          class="u-button u-button_transparent"
          :key="text_title.length > 0"
          :disabled="text_title.length === 0"
          @click="$emit('focus')"
        >
          {{ $t("share") }}&nbsp;
          <sl-icon name="arrow-right-square" />
        </button>
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

    <div class="_paneSelector" v-if="is_focused">
      <div class="">Indiquez aussi au moins l'un de ces trois champs</div>
      <div class="_paneSelector--btns">
        <button type="button" class="u-button">Matériaux</button>
        <button type="button" class="u-button">Techniques</button>
        <button type="button" class="u-button">Implémentation</button>
      </div>
    </div>

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
  </div>
</template>
<script>
export default {
  props: {
    file: Object,
    is_selected: Boolean,
    shared_space_path: String,
  },
  components: {},
  data() {
    return {
      is_focused: false,

      text_title: "",
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
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async moveToSharedSpace() {
      const destination_path_to_folder = this.shared_space_path;
      await this.$api.copyFile({
        path: this.file.$path,
        destination_path_to_folder,
      });
      await this.remove();
    },
    async remove() {
      this.$api.deleteItem({ path: this.file.$path });
    },
    setFocus() {
      this.is_focused = true;
    },
  },
};
</script>
<style lang="scss" scoped>
._chutierItem {
  width: 100%;
  padding: 2px;
  margin: 2px;
  background: hsl(0, 0%, 100%);
  box-shadow: 0 0px 5px rgb(0 0 0 / 6%);
  border: 2px solid white;
  border-radius: 5px;
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
}
._paneSelector--btns {
  min-height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: calc(var(--spacing) / 4);
}
</style>
