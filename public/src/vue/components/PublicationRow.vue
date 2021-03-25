<template>
  <tbody>
    <tr>
      <!-- @click.exact="openPublication" -->
      <td width="30%">
        {{ publication.name }}
        <ProtectedLock
          :editing_limited_to="publication.editing_limited_to"
          :is_protected="!can_edit_publi"
        />
      </td>
      <td width="20%">
        <div class="_template">
          <div class="icon" v-html="$t(publi_template.icon)" />
          <div class="label" v-html="$t(publi_template.key)" />
        </div>
      </td>
      <td width="20%">
        <div v-if="publication.authors" class="m_authorField">
          <span
            v-for="author in publication.authors"
            v-if="$root.getAuthor(author.slugFolderName)"
            :key="author.slugFolderName"
            class="is--active"
            :class="{
              'is--loggedInAuthor':
                $root.current_author &&
                $root.current_author.slugFolderName === author.slugFolderName,
            }"
          >
            <template v-if="$root.getAuthor(author.slugFolderName)">{{
              $root.getAuthor(author.slugFolderName).name
            }}</template>
            <template v-else>{{ author.slugFolderName }}</template>
          </span>
          <ClientsCheckingOut
            :type="'publications'"
            :slugFolderName="slugPubliName"
          />
        </div>
      </td>
      <td>
        <AccessController
          :folder="publication"
          :context="'short'"
          :type="'publications'"
          @openFolder.stop="openPublication"
        />
        <button
          v-if="can_see_publi"
          type="button"
          class="_moreInfosButton buttonLink margin-none"
          :class="{
            'is--active': show_more_informations,
          }"
          @click.stop.exact="show_more_informations = !show_more_informations"
        >
          <span class>{{ $t("more_informations") }}</span>
        </button>

        <button
          v-if="can_see_publi"
          type="button"
          class="_openButton button-redthin margin-none"
          @click.stop.exact="openPublication"
        >
          <span class>{{ $t("open") }}</span>
        </button>
      </td>
    </tr>
    <tr class="_mealModel" v-if="publication.is_model">
      <td colspan="6">
        <template v-if="publication.is_model">
          <div>
            <small>
              {{ $t("model") }}
            </small>
            <button
              type="button"
              v-if="publication.hasOwnProperty('_replies')"
              class="buttonLink margin-none"
              :class="{
                'is--active': show_replies,
              }"
              @click="toggleReplies"
            >
              <span
                v-html="
                  $t('replies:') +
                  ' ' +
                  (!publication.hasOwnProperty('_replies')
                    ? 0
                    : publication._replies.length)
                "
              />
            </button>
          </div>
        </template>
        <small
          v-else-if="!!publication.follows_model"
          v-html="
            $t('publi_follows_model:') + ' ' + model_for_this_publication.name
          "
        >
          <!-- {{ $t("follows_model") }} -->
        </small>
        <!-- </div> -->
      </td>
    </tr>
    <tr class="_mealMoreInfos" v-if="show_more_informations">
      <td colspan="6">
        <!-- <button
            v-if="can_see_publi"
            type="button"
            class="_moreInfosButton buttonLink"
            @click.stop.exact="show_more_informations = !show_more_informations"
          >
            <span class>{{ $t("more_informations") }}</span>
          </button> -->

        <DateField :title="'created'" :date="publication.date_created" />

        <DateField :title="'edited'" :date="publication.date_modified" />

        <div class="m_metaField">
          <div>
            {{ $t("number_of_medias") }}
          </div>
          <div>
            <template v-if="publication.number_of_medias">{{
              publication.number_of_medias
            }}</template>
            <template v-else>—</template>
          </div>
        </div>

        <div class="m_metaField">
          <div>
            {{ $t("attached_to_project") }}
          </div>
          <div>
            <template v-if="attached_project">{{
              attached_project.name
            }}</template>
            <template v-else>—</template>
          </div>
        </div>
      </td>
    </tr>
    <!-- <tr v-if="publication.is_model" class="_mealReplies"></tr> -->
  </tbody>
</template>
<script>
import AccessController from "./subcomponents/AccessController.vue";
import ClientsCheckingOut from "./subcomponents/ClientsCheckingOut.vue";

export default {
  props: {
    publication: Object,
    recipe_types: Array,
  },
  components: { AccessController, ClientsCheckingOut },
  data() {
    return {
      show_input_pwd: false,
      show_more_informations: false,
      show_replies: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    show_input_pwd() {
      if (this.show_input_pwd) {
        this.$nextTick(() => {
          if (!!this.$refs.passwordField) this.$refs.passwordField.focus();
        });
      }
    },
  },
  computed: {
    attached_project() {
      return Object.values(this.$root.store.projects).find(
        (_p) => _p.slugFolderName === this.publication.attached_to_project
      );
    },
    slugPubliName() {
      return this.publication.slugFolderName;
    },
    can_edit_publi() {
      return this.$root.canEditFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
      });
    },
    can_see_publi() {
      return this.$root.canSeeFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
      });
    },
    publi_template() {
      let template = undefined;
      this.recipe_types.map((rt) => {
        rt.recipes.map((r) => {
          if (r.key === this.publication.template) template = r;
        });
      });
      return template;
    },
    model_for_this_publication() {
      if (!this.publication.follows_model) return false;
      return Object.values(this.$root.store.publications).find(
        (p) =>
          this.publication.template === p.template &&
          p.is_model === true &&
          p.slugFolderName === this.publication.follows_model
      );
    },
  },
  methods: {
    toggleReplies() {
      this.show_replies = !this.show_replies;
      this.$emit("toggleReplies", this.show_replies);
    },
    openPublication() {
      if (this.$root.state.dev_mode === "debug")
        console.log(
          `METHODS • Publication: openPublication / slugPubliName = ${this.slugPubliName}`
        );

      if (this.can_see_publi) this.$root.openPublication(this.slugPubliName);
    },
    publi_password() {
      if (this.password !== "has_pass") return "";

      return this.$root.getFolderPassword({
        type: "publications",
        slugFolderName: this.slugPubliName,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.font-folder_title {
  font-size: 70%;
}

._openButton {
  margin: calc(var(--spacing) / 8);
}
._template {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  .label {
    color: var(--c-bleuvert);
    padding: calc(var(--spacing) / 8);
  }
}
</style>

<style lang="scss">
._template .icon {
  border-radius: 2px;
  background-color: var(--c-bleuvert);
  // padding: calc(var(--spacing) / 8);

  svg {
    display: block;
    width: 2em;
    height: 2em;
  }
}
</style>
