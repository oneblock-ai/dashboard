<script>
import ResourceTable from '@shell/components/ResourceTable';
import Loading from '@shell/components/Loading';
import { OB } from '../types';
import { allHash } from '@shell/utils/promise';
import { STATE, NAME, AGE } from '@shell/config/table-headers';
import { SERVICE } from '@shell/config/types';

export default {
  name: 'NoteBooksList',

  components: { ResourceTable, Loading },

  async fetch() {
    const inStore = this.$store.getters['currentProduct'].inStore;
    const hash = {
      notebooks: this.$store.dispatch(`${ inStore }/findAll`, { type: OB.NOTEBOOK }),
      services:  this.$store.dispatch(`${ inStore }/findAll`, { type: SERVICE })
    };

    const res = await allHash(hash);

    this.rows = res.notebooks;
  },

  data() {
    return { rows: [] };
  },

  computed: {
    headers() {
      const TYPE = {
        name:      'type',
        label:     'Type',
        sort:      ['notebookType'],
        value:     'notebookType',
        formatter: 'productTypeIcon',
      };

      const GPUs = {
        name:  'gpus',
        label: 'GPU',
        sort:  ['gpus'],
        value: 'gpus'
      };

      const CPUS_LIMIT = {
        name:  'cpusLimit',
        label: 'CPU',
        sort:  ['cpusLimit'],
        value: 'cpusLimit'
      };

      const MEMORY_LIMIT = {
        name:  'memoryLimit',
        label: 'Memory',
        sort:  ['memoryLimit'],
        value: 'memoryLimit'
      };

      const CONNECT = {
        name:      'connect',
        label:     'Connect',
        sort:      ['connect'],
        formatter: 'Connect',
        value:     'connectUrl'
      };

      const headers = [
        STATE,
        NAME,
        TYPE,
        CPUS_LIMIT,
        MEMORY_LIMIT,
        GPUs,
        CONNECT,
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
