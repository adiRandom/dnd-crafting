import { component$, useComputed$, useSignal, $ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { PrimaryButton } from "~/components/ui/buttons/primaryButton";
import { Tool } from "~/models/tool";
import {
    createExplainer,
    deleteExplainer,
    getExplainers,
    getTools,
    updateExplainer,
} from "~/server/repository";
import styles from "./index.module.css";
import {
    Explainer,
    ExplainerStage,
    explainerStageName,
    isToolExplainer,
} from "~/models/explainer";

export const useExplainers = routeLoader$(() => getExplainers());
export const useTools = routeLoader$(() => getTools());

export default component$(() => {
    const initialExplainers = useExplainers();
    const tools = useTools();
    const explainers = useSignal(initialExplainers.value);
    const selectedExplainer = useSignal(null as Explainer | null);
    const isEdit = useComputed$(() => !!selectedExplainer.value);

    const explainerTtitle = useSignal("");
    const explainerDescription = useSignal("");
    const explainerStage = useSignal(ExplainerStage.Tool);
    const explainerTool = useSignal<Tool | undefined>(tools.value[0]);

    const onSubmit = $(async () => {
        let result = null as Explainer | null;
        if (isEdit.value) {
            if (explainerStage.value === ExplainerStage.Tier) {
                result = await updateExplainer({
                    ...selectedExplainer.value!,
                    title: explainerTtitle.value,
                    text: explainerDescription.value,
                    toolId: explainerTool.value?.id,
                    stage: explainerStage.value,
                } as Explainer);
            } else {
                result = await updateExplainer({
                    ...selectedExplainer.value!,
                    title: explainerTtitle.value,
                    text: explainerDescription.value,
                    stage: explainerStage.value,
                } as Explainer);
            }

            explainers.value = explainers.value.map((explainer) =>
                explainer.id === result?.id ? result! : explainer
            );
        } else {
            if (explainerStage.value === ExplainerStage.Tier) {
                result = await createExplainer({
                    title: explainerTtitle.value,
                    text: explainerDescription.value,
                    toolId: explainerTool.value?.id,
                    stage: explainerStage.value,
                    id: 0,
                } as Explainer);
            } else {
                result = await createExplainer({
                    title: explainerTtitle.value,
                    text: explainerDescription.value,
                    stage: explainerStage.value,
                    id: 0,
                } as Explainer);
            }

            explainers.value = [...explainers.value, result!];
        }

        selectedExplainer.value = result;
    });

    const onDelete = $(async () => {
        if (selectedExplainer.value) {
            await deleteExplainer(selectedExplainer.value.id);

            explainers.value = explainers.value.filter(
                (explainer) => explainer.id !== selectedExplainer.value?.id
            );
        }

        selectedExplainer.value = null;

        explainerTtitle.value = "";
        explainerDescription.value = "";
    });

    const onCellClick = $(async (explainer: Explainer) => {

        if (selectedExplainer.value?.id === explainer.id) {
            selectedExplainer.value = null;

            explainerTtitle.value = "";
            explainerDescription.value = "";
            explainerStage.value = ExplainerStage.Tool;
            explainerTool.value = tools.value[0];
            return;
        }


        selectedExplainer.value = explainer;
        explainerTtitle.value = explainer.title;
        explainerDescription.value = explainer.text;
        explainerStage.value = explainer.stage;
        explainerTool.value = isToolExplainer(explainer)
            ? tools.value.find((tool) => tool.id === explainer.toolId)
            : undefined;
    });

    return (
        <div class={styles.main}>
            <h1>Explainers</h1>
            <div class={styles.panes}>
                <div class={styles.leftPane}>
                    {explainers.value.map((explainer) => (
                        <div
                            class={{
                                [styles.cell]: true,
                                [styles.selectedCell]:
                                    selectedExplainer.value?.id ===
                                    explainer.id,
                            }}
                            key={explainer.id}
                            onClick$={() => onCellClick(explainer)}
                        >
                            <h2 class={styles.explainerName}>
                                {explainer.title}
                            </h2>
                            <h3 class={styles.explainerStage}>
                                {explainerStageName(explainer.stage)}
                            </h3>
                        </div>
                    ))}
                </div>
                <div class={styles.rightPane}>
                    <h2>{isEdit.value ? "Edit Explainer" : "Add Explainer"}</h2>
                    <input
                        class={styles.input}
                        type="text"
                        value={explainerTtitle.value}
                        placeholder="Explainer Title"
                        onChange$={(ev) =>
                            (explainerTtitle.value = ev.target.value)
                        }
                    />
                    <textarea
                        class={styles.textArea}
                        placeholder="Explainer Text"
                        value={explainerDescription.value}
                        onChange$={(ev) =>
                            (explainerDescription.value = ev.target.value)
                        }
                    />
                    <select
                        class={styles.selectInput}
                        value={explainerStage.value}
                        onChange$={(ev) =>
                            (explainerStage.value = Number.parseInt(
                                ev.target.value
                            ) as ExplainerStage)
                        }
                    >
                        <option value={ExplainerStage.Tool}>Tool</option>
                        <option value={ExplainerStage.Tags}>Tag</option>
                        <option value={ExplainerStage.Tier}>Tier</option>
                    </select>
                    {explainerStage.value === ExplainerStage.Tier && (
                        <select
                            class={styles.selectInput}
                            value={explainerTool.value?.id}
                            onChange$={(ev) =>
                                (explainerTool.value = tools.value.find(
                                    (tool) =>
                                        tool.id ===
                                        Number.parseInt(ev.target.value)
                                ))
                            }
                        >
                            {tools.value.map((tool) => (
                                <option key={tool.id} value={tool.id}>
                                    {tool.name}
                                </option>
                            ))}
                        </select>
                    )}

                    <div class={styles.buttonBar}>
                        <PrimaryButton onClick$={onSubmit} label="Submit" />
                        <PrimaryButton
                            class={[styles.delete]}
                            onClick$={onDelete}
                            label="Delete"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});
