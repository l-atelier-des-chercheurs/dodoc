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
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      authors: [],
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
