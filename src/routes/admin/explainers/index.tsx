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
import { ExplainerTable } from "~/models/explainerTable";
import ExplainerTableView from "~/components/table/ExplainerTableView";

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

    const explainerTable = useSignal<ExplainerTable | undefined>(undefined);
    const explainerTableColumn = useSignal<number>(0);

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

    const onTableColumnCountChange = $(async (count: string) => {
        const countNumber = Number.parseInt(count);

        if (Number.isNaN(countNumber) || countNumber < 0) {
            return;
        }

        explainerTableColumn.value = countNumber;

        const currentColumns = explainerTable.value?.headers.length ?? 0;
        const diff = countNumber - currentColumns;

        if (diff === 0) {
            return;
        }

        const newTable: ExplainerTable = {
            headers: [],
            rows: [],
        };

        if (explainerTable.value !== undefined) {
            newTable.headers = explainerTable.value.headers;
            newTable.rows = explainerTable.value.rows;
        }

        if (diff > 0) {
            for (let i = 0; i < diff; i++) {
                newTable.headers.push("");
                newTable.rows.forEach((row) => {
                    row.push("");
                });
            }
        } else {
            for (let i = 0; i < -diff; i++) {
                newTable.headers.pop();
                newTable.rows.forEach((row) => {
                    row.pop();
                });
            }
        }

        explainerTable.value = newTable;
    });

    const addRow = $(async () => {
        if (explainerTable.value === undefined) {
            return;
        }
        const newTable: ExplainerTable = { ...explainerTable.value };

        const newRow: string[] = [];
        newTable.headers.forEach(() => newRow.push(""));
        newTable.rows.push(newRow);

        explainerTable.value = newTable;
    });

    const removeRow = $(async () => {
        if (explainerTable.value === undefined) {
            return;
        }
        const newTable: ExplainerTable = { ...explainerTable.value };

        newTable.rows.pop();

        explainerTable.value = newTable;
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
                        <option value={ExplainerStage.Tool}>1. Tool</option>
                        <option value={ExplainerStage.Tier}>2. Tier</option>
                        <option value={ExplainerStage.Tags}>3. Tag</option>
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

                    <p class={styles.inputLabel}>Table column number</p>
                    <input
                        class={styles.input}
                        type="text"
                        value={explainerTableColumn.value}
                        onChange$={(ev) =>
                            onTableColumnCountChange(ev.target.value)
                        }
                    />

                    {explainerTable.value && (
                        <div class={styles.tableContainer}>
                            <ExplainerTableView isEditing table={explainerTable.value} />
                        </div>
                    )}

                    {explainerTableColumn.value > 0 && (
                        <div class={styles.buttonBar}>
                            <PrimaryButton onClick$={addRow} label="Add Row" />
                            <PrimaryButton
                                class={[styles.deleteRow]}
                                onClick$={removeRow}
                                label="Remove row"
                            />
                        </div>
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
