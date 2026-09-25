<template>
  <div class="_topbar">
    <button
      type="button"
      class="u-button u-button_icon _backMake"
      @click="$emit('close')"
    >
      <b-icon icon="arrow-left-circle" :aria-label="$t('back_to_makes_list')" />
    </button>

    <div class="_makeTitle">
      <TitleField
        :field_name="'title'"
        :tag="'h3'"
        :content="make.title"
        :path="make.$path"
        :required="true"
        :minlength="3"
        :maxlength="60"
        :can_edit="can_edit"
      />
    </div>

    <div class="_buttonRow">
      <DropDown v-if="can_edit" :show_label="false" :right="true">
        <RemoveMenu @remove="$emit('remove')" />
      </DropDown>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    make: Object,
    can_edit: Boolean,
  },
};
</script>
<style lang="scss" scoped>
._topbar {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 4);
  align-items: center;
  width: 100%;
  background: white;

  padding: calc(var(--spacing) / 2) calc(var(--spacing) / 2);
  margin: 0;
  border-bottom: 2px solid var(--c-gris_clair);
}

._backMake {
  font-size: 1.1rem;
}

._makeTitle {
  flex: 10 1 auto;
}

._buttonRow {
  display: flex;
  flex-flow: row wrap;
  flex: 1 1 auto;
  justify-content: flex-end;
}
</style>
