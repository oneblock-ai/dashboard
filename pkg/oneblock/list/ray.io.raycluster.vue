<script>
import ResourceTable from '@shell/components/ResourceTable';
import Loading from '@shell/components/Loading';
import { OB } from '../types';
import { allHash } from '@shell/utils/promise';
import { STATE, NAME, AGE } from '@shell/config/table-headers';

export default {
  name: 'MachineLearningListCluster',

  components: { ResourceTable, Loading },

  async fetch() {
    const inStore = this.$store.getters['currentProduct'].inStore;
    const hash = { cluster: this.$store.dispatch(`${ inStore }/findAll`, { type: OB.ML_CLUSTER }) };

    const res = await allHash(hash);

    this.rows = res.cluster;
  },

  data() {
    return { rows: [] };
  },

  computed: {
    headers() {
      const RAY_VERSION = {
        name:  'rayVersion',
        label: 'Ray Version',
        sort:  ['spec.rayVersion'],
        value: 'spec.rayVersion',
      };

      const CURRENT_WORKER_REPLICAS = {
        name:  'desiredWorkerReplicas',
        label: 'Current Worker Replicas',
        sort:  ['status.desiredWorkerReplicas'],
        value: 'status.desiredWorkerReplicas'
      };

      const MAX_WORKER_REPLICAS = {
        name:  'MaxWorkerReplicas',
        label: 'Max Worker Replicas',
        sort:  ['status.maxWorkerReplicas'],
        value: 'status.maxWorkerReplicas'
      };

      const headers = [
        STATE,
        NAME,
        RAY_VERSION,
        CURRENT_WORKER_REPLICAS,
        MAX_WORKER_REPLICAS,
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
    :groupable="true"
    :headers="headers"
    :rows="rows"
    key-field="_key"
    v-on="$listeners"
  >
    <template #col:name="{row}">
      <td>
        <span>{{ row.nameDisplay }}</span>
        <n-link
          :to="{ name: 'oneblock-c-cluster-raydashboard'}"
        >
          Manage
        </n-link>
      </td>
    </template>
  </ResourceTable>
</template>
