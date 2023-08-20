import { component$ } from "@builder.io/qwik";
import Tag from "~/components/tag/tag";
import { useTags } from "~/hooks/useTags";

export default component$(() => {
    const tags = useTags();

    if (tags.value === null) {
        return <div>Loading...</div>;
    }

    return (
        <div style={"width:100vw"}>
            <div style={"width:30%"}>
                <Tag
                
                    tag={tags.value[0]}
                    isSelected={false}
                    canBeSelected={true}
                    onHover$={() => {}}
                />
            </div>
        </div>
    );
});
