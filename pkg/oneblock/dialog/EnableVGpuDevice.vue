<script>
import { mapGetters } from 'vuex';
import { Card } from '@components/Card';
import LabeledSelect from '@shell/components/form/LabeledSelect.vue';
import AsyncButton from '@shell/components/AsyncButton';
import { escapeHtml } from '@shell/utils/string';

export default {
  name: 'HarvesterEnableVGpuDevice',

  components: {
    AsyncButton,
    Card,
    LabeledSelect,
  },

  props: {
    resources: {
      type:     Array,
      required: true
    }
  },

  data() {
    return {
      type:           this.resources[0].spec?.vGPUTypeName,
      availableTypes: Object.keys(this.resources[0].status?.availableTypes || {}),
    };
  },

  computed: { ...mapGetters({ t: 'i18n/t' }) },

  methods: {
    close() {
      this.$emit('close');
    },

    async save(buttonCb) {
      const actionResource = this.resources[0];

      try {
        this.resources[0].spec.vGPUTypeName = this.type;
        this.resources[0].spec.enabled = true;
        await actionResource.save();
        buttonCb(true);
        this.close();
      } catch (err) {
        this.$store.dispatch('growl/fromError', {
          title: this.t('generic.notification.title.error', { name: escapeHtml(actionResource.metadata.name) }),
          err,
        }, { root: true });
        buttonCb(false);
      }
    }
  }
};
</script>

<template>
  <Card :show-highlight-border="false">
    <template v-slot:title>
      <h4
        v-clean-html="t('harvester.vgpu.enable.title')"
        class="text-default-text"
      />
    </template>

    <template #body>
      <div class="body">
        <div class="type-field">
          <LabeledSelect
            v-model="type"
            required
            :options="availableTypes"
            :searchable="true"
            :label="t('harvester.vgpu.enable.type')"
          />
        </div>
      </div>
    </template>

    <template v-slot:actions>
      <div class="buttons actions">
        <button class="btn role-secondary mr-10" @click="close">
          {{ t('generic.cancel') }}
        </button>

        <AsyncButton mode="edit" @click="save" />
      </div>
    </template>
  </Card>
</template>

<style lang="scss" scoped>

.body {
  display: flex;
  flex-direction: column;

  &-field {
    margin-top: 10px;
  }
}

.actions {
  width: 100%;
}

.buttons {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
</style>
