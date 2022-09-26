<template>
  <div class="_metaFieldHeader">
    <div class="_label" v-if="title" v-html="title" />

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
        v-if="!edit_mode"
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

    <template v-if="raw_mode !== undefined">
      <!-- <sl-icon-button name="file-code-fill" label="Settings"></sl-icon-button> -->
      <sl-tooltip :content="$t('raw_text')">
        <sl-button
          circle
          size="small"
          type="info"
          v-if="!edit_mode"
          :active="raw_mode"
          @click="$emit('update:raw_mode', !raw_mode)"
        >
          <sl-icon name="code-square" />
        </sl-button>
      </sl-tooltip>
    </template>
    <!-- </transition> -->
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
