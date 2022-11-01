<template>
  <div>
    <div class="_topLabel" v-if="label">
      <label for="" class="u-label">{{ label }}</label>

      <div class="_authors">
        <div v-for="contrib in fake_contrib" :key="contrib.name" class="">
          <img :src="contrib.image" />
          <span>
            {{ contrib.name }}
          </span>
        </div>
      </div>

      {{ content }}

      <template v-if="can_edit">
        <EditBtn v-if="!edit_mode" @click="enableEditMode" />
        <div class="_footer" v-else>
          <SaveCancelButtons
            class="_scb"
            :is_saving="is_saving"
            :allow_save="allow_save"
            @save="updateAuthors"
            @cancel="cancel"
          />
        </div>
      </template>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    label: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    path: String,
    can_edit: {
      type: Boolean,
    },
  },
  components: {},
  data() {
    return {
      edit_mode: false,
      is_saving: false,
      new_content: this.content,

      fake_contrib: [
        {
          name: "Louis",
          image:
            "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
        },
        {
          name: "Pauline",
          image:
            "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&crop=left&q=80",
        },
        {
          name: "Sarah",
          image:
            "https://images.unsplash.com/photo-1490150028299-bf57d78394e0?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80&crop=right",
        },
      ],
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    enableEditMode() {
      this.edit_mode = true;
    },
    cancel() {
      this.edit_mode = false;
      this.is_saving = false;
      this.new_content = this.content;

      this.$nextTick(() => {
        // this.content = "";
        // this.$nextTick(() => {
        // this.content = this.new_content;
        // });
      });

      // todo interrupt updateMeta
    },
    async updateAuthors() {
      this.is_saving = true;
      await new Promise((r) => setTimeout(r, 500));

      try {
        const new_meta = {
          authors: this.new_content,
        };

        await this.$api.updateMeta({
          path: this.path,
          new_meta,
        });

        this.edit_mode = false;
        this.is_saving = false;
      } catch (e) {
        this.is_saving = false;

        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.couldntbesaved"));
        this.$alertify.closeLogOnClick(true).error(e.response.data);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._authors {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 4);

  > * {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    background: var(--c-bleumarine_clair);
    border-radius: 2em;
    // gap: calc(var(--spacing) / 4);

    img {
      border-radius: 50%;
      width: 2em;
      height: 2em;
    }
    span {
      padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
    }
  }
}
</style>
