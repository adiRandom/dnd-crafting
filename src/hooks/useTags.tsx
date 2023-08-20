import { useSignal, useTask$ } from "@builder.io/qwik";
import { getTags } from "~/data/repository";
import { TagModel } from "~/models/tags";

export const useTags = (/*toolId:number*/) => {
    const tags = useSignal<TagModel[] | null>(null);
    useTask$(async () => {
        // Get item tiers
        if (tags.value) return;

        const tagsResponse = await getTags();
        tags.value = tagsResponse;
    });

    return tags;
};
