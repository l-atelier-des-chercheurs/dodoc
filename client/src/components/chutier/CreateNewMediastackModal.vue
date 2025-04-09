<template>
  <div class="_createNewMediastackModal">
    <div class="_content">
      <div class="_breadcrumb">
        <div
          v-for="(step, index) in steps"
          :key="step.label"
          class="step"
          :class="current_step === index ? 'active' : ''"
        >
          <div class="step-line" v-if="index > 0"></div>
          <div class="step-circle">
            <div v-if="current_step >= index" class="step-label">
              {{ step.label }}
            </div>
          </div>
        </div>
      </div>

      <div class="_form" :key="current_step">
        <template v-if="current_step === 0">
          <div class="_form-title">
            <div class="u-spacingBottom">
              <h1>
                <TextInput
                  :content.sync="stack_title"
                  :placeholder="$t('title')"
                  :required="true"
                  :autofocus="true"
                  :can_edit="true"
                  @onEnter="nextStep"
                />
              </h1>
            </div>
            <div class="u-spacingBottom _description">
              <TextInput
                :content.sync="stack_description"
                :placeholder="$t('description')"
                :input_type="'editor'"
                :can_edit="true"
                @onEnter="nextStep"
              />
            </div>
          </div>
        </template>
        <template v-if="current_step === 1">
          <div class="_form-tags">
            <KeywordsField
              :label="$t('keywords')"
              :field_name="'keywords'"
              :keywords="stack_tags"
              :can_edit="true"
            />
          </div>
        </template>
        <template v-if="current_step === 2">
          <div class="_form-team">TEAM</div>
        </template>
        <template v-if="current_step === 3">
          <div class="_form-review">REVIEW</div>
        </template>

        <div class="_form-actions">
          <button class="u-button u-button_primary" @click="nextStep">
            {{ $t("next") }}
            <b-icon icon="arrow-right" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import KeywordsField from "@/components/KeywordsField.vue";

export default {
  props: {},
  components: {
    KeywordsField,
  },
  data() {
    return {
      current_step: 0,
      steps: [
        {
          label: this.$t("title"),
        },
        {
          label: this.$t("tags"),
        },
        {
          label: this.$t("team"),
        },
        {
          label: this.$t("review"),
        },
      ],

      stack_title: "",
      stack_description: "",
      stack_tags: [],
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    nextStep() {
      this.current_step++;
    },
  },
};
</script>
<style lang="scss" scoped>
._createNewMediastackModal {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10000;

  padding: calc(var(--spacing) * 2);
  background-color: white;
}

._content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  max-width: 360px;
  margin: 0 auto;
}

._breadcrumb {
  display: flex;
  align-items: center;
  list-style: none;
  padding: 0;
  margin-bottom: var(--spacing);
}

._form {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);
  width: 100%;
  // border: 1px solid var(--h-700);
  background-color: var(--h-700);
  box-shadow: 0 0 10px 0 var(--h-100);
  // border-radius: 10px;
  padding: calc(var(--spacing) * 2);
}

.step {
  position: relative;
  display: flex;
  align-items: center;
  color: var(--h-200);

  &.active {
    color: var(--h-500);
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
  }

  .step.active & {
    &::before {
      opacity: 1;
    }
  }
}

.step-label {
  position: absolute;
  bottom: 100%;
  left: 0;
  font-weight: 600;
  margin-right: 8px;
  transform: translateX(-50%);
  left: 50%;
  margin-bottom: 4px;
}

.step-line {
  width: 40px;
  height: 2px;
  background-color: currentColor;
  // margin-right: 8px;
}

._form-actions {
  display: flex;
  justify-content: flex-end;
  gap: calc(var(--spacing) * 2);
}

._description {
  border-radius: var(--input-border-radius);
  background-color: var(--c-gris_clair);
  overflow: hidden;
}
</style>
