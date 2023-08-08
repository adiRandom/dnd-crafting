import type { PropFunction } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";
import styles from "./styles.module.css";
import type { Rarity } from "~/models/rarity";
import { RARITIES } from "~/models/rarity";
import { HoverButton } from "../../buttons/hoverButton";
import { ITEM_TIERS } from "~/models/itemTierInfo";

export type RarityButtonGroupProps = {
    selected: Rarity | null;
    onChange$: PropFunction<(newValue: Rarity) => void>;
};

export const RarityButtonGroup = component$((props: RarityButtonGroupProps) => {
    return (
        <div class={styles.container}>
            {RARITIES.map((rarity, index) => {
                const order =
                    index === 0
                        ? "first"
                        : index === RARITIES.length - 1
                        ? "last"
                        : "middle";

                return (
                    <HoverButton
                        label={rarity.toString()}
                        key={rarity}
                        onClick$={() => props.onChange$(rarity)}
                        order={order}
                        hoverColor={ITEM_TIERS[rarity].color}
                        selected={props.selected === rarity}
                    >
                        {rarity.toString()}
                    </HoverButton>
                );
            })}
        </div>
    );
});
