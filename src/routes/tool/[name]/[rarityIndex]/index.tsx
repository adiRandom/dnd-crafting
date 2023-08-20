import { component$ } from "@builder.io/qwik";
import Tag from "~/components/tag/tag";
import { TagAvailability } from "~/models/tagAvailability";
import { useTagPageViewModel } from "./useTagPageViewModel";

export default component$(() => {
    const {
        formTags,
        effectTagsWithAvailability,
        onHover,
        showInfoForTag,
        selectedFormTagId,
    } = useTagPageViewModel();
    if (formTags.value === null) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Select a form tag</h1>
            <div>
                <div>
                    {formTags.value.map((formTag) => (
                        <Tag
                            key={formTag.id}
                            tag={formTag}
                            canBeSelected
                            isSelected={formTag.id === selectedFormTagId.value}
                            onHover$={(isOver) =>
                                onHover(
                                    formTag,
                                    TagAvailability.Available,
                                    isOver
                                )
                            }
                        />
                    ))}
                </div>
                <div>
                    {showInfoForTag.value && (
                        <div>
                            <h2>{showInfoForTag.value.name}</h2>
                            <h3>{`Cost: ${showInfoForTag.value.slotCost}`}</h3>
                            <div
                                dangerouslySetInnerHTML={
                                    showInfoForTag.value.description
                                }
                            />
                            <div>
                                {showInfoForTag.value.availability.map(
                                    ({ availability, reason }) => (
                                        <h3 key={availability}>
                                            {reason ?? ""}
                                        </h3>
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});
