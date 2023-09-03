import { Signal, useSignal, useTask$ } from "@builder.io/qwik";
import { getIconUrl } from "~/server/repository";
import { TagModel } from "~/models/tags";

export function useIconItem(
  formTag: Signal<TagModel | null>,
  rarityIndex: number
) {
  const url = useSignal("");

  useTask$(async ({ track }) => {
    track(() => formTag.value);
    track(() => rarityIndex);

    if (formTag.value === null) {
      return
    }

    url.value = await getIconUrl(
      formTag.value.id,
      rarityIndex
    );
  })

  return url;
}