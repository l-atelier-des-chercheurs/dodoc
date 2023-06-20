<template>
  <div v-if="shared_folder" class="_sharedFolder" @scroll="updatedScroll">
    <div class="_topbar">
      <div class="_topbar--content">
        <div class="_title">
          <transition name="showBTTBtn">
            <button
              type="button"
              @click="scrollTop"
              v-if="current_scroll > 100"
            >
              <sl-icon name="arrow-up-circle-fill" />
            </button>
          </transition>
          ESPACE PARTAGÉ / ARCHIVE
        </div>
        <div class="_myContent">
          <input
            type="checkbox"
            id="show_only_my_content"
            v-model="show_only_my_content"
          />
          <label
            for="show_only_my_content"
            v-text="$t('show_only_my_content')"
          />
        </div>
        <div class="_groupBy">
          <div v-for="group_option in group_options" :key="group_option.key">
            <input
              type="radio"
              :id="group_option.key"
              :value="group_option.key"
              v-model="group_mode"
            />
            <label
              :for="group_option.key"
              v-text="group_option.label"
              :class="{
                'is--selected': group_option.key === group_mode,
              }"
            />
          </div>
        </div>
        <div class="_sortSelect">
          <select v-model="sort_order">
            <option value="date_uploaded" v-text="$t('date_uploaded')" />
            <option value="date_created" v-text="$t('date_created')" />
          </select>
        </div>
      </div>
    </div>

    <transition name="scaleInFade" mode="out-in">
      <ItemModal v-if="opened_files" :file="opened_files" @close="closeFile" />
    </transition>

    <!-- <transition-group tag="div" name="projectsList" appear> -->
    <transition name="pagechange" mode="out-in">
      <transition-group
        tag="div"
        name="projectsList"
        appear
        :key="sort_order + '-' + group_mode"
      >
        <div
          class="_dayFileSection"
          v-for="{ label, files } in grouped_files"
          :key="label"
        >
          <div class="_label">
            {{ label }}
          </div>
          <transition-group tag="div" class="_grid" name="listComplete" appear>
            <SharedFolderItem
              class="_file"
              v-for="file in files"
              :key="file.$path"
              :file="file"
              :is_opened="opened_files && opened_files.$path === file.$path"
              @open="openFile(file.$path)"
            />
          </transition-group>
        </div>
      </transition-group>
    </transition>

    <footer class="_footer">
      <small>
        <a href="mailto:ckernreuter@luma-arles.org" target="_blank"
          >aide/contact</a
        ><br />
        version {{ $root.app_infos.version }}
      </small>
    </footer>
  </div>
</template>
<script>
import SharedFolderItem from "@/components/SharedFolderItem.vue";
import ItemModal from "@/components/ItemModal.vue";

