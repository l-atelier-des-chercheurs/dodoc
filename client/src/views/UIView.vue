<template>
  <div class="_uiView">
    <!-- INSERT_YOUR_CODE -->

    <h2>Buttons Demo</h2>

    <h3>Standard Buttons</h3>
    <div class="_buttonsDemo">
      <button class="u-button">Default Button</button>
      <button class="u-button u-button_big">Big Button</button>
      <button class="u-button u-button_floating">Floating</button>
      <button class="u-button u-button_wide">Wide</button>
      <button class="u-button u-button_inline">
        Inline <b-icon icon="arrow-right" />
      </button>
      <button class="u-button" disabled>Disabled</button>
    </div>

    <h3>Colored Buttons</h3>
    <div class="_buttonsDemo">
      <button class="u-button u-button_black">Black</button>
      <button class="u-button u-button_white">White</button>
      <button class="u-button u-button_red">Red</button>
      <button class="u-button u-button_bleuvert">Bleuvert</button>
      <button class="u-button u-button_bleuvert_fonce">Bleuvert Foncé</button>
      <button class="u-button u-button_orange">Orange</button>
      <button class="u-button u-button_bleumarine">Bleumarine</button>
      <button class="u-button u-button_transparent">Transparent</button>
      <button
        class="u-button u-button_transparent"
        :class="{ 'is--active': true }"
      >
        Active Transparent
      </button>
    </div>

    <h3>Buttons with Icons</h3>
    <div class="_buttonsDemo">
      <button class="u-button"><b-icon icon="plus" /> Add</button>
      <button class="u-button"><b-icon icon="trash" /> Delete</button>
      <button class="u-button"><b-icon icon="pencil" /> Edit</button>
      <button class="u-button"><b-icon icon="download" /> Download</button>
      <button class="u-button"><b-icon icon="upload" /> Upload</button>
      <button class="u-button u-button_red">
        <b-icon icon="trash" /> Delete
      </button>
      <button class="u-button u-button_bleuvert">
        <b-icon icon="check" /> Validate
      </button>
      <button class="u-button u-button_orange">
        <b-icon icon="exclamation-triangle" /> Warning
      </button>
      <button class="u-button u-button_red u-button_floating">
        <b-icon icon="trash" /> Delete (Floating)
      </button>
    </div>

    <h3>Icon-Only Buttons</h3>
    <div class="_buttonsDemo">
      <button class="u-button u-button_icon">
        <b-icon icon="plus" />
      </button>
      <button class="u-button u-button_icon">
        <b-icon icon="trash" />
      </button>
      <button class="u-button u-button_icon">
        <b-icon icon="pencil" />
      </button>
      <button class="u-button u-button_icon">
        <b-icon icon="star" />
      </button>
      <button class="u-button u-button_icon">
        <b-icon icon="heart" />
      </button>
      <button class="u-button u-button_icon">
        <b-icon icon="settings" />
      </button>
      <button class="u-button u-button_icon" :class="{ 'is--active': true }">
        <b-icon icon="heart" />
      </button>
    </div>

    <h3>Small Buttons</h3>
    <div class="_buttonsDemo">
      <button class="u-button u-button_small">Small</button>
      <button class="u-button u-button_small u-button_red">Small Red</button>
      <button class="u-button u-button_small u-button_bleuvert">
        Small Bleuvert
      </button>
      <button class="u-button u-button_small u-button_orange">
        Small Orange
      </button>
      <button class="u-button u-button_small u-button_bleumarine">
        Small Bleumarine
      </button>
      <button class="u-button u-button_small u-button_black">
        Small Black
      </button>
      <button class="u-button u-button_small u-button_white">
        Small White
      </button>
      <button class="u-button u-button_small u-button_transparent">
        Small Transparent
      </button>
      <button class="u-button u-button_small" disabled>Small Disabled</button>
    </div>

    <h3>Small Buttons with Icons</h3>
    <div class="_buttonsDemo">
      <button class="u-button u-button_small">
        <b-icon icon="plus" /> Add
      </button>
      <button class="u-button u-button_small">
        <b-icon icon="trash" /> Delete
      </button>
      <button class="u-button u-button_small">
        <b-icon icon="pencil" /> Edit
      </button>
      <button class="u-button u-button_small u-button_red">
        <b-icon icon="trash" /> Delete
      </button>
      <button class="u-button u-button_small u-button_bleuvert">
        <b-icon icon="check" /> Validate
      </button>
      <button class="u-button u-button_small u-button_orange">
        <b-icon icon="download" /> Download
      </button>
    </div>

    <h3>Small Icon-Only Buttons</h3>
    <div class="_buttonsDemo">
      <button class="u-button u-button_icon u-button_small">
        <b-icon icon="plus" />
      </button>
      <button class="u-button u-button_icon u-button_small">
        <b-icon icon="trash" />
      </button>
      <button class="u-button u-button_icon u-button_small">
        <b-icon icon="pencil" />
      </button>
      <button class="u-button u-button_icon u-button_small">
        <b-icon icon="star" />
      </button>
      <button class="u-button u-button_icon u-button_small">
        <b-icon icon="heart" />
      </button>
      <button class="u-button u-button_icon u-button_small">
        <b-icon icon="settings" />
      </button>
      <button class="u-button u-button_icon u-button_small">
        <b-icon icon="eye" />
      </button>
      <button class="u-button u-button_icon u-button_small">
        <b-icon icon="download" />
      </button>
    </div>

    <h3>Very Small Buttons</h3>
    <div class="_buttonsDemo">
      <button class="u-button u-button_verysmall">Very Small</button>
      <button class="u-button u-button_verysmall u-button_red">
        Very Small Red
      </button>
      <button class="u-button u-button_verysmall u-button_bleuvert">
        Very Small Bleuvert
      </button>
      <button class="u-button u-button_verysmall u-button_orange">
        Very Small Orange
      </button>
      <button class="u-button u-button_verysmall u-button_bleumarine">
        Very Small Bleumarine
      </button>
    </div>

    <h3>Very Small Buttons with Icons</h3>
    <div class="_buttonsDemo">
      <button class="u-button u-button_verysmall">
        <b-icon icon="plus" /> Add
      </button>
      <button class="u-button u-button_verysmall">
        <b-icon icon="trash" /> Delete
      </button>
      <button class="u-button u-button_verysmall u-button_red">
        <b-icon icon="x" /> Close
      </button>
      <button class="u-button u-button_verysmall u-button_bleuvert">
        <b-icon icon="check" /> OK
      </button>
    </div>

    <hr />

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

    <div class="u-spacingBottom"></div>

    <TextInput
      :content="'test'"
      ref="textInput"
      :input_type="'editor'"
      :custom_formats="['bold', 'italic', 'link', 'emoji']"
      :placeholder="$t('write_a_message')"
      :minlength="0"
      :maxlength="300"
    >
      <template #suffix>
        <button type="button" class="u-button u-button_bleumarine _sendBtn">
          <b-icon icon="three-dots" animation="cylon" />
        </button>
      </template>
    </TextInput>

    <div class="u-spacingBottom"></div>

    <SizeDisplay :size="2059" />
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

._buttonsDemo {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: calc(var(--spacing) / 2);
  margin-bottom: calc(var(--spacing) / 2);
}

h2 {
  margin-top: calc(var(--spacing) * 2);
  margin-bottom: calc(var(--spacing) / 2);
}

h3 {
  margin-top: calc(var(--spacing) * 1);
  margin-bottom: calc(var(--spacing) / 4);
  font-size: var(--sl-font-size-medium);
  color: var(--c-gris_fonce);
}
</style>
