<template>
  <div class="_keywordsField">
    <DLabel v-if="label" class="_label" :str="label" />
    <div class="u-keywords" v-if="keywords.length > 0">
      <SingleKeyword
        v-for="keyword in keywords"
        :key="keyword"
        :keyword="keyword"
      />
    </div>
    <EditBtn v-if="can_edit" @click="enableEditMode" />

    <BaseModal2 :title="label" v-if="edit_mode" @close="edit_mode = false">
      <KeywordsFieldEditor :keywords.sync="new_keywords" />
      <small>
        <details class="u-spacingBottom">
          <summary>{{ $t("advanced_options") }}</summary>
          <div>
            <div class="u-sameRow">
              <input
                type="text"
                v-model="new_keywords_stringified"
                ref="urlToCopy"
                size="small"
              />
              <button
                type="button"
                class="u-button u-button_icon u-suffix _clipboardBtn"
                @click="copyToClipboard"
              >
                <b-icon icon="clipboard" v-if="!is_copied" />
                <b-icon icon="clipboard-check" v-else />
              </button>
            </div>
          </div>
        </details>
      </small>

      <div slot="footer">
        <SaveCancelButtons
          class="_scb"
          @save="updateKeywords"
          @cancel="cancel"
        />
      </div>
    </BaseModal2>
  </div>
</template>
<script>
import KeywordsFieldEditor from "@/components/KeywordsFieldEditor.vue";
import SingleKeyword from "@/components/SingleKeyword.vue";

export default {
  props: {
    field_name: String,
    label: String,
    path: String,
    keywords: {
      type: Array,
      default: () => [],
    },
    can_edit: Boolean,
  },
  components: {
    KeywordsFieldEditor,
    SingleKeyword,
  },
  data() {
    return {
      new_keywords: this.keywords || [],
      new_keywords_stringified: "",
      edit_mode: this.can_edit && !this.path && !this.field_name,
      is_saving: false,
      is_copied: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    new_keywords: {
      immediate: true,
      handler(new_val) {
        this.$emit("update:keywords", new_val);
        this.new_keywords_stringified = new_val.join(", ");
      },
      deep: true,
    },
    new_keywords_stringified: {
      immediate: true,
      handler(new_val) {
        if (new_val) {
          this.new_keywords = new_val.split(", ").map((kw) => kw.trim());
        } else {
          this.new_keywords = [];
        }
      },
    },
  },
  computed: {},
  methods: {
    enableEditMode() {
      this.edit_mode = true;
    },
    async updateKeywords() {
      this.is_saving = true;
      await new Promise((r) => setTimeout(r, 50));

      try {
        const new_meta = {
          [this.field_name]: this.new_keywords,
        };

        await this.$api.updateMeta({
          path: this.path,
          new_meta,
        });
        this.edit_mode = false;
        this.is_saving = false;
      } catch (err) {
        this.is_saving = false;
      }
    },
    copyToClipboard() {
      this.is_copied = false;

      // Get the text field
      var copyText = this.$refs.urlToCopy;

      // Select the text field
      copyText.select();
      copyText.setSelectionRange(0, 99999); // For mobile devices

      // Copy the text inside the text field
      navigator.clipboard.writeText(copyText.value);

      this.is_copied = true;
    },

    cancel() {
      this.new_keywords = this.keywords || [];
      this.edit_mode = false;
    },
  },
};
</script>
<style lang="scss" scoped></style>
