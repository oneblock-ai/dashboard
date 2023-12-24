<script>
import { mapGetters } from 'vuex';
import { PLUGIN_DEVELOPER, DEV } from '@shell/store/prefs';
import BannerGraphic from '@shell/components/BannerGraphic';
import IndentedPanel from '@shell/components/IndentedPanel';
import HarvesterSupportBundle from '../../../../dialog/HarvesterSupportBundle';
import CommunityLinks from '@shell/components/CommunityLinks';
import { SCHEMA } from '@shell/config/types';
import { OB } from '../../../../types';

export default {
  layout: 'home',

  components: {
    BannerGraphic,
    IndentedPanel,
    CommunityLinks,
    HarvesterSupportBundle
  },

  data() {
    return {
      options: {
        'footer.docs':          'https://docs.1block.ai/',
        'footer.gitDiscussion': 'https://github.com/oneblock-ai/oneblock/discussions',
        'footer.discord':       'https://discord.com/invite/5BnNqC5ccB',
        'footer.issue':         'https://github.com/oneblock-ai/oneblock/issues/new/choose'
      }
    };
  },

  computed: {
    ...mapGetters(['currentCluster']),

    dev() {
      try {
        return this.$store.getters['prefs/get'](PLUGIN_DEVELOPER);
      } catch {
        return this.$store.getters['prefs/get'](DEV);
      }
    },

    title() {
      return 'oneblock.support.title';
    },

    showSupportBundle() {
      const inStore = this.$store.getters['currentProduct'].inStore;

      return !!this.$store.getters[`${ inStore }/byId`](
        SCHEMA,
        OB.SUPPORT_BUNDLE
      );
    },

    internalPrefix() {
      const host = window.location.host;
      const prefix = window.location.pathname.replace(this.$route.path, '');
      const params = this.$route?.params;

      return {
        host, prefix, params
      };
    },

    rancherLink() {
      const { host, prefix, params } = this.internalPrefix;

      return `https://${ host }${ prefix }/c/${ params.cluster }/explorer`;
    },

    longhornLink() {
      const { host, params } = this.internalPrefix;

      return `https://${ host }/k8s/clusters/${ params.cluster }/api/v1/namespaces/longhorn-system/services/http:longhorn-frontend:80/proxy/#/dashboard`;
    }
  },

  methods: {
    open() {
      this.$store.commit('oneblock-common/toggleBundleModal', true);
    }
  }
};
</script>

<template>
  <div>
    <BannerGraphic :title="t(title, {}, true)" />

    <IndentedPanel>
      <div class="content mt-20">
        <div class="promo">
          <div
            v-if="showSupportBundle"
            class="box mb-20 box-primary"
          >
            <h2>
              {{ t('oneblock.modal.bundle.title') }}
            </h2>
            <div>
              <p class="pb-10">
                {{ t('oneblock.modal.bundle.titleDescription') }}
              </p>
              <button
                class="btn role-secondary btn-sm"
                type="button"
                @click="open"
              >
                {{ t('oneblock.modal.bundle.title') }}
              </button>
            </div>
          </div>
          <div
            class="box box-primary"
            :class="{'mb-20': dev }"
          >
            <h2>
              {{ t('oneblock.support.kubeconfig.title') }}
            </h2>
            <div>
              <p class="pb-10">
                {{ t('oneblock.support.kubeconfig.titleDescription') }}
              </p>
              <button
                class="btn role-secondary btn-sm"
                type="button"
                @click="currentCluster.downloadKubeConfig()"
              >
                {{ t('oneblock.support.kubeconfig.title') }}
              </button>
            </div>
          </div>
          <div
            v-if="dev"
            class="row"
          >
            <div class="col span-6 box box-primary">
              <h2>
                <a
                  rel="nofollow noopener noreferrer"
                  target="_blank"
                  :href="rancherLink"
                >{{ t('oneblock.support.internal.rancher.title') }} <i class="icon icon-external-link" /></a>
              </h2>
              <div>
                <p class="warning">
                  <t
                    k="oneblock.support.internal.rancher.titleDescription"
                    :raw="true"
                  />
                </p>
              </div>
            </div>
            <div class="col span-6 box box-primary">
              <h2>
                <a
                  rel="nofollow noopener noreferrer"
                  target="_blank"
                  :href="longhornLink"
                >{{ t('oneblock.support.internal.longhorn.title') }} <i class="icon icon-external-link" /></a>
              </h2>
              <div>
                <p class="warning">
                  <t
                    k="oneblock.support.internal.longhorn.titleDescription"
                    :raw="true"
                  />
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="community">
          <CommunityLinks :link-options="options" />
        </div>
        <div class="external">
          <a
            href="https://1block.ai/"
            target="_blank"
            rel="noopener noreferrer nofollow"
          >{{ t('oneblock.support.community.learnMore') }}
          </a>
        </div>
      </div>
    </IndentedPanel>
    <HarvesterSupportBundle v-if="showSupportBundle" />
  </div>
</template>

<style lang="scss" scoped>
.content {
  display: grid;
  grid-column-gap: 20px;
  grid-row-gap: 20px;
  grid-template-columns: 70% 30%;
}

.only-community {
  display: grid;
  grid-template-columns: 100%;
}

.community {
  border-left: 1px solid var(--border);
  padding-left: 20px;
  > h2 {
    font-size: 18px;
    font-weight: 300;
    margin-bottom: 20px;
  }
  .support-link {
    margin: 10px 0;
  }
}

.box {
  padding: 20px;
  border: 1px solid var(--border);

  &.box-primary {
    border-color: var(--primary);
  }

  > h2 {
    font-size: 20px;
    font-weight: 300;
  }

  > div {
    font-weight: 300;
    line-height: 18px;
    opacity: 0.8;
  }
}

.role-secondary {
  &:focus {
    background-color: transparent;
  }
}

.warning {
  margin: 0 -5px 0 -5px;
  padding: 5px;
  background-color: var(--warning-banner-bg);
}
</style>
