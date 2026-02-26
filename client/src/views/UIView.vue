<template>
  <div class="_uiView">
    <!-- Floating debug panel -->
    <div class="_floatingDebug">
      <div class="_floatingDebug--content">
        <div class="_floatingDebug--header">
          <button
            class="u-button u-button_bleuvert u-button_small"
            @click="toggleAllActive"
          >
            {{ all_active ? "Hide" : "Show" }} Active
          </button>
          <button class="u-button u-button_small" @click="cycleBackgroundColor">
            Background: {{ currentBackgroundLabel }}
          </button>
        </div>
      </div>
    </div>

    <h2>DLabel Demo</h2>

    <h3>Basic</h3>
    <div class="_labelsDemo">
      <DLabel str="Simple label text" />
    </div>

    <h3>With icon</h3>
    <div class="_labelsDemo">
      <DLabel str="Label with icon" icon="info-circle" />
      <DLabel str="Label with pencil icon" icon="pencil" />
    </div>

    <h3>With instructions</h3>
    <div class="_labelsDemo">
      <DLabel
        str="Label with instructions (click info to toggle)"
        instructions="<strong>Instructions:</strong> This helper text appears when you click the info icon."
      />
      <br />
      <DLabel
        str="Label with pencil icon"
        icon="pencil"
        instructions="Instructions"
      />
    </div>

    <h3>With icon and instructions</h3>
    <div class="_labelsDemo">
      <DLabel
        str="Full variant: icon + instructions"
        icon="info-circle"
        instructions="Helper text shown below when expanded."
      />
    </div>

    <h3>Tag variants</h3>
    <div class="_labelsDemo">
      <DLabel str="As &lt;label&gt; (default)" tag="label" />
      <DLabel str="As &lt;span&gt;" tag="span" />
    </div>

    <h3>With for_input</h3>
    <div class="_labelsDemo">
      <DLabel str="Label linked to input" for_input="dlabel-demo-input" />
      <input
        id="dlabel-demo-input"
        type="text"
        placeholder="Focus via label click"
        class="u-input"
      />
    </div>

    <h2>Buttons Demo</h2>

    <h3>Standard Buttons</h3>
    <div class="_buttonsDemo">
      <button
        class="u-button"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        Default Button
      </button>
      <button
        class="u-button u-button_floating"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        Floating
      </button>
      <button
        class="u-button u-button_wide"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        Wide
      </button>
      <button
        class="u-button u-button_inline"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        Inline <b-icon icon="arrow-right" />
      </button>
      <button
        class="u-button"
        disabled
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        Disabled
      </button>
      <button
        class="u-button"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        Toggleable Active
      </button>
    </div>

    <h3>Buttons with long text</h3>
    <div class="_buttonsDemo">
      <button
        class="u-button"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        Long text button with a long text that should wrap to the next line and
        not be cut off at the end of the button
      </button>
    </div>

    <h3>Colored Buttons</h3>
    <div class="_buttonsDemo">
      <button
        class="u-button u-button_black"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        Black
      </button>
      <button
        class="u-button u-button_white"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        White
      </button>
      <button
        class="u-button u-button_red"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        Red
      </button>
      <button
        class="u-button u-button_bleuvert"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        Bleuvert
      </button>
      <button
        class="u-button u-button_bleuvert_fonce"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        Bleuvert Foncé
      </button>
      <button
        class="u-button u-button_orange"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        Orange
      </button>
      <button
        class="u-button u-button_bleumarine"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        Bleumarine
      </button>
      <button
        class="u-button u-button_transparent"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        Transparent
      </button>
    </div>

    <h3>Buttons with Icons</h3>
    <div class="_buttonsDemo">
      <button
        class="u-button"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="plus" /> Add
      </button>
      <button
        class="u-button"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="trash" /> Delete
      </button>
      <button
        class="u-button"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="pencil" /> Edit
      </button>
      <button
        class="u-button"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="download" /> Download
      </button>
      <button
        class="u-button"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="upload" /> Upload
      </button>
      <button
        class="u-button u-button_red"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="trash" /> Delete
      </button>
      <button
        class="u-button u-button_bleuvert"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="check" /> Validate
      </button>
      <button
        class="u-button u-button_orange"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="exclamation-triangle" /> Warning
      </button>
      <button
        class="u-button u-button_red u-button_floating"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="trash" /> Delete (Floating)
      </button>
    </div>

    <h3>Icon-Only Buttons</h3>
    <div class="_buttonsDemo">
      <button
        class="u-button u-button_icon"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="plus" />
      </button>
      <button
        class="u-button u-button_icon"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="trash" />
      </button>
      <button
        class="u-button u-button_icon"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="pencil" />
      </button>
      <button
        class="u-button u-button_icon"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="star" />
      </button>
      <button
        class="u-button u-button_icon"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="x-lg" />
      </button>
      <button
        class="u-button u-button_icon"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="play-circle-fill" />
      </button>
      <button
        class="u-button u-button_icon"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="x-lg" />
      </button>
    </div>

    <h3>Small Buttons</h3>
    <div class="_buttonsDemo">
      <button
        class="u-button u-button_small"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        Small
      </button>
      <button
        class="u-button u-button_small u-button_red"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        Small Red
      </button>
      <button
        class="u-button u-button_small u-button_bleuvert"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        Small Bleuvert
      </button>
      <button
        class="u-button u-button_small u-button_orange"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        Small Orange
      </button>
      <button
        class="u-button u-button_small u-button_bleumarine"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        Small Bleumarine
      </button>
      <button
        class="u-button u-button_small u-button_black"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        Small Black
      </button>
      <button
        class="u-button u-button_small u-button_white"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        Small White
      </button>
      <button
        class="u-button u-button_small u-button_transparent"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        Small Transparent
      </button>
      <button
        class="u-button u-button_small"
        disabled
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        Small Disabled
      </button>
    </div>

    <h3>Small Buttons with Icons</h3>
    <div class="_buttonsDemo">
      <button
        class="u-button u-button_small"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="plus" /> Add
      </button>
      <button
        class="u-button u-button_small"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="trash" /> Delete
      </button>
      <button
        class="u-button u-button_small"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="pencil" /> Edit
      </button>
      <button
        class="u-button u-button_small u-button_red"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="trash" /> Delete
      </button>
      <button
        class="u-button u-button_small u-button_bleuvert"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="check" /> Validate
      </button>
      <button
        class="u-button u-button_small u-button_orange"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="download" /> Download
      </button>
    </div>

    <h3>Small Icon-Only Buttons</h3>
    <div class="_buttonsDemo">
      <button
        class="u-button u-button_icon u-button_small"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="plus" />
      </button>
      <button
        class="u-button u-button_icon u-button_small"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="trash" />
      </button>
      <button
        class="u-button u-button_icon u-button_small"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="pencil" />
      </button>
      <button
        class="u-button u-button_icon u-button_small"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="star" />
      </button>
      <button
        class="u-button u-button_icon u-button_small"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="play-circle-fill" />
      </button>
      <button
        class="u-button u-button_icon u-button_small"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="x-lg" />
      </button>
      <button
        class="u-button u-button_icon u-button_small"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="globe" />
      </button>
      <button
        class="u-button u-button_icon u-button_small"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="file-earmark-arrow-down" />
      </button>
    </div>

    <h3>Very Small Buttons</h3>
    <div class="_buttonsDemo">
      <button
        class="u-button u-button_verysmall"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        Very Small
      </button>
      <button
        class="u-button u-button_verysmall u-button_red"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        Very Small Red
      </button>
      <button
        class="u-button u-button_verysmall u-button_bleuvert"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        Very Small Bleuvert
      </button>
      <button
        class="u-button u-button_verysmall u-button_orange"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        Very Small Orange
      </button>
      <button
        class="u-button u-button_verysmall u-button_bleumarine"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        Very Small Bleumarine
      </button>
    </div>

    <h3>Very Small Buttons with Icons</h3>
    <div class="_buttonsDemo">
      <button
        class="u-button u-button_verysmall"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="plus" /> Add
      </button>
      <button
        class="u-button u-button_verysmall"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="trash" /> Delete
      </button>
      <button
        class="u-button u-button_verysmall u-button_red"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="x" /> Close
      </button>
      <button
        class="u-button u-button_verysmall u-button_bleuvert"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        <b-icon icon="check" /> OK
      </button>
    </div>

    <h2>Radio Switch</h2>

    <div class="u-spacingBottom">
      <RadioSwitch
        :content.sync="radioswitch_content"
        :options="[
          { label: 'Option 1', value: 'opt1' },
          { label: 'Option 2', value: 'opt2' },
          { label: 'Option 3', value: 'opt3' },
        ]"
      />
    </div>

    <h2>Button Link Demo</h2>

    <h3>Standard Button Links</h3>
    <div class="_buttonsDemo">
      <button
        class="u-buttonLink"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        Default Button Link
      </button>
      <button
        class="u-buttonLink"
        disabled
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        Disabled Button Link
      </button>
      <button
        class="u-buttonLink u-buttonLink_white"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        White Button Link
      </button>
      <button
        class="u-buttonLink u-buttonLink_red"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        Red Button Link
      </button>
      <button
        class="u-buttonLink has--whitebg"
        :class="{ 'is--active': all_active }"
        @click="toggleAllActive"
      >
        With White Background
      </button>
    </div>

    <h3>Active Button Links</h3>
    <div class="_buttonsDemo">
      <button class="u-buttonLink" :class="{ 'is--active': all_active }">
        Active Button Link
      </button>
      <button
        class="u-buttonLink u-buttonLink_white"
        :class="{ 'is--active': all_active }"
      >
        Active White Button Link
      </button>
      <button
        class="u-buttonLink u-buttonLink_red"
        :class="{ 'is--active': all_active }"
      >
        Active Red Button Link
      </button>
      <button
        class="u-buttonLink has--whitebg"
        :class="{ 'is--active': all_active }"
      >
        Active with White Background
      </button>
    </div>

    <h3>Button Links with Icons</h3>
    <div class="_buttonsDemo">
      <button class="u-buttonLink">
        <b-icon icon="plus" />
        Add Link
      </button>
      <button class="u-buttonLink">
        <b-icon icon="trash" />
        Delete Link
      </button>
      <button class="u-buttonLink">
        <b-icon icon="download" />
        Download Link
      </button>
      <button class="u-buttonLink" :class="{ 'is--active': all_active }">
        <b-icon icon="star" />
        Active Link with Icon
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

    <h2>Inputs Demo</h2>

    <h3>Text Inputs</h3>
    <div class="_inputsDemo">
      <div>
        <label>Default Input</label>
        <input type="text" placeholder="Enter text..." />
      </div>
      <div>
        <label>Input with Value</label>
        <input type="text" value="Sample text" />
      </div>
      <div>
        <label>Active Input</label>
        <input
          type="text"
          :class="{ 'is--active': all_active }"
          placeholder="Active state..."
        />
      </div>
      <div>
        <label>Disabled Input</label>
        <input type="text" value="Disabled" disabled />
      </div>
    </div>

    <h3>Small Inputs</h3>
    <div class="_inputsDemo">
      <div>
        <label>Small Input</label>
        <input type="text" size="small" placeholder="Small input..." />
      </div>
      <div>
        <label>Small Active Input</label>
        <input
          type="text"
          size="small"
          :class="{ 'is--active': all_active }"
          placeholder="Small active..."
        />
      </div>
    </div>

    <h3>Textarea</h3>
    <div class="_inputsDemo">
      <div>
        <label>Textarea</label>
        <textarea placeholder="Enter multiple lines..."></textarea>
      </div>
      <div>
        <label>Active Textarea</label>
        <textarea
          :class="{ 'is--active': all_active }"
          placeholder="Active textarea..."
        ></textarea>
      </div>
    </div>

    <hr />

    <h2>Select Demo</h2>

    <h3>Standard Select</h3>
    <div class="_inputsDemo">
      <div>
        <label>Default Select</label>
        <select>
          <option value="1">Premier</option>
          <option value="2">Deuxième</option>
          <option value="3">Troisième</option>
        </select>
      </div>
      <div>
        <label>Active Select</label>
        <select :class="{ 'is--active': all_active }">
          <option value="1">Premier</option>
          <option value="2">Deuxième</option>
          <option value="3">Troisième</option>
        </select>
      </div>
    </div>

    <h3>Small Select</h3>
    <div class="_inputsDemo">
      <div>
        <label>Small Select</label>
        <select size="small">
          <option value="1">Premier</option>
          <option value="2">Deuxième</option>
          <option value="3">Troisième</option>
        </select>
      </div>
      <div>
        <label>Small Active Select</label>
        <select size="small" :class="{ 'is--active': all_active }">
          <option value="1">Premier</option>
          <option value="2">Deuxième</option>
          <option value="3">Troisième</option>
        </select>
      </div>
    </div>

    <hr />

    <h2>Checkbox Demo</h2>

    <h3>Standard Checkboxes</h3>
    <div class="_inputsDemo">
      <div>
        <ToggleInput :label="$t('no_padding')" />
      </div>
    </div>

    <hr />

    <h2>Dropzone Demo</h2>

    <h3>Standard Dropzone</h3>
    <div class="_inputsDemo">
      <div class="u-dropzone">
        <p>Drop files here or click to upload</p>
      </div>
    </div>

    <h3>Active Dropzone</h3>
    <div class="_inputsDemo">
      <div class="u-dropzone" :class="{ 'is--active': all_active }">
        <p>Active dropzone (drag files here)</p>
      </div>
    </div>

    <hr />

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

    <TextInput
      :content="'test'"
      ref="textInput"
      :input_type="'editor'"
      :custom_formats="false"
      :placeholder="$t('write_a_message')"
      :minlength="0"
      :maxlength="300"
    >
    </TextInput>

    <div class="u-spacingBottom"></div>

    <fieldset>
      <legend>My Fieldset</legend>
      <div class="u-spacingBottom">
        <label>Input inside fieldset</label>
        <input type="text" />
      </div>
      <div>Some other content</div>
    </fieldset>

    <div class="u-spacingBottom"></div>

    <SizeDisplay :size="2059" />
    <SizeDisplay :size="2059000" />

    <TextEditor
      :label="$t('caption')"
      :content="''"
      :path="'/fakepath'"
      :custom_formats="['bold', 'italic', 'link']"
      :is_collaborative="false"
      :can_edit="true"
    />

    <hr />
    <TextEditor
      :label="$t('caption')"
      :content="`<p>Sed vestibulum tempor ex, at rutrum orci accumsan eu. Praesent lacus nibh, tempor cursus mollis sit amet, dapibus eu nisi. Aliquam at rhoncus massa. Sed mattis vehicula augue, vitae vestibulum nibh suscipit eget. Integer posuere vehicula justo quis tempor. Nulla lacinia nunc porttitor dolor aliquam, non aliquam felis iaculis. Aliquam consequat pellentesque leo at mollis.</p>`"
      :path="'/fakepath'"
      :custom_formats="['bold', 'italic', 'link']"
      :is_collaborative="false"
      :can_edit="true"
    />
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      radioswitch_content: "opt1",
      authors: [],
      show_modal: 0,
      modal_size: "small",
      modal_nopadding: false,
      modal_notitle: false,
      all_active: false,
      backgroundIndex: 0,
      backgrounds: ["white", "var(--c-gris)", "var(--c-noir)"],
      backgroundLabels: ["White", "Gris", "Noir"],
    };
  },
  created() {},
  async mounted() {
    this.authors = await this.$api.getFolders({
      path: "authors",
    });
    this.applyBackgroundColor();
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    authors_sublist() {
      return this.authors.slice(0, 5);
    },
    currentBackgroundLabel() {
      return this.backgroundLabels[this.backgroundIndex];
    },
  },
  methods: {
    dummy() {},
    toggleAllActive() {
      this.all_active = !this.all_active;
    },
    cycleBackgroundColor() {
      this.backgroundIndex =
        (this.backgroundIndex + 1) % this.backgrounds.length;
      this.applyBackgroundColor();
    },
    applyBackgroundColor() {
      const color = this.backgrounds[this.backgroundIndex];
      document.body.style.backgroundColor = color;
    },
  },
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

