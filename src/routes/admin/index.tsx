import { component$, useSignal, $ } from "@builder.io/qwik";
import { Link, routeAction$, z, zod$ } from "@builder.io/qwik-city";
import { checkPasscode as remoteCheckPasscode } from "~/server/repository";
import styles from "./admin.module.css";
import pageSyles from "./index.module.css"

export const useCheckPasscode = routeAction$(
    async (data) => {
        const { passcode } = data;
        const valid = await remoteCheckPasscode(passcode);
        return { valid };
    },
    zod$({
        passcode: z.string(),
    })
);

export default component$(() => {
    const checkPasscode = useCheckPasscode();
    const isPasscodeValid = useSignal(false);
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
