import { component$, useComputed$, useSignal, $ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { PrimaryButton } from "~/components/ui/buttons/primaryButton";
import { Tool } from "~/models/tool";
import {
    createTool,
    deleteTool,
    getTools,
    updateTool,
} from "~/server/repository";
import styles from "./index.module.css";

export const useTools = routeLoader$(() => getTools());

export default component$(() => {
    const initialTools = useTools();
    const tools = useSignal(
        initialTools.value.sort((a, b) =>
            a.name < b.name ? -1 : a.name > b.name ? 1 : 0
        )
    );
    const selectedTool = useSignal(null as Tool | null);
    const isEdit = useComputed$(() => !!selectedTool.value);

    const toolName = useSignal("");
    const toolEmoji = useSignal("");

    const onSubmit = $(async () => {
        if (isEdit.value) {
            const result = await updateTool({
                ...selectedTool.value!,
                name: toolName.value,
                emoji: toolEmoji.value,
            } as Tool);

            tools.value = tools.value.map((tool) =>
                tool.id === result?.id ? result! : tool
            );
        } else {
            const result = await createTool({
                name: toolName.value,
                emoji: toolEmoji.value,
                id: 0,
            });

            tools.value = [...tools.value, result].sort((a, b) =>
            a.name < b.name ? -1 : a.name > b.name ? 1 : 0
        );
        }

        selectedTool.value = null;
    });

    const onDelete = $(async () => {
        if (selectedTool.value) {
            await deleteTool(selectedTool.value.id);

            tools.value = tools.value.filter(
                (tool) => tool.id !== selectedTool.value?.id
            );
        }

        selectedTool.value = null;

        toolName.value = "";
        toolEmoji.value = "";
    });

    const onCellClick = $(async (tool: Tool) => {
        if (selectedTool.value?.id === tool.id) {
            selectedTool.value = null;

            toolName.value = "";
            toolEmoji.value = "";
            return;
        }

        selectedTool.value = tool;
        toolName.value = tool.name;
        toolEmoji.value = tool.emoji ?? "";
    });

    return (
        <div class={styles.main}>
            <h1>Tools</h1>
            <div class={styles.panes}>
                <div class={styles.leftPane}>
                    {tools.value.map((tool) => (
                        <div
                            class={{
                                [styles.cell]: true,
                                [styles.selectedCell]:
                                    selectedTool.value?.id === tool.id,
                            }}
                            key={tool.id}
                            onClick$={() => onCellClick(tool)}
                        >
                            <h2 class={styles.toolName}>
                                <span class={styles.emoji}>{tool.emoji}</span>
                                {tool.name}
                            </h2>
                        </div>
                    ))}
                </div>
                <div class={styles.rightPane}>
                    <h2>{isEdit.value ? "Edit Tool" : "Add Tool"}</h2>
                    <input
                        class={styles.input}
                        type="text"
                        value={toolName.value}
                        placeholder="Tool Name"
                        onChange$={(ev) => (toolName.value = ev.target.value)}
                    />
                    <input
                        class={styles.input}
                        type="text"
                        placeholder="Tool Emoji"
                        value={toolEmoji.value}
                        onChange$={(ev) => (toolEmoji.value = ev.target.value)}
                    />
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
