import { OB as OB_ANNOTATIONS } from '@pkg/oneblock/config/labels-annotations';

export function parseVolumeClaimTemplates(data) {
  const volumeClaimTemplateString = data?.metadata?.annotations[OB_ANNOTATIONS.VOLUME_CLAIM_TEMPLATE];

  try {
    return JSON.parse(volumeClaimTemplateString);
  } catch (e) {
    return [];
  }
}
