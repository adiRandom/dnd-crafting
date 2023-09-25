import { component$ } from "@builder.io/qwik";
import styles from "./TagDescription.module.css";
import { TagModel } from "~/models/tags";
import {marked} from "marked";

type Props = {
    tag: TagModel;
};
const TagDescription = component$((props: Props) => {
    return (
        <div class={styles.container}>
            <h1 class={styles.tagName}>{props.tag.name}</h1>
            <p
                class={styles.tagDescription}
                dangerouslySetInnerHTML={marked.parse(props.tag.description)}
            >
            </p>
        </div>
    );
});

export default TagDescription;
