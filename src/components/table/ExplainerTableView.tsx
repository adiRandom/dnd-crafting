import { component$ } from "@builder.io/qwik";
import { ExplainerTable } from "~/models/explainerTable";
import style from "./ExplainerTableView.module.css";


export type ExplainerTableViewProps = {
    table: ExplainerTable;
    isEditing?: boolean;
};

const ExplainerTableView = component$<ExplainerTableViewProps>(
    ({ table, isEditing = false }) => {
        if (table.headers.length === 0) {
            return (
                <div class={style.emptyState}>
                    Specify the number of columns before editing the table
                </div>
            );
        }
        return (
            <div class={style.tableRoot}>
                <div class={style.headerContainer}>
                    {table.headers.map((header, index) =>
                        isEditing ? (
                            <input
                                key={index}
                                type="text"
                                placeholder="Type content"
                                class={style.headerInput}
                            />
                        ) : (
                            <h2 class={style.headerCell} key={header}>
                                {header}
                            </h2>
                        )
                    )}
                </div>
                <div class={style.bodyContainer}>
                    {table.rows.map((row, index) => (
                        <div class={style.row} key={index}>
                            {row.map((cell, cellIndex) =>
                                isEditing ? (
                                    <div
                                        key={index * row.length + cellIndex}
                                        class={style.cellInputWrapper}
                                    >
                                        <span
                                            role="textarea"
                                            contentEditable="true"
                                            placeholder="Type content"
                                            class={style.cellInput}
                                        />
                                    </div>
                                ) : (
                                    <p
                                        class={style.cell}
                                        key={cell}
                                        dangerouslySetInnerHTML={(
                                            window as any
                                        )?.marked.parse(cell)}
                                    ></p>
                                )
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }
);

export default ExplainerTableView;
