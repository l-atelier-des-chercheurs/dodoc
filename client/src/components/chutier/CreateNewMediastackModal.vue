<template>
  <BaseModal2
    class=""
    size="large"
    :confirm_before_closing="true"
    @save=""
    @close="$emit('close')"
  >
    <div class="_createNewMediastackModal">
      <portal-target name="largemedia" multiple />
      <div class="_content">
        <div class="_breadcrumb">
          <button
            type="button"
            v-for="(step, index) in steps"
            :key="step.label"
            class="step"
            :class="
              current_step === index
                ? 'active'
                : current_step > index
                ? 'completed'
                : ''
            "
            @click="current_step = index"
          >
            <div class="step-line" v-if="index > 0"></div>
            <div class="step-circle">
              <!-- <div v-if="current_step >= index" class="step-label">
                {{ step.label }}
              </div> -->
            </div>
          </button>
        </div>

        <transition name="fade" mode="out-in">
          <div class="_form" :key="current_step">
            <div class="_form-step" v-if="false">
              <div class="_form-step-title">
                <h2>
                  {{ steps[current_step].label }}
                </h2>
              </div>
            </div>

            <template v-if="current_step === 0">
              <div class="u-spacingBottom"></div>

              <div class="_form-title">
                <div class="u-spacingBottom">
                  <h1>
                    <DLabel :str="$t('document_title')" />
                    <TextInput
                      :content.sync="stack_title"
                      :required="true"
                      :autofocus="true"
                      :can_edit="true"
                      @toggleValidity="($event) => (has_valid_title = $event)"
                    />
                  </h1>
                </div>
                <div class="u-spacingBottom _description">
                  <DLabel :str="$t('description')" />
                  <TextInput
                    :content.sync="stack_description"
                    :input_type="'editor'"
                    :can_edit="true"
                  />
                </div>
              </div>

              <!-- <div class="u-spacingBottom">
                <DLabel :str="$t('credit_unique_for_all_files')" />
                <TextInput
                  :content.sync="credit_unique_for_all_files"
                  :input_type="'text'"
                  :can_edit="true"
                  @onEnter="nextStep"
                />
              </div> -->
            </template>
            <DLabel :str="$t('content')" />
            <!-- <p class="u-spacingBottom">
              Renseignez les légendes et crédits de vos fichiers.
              <button type="button" class="u-buttonLink">
                Crédit unique pour tous les fichiers
              </button>
            </p> -->

            <div class="u-spacingBottom">
              Crédit par défaut (si champ vide) :
              <TextInput :content="'LUMA Arles 2025'" :can_edit="true" />
            </div>

            <div
              class="u-spacingBottom _form-review-items"
              :class="{
                'has--onlyThumbs': show_only_thumbs,
              }"
            >
              <ChutierItem
                v-for="file in selected_items"
                :key="file.$path"
                :file="file"
                :context="show_only_thumbs ? 'show_only_thumbs' : ''"
                :is_selected="true"
              />
            </div>

            <template v-if="current_step === 1">
              <div class="u-spacingBottom _form-tags">
                <KeywordsFieldEditor :keywords.sync="stack_tags" />
              </div>
            </template>

            <template v-if="current_step === 2">
              <div class="u-spacingBottom _form-team">
                <AuthorField
                  :label="$t('authors')"
                  :instructions="$t('media_editing_instructions')"
                  :authors_paths="stack_authors"
                  :can_edit="true"
                  @save="
                    (event) => {
                      stack_authors = event;
                    }
                  "
                />
              </div>
            </template>

            <template v-if="current_step === 3">
              <div class="_form-review">
                <div class="u-spacingBottom">
                  <DLabel :str="$t('title')" />
                  <h2>
                    {{ stack_title || $t("none") }}
                  </h2>
                </div>
                <div class="u-spacingBottom">
                  <DLabel :str="$t('description')" />
                  <div v-html="stack_description || $t('none_f')" />
                </div>
                <div class="u-spacingBottom">
                  <DLabel :str="$t('keywords')" />
                  <div v-if="stack_tags.length > 0">
                    <KeywordsField :keywords="stack_tags" :can_edit="false" />
                  </div>
                  <div v-else>{{ $t("none") }}</div>
                </div>

                <div class="">
                  <DLabel :str="$t('destination_corpus')" />
                  <DestinationCorpusSelector
                    :selected_destination_folder_path.sync="
                      selected_destination_folder_path
                    "
                  />
                </div>
              </div>
            </template>
          </div>
        </transition>
      </div>
    </div>

    <template #footer>
      <div>
        <button
          class="u-button u-button_white"
          v-if="status === 'idle'"
          @click="backStep"
        >
          <b-icon icon="arrow-left" />
          {{ $t("back") }}
        </button>
      </div>

      <button
        class="u-button u-button_primary u-button_pill"
        v-if="current_step < steps.length - 1"
        :disabled="!allow_next_step"
        @click="nextStep"
      >
        {{ $t("next") }}
        <b-icon icon="arrow-right" />
      </button>
      <button
        class="u-button u-button_primary"
        v-else-if="current_step === steps.length - 1 && status === 'idle'"
        :disabled="!selected_destination_folder_path"
        @click="publishMediastack"
      >
        {{ $t("publish") }}
      </button>
      <span v-else-if="status === 'publishing'">
        {{ $t("publishing") }}
      </span>
      <span v-else-if="status === 'completed'">
        {{ $t("completed") }}
      </span>

      <div v-if="!allow_next_step" class="u-instructions _cantNextInstr">
        <template v-if="current_step === 0">
          {{ $t("add_title_to_continue") }}
        </template>
        <template v-if="current_step === 1">
          {{ $t("add_keywords_to_continue") }}
        </template>
        <template v-if="current_step === 2">
          {{ $t("add_authors_to_continue") }}
        </template>
      </div>
    </template>
  </BaseModal2>
