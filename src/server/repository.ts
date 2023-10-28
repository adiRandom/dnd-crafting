import { server$ } from "@builder.io/qwik-city";
import { PrismaClient } from "@prisma/client";
import { create } from "domain";
import { type Explainer, ExplainerStage, isExplainerWithTool } from "~/models/explainer";
import { EXPLAINER_TYPE_TABLE, EXPLAINER_TYPE_TEXT, ExplainerBlock } from "~/models/explianerBlock";
import { ImageModel } from "~/models/imageModel";
import type { ItemTierInfo } from "~/models/itemTierInfo";
import type { Rarity } from "~/models/rarity";
import { RARITIES } from "~/models/rarity";
import { SummonModel, SummonType } from "~/models/summonModel";
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
    },
    include: {
      mutually_exclusive_effect_tags_mutually_exclusive_effect_tags_first_tagTotags: true,
      mutually_exclusive_effect_tags_mutually_exclusive_effect_tags_second_tagTotags: true
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
      itemName: tag.item_name,
      mutuallyExclusiveTagId: [
        ...tag.mutually_exclusive_effect_tags_mutually_exclusive_effect_tags_first_tagTotags
          .map(({ second_tag }) =>
            second_tag
          ), ...tag.mutually_exclusive_effect_tags_mutually_exclusive_effect_tags_second_tagTotags
            .map(({ first_tag }) =>
              first_tag)],
      summonBonus: {
        ac: tag.summon_bonus_ac,
        spd: tag.summon_bonus_spd
      }
    } as TagModel;
  }));
});

export const getAllTags = server$(async () => {
  const prisma = getPrisma();

  const tags = await prisma.tags.findMany({
    include: {
      mutually_exclusive_effect_tags_mutually_exclusive_effect_tags_first_tagTotags: true,
      mutually_exclusive_effect_tags_mutually_exclusive_effect_tags_second_tagTotags: true
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
      itemName: tag.item_name,
      toolId: tag.tool_id,
      mutuallyExclusiveTagId: [
        ...tag.mutually_exclusive_effect_tags_mutually_exclusive_effect_tags_first_tagTotags
          .map(({ second_tag }) =>
            second_tag
          ), ...tag.mutually_exclusive_effect_tags_mutually_exclusive_effect_tags_second_tagTotags
            .map(({ first_tag }) =>
              first_tag)],
      summonBonus: {
        ac: tag.summon_bonus_ac,
        spd: tag.summon_bonus_spd
      }
    } as TagModel;
  }
  ));

});

export const getIconUrl = server$(async (formTagId: number, rarityIndex: number): Promise<string> => {
  const prisma = getPrisma();

  const imageModel = await prisma.images.findFirst({
    where: {
      form_tag_id: formTagId,
      rarity_index: rarityIndex
    }
  });

  return imageModel?.url ?? "";
})

