import { server$ } from "@builder.io/qwik-city";
import { PrismaClient } from "@prisma/client";
import { type Explainer, ExplainerStage, isToolExplainer } from "~/models/explainer";
import { ImageModel } from "~/models/imageModel";
import type { ItemTierInfo } from "~/models/itemTierInfo";
import type { Rarity } from "~/models/rarity";
import { RARITIES } from "~/models/rarity";
import type { TagModel } from "~/models/tags";
import { doesTagTakeAllSlots, TagType } from "~/models/tags";
import type { Tool } from "~/models/tool";

let prisma: PrismaClient | null = null;

function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}


export const getTierInfo = server$(async () => {

  const prisma = getPrisma();
  const tiers = await prisma.tier_info.findMany();

  return tiers.reduce((acc, tier) => {
    acc[RARITIES[tier.id - 1]] = {
      tags: tier.tags,
      numberOfIp: tier.ip_cost,
      dcMin: tier.dc_min,
      dcMax: tier.dc_max ?? undefined,
      timeInDays: tier.time,
      color: tier.color
    };
    return acc;
  }, {} as Record<Rarity, ItemTierInfo>);
});

export const getTierInfoForRarity = server$(async (rarityIndex: number) => {
  const prisma = getPrisma();

  const tier = await prisma.tier_info.findUnique({
    where: {
      id: rarityIndex + 1
    }
  });

  if (!tier) {
    return null;
  }

  return {
    tags: tier.tags,
    numberOfIp: tier.ip_cost,
    dcMin: tier.dc_min,
    dcMax: tier.dc_max ?? undefined,
    timeInDays: tier.time,
    color: tier.color
  } as ItemTierInfo;

});

export const getTags = server$(async (toolId: number) => {
  const prisma = getPrisma();

  const tags = await prisma.tags.findMany({
    where: {
      tool_id: toolId
    }
  });


  return Promise.all(tags.map(async tag => {
    return {
      id: tag.id,
      name: tag.name,
      type: tag.is_form ? TagType.FormTag : TagType.EffectTag,
      minRarity: RARITIES.find((_, index) => index === tag.min_rarity_id),
      slotCost: tag.cost_takes_all ? { takeAll: true } : { value: tag.cost_value },
      tagRequirementId: (await prisma.effect_tag_deps.findMany({
        where: {
          effect_tag_id: tag.id
        }
      })).map(tagDep => tagDep.form_tag_id),
      description: tag.description,
      itemName: tag.item_name
    } as TagModel;
  }));
});

export const getAllTags = server$(async () => {
  const prisma = getPrisma();

  const tags = await prisma.tags.findMany();

  return Promise.all(tags.map(async tag => {
    return {
      id: tag.id,
      name: tag.name,
      type: tag.is_form ? TagType.FormTag : TagType.EffectTag,
      minRarity: RARITIES.find((_, index) => index === tag.min_rarity_id),
      slotCost: tag.cost_takes_all ? { takeAll: true } : { value: tag.cost_value },
      tagRequirementId: (await prisma.effect_tag_deps.findMany({
        where: {
          effect_tag_id: tag.id
        }
      })).map(tagDep => tagDep.form_tag_id),
      description: tag.description,
      itemName: tag.item_name,
      toolId: tag.tool_id
    } as TagModel;
  }
  ));

});

export async function getIconUrl(formTagId: number, rarityIndex: number): Promise<string> {
  const prisma = getPrisma();

  const imageModel = await prisma.images.findFirst({
    where: {
      form_tag_id: formTagId,
      rarity_index: rarityIndex
    }
  });

  return imageModel?.url ?? "";
}

export const getExplainers = server$(async () => {
  const prisma = getPrisma();

  const explainers = await prisma.explainers.findMany();

  return explainers.map(explainer => {
    if (explainer.dependency_type === "TOOL") {
      return {
        id: explainer.id,
        title: explainer.title,
        text: explainer.text,
        toolId: explainer.dependency ?? 0,
        stage: explainer.stage
      } as Explainer;
    } else {
      return {
        id: explainer.id,
        title: explainer.title,
        text: explainer.text,
        stage: explainer.stage
      } as Explainer;
    }
  });
});

