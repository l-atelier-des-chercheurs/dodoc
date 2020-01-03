<template>
  <Modal
    @close="$emit('close')"
    :read_only="read_only"
    :typeOfModal="'SmallAndScroll'"
  >
    <template slot="header">
      <span class>{{ $t("settings") }}</span>
    </template>

    <template slot="preview">
      <div class="margin-sides-medium">
        <div class="margin-vert-small">
          do•doc version {{ $root.state.appVersion }}
        </div>
      </div>
      <div class="margin-sides-medium">
        <div class="margin-vert-small">
          <label v-html="$t('lang')" />
          <div class="input">
            <select v-model="new_lang">
              <option
                v-for="lang in this.$root.lang.available"
                :key="lang.key"
                :value="lang.key"
                >{{ lang.name }}</option
              >
            </select>
          </div>
          <small v-html="$t('translate_dodoc_instructions')" />
        </div>
      </div>
    </template>
  </Modal>
</template>
<script>
import Modal from "./BaseModal.vue";

export default {
  props: ["read_only"],
  components: {
    Modal
  },
  data() {
    return {
      new_lang: this.$root.lang.current
    };
  },
  watch: {
    new_lang() {
      this.$root.updateLocalLang(this.new_lang);
    }
  },
  mounted() {},
  computed: {},
  methods: {}
};
</script>
<style lang="scss"></style>
