import { component$, useComputed$, useSignal, $ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { PrimaryButton } from "~/components/ui/buttons/primaryButton";
import { getTierInfo, updateTierInfo } from "~/server/repository";
import styles from "./index.module.css";
import { ItemTierInfo } from "~/models/itemTierInfo";
import { Rarity } from "~/models/rarity";


export const useItemTiers = routeLoader$(() => getTierInfo());

export default component$(() => {
    const initialTierInfos = useItemTiers();
    const itemTiers = useSignal(initialTierInfos.value);
    const selectedTier = useSignal(null as ItemTierInfo | null);
    const isEdit = useComputed$(() => !!selectedTier.value);

    const tierRarity = useSignal(null as Rarity | null);
    const numberOfIp = useSignal(0);
    const minDc = useSignal(0);
    const maxDc = useSignal("");
    const timeInDays = useSignal(0);
    const colorHex = useSignal("");
    const numberOfSlots = useSignal(0);

    const onSubmit = $(async () => {
        if (isEdit.value) {
            const result = await updateTierInfo(
                {
                    timeInDays: timeInDays.value,
                    numberOfIp: numberOfIp.value,
                    dcMin: minDc.value,
                    dcMax:
                        maxDc.value === ""
                            ? undefined
                            : Number.parseInt(maxDc.value),
                    color: colorHex.value,
                    tags: numberOfSlots.value,
                },
                tierRarity.value!
            );

            itemTiers.value[tierRarity.value!] = result;
        } else {
            return;
        }

        clearForm();
    });

    const clearForm = $(() => {
        selectedTier.value = null;

        tierRarity.value = null;
        numberOfIp.value = 0;
        minDc.value = 0;
        maxDc.value = "";
        timeInDays.value = 0;
        colorHex.value = "";
        numberOfSlots.value = 0;
    });

    const onCellClick = $(async (tier: ItemTierInfo, rarity: Rarity) => {
        if (rarity === tierRarity.value) {
            clearForm();
            return;
        }

        console.log("CLicked", tier, rarity);

        selectedTier.value = tier;

        tierRarity.value = rarity;
        numberOfIp.value = tier.numberOfIp;
        minDc.value = tier.dcMin;
        maxDc.value = tier.dcMax?.toString() ?? "";
        timeInDays.value = tier.timeInDays;
        colorHex.value = tier.color;
        numberOfSlots.value = tier.tags;
    });

    return (
        <div class={styles.main}>
            <h1>Item Tiers</h1>
            <div class={styles.panes}>
                <div class={styles.leftPane}>
                    {Object.keys(itemTiers.value).map((rarityName: string) => {
                        const rarity = rarityName as Rarity;
                        const tier = itemTiers.value[rarity];

                        return (
                            <div
                                class={{
                                    [styles.cell]: true,
                                    [styles.selectedCell]:
                                        tierRarity.value === rarity,
                                }}
                                key={rarity}
                                onClick$={() => onCellClick(tier, rarity)}
                            >
                                <h2
                                    class={styles.toolName}
                                    style={{ color: tier.color }}
                                >
                                    {rarity}
                                </h2>
                            </div>
                        );
                    })}
                </div>
                <div class={styles.rightPane}>
                    {isEdit.value ? (
                        <>
                            <h2>
                                Edit Item Tier: {tierRarity.value?.toString()}
                            </h2>
                            <div class={styles.inputContainer}>
                                <p class={styles.inputLabel}>
                                    Number of IP Required
                                </p>
                                <input
                                    class={styles.input}
                                    type="text"
                                    value={numberOfIp.value}
                                    placeholder="Number of IP Required"
                                    onChange$={(ev) => {
                                        const value = Number.parseInt(
                                            ev.target.value
                                        );
                                        numberOfIp.value = isNaN(value)
                                            ? numberOfIp.value
                                            : value;
                                    }}
                                />
                                <p class={styles.inputLabel}>Minimum DC</p>
                                <input
                                    class={styles.input}
                                    type="text"
                                    value={minDc.value}
                                    placeholder="Minimum DC"
                                    onChange$={(ev) => {
                                        const value = Number.parseInt(
                                            ev.target.value
                                        );
                                        minDc.value = isNaN(value)
                                            ? minDc.value
                                            : value;
                                    }}
                                />
                                <p class={styles.inputLabel}>
                                    Maximum DC (optional)
                                </p>
                                <input
                                    class={styles.input}
                                    type="text"
                                    value={maxDc.value}
                                    placeholder="Maximum DC (optional)"
                                    onChange$={(ev) =>
                                        (maxDc.value = ev.target.value)
                                    }
                                />
                                <p class={styles.inputLabel}>Time in Days</p>
                                <input
                                    class={styles.input}
                                    type="text"
                                    value={timeInDays.value}
                                    placeholder="Time in Days"
                                    onChange$={(ev) => {
                                        const value = Number.parseInt(
                                            ev.target.value
                                        );
                                        timeInDays.value = isNaN(value)
                                            ? timeInDays.value
                                            : value;
                                    }}
                                />
                                <p class={styles.inputLabel}>
                                    Color [format: rgb(R, G, B)]
                                </p>
                                <input
                                    class={styles.input}
                                    type="text"
                                    value={colorHex.value}
                                    placeholder="Color [format: rgb(R, G, B)]"
                                    onChange$={(ev) =>
                                        (colorHex.value = ev.target.value)
                                    }
                                />
                                <p class={styles.inputLabel}>Number of Slots</p>
                                <input
                                    class={styles.input}
                                    type="text"
                                    value={numberOfSlots.value}
                                    placeholder="Number of Slots"
                                    onChange$={(ev) => {
                                        const value = Number.parseInt(
                                            ev.target.value
                                        );
                                        numberOfSlots.value = isNaN(value)
                                            ? numberOfSlots.value
                                            : value;
                                    }}
                                />
                            </div>
                            <div class={styles.buttonBar}>
                                <PrimaryButton
                                    onClick$={onSubmit}
                                    label="Submit"
                                />
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
});
