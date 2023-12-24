import SteveModel from '@shell/plugins/steve/steve-class';
import { PRODUCT_NAME } from '../config/product';
import { VIEW_IN_API, DEV } from '@shell/store/prefs';

export default class HarvesterResource extends SteveModel {
  get listLocation() {
    const name = `${ PRODUCT_NAME }-c-cluster-resource`;

    return this.$rootGetters['type-map/optionsFor'](this.type).customRoute || {
      name,
      params: {
        product:  this.$rootGetters['productId'],
        cluster:  this.$rootGetters['clusterId'],
        resource: this.type,
      },
    };
  }

  get parentLocationOverride() {
    return this.listLocation;
  }

  get doneRoute() {
    return this.listLocation.name;
  }

  get doneOverride() {
    return this.listLocation;
  }

  get _detailLocation() {
    const schema = this.$getters['schemaFor'](this.type);
    const id = this.id?.replace(/.*\//, '');
    const name = `${ PRODUCT_NAME }-c-cluster-resource${ schema?.attributes?.namespaced ? '-namespace' : '' }-id`;

    const out = {
      name,
      params: {
        product:   this.$rootGetters['productId'],
        cluster:   this.$rootGetters['clusterId'],
        resource:  this.type,
        namespace: this.metadata?.namespace,
        id,
      },
    };

    return out;
  }

  get canViewInApi() {
    try {
      return this.hasLink('self') && this.$rootGetters['prefs/get'](VIEW_IN_API);
    } catch {
      return this.hasLink('self') && this.$rootGetters['prefs/get'](DEV);
    }
  }
}
