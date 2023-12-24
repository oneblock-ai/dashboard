import {
  NODE,
  MANAGEMENT,
  PVC
} from '@shell/config/types';
import { OB } from '../types';
import {
  STATE,
  NAME as NAME_COL,
  AGE,
  NAMESPACE as NAMESPACE_COL,
} from '@shell/config/table-headers';

export const PRODUCT_NAME = 'oneblock';

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

  const home = {
    name:   `${ PRODUCT_NAME }-c-cluster-dashboard`,
    params: { product: PRODUCT_NAME }
  };

  store.dispatch('setIsSingleProduct', {
    logo:              require(`@shell/assets/images/pl/oneblock.png`),
    productNameKey:    'oneblock.productLabel',
    getVersionInfo:    (store) => store.getters[`${ PRODUCT_NAME }/byId`]?.(OB.SETTING, 'server-version')?.value || 'unknown',
    afterLoginRoute:   home,
    logoRoute:         home,
    supportCustomLogo: true
  });

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

  // dashboard page
  basicType([OB.DASHBOARD]);
  virtualType({
    label:  'Dashboard',
    group:  'Root',
    name:   OB.DASHBOARD,
    weight: 100,
    route:  {
      name:   `${ PRODUCT_NAME }-c-cluster-dashboard`,
      params: { product: PRODUCT_NAME }
    },
    exact: false,
  });

  // node page
  basicType([OB.NODE]);
  configureType(OB.NODE, {
    location: {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.NODE }
    },
    resource:       NODE,
    resourceDetail: OB.NODE,
    resourceEdit:   OB.NODE
  });

  virtualType({
    ifHaveType: NODE,
    label:      'Nodes',
    group:      'Root',
    name:       OB.NODE,
    namespaced: true,
    weight:     99,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.NODE }
    },
    exact: false
  });

  // machine learning cluster page
  basicType([OB.ML_CLUSTER]);
  virtualType({
    label:      'Machine Learning Clusters',
    group:      'Root',
    name:       OB.ML_CLUSTER,
    namespaced: true,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.ML_CLUSTER }
    },
    exact: false
  });
  configureType(OB.ML_CLUSTER, {
    location: {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.ML_CLUSTER }
    },
    resource:       OB.ML_CLUSTER,
    resourceDetail: OB.ML_CLUSTER,
    resourceEdit:   OB.ML_CLUSTER
  });
  const VERSION = {
    name:  'version',
    label: 'Version',
    value: 'spec.rayVersion',
    sort:  ['rayVersion'],
  };
  const MAX_WORKERS = {
    name:  'maxWorkers',
    label: 'Max Workers',
    value: 'status.maxWorkerReplicas',
    sort:  ['status.maxWorkerReplicas'],
  };
  const DESIRED_WORKER_REPLICAS = {
    name:  'desiredWorkerReplicas',
    label: 'Current Worker Replicas',
    value: 'status.desiredWorkerReplicas',
    sort:  ['status.desiredWorkerReplicas'],
  };

  headers(OB.ML_CLUSTER, [
    STATE,
    NAME_COL,
    NAMESPACE_COL,
    VERSION,
    MAX_WORKERS,
    DESIRED_WORKER_REPLICAS,
    AGE
  ]);

  // notebook page
  basicType([OB.NOTEBOOK]);
  configureType(OB.NOTEBOOK, {
    location: {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.NOTEBOOK }
    },
    resource:       OB.NOTEBOOK,
    resourceDetail: OB.NOTEBOOK,
    resourceEdit:   OB.NOTEBOOK
  });

  virtualType({
    label:      'Notebooks',
    group:      'Root',
    name:       OB.NOTEBOOK,
    namespaced: true,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.NOTEBOOK }
    },
    exact: false
  });

  // // multiVirtualCluster
  // basicType(['cluster-members'], 'rbac');
  // virtualType({
  //   ifHave:     IF_HAVE.MULTI_CLUSTER,
  //   labelKey:   'members.clusterMembers',
  //   group:      'root',
  //   namespaced: false,
  //   name:       VIRTUAL_TYPES.CLUSTER_MEMBERS,
  //   weight:     100,
  //   route:      { name: `${ PRODUCT_NAME }-c-cluster-members` },
  //   exact:      true,
  //   ifHaveType: {
  //     type:  MANAGEMENT.CLUSTER_ROLE_TEMPLATE_BINDING,
  //     store: 'management'
  //   }
  // });

  // basicType([OB.VM]);
  // virtualType({
  //   labelKey:   'harvester.virtualMachine.label',
  //   group:      'root',
  //   name:       OB.VM,
  //   namespaced: true,
  //   weight:     299,
  //   route:      {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: OB.VM }
  //   },
  //   exact: false
  // });

  basicType([PVC]);
  configureType(PVC, {
    location: {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: PVC }
    },
    resource:       PVC,
    resourceDetail: PVC,
    resourceEdit:   PVC,
    isCreatable:    false
  });
  virtualType({
    label:      'PersistentVolumeClaims',
    group:      'root',
    ifHaveType: PVC,
    name:       PVC,
    namespaced: true,
    weight:     199,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: PVC }
    },
    exact: false
  });

  // basicType([OB.IMAGE]);
  // virtualType({
  //   labelKey:   'harvester.image.label',
  //   group:      'root',
  //   name:       OB.IMAGE,
  //   namespaced: true,
  //   weight:     198,
  //   route:      {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: OB.IMAGE }
  //   },
  //   exact: false
  // });

  // basicType([
  //   OB.ALERTMANAGERCONFIG
  // ], MONITORING_GROUP);

  // basicType([
  //   OB.CLUSTER_FLOW,
  //   OB.CLUSTER_OUTPUT,
  //   OB.FLOW,
  //   OB.OUTPUT,
  // ], LOGGING_GROUP);

  // weightGroup('Monitoring', 2, true);
  // weightGroup('Logging', 1, true);

  // headers(OB.ALERTMANAGERCONFIG, [
  //   STATE,
  //   NAME_COL,
  //   NAMESPACE_COL,
  //   {
  //     name:      'receivers',
  //     labelKey:  'tableHeaders.receivers',
  //     formatter: 'ReceiverIcons',
  //     value:     'name'
  //   },
  // ]);

  // configureType(OB.ALERTMANAGERCONFIG, {
  //   location: {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: OB.ALERTMANAGERCONFIG },
  //   },
  //   resource:       MONITORING.ALERTMANAGERCONFIG,
  //   resourceDetail: OB.ALERTMANAGERCONFIG,
  //   resourceEdit:   OB.ALERTMANAGERCONFIG
  // });

  // virtualType({
  //   ifHaveType: MONITORING.ALERTMANAGERCONFIG,
  //   labelKey:   'harvester.monitoring.alertmanagerConfig.label',
  //   name:       OB.ALERTMANAGERCONFIG,
  //   namespaced: true,
  //   weight:     87,
  //   route:      {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: OB.ALERTMANAGERCONFIG }
  //   },
  //   exact: false,
  // });

  // configureType(OB.CLUSTER_FLOW, {
  //   location: {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: OB.CLUSTER_FLOW },
  //   },
  //   resource:       LOGGING.CLUSTER_FLOW,
  //   resourceDetail: OB.CLUSTER_FLOW,
  //   resourceEdit:   OB.CLUSTER_FLOW
  // });

  // virtualType({
  //   labelKey:   'harvester.logging.clusterFlow.label',
  //   name:       OB.CLUSTER_FLOW,
  //   namespaced: true,
  //   weight:     79,
  //   route:      {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: OB.CLUSTER_FLOW }
  //   },
  //   exact: false,
  // });

  // configureType(OB.CLUSTER_OUTPUT, {
  //   location: {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: OB.CLUSTER_OUTPUT },
  //   },
  //   resource:       LOGGING.CLUSTER_OUTPUT,
  //   resourceDetail: OB.CLUSTER_OUTPUT,
  //   resourceEdit:   OB.CLUSTER_OUTPUT
  // });

  // virtualType({
  //   labelKey:   'harvester.logging.clusterOutput.label',
  //   name:       OB.CLUSTER_OUTPUT,
  //   namespaced: true,
  //   weight:     78,
  //   route:      {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: OB.CLUSTER_OUTPUT }
  //   },
  //   exact: false,
  // });

  // configureType(OB.FLOW, {
  //   location: {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: OB.FLOW },
  //   },
  //   resource:       LOGGING.FLOW,
  //   resourceDetail: OB.FLOW,
  //   resourceEdit:   OB.FLOW
  // });

  // virtualType({
  //   labelKey:   'harvester.logging.flow.label',
  //   name:       OB.FLOW,
  //   namespaced: true,
  //   weight:     77,
  //   route:      {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: OB.FLOW }
  //   },
  //   exact: false,
  // });

  // configureType(OB.OUTPUT, {
  //   location: {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: OB.OUTPUT },
  //   },
  //   resource:       LOGGING.OUTPUT,
  //   resourceDetail: OB.OUTPUT,
  //   resourceEdit:   OB.OUTPUT
  // });

  // virtualType({
  //   labelKey:   'harvester.logging.output.label',
  //   name:       OB.OUTPUT,
  //   namespaced: true,
  //   weight:     76,
  //   route:      {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: OB.OUTPUT }
  //   },
  //   exact: false,
  // });

  // headers(OB.FLOW, [STATE, NAME_COL, NAMESPACE_COL, OUTPUT, CLUSTER_OUTPUT, CONFIGURED_PROVIDERS, AGE]);
  // headers(OB.OUTPUT, [STATE, NAME_COL, NAMESPACE_COL, LOGGING_OUTPUT_PROVIDERS, AGE]);
  // headers(OB.CLUSTER_FLOW, [STATE, NAME_COL, NAMESPACE_COL, CLUSTER_OUTPUT, CONFIGURED_PROVIDERS, AGE]);
  // headers(OB.CLUSTER_OUTPUT, [STATE, NAME_COL, NAMESPACE_COL, LOGGING_OUTPUT_PROVIDERS, AGE]);

  // basicType(
  //   [
  //     OB.CLUSTER_NETWORK,
  //     OB.NETWORK_ATTACHMENT,
  //     OB.LB,
  //     OB.IP_POOL,
  //   ],
  //   'networks'
  // );

  // basicType(
  //   [
  //     OB.BACKUP,
  //     OB.SNAPSHOT,
  //     OB.VM_SNAPSHOT,
  //   ],
  //   'backupAndSnapshot'
  // );

  // weightGroup('networks', 300, true);
  // weightType(NAMESPACE, 299, true);
  // weightGroup('backupAndSnapshot', 289, true);

  // addvanced page
  basicType(
    [
      OB.ADD_ONS,
      OB.SETTING,
      PVC,
      OB.QUEUE
    ],
    'advanced'
  );

  configureType(OB.QUEUE, {
    location: {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.QUEUE }
    },
    resource:       OB.QUEUE,
    resourceDetail: OB.QUEUE,
    resourceEdit:   OB.QUEUE,
    isCreatable:    true,
  });
  virtualType({
    label:      'Queue',
    group:      'root',
    ifHaveType: OB.QUEUE,
    name:       OB.QUEUE,
    namespaced: false,
    weight:     79,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.QUEUE }
    },
    exact: false,
  });

  // addvanced => add-ons
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

  // addvanced => settings
  configureType(OB.SETTING, { isCreatable: false });
  virtualType({
    ifHaveType: OB.SETTING,
    ifHaveVerb: 'POST',
    label:      'Settings',
    name:       OB.SETTING,
    weight:     -1000,
    route:      {
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: { resource: OB.SETTING }
    },
    exact: false
  });

  // configureType(OB.CLUSTER_NETWORK, {
  //   realResource: OB.SETTING,
  //   showState:    false
  // });

  // virtualType({
  //   labelKey:   'harvester.vmTemplate.label',
  //   group:      'root',
  //   name:       TEMPLATE,
  //   namespaced: true,
  //   weight:     289,
  //   route:      {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: TEMPLATE }
  //   },
  //   exact: false
  // });

  // configureType(OB.BACKUP, { showListMasthead: false, showConfigView: false });
  // virtualType({
  //   labelKey:   'harvester.backup.label',
  //   name:       OB.BACKUP,
  //   namespaced: true,
  //   weight:     200,
  //   route:      {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: OB.BACKUP }
  //   },
  //   exact: false
  // });

  // configureType(OB.VLAN_CONFIG, { hiddenNamespaceGroupButton: true });

  // configureType(OB.CLUSTER_NETWORK, { showListMasthead: false });
  // virtualType({
  //   labelKey:   'harvester.clusterNetwork.title',
  //   name:       OB.CLUSTER_NETWORK,
  //   ifHaveType: OB.CLUSTER_NETWORK,
  //   namespaced: false,
  //   weight:     189,
  //   route:      {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: OB.CLUSTER_NETWORK }
  //   },
  //   exact: false,
  // });

  // configureType(OB.NETWORK_ATTACHMENT, {
  //   location: {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: OB.NETWORK_ATTACHMENT }
  //   },
  //   resource:       NETWORK_ATTACHMENT,
  //   resourceDetail: OB.NETWORK_ATTACHMENT,
  //   resourceEdit:   OB.NETWORK_ATTACHMENT
  // });

  // virtualType({
  //   labelKey:   'harvester.network.label',
  //   name:       OB.NETWORK_ATTACHMENT,
  //   namespaced: true,
  //   weight:     188,
  //   route:      {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: OB.NETWORK_ATTACHMENT }
  //   },
  //   exact: false
  // });

  // configureType(OB.SNAPSHOT, {
  //   isCreatable: false,
  //   location:    {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: OB.SNAPSHOT },
  //   },
  //   resource:       VOLUME_SNAPSHOT,
  //   resourceDetail: OB.SNAPSHOT,
  //   resourceEdit:   OB.SNAPSHOT,
  // });
  // headers(OB.SNAPSHOT, [STATE, NAME_COL, NAMESPACE_COL, SNAPSHOT_TARGET_VOLUME, AGE]);
  // virtualType({
  //   labelKey:   'harvester.snapshot.label',
  //   name:       OB.SNAPSHOT,
  //   namespaced: true,
  //   weight:     190,
  //   route:      {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: OB.SNAPSHOT }
  //   },
  //   exact: false,
  // });

  // configureType(OB.VM_SNAPSHOT, {
  //   showListMasthead: false,
  //   location:         {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: OB.VM_SNAPSHOT }
  //   },
  //   resource:       OB.BACKUP,
  //   resourceDetail: OB.VM_SNAPSHOT,
  //   resourceEdit:   OB.VM_SNAPSHOT
  // });

  // virtualType({
  //   labelKey:   'harvester.vmSnapshot.label',
  //   name:       OB.VM_SNAPSHOT,
  //   namespaced: true,
  //   weight:     191,
  //   route:      {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: OB.VM_SNAPSHOT }
  //   },
  //   exact: false
  // });

  // headers(OB.SSH, [STATE, NAME_COL, NAMESPACE_COL, FINGERPRINT, AGE]);
  // virtualType({
  //   labelKey:   'harvester.sshKey.label',
  //   name:       OB.SSH,
  //   namespaced: true,
  //   weight:     170,
  //   route:      {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: OB.SSH }
  //   },
  //   exact: false
  // });

  // configureType(OB.CLOUD_TEMPLATE, {
  //   location: {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: OB.CLOUD_TEMPLATE }
  //   },
  //   resource:       CONFIG_MAP,
  //   resourceDetail: OB.CLOUD_TEMPLATE,
  //   resourceEdit:   OB.CLOUD_TEMPLATE
  // });

  // virtualType({
  //   labelKey:   'harvester.cloudTemplate.label',
  //   name:       OB.CLOUD_TEMPLATE,
  //   namespaced: true,
  //   weight:     87,
  //   route:      {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: OB.CLOUD_TEMPLATE }
  //   },
  //   exact: false
  // });

  // headers(OB.SECRET, [
  //   STATE,
  //   NAME_COL,
  //   NAMESPACE_COL,
  //   SUB_TYPE,
  //   {
  //     name:      'data',
  //     labelKey:  'tableHeaders.data',
  //     value:     'dataPreview',
  //     formatter: 'SecretData'
  //   },
  //   AGE
  // ]);

  // configureType(OB.SECRET, {
  //   location: {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: OB.SECRET }
  //   },
  //   resource:           SECRET,
  //   resourceDetail:     OB.SECRET,
  //   resourceEdit:       OB.SECRET,
  //   notFilterNamespace: ['cattle-monitoring-system', 'cattle-logging-system']
  // });

  // virtualType({
  //   labelKey:   'harvester.secret.label',
  //   name:       OB.SECRET,
  //   namespaced: true,
  //   weight:     -999,
  //   route:      {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: OB.SECRET }
  //   },
  //   exact: false
  // });

  // settings

  // virtualType({
  //   label:      'PCI Devices',
  //   group:      'advanced',
  //   weight:     14,
  //   name:       OB.PCI_DEVICE,
  //   namespaced: false,
  //   route:      {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: OB.PCI_DEVICE }
  //   },
  //   exact: false,
  // });

  // configureType(OB.PCI_DEVICE, {
  //   isCreatable:                false,
  //   hiddenNamespaceGroupButton: true,
  //   listGroups:                 [
  //     {
  //       icon:       'icon-list-grouped',
  //       value:      'description',
  //       field:      'groupByDevice',
  //       hideColumn: 'description',
  //       tooltipKey: 'resourceTable.groupBy.device'
  //     },
  //     {
  //       icon:       'icon-cluster',
  //       value:      'node',
  //       field:      'groupByNode',
  //       hideColumn: 'node',
  //       tooltipKey: 'resourceTable.groupBy.node'
  //     }
  //   ]
  // });

  // virtualType({
  //   ifHaveType: OB.SR_IOV,
  //   labelKey:   'harvester.sriov.label',
  //   group:      'advanced',
  //   weight:     15,
  //   name:       OB.SR_IOV,
  //   namespaced: false,
  //   route:      {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: OB.SR_IOV }
  //   },
  //   exact: false
  // });

  // configureType(OB.SR_IOV, {
  //   isCreatable:                false,
  //   hiddenNamespaceGroupButton: true,
  // });

  // virtualType({
  //   ifHaveType: OB.SR_IOVGPU_DEVICE,
  //   labelKey:   'harvester.sriovgpu.label',
  //   group:      'advanced',
  //   weight:     13,
  //   name:       OB.SR_IOVGPU_DEVICE,
  //   namespaced: false,
  //   route:      {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: OB.SR_IOVGPU_DEVICE }
  //   },
  //   exact: false,
  // });

  // configureType(OB.SR_IOVGPU_DEVICE, {
  //   isCreatable:                false,
  //   hiddenNamespaceGroupButton: true,
  // });

  // virtualType({
  //   labelKey:   'harvester.vgpu.label',
  //   group:      'advanced',
  //   weight:     12,
  //   name:       OB.VGPU_DEVICE,
  //   namespaced: false,
  //   route:      {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: OB.VGPU_DEVICE }
  //   },
  //   exact: false,
  // });

  // configureType(OB.VGPU_DEVICE, {
  //   isCreatable:                false,
  //   hiddenNamespaceGroupButton: true,
  //   listGroups:                 [
  //     {
  //       icon:       'icon-cluster',
  //       value:      'node',
  //       field:      'groupByNode',
  //       hideColumn: 'node',
  //       tooltipKey: 'resourceTable.groupBy.node'
  //     }
  //   ]
  // });

  // configureType(OB.LB, {
  //   location: {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: OB.LB }
  //   },
  // });
  // virtualType({
  //   labelKey:   'harvester.loadBalancer.label',
  //   name:       OB.LB,
  //   namespaced: true,
  //   weight:     185,
  //   route:      {
  //     name:   `${ PRODUCT_NAME }-c-cluster-resource`,
  //     params: { resource: OB.LB }
  //   },
  //   exact:      false,
  //   ifHaveType: OB.LB,
  // });
  // headers(OB.LB, [
  //   STATE,
  //   NAME_COL,
  //   {
  //     ...ADDRESS,
  //     formatter: 'HarvesterListener',
  //   },
  //   {
  //     name:     'workloadType',
  //     labelKey: 'harvester.loadBalancer.workloadType.label',
  //     value:    'workloadTypeDisplay',
  //   },
  //   {
  //     name:     'ipam',
  //     labelKey: 'harvester.loadBalancer.ipam.label',
  //     value:    'ipamDisplay',
  //   },
  //   AGE
  // ]);
}
