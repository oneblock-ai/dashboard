<script>
import Tab from '@shell/components/Tabbed/Tab';
import CruResource from '@shell/components/CruResource';
import UnitInput from '@shell/components/form/UnitInput';
import ResourceTabs from '@shell/components/form/ResourceTabs';
import LabeledSelect from '@shell/components/form/LabeledSelect';
import NameNsDescription from '@shell/components/form/NameNsDescription';

import { allHash } from '@shell/utils/promise';
import { OB } from '../types';
import Persistentvolumeclaim from '@pkg/oneblock/components/Persistentvolumeclaim';
import InfoBox from '@shell/components/InfoBox';
import CreateEditView from '@shell/mixins/create-edit-view';
// import { HCI as HCI_ANNOTATIONS } from '@pkg/harvester/config/labels-annotations';
// import { STATE, NAME, AGE, NAMESPACE } from '@shell/config/table-headers';

export default {
  name: 'NotebookEdit',

  components: {
    Tab,
    UnitInput,
    CruResource,
    InfoBox,
    ResourceTabs,
    Persistentvolumeclaim,
    LabeledSelect,
    NameNsDescription,
  },

  mixins: [CreateEditView],

  async fetch() {
    const inStore = this.$store.getters['currentProduct'].inStore;

    allHash({
      notebooks: this.$store.dispatch(`${ inStore }/findAll`, { type: OB.NOTEBOOK }),
      settings:  this.$store.dispatch(`${ inStore }/findAll`, { type: OB.SETTING })
    });
  },

  data() {
    const container = this.value.spec.template.spec.containers[0];
    const limits = container.resources?.limits || { cpu: '', memory: '' };
    const pvcAnnotation = JSON.parse(this.value.metadata.annotations['oneblock.ai/volumeClaimTemplates'])[0];

    const type = this.value.metadata.labels['ml.oneblock.ai/notebook-type'];

    return {
      container,
      limits,
      pvcAnnotation,
      savePvcHookName: 'savePvcHook',
      type,
    };
  },

  created() {
    this.registerBeforeHook(this.willSave, 'willSave');
  },

  computed: {
    typeOption() {
      return [{
        label: 'Jupyter Notebook',
        value: 'jupyter'
      }, {
        label: 'VisualStudio Code',
        value: 'code-server'
      }, {
        label: 'RStudio',
        value: 'rstudio'
      }];
    },

    images() {
      const imagesString = this.$store.getters['oneblock/all'](OB.SETTING).find((setting) => setting.id === 'default-notebook-images').default;
      let images = JSON.parse(imagesString);

      if (this.type) {
        return images[this.type].map((image) => {
          return {
            label: image.containerImage,
            value: image.containerImage
          };
        });
      }

      images = Object.values(images).map((containerImages) => {
        const namespaceImage = containerImages.map((image) => {
          return {
            label: image.containerImage,
            value: image.containerImage
          };
        });

        return namespaceImage;
      });

      return images.flat();
    },
  },

  methods: {
    willSave() {
      this.update();
    },

    removePvcForm(hookName) {
      this.$emit('removePvcForm', hookName);
    },

    update() {
      if (this.type === 'jupyter') {
        this.value.spec.serviceType = 'NodePort';
      } else {
        delete this.value.spec.serviceType;
      }

      if (this.type) {
        const labels = {
          ...this.value.metadata.labels,
          'ml.oneblock.ai/notebook-type': this.type
        };

        this.value.setLabels(labels);
      }

      if (this.limits.cpu) {
        this.$set(this.container.resources?.limits, 'cpu', this.limits.cpu);
      } else {
        delete this.container.resources?.limits?.cpu;
      }
      if (this.limits.memory) {
        this.$set(this.container.resources?.limits, 'memory', this.limits.memory);
      } else {
        delete this.container.resources?.limits?.memory;
      }

      const _containers = [{
        ...this.container,
        name: this.value.metadata.name
      }];

      this.$set(this.value.spec.template.spec, 'containers', _containers);

      this.value.spec.template.spec.volumes[0].persistentVolumeClaim.claimName = this.pvcAnnotation.metadata.name;

      if (!this.pvcAnnotation?.metadata?.name) {
        this.pvcAnnotation.metadata.name = this.value.metadata.name;
      }

      const annotations = {
        ...this.value.metadata.annotations,
        'oneblock.ai/volumeClaimTemplates': JSON.stringify([this.pvcAnnotation])
      };

      this.value.setAnnotations(annotations);
    },
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
      :namespaced="true"
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
        <div class="row">
          <div class="col span-6">
            <LabeledSelect
              v-model="type"
              label="Type"
              :options="typeOption"
              :disabled="!isCreate"
              required
              :mode="mode"
              class="mb-20"
              @input="update"
            />
          </div>

          <div class="col span-6">
            <LabeledSelect
              v-model="container.image"
              label="Image"
              :options="images"
              required
              :mode="mode"
              class="mb-20"
              @input="update"
            />
          </div>
        </div>

        <div class="row">
          <div class="col span-6">
            <UnitInput
              v-model="container.resources.requests.cpu"
              label="Request CPU"
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
              v-model="container.resources.requests.memory"
              label="Request Memory"
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
            <UnitInput
              v-model="limits.cpu"
              label="Limits CPU"
              suffix="C"
              :delay="0"
              positive
              :mode="mode"
              class="mb-20"
              @input="update"
            />
          </div>

          <div class="col span-6">
            <UnitInput
              v-model="limits.memory"
              label="Limits Memory"
              :input-exponent="3"
              :output-modifier="true"
              :increment="1024"
              :mode="mode"
              suffix="Gi"
              class="mb-20"
              @input="update"
            />
          </div>
        </div>
        <InfoBox>
          <Persistentvolumeclaim
            v-model="pvcAnnotation"
            :mode="mode"
            :register-before-hook="registerBeforeHook"
            :save-pvc-hook-name="savePvcHookName"
            @removePvcForm="removePvcForm"
          />
        </InfoBox>
      </Tab>
    </ResourceTabs>
  </CruResource>
</template>
