<script>
import ProgressBarMulti from '@shell/components/ProgressBarMulti';

export default {
  name:       'HarvesterBackupProgressBar',
  components: { ProgressBarMulti },

  props: {
    value: {
      type:    Object,
      default: () => ({}),
    },
  },

  computed: {
    isEmpty() {
      return this.value !== undefined && Object.keys(this.value).length === 0;
    },
    status() {
      switch (this.value.percentage) {
      case 0:
        return 'starting';
      case 100:
        return 'complete';

      default:
        return 'progress';
      }
    },

    percentage() {
      const value = Number(this.value.percentage);
      let color = 'bg-success';

      if (value === 0) {
        color = 'bg-secondary';
      } else if (value < 30) {
        color = 'bg-darker';
      } else if (value < 70) {
        color = 'bg-warning';
      }

      return [{
        value,
        color
      }];
    },

    tooltip() {
      if (!this.value.details.volumes?.length) {
        return null;
      }
      const title = this.t(`harvester.${ this.value.type }.progress.details`);
      const rows = this.value.details.volumes.map(v => `<br><b>${ v.volumeName }</b>:  ${ v.progress || 0 }%`);

      return rows.reduce((acc, r) => acc + r, `${ title }<br>`);
    },
  },
};
</script>

<template>
  <div v-if="isEmpty" class="empty">
    <span class="text-muted">
      &mdash;
    </span>
  </div>
  <div
    v-else-if="status != 'complete'"
    class="parent"
  >
    <div class="progress-box">
      <ProgressBarMulti
        v-clean-tooltip="tooltip"
        :values="percentage"
        :min="0"
        :max="100"
      />
    </div>
    <div class="text">
      {{ value.percentage || 0 }}%
    </div>
  </div>
  <div v-else>
    {{ t('generic.completed') }}
  </div>
</template>

<style lang="scss" scoped>
  .parent {
    display: grid;
    grid-template-areas: "progress text";
    grid-template-columns: auto 80px;
    align-items: center;
    .progress {
      background-color: darken(#EBEEF5, 15%);
      width: 100%;
    }
    .progress-box {
      grid-area: progress;
    }
    .text {
      grid-area: text;
      text-align: center;
    }
  }
</style>