._labelsDemo {
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  gap: calc(var(--spacing) / 2);
  margin-bottom: calc(var(--spacing) / 2);
}

._inputsDemo {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 2);
  margin-bottom: calc(var(--spacing) / 2);

  > div {
    display: flex;
    flex-flow: column nowrap;
    gap: calc(var(--spacing) / 4);
  }
}

h2 {
  margin-top: calc(var(--spacing) * 2);
  margin-bottom: calc(var(--spacing) / 2);
}

h3 {
  margin-top: calc(var(--spacing) * 1);
  margin-bottom: calc(var(--spacing) / 4);
}

._floatingDebug {
  position: fixed;
  top: calc(var(--spacing) / 2);
  left: 0;
  z-index: 1000;
  width: 100%;
  pointer-events: none;

  ._floatingDebug--content {
    max-width: 300px;
    margin: 0 auto;
    background: white;
    border: 2px solid var(--c-gris);
    border-radius: var(--border-radius);
    padding: calc(var(--spacing) / 2);
    box-shadow: var(--panel-shadows);
    pointer-events: auto;
  }

  ._floatingDebug--header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: calc(var(--spacing) / 2);
    font-size: var(--sl-font-size-small);

    strong {
      font-weight: 600;
    }

    span {
      padding: calc(var(--spacing) / 8) calc(var(--spacing) / 4);
      border-radius: 4px;
      background-color: var(--c-gris_clair);
      color: var(--c-gris_fonce);
      font-weight: 600;

      &.is--active {
        background-color: var(--c-bleuvert);
        color: white;
      }
    }
  }
}
</style>
