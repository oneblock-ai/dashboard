<script>
import Tab from '@shell/components/Tabbed/Tab';
import CruResource from '@shell/components/CruResource';
import UnitInput from '@shell/components/form/UnitInput';
import LabeledInput from '@components/Form/LabeledInput/LabeledInput.vue';
import ResourceTabs from '@shell/components/form/ResourceTabs';
import LabeledSelect from '@shell/components/form/LabeledSelect';
import NameNsDescription from '@shell/components/form/NameNsDescription';
import Persistentvolumeclaim from '@pkg/oneblock/components/Persistentvolumeclaim';
import { Checkbox } from '@components/Form/Checkbox';
import AdvancedSection from '@shell/components/AdvancedSection.vue';
import InfoBox from '@shell/components/InfoBox';

import { allHash } from '@shell/utils/promise';
import { OB } from '../types';
import CreateEditView from '@shell/mixins/create-edit-view';
import { ANNOTATIONS } from '@pkg/oneblock/config/labels-annotations';
// import { STATE, NAME, AGE, NAMESPACE } from '@shell/config/table-headers';

export default {
  name: 'MLClusterEdit',

  components: {
    Tab,
    UnitInput,
    CruResource,
    Checkbox,
    ResourceTabs,
    LabeledInput,
    LabeledSelect,
    AdvancedSection,
    InfoBox,
    Persistentvolumeclaim,
    NameNsDescription,
  },

  mixins: [CreateEditView],

  async fetch() {
    const inStore = this.$store.getters['currentProduct'].inStore;

    allHash({
      clusters: this.$store.dispatch(`${ inStore }/findAll`, { type: OB.ML_CLUSTER }),
      queues:   this.$store.dispatch(`${ inStore }/findAll`, { type: OB.QUEUE }),
    });
  },

  data() {
    const annotations = this.value?.annotations || {};
    const enableGCSFaultTolerance = annotations[ANNOTATIONS.RAY_CLUSTER_ENABLE_GCS] === 'true';

    const headGroupSpec = this.value?.spec?.headGroupSpec;
    const headGroupSpecResource = headGroupSpec?.template?.spec.containers[0]?.resources;
    const pvcAnnotation = JSON.parse(this.value.metadata.annotations['oneblock.ai/volumeClaimTemplates'])[0];

    const workerGroupSpecs = this.value?.spec?.workerGroupSpecs || [];
    const workerGroupSpecsResource = workerGroupSpecs[0]?.template?.spec.containers[0]?.resources;

    const autoscalerOptions = this.value?.spec?.autoscalerOptions;

    return {
      schedulerType:   ['volcano'],
      enableGCSFaultTolerance,
      headGroupSpecResource,
      headGroupSpec,
      pvcAnnotation,
      savePvcHookName: 'savePvcHook',
      workerGroupSpecs,
      workerGroupSpecsResource,
      autoscalerOptions,
      queueName:       ''
    };
  },

  created() {
    this.registerBeforeHook(this.willSave, 'willSave');
  },

  computed: {
    queueOption() {
      return this.$store.getters['oneblock/all'](OB.QUEUE).filter((N) => {
        const namespacesStr = N.metadata.annotations?.[ANNOTATIONS.SUPPORTED_NAMESPACES];

        // TODO, move to model
        if (namespacesStr === 'all') {
          return true;
        } else if (namespacesStr) {
          const namespaces = namespacesStr.split(',');

          return namespaces.includes(this.value.metadata.namespace);
        }

        return false;
      }).map((N) => {
        return {
          label: N.id,
          value: N.id,
        };
      });
    },

    upscalingModeOption() {
      return [{
        label: 'Conservative',
        value: 'Conservative'
      }, {
        label: 'Default',
        value: 'Default'
      }];
    },

    schedulerOption() {
      return [{
        label: 'Volcano',
        value: 'volcano'
      }];
    }
  },

  methods: {
    willSave() {
      this.update();
    },

    removePvcForm(hookName) {
      this.$emit('removePvcForm', hookName);
    },

    update() {
      // set rayVersion
      if (this.value.spec.rayVersion) {
        this.value.spec.headGroupSpec.template.spec.containers[0].image = `rayproject/ray:${ this.value.spec.rayVersion }`;
        this.value.spec.workerGroupSpecs[0].template.spec.containers[0].image = `rayproject/ray:${ this.value.spec.rayVersion }`;
      }

      if (!this.pvcAnnotation?.metadata?.name) {
        this.pvcAnnotation.metadata.name = `${ this.value.metadata.name }-log`;
      }

      const annotations = {
        ...this.value.metadata.annotations,
        [ANNOTATIONS.RAY_CLUSTER_ENABLE_GCS]: this.enableGCSFaultTolerance.toString(),
        'oneblock.ai/volumeClaimTemplates':   JSON.stringify([this.pvcAnnotation])
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
        <div class="row mb-20">
          <div class="col span-6">
            <LabeledInput
              v-model="value.spec.rayVersion"
              label="Ray Version"
              required
              :mode="mode"
              @input="update"
            />
          </div>
        </div>

        <div class="row">
          <InfoBox class="mb-0">
            <Persistentvolumeclaim
              v-model="pvcAnnotation"
              :mode="mode"
              :register-before-hook="registerBeforeHook"
              :save-pvc-hook-name="savePvcHookName"
              @removePvcForm="removePvcForm"
            />
          </InfoBox>
        </div>

        <AdvancedSection
          class="col span-12 advanced"
          :mode="mode"
        >
          <div class="row">
            <div class="col span-6">
              <UnitInput
                v-model="headGroupSpecResource.requests.cpu"
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
                v-model="headGroupSpecResource.requests.memory"
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
                v-model="headGroupSpecResource.limits.cpu"
                label="Limits CPU"
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
                v-model="headGroupSpecResource.limits.memory"
                label="Limits Memory"
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
                v-model="enableGCSFaultTolerance"
                :mode="mode"
                label="Enable GCS fault tolerance"
                @input="update"
              />
            </div>

            <div class="col span-6">
              <LabeledInput
                v-model="headGroupSpec.rayStartParams['num-cpus']"
                v-int-number
                label="Schedule on the Head Node"
                required
                type="number"
                :mode="mode"
                @input="update"
              />
            </div>
          </div>
        </AdvancedSection>
      </Tab>

      <Tab
        name="Worker"
        label="Worker"
        class="bordered-table"
      >
        <div class="row mb-20">
          <div class="col span-6">
            <LabeledInput
              v-model="workerGroupSpecs[0].minreplicas"
              v-int-number
              label="Min Replicas"
              required
              :mode="mode"
              @input="update"
            />
          </div>

          <div class="col span-6">
            <LabeledInput
              v-model="workerGroupSpecs[0].maxReplicas"
              v-int-number
              label="Max Replicas"
              required
              :mode="mode"
              @input="update"
            />
          </div>
        </div>

        <div class="row mb-20">
          <div class="col span-6">
            <LabeledInput
              v-model="workerGroupSpecs[0].groupName"
              label="groupName"
              required
              :mode="mode"
              @input="update"
            />
          </div>

          <div class="col span-6">
            <LabeledInput
              v-model="workerGroupSpecs[0].replicas"
              v-int-number
              label="Replicas"
              required
              :mode="mode"
              @input="update"
            />
          </div>
        </div>

        <AdvancedSection
          class="col span-12 advanced"
          :mode="mode"
        >
          <div class="row">
            <div class="col span-6">
              <UnitInput
                v-model="workerGroupSpecsResource.requests.cpu"
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
                v-model="workerGroupSpecsResource.requests.memory"
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
                v-model="workerGroupSpecsResource.limits.cpu"
                label="Limits CPU"
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
                v-model="workerGroupSpecsResource.limits.memory"
                label="Limits Memory"
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
        </AdvancedSection>
      </Tab>

      <Tab
        name="AdvancedConfigs"
        label="Advanced Configs"
        class="bordered-table"
        :weight="-100"
      >
        <h3>Autoscaler Options</h3>
        <div class="row mb-20">
          <div class="col span-6">
            <LabeledSelect
              v-model="autoscalerOptions.upscalingMode"
              label="Upscaling Mode"
              :options="upscalingModeOption"
              required
              :mode="mode"
              @input="update"
            />
          </div>

          <div class="col span-6">
            <UnitInput
              v-model="autoscalerOptions.idleTimeoutSeconds"
              label="Idle Timeout Seconds"
              suffix="S"
              required
              :output-modifier="true"
              :mode="mode"
              @input="update"
            />
          </div>
        </div>

        <h3>Scheduling Rules</h3>
        <div class="row mb-20">
          <div class="col span-6">
            <LabeledSelect
              v-model="schedulerType"
              label="Scheduler"
              :options="schedulerOption"
              :mode="mode"
              class="mb-20"
              :clearable="true"
              :multiple="true"
              @input="update"
            />
          </div>

          <div
            v-if="schedulerType.length"
            class="col span-6"
          >
            <LabeledSelect
              v-model="queueName"
              label="Queue"
              :options="queueOption"
              required
              :mode="mode"
              class="mb-20"
              @input="update"
            />
          </div>
        </div>
      </Tab>
    </ResourceTabs>
  </cruresource>
</template>