export const getExplainers = server$(async () => {
  const prisma = getPrisma();

  const explainers = await prisma.explainers.findMany({
    include: {
      explainer_blocks: true
    }
  });

  return explainers.map(explainer => {
    if (explainer.dependency_type === "TOOL") {
      return {
        id: explainer.id,
        title: explainer.title,
        text: explainer.text,
        toolId: explainer.dependency ?? 0,
        stage: explainer.stage,
        blocks: explainer.explainer_blocks.map(block => ({
          id: block.id,
          content: block.type === EXPLAINER_TYPE_TABLE ? JSON.parse(block.content) : block.content
        } as ExplainerBlock))
      } as Explainer;
    } else {
      return {
        id: explainer.id,
        title: explainer.title,
        text: explainer.text,
        stage: explainer.stage,
        blocks: explainer.explainer_blocks.map(block => ({
          id: block.id,
          content: block.type === EXPLAINER_TYPE_TABLE ? JSON.parse(block.content) : block.content
        } as ExplainerBlock))
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
      stage: ExplainerStage.Tier,
    },
    include: {
      explainer_blocks: true
    }
  });

  if (!explainer) {
    return null;
  }

  if (explainer.dependency_type === "TOOL") {
    return {
      id: explainer.id,
      title: explainer.title,
      text: explainer.text,
      toolId: explainer.dependency ?? 0,
      stage: explainer.stage,
      blocks: explainer.explainer_blocks.map(block => ({
        id: block.id,
        content: block.type === EXPLAINER_TYPE_TABLE ? JSON.parse(block.content) : block.content
      } as ExplainerBlock))
    } as Explainer;
  } else {
    return {
      id: explainer.id,
      title: explainer.title,
      text: explainer.text,
      stage: explainer.stage,
      blocks: explainer.explainer_blocks.map(block => ({
        id: block.id,
        content: block.type === EXPLAINER_TYPE_TABLE ? JSON.parse(block.content) : block.content
      } as ExplainerBlock))
    } as Explainer;
  }
});


export const getExplainerForTagStage = server$(async (toolId: number) => {
  const prisma = getPrisma();

  const explainer = await prisma.explainers.findFirst({
    where: {
      dependency_type: "TOOL",
      dependency: toolId,
      stage: ExplainerStage.Tags
    },
    include: {
      explainer_blocks: true
    }
  });

  if (!explainer) {
    return null;
  }

  if (explainer.dependency_type === "TOOL") {
    return {
      id: explainer.id,
      title: explainer.title,
      text: explainer.text,
      toolId: explainer.dependency ?? 0,
      stage: explainer.stage,
      blocks: explainer.explainer_blocks.map(block => ({
        id: block.id,
        content: block.type === EXPLAINER_TYPE_TABLE ? JSON.parse(block.content) : block.content
      } as ExplainerBlock))
    } as Explainer;
  } else {
    return {
      id: explainer.id,
      title: explainer.title,
      text: explainer.text,
      stage: explainer.stage,
      blocks: explainer.explainer_blocks.map(block => ({
        id: block.id,
        content: block.type === EXPLAINER_TYPE_TABLE ? JSON.parse(block.content) : block.content
      } as ExplainerBlock))
    } as Explainer;
  }
});


export const getTools = server$(async () => {
  const prisma = getPrisma();

  const tools = await prisma.tools.findMany();

  return tools.map(tool => {
    return {
      id: tool.id,
      name: tool.name,
      emoji: tool.emoji,
      isSummon: tool.isSummon === 1
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
    emoji: tool.emoji,
    isSummon: tool.isSummon === 1
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
      emoji: tool.emoji,
      isSummon: tool.isSummon ? 1 : 0
    }
  });

  return {
    id: updatedTool.id,
    name: updatedTool.name,
    emoji: updatedTool.emoji ?? undefined,
    isSummon: updatedTool.isSummon === 1
  };
});

export const createTool = server$<(tool: Tool) => Promise<Tool>>(async (tool: Tool) => {
  const prisma = getPrisma();

  const createdTool = await prisma.tools.create({
    data: {
      name: tool.name,
      emoji: tool.emoji,
      isSummon: tool.isSummon ? 1 : 0
    }
  });

  return {
    id: createdTool.id,
    name: createdTool.name,
    emoji: createdTool.emoji ?? undefined,
    isSummon: createdTool.isSummon === 1
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
    console.log(explainer)
    const prisma = getPrisma();

    // Update the explainer blocks

    await prisma.explainer_blocks.deleteMany({
      where: {
        explainer_id: explainer.id
      }
    });

    console.log(explainer.blocks)

    const createdBlocks = await Promise.all(explainer.blocks.map(block => prisma.explainer_blocks.create({
      data: {
        // id: block.id,
        type: typeof block.content === "string" ? EXPLAINER_TYPE_TEXT : EXPLAINER_TYPE_TABLE,
        content: typeof block.content === "string" ? block.content : JSON.stringify(block.content),
        explainer_id: explainer.id
      }
    })));

    console.log("Here")

    const updatedExplainer = await prisma.explainers.update({
      where: {
        id: explainer.id
      },
      data: {
        title: explainer.title,
        text: explainer.text,
        dependency: isExplainerWithTool(explainer) ? explainer.toolId : null,
        stage: explainer.stage,
        dependency_type: isExplainerWithTool(explainer) ? "TOOL" : undefined,
      }
    });

    console.log(updatedExplainer)

    if (updatedExplainer.dependency_type === "TOOL" && updatedExplainer.dependency) {
      return {
        id: updatedExplainer.id,
        title: updatedExplainer.title,
        text: updatedExplainer.text,
        toolId: updatedExplainer.dependency,
        stage: updatedExplainer.stage,
        blocks: createdBlocks.map(block => ({
          id: block.id,
          content: block.type === EXPLAINER_TYPE_TABLE ? JSON.parse(block.content) : block.content
        }))
      };
    } else {
      return {
        id: updatedExplainer.id,
        title: updatedExplainer.title,
        text: updatedExplainer.text,
        stage: updatedExplainer.stage,
        blocks: createdBlocks.map(block => ({
          id: block.id,
          content: block.type === EXPLAINER_TYPE_TABLE ? JSON.parse(block.content) : block.content
        }))
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
        dependency: isExplainerWithTool(explainer) ? explainer.toolId : null,
        stage: explainer.stage,
        dependency_type: isExplainerWithTool(explainer) ? "TOOL" : undefined,
        explainer_blocks: {
          create: explainer.blocks.map(block => ({
            id: block.id,
            type: typeof block.content === "string" ? EXPLAINER_TYPE_TEXT : EXPLAINER_TYPE_TABLE,
            content: typeof block.content === "string" ? block.content : JSON.stringify(block.content)
          }))
        }
      }
    });

    if (createdExplainer.dependency_type === "TOOL" && createdExplainer.dependency) {
      return {
        id: createdExplainer.id,
        title: createdExplainer.title,
        text: createdExplainer.text,
        toolId: createdExplainer.dependency,
        stage: createdExplainer.stage,
        blocks: explainer.blocks
      };
    } else {
      return {
        id: createdExplainer.id,
        title: createdExplainer.title,
        text: createdExplainer.text,
        stage: createdExplainer.stage,
        blocks: explainer.blocks
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

  console.log(tag)
  console.log("Quack")

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
      tool_id: tag.toolId,
      summon_bonus_ac: tag.summonBonus.ac,
      summon_bonus_spd: tag.summonBonus.spd
    }
  });
  console.log("Quack2")


  try {
    await prisma.mutually_exclusive_effect_tags.deleteMany({
      where: {
        OR: [{
          first_tag: updatedTag.id,
        }, {
          second_tag: updatedTag.id
        }]
      }
    })
  } catch (e) {
    console.log(e)
  }

  console.log("Quack3")


  console.log(tag.mutuallyExclusiveTagId)

  await Promise.all(tag.mutuallyExclusiveTagId.map(mutuallyExclusiveTagId =>
    prisma.mutually_exclusive_effect_tags.create({
      data: {
        first_tag: updatedTag.id,
        second_tag: mutuallyExclusiveTagId
      }
    })))

  console.log("here")


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
    itemName: updatedTag.item_name,
    toolId: updatedTag.tool_id,
    mutuallyExclusiveTagId: tag.mutuallyExclusiveTagId,
    summonBonus: {
      ac: updatedTag.summon_bonus_ac,
      spd: updatedTag.summon_bonus_spd
    }
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
        tool_id: tag.toolId,
        summon_bonus_ac: tag.summonBonus.ac,
        summon_bonus_spd: tag.summonBonus.spd,
        mutually_exclusive_effect_tags_mutually_exclusive_effect_tags_first_tagTotags: {
          create: tag.mutuallyExclusiveTagId.map(tagId => ({
            second_tag: tagId
          }))
        }
      },
      include: {
        mutually_exclusive_effect_tags_mutually_exclusive_effect_tags_first_tagTotags: true,
        mutually_exclusive_effect_tags_mutually_exclusive_effect_tags_second_tagTotags: true
      }
    });

    const tagReq = await Promise.all(tag.tagRequirementId.map(tagRequirementId => prisma.effect_tag_deps.create({
      data: {
        effect_tag_id: createdTag.id,
        form_tag_id: tagRequirementId
      }
    })));

    // const mutuallyExclusiveTags = await Promise.all(
    //   tag.mutuallyExclusiveTagId.map(mutuallyExclusiveTagId =>
    //     prisma.mutually_exclusive_effect_tags.create({
    //       data: {
    //         first_tag: createdTag.id,
    //         second_tag: mutuallyExclusiveTagId
    //       }
    //     })));

    return {
      id: createdTag.id,
      name: createdTag.name,
      type: createdTag.is_form ? TagType.FormTag : TagType.EffectTag,
      minRarity: RARITIES[createdTag.min_rarity_id - 1],
      slotCost: createdTag.cost_takes_all ? { takeAll: true } : { value: createdTag.cost_value },
      tagRequirementId: tagReq.map(tagDep => tagDep.form_tag_id),
      description: createdTag.description,
      itemName: createdTag.item_name,
      toolId: createdTag.tool_id,
      mutuallyExclusiveTagId:
        [...createdTag.mutually_exclusive_effect_tags_mutually_exclusive_effect_tags_first_tagTotags.map(
          ({ second_tag }) =>
            second_tag
        ), ...createdTag.mutually_exclusive_effect_tags_mutually_exclusive_effect_tags_second_tagTotags.map(
          ({ first_tag }) =>
            first_tag
        )],
      summonBonus: {
        ac: createdTag.summon_bonus_ac,
        spd: createdTag.summon_bonus_spd
      }
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
    toolId: tag.tool_id,
    summonBonus: {
      ac: tag.summon_bonus_ac,
      spd: tag.summon_bonus_spd
    }
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

  console.log(image)
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

export const getSummons = server$<() => Promise<SummonModel[]>>(async () => {
  const prisma = getPrisma();

  const summons = await prisma.summons.findMany();

  return summons.map(summon => {
    return {
      id: summon.id,
      name: summon.name,
      rarity: RARITIES[summon.rarity_id - 1],
      stats: {
        hp: summon.hp,
        ac: summon.ac,
        spd: summon.spd,
        con: summon.con,
        wis: summon.wis,
        int: summon.int,
        cha: summon.cha,
        str: summon.str,
        dex: summon.dex
      },
      atk: summon.atk,
      type: summon.type
    } as SummonModel;
  });
})

export const getSummon = server$<(type: SummonType, rarity: Rarity) => Promise<SummonModel | null>>(async (type: "ceramic" | "porcelaine", rarity: Rarity) => {
  const prisma = getPrisma();

  const summon = await prisma.summons.findFirst({
    where: {
      type,
      rarity_id: RARITIES.indexOf(rarity) + 1
    }
  });

  if (!summon) {
    return null;
  }

  return {
    id: summon.id,
    name: summon.name,
    rarity: RARITIES[summon.rarity_id - 1],
    stats: {
      hp: summon.hp,
      ac: summon.ac,
      spd: summon.spd,
      con: summon.con,
      wis: summon.wis,
      int: summon.int,
      cha: summon.cha,
      str: summon.str,
      dex: summon.dex
    },
    atk: summon.atk,
    type: summon.type
  } as SummonModel;
})

export const updateSummon = server$<(summon: SummonModel) => Promise<SummonModel>>(async (summon: SummonModel) => {
  const prisma = getPrisma();

  const updatedSummon = await prisma.summons.update({
    where: {
      id: summon.id
    },
    data: {
      name: summon.name,
      rarity_id: RARITIES.indexOf(summon.rarity) + 1,
      hp: summon.stats.hp,
      ac: summon.stats.ac,
      spd: summon.stats.spd,
      con: summon.stats.con,
      wis: summon.stats.wis,
      int: summon.stats.int,
      cha: summon.stats.cha,
      str: summon.stats.str,
      dex: summon.stats.dex,
      atk: summon.atk,
      type: summon.type
    }
  });

  return {
    id: updatedSummon.id,
    name: updatedSummon.name,
    rarity: RARITIES[updatedSummon.rarity_id - 1],
    stats: {
      hp: updatedSummon.hp,
      ac: updatedSummon.ac,
      spd: updatedSummon.spd,
      con: updatedSummon.con,
      wis: updatedSummon.wis,
      int: updatedSummon.int,
      cha: updatedSummon.cha,
      str: updatedSummon.str,
      dex: updatedSummon.dex,
    },
    atk: updatedSummon.atk,
    type: updatedSummon.type
  } as SummonModel;
});

export const createSummon = server$<(summon: SummonModel) => Promise<SummonModel>>(async (summon: SummonModel) => {
  const prisma = getPrisma();

  console.log(summon)

  const createdSummon = await prisma.summons.create({
    data: {
      name: summon.name,
      rarity_id: RARITIES.indexOf(summon.rarity) + 1,
      hp: summon.stats.hp,
      ac: summon.stats.ac,
      spd: summon.stats.spd,
      con: summon.stats.con,
      wis: summon.stats.wis,
      int: summon.stats.int,
      cha: summon.stats.cha,
      str: summon.stats.str,
      dex: summon.stats.dex,
      type: summon.type,
      atk: summon.atk
    }
  });

  return {
    id: createdSummon.id,
    name: createdSummon.name,
    rarity: RARITIES[createdSummon.rarity_id - 1],
    stats: {
      hp: createdSummon.hp,
      ac: createdSummon.ac,
      spd: createdSummon.spd,
      con: createdSummon.con,
      wis: createdSummon.wis,
      int: createdSummon.int,
      cha: createdSummon.cha,
      str: createdSummon.str,
      dex: createdSummon.dex
    },
    atk: createdSummon.atk,
    type: createdSummon.type
  } as SummonModel;
});

export const deleteSummon = server$<(summonId: number) => Promise<void>>(async (summonId: number) => {
  const prisma = getPrisma();

  await prisma.summons.delete({
    where: {
      id: summonId
    }
  });
})