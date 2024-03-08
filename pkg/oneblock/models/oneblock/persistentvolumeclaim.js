import Vue from 'vue';
import { _CLONE } from '@shell/config/query-params';
import pick from 'lodash/pick';
import { OB, VOLUME_SNAPSHOT } from '../../types';
import { PV, LONGHORN } from '@shell/config/types';
import { DESCRIPTION } from '@shell/config/labels-annotations';
import { ANNOTATIONS } from '@pkg/oneblock/config/labels-annotations';
import { findBy } from '@shell/utils/array';
import { get, clone } from '@shell/utils/object';
import { colorForState } from '@shell/plugins/dashboard-store/resource-class';
import HarvesterResource from '../harvester';
import { PRODUCT_NAME as HARVESTER_PRODUCT } from '../../config/product';

const DEGRADED_ERROR = 'replica scheduling failed';

export default class HciPv extends HarvesterResource {
  applyDefaults(_, realMode) {
    const accessModes = realMode === _CLONE ? this.spec.accessModes : [];
    const storage =
      realMode === _CLONE ? this.spec.resources.requests.storage : null;
    const storageClassName =
      realMode === _CLONE ? this.spec.storageClassName : '';

    Vue.set(this, 'spec', {
      accessModes,
      storageClassName,
      volumeName: '',
      resources:  { requests: { storage } }
    });
  }

  get availableActions() {
    const out = super._availableActions;
    const clone = out.find((action) => action.action === 'goToClone');

    if (clone) {
      clone.action = 'goToCloneVolume';
    }

    return [
      {
        action:  'exportImage',
        enabled: this.hasAction('export'),
        icon:    'icon icon-copy',
        label:   this.t('harvester.action.exportImage')
      },
      {
        action:  'cancelExpand',
        enabled: this.hasAction('cancelExpand'),
        icon:    'icon icon-backup',
        label:   this.t('harvester.action.cancelExpand')
      },
      {
        action:  'snapshot',
        enabled: this.hasAction('snapshot'),
        icon:    'icon icon-backup',
        label:   this.t('harvester.action.snapshot'),
      },
      ...out
    ];
  }

  exportImage(resources = this) {
    this.$dispatch('promptModal', {
      resources,
      component: 'HarvesterExportImageDialog'
    });
  }

  cancelExpand(resources = this) {
    this.doActionGrowl('cancelExpand', {});
  }

  snapshot(resources = this) {
    this.$dispatch('promptModal', {
      resources,
      component: 'SnapshotDialog'
    });
  }

  goToCloneVolume(resources = this) {
    this.$dispatch('promptModal', {
      resources,
      component: 'VolumeCloneDialog'
    });
  }

  cleanForNew() {
    this.$dispatch(`cleanForNew`, this);

    delete this.metadata.finalizers;
    const keys = [ANNOTATIONS.IMAGE_ID, DESCRIPTION];

    this.metadata.annotations = pick(this.metadata.annotations, keys);
  }

  get canUpdate() {
    return this.hasLink('update');
  }

  get stateDisplay() {
    const ownedBy = this?.metadata?.annotations?.[ANNOTATIONS.OWNED_BY];
    const volumeError = this.relatedPV?.metadata?.annotations?.[ANNOTATIONS.VOLUME_ERROR];
    const degradedVolume = volumeError === DEGRADED_ERROR;
    const status = this?.status?.phase === 'Bound' && !volumeError && this.isLonghornVolumeReady ? 'Ready' : 'Not Ready';

    const conditions = this?.status?.conditions || [];

    if (findBy(conditions, 'type', 'Resizing')?.status === 'True') {
      return 'Resizing';
    } else if (ownedBy && !volumeError) {
      return 'In-use';
    } else if (degradedVolume) {
      return 'Degraded';
    } else {
      return status;
    }
  }

  // state is similar with stateDisplay, the reason we keep this property is the status of In-use should not be displayed on vm detail page
  get state() {
    const volumeError = this.relatedPV?.metadata?.annotations?.[ANNOTATIONS.VOLUME_ERROR];
    const degradedVolume = volumeError === DEGRADED_ERROR;
    let status = this?.status?.phase === 'Bound' && !volumeError ? 'Ready' : 'Not Ready';

    const conditions = this?.status?.conditions || [];

    if (degradedVolume) {
      status = 'Degraded';
    }

    if (findBy(conditions, 'type', 'Resizing')?.status === 'True') {
      status = 'Resizing';
    }

    return status;
  }

  get stateColor() {
    const state = this.stateDisplay;

    return colorForState(state);
  }

  get stateDescription() {
    return (
      super.stateDescription
    );
  }

  get detailLocation() {
    const detailLocation = clone(this._detailLocation);

    detailLocation.params.resource = OB.VOLUME;

    return detailLocation;
  }

