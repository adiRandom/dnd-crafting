import { component$, useSignal } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import useIntroModal from "~/hooks/useIntroModal";
import styles from "./styles.module.css";
import type { Rarity } from "~/models/rarity";
import { RarityButtonGroup } from "~/components/ui/buttonGroup/rarityButtonGroup/rarityButtonGroup";
import { capitalize } from "~/lib/stringUtils";
import { PrimaryButton } from "~/components/ui/buttons/primaryButton";
import { useItemTiers } from "~/hooks/useItemTiers";

export default component$(() => {
    const location = useLocation();
    const toolName = location.params.name;
    const selectedRarity = useSignal<Rarity | null>(null);
    const itemTiers = useItemTiers();

    useIntroModal({
        title: `${capitalize(toolName)} Tool Rules`,
        content:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. \n\n\n Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. \n\n",
        button: "Start Crafting",
    });

    if (!itemTiers.value) {
        return null;
    }

    return (
        <div class={styles.main}>
            <h1 class={styles.header}>Tool: {toolName}</h1>
            <div class={styles.container}>
                <div
                    class={{
                        [styles.buttonContainer]: selectedRarity.value,
                        [styles.buttonContainerNoSelection]:
                            !selectedRarity.value,
                    }}
                >
                    <RarityButtonGroup
                        selected={selectedRarity.value}
                        onChange$={(newValue) => {
                            selectedRarity.value = newValue;
                        }}
                    ></RarityButtonGroup>
                </div>
                <div
                    class={{
                        [styles.infoContainer]: true,
                        [styles.infoContainerNoSelection]:
                            !selectedRarity.value,
                    }}
                >
                    <div class={styles.reqContainer}>
                        <h1 class={styles.infoHeader}>Requirements</h1>
                        <p class={styles.infoItem}>
                            {`Number of ingredient points: ${
                                selectedRarity.value
                                    ? itemTiers.value[selectedRarity.value]
                                          .numberOfIp
                                    : ""
                            } ${selectedRarity.value?.toString() ?? ""} IP`}
                        </p>
                        <p class={styles.infoItem}>
                            {`DC to acquire IP: ${
                                selectedRarity.value
                                    ? itemTiers.value[selectedRarity.value].dcMin
                                    : ""
                            }`}
                            {selectedRarity.value &&
                            itemTiers.value[selectedRarity.value].dcMax
                                ? "-" +
                                  itemTiers.value[
                                      selectedRarity.value
                                  ].dcMax?.toString()
                                : ""}
                        </p>
                        <p class={styles.infoItem}>{`Time to craft: ${
                            selectedRarity.value
                                ? itemTiers.value[selectedRarity.value].timeInDays
                                : ""
                        }`}</p>
                    </div>
                    <div class={styles.tagContainer}>
                        <h2 class={styles.tagHeader}>
                            Tags Available:{" "}
                            {selectedRarity.value
                                ? itemTiers.value[selectedRarity.value].tags
                                : ""}
                        </h2>
                        <PrimaryButton label="Fill Tags" onClick$={() => {}} />
                    </div>
                </div>
            </div>
        </div>
    );
});
