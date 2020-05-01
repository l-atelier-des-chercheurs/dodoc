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

    <div class="margin-top-small" v-if="can_have_readonly && editing_limited_to !== 'everybody'">
      <div class>
        <input
          class
          type="checkbox"
          id="visible_to_all"
          name="visible_to_all"
          v-model="local_viewing_limited_to"
          true-value="everybody"
          false-value
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
      default: true
    },
    can_have_readonly: {
      type: Boolean,
      default: true
    },
    authors: Array,
    name: String
  },
  components: {},
  data() {
    return {
      local_editing_limited_to: this.editing_limited_to,
      local_viewing_limited_to: this.viewing_limited_to,
      editing_modes: []
    };
  },
  created() {
    if (this.can_have_password)
      this.editing_modes = ["only_authors", "with_password", "everybody"];
    else this.editing_modes = ["only_authors", "everybody"];

    // if (!this.can_have_readonly) this.local_viewing_limited_to = "";
  },
  mounted() {},
  beforeDestroy() {},
  watch: {
    authors: {
      handler: function(new_authors, old_authors) {
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
            a => a.slugFolderName === this.$root.current_author.slugFolderName
          ) === false &&
          old_authors.some(
            a => a.slugFolderName === this.$root.current_author.slugFolderName
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
      deep: true
    },
    local_editing_limited_to() {
      this.$emit("update:editing_limited_to", this.local_editing_limited_to);
      this.sanitizeViewingDependingOnEditing();
    },
    local_viewing_limited_to() {
      this.$emit("update:viewing_limited_to", this.local_viewing_limited_to);
    }
  },
  computed: {},
  methods: {
    sanitizeViewingDependingOnEditing() {
      if (!this.can_have_readonly)
        if (this.local_editing_limited_to === "everybody")
          this.local_viewing_limited_to = "everybody";
        else this.local_viewing_limited_to = "";
    }
  }
};
</script>
<style lang="scss" scoped></style>
