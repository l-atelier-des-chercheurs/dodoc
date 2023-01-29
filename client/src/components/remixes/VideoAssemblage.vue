<template>
  <div class="_videoAssemblage">
    <StoryTemplate :publication="remix" :can_edit="true" />

    <!-- <button
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
      /> -->
  </div>
</template>
<script>
// import PickMediaFromProjects from "@/components/publications/PickMediaFromProjects.vue";
import StoryTemplate from "@/components/publications/templates/StoryTemplate.vue";

export default {
  props: {
    remix: Object,
  },
  components: {
    // PickMediaFromProjects,
    StoryTemplate,
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
  padding: calc(var(--spacing) * 1);
}
</style>