  get doneOverride() {
    const detailLocation = clone(this._detailLocation);

    delete detailLocation.params.namespace;
    delete detailLocation.params.id;
    detailLocation.params.resource = OB.VOLUME;
    detailLocation.name = `${ HARVESTER_PRODUCT }-c-cluster-resource`;

    return detailLocation;
  }

  get parentNameOverride() {
    return this.$rootGetters['i18n/t'](`typeLabel."${ OB.VOLUME }"`, { count: 1 }).trim();
  }

  get parentLocationOverride() {
    return this.doneOverride;
  }

  get phaseState() {
    return this.status?.phase || 'N/A';
  }

  get attachVM() {
    const allVMs = this.$rootGetters['oneblock/all'](OB.VM);
    const ownedBy =
      get(this, `metadata.annotations."${ ANNOTATIONS.OWNED_BY }"`) || '';

    if (!ownedBy) {
      return null;
    }

    const ownedId = JSON.parse(ownedBy)[0]?.refs?.[0];

    return allVMs.find((D) => D.id === ownedId);
  }

  get isAvailable() {
    const unAvailable = ['Resizing', 'Not Ready'];

    return !unAvailable.includes(this.stateDisplay);
  }

  get volumeSort() {
    const volume = this.spec?.resources?.requests?.storage || 0;

    return parseInt(volume);
  }

  get isSystemResource() {
    const systemNamespaces = this.$rootGetters['systemNamespaces'];

    if (systemNamespaces.includes(this.metadata?.namespace)) {
      return true;
    }

    return false;
  }

  get longhornVolume() {
    const inStore = this.$rootGetters['currentProduct'].inStore;

    return this.$rootGetters[`${ inStore }/all`](LONGHORN.VOLUMES).find((v) => v.metadata?.name === this.spec?.volumeName);
  }

  get longhornEngine() {
    const inStore = this.$rootGetters['currentProduct'].inStore;

    return this.$rootGetters[`${ inStore }/all`](LONGHORN.ENGINES).find((v) => v.spec?.volumeName === this.spec?.volumeName);
  }

  // https://github.com/longhorn/longhorn-manager/blob/master/api/model.go#L1151
  get isLonghornVolumeReady() {
    let ready = true;
    const longhornVolume = this.longhornVolume || {};

    const scheduledCondition = (longhornVolume?.status?.conditions || []).find((c) => c.type === 'scheduled') || {};

    if ((longhornVolume?.spec?.nodeID === '' && longhornVolume?.status?.state !== 'detached') ||
          (longhornVolume?.status?.state === 'detached' && scheduledCondition.status !== 'True') ||
          longhornVolume?.status?.robustness === 'faulted' ||
          longhornVolume?.status?.restoreRequired ||
          longhornVolume?.status?.cloneStatus?.state === 'failed'
    ) {
      ready = false;
    }

    return ready;
  }

  get relatedVolumeSnapshotCounts() {
    const snapshots = this.$rootGetters['oneblock/all'](VOLUME_SNAPSHOT);

    return snapshots.filter((snapshot) => {
      const volumeId = `${ snapshot.metadata?.namespace }/${ snapshot.spec?.source?.persistentVolumeClaimName }`;
      const kind = snapshot.metadata?.ownerReferences?.[0]?.kind;

      return volumeId === this.id && kind === 'PersistentVolumeClaim';
    });
  }

  get originalSnapshot() {
    if (this.spec?.dataSource) {
      return this.$rootGetters['oneblock/all'](VOLUME_SNAPSHOT).find((V) => V.metadata?.name === this.spec.dataSource.name);
    } else {
      return null;
    }
  }

  get source() {
    const imageId = get(this, `metadata.annotations."${ ANNOTATIONS.IMAGE_ID }"`);

    return imageId ? 'image' : 'data';
  }

  get warnDeletionMessage() {
    return this.t('harvester.volume.promptRemove.tips');
  }

  get relatedPV() {
    return this.$rootGetters['oneblock/all'](PV).find((pv) => pv.metadata?.name === this.spec?.volumeName);
  }

  get resourceExternalLink() {
    const host = window.location.host;
    const { params } = this.currentRoute();
    const volumeName = this.spec?.volumeName;

    if (!volumeName) {
      return null;
    }

    return {
      tipsKey: 'harvester.volume.externalLink.tips',
      url:     `https://${ host }/k8s/clusters/${ params.cluster }/api/v1/namespaces/longhorn-system/services/http:longhorn-frontend:80/proxy/#/volume/${ volumeName }`
    };
  }

  get customValidationRules() {
    return [
      {
        nullable:   false,
        path:       'spec.resources.requests.storage',
        required:   true,
        validators: ['volumeSize']
      },
    ];
  }
}
