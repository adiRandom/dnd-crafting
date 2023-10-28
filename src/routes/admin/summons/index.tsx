import { component$, useComputed$, useSignal, $ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { PrimaryButton } from "~/components/ui/buttons/primaryButton";
import {
    createSummon,
    deleteSummon,
    getSummons,
    updateSummon,
} from "~/server/repository";
import styles from "./index.module.css";
import { Rarity } from "~/models/rarity";
import {
    CERAMIC_TYPE,
    PORCELAINE_TYPE,
    SummonModel,
} from "~/models/summonModel";

export const useSummons = routeLoader$(() => getSummons());

export default component$(() => {
    const initialSummons = useSummons();
    const summons = useSignal(initialSummons.value);
    const selectedSummon = useSignal(null as SummonModel | null);
    const isEdit = useComputed$(() => !!selectedSummon.value);

    const summonName = useSignal("");
    const summonType = useSignal(CERAMIC_TYPE);
    const rarity = useSignal(Rarity.Common);
    const atk = useSignal("");
    const hp = useSignal(0);
    const ac = useSignal(0);
    const con = useSignal(0);
    const dex = useSignal(0);
    const int = useSignal(0);
    const str = useSignal(0);
    const wis = useSignal(0);
    const cha = useSignal(0);
    const spd = useSignal(0);

    const creatureType = useSignal("");

    const clearForm = $(() => {
        selectedSummon.value = null;
        summonName.value = "";
        summonType.value = CERAMIC_TYPE;
        rarity.value = Rarity.Common;
        atk.value = "";
        hp.value = 0;
        ac.value = 0;
        con.value = 0;
        dex.value = 0;
        int.value = 0;
        str.value = 0;
        wis.value = 0;
        cha.value = 0;
        spd.value = 0;
        creatureType.value = "";
    });

    const onSubmit = $(async () => {
        if (isEdit.value) {
            const result = await updateSummon({
                ...selectedSummon.value!,
                name: summonName.value,
                type: summonType.value,
                rarity: rarity.value,
                atk: atk.value,
                creatureType: creatureType.value,
                stats: {
                    hp: hp.value,
                    ac: ac.value,
                    con: con.value,
                    dex: dex.value,
                    int: int.value,
                    str: str.value,
                    wis: wis.value,
                    spd: spd.value,
                    cha: cha.value,
                },
            } as SummonModel);

            summons.value = summons.value.map((summon) =>
                summon.id === result.id ? result! : summon
            );
        } else {
            const result = await createSummon({
                id: 0,
                name: summonName.value,
                type: summonType.value,
                rarity: rarity.value,
                atk: atk.value,
                creatureType: creatureType.value,
                stats: {
                    hp: hp.value,
                    ac: ac.value,
                    con: con.value,
                    dex: dex.value,
                    int: int.value,
                    str: str.value,
                    wis: wis.value,
                    spd: spd.value,
                    cha: cha.value,
                },
            } as SummonModel);

            summons.value = [...summons.value, result];
        }

        clearForm();
    });

    const onDelete = $(async () => {
        if (selectedSummon.value) {
            await deleteSummon(selectedSummon.value.id!);

            summons.value = summons.value.filter(
                (tag) => tag.id !== selectedSummon.value?.id
            );
        }

        clearForm();
    });

    const onCellClick = $(async (summon: SummonModel) => {
        if (selectedSummon.value?.id === summon.id) {
            clearForm();
            return;
        }

        selectedSummon.value = summon;

        summonName.value = summon.name;
        summonType.value = summon.type;
        rarity.value = summon.rarity;
        atk.value = summon.atk;
        hp.value = summon.stats.hp;
        ac.value = summon.stats.ac;
        con.value = summon.stats.con;
        dex.value = summon.stats.dex;
        int.value = summon.stats.int;
        str.value = summon.stats.str;
        wis.value = summon.stats.wis;
        cha.value = summon.stats.cha;
        spd.value = summon.stats.spd;
        creatureType.value = summon.creatureType;
    });

    return (
        <div class={styles.main}>
            <h1>Tags</h1>
            <div class={styles.panes}>
                <div class={styles.leftPane}>
                    {summons.value.map((summon) => (
                        <div
                            class={{
                                [styles.cell]: true,
                                [styles.selectedCell]:
                                    selectedSummon.value?.id === summon.id,
                            }}
                            key={summon.id}
                            onClick$={() => onCellClick(summon)}
                        >
                            <h2 class={styles.toolName}>{summon.name}</h2>
                            <h3 class={styles.cellSubtitle}>{summon.type}</h3>
                        </div>
                    ))}
                </div>
                <div class={styles.rightPane}>
                    <h2>{isEdit.value ? "Edit Summon" : "Add Summon"}</h2>
                    <div class={styles.inputContainer}>
                        <h3 class={styles.inputLabel}>Summon Name</h3>
                        <input
                            class={styles.input}
                            type="text"
                            value={summonName.value}
                            onChange$={(ev) =>
                                (summonName.value = ev.target.value)
                            }
                        />

                        <h3 class={styles.inputLabel}>Creature Type</h3>
                        <input
                            class={styles.input}
                            type="text"
                            value={creatureType.value}
                            onChange$={(ev) =>
                                (creatureType.value = ev.target.value)
                            }
                        />

                        <h3 class={styles.inputLabel}>Summon Type</h3>
                        <select
                            class={styles.selectInput}
                            value={summonType.value}
                            onChange$={(ev) =>
                                (summonType.value = ev.target.value)
                            }
                        >
                            <option value={CERAMIC_TYPE}>Ceramic</option>
                            <option value={PORCELAINE_TYPE}>Porcelaine</option>
                        </select>

                        <h3 class={styles.inputLabel}>Rarity</h3>
                        <select
                            class={styles.selectInput}
                            value={rarity.value}
                            onChange$={(ev) =>
                                (rarity.value = ev.target.value as Rarity)
                            }
                        >
                            <option value={Rarity.Common}>Common</option>
                            <option value={Rarity.Uncommon}>Uncommon</option>
                            <option value={Rarity.Rare}>Rare</option>
                            <option value={Rarity.VeryRare}>Very Rare</option>
                            <option value={Rarity.Legendary}>Legendary</option>
                        </select>

                        <h3 class={styles.inputLabel}>Attack</h3>
                        <input
                            class={styles.input}
                            type="text"
                            value={atk.value}
                            onChange$={(ev) => (atk.value = ev.target.value)}
                        />

                        <h3 class={styles.inputLabel}>HP</h3>
                        <input
                            class={styles.input}
                            type="text"
                            value={hp.value}
                            onChange$={(ev) => {
                                const value = parseInt(ev.target.value);
                                hp.value = isNaN(value) ? 0 : value;
                            }}
                        />

                        <h3 class={styles.inputLabel}>AC</h3>
                        <input
                            class={styles.input}
                            type="text"
                            value={ac.value}
                            onChange$={(ev) => {
                                const value = parseInt(ev.target.value);
                                ac.value = isNaN(value) ? 0 : value;
                            }}
                        />

                        <h3 class={styles.inputLabel}>Speed</h3>
                        <input
                            class={styles.input}
                            type="text"
                            value={spd.value}
                            onChange$={(ev) => {
                                const value = parseInt(ev.target.value);
                                spd.value = isNaN(value) ? 0 : value;
                            }}
                        />

                        <h3 class={styles.inputLabel}>CON</h3>
                        <input
                            class={styles.input}
                            type="text"
                            value={con.value}
                            onChange$={(ev) => {
                                const value = parseInt(ev.target.value);
                                con.value = isNaN(value) ? 0 : value;
                            }}
                        />

                        <h3 class={styles.inputLabel}>STR</h3>
                        <input
                            class={styles.input}
                            type="text"
                            value={str.value}
                            onChange$={(ev) => {
                                const value = parseInt(ev.target.value);
                                str.value = isNaN(value) ? 0 : value;
                            }}
                        />

                        <h3 class={styles.inputLabel}>DEX</h3>
                        <input
                            class={styles.input}
                            type="text"
                            value={dex.value}
                            onChange$={(ev) => {
                                const value = parseInt(ev.target.value);
                                dex.value = isNaN(value) ? 0 : value;
                            }}
                        />

                        <h3 class={styles.inputLabel}>INT</h3>
                        <input
                            class={styles.input}
                            type="text"
                            value={int.value}
                            onChange$={(ev) => {
                                const value = parseInt(ev.target.value);
                                int.value = isNaN(value) ? 0 : value;
                            }}
                        />

                        <h3 class={styles.inputLabel}>WIS</h3>
                        <input
                            class={styles.input}
                            type="text"
                            value={wis.value}
                            onChange$={(ev) => {
                                const value = parseInt(ev.target.value);
                                wis.value = isNaN(value) ? 0 : value;
                            }}
                        />

                        <h3 class={styles.inputLabel}>CHA</h3>
                        <input
                            class={styles.input}
                            type="text"
                            value={cha.value}
                            onChange$={(ev) => {
                                const value = parseInt(ev.target.value);
                                cha.value = isNaN(value) ? 0 : value;
                            }}
                        />
                    </div>
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
