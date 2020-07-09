<template>
  <Modal
    @close="$emit('close')"
    :read_only="read_only"
    :typeOfModal="
      $root.current_author_is_admin ? 'LargeAndScroll' : 'SmallAndScroll'
    "
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
      <div class="margin-sides-medium">
        <div class="margin-vert-small">
          <label>{{ $t("journal") }}</label>
          <div>
            <template v-if="!$root.current_author_is_admin">
              <small>{{ $t("only_available_to_admins") }}</small>
            </template>
            <template v-else-if="journal_is_loaded">
              <!-- <button type="button" @click="loadJournal">
              {{ $t("reload") }}
            </button> -->
              <ActivityJournal :journal_entries="$root.state.journal" />
            </template>
          </div>
          <div>
            <button
              type="button"
              class="button-greenthin margin-left-none"
              v-if="$root.current_author_is_admin"
              @click="loadJournal"
            >
              <template v-if="journal_is_loaded === 0">{{
                $t("show")
              }}</template>
              <template v-else>{{ $t("reload") }}</template>
            </button>
          </div>
        </div>
      </div>
    </template>
  </Modal>
</template>
<script>
import ActivityJournal from "../subcomponents/ActivityJournal.vue";

export default {
  props: ["read_only"],
  components: {
    ActivityJournal,
  },
  data() {
    return {
      new_lang: this.$root.lang.current,
      show_detail_for_entry: false,
      journal_is_loaded: false,
    };
  },
  watch: {
    new_lang() {
      this.$root.updateLocalLang(this.new_lang);
    },
  },
  mounted() {
    // if (this.$root.current_author_is_admin) this.loadJournal();
  },
  computed: {},
  methods: {
    loadJournal() {
      this.$socketio.loadJournal();
      this.journal_is_loaded = true;
    },
  },
};
</script>
<style lang="scss"></style>
