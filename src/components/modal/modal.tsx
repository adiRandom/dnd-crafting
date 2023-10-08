import type { PropFunction } from "@builder.io/qwik";
import {
    component$,
    createContextId,
    useComputed$,
} from "@builder.io/qwik";
import styles from "./style.module.css";
import { useCssClassNameAnimation } from "~/hooks/useCssClassNameAnimation";
import type { ModalModel } from "~/models/ModalModel";
import { useDebouncedSignal } from "~/hooks/useDebouncedSignal";
import { PrimaryButton } from "../ui/buttons/primaryButton";
import ExplainerTableView from "../table/ExplainerTableView";
import { ExplainerTable } from "~/models/explainerTable";

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
                    <div class={[backdropClassName.value, styles.backdrop]}>
                        <div class={[modalClass.value, styles.modal]}>
                            <h1 class={styles.heading}>{model.title}</h1>
                            <div class={styles.content}>
                                {model.blocks.map((block) => (
                                    <div class={styles.block} key={block.id}>
                                        {typeof block.content === "string" ? (
                                            <p
                                                class={styles.textBlock}
                                                dangerouslySetInnerHTML={(
                                                    window as any
                                                )?.marked.parse(block.content)}
                                            >
                                                {}
                                            </p>
                                        ) : (
                                            <div class={styles.tableBlock}>
                                                <ExplainerTableView
                                                    table={
                                                        block.content as ExplainerTable
                                                    }
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
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
