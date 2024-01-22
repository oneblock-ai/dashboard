<script>
import ResourceTable from '@shell/components/ResourceTable';
import Loading from '@shell/components/Loading';
import { OB } from '../types';
import { allHash } from '@shell/utils/promise';
import { STATE, NAME, AGE } from '@shell/config/table-headers';

export default {
  name: 'NoteBooksList',

  components: { ResourceTable, Loading },

  async fetch() {
    const inStore = this.$store.getters['currentProduct'].inStore;
    const hash = { notebook: this.$store.dispatch(`${ inStore }/findAll`, { type: OB.NOTEBOOK }) };

    const res = await allHash(hash);

    this.rows = res.notebook;
  },

  data() {
    return { rows: [] };
  },

  computed: {
    headers() {
      const TYPE = {
        name:  'type',
        label: 'Type',
        sort:  ['notebookType'],
        value: 'notebookType'
      };

      const GPUs = {
        name:  'gpus',
        label: 'GPUs',
        sort:  ['gpus'],
        value: 'gpus'
      };

      const CPUS_LIMIT = {
        name:  'cpusLimit',
        label: 'CPUs(limits)',
        sort:  ['cpusLimit'],
        value: 'cpusLimit'
      };

      const MEMORY_LIMIT = {
        name:  'memoryLimit',
        label: 'Memory(limits)',
        sort:  ['memoryLimit'],
        value: 'memoryLimit'
      };

      const CONNECT = {
        name:  'connect',
        label: 'Connect',
        sort:  ['connect'],
        value: 'connect'
      };

      const headers = [
        STATE,
        NAME,
        TYPE,
        GPUs,
        CPUS_LIMIT,
        MEMORY_LIMIT,
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
