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
      <transition name="fade_fast" :duration="150">
        <Loader v-if="is_changing_lang"
      /></transition>

      <div class="margin-sides-medium">
        <div class="margin-vert-small">
          do•doc version {{ $root.state.appVersion }}
        </div>
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
              <ActivityJournal :journal_entries="journal_data" />
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
        <div class="margin-vert-small">
          <label>{{ $t("access") }}</label>
          <div>
            <template v-if="!$root.current_author_is_admin">
              <small>{{ $t("only_available_to_admins") }}</small>
            </template>
            <Loader v-else-if="is_loading_access" />
            <template v-else-if="show_access && access_data">
              <AccessJournal :access_entries="access_data" />
            </template>
          </div>
          <div>
            <button
              type="button"
              class="button-greenthin margin-left-none"
              v-if="$root.current_author_is_admin"
              @click="loadAccess"
            >
              <template v-if="!show_access">{{ $t("show") }}</template>
              <template v-else>{{ $t("reload") }}</template>
            </button>
            <button
              type="button"
              class="button-greenthin margin-left-none"
              v-if="$root.current_author_is_admin && show_access"
              @click="emptyAccess"
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
import AccessJournal from "../subcomponents/AccessJournal.vue";

export default {
  props: ["read_only"],
  components: {
    ActivityJournal,
    AccessJournal,
  },
  data() {
    return {
      new_lang: this.$root.lang.current,
      is_changing_lang: false,

      show_journal: false,
      journal_data: undefined,
      is_loading_journal: false,

      show_access: false,
      access_data: undefined,
      is_loading_access: false,
    };
  },
  watch: {
    new_lang() {
      this.is_changing_lang = true;

      setTimeout(() => {
        this.$root.updateLocalLang(this.new_lang);
        setTimeout(() => {
          this.is_changing_lang = false;
          this.$alertify
            .closeLogOnClick(true)
            .delay(8000)
            .success(
              this.$t("notifications.new_lang_applied") +
                " — " +
                this.$root.lang.available.find(
                  (l) => l.key === this.$root.lang.current
                ).name
            );

          if (this.$root.lang.current !== "en") {
            setTimeout(() => {
              this.$alertify
                .closeLogOnClick(true)
                .delay(8000)
                .log(this.$t("notifications.missing_translation_handled_in"));
            }, 500);
          }
        }, 150);
      }, 150);
    },
  },
  mounted() {
    if (this.$root.current_author_is_admin) this.loadAccess();
  },
  computed: {},
  methods: {
    loadJournal() {
      this.show_journal = true;

      this.is_loading_journal = true;

      this.$nextTick(() => {
        this.$socketio.loadJournal({ type: "changelog" });
      });

      this.$eventHub.$once(`socketio.journal.is_loaded`, (data) => {
        this.is_loading_journal = false;
        this.journal_data = data;
      });
    },
    emptyJournal() {
      this.$socketio.emptyJournal({ type: "changelog" });
    },
    loadAccess() {
      this.show_access = true;

      this.is_loading_access = true;

      this.$nextTick(() => {
        this.$socketio.loadJournal({ type: "access" });
      });

      this.$eventHub.$once(`socketio.journal.is_loaded`, (data) => {
        this.is_loading_access = false;

        this.access_data = data;
      });
    },
    emptyAccess() {
      this.$socketio.emptyJournal({ type: "access" });
    },
  },
};
</script>
<style lang="scss"></style>
