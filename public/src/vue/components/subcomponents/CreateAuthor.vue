<template>
  <form
    @close="$emit('close')"
    v-on:submit.prevent="newAuthor"
    :read_only="read_only"
  >
    <!-- <span class="">{{ $t('create_an_author') }}</span> -->

    <!-- Human name -->
    <div class="margin-bottom-small">
      <label>{{ $t("name_or_pseudo") }}</label>
      <input type="text" v-model.trim="authordata.name" required autofocus />
    </div>

    <div class="margin-bottom-small">
      <label>{{ $t("email") }}</label>
      <input
        type="email"
        v-model.trim="authordata.email"
        :required="$root.state.local_options.require_email ? true : false"
      />
      <small v-if="mode !== 'simple_login'">
        {{ $t("email_instructions") }}
      </small>
    </div>

    <!-- Role -->
    <div class="margin-bottom-small" v-if="mode !== 'simple_login'">
      <label>{{ $t("role") }}</label>
      <div>
        <select v-model="authordata.role">
          <option
            v-for="role in possible_roles"
            :value="role"
            :key="role"
            :disabled="
              role === 'admin' &&
              (!current_author || current_author.role !== 'admin')
            "
            >{{ $t(role) }}</option
          >
        </select>
      </div>
    </div>

    <!-- Password -->
    <div class="margin-bottom-small">
      <label>{{ $t("password") }}</label>
      <div v-if="show_password">
        <input
          type="password"
          :required="
            $root.state.local_options.force_author_password ? true : false
          "
          v-model="authordata.password"
          autocomplete="new-password"
        />
      </div>
    </div>

    <!-- Preview -->
    <div class="margin-bottom-small" v-if="mode !== 'simple_login'">
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

    <!-- NFC tag(s) -->
    <div class="margin-bottom-small" v-if="mode !== 'simple_login'">
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

    <div class="flex-wrap flex-space-between margin-bottom-small">
      <button
        type="button"
        class="buttonLink"
        style="flex-grow: 0;"
        @click="$emit('close')"
      >
        {{ $t("cancel") }}
      </button>

      <button type="submit" class="bg-bleuvert">{{ $t("create") }}</button>
    </div>

    <div class="text-centered" v-if="mode !== 'simple_login'">
      <span class="switch switch-xs margin-top-small">
        <input
          id="login_after_creation"
          type="checkbox"
          v-model="login_after_creation"
        />
        <label for="login_after_creation">
          {{ $t("login_after_creation") }}
        </label>
      </span>
    </div>
  </form>
</template>
<script>
import ImageSelect from "../subcomponents/ImageSelect.vue";

export default {
  props: {
    read_only: Boolean,
    mode: String,
  },
  components: {
    ImageSelect,
  },
  data() {
    return {
      show_password: true,
      show_image: false,
      show_nfc: false,
      possible_roles: ["contributor", "participant", "admin"],
      authordata: {
        name: "",
        email: "",
        password: "",
        role: "contributor",
        nfc_tag: "",
      },
      preview: undefined,
      login_after_creation: true,
    };
  },
  computed: {},
  created() {},
  mounted() {
    if (Modernizr !== undefined && !Modernizr.touchevents) {
      const el = this.$el.querySelector("[autofocus]");
      el.focus();
    }
  },
  methods: {
    newAuthor: function (event) {
      console.log("newAuthor");

      let data = JSON.parse(JSON.stringify(this.authordata));

      let allAuthorsName = this.$root.all_authors.map((a) =>
        a.name.toLowerCase()
      );

      // check if project name (not slug) already exists
      if (allAuthorsName.includes(data.name.toLowerCase())) {
        // invalidate if it does
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.name_already_exists"));

        return false;
      }

      if (!!this.preview) {
        data.preview_rawdata = this.preview;
      }

      if (!!data.password) data.password = this.$auth.hashCode(data.password);

      this.$root.createFolder({ type: "authors", data }).then((adata) => {
        if (this.login_after_creation) {
          this.$nextTick(() => {
            this.$eventHub.$emit("authors.submitPassword", {
              slugFolderName: adata.slugFolderName,
              password: data.password,
            });
          });
        }
        this.$emit("close", "");
      });
    },
  },
};
</script>
<style></style>
