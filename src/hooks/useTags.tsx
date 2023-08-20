import { useSignal, useTask$ } from "@builder.io/qwik";
import { getTags } from "~/data/api";
import { TagModel, TagType } from "~/models/tags";

export const useTags = (
    /*toolId:number, */
) => {
    const tags = useSignal<TagModel[] | null>(null);
    const formTags = useSignal<TagModel[] | null>(null);
    const effectTags = useSignal<TagModel[] | null>(null);

    useTask$(async () => {
        // Get item tiers
        if (tags.value) return;

        const tagsResponse = await getTags();
        tags.value = tagsResponse;

        formTags.value = tagsResponse.filter(
            (tag) => tag.type === TagType.FormTag
        );

        effectTags.value = tagsResponse.filter(
            (tag) => tag.type === TagType.EffectTag
        );
    });

    return { tags, formTags, effectTags };
};
