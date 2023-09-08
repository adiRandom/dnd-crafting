import { component$, useSignal, $ } from "@builder.io/qwik";
import { Link, routeAction$, routeLoader$, z, zod$ } from "@builder.io/qwik-city";
import { checkPasscode as remoteCheckPasscode } from "~/server/repository";
import styles from "./admin.module.css";
import pageSyles from "./index.module.css";

export const useCheckPasscode = routeAction$(
    async (data, reqEvent) => {
        const { passcode } = data;
        const valid = await remoteCheckPasscode(passcode);
        if (valid) {
            reqEvent.cookie.set("passcode", passcode);
        } else {
            reqEvent.cookie.delete("passcode");
        }
        return { valid };
    },
    zod$({
        passcode: z.string(),
    })
);

export const useInitialPasscode = routeLoader$(async (ev) => {
    return {
        valid: await remoteCheckPasscode(ev.cookie.get("passcode")?.value ?? ""),
    };
});

export default component$(() => {
    const checkPasscode = useCheckPasscode();
    const initialPasscode = useInitialPasscode();
    const isPasscodeValid = useSignal(initialPasscode.value.valid);
    const typedPasscode = useSignal("");

    const onCheckPasscode$ = $(async () => {
        isPasscodeValid.value =
            (await checkPasscode.submit({ passcode: typedPasscode.value }))
                .value.valid ?? false;
    });
    return (
        <div class={pageSyles.main}>
            <h1>Admin Panel</h1>
            {isPasscodeValid.value ? (
                <div class={pageSyles.linkContainer}>
                    <Link class={pageSyles.link} href="/admin/tools">
                        Tools
                    </Link>
                    <Link class={pageSyles.link} href="/admin/explainers">
                        Explainers
                    </Link>
                    <Link class={pageSyles.link} href="/admin/tags">
                        Tags
                    </Link>
                    <Link class={pageSyles.link} href="/admin/tiers">
                        Tiers
                    </Link>
                </div>
            ) : (
                <div class={pageSyles.loginForm}>
                    <input
                        class={styles.input}
                        value={typedPasscode.value}
                        onChange$={(ev) =>
                            (typedPasscode.value = ev.target.value)
                        }
                        type="text"
                    />
                    <button class={styles.submit} onClick$={onCheckPasscode$}>
                        Submit
                    </button>
                </div>
            )}
        </div>
    );
});
