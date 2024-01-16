import {
  NODE,
  CONFIG_MAP,
  NAMESPACE,
  VIRTUAL_TYPES,
  MANAGEMENT,
  PVC,
  NETWORK_ATTACHMENT,
  MONITORING,
  LOGGING,
  STORAGE_CLASS,
  SECRET
} from '@shell/config/types';
import { OB, VOLUME_SNAPSHOT } from '../types';
import {
  STATE,
  NAME_UNLINKED,
  NAME as NAME_COL,
  AGE,
  NAMESPACE as NAMESPACE_COL,
  LOGGING_OUTPUT_PROVIDERS,
  OUTPUT,
  CLUSTER_OUTPUT,
  CONFIGURED_PROVIDERS,
  SUB_TYPE,
  ADDRESS,
} from '@shell/config/table-headers';

import {
  IMAGE_DOWNLOAD_SIZE,
  FINGERPRINT,
  IMAGE_PROGRESS,
  SNAPSHOT_TARGET_VOLUME,
} from './table-headers';

import { IF_HAVE } from '@shell/store/type-map';

const TEMPLATE = OB.VM_VERSION;
const MONITORING_GROUP = 'Monitoring & Logging::Monitoring';
const LOGGING_GROUP = 'Monitoring & Logging::Logging';

export const PRODUCT_NAME = 'oneblock';

export const IP_POOL_HEADERS = [
  STATE,
  NAME_COL,
  {
    name:     'subnet',
    labelKey: 'harvester.ipPool.subnet.label',
    value:    'subnetDisplay',
  },
  {
    name:     'availableIP',
    labelKey: 'harvester.ipPool.availableIP.label',
    value:    'status.available',
  },
  AGE
];

