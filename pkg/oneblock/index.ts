import { importTypes } from '@rancher/auto-import';
import { IPlugin } from '@shell/core/types';
import productRoutes from './routing';
import CommonStore from './store/oneblock-common';
import store from './store/oneblock-store/index';
import customValidators from './validators';

// Init the package
export default function(plugin: IPlugin) {
  // Auto-import model, detail, edit from the folders
  importTypes(plugin);

  // Provide plugin metadata from package.json
  plugin.metadata = require('./package.json');

  plugin.addProduct(require('./config/product'));

  plugin.addRoutes(productRoutes);

  plugin.addDashboardStore(CommonStore.config.namespace, CommonStore.specifics, CommonStore.config);
  plugin.addDashboardStore(store.config.namespace, store.specifics, store.config, store.init);

  plugin.validators = customValidators;
}
