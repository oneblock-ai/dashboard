import HarvesterResource from './harvester';
import { set } from '@shell/utils/object';

export default class HciBlockDevice extends HarvesterResource {
  applyDefaults() {
    const defaultSpec = {
      serviceType: 'NodePort',
      template:    {
        spec: {
          containers: [
            {
              image:     'kubeflownotebookswg/jupyter-scipy:v1.8.0',
              name:      'nb-jupyter',
              resources: {
                requests: {
                  cpu:    '200m',
                  memory: '500Mi'
                }
              },
              volumeMounts: [
                {
                  mountPath: '/home/jovyan',
                  name:      'test-vol'
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
              name:                  'test-vol',
              persistentVolumeClaim: { claimName: 'nb-jupyter' }
            },
            {
              emptyDir: { medium: 'Memory' },
              name:     'dshm'
            }
          ]
        }
      }
    };

    set(this, 'spec', this.spec || defaultSpec);
  }

  get notebookType() {
    return this.metadata.labels['ml.oneblock.ai/notebook-type'];
  }

  get isConnect() {
    return this.spec.serviceType;
  }

  get gpus() {
    // const limit = this.spec.template.spec.containers[0].resources.limit || { 'nvidia.com/gpu': 1 };

    return 0;
  }

  get cpusLimit() {
    const requests = this.spec.template.spec.containers[0].resources.requests;

    return requests.cpu;
  }

  get memoryLimit() {
    const requests = this.spec.template.spec.containers[0].resources.requests;

    return requests.memory;
  }
}
