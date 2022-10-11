<template>
  <div class="_metaFieldHeader">
    <div class="u-label" v-if="title" v-html="title" />

    <!-- <transition name="fade" mode="out-in"> -->
    <template v-if="edit_mode !== undefined">
      &nbsp;
      <!-- <sl-button
        size="small"
        v-if="!edit_mode"
        circle
        @click="$emit('update:edit_mode', true)"
      >
        <sl-tooltip :content="$t('edit')">
          <sl-icon name="pencil-fill" />
        </sl-tooltip>
      </sl-button> -->

      <sl-icon-button
        v-if="!edit_mode && $api.is_logged_in"
        name="pencil-fill"
        :label="$t('edit')"
        @click="$emit('update:edit_mode', true)"
      />

      <SaveCancelButtons
        v-if="edit_mode"
        :is_saving="is_saving"
        @save="$emit('save')"
        @cancel="$emit('cancel')"
      />
    </template>
  </div>
</template>
<script>
export default {
  props: {
    title: String,
    edit_mode: {
      default: undefined,
      type: Boolean,
    },
    raw_mode: {
      default: undefined,
      type: Boolean,
    },
    is_saving: Boolean,
  },
  components: {},
  data() {
    return {};
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
._metaFieldHeader {
  display: flex;
}
</style>
