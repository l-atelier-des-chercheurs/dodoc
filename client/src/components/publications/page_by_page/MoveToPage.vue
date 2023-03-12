<template>
  <div>
    <button
      type="button"
      class="u-buttonLink"
      @click="show_confirm_move = true"
    >
      <sl-icon name="arrow-left-right" />
      {{ $t("move_to_page") }}
    </button>

    <BaseModal2
      v-if="show_confirm_move"
      :title="$t('move_to_page')"
      @close="show_confirm_move = false"
    >
      <div class="">
        <SelectField2
          :value="current_page_id"
          :options="all_pages_in_select"
          :can_edit="true"
          :hide_validation="true"
          @change="setNewPage"
        />
      </div>
      <div class="u-sameRow" slot="footer">
        <button
          type="button"
          class="u-buttonLink"
          @click="show_confirm_move = false"
        >
          {{ $t("cancel") }}
        </button>
        <button
          class="u-button u-button_red"
          type="button"
          autofocus
          :disabled="
            !page_id_to_move_to || page_id_to_move_to === current_page_id
          "
          @click="submit"
        >
          {{ $t("move") }}
        </button>
      </div>
    </BaseModal2>
  </div>
</template>
<script>
export default {
  props: {
    pages: Array,
    current_page_id: String,
  },
  components: {},
  data() {
    return {
      show_confirm_move: false,

      page_id_to_move_to: undefined,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    all_pages_in_select() {
      return this.pages.map((page, index) => ({
        key: page.id,
        text: index + 1,
      }));
    },
  },
  methods: {
    setNewPage(new_page_id) {
      this.page_id_to_move_to = new_page_id;
    },
    submit() {
      this.$emit("submit", this.page_id_to_move_to);
      this.show_confirm_move = false;
    },
  },
};
</script>
<style lang="scss" scoped></style>
