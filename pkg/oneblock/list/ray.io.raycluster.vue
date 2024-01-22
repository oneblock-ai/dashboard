<script>
import ResourceTable from '@shell/components/ResourceTable';
import Loading from '@shell/components/Loading';
import { OB } from '../types';
import { allHash } from '@shell/utils/promise';

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
};

</script>
<!--header 还少了一个message -->
<template>
  <Loading v-if="$fetchState.pending" />
  <ResourceTable
    v-else
    v-bind="$attrs"
    :groupable="true"
    :rows="rows"
    key-field="_key"
    v-on="$listeners"
  />
</template>
