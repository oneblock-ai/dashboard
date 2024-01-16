import Vue from 'vue';
import { find, pickBy, omitBy } from 'lodash';
import { OB } from '../types';
import {
  AS, MODE, _VIEW, _CONFIG, _UNFLAG, _EDIT
} from '@shell/config/query-params';
import { OB as OB_ANNOTATIONS } from '@pkg/oneblock/config/labels-annotations';
import HarvesterResource from './harvester';
import { findBy } from '@shell/utils/array';
import { get, set } from '@shell/utils/object';
import { PRODUCT_NAME as HARVESTER_PRODUCT } from '../config/harvester';
import { colorForState } from '@shell/plugins/dashboard-store/resource-class';
import { LABELS_TO_IGNORE_REGEX } from '@shell/config/labels-annotations';
import { matchesSomeRegex } from '@shell/utils/string';

export default class HciVmTemplateVersion extends HarvesterResource {
  get availableActions() {
    let out = super._availableActions;
    const toFilter = ['goToClone', 'cloneYaml', 'goToViewConfig', 'goToEditYaml', 'goToViewYaml'];

    out = out.filter((action) => {
      if (!toFilter.includes(action.action)) {
        return action;
      }
    });

    const schema = this.$getters['schemaFor'](OB.VM);
    let canCreateVM = true;

    if ( schema && !schema?.collectionMethods.find((x) => ['post'].includes(x.toLowerCase())) ) {
      canCreateVM = false;
    }

    return [
      {
        action:   'launchFromTemplate',
        icon:     'icon icon-spinner',
        disabled: !canCreateVM || !this.isReady,
        label:    this.t('harvester.action.launchFormTemplate'),
      },
      {
        action:  'cloneTemplate',
        enabled: this.currentTemplate?.canCreate,
        icon:    'icon icon-fw icon-edit',
        label:   this.t('harvester.action.modifyTemplate'),
      },
      {
        action:  'setDefaultVersion',
        enabled: this.currentTemplate?.canCreate,
        icon:    'icon icon-fw icon-checkmark',
        label:   this.t('harvester.action.setDefaultVersion'),
      },
      {
        action: 'goToViewConfig',
        label:  this.t('action.view'),
        icon:   'icon icon-edit',
      },
      ...out
    ];
  }

  applyDefaults() {
    const spec = {
      vm: {
        metadata: { annotations: { [OB_ANNOTATIONS.VOLUME_CLAIM_TEMPLATE]: '[]' } },
        spec:     {
          runStrategy: 'RerunOnFailure',
          template:    {
            metadata: { annotations: {} },
            spec:     {
              domain: {
                machine: { type: '' },
                cpu:     {
                  cores:   null,
                  sockets: 1,
                  threads: 1
                },
                devices: {
                  inputs: [{
                    bus:  'usb',
                    name: 'tablet',
                    type: 'tablet'
                  }],
                  interfaces: [{
                    masquerade: {},
                    model:      'virtio',
                    name:       'default'
                  }],
                  disks: [],
                },
                resources: {
                  limits: {
                    memory: null,
                    cpu:    ''
                  }
                },
                features: { acpi: { enabled: true } },
              },
              evictionStrategy: 'LiveMigrate',
              hostname:         '',
              networks:         [{
                name: 'default',
                pod:  {}
              }],
              volumes:  [],
              affinity: {},
            }
          }
        }
      }
    };

    Vue.set(this, 'spec', spec);
  }

  get canDelete() {
    return this.hasLink('remove') && this.$rootGetters['type-map/optionsFor'](this.type).isRemovable && !this.isDefaultVersion;
  }

  get template() {
    return this.$rootGetters['oneblock/all'](OB.VM_TEMPLATE).find((T) => {
      return T.id === this.spec.templateId;
    });
  }

