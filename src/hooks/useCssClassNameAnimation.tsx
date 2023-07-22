import type {
    Signal
} from "@builder.io/qwik";
import {
    useSignal,
    useVisibleTask$,
} from "@builder.io/qwik";

enum AnimationStage {
    MOUNTED,
    ENTERING,
    ENTERED,
}

type Args = {
    className: string;
    duration: number;
    isEntering?: Signal<boolean>;
    isExiting?: Signal<boolean>;
};

type Return = {
    currentClassName: Signal<string>;
};

export function useCssClassNameAnimation({
    className,
    duration,
    isEntering,
    // isExiting,
}: Args): Return {
    const currentClassName = useSignal(className + "-initial");
    const stage = useSignal(AnimationStage.MOUNTED);

    useVisibleTask$(async ({ track }) => {
        track(() => isEntering?.value);

        if (isEntering?.value) {
            currentClassName.value = className + "-entering";
            stage.value = AnimationStage.ENTERING;
        }
    });

    useVisibleTask$(({ track }) => {
        track(() => stage.value);

        if (stage.value == AnimationStage.ENTERING) {
            setTimeout(() => {
                currentClassName.value = className + "-entered";
            }, duration);
        }
    });

    return { currentClassName };
}
