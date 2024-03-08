import Vue from 'vue';
import HarvesterResource from './harvester';
import { set } from '@shell/utils/object';
import { SERVICE } from '@shell/config/types';

export default class HciBlockDevice extends HarvesterResource {
  applyDefaults() {
    const value = {
      apiVersion: 'ml.oneblock.ai/v1',
      kind:       'Notebook',
      metadata:   {
        name:        '',
        namespace:   '',
        labels:      { 'ml.oneblock.ai/notebook-type': '' },
        annotations: { 'oneblock.ai/volumeClaimTemplates': '[{"apiVersion":"v1","kind":"PersistentVolumeClaim","metadata":{"name":""},"spec":{"accessModes":["ReadWriteOnce"],"resources":{"requests":{"storage":"1Gi"}}}}]' }
      },
      spec: {
        template: {
          spec: {
            containers: [
              {
                image:     '',
                name:      '',
                resources: {
                  requests: {
                    cpu:    '',
                    memory: ''
                  },
                  limits: {
                    cpu:    '',
                    memory: ''
                  }
                },
                volumeMounts: [
                  {
                    mountPath: '/home/jovyan',
                    name:      'data-storage'
                  },
                  {
                    mountPath: '/dev/shm',
                    name:      'dshm'
                  }
                ]
              }
            ],
            volumes: [
              {
                name:                  'data-storage',
                persistentVolumeClaim: { claimName: '' }
              },
              {
                emptyDir: { medium: 'Memory' },
                name:     'dshm'
              }
            ]
          }
        }
      }
    };

    Vue.set(this, 'metadata', value.metadata);
    set(this, 'spec', this.spec || value.spec);
  }

  get notebookType() {
    return this.metadata.labels['ml.oneblock.ai/notebook-type'];
  }

  get connectUrl() {
    const uid = this.metadata.uid;
    const services = this.$rootGetters['oneblock/all'](SERVICE) || [];
    const service = services.find((s) => {
      const ownerReferences = s.metadata.ownerReferences || [];

      return ownerReferences.find((o) => o.uid === uid);
    });

    if (service && this.status?.state?.running) {
      const ports = (service.spec.ports || []).find((p) => p.name === `http-${ this.metadata.name }`);

      if (this.spec.serviceType === 'NodePort') {
        const port = ports.nodePort;

        return `http://${ window.location.hostname }:${ port }`;
      } else {
        return `https://${ window.location.hostname }:${ window.location.port }/api/v1/namespaces/${ this.metadata.namespace }/services/http:${ service.metadata.name }:${ ports.name }/proxy/`;
      }
    } else {
      return '';
    }
  }

  get gpus() {
    // const limit = this.spec.template.spec.containers[0].resources.limit || { 'nvidia.com/gpu': 1 };

    return 0;
  }

  get cpusLimit() {
    const requests = this.spec.template.spec.containers[0].resources.requests;

    return `${ requests.cpu } C`;
  }

  get memoryLimit() {
    const requests = this.spec.template.spec.containers[0].resources.requests;

    return requests.memory;
  }
}
