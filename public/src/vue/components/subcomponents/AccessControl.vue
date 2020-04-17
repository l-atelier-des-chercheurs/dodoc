<template>
  <div>
    <div class="">
      <label>
        {{ $t("who_can_edit") }}
      </label>

      <div class="">
        <div
          v-for="mode in ['only_authors', 'with_password', 'everybody']"
          :key="mode"
        >
          <input
            class="custom_radio"
            type="radio"
            :id="`editing_limited_to-${mode}`"
            :name="`editing_limited_to-${mode}`"
            :value="editing_limited_to"
            @input="$emit('update:editing_limited_to', $event.target.value)"
          />
          <label class="text-lc" :for="`editing_limited_to-${mode}`">
            <span>{{ $t(mode) }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Password -->
    <div class="margin-top-small" v-if="editing_limited_to === 'with_password'">
      <label>
        {{ $t("password") }}
      </label>
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
      <div class="">
        <input
          class=""
          type="checkbox"
          id="visible_to_all"
          name="visible_to_all"
          :value="viewing_limited_to"
          @input="$emit('update:viewing_limited_to', $event.target.value)"
          true-value="everybody"
          false-value=""
        />
        <label for="visible_to_all">
          <span>
            {{ $t("visible_to_all") }}
          </span>
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
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped></style>
