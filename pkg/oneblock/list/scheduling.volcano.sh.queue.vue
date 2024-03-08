<script>
import ResourceTable from '@shell/components/ResourceTable';
import Loading from '@shell/components/Loading';
import { OB } from '../types';
import { allHash } from '@shell/utils/promise';
import { STATE, NAME, AGE } from '@shell/config/table-headers';

export default {
  name: 'QueueList',

  components: { ResourceTable, Loading },

  async fetch() {
    const inStore = this.$store.getters['currentProduct'].inStore;
    const hash = { queues: this.$store.dispatch(`${ inStore }/findAll`, { type: OB.QUEUE }) };

    const res = await allHash(hash);

    this.rows = res.queues;
  },

  data() {
    return { rows: [] };
  },

  computed: {
    headers() {
      const cpuAllocation = {
        name:  'CPU',
        label: 'CPU Allocation',
        sort:  ['cpuAllocation'],
        value: 'cpuAllocation',
      };

      const memoryAllocation = {
        name:  'memory',
        label: 'Memory Allocation',
        sort:  ['memoryAllocation'],
        value: 'memoryAllocation',
      };

      const isDefaultQueue = {
        name:      'isDefaultQueue',
        label:     'DefaultQueue',
        sort:      ['isDefaultQueue'],
        formatter: 'Checked',
        value:     'isDefaultQueue'
      };

      const STATUS_STATE = {
        name:  'status.state',
        label: 'State',
        sort:  ['status.state'],
        value: 'status.state',
      };

      const headers = [
        STATE,
        NAME,
        cpuAllocation,
        memoryAllocation,
        STATUS_STATE,
        isDefaultQueue,
        AGE
      ];

      return headers;
    },
  }
};

</script>
<template>
  <Loading v-if="$fetchState.pending" />
  <ResourceTable
    v-else
    v-bind="$attrs"
    :headers="headers"
    :groupable="true"
    :rows="rows"
    key-field="_key"
    v-on="$listeners"
  />
</template>
