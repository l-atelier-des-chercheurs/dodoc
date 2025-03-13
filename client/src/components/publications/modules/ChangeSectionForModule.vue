<template>
  <BaseModal2 :title="$t('change_section')" @close="$emit('close')">
    <div class="">
      <SelectField2
        :value="current_section_path"
        :options="all_sections_in_select"
        :can_edit="true"
        :hide_validation="true"
        @change="setNewSection"
      />
    </div>
    <template slot="footer">
      <button type="button" class="u-button" @click="$emit('close')">
        <b-icon icon="x-circle" />
        {{ $t("cancel") }}
      </button>
      <button
        class="u-button u-button_bleuvert"
        type="button"
        autofocus
        :disabled="
          !section_path_to_move_to ||
          section_path_to_move_to === current_section_path
        "
        @click="submit"
      >
        {{ $t("move") }}
      </button>
    </template>
  </BaseModal2>
</template>
<script>
export default {
  props: {
    module_path: String,
    sections: Array,
  },
  components: {},
  data() {
    return {
      section_path_to_move_to: undefined,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    module_meta_filename() {
      return this.getFilename(this.module_path);
    },
    all_sections_in_select() {
      return this.sections.map((section) => ({
        key: section.$path,
        text: section.section_title,
      }));
    },
    current_section_path() {
      return this.sections.find((s) =>
        s.modules_list.includes(this.module_meta_filename)
      )?.$path;
    },
  },
  methods: {
    setNewSection(new_section_path) {
      this.section_path_to_move_to = new_section_path;
    },
    async submit() {
      await this.appendModuleToSection();
      await this.removeModuleFromSection();
    },
    async appendModuleToSection() {
      const section_to_move_to = this.sections.find(
        (s) => s.$path === this.section_path_to_move_to
      );
      let modules_list = section_to_move_to.modules_list?.slice() || [];
      modules_list.push(this.module_meta_filename);
      await this.$api.updateMeta({
        path: this.section_path_to_move_to,
        new_meta: { modules_list },
      });
    },
    async removeModuleFromSection() {
      // update old section to filter module
      const old_section = this.sections.find(
        (s) => s.$path === this.current_section_path
      );
      let old_modules_list = old_section.modules_list?.slice() || [];
      old_modules_list = old_modules_list.filter(
        (ml) => ml !== this.module_meta_filename
      );

      await this.$api.updateMeta({
        path: this.current_section_path,
        new_meta: { modules_list: old_modules_list },
      });

      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped></style>
