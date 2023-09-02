import type { Rarity } from "~/models/rarity";
import { RARITIES } from "~/models/rarity";
import { useItemTiers } from "./useItemTiers";
import type { Signal } from "@builder.io/qwik";
import { useSignal, useTask$ } from "@builder.io/qwik";
import type { ItemTierInfo } from "~/models/itemTierInfo";

export function useItemTier(
    rarity: Rarity | null
): Readonly<Signal<ItemTierInfo | null>>;
export function useItemTier(
    rarityIndex: number | null
): Readonly<Signal<ItemTierInfo | null>>;
export function useItemTier(rarity: Rarity | null | number) {
    const itemTiers = useItemTiers();
    const decodedRarity = decodeRarity(rarity);
    const tier = useSignal(
        decodedRarity ? itemTiers.value?.[decodedRarity] ?? null : null
    );

    useTask$(({ track }) => {
        track(() => itemTiers.value);
        track(() => rarity);

        if (!itemTiers.value) {
            tier.value = null;
            return;
        }

        if (!decodedRarity) {
            tier.value = null;
            return;
        }

        tier.value = itemTiers.value[decodedRarity];
    });

    return tier;
}

function decodeRarity(rarity: Rarity | null | number) {
    if (rarity === null) return null;
    if (typeof rarity === "number") return RARITIES[rarity];
    return rarity;
}
