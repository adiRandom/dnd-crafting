import { component$, useSignal } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import useIntroModal from "~/hooks/useIntroModal";
import styles from "./styles.module.css";
import type { Rarity } from "~/models/rarity";
import { RarityButtonGroup } from "~/components/ui/buttonGroup/rarityButtonGroup/rarityButtonGroup";
import { capitalize } from "~/lib/stringUtils";

export default component$(() => {
    const location = useLocation();
    const toolName = location.params.name;
    const selectedRarity = useSignal<Rarity | null>(null);

    useIntroModal({
        title: `${capitalize(toolName)} Tool Rules`,
        content:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. \n\n\n Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. \n\n",
        button: "Start Crafting",
    });

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
                        [styles.infoContainer]: selectedRarity.value,
                        [styles.infoContainerNoSelection]:
                            !selectedRarity.value,
                    }}
                ></div>
            </div>
        </div>
    );
});
