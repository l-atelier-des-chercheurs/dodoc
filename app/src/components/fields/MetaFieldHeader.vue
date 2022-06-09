<template>
  <div class="">
    <label v-if="show_label" v-html="title" />
    <!-- <transition name="fade" mode="out-in"> -->
    <template v-if="edit_mode !== undefined">
      <sl-tooltip :content="$t('edit')">
        <sl-button
          size="small"
          v-if="!edit_mode"
          circle
          @click="$emit('update:edit_mode', true)"
        >
          <sl-icon name="pencil-fill" />
          <!-- {{ $t("edit") }} -->
        </sl-button>
      </sl-tooltip>

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
    show_label: {
      type: Boolean,
      default: true,
    },
    raw_mode: {
      type: Boolean,
      default: undefined,
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
<style lang="scss" scoped></style>
