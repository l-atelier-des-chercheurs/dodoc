<template>
  <div class="_label">
    <div class="u-sameRow">
      <b class="">{{ $t("page") }} {{ index + 1 }}</b>
      <EditBtn v-if="can_edit" @click="edit_mode = !edit_mode" />
    </div>
    <div class="u-sameRow" v-if="edit_mode">
      <select
        :value="index"
        @change="
          $emit('movePage', {
            old_position: index,
            new_position: +$event.target.value,
          });
          edit_mode = false;
        "
      >
        <option
          v-for="p in number_of_pages"
          :key="p - 1"
          :value="p - 1"
          v-text="p"
        />
      </select>
      <div class="">
        <button
          type="button"
          class="u-buttonLink"
          @click="
            $emit('duplicatePage');
            edit_mode = false;
          "
        >
          <sl-icon name="clipboard2-plus" />
        </button>
      </div>
      <RemoveMenu
        v-if="can_edit"
        :remove_text="$t('remove_page_and_content')"
        :show_button_text="false"
        @remove="$emit('removePage')"
      />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    index: Number,
    number_of_pages: Number,
    can_edit: Boolean,
  },
  components: {},
  data() {
    return {
      edit_mode: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._label {
  // display: flex;
  // justify-content: center;
  // align-items: center;
  // gap: calc(var(--spacing) / 4);
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  margin: calc(var(--spacing) / 4);
  background: rgba(0, 0, 0, 0.06);
  border-radius: 4px;
}
</style>
