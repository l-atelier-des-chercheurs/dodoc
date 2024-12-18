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
      </template>
      <EditBtn v-if="can_edit" @click="edit_mode = !edit_mode" />
    </div>
    <div class="u-sameRow" v-if="edit_mode">
      <div class="">
        <EditBtn
          :btn_type="'duplicate'"
          @click="
            $emit('duplicatePage');
            edit_mode = false;
          "
        />
      </div>
      <RemoveMenu
        v-if="can_edit"
        :remove_text="$t('remove_page_and_content')"
        @remove="$emit('removePage')"
      >
        <template slot="trigger">
          <EditBtn :btn_type="'remove'" />
        </template>
      </RemoveMenu>
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