export const getExplainerForTierStage = server$(async (toolId: number) => {
  const prisma = getPrisma();

  const explainer = await prisma.explainers.findFirst({
    where: {
      dependency_type: "TOOL",
      dependency: toolId,
      stage: ExplainerStage.Tier
    }
  });

  return explainer;
});

export const getExplainerForTagStage = server$(async () => {
  const prisma = getPrisma();

  const explainer = await prisma.explainers.findFirst({
    where: {
      stage: ExplainerStage.Tags
    }
  });

  return explainer;
});


export const getTools = server$(async () => {
  const prisma = getPrisma();

  const tools = await prisma.tools.findMany();

  return tools.map(tool => {
    return {
      id: tool.id,
      name: tool.name,
      emoji: tool.emoji
    } as Tool;
  });
});

export const getTool = server$(async (toolId: number) => {
  const prisma = getPrisma();

  const tool = await prisma.tools.findUnique({
    where: {
      id: toolId
    }
  });

  if (!tool) {
    return null;
  }

  return {
    id: tool.id,
    name: tool.name,
    emoji: tool.emoji
  } as Tool;
});

export const checkPasscode = server$(async (key: string) => {
  const prisma = getPrisma();

  const passcode = await prisma.admin.findFirst({
    where: {
      passcode: key
    }
  });

  return !!passcode;
});

export const updateTool = server$<(tool: Tool) => Promise<Tool>>(async (tool: Tool) => {
  const prisma = getPrisma();

  const updatedTool = await prisma.tools.update({
    where: {
      id: tool.id
    },
    data: {
      name: tool.name,
      emoji: tool.emoji
    }
  });

  return {
    id: updatedTool.id,
    name: updatedTool.name,
    emoji: updatedTool.emoji ?? undefined
  };
});

export const createTool = server$<(tool: Tool) => Promise<Tool>>(async (tool: Tool) => {
  const prisma = getPrisma();

  const createdTool = await prisma.tools.create({
    data: {
      name: tool.name,
      emoji: tool.emoji
    }
  });

  return {
    id: createdTool.id,
    name: createdTool.name,
    emoji: createdTool.emoji ?? undefined
  };
});

export const deleteTool = server$<(toolId: number) => Promise<void>>(async (toolId: number) => {
  const prisma = getPrisma();

  await prisma.tools.delete({
    where: {
      id: toolId
    }
  });
});

export const updateExplainer = server$<(explainer: Explainer) => Promise<Explainer>>(
  async (explainer: Explainer) => {
    const prisma = getPrisma();


    const updatedExplainer = await prisma.explainers.update({
      where: {
        id: explainer.id
      },
      data: {
        title: explainer.title,
        text: explainer.text,
        dependency: isToolExplainer(explainer) ? explainer.toolId : null,
        stage: explainer.stage,
        dependency_type: isToolExplainer(explainer) ? "TOOL" : undefined
      }
    });

    if (updatedExplainer.dependency_type === "TOOL" && updatedExplainer.dependency) {
      return {
        id: updatedExplainer.id,
        title: updatedExplainer.title,
        text: updatedExplainer.text,
        toolId: updatedExplainer.dependency,
        stage: updatedExplainer.stage
      };
    } else {
      return {
        id: updatedExplainer.id,
        title: updatedExplainer.title,
        text: updatedExplainer.text,
        stage: updatedExplainer.stage
      };
    }
  }
);