export function init($plugin, store) {
  const {
    product,
    basicType,
    headers,
    configureType,
    virtualType,
    weightGroup,
    weightType,
  } = $plugin.DSL(store, PRODUCT_NAME);

  const isSingleVirtualCluster = process.env.rancherEnv === PRODUCT_NAME;

  if (isSingleVirtualCluster) {
    const home = {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: {
        product:  PRODUCT_NAME,
        resource: OB.DASHBOARD
      }
    };

    store.dispatch('setIsSingleProduct', {
      logo:              require(`@shell/assets/images/providers/harvester.svg`),
      productNameKey:    'harvester.productLabel',
      getVersionInfo:    (store) => store.getters[`${ PRODUCT_NAME }/byId`]?.(OB.SETTING, 'server-version')?.value || 'unknown',
      afterLoginRoute:   home,
      logoRoute:         home,
      supportCustomLogo: true
    });
  }

  product({
    inStore:               PRODUCT_NAME,
    removable:             false,
    showNamespaceFilter:   true,
    hideKubeShell:         true,
    hideKubeConfig:        true,
    showClusterSwitcher:   true,
    hideCopyConfig:        true,
    hideSystemResources:   true,
    customNamespaceFilter: true,
    typeStoreMap:          {
      [MANAGEMENT.PROJECT]:                       'management',
      [MANAGEMENT.CLUSTER_ROLE_TEMPLATE_BINDING]: 'management',
      [MANAGEMENT.PROJECT_ROLE_TEMPLATE_BINDING]: 'management'
    },
    supportRoute: { name: `${ PRODUCT_NAME }-c-cluster-support` },
    to:           {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: {
        product:  PRODUCT_NAME,
        resource: OB.DASHBOARD
      }
    },
    hideNamespaceLocation: true,
  });

  basicType([OB.DASHBOARD]);
  virtualType({
    labelKey: 'harvester.dashboard.label',
    group:    'Root',
    name:     OB.DASHBOARD,
    weight:   500,
    route:    {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: {
        product:  PRODUCT_NAME,
        resource: OB.DASHBOARD
      }
    }
  });
  configureType(OB.DASHBOARD, { showListMasthead: false });

  configureType(OB.HOST, {
    location: {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.HOST }
    },
    resource:       NODE,
    resourceDetail: OB.HOST,
    resourceEdit:   OB.HOST
  });

  configureType(OB.HOST, { isCreatable: false, isEditable: true });
  basicType([OB.HOST]);

  virtualType({
    ifHaveType: NODE,
    labelKey:   'harvester.host.label',
    group:      'Root',
    name:       OB.HOST,
    namespaced: true,
    weight:     399,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.HOST }
    },
    exact: false
  });

  // multiVirtualCluster
  basicType(['cluster-members'], 'rbac');
  virtualType({
    ifHave:     IF_HAVE.MULTI_CLUSTER,
    labelKey:   'members.clusterMembers',
    group:      'root',
    namespaced: false,
    name:       VIRTUAL_TYPES.CLUSTER_MEMBERS,
    weight:     100,
    route:      { name: `${ PRODUCT_NAME }-c-cluster-members` },
    exact:      true,
    ifHaveType: {
      type:  MANAGEMENT.CLUSTER_ROLE_TEMPLATE_BINDING,
      store: 'management'
    }
  });

  basicType([OB.VM]);
  virtualType({
    labelKey:   'harvester.virtualMachine.label',
    group:      'root',
    name:       OB.VM,
    namespaced: true,
    weight:     299,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.VM }
    },
    exact: false
  });

  basicType([OB.VOLUME]);
  configureType(OB.VOLUME, {
    location: {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.VOLUME }
    },
    resource:       PVC,
    resourceDetail: OB.VOLUME,
    resourceEdit:   OB.VOLUME
  });
  virtualType({
    labelKey:   'harvester.volume.label',
    group:      'root',
    ifHaveType: PVC,
    name:       OB.VOLUME,
    namespaced: true,
    weight:     199,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.VOLUME }
    },
    exact: false
  });

  basicType([OB.IMAGE]);
  headers(OB.IMAGE, [
    STATE,
    NAME_COL,
    NAMESPACE_COL,
    IMAGE_PROGRESS,
    IMAGE_DOWNLOAD_SIZE,
    AGE
  ]);
  virtualType({
    labelKey:   'harvester.image.label',
    group:      'root',
    name:       OB.IMAGE,
    namespaced: true,
    weight:     198,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.IMAGE }
    },
    exact: false
  });

  basicType(['projects-namespaces']);
  virtualType({
    ifHave:     IF_HAVE.MULTI_CLUSTER,
    labelKey:   'harvester.projectNamespace.label',
    group:      'root',
    namespaced: true,
    name:       'projects-namespaces',
    weight:     98,
    route:      { name: `${ PRODUCT_NAME }-c-cluster-projectsnamespaces` },
    exact:      true,
  });

  // singleVirtualCluster
  if (isSingleVirtualCluster) {
    headers(NAMESPACE, [STATE, NAME_UNLINKED, AGE]);
    basicType([NAMESPACE]);
    virtualType({
      labelKey:   'harvester.namespace.label',
      name:       NAMESPACE,
      namespaced: true,
      weight:     89,
      route:      {
        name:   `${ PRODUCT_NAME }-c-cluster-resource`,
        params: { resource: NAMESPACE }
      },
      exact: false,
    });
  }

  basicType([
    OB.ALERTMANAGERCONFIG
  ], MONITORING_GROUP);

  basicType([
    OB.CLUSTER_FLOW,
    OB.CLUSTER_OUTPUT,
    OB.FLOW,
    OB.OUTPUT,
  ], LOGGING_GROUP);

  weightGroup('Monitoring', 2, true);
  weightGroup('Logging', 1, true);

  headers(OB.ALERTMANAGERCONFIG, [
    STATE,
    NAME_COL,
    NAMESPACE_COL,
    {
      name:      'receivers',
      labelKey:  'tableHeaders.receivers',
      formatter: 'ReceiverIcons',
      value:     'name'
    },
  ]);

  configureType(OB.ALERTMANAGERCONFIG, {
    location: {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.ALERTMANAGERCONFIG },
    },
    resource:       MONITORING.ALERTMANAGERCONFIG,
    resourceDetail: OB.ALERTMANAGERCONFIG,
    resourceEdit:   OB.ALERTMANAGERCONFIG
  });

  virtualType({
    ifHaveType: MONITORING.ALERTMANAGERCONFIG,
    labelKey:   'harvester.monitoring.alertmanagerConfig.label',
    name:       OB.ALERTMANAGERCONFIG,
    namespaced: true,
    weight:     87,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.ALERTMANAGERCONFIG }
    },
    exact: false,
  });

  configureType(OB.CLUSTER_FLOW, {
    location: {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.CLUSTER_FLOW },
    },
    resource:       LOGGING.CLUSTER_FLOW,
    resourceDetail: OB.CLUSTER_FLOW,
    resourceEdit:   OB.CLUSTER_FLOW
  });

  virtualType({
    labelKey:   'harvester.logging.clusterFlow.label',
    name:       OB.CLUSTER_FLOW,
    namespaced: true,
    weight:     79,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.CLUSTER_FLOW }
    },
    exact: false,
  });

  configureType(OB.CLUSTER_OUTPUT, {
    location: {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.CLUSTER_OUTPUT },
    },
    resource:       LOGGING.CLUSTER_OUTPUT,
    resourceDetail: OB.CLUSTER_OUTPUT,
    resourceEdit:   OB.CLUSTER_OUTPUT
  });

  virtualType({
    labelKey:   'harvester.logging.clusterOutput.label',
    name:       OB.CLUSTER_OUTPUT,
    namespaced: true,
    weight:     78,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.CLUSTER_OUTPUT }
    },
    exact: false,
  });

  configureType(OB.FLOW, {
    location: {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.FLOW },
    },
    resource:       LOGGING.FLOW,
    resourceDetail: OB.FLOW,
    resourceEdit:   OB.FLOW
  });

  virtualType({
    labelKey:   'harvester.logging.flow.label',
    name:       OB.FLOW,
    namespaced: true,
    weight:     77,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.FLOW }
    },
    exact: false,
  });

  configureType(OB.OUTPUT, {
    location: {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.OUTPUT },
    },
    resource:       LOGGING.OUTPUT,
    resourceDetail: OB.OUTPUT,
    resourceEdit:   OB.OUTPUT
  });

  virtualType({
    labelKey:   'harvester.logging.output.label',
    name:       OB.OUTPUT,
    namespaced: true,
    weight:     76,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.OUTPUT }
    },
    exact: false,
  });

  headers(OB.FLOW, [STATE, NAME_COL, NAMESPACE_COL, OUTPUT, CLUSTER_OUTPUT, CONFIGURED_PROVIDERS, AGE]);
  headers(OB.OUTPUT, [STATE, NAME_COL, NAMESPACE_COL, LOGGING_OUTPUT_PROVIDERS, AGE]);
  headers(OB.CLUSTER_FLOW, [STATE, NAME_COL, NAMESPACE_COL, CLUSTER_OUTPUT, CONFIGURED_PROVIDERS, AGE]);
  headers(OB.CLUSTER_OUTPUT, [STATE, NAME_COL, NAMESPACE_COL, LOGGING_OUTPUT_PROVIDERS, AGE]);

  basicType(
    [
      OB.CLUSTER_NETWORK,
      OB.NETWORK_ATTACHMENT,
      OB.LB,
      OB.IP_POOL,
    ],
    'networks'
  );

  basicType(
    [
      OB.BACKUP,
      OB.SNAPSHOT,
      OB.VM_SNAPSHOT,
    ],
    'backupAndSnapshot'
  );

  weightGroup('networks', 300, true);
  weightType(NAMESPACE, 299, true);
  weightGroup('backupAndSnapshot', 289, true);

  basicType(
    [
      TEMPLATE,
      OB.SSH,
      OB.CLOUD_TEMPLATE,
      OB.STORAGE,
      OB.SR_IOV,
      OB.PCI_DEVICE,
      OB.SR_IOVGPU_DEVICE,
      OB.VGPU_DEVICE,
      OB.ADD_ONS,
      OB.SECRET,
      OB.SETTING
    ],
    'advanced'
  );

  configureType(OB.CLUSTER_NETWORK, {
    realResource: OB.SETTING,
    showState:    false
  });

  virtualType({
    labelKey:   'harvester.vmTemplate.label',
    group:      'root',
    name:       TEMPLATE,
    namespaced: true,
    weight:     289,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: TEMPLATE }
    },
    exact: false
  });

  configureType(OB.BACKUP, { showListMasthead: false, showConfigView: false });
  virtualType({
    labelKey:   'harvester.backup.label',
    name:       OB.BACKUP,
    namespaced: true,
    weight:     200,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.BACKUP }
    },
    exact: false
  });

  configureType(OB.VLAN_CONFIG, { hiddenNamespaceGroupButton: true });

  configureType(OB.CLUSTER_NETWORK, { showListMasthead: false });
  virtualType({
    labelKey:   'harvester.clusterNetwork.title',
    name:       OB.CLUSTER_NETWORK,
    ifHaveType: OB.CLUSTER_NETWORK,
    namespaced: false,
    weight:     189,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.CLUSTER_NETWORK }
    },
    exact: false,
  });

  configureType(OB.NETWORK_ATTACHMENT, {
    location: {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.NETWORK_ATTACHMENT }
    },
    resource:       NETWORK_ATTACHMENT,
    resourceDetail: OB.NETWORK_ATTACHMENT,
    resourceEdit:   OB.NETWORK_ATTACHMENT
  });

  virtualType({
    labelKey:   'harvester.network.label',
    name:       OB.NETWORK_ATTACHMENT,
    namespaced: true,
    weight:     188,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.NETWORK_ATTACHMENT }
    },
    exact: false
  });

  configureType(OB.SNAPSHOT, {
    isCreatable: false,
    location:    {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.SNAPSHOT },
    },
    resource:       VOLUME_SNAPSHOT,
    resourceDetail: OB.SNAPSHOT,
    resourceEdit:   OB.SNAPSHOT,
  });
  headers(OB.SNAPSHOT, [STATE, NAME_COL, NAMESPACE_COL, SNAPSHOT_TARGET_VOLUME, AGE]);
  virtualType({
    labelKey:   'harvester.snapshot.label',
    name:       OB.SNAPSHOT,
    namespaced: true,
    weight:     190,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.SNAPSHOT }
    },
    exact: false,
  });

  configureType(OB.VM_SNAPSHOT, {
    showListMasthead: false,
    location:         {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.VM_SNAPSHOT }
    },
    resource:       OB.BACKUP,
    resourceDetail: OB.VM_SNAPSHOT,
    resourceEdit:   OB.VM_SNAPSHOT
  });

  virtualType({
    labelKey:   'harvester.vmSnapshot.label',
    name:       OB.VM_SNAPSHOT,
    namespaced: true,
    weight:     191,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.VM_SNAPSHOT }
    },
    exact: false
  });

  headers(OB.SSH, [STATE, NAME_COL, NAMESPACE_COL, FINGERPRINT, AGE]);
  virtualType({
    labelKey:   'harvester.sshKey.label',
    name:       OB.SSH,
    namespaced: true,
    weight:     170,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.SSH }
    },
    exact: false
  });

  configureType(OB.CLOUD_TEMPLATE, {
    location: {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.CLOUD_TEMPLATE }
    },
    resource:       CONFIG_MAP,
    resourceDetail: OB.CLOUD_TEMPLATE,
    resourceEdit:   OB.CLOUD_TEMPLATE
  });

  virtualType({
    labelKey:   'harvester.cloudTemplate.label',
    name:       OB.CLOUD_TEMPLATE,
    namespaced: true,
    weight:     87,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.CLOUD_TEMPLATE }
    },
    exact: false
  });

  headers(OB.SECRET, [
    STATE,
    NAME_COL,
    NAMESPACE_COL,
    SUB_TYPE,
    {
      name:      'data',
      labelKey:  'tableHeaders.data',
      value:     'dataPreview',
      formatter: 'SecretData'
    },
    AGE
  ]);

  configureType(OB.SECRET, {
    location: {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.SECRET }
    },
    resource:           SECRET,
    resourceDetail:     OB.SECRET,
    resourceEdit:       OB.SECRET,
    notFilterNamespace: ['cattle-monitoring-system', 'cattle-logging-system']
  });

  virtualType({
    labelKey:   'harvester.secret.label',
    name:       OB.SECRET,
    namespaced: true,
    weight:     -999,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.SECRET }
    },
    exact: false
  });

  // settings
  configureType(OB.SETTING, { isCreatable: false });
  virtualType({
    ifHaveType: OB.SETTING,
    ifHaveVerb: 'POST',
    labelKey:   'harvester.setting.label',
    name:       OB.SETTING,
    namespaced: true,
    weight:     -1000,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.SETTING }
    },
    exact: false
  });

  configureType(OB.STORAGE, {
    location: {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.STORAGE }
    },
    resource:       STORAGE_CLASS,
    resourceDetail: OB.STORAGE,
    resourceEdit:   OB.STORAGE,
    isCreatable:    true,
  });
  virtualType({
    labelKey:   'harvester.storage.title',
    group:      'root',
    ifHaveType: STORAGE_CLASS,
    name:       OB.STORAGE,
    namespaced: false,
    weight:     79,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.STORAGE }
    },
    exact: false,
  });

  virtualType({
    label:      'PCI Devices',
    group:      'advanced',
    weight:     14,
    name:       OB.PCI_DEVICE,
    namespaced: false,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.PCI_DEVICE }
    },
    exact: false,
  });

  configureType(OB.PCI_DEVICE, {
    isCreatable:                false,
    hiddenNamespaceGroupButton: true,
    listGroups:                 [
      {
        icon:       'icon-list-grouped',
        value:      'description',
        field:      'groupByDevice',
        hideColumn: 'description',
        tooltipKey: 'resourceTable.groupBy.device'
      },
      {
        icon:       'icon-cluster',
        value:      'node',
        field:      'groupByNode',
        hideColumn: 'node',
        tooltipKey: 'resourceTable.groupBy.node'
      }
    ]
  });

  virtualType({
    ifHaveType: OB.SR_IOV,
    labelKey:   'harvester.sriov.label',
    group:      'advanced',
    weight:     15,
    name:       OB.SR_IOV,
    namespaced: false,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.SR_IOV }
    },
    exact: false
  });

  configureType(OB.SR_IOV, {
    isCreatable:                false,
    hiddenNamespaceGroupButton: true,
  });

  virtualType({
    ifHaveType: OB.SR_IOVGPU_DEVICE,
    labelKey:   'harvester.sriovgpu.label',
    group:      'advanced',
    weight:     13,
    name:       OB.SR_IOVGPU_DEVICE,
    namespaced: false,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.SR_IOVGPU_DEVICE }
    },
    exact: false,
  });

  configureType(OB.SR_IOVGPU_DEVICE, {
    isCreatable:                false,
    hiddenNamespaceGroupButton: true,
  });

  virtualType({
    labelKey:   'harvester.vgpu.label',
    group:      'advanced',
    weight:     12,
    name:       OB.VGPU_DEVICE,
    namespaced: false,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.VGPU_DEVICE }
    },
    exact: false,
  });

  configureType(OB.VGPU_DEVICE, {
    isCreatable:                false,
    hiddenNamespaceGroupButton: true,
    listGroups:                 [
      {
        icon:       'icon-cluster',
        value:      'node',
        field:      'groupByNode',
        hideColumn: 'node',
        tooltipKey: 'resourceTable.groupBy.node'
      }
    ]
  });

  configureType(OB.ADD_ONS, {
    isCreatable: false,
    isRemovable: false,
    showState:   false,
  });

  virtualType({
    label:      'Addons',
    group:      'advanced',
    name:       OB.ADD_ONS,
    ifHaveType: OB.ADD_ONS,
    weight:     -900,
    namespaced: false,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.ADD_ONS }
    },
    exact: false,
  });

  configureType(OB.LB, {
    location: {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.LB }
    },
  });
  virtualType({
    labelKey:   'harvester.loadBalancer.label',
    name:       OB.LB,
    namespaced: true,
    weight:     185,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.LB }
    },
    exact:      false,
    ifHaveType: OB.LB,
  });
  headers(OB.LB, [
    STATE,
    NAME_COL,
    {
      ...ADDRESS,
      formatter: 'HarvesterListener',
    },
    {
      name:     'workloadType',
      labelKey: 'harvester.loadBalancer.workloadType.label',
      value:    'workloadTypeDisplay',
    },
    {
      name:     'ipam',
      labelKey: 'harvester.loadBalancer.ipam.label',
      value:    'ipamDisplay',
    },
    AGE
  ]);

  configureType(OB.IP_POOL, {
    location: {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.IP_POOL }
    },
  });
  virtualType({
    labelKey:   'harvester.ipPool.label',
    name:       OB.IP_POOL,
    namespaced: false,
    weight:     184,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.IP_POOL }
    },
    exact:      false,
    ifHaveType: OB.IP_POOL,
  });
  headers(OB.IP_POOL, IP_POOL_HEADERS);
}
