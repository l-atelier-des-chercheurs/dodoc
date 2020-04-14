<template>
  <form
    @close="$emit('close')"
    v-on:submit.prevent="newAuthor"
    :read_only="read_only"
  >
    <!-- <span class="">{{ $t('create_an_author') }}</span> -->

    <!-- Human name -->
    <div class="margin-bottom-small">
      <label>{{ $t("name") }}</label>
      <input type="text" v-model.trim="authordata.name" required autofocus />
    </div>

    <!-- Password -->
    <div class="margin-bottom-small">
      <label>{{ $t("password") }}</label>
      <template v-if="show_password">
        <input
          type="password"
          :required="
            $root.state.local_options.force_author_password ? true : false
          "
          v-model="authordata.password"
          autocomplete="new-password"
        />
        <small>{{ $t("password_instructions") }}</small>
      </template>
    </div>

    <!-- Preview -->
    <div class="margin-bottom-small">
      <label>
        <button
          type="button"
          class="button-nostyle text-uc button-triangle"
          :class="{ 'is--active': show_image }"
          @click="show_image = !show_image"
        >
          {{ $t("portrait") }}
        </button>
      </label>
      <template v-if="show_image">
        <ImageSelect
          @newPreview="
            (value) => {
              preview = value;
            }
          "
          :instructions="$t('select_portrait_image')"
          :load_from_projects_medias="true"
        />
      </template>
    </div>

    <!-- Role -->
    <div class="margin-bottom-small">
      <label>
        <button
          type="button"
          class="button-nostyle text-uc button-triangle"
          :class="{ 'is--active': show_role }"
          @click="show_role = !show_role"
        >
          {{ $t("role") }}
        </button>
      </label>
      <template v-if="show_role">
        <select v-model="authordata.role">
          <option v-for="role in possible_roles" :value="role" :key="role">{{
            $t(role)
          }}</option>
        </select>
      </template>
    </div>

    <!-- NFC tag(s) -->
    <div class="margin-bottom-small">
      <label>
        <button
          type="button"
          class="button-nostyle text-uc button-triangle"
          :class="{ 'is--active': show_nfc }"
          @click="show_nfc = !show_nfc"
        >
          {{ $t("nfc_tag") }}
        </button>
      </label>
      <template v-if="show_nfc">
        <input type="text" v-model="authordata.nfc_tag" />
      </template>
    </div>

    <button type="button" class="button-small" @click="$emit('close')">
      {{ $t("cancel") }}
    </button>
    <button type="submit" class="button-greenthin">{{ $t("create") }}</button>
  </form>
</template>
<script>
import ImageSelect from "../subcomponents/ImageSelect.vue";

export default {
  props: {
    read_only: Boolean,
  },
  components: {
    ImageSelect,
  },
  data() {
    return {
      show_password: true,
      show_image: false,
      show_role: true,
      show_nfc: false,
      possible_roles: ["contributor"],

      authordata: {
        name: "",
        password: "",
        role: "contributor",
        nfc_tag: "",
      },
      preview: undefined,
    };
  },
  computed: {},
  mounted() {
    if (Modernizr !== undefined && !Modernizr.touchevents) {
      const el = this.$el.querySelector("[autofocus]");
      el.focus();
    }
  },
  methods: {
    newAuthor: function (event) {
      console.log("newAuthor");
      let allAuthorsName = this.$root.allAuthors.map((a) =>
        a.name.toLowerCase()
      );

      // check if project name (not slug) already exists
      if (allAuthorsName.includes(this.authordata.name.toLowerCase())) {
        // invalidate if it does
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.name_already_exists"));

        return false;
      }

      if (!!this.preview) {
        this.authordata.preview_rawdata = this.preview;
      }

      if (!!this.authordata.password)
        this.authordata.password = this.$auth.hashCode(
          this.authordata.password
        );

      this.$root.createFolder({ type: "authors", data: this.authordata });

      this.$emit("close", "");
    },
  },
};
</script>
<style></style>
