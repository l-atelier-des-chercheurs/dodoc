<template>
  <div class="_pageMenu">
    <div>
      <transition name="fade_fast" mode="out-in">
        <b :key="page_number">{{ $t("page") }} {{ page_number + 1 }}</b>
      </transition>
      <transition
        v-if="active_spread_index !== false"
        name="fade_fast"
        mode="out-in"
      >
        <span :key="active_spread_index">
          <template v-if="page_number === 0"> ({{ $t("cover") }}) </template>
          <template v-else>
            ({{ $t("spread").toLowerCase() }} {{ active_spread_index }})
          </template>
        </span>
      </transition>
    </div>
    <br />
    <div class="">
      <label class="u-label">{{ $t("zoom") }} ({{ zoom }})</label>
      <input
        type="range"
        @input="$emit('update:zoom', +$event.target.value)"
        min="0.1"
        max="1"
        :value="zoom"
        step="0.1"
      />
    </div>
    <br />
    <div class="" v-if="can_edit">
      <label class="u-label">{{ $t("gridstep") }} ({{ gridstep_in_cm }})</label>
      <input
        type="range"
        @input="$emit('update:gridstep_in_cm', +$event.target.value)"
        min="0.25"
        max="4"
        step=".25"
      />
    </div>

    <div class="" v-if="can_edit">
      <ModuleCreator
        :publication_path="publication_path"
        :page_id="page_opened_id"
        :is_collapsed="false"
        @addModule="enableModuleEdit"
      />
    </div>

    {{ active_module }}

    <!-- <label class="u-label">{{ $t("medias") }}</label> -->
  </div>
</template>
<script>
import ModuleCreator from "@/components/publications/modules/ModuleCreator.vue";

export default {
  props: {
    can_edit: Boolean,
    page_number: Number,
    active_spread_index: [Boolean, Number],
    zoom: Number,
    gridstep_in_cm: Number,
    publication_path: String,
    page_opened_id: String,
    active_module: [Boolean, String],
  },
  components: {
    ModuleCreator,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    enableModuleEdit({ meta_filename }) {
      setTimeout(() => {
        this.$eventHub.$emit(`module.enable_edit.${meta_filename}`);
      }, 150);
    },
  },
};
</script>
<style lang="scss" scoped>
._pageMenu {
  padding: calc(var(--spacing) * 1);
  margin: calc(var(--spacing) * 1);

  background: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);

  text-align: left;
}
</style>
