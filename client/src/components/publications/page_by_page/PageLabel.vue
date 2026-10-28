<template>
  <div class="_label">
    <div class="u-sameRow u-label">
      {{ $t("page") }}
      <template v-if="!edit_mode">
        {{ index + 1 }}
      </template>

      <template v-else>
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
        <EditBtn :btn_type="'close'" @click="edit_mode = false" />
      </template>
      <DropDown v-if="can_edit && !edit_mode" :show_label="false">
        <button
          type="button"
          class="u-buttonLink"
          @click="edit_mode = true"
        >
          <b-icon icon="arrow-left-right" />
          {{ $t("change_order") }}
        </button>
        <button
          type="button"
          class="u-buttonLink"
          @click="$emit('duplicatePage')"
        >
          <b-icon icon="files" />
          {{ $t("duplicate") }}
        </button>
        <RemoveMenu
          :modal_title="$t('remove_page_and_content')"
          @remove="$emit('removePage')"
        />
      </DropDown>
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
  margin: calc(var(--spacing) / 4) 0;
  // background: white;
  // border-radius: 4px;
  // background: rgba(0, 0, 0, 0.06);
}
</style>
