import { component$, useComputed$, useSignal, $ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { PrimaryButton } from "~/components/ui/buttons/primaryButton";
import {
    deleteImage,
    getAllTags,
    getImages,
    saveImage,
    updateImage,
} from "~/server/repository";
import styles from "./index.module.css";
import { ImageModel } from "~/models/imageModel";
import { TagType } from "~/models/tags";
import { RARITIES } from "~/models/rarity";

export const useImages = routeLoader$(() => getImages());
export const useFormTags = routeLoader$(() =>
    getAllTags().then((tags) =>
        tags.filter((tag) => tag.type === TagType.FormTag)
    )
);

export default component$(() => {
    const initialImages = useImages();
    const formTags = useFormTags();
    const images = useSignal(initialImages.value);
    const selectedImage = useSignal(null as ImageModel | null);
    const isEdit = useComputed$(() => !!selectedImage.value);

    const imageUrl = useSignal("");
    const selectedTagId = useSignal(null as number | null);
    const selectedRarityIndex = useSignal(null as number | null);

    const cleanup = $(() => {
        imageUrl.value = "";
        selectedTagId.value = null;
        selectedRarityIndex.value = null;
        selectedImage.value = null;
    });

    const onSubmit = $(async () => {
        if (isEdit.value) {
            const result = await updateImage({
                ...selectedImage.value!,
                url: imageUrl.value,
                tagId: selectedTagId.value!,
                rarityIndex: selectedRarityIndex.value!,
            } as ImageModel);

            images.value = images.value.map((image) =>
                image.id === result?.id ? result! : image
            );
        } else {
            const result = await saveImage({
                url: imageUrl.value,
                formTagId: selectedTagId.value!,
                rarityIndex: selectedRarityIndex.value!,
            });

            images.value = [...images.value, result];
        }

        cleanup();
    });

    const onDelete = $(async () => {
        if (selectedImage.value) {
            await deleteImage(selectedImage.value.id);

            images.value = images.value.filter(
                (tool) => tool.id !== selectedImage.value?.id
            );
        }

        cleanup();
    });

    const onCellClick = $(async (image: ImageModel) => {
        if (selectedImage.value?.id === image.id) {
            cleanup();
            return;
        }

        selectedImage.value = image;
        imageUrl.value = image.url;
        selectedRarityIndex.value = RARITIES.indexOf(image.rarity);
        selectedTagId.value = image.formTagId;
    });

    return (
        <div class={styles.main}>
            <h1>Images</h1>
            <div class={styles.panes}>
                <div class={styles.leftPane}>
                    {images.value.map((image) => (
                        <div
                            class={{
                                [styles.cell]: true,
                                [styles.selectedCell]:
                                    selectedImage.value?.id === image.id,
                            }}
                            key={image.id}
                            onClick$={() => onCellClick(image)}
                        >
                            <div class={styles.cellInfoContainer}>
                                <h2 class={styles.tagName}>
                                    {image.formTagName}
                                </h2>
                                <h3 class={styles.rarity}>{image.rarity}</h3>
                            </div>
                            <img
                                class={styles.image}
                                src={image.url}
                                alt={image.formTagName}
                                height={24}
                                width={24}
                            />
                        </div>
                    ))}
                </div>
                <div class={styles.rightPane}>
                    <h2>{isEdit.value ? "Edit Image" : "Add Image"}</h2>
                    <input
                        class={styles.input}
                        type="text"
                        value={imageUrl.value}
                        placeholder="Image Url"
                        onChange$={(ev) => (imageUrl.value = ev.target.value)}
                    />
                    <img
                        class={styles.image}
                        src={imageUrl.value}
                        width={imageUrl.value !== "" ? 64 : 0}
                        height={imageUrl.value !== "" ? 64 : 0}
                    />
                    <select
                        class={styles.selectInput}
                        value={selectedTagId.value ?? undefined}
                        onChange$={(ev) =>
                            (selectedTagId.value = parseInt(ev.target.value))
                        }
                    >
                        {formTags.value.map((tag) => (
                            <option key={tag.id} value={tag.id}>
                                {tag.name}
                            </option>
                        ))}
                    </select>

                    <select
                        class={styles.selectInput}
                        value={selectedRarityIndex.value ?? undefined}
                        onChange$={(ev) =>
                            (selectedRarityIndex.value = parseInt(
                                ev.target.value
                            ))
                        }
                    >
                        {RARITIES.map((rarity, index) => (
                            <option key={rarity} value={index}>
                                {rarity}
                            </option>
                        ))}
                    </select>
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
