export enum TagAvailability {
  Available = 'Available',
  NotEnoughSlots = 'Not Enough Slots',
  MiniumRarity = 'Minimum Rarity Not Met',
  FormTagMissing = 'Required Form Tag Missing',
  MutuallyExclusiveEffects = 'Mutually Exclusive Effects',
}

export type TagAvailabilityWithReason = {
  availability: TagAvailability
  reason?: string
}