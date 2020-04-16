<template>
  <form
    class
    @close="$emit('close')"
    v-on:submit.prevent="editAuthor"
    :read_only="read_only"
  >
    <!-- <span class="">{{ $t('create_an_author') }}</span> -->

    <!-- Human name -->
    <div class="margin-bottom-small">
      <label>{{ $t("name") }}</label>
      <input type="text" v-model.trim="authordata.name" required autofocus />
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
      <small>{{ $t('password_instructions') }}</small>
    </div>-->

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
    <button type="submit" class="button-greenthin">{{ $t("save") }}</button>
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

      authordata: {
        name: this.author.name,
        // password: "",
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
      let allAuthorsName = this.$root.allAuthors.map((a) =>
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
