import { component$, $ } from "@builder.io/qwik";
import type { ButtonOptions } from "~/components/ui/buttonGroup/buttonGroup";
import { ButtonGroup } from "~/components/ui/buttonGroup/buttonGroup";
import useIntroModal from "~/hooks/useIntroModal";

export default component$(() => {
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
            href: "/tool/smithing",
        },
    ];

    useIntroModal({
        title: "Crafting Rules",
        content:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. \n\n\n Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. \n\n",
        button: "Start Crafting",
    });

    return <ButtonGroup buttons={BUTTONS} />;
});
