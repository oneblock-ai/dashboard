<script>
import Tab from '@shell/components/Tabbed/Tab';
import SortableTable from '@shell/components/SortableTable';
import CruResource from '@shell/components/CruResource';
import UnitInput from '@shell/components/form/UnitInput';
import ResourceTabs from '@shell/components/form/ResourceTabs';
import LabeledSelect from '@shell/components/form/LabeledSelect';
import { LabeledInput } from '@components/Form/LabeledInput';
import NameNsDescription from '@shell/components/form/NameNsDescription';

import { allHash } from '@shell/utils/promise';
import { get } from '@shell/utils/object';
import { OB } from '../types';
import { STORAGE_CLASS, LONGHORN, PV } from '@shell/config/types';
import { sortBy } from '@shell/utils/sort';
import { saferDump } from '@shell/utils/create-yaml';
// import { InterfaceOption, VOLUME_DATA_SOURCE_KIND } from '../config/harvester-map';
import { _CREATE } from '@shell/config/query-params';
import CreateEditView from '@shell/mixins/create-edit-view';
// import { HCI as HCI_ANNOTATIONS } from '@pkg/harvester/config/labels-annotations';
// import { STATE, NAME, AGE, NAMESPACE } from '@shell/config/table-headers';

export default {
  name: 'NotebookEdit',

  components: {
    Tab,
    UnitInput,
    CruResource,
    SortableTable,
    ResourceTabs,
    LabeledSelect,
    LabeledInput,
    NameNsDescription,
  },

  mixins: [CreateEditView],

  async fetch() {
    const inStore = this.$store.getters['currentProduct'].inStore;

    await this.$store.dispatch(`${ inStore }/findAll`, { type: OB.NOTEBOOK });
  },

  data() {
    console.log('-----this.value', this.value);
    // const storage = this.value?.spec?.resources?.requests?.storage || null;
    // const imageId = get(this.value, `metadata.annotations."${ HCI_ANNOTATIONS.IMAGE_ID }"`);
    // const source = !imageId ? 'blank' : 'url';

    return {
      type:  '',
      image: ''
    };
  },

  created() {
    this.registerBeforeHook(this.willSave, 'willSave');
  },

  computed: {
    typeOption() {
      return [{
        label: 'JupyterLab',
        value: 'jupyter'
      }, {
        label: 'VisualStudio Code',
        value: 'code-server'
      }, {
        label: 'RStudio',
        value: 'rstudio'
      }];
    }
  },

  methods: {
    willSave() {
      this.update();
    },
    update() {
      if (this.type) {
        const labels = {
          ...this.value.metadata.labels,
          'ml.oneblock.ai/notebook-type': this.type
        };

        this.value.setLabels(labels);
      }

      // const spec = {
      //   ...this.value.spec,
      //   resources: { requests: { storage: this.storage } },
      //   storageClassName
      // };

      // this.value.setAnnotations(imageAnnotations);
      console.log('-----save', this.value);
      // this.$set(this.value, 'spec', spec);
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
              v-model="image"
              label="Image"
              :options="typeOption"
              :disabled="!isCreate"
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
              v-model="cpu"
              v-int-number
              label="CPU"
              :input-exponent="3"
              :output-modifier="true"
              :increment="1024"
              :mode="mode"
              required
              class="mb-20"
              @input="update"
            />
          </div>

          <div class="col span-6">
            <UnitInput
              v-model="memory"
              v-int-number
              label="Memory"
              :input-exponent="3"
              :output-modifier="true"
              :increment="1024"
              :mode="mode"
              required
              class="mb-20"
              @input="update"
            />
          </div>
        </div>
      </Tab>
      <!-- <Tab v-if="!isCreate" name="details" :label="t('harvester.volume.tabs.details')" :weight="2.5" class="bordered-table">
        <LabeledInput v-model="frontendDisplay" class="mb-20" :mode="mode" :disabled="true" :label="t('harvester.volume.frontend')" />
        <LabeledInput v-model="attachedNode" class="mb-20" :mode="mode" :disabled="true" :label="t('harvester.volume.attachedNode')" />
        <LabeledInput v-model="endpoint" class="mb-20" :mode="mode" :disabled="true" :label="t('harvester.volume.endpoint')" />
        <LabeledSelect
          v-model="diskTags"
          :multiple="true"
          :label="t('harvester.volume.diskTags')"
          :options="[]"
          :disabled="true"
          :mode="mode"
          class="mb-20"
        />
        <LabeledSelect
          v-model="nodeTags"
          :multiple="true"
          :label="t('harvester.volume.nodeTags')"
          :options="[]"
          :disabled="true"
          :mode="mode"
          class="mb-20"
        />
        <LabeledInput v-model="lastBackup" class="mb-20" :mode="mode" :disabled="true" :label="t('harvester.volume.lastBackup')" />
        <LabeledInput v-model="lastBackupAt" class="mb-20" :mode="mode" :disabled="true" :label="t('harvester.volume.lastBackupAt')" />
        <LabeledInput v-model="replicasNumber" class="mb-20" :mode="mode" :disabled="true" :label="t('harvester.volume.replicasNumber')" />
      </Tab>
      <Tab v-if="!isCreate" name="instances" :label="t('harvester.volume.tabs.snapshots')" :weight="2" class="bordered-table">
        <SortableTable
          v-bind="$attrs"
          :headers="snapshotHeaders"
          default-sort-by="age"
          :rows="value.relatedVolumeSnapshotCounts"
          key-field="_key"
          v-on="$listeners"
        />
      </Tab>
      <Tab v-if="!isCreate && value.spec.dataSource" name="datasource" :label="t('harvester.volume.tabs.datasource')" :weight="1" class="bordered-table">
        <LabeledInput v-model="dataSourceKind" class="mb-20" :mode="mode" :disabled="true" :label="t('harvester.volume.kind')" />
        <LabeledInput v-model="value.spec.dataSource.name" :mode="mode" :disabled="true" :label="t('nameNsDescription.name.label')" />
      </Tab> -->
    </ResourceTabs>
  </CruResource>
</template>
