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
              >
                {{ lang.name }}
              </option>
            </select>
          </div>
          <small v-html="$t('translate_dodoc_instructions')" />
        </div>
      </div>
      <div class="margin-sides-medium">
        <div class="margin-vert-small" style="position: relative">
          <label>{{ $t("journal") }}</label>
          <div>
            <template v-if="!$root.current_author_is_admin">
              <small>{{ $t("only_available_to_admins") }}</small>
            </template>
            <Loader v-else-if="is_loading_journal" />
            <template v-else-if="show_journal">
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
              <template v-if="!show_journal">{{ $t("show") }}</template>
              <template v-else>{{ $t("reload") }}</template>
            </button>
            <button
              type="button"
              class="button-greenthin margin-left-none"
              v-if="$root.current_author_is_admin && show_journal"
              @click="emptyJournal"
            >
              {{ $t("empty_content") }}
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
      show_journal: false,
      is_loading_journal: false,
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
      this.show_journal = true;

      this.is_loading_journal = true;
      this.$eventHub.$once(`socketio.journal.is_loaded`, () => {
        this.is_loading_journal = false;
      });
    },
    emptyJournal() {
      this.$socketio.emptyJournal();
    },
  },
};
</script>
<style lang="scss"></style>
