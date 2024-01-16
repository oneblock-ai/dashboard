export const OB_SETTING = {
  BACKUP_TARGET:             'backup-target',
  CONTAINERD_REGISTRY:       'containerd-registry',
  LOG_LEVEL:                 'log-level',
  SERVER_VERSION:            'server-version',
  UI_INDEX:                  'ui-index',
  UI_PLUGIN_INDEX:           'ui-plugin-index',
  UPGRADE_CHECKER_ENABLED:   'upgrade-checker-enabled',
  UPGRADE_CHECKER_URL:       'upgrade-checker-url',
  VLAN:                      'vlan',
  UI_SOURCE:                 'ui-source',
  UI_PL:                     'ui-pl',
  HTTP_PROXY:                'http-proxy',
  ADDITIONAL_CA:             'additional-ca',
  OVERCOMMIT_CONFIG:         'overcommit-config',
  CLUSTER_REGISTRATION_URL:  'cluster-registration-url',
  DEFAULT_STORAGE_CLASS:     'default-storage-class',
  SUPPORT_BUNDLE_TIMEOUT:    'support-bundle-timeout',
  SUPPORT_BUNDLE_IMAGE:      'support-bundle-image',
  STORAGE_NETWORK:           'storage-network',
  VM_FORCE_RESET_POLICY:     'vm-force-reset-policy',
  SSL_CERTIFICATES:          'ssl-certificates',
  SSL_PARAMETERS:            'ssl-parameters',
  SUPPORT_BUNDLE_NAMESPACES: 'support-bundle-namespaces',
  AUTO_DISK_PROVISION_PATHS: 'auto-disk-provision-paths',
  RELEASE_DOWNLOAD_URL:      'release-download-url',
  CCM_CSI_VERSION:           'harvester-csi-ccm-versions',
  CSI_DRIVER_CONFIG:         'csi-driver-config',
  VM_TERMINATION_PERIOD:     'default-vm-termination-grace-period-seconds',
  NTP_SERVERS:               'ntp-servers',
};

export const OB_ALLOWED_SETTINGS = {
  [OB_SETTING.BACKUP_TARGET]: {
    kind: 'json', from: 'import', canReset: true
  },
  [OB_SETTING.LOG_LEVEL]: {
    kind:    'enum',
    options: ['info', 'debug', 'trace']
  },
  [OB_SETTING.VLAN]: {
    kind: 'custom', from: 'import', alias: 'vlan'
  },
  [OB_SETTING.CSI_DRIVER_CONFIG]:       { kind: 'json', from: 'import' },
  [OB_SETTING.SERVER_VERSION]:          { readOnly: true },
  [OB_SETTING.UPGRADE_CHECKER_ENABLED]: { kind: 'boolean' },
  [OB_SETTING.UPGRADE_CHECKER_URL]:     { kind: 'url' },
  [OB_SETTING.HTTP_PROXY]:              { kind: 'json', from: 'import' },
  [OB_SETTING.ADDITIONAL_CA]:           {
    kind: 'multiline', canReset: true, from: 'import'
  },
  [OB_SETTING.OVERCOMMIT_CONFIG]:       { kind: 'json', from: 'import' },
  [OB_SETTING.SUPPORT_BUNDLE_TIMEOUT]:  {},
  [OB_SETTING.SUPPORT_BUNDLE_IMAGE]:    { kind: 'json', from: 'import' },
  [OB_SETTING.STORAGE_NETWORK]:         { kind: 'custom', from: 'import' },
  [OB_SETTING.VM_FORCE_RESET_POLICY]:   { kind: 'json', from: 'import' },
  [OB_SETTING.RANCHER_MANAGER_SUPPORT]: { kind: 'boolean' },
  [OB_SETTING.SSL_CERTIFICATES]:        { kind: 'json', from: 'import' },
  [OB_SETTING.SSL_PARAMETERS]:          {
    kind: 'json', from: 'import', canReset: true
  },
  [OB_SETTING.SUPPORT_BUNDLE_NAMESPACES]: { from: 'import', canReset: true },
  [OB_SETTING.AUTO_DISK_PROVISION_PATHS]: { canReset: true },
  [OB_SETTING.RELEASE_DOWNLOAD_URL]:      { kind: 'url' },
  [OB_SETTING.UI_PLUGIN_INDEX]:           { kind: 'url' },
  [OB_SETTING.CONTAINERD_REGISTRY]:       {
    kind: 'json', from: 'import', canReset: true
  },
  [OB_SETTING.UI_SOURCE]: {
    kind:    'enum',
    options: ['auto', 'external', 'bundled']
  },
  [OB_SETTING.UI_INDEX]:              { kind: 'url' },
  [OB_SETTING.VM_TERMINATION_PERIOD]: { kind: 'string', from: 'import' },
  [OB_SETTING.NTP_SERVERS]:           {
    kind: 'json', from: 'import', canReset: true
  },
};

export const OB_SINGLE_CLUSTER_ALLOWED_SETTING = {
  [OB_SETTING.CLUSTER_REGISTRATION_URL]: {
    kind:     'url',
    canReset: true,
  },
  [OB_SETTING.UI_PL]: {
    kind: 'custom', from: 'import', alias: 'branding'
  }
};
