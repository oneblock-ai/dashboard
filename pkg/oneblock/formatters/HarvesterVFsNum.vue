<script>
import { PRODUCT_NAME as HARVESTER_PRODUCT } from '../config/harvester';

export default {
  name: 'HarvesterVFsNum',

  props: {
    row: {
      type:     Object,
      required: true
    },
  },

  computed: {
    to() {
      return {
        name:   `${ HARVESTER_PRODUCT }-c-cluster-resource`,
        params: { cluster: this.$store.getters['clusterId'], resource: this.row.childDevice },
        query:  { parentSriov: this.row.id }
      };
    }
  }
};
</script>

<template>
  <div class="vfs-num">
    <n-link
      :to="to"
    >
      {{ row.numVFs }}
    </n-link>
  </div>
</template>
