import { Rarity } from "~/models/rarity";
import { useItemTiers } from "./useItemTiers";
import { useSignal, useTask$ } from "@builder.io/qwik";

export function useItemTier(rarity: Rarity | null) {
    const itemTiers = useItemTiers();
    const tier = useSignal(rarity ? itemTiers.value?.[rarity] ?? null : null);

    useTask$(({ track }) => {
        track(() => itemTiers.value);
        track(() => rarity);

        if (!itemTiers.value) {
            tier.value = null;
            return;
        }

        if (!rarity) {
            tier.value = null;
            return;
        }

        tier.value = itemTiers.value[rarity];
    });

    return tier;
}
