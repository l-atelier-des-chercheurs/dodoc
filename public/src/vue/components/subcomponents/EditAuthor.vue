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
      v-if="$root.current_author && $root.current_author.role === 'admin'"
    >
      <label>{{ $t("role") }}</label>
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

    <!-- Keywords -->
    <div class="margin-bottom-small">
      <label>
        <button
          type="button"
          class="button-nostyle text-uc button-triangle"
          :class="{ 'is--active': show_keywords }"
          @click="show_keywords = !show_keywords"
        >
          {{ $t("keywords") }}
        </button>
      </label>
      <template v-if="show_keywords">
        <TagsInput
          :keywords="authordata.keywords"
          @tagsChanged="(newTags) => (authordata.keywords = newTags)"
        />
      </template>
    </div>

    <div class="margin-bottom-small">
      <label>
        <button
          type="button"
          class="button-nostyle text-uc button-triangle"
          :class="{ 'is--active': show_password }"
          @click.stop="show_password = !show_password"
        >
          <template v-if="author.password === 'has_pass'">{{
            $t("change_password")
          }}</template>
          <template v-else>{{ $t("add_password") }}</template>
        </button>
      </label>

      <div v-if="show_password">
        <div
          class="margin-bottom-verysmall"
          v-if="!$root.current_author_is_admin"
        >
          <PasswordField
            v-if="author.password === 'has_pass'"
            v-model="authordata._old_password"
            :placeholder="$t('old_password').toLowerCase()"
          />
        </div>
        <div>
          <PasswordField
            v-if="show_password"
            v-model="authordata.password"
            :required="
              $root.state.local_options.force_author_password ? true : false
            "
            :field_type="'new-password'"
            :placeholder="$t('new_password').toLowerCase()"
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
    <transition name="scaleIn" :duration="400">
      <Loader v-if="is_sending_content_to_server" />
    </transition>
  </form>
</template>
<script>
import TagsInput from "../subcomponents/TagsInput.vue";

export default {
  props: {
    read_only: Boolean,
    author: Object,
  },
  components: {
    TagsInput,
  },
  data() {
    return {
      show_image: !!this.author.preview,
      show_keywords: !!this.author.keywords,
      show_nfc: !!this.author.nfc_tag,

      show_password: false,

      possible_roles: ["contributor", "participant", "admin"],

      authordata: {
        name: this.author.name,
        email: this.author.email,
        role: this.author.role,
        keywords: this.author.keywords,
        password: "",
        _old_password: "",
        nfc_tag: this.author.nfc_tag,
      },
      preview: undefined,

      is_sending_content_to_server: false,
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
      } else delete this.authordata.password;

      if (!!this.authordata._old_password) {
        this.authordata._old_password = this.$auth.hashCode(
          this.authordata._old_password
        );
      }

      this.is_sending_content_to_server = true;

      this.$root
        .editFolder({
          type: "authors",
          slugFolderName: this.author.slugFolderName,
          data: this.authordata,
        })
        .then((cdata) => {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .success(this.$t("notifications.successfully_saved"));
          this.is_sending_content_to_server = false;
          this.$emit("close", "");
        });
    },
  },
};
</script>
<style></style>
