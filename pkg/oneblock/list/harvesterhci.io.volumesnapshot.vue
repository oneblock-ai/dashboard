<script>
import ResourceTable from '@shell/components/ResourceTable';
import Loading from '@shell/components/Loading';
import { SCHEMA, PVC } from '@shell/config/types';
import { VOLUME_SNAPSHOT, OB } from '../types';
import { allHash } from '@shell/utils/promise';

const schema = {
  id:         OB.SNAPSHOT,
  type:       SCHEMA,
  attributes: {
    kind:       OB.SNAPSHOT,
    namespaced: true
  },
  metadata: { name: OB.SNAPSHOT },
};

export default {
  name: 'HarvesterListSnapshot',

  components: { ResourceTable, Loading },

  async fetch() {
    const inStore = this.$store.getters['currentProduct'].inStore;
    const hash = {
      volumes:   this.$store.dispatch(`${ inStore }/findAll`, { type: PVC }),
      snapshots: this.$store.dispatch(`${ inStore }/findAll`, { type: VOLUME_SNAPSHOT }),
    };

    const res = await allHash(hash);

    this.rows = res.snapshots;

    const snapShotSchema = this.$store.getters[`${ inStore }/schemaFor`](VOLUME_SNAPSHOT);

    if (!snapShotSchema?.collectionMethods.find((x) => x.toLowerCase() === 'post')) {
      this.$store.dispatch('type-map/configureType', { match: OB.SNAPSHOT, isCreatable: false });
    }
  },

  data() {
    return { rows: [] };
  },

  computed: {
    filteredRows() {
      return this.rows.filter((R) => {
        return R.metadata?.ownerReferences?.[0]?.kind === 'PersistentVolumeClaim';
      });
    },

    schema() {
      return schema;
    }
  },

  typeDisplay() {
    return this.$store.getters['type-map/labelFor'](schema, 99);
  }

};

</script>

<template>
  <Loading v-if="$fetchState.pending" />
  <ResourceTable
    v-else
    v-bind="$attrs"
    :groupable="true"
    :schema="schema"
    :rows="filteredRows"
    key-field="_key"
    v-on="$listeners"
  />
</template>
