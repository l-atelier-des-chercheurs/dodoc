<template>
	<div :class="classes">
		<slot></slot>
	</div>
</template>

<script>
  export default {
    name: 'Pane',
    props: {
      className: String
    },
    data() {
      const classes = [this.$parent.split, this.className]
      return {
        classes: classes.join(' '),
        percent: 50
      }
    }
  }
</script>

<style scoped>
</style>