export default {
  props: {
    shared_folder_path: String,
  },
  components: {
    SharedFolderItem,
    ItemModal,
  },
  data() {
    return {
      shared_folder: undefined,
      sort_order: localStorage.getItem("sort_order") || "date_uploaded",

      show_backtotop_btn: false,
      current_scroll: 0,

      show_only_my_content:
        localStorage.getItem("show_only_my_content") === "true",

      group_mode: localStorage.getItem("group_mode") || "day",
      group_options: [
        {
          key: "day",
          label: this.$t("day"),
        },
        {
          key: "month",
          label: this.$t("month"),
        },
        {
          key: "year",
          label: this.$t("year"),
        },
      ],
    };
  },
  created() {},
  async mounted() {
    this.shared_folder = await this.$api.getFolder({
      path: this.shared_folder_path,
    });
    this.$api.join({ room: this.shared_folder_path });
  },
  beforeDestroy() {},
  watch: {
    sort_order() {
      localStorage.setItem("sort_order", this.sort_order);
    },
    group_mode() {
      localStorage.setItem("group_mode", this.group_mode);
    },
  },
  computed: {
    opened_files() {
      if (!this.$route.query?.file) return false;
      return this.shared_files.find(
        (si) => this.getFilename(si.$path) === this.$route.query.file
      );
    },
    shared_files() {
      if (!this.shared_folder?.$files) return [];
      const _all_medias = JSON.parse(JSON.stringify(this.shared_folder.$files));

      const _stacks_of_medias = _all_medias.filter((m) => m.belongs_to_stack);

      // remove medias part of stacks
      const _medias_not_in_stacks = _all_medias.reduce((acc, m) => {
        // if (!m.date_created_corrected)
        //   m.date_created_corrected = m.$date_created || m.$date_uploaded;

        if (m.belongs_to_stack) return acc;
        if (m.is_stack && m.stack_files_metas) {
          m._stack_files = m.stack_files_metas.map((sfm) =>
            _stacks_of_medias.find((sm) => sm.$path.endsWith("/" + sfm))
          );
          // m._stack_files = m._stack_files
          //   .concat(m._stack_files)
          //   .concat(m._stack_files);
          // m._stack_files = m._stack_files
          //   .concat(m._stack_files)
          //   .concat(m._stack_files);
          // m._stack_files = m._stack_files
          //   .concat(m._stack_files)
          //   .concat(m._stack_files);
        }
        acc.push(m);
        return acc;
      }, []);

      _medias_not_in_stacks.sort(
        (a, b) => +new Date(b.$date_uploaded) - +new Date(a.$date_uploaded)
      );
      return _medias_not_in_stacks;
    },
    filtered_shared_files() {
      return this.shared_files.filter((f) => {
        if (this.show_only_my_content)
          if (f.$admins && f.$admins.includes(this.connected_as.$path))
            return true;
          else return false;
        return true;
      });
    },
    grouped_files() {
      let order_props;
      if (this.sort_order === "date_created")
        order_props = [
          "date_created_corrected",
          "$date_created",
          "$date_uploaded",
        ];
      else if (this.sort_order === "date_uploaded")
        order_props = ["$date_uploaded"];
      return this.groupFilesBy(
        this.filtered_shared_files,
        order_props,
        this.group_mode
      );
    },
  },
  methods: {
    updatedScroll() {
      this.current_scroll = this.$el.scrollTop;
    },
    scrollTop() {
      this.$el.scrollTo({ top: 0, behavior: "smooth" });
    },
    openFile(path) {
      let query = Object.assign({}, this.$route.query) || {};
      const meta_filename = this.getFilename(path);
      query.file = meta_filename;
      this.$router.push({ query });
    },
    closeFile() {
      let query = Object.assign({}, this.$route.query) || {};
      delete query.file;
      this.$router.push({ query });
    },
  },
};
</script>
<style lang="scss" scoped>
._sharedFolder {
  padding-bottom: calc(var(--spacing) * 4);
  border-radius: 4px;
  overflow: auto;
  height: 100%;
}

._topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  // margin: calc(var(--spacing) * 2);
  padding: calc(var(--spacing) * 1);
  // border-bottom: 2px solid white;

  background: var(--c-bodybg);
  // background: white;
  // backdrop-filter: blur(6px);
  // mask: linear-gradient(black 75%, transparent 100%);
  mask: linear-gradient(#000 80%, transparent);
}
._topbar--content {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: flex-end;
  padding: calc(var(--spacing) * 1);
}
._title {
  font-size: 1.5em;
  font-weight: 600;
}

._dayFileSection {
  padding: calc(var(--spacing) * 2);
}

._label {
  position: relative;
  z-index: 2;
  padding-bottom: calc(var(--spacing) * 2);
  font-weight: 600;
  font-size: var(--sl-font-size-normal);
}

._grid {
  position: relative;
  z-index: 1;
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: flex-end;
  gap: calc(var(--spacing) * 3) calc(var(--spacing) * 2);
}
._file {
  width: 150px;
}

._removeBtn {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
}

._floatingTopBtn {
  position: sticky;
  top: 0;
  z-index: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: calc(var(--spacing) / 1);
  pointer-events: none;

  > * {
    border-radius: 25px;
    padding: calc(var(--spacing) / 1) calc(var(--spacing) * 2);
    background: black;
    color: white;
    pointer-events: auto;
  }
}

._footer {
  margin-top: calc(var(--spacing) * 6);
  text-align: center;

  a {
    color: inherit;
  }
}

._sortSelect {
  width: 33ch;

  select {
    background: white;
  }
}

._myContent {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: calc(var(--spacing) / 2);
}

._groupBy {
  display: flex;
  flex-flow: row nowrap;

  input {
    visibility: hidden;
    width: 1px;
    height: 1px;
  }

  label {
    cursor: pointer;
    &.is--selected {
      font-weight: 600;
    }
  }
}
</style>
