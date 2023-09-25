import type { PropFunction } from "@builder.io/qwik";
import {
    component$,
    createContextId,
    useStylesScoped$,
    useComputed$,
} from "@builder.io/qwik";
import styles from "./style.css?inline";
import { useCssClassNameAnimation } from "~/hooks/useCssClassNameAnimation";
import type { ModalModel } from "~/models/ModalModel";
import { useDebouncedSignal } from "~/hooks/useDebouncedSignal";
import { PrimaryButton } from "../ui/buttons/primaryButton";

export type ModalContext = {
    openModal$: PropFunction<(model: ModalModel) => void>;
};

export const MODAL_CTX_ID = createContextId<ModalContext>("modal");

const Modal = component$(
    ({
        model,
        close$,
    }: {
        model: ModalModel | null;
        close$: PropFunction<() => void>;
    }) => {
        useStylesScoped$(styles);

        const isEnteringAnimation = useComputed$(() => !!model);
        const isEnteringAnimationDelayed = useDebouncedSignal(
            isEnteringAnimation,
            100,
            false
        );
        const { currentClassName: backdropClassName } =
            useCssClassNameAnimation({
                className: "backdrop",
                duration: 500,
                isEntering: isEnteringAnimationDelayed,
            });

        const { currentClassName: modalClass } = useCssClassNameAnimation({
            className: "modal",
            duration: 700,
            isEntering: isEnteringAnimationDelayed,
        });

        return (
            <>
                {model && (
                    <div id="backdrop" class={backdropClassName.value}>
                        <div id="modal" class={modalClass.value}>
                            <h1>{model.title}</h1>
                            <div id="content">
                                <p
                                    dangerouslySetInnerHTML={(
                                        window as any
                                    )?.marked.parse(model.content)}
                                >
                                    {}
                                </p>
                            </div>
                            <PrimaryButton
                                label={model.button}
                                onClick$={() => close$()}
                            />
                        </div>
                    </div>
                )}
            </>
        );
    }
);

export default Modal;