  get isReady() {
    const conditions = get(this, 'status.conditions');
    const readyCondition = findBy(conditions, 'type', 'ready');

    // Compatibility processing
    return readyCondition ? readyCondition?.status === 'True' : true;
  }

  get stateDisplay() {
    if (this.isReady) {
      return 'Active';
    } else {
      return 'Not Ready';
    }
  }

  get stateColor() {
    const state = this.stateDisplay;

    return colorForState(state);
  }

  get version() {
    return this?.status?.version;
  }

  get templates() {
    return this.$rootGetters['oneblock/all'](OB.VM_TEMPLATE);
  }

  get machineType() {
    return this.vm?.spec?.template?.spec?.domain?.machine?.type || '';
  }

  get templateId() {
    return this.spec.templateId;
  }

  launchFromTemplate() {
    const templateResource = this.currentTemplate;
    const templateId = templateResource.id;
    const launchVersion = this.id;
    const router = this.currentRouter();

    router.push({
      name:   `${ HARVESTER_PRODUCT }-c-cluster-resource-create`,
      params: { resource: OB.VM },
      query:  { templateId, versionId: launchVersion }
    });
  }

  cloneTemplate(moreQuery = {}) {
    const location = this.detailLocation;

    location.query = {
      ...location.query,
      [MODE]: _EDIT,
      [AS]:   _UNFLAG,
      ...moreQuery
    };

    this.currentRouter().push(location);
  }

  goToViewConfig(moreQuery = {}) {
    const location = this.detailLocation;

    location.query = {
      ...location.query,
      [MODE]:     _VIEW,
      [AS]:       _CONFIG,
      templateId: this.templateId,
      ...moreQuery
    };

    this.currentRouter().push(location);
  }

  get currentTemplate() {
    return find(this.templates, (T) => T.id === this.templateId);
  }

  async setDefaultVersion(moreQuery = {}) {
    const templateResource = this.currentTemplate;

    templateResource.spec.defaultVersionId = this.id;
    await templateResource.save();
  }

  get defaultVersion() {
    const templates = this.$rootGetters['oneblock/all'](OB.VM_TEMPLATE);
    const template = templates.find((T) => this.templateId === T.id);

    return template?.status?.defaultVersion;
  }

  get isDefaultVersion() {
    return this.defaultVersion === this?.status?.version;
  }

  get customValidationRules() {
    const rules = [
      // {
      //   nullable:       false,
      //   path:           'spec.vm.spec.template.spec.domain.cpu.cores',
      //   min:            1,
      //   max:            100,
      //   required:       true,
      //   translationKey: 'harvester.fields.cpu',
      // },
      // {
      //   nullable:       false,
      //   path:           'spec.vm.spec.template.spec.domain.resources.requests.memory',
      //   required:       false,
      //   translationKey: 'harvester.fields.memory',
      // },
      // {
      //   nullable:       false,
      //   path:           'spec.vm.spec.template.spec',
      //   validators:     ['vmNetworks'],
      // },
      // {
      //   nullable:       false,
      //   path:           'spec.vm.spec',
      //   validators:     ['vmDisks:isVMTemplate'],
      // },
    ];

    return rules;
  }

  get instanceLabels() {
    const all = this.spec?.vm?.spec?.template?.metadata?.labels || {};

    return omitBy(all, (value, key) => {
      return matchesSomeRegex(key, LABELS_TO_IGNORE_REGEX);
    });
  }

  setInstanceLabels(val) {
    if ( !this.spec?.vm?.spec?.template?.metadata?.labels ) {
      set(this, 'spec.vm.spec.template.metadata.labels', {});
    }

    const all = this.spec.vm.spec.template.metadata.labels || {};
    const wasIgnored = pickBy(all, (value, key) => {
      return matchesSomeRegex(key, LABELS_TO_IGNORE_REGEX);
    });

    Vue.set(this.spec.vm.spec.template.metadata, 'labels', { ...wasIgnored, ...val });
  }
}
