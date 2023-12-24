import Vue from 'vue';
import HarvesterResource from './harvester';
import { set } from '@shell/utils/object';

export default class OBRayCluster extends HarvesterResource {
  applyDefaults() {
    const value = {
      apiVersion: 'ml.oneblock.ai/v1',
      kind:       'Notebook',
      metadata:   {
        name:      '',
        namespace: '',
        labels:    {
          'ray.io/scheduler-name': 'volcano',
          'volcano.sh/queue-name': 'raycluster-default'
        },
        annotations: { 'oneblock.ai/volumeClaimTemplates': '[{"metadata":{"name":"","creationTimestamp":null},"spec":{"accessModes":["ReadWriteOnce"],"resources":{"requests":{"storage":"1Gi"}}},"status":{}}]' }
      },
      spec: {
        autoscalerOptions: {
          idleTimeoutSeconds: 60,
          resources:          {
            limits: {
              cpu:    '500m',
              memory: '512Mi'
            },
            requests: {

              cpu:    '200m',
              memory: '256Mi'
            }
          },
          upscalingMode: 'Default'
        },
        enableInTreeAutoscaling: true,
        headGroupSpec:           {
          rayStartParams: {
            'num-cpus':       '0',
            'redis-password': '$REDIS_PASSWORD'
          },
          template: {
            metadata: {},
            spec:     {
              containers: [
                {
                  env: [
                    {
                      name:  'RAY_REDIS_ADDRESS',
                      value: 'redis://oneblock-redis-master.oneblock-system.svc.cluster.local:6379'
                    },
                    {
                      name:      'REDIS_PASSWORD',
                      valueFrom: {
                        secretKeyRef: {
                          key:  'redis-password',
                          name: 'oneblock-public-gcs-redis'
                        }
                      }
                    }
                  ],
                  image:     '2',
                  lifecycle: {
                    preStop: {
                      exec: {
                        command: [
                          '/bin/sh',
                          '-c',
                          'ray stop'
                        ]
                      }
                    }
                  },
                  name:  'ray-head',
                  ports: [
                    {
                      containerPort: 6379,
                      name:          'redis',
                      protocol:      'TCP'
                    },
                    {
                      containerPort: 10001,
                      name:          'client',
                      protocol:      'TCP'
                    },
                    {
                      containerPort: 8265,
                      name:          'dashboard',
                      protocol:      'TCP'
                    }
                  ],
                  resources: {
                    limits: {
                      cpu:    '',
                      memory: ''
                    },
                    requests: {
                      cpu:    '',
                      memory: ''
                    }
                  },
                  volumeMounts: [
                    {
                      mountPath: '/tmp/ray',
                      name:      'ray-logs'
                    }
                  ]
                }
              ],
              volumes: [
                {
                  name:                  'ray-logs',
                  persistentVolumeClaim: { claimName: 'public-ray-cluster-log' }
                }
              ]
            }
          }
        },
        rayVersion:       '',
        workerGroupSpecs: [
          {
            groupName:      'default-worker',
            maxReplicas:    10,
            minReplicas:    1,
            rayStartParams: {},
            replicas:       1,
            scaleStrategy:  {},
            template:       {
              metadata: {},
              spec:     {
                containers: [
                  {
                    env: [
                      {
                        name:  'RAY_gcs_rpc_server_reconnect_timeout_s',
                        value: '300'
                      }
                    ],
                    image:     '',
                    lifecycle: {
                      preStop: {
                        exec: {
                          command: [
                            '/bin/sh',
                            '-c',
                            'ray stop'
                          ]
                        }
                      }
                    },
                    name:      'ray-worker',
                    resources: {
                      limits: {
                        cpu:    '',
                        memory: ''
                      },
                      requests: {
                        cpu:    '',
                        memory: ''
                      }
                    }
                  }
                ]
              }
            }
          }
        ]
      }
    };

    Vue.set(this, 'metadata', value.metadata);
    set(this, 'spec', this.spec || value.spec);
  }

  get stateDisplay() {
    return this.stateDescription ? 'Error' : super.stateDisplay;
  }

  get stateDescription() {
    const relationships = this.metadata.relationships || [];

    const hasError = relationships.find((r) => r.error === true);

    if (hasError) {
      return hasError.message;
    } else {
      return false;
    }
  }

  // get notebookType() {
  //   return this.metadata.labels['ml.oneblock.ai/notebook-type'];
  // }

  // get connectUrl() {
  //   const uid = this.metadata.uid;
  //   const services = this.$rootGetters['oneblock/all'](SERVICE) || [];
  //   const service = services.find((s) => {
  //     const ownerReferences = s.metadata.ownerReferences || [];

  //     return ownerReferences.find((o) => o.uid === uid);
  //   });

  //   if (service && this.status?.state?.running) {
  //     const ports = (service.spec.ports || []).find((p) => p.name === `http-${ this.metadata.name }`);

  //     if (this.spec.serviceType === 'NodePort') {
  //       const port = ports.nodePort;

  //       return `http://${ window.location.hostname }:${ port }`;
  //     } else {
  //       return `https://${ window.location.hostname }:${ window.location.port }/api/v1/namespaces/${ this.metadata.namespace }/services/http:${ service.metadata.name }:${ ports.name }/proxy/`;
  //     }
  //   } else {
  //     return '';
  //   }
  // }

  // get gpus() {
  //   // const limit = this.spec.template.spec.containers[0].resources.limit || { 'nvidia.com/gpu': 1 };

  //   return 0;
  // }

  // get cpusLimit() {
  //   const requests = this.spec.template.spec.containers[0].resources.requests;

  //   return `${ requests.cpu } C`;
  // }

  // get memoryLimit() {
  //   const requests = this.spec.template.spec.containers[0].resources.requests;

  //   return requests.memory;
  // }
}
