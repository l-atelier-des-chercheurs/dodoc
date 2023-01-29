<template>
  <div class="_videoAssemblage">
    VideoAssemblage
    <div class="">
      {{ remix }}

      <button
        type="button"
        class="u-button u-button_bleuvert"
        v-if="!show_media_picker"
        @click="show_media_picker = true"
      >
        {{ $t("add_medias") }}
      </button>
      <PickMediaFromProjects
        v-else
        :subfolder_path="remix.$path"
        @selectMedia="$emit('selectMedia', $event)"
        @close="$emit('close')"
      />
    </div>
  </div>
</template>
<script>
import PickMediaFromProjects from "@/components/publications/PickMediaFromProjects.vue";

export default {
  props: {
    remix: Object,
  },
  components: {
    PickMediaFromProjects,
  },
  data() {
    return {
      show_media_picker: false,
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
._videoAssemblage {
  border: 2px solid var(--c-bleumarine);
  margin: calc(var(--spacing) * 1);
  padding: calc(var(--spacing) * 1);
}
</style>
