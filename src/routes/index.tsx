import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import type { ButtonOptions } from "~/components/ui/buttonGroup/buttonGroup";
import { ButtonGroup } from "~/components/ui/buttonGroup/buttonGroup";
import useIntroModal from "~/hooks/useIntroModal";
import type { ModalModel } from "~/models/ModalModel";
import { ExplainerStage } from "~/models/explainer";
import { getExplainers, getTools } from "~/server/repository";

export const useExplainerModal = routeLoader$(async () => {
    const explainers = await getExplainers();
    const craftingRulesExplainer = explainers.find(
        (explainer) => explainer.stage == ExplainerStage.Tool
    );
    return craftingRulesExplainer
        ? ({
              title: craftingRulesExplainer.title,
              blocks: craftingRulesExplainer.blocks,
              button: "Start Crafting",
          } as ModalModel)
        : {
              title: "Crafting Rules",
              blocks: [
                  {
                      id: 0,
                      content:
                          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. \n\n\n Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. \n\n",
                  },
              ],
              button: "Start Crafting",
          };
});

export const useToolButtons = routeLoader$(async () => {
    const tools = await getTools();
    return tools.map(
        (tool) =>
            ({
                icon: tool.emoji,
                label: tool.name,
                href: `/tool/${tool.id}`,
            } as ButtonOptions)
    );
});

export default component$(() => {
    const modalModel = useExplainerModal();
    const buttons = useToolButtons();

    useIntroModal(modalModel.value);

    return <ButtonGroup buttons={buttons.value} />;
});
