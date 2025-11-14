<template>
  <div class="_taskTracker" v-if="tasks_tracked.length > 0">
    <DLabel class="" :str="$tc('exports', tasks_tracked.length)" />
    <transition-group name="listComplete">
      <div v-for="task in tasks_tracked" class="_task" :key="task.id">
        <div class="">
          {{ $t(task.instructions.recipe) }}
        </div>
        <div v-if="task.event !== 'completed'">
          <i>
            {{ $t(task.event) }}
          </i>
        </div>
        <div>
          <b><AnimatedCounter :value="task.progress" /></b>
        </div>
        <div v-if="task.path">
          <button
            type="button"
            class="u-button u-button_bleuvert"
            @click="openMediaModalToExport(task.path)"
          >
            {{ $t("open") }}
          </button>
        </div>
        <div class="u-sameRow" v-if="task.progress === 100">
          <!-- <button
            type="button"
            v-if="task.progress < 100"
            @click="abortTask(task.id)"
            class="u-button u-button_red"
          >
            <b-icon icon="x-octagon" />
            {{ $t("stop") }}
          </button> -->
          <button
            type="button"
            v-if="task.progress === 100"
            @click="removeTask(task.id)"
            class="u-button u-button_icon"
          >
            <b-icon icon="x-octagon" />
          </button>
        </div>
      </div>
    </transition-group>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      tasks_tracked: [],
    };
  },
  created() {},
  mounted() {
    this.$eventHub.$on("task.started", this.started);
    this.$eventHub.$on("task.status", this.status);
    this.$eventHub.$on("task.ended", this.ended);
  },
  beforeDestroy() {
    this.$eventHub.$off("task.started", this.started);
    this.$eventHub.$off("task.status", this.status);
    this.$eventHub.$off("task.ended", this.ended);
  },
  watch: {
    tasks_tracked() {
      if (this.tasks_tracked.length > 1) {
        this.tasks_tracked.shift();
      }
    },
  },
  computed: {},
  methods: {
    started({ task_id, instructions }) {
      this.tasks_tracked.push({
        date_started: +new Date(),
        id: task_id,
        event: undefined,
        instructions,
        progress: 0,
        path: undefined,
      });

      this.$api.join({ room: "task_" + task_id });
    },
    status({ task_id, progress }) {
      const task_index = this.tasks_tracked.findIndex((t) => t.id === task_id);
      if (task_index === -1) return;
      this.tasks_tracked[task_index].progress = progress;
    },
    ended({ task_id, event, message }) {
      const task_index = this.tasks_tracked.findIndex((t) => t.id === task_id);
      if (task_index === -1) return;
      this.tasks_tracked[task_index].progress = 100;
      this.tasks_tracked[task_index].event = event;
      if (message?.file?.$path)
        this.tasks_tracked[task_index].path = message.file.$path;

      this.$api.leave({ room: "task_" + task_id });
    },

    openMediaModalToExport(path) {
      const { space_slug, project_slug } = this.decomposePath(path);
      const path_to_project = this.createPath({ space_slug, project_slug });
      const url_to_project = this.createURLFromPath(path_to_project);

      let query = {};

      query.projectpanes = JSON.stringify([
        {
          type: "collect",
          size: 100,
          focus: this.getFilename(path),
        },
      ]);
      this.$router.push({
        path: url_to_project,
        query,
      });

      // https://localhost:8080/+un-espace-pas-prive/
      // un-super-projet?
      // projectpanes=%5B%7B%22type%22%3A%22collect%22,%22size%22%3A100,%22focus%22%3A%22spaces%2Fun-espace-pas-prive%2Fprojects%2Fun-super-projet%2Fpublication-5.pdf.meta.txt%22%7D%5D

      // {
      //     type: "publish",
      //     size: 100,
      //   },
    },
    abortTask(task_id) {
      // TODO abort task
      task_id;
    },
    removeTask(task_id) {
      this.tasks_tracked = this.tasks_tracked.filter((t) => t.id !== task_id);
    },
  },
};
</script>
<style lang="scss" scoped>
._taskTracker {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 100000;

  max-width: 400px;
  width: 100%;
  max-height: 200px;
  overflow: auto;

  background: white;

  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  margin: calc(var(--spacing) * 3);
  padding: calc(var(--spacing) / 2);
  margin-bottom: 0;
}
._task {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  background: var(--c-gris_clair);
  border-left: 2px solid var(--c-gris_fonce);
  margin: calc(var(--spacing) / 2) 0;
  padding: calc(var(--spacing) / 2);
  color: var(--c-noir);
}
</style>
