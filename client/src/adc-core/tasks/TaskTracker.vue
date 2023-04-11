<template>
  <div class="_taskTracker" v-if="tasks_tracked.length > 0">
    <DLabel class="u-colorWhite" :str="$t('exports_in_progress')" />
    <div v-for="task in tasks_tracked" class="_task" :key="task.id">
      <div class="u-sameRow">
        <div>{{ formatDateToHuman(task.date_started) }}</div>
        <div>
          <span v-if="task.instructions">
            {{ task.instructions.recipe }}
          </span>
        </div>
        <div>{{ task.event }}</div>
        <div>
          <b>{{ task.progress }}%</b>
        </div>
        <button
          type="button"
          v-if="task.progress < 100"
          @click="abortTask(task.id)"
          class="u-button u-button_black"
        >
          <sl-icon name="x-octagon" />
        </button>
        <button
          type="button"
          v-else-if="task.progress === 100"
          @click="removeTask(task.id)"
          class="u-button u-button_black"
        >
          <sl-icon name="x-octagon" />
        </button>
      </div>
      <div v-if="task.path">
        {{ task.path }}
      </div>
    </div>
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
  watch: {},
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
      this.tasks_tracked[task_index].progress = progress;
    },
    ended({ task_id, message }) {
      const task_index = this.tasks_tracked.findIndex((t) => t.id === task_id);
      this.tasks_tracked[task_index].progress = 100;
      this.tasks_tracked[task_index].event = message.event;
      this.tasks_tracked[task_index].path = message.path;

      this.$api.leave({ room: "task_" + task_id });
    },

    abortTask(task_id) {
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

  margin: calc(var(--spacing) * 3);
  padding: calc(var(--spacing) / 2);
  margin-bottom: 0;

  background: var(--c-noir);
  color: white;
}
._task {
  // display: flex;
  // flex-flow: row nowrap;
  // justify-content: space-between;
  // align-items: center;
  background: white;
  margin: calc(var(--spacing) / 2) 0;
  padding: calc(var(--spacing) / 2);
  color: var(--c-noir);
}
</style>
