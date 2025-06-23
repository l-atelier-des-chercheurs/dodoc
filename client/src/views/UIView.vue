<template>
  <div class="_uiView">
    <div class="_authors">
      <AuthorTag
        v-for="{ $path } in authors_sublist"
        :key="$path"
        :path="$path"
      />
    </div>
    <hr />
    <div class="_darkBG _authors">
      <AuthorTag
        v-for="{ $path } in authors_sublist"
        :key="$path"
        :path="$path"
      />
    </div>
    <hr />
    <div class="_authors">
      <AuthorTag
        v-for="{ $path } in authors_sublist"
        :key="$path"
        :path="$path"
        @click="dummy"
      />
    </div>
    <hr />
    <div class="_authors">
      <AuthorTag
        v-for="{ $path } in authors_sublist"
        :key="$path"
        :path="$path"
        :mode="'select'"
        @click="dummy"
      />
    </div>
    <hr />
    <div class="_authors">
      <AuthorTag
        v-for="{ $path } in authors_sublist"
        :key="$path"
        :path="$path"
        :mode="'add'"
        @click="dummy"
      />
    </div>
    <hr />
    <div class="_authors">
      <AuthorTag
        v-for="{ $path } in authors_sublist"
        :key="$path"
        :path="$path"
        :mode="'remove'"
        @click="dummy"
      />
    </div>
    <hr />
    <div class="_authors">
      <AuthorTag
        v-for="{ $path } in authors_sublist"
        :key="$path"
        :path="$path"
        :mode="'link'"
      />
    </div>
    <hr />
    <div class="_authors">
      <AuthorTag
        v-for="{ $path } in authors_sublist"
        :key="$path"
        :path="$path"
        :show_image_only="true"
        :mode="'link'"
      />
    </div>
    <hr />
    <div class="_darkBG">
      <div>u-listOfAvatars</div>
      <div class="u-listOfAvatars" key="list">
        <AuthorTag
          v-for="{ $path } in authors_sublist"
          :key="$path"
          :path="$path"
          :show_image_only="true"
          :mode="'link'"
        />
      </div>
    </div>

    <hr />

    <select class="u-spacingBottom">
      <option value="1">Premier</option>
      <option value="2">Deuxième</option>
      <option value="3">Troisième</option>
    </select>

    <hr />

    <select class="u-spacingBottom" size="small">
      <option value="1">Premier</option>
      <option value="2">Deuxième</option>
      <option value="3">Troisième</option>
    </select>

    <div class="u-spacingBottom"></div>

    <TitleField
      :field_name="'title'"
      :label="$t('title')"
      :content="'Un super titre'"
      :path="'/'"
      :maxlength="40"
      :tag="'h1'"
      :can_edit="true"
    />
    <div class="u-spacingBottom"></div>

    <TitleField
      :field_name="'title'"
      :label="$t('title')"
      :content="'Un super titre sur deux deux deux lignes '"
      :path="'/'"
      :maxlength="40"
      :tag="'h1'"
      :can_edit="true"
    />

    <div class="u-spacingBottom"></div>

    <AdminsAndContributorsField
      :folder="{ $admins: 'everyone' }"
      :can_edit="true"
      :admin_label="$t('referent')"
      :admin_instructions="$t('project_admin_instructions')"
      :contrib_instructions="$t('project_contrib_instructions')"
    />

    <div class="u-spacingBottom"></div>

    <AdminsAndContributorsField
      :folder="{ $admins: 'noone' }"
      :can_edit="true"
      :admin_label="$t('referent')"
      :admin_instructions="$t('project_admin_instructions')"
      :contrib_instructions="$t('project_contrib_instructions')"
    />

    <div class="u-spacingBottom"></div>

    <div class="u-warning u-spacingBottom">Test warning</div>
    <div class="u-warning">
      Test warning on multiple lines Test warning on multiple lines Test warning
      on multiple lines Test warning on multiple lines Test warning on multiple
      lines Test warning on multiple lines Test warning on multiple lines Test
      warning on multiple lines Test warning on multiple lines Test warning on
      multiple lines Test warning on multiple lines Test warning on multiple
      lines
    </div>

    <div class="u-spacingBottom"></div>

    <button class="u-button" @click="show_modal = 1">Show modal small</button>
    <BaseModal2
      v-if="show_modal === 1"
      :size="modal_size"
      :title="modal_notitle ? '' : $t('title')"
      :nopadding="modal_nopadding"
      @close="show_modal = 0"
    >
      <div>
        <label
          v-for="size in ['small', 'large', 'x-large', 'full']"
          :key="size"
        >
          <input type="radio" v-model="modal_size" :value="size" />
          {{ size }}
        </label>
        <div class="u-spacingBottom"></div>
        <ToggleInput
          :label="$t('no_padding')"
          :content.sync="modal_nopadding"
        />
        <div class="u-spacingBottom"></div>
        <ToggleInput :label="$t('no_title')" :content.sync="modal_notitle" />
        <div class="u-spacingBottom"></div>
        <p>
          Pellentesque vitae maximus enim. Suspendisse consequat nisl dui, eu
          efficitur erat pulvinar id. Sed nec arcu nec est sagittis finibus non
          eget mauris. Donec ornare lectus quis bibendum gravida. Vestibulum
          quis laoreet purus. Ut semper, justo ut malesuada aliquam, velit arcu
          consequat erat, eu lacinia orci orci eu sem. Sed sodales tristique
          nunc, in lobortis sapien pulvinar non. Nam luctus euismod justo quis
          semper. Fusce sit amet tortor ut odio dignissim ultrices vel nec
          ligula. Nunc odio nulla, rutrum a tristique non, porttitor vel massa.
          Integer eget pulvinar orci.
        </p>
        <figure>
          <img
            src="https://latelier-des-chercheurs.fr/content/apercu.png"
            alt="test"
          />
          <figcaption>
            <p>
              Pellentesque vitae maximus enim. Suspendisse consequat nisl dui,
              eu efficitur erat pulvinar id. Sed nec arcu nec est sagittis
              finibus non eget mauris. Donec ornare lectus quis bibendum
              gravida. Vestibulum quis laoreet purus. Ut semper, justo ut
              malesuada aliquam, velit arcu consequat erat, eu lacinia orci orci
              eu sem. Sed sodales tristique nunc, in lobortis sapien pulvinar
              non. Nam luctus euismod justo quis semper. Fusce sit amet tortor
              ut odio dignissim ultrices vel nec ligula. Nunc odio nulla, rutrum
              a tristique non, porttitor vel massa. Integer eget pulvinar orci.
            </p>
          </figcaption>
        </figure>
      </div>
    </BaseModal2>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      authors: [],
      show_modal: 0,
      modal_size: "small",
      modal_nopadding: false,
      modal_notitle: false,
    };
  },
  created() {},
  async mounted() {
    this.authors = await this.$api.getFolders({
      path: "authors",
    });
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    authors_sublist() {
      return this.authors.slice(0, 5);
    },
  },
  methods: { dummy() {} },
};
</script>
<style lang="scss" scoped>
._uiView {
  max-width: 600px;
  margin: calc(var(--spacing) / 1) auto;
  padding-bottom: 30vh;
  width: 100%;
}

._authors {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: calc(var(--spacing) / 4);
}

._darkBG {
  background: var(--c-noir);
  color: white;
  padding: calc(var(--spacing) / 2);
}
</style>
