<template>
  <div>
    <div class>
      <label>{{ $t("who_can_edit") }}</label>

      <div class>
        <div v-for="mode in editing_modes" :key="mode">
          <input
            class="custom_radio"
            type="radio"
            :id="`editing_limited_to-${mode}`"
            :name="`editing_limited_to-${mode}`"
            :value="mode"
            v-model="local_editing_limited_to"
          />
          <label class="text-lc" :for="`editing_limited_to-${mode}`">
            <span>{{ $t(mode) }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Password -->
    <div
      class="margin-top-small"
      v-if="editing_limited_to === 'with_password' && can_have_password"
    >
      <label>{{ $t("password") }}</label>
      <div>
        <input
          type="password"
          required
          :value="password"
          @input="$emit('update:password', $event.target.value)"
          autocomplete="new-password"
        />
      </div>
    </div>

    <div class="margin-top-small" v-if="editing_limited_to !== 'everybody'">
      <div class>
        <input
          class
          type="checkbox"
          id="visible_to_all"
          name="visible_to_all"
          v-model="local_viewing_limited_to"
          true-value="everybody"
          false-value=""
        />
        <label for="visible_to_all">
          <span>{{ $t("visible_to_all") }}</span>
        </label>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    editing_limited_to: String,
    viewing_limited_to: String,
    password: String,
    can_have_password: {
      type: Boolean,
      default: true,
    },
  },
  components: {},
  data() {
    return {
      local_editing_limited_to: this.editing_limited_to,
      local_viewing_limited_to: this.viewing_limited_to,
      editing_modes: [],
    };
  },
  created() {
    if (this.can_have_password)
      this.editing_modes = ["only_authors", "with_password", "everybody"];
    else this.editing_modes = ["only_authors", "everybody"];
  },
  mounted() {},
  beforeDestroy() {},
  watch: {
    local_editing_limited_to() {
      this.$emit("update:editing_limited_to", this.local_editing_limited_to);
    },
    local_viewing_limited_to() {
      this.$emit("update:viewing_limited_to", this.local_viewing_limited_to);
    },
  },
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped></style>
