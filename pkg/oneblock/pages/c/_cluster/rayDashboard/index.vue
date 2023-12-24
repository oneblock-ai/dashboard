<script>
export default {
  layout: 'authenticated',

  components: {},

  data() {
    const dashboardUrl = `${ window.location.origin }/api/v1/namespaces/oneblock-public/services/http:public-ray-cluster-head-svc:dashboard/proxy/#/overview`;

    return { dashboardUrl };
  },
};
</script>

<template>
  <div>
    <iframe
      id="ray-dashboard"
      title="ray-dashboard"
      width="100%"
      height="100%"
      frameborder="0"
      :src="dashboardUrl"
    />
  </div>
</template>

<style lang="scss" scoped>
.main-layout .outlet {
  padding: 0px;
  height: 100px;
}

</style>
