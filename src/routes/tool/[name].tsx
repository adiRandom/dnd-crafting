import { component$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import useIntroModal from "~/hooks/useIntroModal";

export default component$(() => {
    const location = useLocation();
    const toolName = location.params.name;

    useIntroModal({
        title: `${toolName} Tool Rules`,
        content:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. \n\n\n Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. \n\n",
        button: "Start Crafting",
    });
});
