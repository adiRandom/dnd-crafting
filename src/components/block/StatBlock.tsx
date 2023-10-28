import { component$ } from "@builder.io/qwik";
import styles from "./StatBlock.module.css";

interface Ability {
    title: string;
    description: string;
}

interface StatBlockProps {
    name: string;
    type: string;
    AC: number;
    HP: number;
    speed: string;
    stats: {
        str: number;
        dex: number;
        con: number;
        int: number;
        wis: number;
        cha: number;
    };
    abilities: Ability[];
}

const getModifier = (stat: number): string => {
    const modifier = Math.floor((stat - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

const StatBlock = component$<StatBlockProps>(
    ({ name, type, AC, HP, speed, stats, abilities }: StatBlockProps) => (
        <div class={styles.statblock}>
            <h1>{name}</h1>
            <p class={styles.creatureType}> {type}</p>
            <p>
                <strong>Armor Class</strong> {AC}
            </p>
            <p>
                <strong>Hit Point</strong> {HP}
            </p>
            <p>
                <strong>Speed</strong> {speed}
            </p>
            <div class={styles.statline}>
                <div class={styles.statItem}>
                    <p>
                        <strong>STR</strong>
                    </p>
                    <p>
                        {stats.str} ({getModifier(stats.str)})
                    </p>
                </div>
                <div class={styles.statItem}>
                    <p>
                        <strong>DEX</strong>
                    </p>
                    <p>
                        {stats.dex} ({getModifier(stats.dex)})
                    </p>
                </div>
                <div class={styles.statItem}>
                    <p>
                        <strong>CON</strong>
                    </p>
                    <p>
                        {stats.con} ({getModifier(stats.con)})
                    </p>
                </div>
                <div class={styles.statItem}>
                    <p>
                        <strong>INT</strong>
                    </p>
                    <p>
                        {stats.int} ({getModifier(stats.int)})
                    </p>
                </div>
                <div class={styles.statItem}>
                    <p>
                        <strong>WIS</strong>
                    </p>
                    <p>
                        {stats.wis} ({getModifier(stats.wis)})
                    </p>
                </div>
                <div class={styles.statItem}>
                    <p>
                        <strong>CHA</strong>
                    </p>
                    <p>
                        {stats.cha} ({getModifier(stats.cha)})
                    </p>
                </div>
            </div>
            <div class={styles.abilities}>
                {abilities.map((ability, index) => (
                    <div key={index}>
                        <h3>{ability.title}</h3>
                        <p>{ability.description}</p>
                    </div>
                ))}
            </div>
        </div>
    )
);

export default StatBlock;
