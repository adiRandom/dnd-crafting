import {
    component$,
    Slot,
    useContextProvider,
    useSignal,
    useStyles$,
    $,
} from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import styles from "./styles.css?inline";
import Modal, { MODAL_CTX_ID } from "~/components/modal/modal";
import { ModalModel } from "~/models/ModalModel";

export const onGet: RequestHandler = async ({ cacheControl }) => {
    // Control caching for this request for best performance and to reduce hosting costs:
    // https://qwik.builder.io/docs/caching/
    cacheControl({
        // Always serve a cached response by default, up to a week stale
        staleWhileRevalidate: 60 * 60 * 24 * 7,
        // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
        maxAge: 5,
    });
};

export default component$(() => {
    useStyles$(styles);
    const modalModel = useSignal<ModalModel | null>(null);

    const open = $((modelParam: ModalModel) => {
        modalModel.value = modelParam;
    });

    const close = $(() => {
        modalModel.value = null;
    });

    useContextProvider(MODAL_CTX_ID, {
        openModal$: open,
    });

    return (
        <>
            <main>
                <Slot />
                <Modal close$={close} model={modalModel.value} />
                <img
                    width={300}
                    height={300}
                    src="/assets/bonk.gif"
                    id="bonk-gif"
                />
            </main>
        </>
    );
});
