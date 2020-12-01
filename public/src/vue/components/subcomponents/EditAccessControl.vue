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
      <PasswordField
        :required="true"
        :placeholder="'…'"
        :field_type="'new-password'"
        :value="password"
        @input="(value) => $emit('update:password', value)"
      />
    </div>

    <div
      class="margin-top-small"
      v-if="can_have_readonly && editing_limited_to !== 'everybody'"
    >
      <label>{{ $t("consultation") }}</label>
      <div v-if="editing_limited_to === 'nobody'">
        <input
          class="custom_radio"
          type="radio"
          id="visible_to_authors_only"
          name="visibility"
          v-model="local_viewing_limited_to"
          value="only_authors"
        />
        <label for="visible_to_authors_only">
          <span>{{ $t("visible_to_authors") }}</span>
        </label>
      </div>
      <div>
        <input
          :class="editing_limited_to !== 'nobody' ? '' : 'custom_radio'"
          :type="editing_limited_to !== 'nobody' ? 'checkbox' : 'radio'"
          id="visible_to_all"
          name="visibility"
          v-model="local_viewing_limited_to"
          value="everybody"
          true-value="everybody"
          false-value=""
        />
        <label for="visible_to_all">
          <span>{{ $t("visible_to_all") }}</span>
        </label>
      </div>
      <div v-if="editing_limited_to === 'nobody'">
        <input
          class="custom_radio"
          type="radio"
          id="visible_to_nobody"
          name="visibility"
          v-model="local_viewing_limited_to"
          value=""
        />
        <label for="visible_to_nobody">
          <span>{{ $t("visible_to_nobody") }}</span>
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
    can_have_readonly: {
      type: Boolean,
      default: true,
    },
    authors: Array,
    name: String,
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
      this.editing_modes = [
        "only_authors",
        "with_password",
        "everybody",
        "nobody",
      ];
    else this.editing_modes = ["only_authors", "everybody", "nobody"];

    // if (!this.can_have_readonly) this.local_viewing_limited_to = "";
  },
  mounted() {},
  beforeDestroy() {},
  watch: {
    authors: {
      handler: function (new_authors, old_authors) {
        // prevent 0 authors if folder protected by authors
        if (
          this.editing_limited_to === "only_authors" &&
          new_authors.length === 0
        ) {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(this.$t("notifications.if_only_authors_select_authors"));
          this.$emit("update:authors", old_authors);
          return;
        }

        // show alert if removing oneself from authors of a protected folder
        if (
          this.editing_limited_to === "only_authors" &&
          this.$root.current_author &&
          new_authors.some(
            (a) => a.slugFolderName === this.$root.current_author.slugFolderName
          ) === false &&
          old_authors.some(
            (a) => a.slugFolderName === this.$root.current_author.slugFolderName
          ) === true &&
          this.$root.current_author.role !== "admin"
        ) {
          this.$alertify
            .okBtn(this.$t("yes"))
            .cancelBtn(this.$t("cancel"))
            .confirm(
              this.$t("sureToRemoveYourselfFromAuthors"),
              () => {},
              () => {
                this.$emit("update:authors", old_authors);
              }
            );
        }
      },
      deep: true,
    },
    local_editing_limited_to() {
      this.$emit("update:editing_limited_to", this.local_editing_limited_to);
      this.sanitizeViewingDependingOnEditing();
    },
    local_viewing_limited_to() {
      this.$emit("update:viewing_limited_to", this.local_viewing_limited_to);
    },
  },
  computed: {},
  methods: {
    sanitizeViewingDependingOnEditing() {
      // for chat : viewing sticks to editing
      if (!this.can_have_readonly)
        if (this.local_editing_limited_to === "everybody")
          this.local_viewing_limited_to = "everybody";
        else this.local_viewing_limited_to = "";

      if (this.local_editing_limited_to === "nobody")
        this.local_viewing_limited_to = "only_authors";
      else if (this.local_editing_limited_to === "everybody")
        this.local_viewing_limited_to = "everybody";
      else this.local_viewing_limited_to = "";
    },
  },
};
</script>
<style lang="scss" scoped></style>
