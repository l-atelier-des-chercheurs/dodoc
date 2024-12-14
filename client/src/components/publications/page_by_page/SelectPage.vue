<template>
  <BaseModal2 :title="$t('move_to_page')" @close="$emit('close')">
    <div class="">
      <SelectField2
        :value="current_page_id"
        :options="all_pages_in_select"
        :can_edit="true"
        :hide_validation="true"
        @change="setNewPage"
      />
    </div>
    <template slot="footer">
      <button type="button" class="u-button" @click="$emit('close')">
        <b-icon icon="x-circle" />
        {{ $t("cancel") }}
      </button>
      <button
        class="u-button u-button_bleuvert"
        type="button"
        autofocus
        :disabled="
          !page_id_to_move_to || page_id_to_move_to === current_page_id
        "
        @click="submit"
      >
        {{ $t("move") }}
      </button>
    </template>
  </BaseModal2>
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
      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped></style>
