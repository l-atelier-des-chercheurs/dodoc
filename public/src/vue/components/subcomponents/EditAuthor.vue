<template>
  <form
    class
    @close="$emit('close')"
    v-on:submit.prevent="editAuthor"
    :read_only="read_only"
  >
    <!-- Human name -->
    <div class="margin-bottom-small">
      <label>{{ $t("name") }}</label>
      <input type="text" v-model.trim="authordata.name" required autofocus />
    </div>

    <div class="margin-bottom-small">
      <label>{{ $t("email") }}</label>
      <input type="email" v-model.trim="authordata.email" />
      <small>{{ $t("email_instructions") }}</small>
    </div>

    <!-- Role -->
    <div
      class="margin-bottom-small"
      v-if="($root.current_author && $root.current_author.role === 'admin')
"
    >
      <label>
        {{ $t("role") }}
      </label>
      <div>
        <select v-model="authordata.role">
          <option
            v-for="role in possible_roles"
            :value="role"
            :key="role"
            :disabled="
              role === 'admin' &&
              (!$root.current_author || $root.current_author.role !== 'admin')
            "
          >
            {{ $t(role) }}
          </option>
        </select>
      </div>
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
          :previewURL="previewURL"
          :instructions="$t('select_portrait_image')"
          :load_from_projects_medias="true"
          @newPreview="
            (value) => {
              preview = value;
            }
          "
        />
      </template>
    </div>

    <!-- Password -->
    <!-- <div class="margin-bottom-small">
      <label>{{ $t('password') }}</label>
      <input type="password" v-model="authordata.password">
    </div>-->
    <!-- Password -->
    <div class="margin-bottom-small">
      <label>
        <button
          type="button"
          class="button-nostyle text-uc button-triangle"
          :class="{ 'is--active': show_password }"
          @click.stop="show_password = !show_password"
        >
          <template v-if="author.password === 'has_pass'">
            {{ $t("change_password") }}
          </template>
          <template v-else>
            {{ $t("add_password") }}
          </template>
        </button>
      </label>

      <div v-if="show_password">
        <div class="margin-bottom-verysmall">
          <input
            type="password"
            v-if="author.password === 'has_pass'"
            :placeholder="$t('old_password').toLowerCase()"
            v-model="authordata._old_password"
          />
        </div>
        <div>
          <input
            type="password"
            :required="
              $root.state.local_options.force_author_password ? true : false
            "
            :placeholder="$t('new_password').toLowerCase()"
            v-model="authordata.password"
          />
        </div>
        <small>{{ $t("password_instructions") }}</small>
      </div>
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
    <button type="submit" class="bg-bleuvert">{{ $t("save") }}</button>
  </form>
</template>
<script>
import ImageSelect from "../subcomponents/ImageSelect.vue";

export default {
  props: {
    read_only: Boolean,
    author: Object,
  },
  components: {
    ImageSelect,
  },
  data() {
    return {
      show_image: !!this.author.preview,
      show_nfc: !!this.author.nfc_tag,
      show_password: false,

      possible_roles: ["contributor", "participant", "admin"],

      authordata: {
        name: this.author.name,
        email: this.author.email,
        role: this.author.role,
        password: "",
        _old_password: "",
        nfc_tag: this.author.nfc_tag,
      },
      preview: undefined,
    };
  },
  computed: {
    previewURL() {
      if (
        !this.author.hasOwnProperty("preview") ||
        this.author.preview === ""
      ) {
        return "";
      }
      const thumb = this.author.preview.filter((p) => p.size === 640);
      if (thumb.length > 0) {
        return `${thumb[0].path}`;
      }
      return "";
    },
  },
  mounted() {
    if (Modernizr !== undefined && !Modernizr.touchevents) {
      const el = this.$el.querySelector("[autofocus]");
      el.focus();
    }
  },
  methods: {
    editAuthor: function (event) {
      console.log("editAuthor");
      let allAuthorsName = this.$root.all_authors.map((a) =>
        a.name.toLowerCase()
      );

      // check if author name (not slug) already exists
      if (this.author.name !== this.authordata.name) {
        if (allAuthorsName.includes(this.authordata.name.toLowerCase())) {
          // invalidate if it does
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(this.$t("notifications.name_already_exists"));

          return false;
        }
      }

      if (typeof this.preview !== "undefined") {
        this.authordata.preview_rawdata = this.preview;
      }

      if (!!this.authordata.password) {
        this.authordata.password = this.$auth.hashCode(
          this.authordata.password
        );
      }
      if (!!this.authordata._old_password) {
        this.authordata._old_password = this.$auth.hashCode(
          this.authordata._old_password
        );
      }

      this.$root.editFolder({
        type: "authors",
        slugFolderName: this.author.slugFolderName,
        data: this.authordata,
      });

      this.$emit("close", "");
    },
  },
};
</script>
<style></style>