export const createExplainer = server$<(explainer: Explainer) => Promise<Explainer>>(
  async (explainer: Explainer) => {
    const prisma = getPrisma();

    const createdExplainer = await prisma.explainers.create({
      data: {
        title: explainer.title,
        text: explainer.text,
        dependency: isToolExplainer(explainer) ? explainer.toolId : null,
        stage: explainer.stage,
        dependency_type: isToolExplainer(explainer) ? "TOOL" : undefined
      }
    });

    if (createdExplainer.dependency_type === "TOOL" && createdExplainer.dependency) {
      return {
        id: createdExplainer.id,
        title: createdExplainer.title,
        text: createdExplainer.text,
        toolId: createdExplainer.dependency,
        stage: createdExplainer.stage
      };
    } else {
      return {
        id: createdExplainer.id,
        title: createdExplainer.title,
        text: createdExplainer.text,
        stage: createdExplainer.stage
      };
    }
  });

export const deleteExplainer = server$<(explainerId: number) => Promise<void>>(
  async (explainerId: number) => {
    const prisma = getPrisma();

    await prisma.explainers.delete({
      where: {
        id: explainerId
      }
    });
  });

export const updateTierInfo = server$<(tierInfo: ItemTierInfo, rarity: Rarity) => Promise<ItemTierInfo>>(
  async (tierInfo: ItemTierInfo, rarity: Rarity) => {
    const prisma = getPrisma();

    const updatedTierInfo = await prisma.tier_info.update({
      where: {
        id: RARITIES.indexOf(rarity) + 1
      },
      data: {
        tags: tierInfo.tags,
        ip_cost: tierInfo.numberOfIp,
        dc_min: tierInfo.dcMin,
        dc_max: tierInfo.dcMax ?? undefined,
        time: tierInfo.timeInDays,
        color: tierInfo.color
      }
    });

    return {
      tags: updatedTierInfo.tags,
      numberOfIp: updatedTierInfo.ip_cost,
      dcMin: updatedTierInfo.dc_min,
      dcMax: updatedTierInfo.dc_max ?? undefined,
      timeInDays: updatedTierInfo.time,
      color: updatedTierInfo.color
    };
  }
);

export const updateTag = server$<(tag: TagModel) => Promise<TagModel>>(async (tag: TagModel) => {
  const prisma = getPrisma();

  const updatedTag = await prisma.tags.update({
    where: {
      id: tag.id
    },
    data: {
      name: tag.name,
      is_form: tag.type === TagType.FormTag ? 1 : 0,
      min_rarity_id: RARITIES.indexOf(tag.minRarity),
      description: tag.description,
      item_name: tag.itemName,
      cost_value: doesTagTakeAllSlots(tag.slotCost) ? null : tag.slotCost.value,
      cost_takes_all: doesTagTakeAllSlots(tag.slotCost) ? 1 : 0,
      tool_id: tag.toolId
    }
  });

  if (tag.type === TagType.EffectTag) {
    // Update the tag requirements relationships
    await prisma.effect_tag_deps.deleteMany({
      where: {
        effect_tag_id: tag.id
      }
    });

    await Promise.all(tag.tagRequirementId.map(tagRequirementId => prisma.effect_tag_deps.create({
      data: {
        effect_tag_id: tag.id,
        form_tag_id: tagRequirementId
      }
    })));
  }

  return {
    id: updatedTag.id,
    name: updatedTag.name,
    type: updatedTag.is_form ? TagType.FormTag : TagType.EffectTag,
    minRarity: RARITIES[updatedTag.min_rarity_id - 1],
    slotCost: updatedTag.cost_takes_all ? { takeAll: true } : { value: updatedTag.cost_value },
    tagRequirementId: (await prisma.effect_tag_deps.findMany({
      where: {
        effect_tag_id: updatedTag.id
      }
    })).map(tagDep => tagDep.form_tag_id),
    description: updatedTag.description,
    itemName: updatedTag.item_name
  } as TagModel;
}
);

