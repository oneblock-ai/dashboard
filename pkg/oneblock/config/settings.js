export const OB_SETTING = {
  LOG_LEVEL:      'log-level',
  SERVER_VERSION: 'server-version',
  UI_INDEX:       'ui-index',
  UI_SOURCE:      'ui-source',
  UI_PL:          'ui-pl',
};

export const OB_ALLOWED_SETTINGS = {
  [OB_SETTING.LOG_LEVEL]: {
    kind:    'enum',
    options: ['info', 'debug', 'trace']
  },
  [OB_SETTING.VLAN]: {
    kind: 'custom', from: 'import', alias: 'vlan'
  },
  [OB_SETTING.CSI_DRIVER_CONFIG]: { kind: 'json', from: 'import' },
  'api-ui-version':               { readOnly: true },
  'auth-secret-name':             { kind: '' },
  'auth-token-max-ttl-minutes':   { kind: '' },
  [OB_SETTING.UI_INDEX]:          { kind: 'url' },
  'ray-version':                  { kind: '' },
  'server-url':                   { kind: 'url' },
  [OB_SETTING.UI_SOURCE]:         {
    kind:    'enum',
    options: ['auto', 'external', 'bundled']
  },
  'server-version':                     { kind: '' },
  'ui-pl':                              { kind: '' },
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

  [OB_SETTING.VM_TERMINATION_PERIOD]: { kind: 'string', from: 'import' },
  [OB_SETTING.NTP_SERVERS]:           {
    kind: 'json', from: 'import', canReset: true
  },
};
