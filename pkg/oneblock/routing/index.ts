import { RouteConfig } from 'vue-router';
import { PRODUCT_NAME } from '../config/product';

import Root from '../pages/c/_cluster/index.vue';
import ListResource from '../pages/c/_cluster/_resource/index.vue';
// import Brand from '../pages/c/_cluster/brand/index.vue';
import RayDashboard from '../pages/c/_cluster/rayDashboard/index.vue';
import CreateResource from '../pages/c/_cluster/_resource/create.vue';
import ViewResource from '../pages/c/_cluster/_resource/_id.vue';
import ViewNsResource from '../pages/c/_cluster/_resource/_namespace/_id.vue';
import DASHBOARD from '../pages/c/_cluster/dashboard/index.vue';
import Support from '../pages/c/_cluster/support/index.vue';

const routes: RouteConfig[] = [
  {
    name:      `${ PRODUCT_NAME }-c-cluster-support`,
    path:      `/:product/c/:cluster/support`,
    component: Support,
  },
  {
    name:      `${ PRODUCT_NAME }-c-cluster-raydashboard`,
    path:      `/:product/c/:cluster/raydashboard`,
    component: RayDashboard,
  },
  {
    name:      `${ PRODUCT_NAME }-c-cluster`,
    path:      `/:product/c/:cluster`,
    component: Root,
  }, {
    name:      `${ PRODUCT_NAME }-c-cluster-dashboard`,
    path:      `/:product/c/:cluster/dashboard`,
    component: DASHBOARD,
  }, {
    name:      `${ PRODUCT_NAME }-c-cluster-resource`,
    path:      `/:product/c/:cluster/:resource`,
    component: ListResource,
  }, {
    name:      `${ PRODUCT_NAME }-c-cluster-resource-create`,
    path:      `/:product/c/:cluster/:resource/create`,
    component: CreateResource,
  }, {
    name:      `${ PRODUCT_NAME }-c-cluster-resource-id`,
    path:      `/:product/c/:cluster/:resource/:id`,
    component: ViewResource,
  }, {
    name:      `${ PRODUCT_NAME }-c-cluster-resource-namespace-id`,
    path:      `/:product/c/:cluster/:resource/:namespace/:id`,
    component: ViewNsResource,
  },
];

export default routes;