</template>
<script>
import KeywordsFieldEditor from "@/components/KeywordsFieldEditor.vue";
import KeywordsField from "@/components/KeywordsField.vue";
import ChutierItem from "@/components/chutier/ChutierItem.vue";
import DestinationCorpusSelector from "@/components/DestinationCorpusSelector.vue";

export default {
  props: {
    selected_items: Array,
  },
  components: {
    KeywordsFieldEditor,
    KeywordsField,
    ChutierItem,
    DestinationCorpusSelector,
  },
  i18n: {
    messages: {
      fr: {
        destination_corpus: "Corpus de destination",
        document_title: "Titre du document",
        create_document: "Nouveau document",
        add_title_to_continue: "Indiquez un titre pour continuer",
        add_keywords_to_continue: "Ajoutez des mots-clés pour continuer",
        add_authors_to_continue: "Ajoutez des auteurs pour continuer",
      },
      en: {
        destination_corpus: "Destination corpus",
        document_title: "Document title",
        create_document: "New document",
        add_title_to_continue: "Add title to continue",
        add_keywords_to_continue: "Add keywords to continue",
        add_authors_to_continue: "Add authors to continue",
      },
    },
  },
  data() {
    return {
      current_step: 0,
      steps: [
        {
          label: this.$t("title"),
        },
        {
          label: this.$t("keywords"),
        },
        {
          label: this.$t("team"),
        },
        {
          label: this.$t("review"),
        },
      ],

      stack_title: "",
      has_valid_title: false,
      stack_description: "",
      stack_common_credit: "",
      stack_tags: [],
      stack_authors: [],

      status: "idle",
      selected_destination_folder_path: undefined,
    };
  },
  created() {
    if (this.connected_as.$path)
      this.stack_authors.push(this.connected_as.$path);
  },
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    modal_name() {
      return this.$t("create_document");
      // +
      // " (" +
      // (this.current_step + 1) +
      // "/" +
      // this.steps.length +
      // ")"
    },
    allow_next_step() {
      if (this.current_step === 0) return this.has_valid_title;
      if (this.current_step === 1) return this.stack_tags.length > 0;
      return true;
    },
    show_only_thumbs() {
      return this.current_step > 0 && this.current_step !== 3;
    },
  },
  methods: {
    backStep() {
      if (this.current_step > 0) this.current_step--;
      else this.$emit("close");
    },
    nextStep() {
      this.current_step++;
    },
    async publishMediastack() {
      this.status = "publishing";

      // CREATE STACK IN DESTINATION CORPUS

      const path_to_destination =
        this.selected_destination_folder_path + "/stacks";

      let additional_meta = {
        $status: "public",
        requested_slug: "stack",
        $admins: this.stack_authors,
        title: this.stack_title,
        description: this.stack_description,
        keywords: this.stack_tags,
      };

      const new_stack_slug = await this.$api.createFolder({
        path: path_to_destination,
        additional_meta,
      });

      const stack_path = path_to_destination + "/" + new_stack_slug;

      // COPY FILES TO STAC

      let stack_files_metas = [];
      for (const file of this.selected_items) {
        const file_meta_name = await this.$api.copyFile({
          path: file.$path,
          path_to_destination_folder: stack_path,
          new_meta: {},
        });
        stack_files_metas.push(file_meta_name);
        await this.$api.deleteItem({ path: file.$path });
      }

      let new_meta = {
        stack_files_metas,
      };
      if (stack_files_metas.length >= 1)
        new_meta.$preview = stack_files_metas[0];

      await this.$api.updateMeta({
        path: stack_path,
        new_meta,
      });

      await new Promise((r) => setTimeout(r, 250));

      this.status = "completed";
      this.$emit("stackPosted", new_stack_slug);

      await new Promise((r) => setTimeout(r, 1000));

      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped>
._createNewMediastackModal {
  // position: absolute;
  // top: 0;
  // left: 0;
  // width: 100%;
  // height: 100%;
  // z-index: 10000;
  // overflow-y: auto;

  // padding: calc(var(--spacing) * 2);
  // background-color: white;
  // background-color: var(--h-50);
}

._content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  // max-width: 360px;
  margin: 0 auto;
}

._breadcrumb {
  display: flex;
  align-items: center;
  list-style: none;
  padding: 0;
  // margin-bottom: var(--spacing);
}

.step {
  appearance: none;
  background-color: transparent;
  padding: 0;

  position: relative;
  display: flex;
  align-items: center;
  color: var(--h-200);
  margin-top: var(--spacing);
  pointer-events: none;

  &.active {
    color: var(--h-500);
  }

  &.completed {
    color: var(--h-500);
    pointer-events: auto;
  }
}

.step-circle {
  position: relative;
  display: block;
  width: 20px;
  height: 20px;
  border: 2px solid currentColor;
  border-radius: 50%;

  &::before {
    content: "";
    position: absolute;
    inset: 3px;
    border-radius: 50%;
    background-color: currentColor;
    opacity: 0;
    transition: opacity 0.25s cubic-bezier(0.19, 1, 0.22, 1);
  }

  .step.active &,
  .step.completed & {
    &::before {
      opacity: 1;
    }
  }
}

.step-label {
  position: absolute;
  top: 100%;
  left: 0;
  font-weight: 600;
  transform: translateX(-50%);
  left: 50%;
  margin-top: 4px;
  white-space: nowrap;
  transition: opacity 0.25s cubic-bezier(0.19, 1, 0.22, 1);

  .step.completed:not(:hover) & {
    opacity: 0;
    // color: var(--h-500);
  }
}

.step-line {
  width: 60px;
  height: 2px;
  background-color: currentColor;
  transition: background-color 0.25s cubic-bezier(0.19, 1, 0.22, 1);
}

._form {
  width: 100%;
  background-color: white;
  // padding: calc(var(--spacing) * 1) 0;
}

._description {
  // border-radius: var(--input-border-radius);
  // background-color: var(--c-gris_clair);
  // overflow: hidden;
}

._cantNextInstr {
  width: 100%;
  text-align: right;
}

._form-review-items {
  > * {
    margin-bottom: calc(var(--spacing) / 4);
    // max-width: 22em;
  }

  &.has--onlyThumbs {
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-start;
    align-items: flex-start;
    gap: calc(var(--spacing) / 2);
    > * {
      // max-width: 22em;
    }
  }
}
</style>
<style lang="scss">
._baseModal--content:has(._createNewMediastackModal) {
  // background-color: var(--h-50) !important;
}
</style>
