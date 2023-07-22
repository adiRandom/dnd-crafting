import { component$, useContext, useVisibleTask$ } from "@builder.io/qwik";
import { MODAL_CTX_ID } from "~/components/modal/modal";

export default component$(() => {
    const { openModal$ } = useContext(MODAL_CTX_ID);

    useVisibleTask$(() => {
        setTimeout(() => {
            openModal$({
                title: "Hello",
                content:
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. \n\n\n Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. \n\n",
                button: "Close",
            });
        }, 3000);
    });

    return (
        <>
            <div id="test"></div>
        </>
    );
});
