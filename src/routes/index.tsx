import { component$, useContext, useVisibleTask$, $ } from "@builder.io/qwik";
import { MODAL_CTX_ID } from "~/components/modal/modal";
import type { ButtonOptions } from "~/components/ui/buttonGroup/buttonGroup";
import { ButtonGroup } from "~/components/ui/buttonGroup/buttonGroup";

export default component$(() => {
    const { openModal$ } = useContext(MODAL_CTX_ID);

    const BUTTONS: ButtonOptions[] = [
        {
            icon: "🧪",
            label: "Alchemy Tools",
            onClick: $(() => {}),
        },
        {
            icon: "🍪",
            label: "Cooking Tools",
            onClick: $(() => {}),
        },
        {
            icon: "🔨",
            label: "Smithing Tools",
            href: "/smithing",
        },
    ];

    useVisibleTask$(() => {
        setTimeout(() => {
            openModal$({
                title: "Crafting Rules",
                content:
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. \n\n\n Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. \n\n",
                button: "Start Crafting",
            });
        }, 3000);
    });

    return <ButtonGroup buttons={BUTTONS} />;
});
