<script>
import { PRODUCT_NAME } from '../../../config/product';
import { OB } from '../../../types';

export default {
  middleware({ redirect, route }) {
    return redirect({
      name:   `${ PRODUCT_NAME }-c-cluster-resource`,
      params: {
        ...route.params,
        product:  PRODUCT_NAME,
        resource: OB.DASHBOARD
      }
    });
  }
};
</script>

<template>
  <div>
    This is harvester Dashboard.
  </div>
</template>
../../../config/product
