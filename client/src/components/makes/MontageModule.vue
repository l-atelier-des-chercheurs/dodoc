<template>
  <div class="_montageModule">
    <div class="_line" />
    <div class="_index">
      {{ index }}
    </div>

    <div class="_preview">
      <div class="">
        <div class="u-label">
          {{ $t(first_media.$type) }}
        </div>
        <template v-if="first_media_duration">{{
          first_media_duration
        }}</template>
      </div>
      <MediaContent
        v-if="first_media.$type !== 'text'"
        :file="first_media"
        :resolution="1600"
        :context="'full'"
        :show_fs_button="true"
        :is_draggable="false"
      />

      <CollaborativeEditor2
        v-else
        ref="textBloc"
        :path="first_media.$path"
        :content="first_media.$content"
        :line_selected="false"
        :can_edit="true"
        @lineClicked="$emit('lineClicked', $event)"
        @contentIsEdited="$emit('contentIsEdited', $event)"
        @contentIsNotEdited="$emit('contentIsNotEdited', $event)"
      />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    makemodule: Object,
    index: Number,
  },
  components: {},
  data() {
    return {};
  },
  i18n: {
    messages: {
      fr: {},
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    first_media() {
      return this.firstMedia(this.makemodule);
    },
    first_media_duration() {
      return this.displayDuration({ media: this.first_media });
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._montageModule {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;

  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;

  width: 100%;
  max-width: 400px;
  margin: 0 auto;

  gap: calc(var(--spacing) / 1);
  color: white;

  &:last-child {
    ._line {
      height: calc(100%);
    }
  }
}

._line {
  position: absolute;
  background: white;
  width: 4px;
  height: calc(100% + 3rem);
  margin-left: 1.5rem;
  margin-top: 2px;
  z-index: 0;
  top: 0;
  border-radius: 4px;
}
._index {
  position: sticky;
  top: 0;
  font-size: 5rem;
  font-family: Fira Mono;
  text-transform: uppercase;
  line-height: 1;
  font-weight: 600;
  z-index: 1;
  background-color: var(--c-bleumarine);
}

.u-label {
  color: white;
}

._lastModule {
  margin-top: calc(var(--spacing) * 2);
}
</style>
