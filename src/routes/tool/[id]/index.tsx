import { component$, useSignal } from "@builder.io/qwik";
import { Link, routeLoader$ } from "@builder.io/qwik-city";
import useIntroModal from "~/hooks/useIntroModal";
import styles from "./styles.module.css";
import { RARITIES, Rarity } from "~/models/rarity";
import { RarityButtonGroup } from "~/components/ui/buttonGroup/rarityButtonGroup/rarityButtonGroup";
import { PrimaryButton } from "~/components/ui/buttons/primaryButton";
import {
    getExplainerForTierStage,
    getTierInfo,
    getTool,
} from "~/server/repository";
import { ModalModel } from "~/models/ModalModel";

export const useTool = routeLoader$(async (ev) => {
    const toolId = ev.params.id;
    return await getTool(parseInt(toolId));
});

export const useExplainModal = routeLoader$(async (ev) => {
    const toolId = ev.params.id;
    const explainer = await getExplainerForTierStage(parseInt(toolId));
    return explainer
        ? ({
              title: explainer.title,
              blocks: explainer.blocks.map((block) => ({
                  id: block.id,
                  content: block.content,
              })),
              button: "Continue Crafting",
          } as ModalModel)
        : ({
              title: `Tool Rules`,
              blocks: [
                  {
                      id: 0,
                      content:
                          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. \n\n\n Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. \n\n",
                  },
              ],
              button: "Continue Crafting",
          } as ModalModel);
});

export const useItemTiers = routeLoader$(async () => {
    return await getTierInfo();
});

export default component$(() => {
    const tool = useTool();
    const selectedRarity = useSignal<Rarity | null>(null);
    const itemTiers = useItemTiers();

    const modalModel = useExplainModal();

    useIntroModal(modalModel.value);

    return (
        <div class={styles.main}>
            <h1 class={styles.header}>Tool: {tool.value?.name}</h1>
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
                                    ? itemTiers.value[selectedRarity.value]
                                          .dcMin
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
                                ? itemTiers.value[selectedRarity.value]
                                      .timeInDays
                                : ""
                        } Days`}</p>
                    </div>
                    <div class={styles.tagContainer}>
                        <h2 class={styles.tagHeader}>
                            Tags Available:{" "}
                            {selectedRarity.value
                                ? itemTiers.value[selectedRarity.value].tags
                                : ""}
                        </h2>
                        <Link
                            href={`/tool/${tool.value?.id}/${RARITIES.indexOf(
                                selectedRarity.value ?? Rarity.Common
                            )}`}
                        >
                            <PrimaryButton
                                label="Fill Tags"
                                onClick$={() => {}}
                            />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
});
