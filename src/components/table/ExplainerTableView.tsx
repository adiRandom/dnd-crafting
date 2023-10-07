import { component$ } from "@builder.io/qwik";
import { ExplainerTable } from "~/models/explainerTable";
import style from "./ExplainerTableView.module.css";

export type ExplainerTableViewProps = {
    table: ExplainerTable;
};

const ExplainerTableView = component$<ExplainerTableViewProps>(({ table }) => {
    return (
        <div class={style.tableRoot}>
            <div class={style.headerContainer}>
                {table.headers.map((header) => (
                    <h2 class={style.headerCell} key={header}>
                        {header}
                    </h2>
                ))}
            </div>
            <div class={style.bodyContainer}>
                {table.rows.map((row, index) => (
                    <div class={style.row} key={index}>
                        {row.map((cell) => (
                            <p
                                class={style.cell}
                                key={cell}
                                dangerouslySetInnerHTML={(
                                    window as any
                                )?.marked.parse(cell)}
                            ></p>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
});

export default ExplainerTableView;
