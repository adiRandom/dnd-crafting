import { useSignal, useTask$ } from "@builder.io/qwik";
import { getTierInfo } from "~/server/repository";
import { ItemTierInfo } from "~/models/itemTierInfo";
import { Rarity } from "~/models/rarity";

export function useItemTiers() {
    const tiers = useSignal<Record<Rarity, ItemTierInfo> | null>(null);
    useTask$(async () => {
        // Get item tiers
        if (tiers.value) return;

        const tierInfo = await getTierInfo();
        tiers.value = tierInfo;
    });

    return tiers;
}
