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
          <label>{{ $t("journal") }}</label
          ><br />
          <template v-if="!$root.current_author_is_admin">
            <small>{{ $t("only_available_to_admins") }}</small>
          </template>
          <template v-else>
            <!-- <button type="button" @click="loadJournal">
              {{ $t("reload") }}
            </button> -->

            <table class="table-striped table-bordered">
              <thead>
                <tr>
                  <th colspan="1">
                    {{ $t("date") }}
                  </th>
                  <th colspan="1">
                    {{ $t("author") }}
                  </th>
                  <th colspan="1">
                    {{ $t("action") }}
                  </th>
                  <th colspan="1">
                    {{ $t("detail") }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(entry, index) of journal_entries" :key="index">
                  <td>
                    {{ entry.date }}
                  </td>
                  <td>
                    {{ entry.author }}
                  </td>
                  <td>
                    {{ $t(entry.action) }}
                  </td>
                  <td>
                    <small>
                      {{ entry.detail }}
                    </small>
                  </td>
                </tr>
              </tbody>
            </table>
          </template>
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
    Modal,
  },
  data() {
    return {
      new_lang: this.$root.lang.current,
    };
  },
  watch: {
    new_lang() {
      this.$root.updateLocalLang(this.new_lang);
    },
  },
  mounted() {
    if (this.$root.current_author_is_admin) this.loadJournal();
  },
  computed: {
    journal_entries() {
      let journal = this.$root.state.journal;
      if (typeof journal !== "object" || this.$root.state.journal.length === 0)
        return false;

      journal = journal.map((j) => {
        if (j.author) {
          const author = this.$root.getAuthor(j.author);
          if (author) j.author = author.name;
        }
        if (j.timestamp && this.$moment(+j.timestamp).isValid()) {
          j.date = this.$moment(+j.timestamp).calendar();
        }
        return j;
      });

      return journal;
    },
  },
  methods: {
    loadJournal() {
      this.$socketio.loadJournal();
    },
  },
};
</script>
<style lang="scss"></style>
