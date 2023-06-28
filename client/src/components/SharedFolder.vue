<template>
  <div v-if="shared_folder" class="_sharedFolder" @scroll="updatedScroll">
    <div class="_mainContent">
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
          <div class="">
            <button
              type="button"
              class="u-buttonLink"
              :class="{
                'is--active': show_filter_sort_pane,
              }"
              @click="show_filter_sort_pane = !show_filter_sort_pane"
            >
              Filtrer/Classer
            </button>
          </div>
        </div>
      </div>

      <transition name="scaleInFade_fast" mode="out-in">
        <ItemModal
          v-if="opened_file"
          :key="opened_file.$path"
          :file="opened_file"
          :opened_file_sequence="opened_file_sequence"
          :position_in_list="opened_file_position_in_list"
          @prevMedia="navMedia(-1)"
          @nextMedia="navMedia(+1)"
          @close="closeFile"
        />
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
            v-if="grouped_files.length === 0"
            class="u-instructions _noContent"
            :key="'nocontent'"
          >
            {{ $t("no_content") }}
          </div>
          <template v-else>
            <div
              class="_dayFileSection"
              v-for="{ label, files } in grouped_files"
              :key="label"
            >
              <div class="_label">
                {{ label }}
              </div>
              <transition-group
                tag="div"
                class="_grid"
                name="listComplete"
                appear
              >
                <SharedFolderItem
                  class="_file"
                  v-for="file in files"
                  :key="file.$path"
                  :file="file"
                  :is_opened="opened_file && opened_file.$path === file.$path"
                  @open="openFile(file.$path)"
                />
              </transition-group>
            </div>
          </template>
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
    <transition name="pagechange" mode="out-in">
      <div class="_filterBar" v-if="show_filter_sort_pane">
        <FilterBar
          :group_mode.sync="group_mode"
          :sort_order.sync="sort_order"
          :author_path_filter.sync="author_path_filter"
          :available_keywords="available_keywords"
          :keywords_filter.sync="keywords_filter"
        />
      </div>
    </transition>
  </div>
</template>
<script>
import SharedFolderItem from "@/components/SharedFolderItem.vue";
import ItemModal from "@/components/ItemModal.vue";
import FilterBar from "@/components/FilterBar.vue";

export default {
  props: {
    shared_folder_path: String,
  },
  components: {
    SharedFolderItem,
    ItemModal,
    FilterBar,
  },
  data() {
    return {
      shared_folder: undefined,

      show_backtotop_btn: false,
      current_scroll: 0,

      show_filter_sort_pane: false,
      sort_order: localStorage.getItem("sort_order") || "date_uploaded",
      author_path_filter: localStorage.getItem("author_path_filter") || "",
      keywords_filter: localStorage.getItem("keywords_filter") || [],
      group_mode: localStorage.getItem("group_mode") || "day",
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
    opened_file() {
      if (!this.$route.query?.file) return false;
      return this.shared_files.find(
        (si) => this.getFilename(si.$path) === this.$route.query.file
      );
    },
    opened_file_position_index() {
      if (!this.opened_file) return false;
      return this.filtered_shared_files.findIndex(
        (fm) => fm.$path === this.opened_file.$path
      );
    },
    opened_file_sequence() {
      return `${this.opened_file_position_index + 1}/${
        this.filtered_shared_files.length
      }`;
    },
    opened_file_position_in_list() {
      const opened_file_index = this.opened_file_position_index;
      if (opened_file_index === false) return "none";

      if (this.filtered_shared_files.length === 1) return "alone";
      if (opened_file_index === 0) return "first";
      if (opened_file_index === this.filtered_shared_files.length - 1)
        return "last";
      return "none";
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
        if (this.author_path_filter)
          if (!f.$admins || !f.$admins.includes(this.author_path_filter))
            return false;

        if (this.keywords_filter.length > 0) {
          if (f.keywords && Array.isArray(f.keywords)) {
            return !this.keywords_filter.some(
              (kwf) => !f.keywords.includes(kwf)
            );
          }
          return false;
        }

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
    available_keywords() {
      const all_kw = this.filtered_shared_files.reduce((acc, f) => {
        if (f.keywords && Array.isArray(f.keywords)) {
          f.keywords.map((kw) => {
            const item = acc.find((_kw) => _kw.title === kw);
            if (item) item.count += 1;
            else acc.push({ title: kw, count: 1 });

            // if (!acc[kw]) acc[kw] = 1;
            // else acc[kw] += 1;
          });
        }
        return acc;
      }, []);
      return all_kw.sort((a, b) => {
        return b.count - a.count;
      });
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
    navMedia(dir) {
      const index = this.opened_file_position_index;
      const new_media = this.filtered_shared_files[index + dir];
      if (new_media) this.openFile(new_media.$path);
    },
  },
};
</script>
<style lang="scss" scoped>
._sharedFolder {
  display: flex;
  flex-flow: row nowrap;
  height: 100%;

  > ._mainContent {
    flex: 1;
  }
  > ._filterBar {
    flex: 0 0 240px;
    max-width: 240px;
  }
}

._mainContent {
  padding-bottom: calc(var(--spacing) * 4);
  height: 100%;
  overflow: auto;
}

._filterBar {
  border-left: 1px solid white;
  height: 100%;
  overflow: auto;
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
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: flex-end;
  padding: calc(var(--spacing) * 1);
  gap: calc(var(--spacing) * 1);
  line-height: 1;
}
._title {
  font-size: 1.5em;
  font-weight: 600;
}

._dayFileSection {
  padding: calc(var(--spacing) * 2);
}

._noContent {
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

._footer {
  margin-top: calc(var(--spacing) * 6);
  text-align: center;

  a {
    color: inherit;
  }
}
</style>
