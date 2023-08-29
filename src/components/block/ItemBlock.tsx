import { component$ } from "@builder.io/qwik";
import { Rarity } from "~/models/rarity";
import { TagModel } from "~/models/tags";
import TagDescription from "./TagDescription";
import styles from "./itemBlock.module.css";

type Props = {
    rarity: Rarity;
    formTag: TagModel;
    effectTags: TagModel[];
    iconUrl: string;
};

const ItemBlock = component$((props: Props) => {
    return (
        <div id="item-card" class={styles.container}>
            <div class={styles.borderContainer}>
                <div class={styles.header}>
                    <img class={styles.icon} src={props.iconUrl} />
                    <div class={styles.headerText}>
                        <h1 class={styles.itemName}>
                            {props.formTag.itemName ?? "Item Name"}
                        </h1>
                        <h2 class={styles.rarity}>{props.rarity}</h2>
                    </div>
                </div>
                <div style={styles.tagDescription}>
                    <TagDescription tag={props.formTag} />
                </div>
                <div style={styles.tagDescription}>
                    {props.effectTags.map((tag) => (
                        <TagDescription tag={tag} />
                    ))}
                </div>
            </div>
        </div>
    );
});

export default ItemBlock;
