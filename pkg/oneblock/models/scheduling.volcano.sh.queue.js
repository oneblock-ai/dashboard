import Vue from 'vue';
import HarvesterResource from './harvester';
import { set } from '@shell/utils/object';
// import { SERVICE } from '@shell/config/types';

export default class HciQueue extends HarvesterResource {
  applyDefaults() {
    const value = {
      metadata: {
        // 'scheduling.oneblock.ai/isDefaultQueue':      '',
        'scheduling.oneblock.ai/supportedNamespaces': ''
      },
      spec: {
        capability: {
          cpu:    '',
          memory: ''
        },
        guarantee:   { },
        reclaimable: true,
        weight:      1
      }
    };

    Vue.set(this, 'metadata', value.metadata);
    set(this, 'spec', this.spec || value.spec);
  }

  get cpuAllocation() {
    if (this.status?.allocated?.cpu && this.spec?.capability?.cpu) {
      return `${ this.status.allocated.cpu }/${ this.spec.capability.cpu }C`;
    }

    return '';
  }

  get memoryAllocation() {
    if (this.status?.allocated?.memory && this.spec?.capability?.memory) {
      return `${ this.status.allocated.memory }/${ this.spec.capability.memory }`;
    }

    return '';
  }

  get isDefaultQueue() {
    return this.metadata.annotations?.['scheduling.oneblock.ai/isDefaultQueue'] === 'true';
  }
}
