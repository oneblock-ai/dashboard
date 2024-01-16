<script>
import { PRODUCT_NAME as HARVESTER_PRODUCT } from '../config/harvester';

export default {
  name: 'HarvesterVGpuDevices',

  props: {
    row: {
      type:     Object,
      required: true
    },
  },

  data() {
    return { showAll: false, limitedNumbers: 2 };
  },

  computed: {
    allVGpuDevices() {
      return this.row.status?.vGPUDevices || [];
    },

    rows() {
      const out = this.allVGpuDevices.map((device) => {
        const to = {
          name:   `${ HARVESTER_PRODUCT }-c-cluster-resource`,
          params: { cluster: this.$store.getters['clusterId'], resource: this.row.childDevice },
          query:  { q: device }
        };

        return {
          to,
          name: device
        };
      });

      return {
        visible:   out.slice(0, this.limitedNumbers),
        invisible: out.slice(this.limitedNumbers)
      };
    },
  }
};
</script>

<template>
  <div class="vgpudevices">
    <span v-for="(vgpu, index) in rows.visible" :key="vgpu.name">
      <n-link
        :to="vgpu.to"
      >
        {{ vgpu.name }}
      </n-link>

      <span v-if="index < rows.visible.length - 1">, </span>
    </span>

    <v-popover
      trigger="click"
      placement="top"
    >
      <span v-if="allVGpuDevices.length > limitedNumbers">
        , <a
          href="javascript:void(0)"
          class="show-more"
          @click.prevent="showAll = !showAll"
        >
          {{ t('harvester.sriovgpu.showMore') }}
        </a>
      </span>

      <template v-slot:popover>
        <div class="vgpu-popup">
          <div>
            <span v-for="(vgpu, index) in rows.invisible" :key="vgpu.name">
              <n-link
                :to="vgpu.to"
              >
                {{ vgpu.name }}
              </n-link>

              <span v-if="index < rows.invisible.length - 1">, </span>
            </span>
          </div>
        </div>
      </template>
    </v-popover>
  </div>
</template>

<style lang="scss" scoped>
  .vgpudevices {
    min-width: 380px;

    .show-more {
      font-size: 12px;
    }
  }
  .popover .popover-inner .vgpu-popup a {
    color: var(--link);

    &:hover {
      text-decoration: underline;
      color: var(--body-text);
    }
  }
</style>