export const createTag = server$<(tag: TagModel) => Promise<TagModel>>(
  async (tag: TagModel) => {
    const prisma = getPrisma();

    const createdTag = await prisma.tags.create({
      data: {
        name: tag.name,
        is_form: tag.type === TagType.FormTag ? 1 : 0,
        min_rarity_id: RARITIES.indexOf(tag.minRarity),
        description: tag.description,
        item_name: tag.itemName ?? "",
        cost_value: doesTagTakeAllSlots(tag.slotCost) ? null : tag.slotCost.value,
        cost_takes_all: doesTagTakeAllSlots(tag.slotCost) ? 1 : 0,
        tool_id: tag.toolId
      }
    });

    const tagReq = await Promise.all(tag.tagRequirementId.map(tagRequirementId => prisma.effect_tag_deps.create({
      data: {
        effect_tag_id: createdTag.id,
        form_tag_id: tagRequirementId
      }
    })));

    return {
      id: createdTag.id,
      name: createdTag.name,
      type: createdTag.is_form ? TagType.FormTag : TagType.EffectTag,
      minRarity: RARITIES[createdTag.min_rarity_id - 1],
      slotCost: createdTag.cost_takes_all ? { takeAll: true } : { value: createdTag.cost_value },
      tagRequirementId: tagReq.map(tagDep => tagDep.form_tag_id),
      description: createdTag.description,
      itemName: createdTag.item_name,
      toolId: createdTag.tool_id
    } as TagModel;
  }
);

export const deleteTag = server$<(tagId: number) => Promise<void>>(async (tagId: number) => {
  const prisma = getPrisma();

  await prisma.tags.delete({
    where: {
      id: tagId
    }
  });
}
);

export const getImages = server$(async () => {
  const prisma = getPrisma();

  const images = await prisma.images.findMany({
    include: {
      tags: true
    }
  });

  return images.map(image => {
    return {
      id: image.id,
      url: image.url,
      formTagId: image.form_tag_id,
      formTagName: image.tags.name,
      rarity: RARITIES[image.rarity_index]
    } as ImageModel;
  });
}
);

const getTagById = server$<(tagId: number) => Promise<TagModel | null>>(async (tagId: number) => {

  const prisma = getPrisma();

  const tag = await prisma.tags.findUnique({
    where: {
      id: tagId
    }
  });

  if (!tag) {
    return null;
  }

  return {
    id: tag.id,
    name: tag.name,
    type: tag.is_form ? TagType.FormTag : TagType.EffectTag,
    minRarity: RARITIES.find((_, index) => index === tag.min_rarity_id),
    slotCost: tag.cost_takes_all ? { takeAll: true } : { value: tag.cost_value },
    tagRequirementId: (await prisma.effect_tag_deps.findMany({
      where: {
        effect_tag_id: tag.id
      }
    })).map(tagDep => tagDep.form_tag_id),
    description: tag.description,
    itemName: tag.item_name,
    toolId: tag.tool_id
  } as TagModel
});

export const saveImage = server$<(image: { url: string, formTagId: number, rarityIndex: number }) => Promise<ImageModel>>(
  async (image: { url: string, formTagId: number, rarityIndex: number }) => {
    const prisma = getPrisma();

    const result = await prisma.images.create({
      data: {
        url: image.url,
        form_tag_id: image.formTagId,
        rarity_index: image.rarityIndex
      }
    });

    const tag = await getTagById(image.formTagId);

    if (!tag) {
      throw new Error("Tag not found");
    }

    return {
      id: result.id,
      url: result.url,
      formTagId: result.form_tag_id,
      formTagName: tag.name,
      rarity: RARITIES[result.rarity_index]
    } as ImageModel
  }
);

export const deleteImage = server$<(imageId: number) => Promise<void>>(async (imageId: number) => {
  const prisma = getPrisma();

  await prisma.images.delete({
    where: {
      id: imageId
    }
  });
});

export const updateImage = server$<(image: ImageModel) => Promise<ImageModel>>(async (image: ImageModel) => {
  const prisma = getPrisma();

  const updatedImage = await prisma.images.update({
    where: {
      id: image.id
    },
    data: {
      url: image.url,
      form_tag_id: image.formTagId,
      rarity_index: RARITIES.indexOf(image.rarity)
    }
  });

  return {
    id: updatedImage.id,
    url: updatedImage.url,
    formTagId: updatedImage.form_tag_id,
    formTagName: image.formTagName,
    rarity: RARITIES[updatedImage.rarity_index]
  } as ImageModel;
})