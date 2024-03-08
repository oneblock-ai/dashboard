<script>
import Tab from '@shell/components/Tabbed/Tab';
import CruResource from '@shell/components/CruResource';
import UnitInput from '@shell/components/form/UnitInput';
import LabeledInput from '@components/Form/LabeledInput/LabeledInput.vue';
import ResourceTabs from '@shell/components/form/ResourceTabs';
import LabeledSelect from '@shell/components/form/LabeledSelect';
import NameNsDescription from '@shell/components/form/NameNsDescription';
import { Checkbox } from '@components/Form/Checkbox';

import { allHash } from '@shell/utils/promise';
import { OB } from '../types';
import CreateEditView from '@shell/mixins/create-edit-view';
import { ANNOTATIONS } from '@pkg/oneblock/config/labels-annotations';
// import { STATE, NAME, AGE, NAMESPACE } from '@shell/config/table-headers';

export default {
  name: 'QueueEdit',

  components: {
    Tab,
    UnitInput,
    CruResource,
    Checkbox,
    ResourceTabs,
    LabeledInput,
    LabeledSelect,
    NameNsDescription,
  },

  mixins: [CreateEditView],

  async fetch() {
    const inStore = this.$store.getters['currentProduct'].inStore;

    allHash({
      queue:      this.$store.dispatch(`${ inStore }/findAll`, { type: OB.QUEUE }),
      namespaces: this.$store.dispatch('oneblock/findAll', { type: OB.NAMESPACE }),
    });
  },

  data() {
    let supportedNamespaces = [];
    const annotations = this.value?.annotations || {};
    const supportedNamespacesStr = annotations[ANNOTATIONS.SUPPORTED_NAMESPACES] || '';

    if (supportedNamespacesStr) {
      supportedNamespaces = supportedNamespacesStr.split(',');
    }

    return { supportedNamespaces };
  },

  created() {
    this.registerBeforeHook(this.willSave, 'willSave');
  },

  computed: {
    namespaceOptions() {
      const namespaces = this.$store.getters['oneblock/all'](OB.NAMESPACE).map((N) => {
        const disabled = this.supportedNamespaces.includes('all');

        return {
          label: N.id,
          value: N.id,
          disabled,
        };
      });

      namespaces.unshift({
        label: 'All',
        value: 'all'
      });

      return namespaces;
    }
  },

  methods: {
    willSave() {
      this.update();
    },

    update() {
      if (this.value.spec.weight) {
        this.value.spec.weight = parseInt(this.value.spec.weight, 10);
      }
      const annotations = {
        ...this.value.metadata.annotations,
        [ANNOTATIONS.SUPPORTED_NAMESPACES]: this.supportedNamespaces.join(',')
      };

      this.value.setAnnotations(annotations);
    },
  },

  watch: {
    supportedNamespaces(neu, old) {
      if (neu.includes('all')) { // TODO
        // this.supportedNamespaces = ['all'];
      }
    }
  }
};
</script>

<template>
  <CruResource
    :done-route="doneRoute"
    :resource="value"
    :mode="mode"
    :errors="errors"
    :apply-hooks="applyHooks"
    @finish="save"
  >
    <NameNsDescription
      :value="value"
      :namespaced="false"
      :mode="mode"
    />

    <ResourceTabs
      v-model="value"
      class="mt-15"
      :need-conditions="false"
      :need-related="false"
      :side-tabs="true"
      :mode="mode"
    >
      <Tab
        name="basic"
        label="Basics"
        :weight="3"
        class="bordered-table"
      >
        <div class="row mb-20">
          <div class="col span-6">
            <LabeledSelect
              v-model="supportedNamespaces"
              :multiple="true"
              label-key="nameNsDescription.namespace.label"
              :mode="mode"
              :options="namespaceOptions"
              @input="update"
            />
          </div>

          <div class="col span-6">
            <LabeledInput
              v-model="value.spec.weight"
              v-int-number
              label="Weight"
              required
              type="number"
              :mode="mode"
              @input="update"
            />
          </div>
        </div>

        <div class="row">
          <div class="col span-6">
            <UnitInput
              v-model="value.spec.capability.cpu"
              label="Limit CPU"
              suffix="C"
              required
              :output-modifier="true"
              :mode="mode"
              class="mb-20"
              @input="update"
            />
          </div>

          <div class="col span-6">
            <UnitInput
              v-model="value.spec.capability.memory"
              label="Limit Memory"
              :input-exponent="3"
              :output-modifier="true"
              :increment="1024"
              :mode="mode"
              suffix="Gi"
              required
              class="mb-20"
              @input="update"
            />
          </div>
        </div>

        <div class="row">
          <div class="col span-6">
            <Checkbox
              v-model="value.spec.reclaimable"
              :mode="mode"
              label="Reclaimable"
              @input="update"
            />
          </div>
        </div>
      </Tab>
    </ResourceTabs>
  </cruresource>
</template>
