<template>
  <div>
    <div class="u-spacingBottom _top">
      <div>
        <button type="button" class="u-buttonLink" @click="$emit('close')">
          <b-icon icon="arrow-left-short" />
          {{ $t("back") }}
        </button>
      </div>

      <RemoveMenu :button_text="$t('remove_category')" @remove="removeCat" />
    </div>
    <div class="_spinner" v-if="is_loading" key="loader">
      <LoaderSpinner />
    </div>
    <div v-else>
      <div class="_top">
        <div class="u-spacingBottom">
          <TitleField
            class="_title"
            :label="$t('category_title')"
            :field_name="'title'"
            :content="category.title"
            :path="category.$path"
            tag="h3"
            :required="true"
            :maxlength="20"
            :can_edit="true"
          />
        </div>

        <ColorInput
          :label="$t('custom_color')"
          :default_value="'#000000'"
          :value="category.tag_color"
          :can_toggle="true"
          @save="saveNewColor"
        />
      </div>

      <div class="u-spacingBottom _kwSimulation">
        <SingleKeyword
          :keyword="category.title + '/couleur'"
          :cat_color="category.tag_color"
        />
      </div>

      <div class="u-spacingBottom u-keywords">
        <SingleKeyword
          v-for="suggestion in new_list_of_suggestions"
          :key="suggestion"
          :keyword="suggestion"
          :can_remove="true"
          @remove="removeSuggestion(suggestion)"
        />
      </div>

      <div class="u-spacingBottom">
        <input
          type="text"
          v-model="new_suggestion"
          placeholder="Nouveau mot-clé"
          @keydown.enter.exact.prevent="newKeyword"
        />
        <div class="u-instructions" v-if="new_keyword_already_exists">
          <small
            >Ce mot-clé existe déjà, vous ne pouvez pas l’ajouter. Si vous
            souhaitez changer la case, supprimez le de la liste puis ajoutez le
            à nouveau.</small
          >
        </div>
        <div class="u-instructions" v-else-if="new_keyword_contains_slash">
          <small>Ce mot-clé contient le caractère "/", qui est interdit.</small>
        </div>
        <div class="u-instructions" v-else-if="new_suggestion.length > 0">
          <small>Validez avec la touche entrée.</small>
        </div>
      </div>

      <SaveCancelButtons
        class="_scb"
        v-if="new_suggestion.length === 0"
        @save="saveNewSuggestion"
        @cancel="cancel"
      />

      <RemoveMenu :remove_text="$t('remove')" @remove="removeCat" />
    </div>
  </div>
</template>
<script>
import SingleKeyword from "@/components/SingleKeyword.vue";

export default {
  props: {
    path: String,
  },
  components: {
    SingleKeyword,
  },
  data() {
    return {
      category: undefined,
      is_loading: true,

      new_list_of_suggestions: [],
      new_suggestion: "",
    };
  },
  created() {},
  async mounted() {
    this.category = await this.$api.getFolder({
      path: this.path,
    });
    this.$api.join({ room: this.path });

    this.new_list_of_suggestions = this.category.list_of_suggestions || [];
    // this.new_list_of_suggestions = this.new_list_of_suggestions.map(
    //   (s) => this.category.title + "/" + s
    // );
    this.is_loading = false;
  },
  beforeDestroy() {
    this.$api.leave({ room: this.path });
  },
  watch: {},
  computed: {
    new_keyword_already_exists() {
      return this.new_list_of_suggestions.some(
        (s) => s.toLowerCase() === this.new_suggestion.toLowerCase()
      );
    },
    new_keyword_contains_slash() {
      return this.new_suggestion.includes("/");
    },
  },
  methods: {
    removeSuggestion(suggestion) {
      this.new_list_of_suggestions = this.new_list_of_suggestions.filter(
        (s) => s !== suggestion
      );
    },
    newKeyword() {
      if (
        this.new_suggestion.length === 0 ||
        this.new_keyword_already_exists ||
        this.new_keyword_contains_slash
      )
        return false;
      this.new_list_of_suggestions.push(this.new_suggestion);
      this.new_suggestion = "";
    },
    cancel() {
      this.new_list_of_suggestions = this.category.list_of_suggestions;
      this.new_suggestion = "";
      this.$emit("close");
    },
    async saveNewSuggestion() {
      await this.$api.updateMeta({
        path: this.path,
        new_meta: {
          list_of_suggestions: this.new_list_of_suggestions,
        },
      });
      this.$emit("close");
    },
    async saveNewColor($event) {
      await this.$api.updateMeta({
        path: this.path,
        new_meta: {
          tag_color: $event || "",
        },
      });
    },
    async removeCat() {
      await this.$api.deleteItem({
        path: this.path,
      });
      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped>
._top {
  // display: flex;
  // flex-flow: row nowrap;
  // justify-content: space-between;
}

._kwSimulation {
  display: flex;
}
</style>
