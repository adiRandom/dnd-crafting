import { server$ } from "@builder.io/qwik-city";
import { PrismaClient } from "@prisma/client";
import { ExplainerStage, type Explainer, isToolExplainer } from "~/models/explainer";
import type { ItemTierInfo } from "~/models/itemTierInfo";
import type { Rarity } from "~/models/rarity";
import { RARITIES } from "~/models/rarity";
import type { TagModel } from "~/models/tags";
import { TagType } from "~/models/tags";
import type { Tool } from "~/models/tool";

export const getTierInfo = server$(async () => {
  const prisma = new PrismaClient()

  const tiers = await prisma.tier_info.findMany()

  return tiers.reduce((acc, tier) => {
    acc[RARITIES[tier.id - 1]] = {
      tags: tier.tags,
      numberOfIp: tier.ip_cost,
      dcMin: tier.dc_min,
      dcMax: tier.dc_max ?? undefined,
      timeInDays: tier.time,
      color: tier.color,
    }
    return acc
  }, {} as Record<Rarity, ItemTierInfo>)
})

export const getTierInfoForRarity = server$(async (rarityIndex: number) => {
  const prisma = new PrismaClient()

  const tier = await prisma.tier_info.findUnique({
    where: {
      id: rarityIndex + 1
    }
  })

  if (!tier) {
    return null
  }

  return {
    tags: tier.tags,
    numberOfIp: tier.ip_cost,
    dcMin: tier.dc_min,
    dcMax: tier.dc_max ?? undefined,
    timeInDays: tier.time,
    color: tier.color,
  } as ItemTierInfo

})

export const getTags = server$(async (toolId: number) => {
  const prisma = new PrismaClient()

  const tags = await prisma.tags.findMany({
    where: {
      tool_id: toolId
    }
  })


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
    } as TagModel
  }))
})

export async function getIconUrl(formTagId: number, rarityIndex: number): Promise<string> {
  return Promise.resolve(`https://static.vecteezy.com/system/resources/previews/012/014/529/non_2x/sword-pixel-art-free-vector.jpg`)
}

export const getExplainers = server$(async () => {
  const prisma = new PrismaClient()

  const explainers = await prisma.explainers.findMany()

  return explainers.map(explainer => {
    if (explainer.dependency_type === "TOOL") {
      return {
        id: explainer.id,
        title: explainer.title,
        text: explainer.text,
        toolId: explainer.dependency ?? 0,
        stage: explainer.stage
      } as Explainer
    } else {
      return {
        id: explainer.id,
        title: explainer.title,
        text: explainer.text,
        stage: explainer.stage
      } as Explainer
    }
  })
})

export const getExplainerForTierStage = server$(async (toolId: number) => {
  const prisma = new PrismaClient()

  const explainer = await prisma.explainers.findFirst({
    where: {
      dependency_type: "TOOL",
      dependency: toolId,
      stage: ExplainerStage.Tier
    }
  })

  return explainer
})

export const getExplainerForTagStage = server$(async () => {
  const prisma = new PrismaClient()

  const explainer = await prisma.explainers.findFirst({
    where: {
      stage: ExplainerStage.Tags
    }
  })

  return explainer
})


export const getTools = server$(async () => {
  const prisma = new PrismaClient()

  const tools = await prisma.tools.findMany()

  return tools.map(tool => {
    return {
      id: tool.id,
      name: tool.name,
      emoji: tool.emoji
    } as Tool
  })
})

export const getTool = server$(async (toolId: number) => {
  const prisma = new PrismaClient()

  const tool = await prisma.tools.findUnique({
    where: {
      id: toolId
    }
  })

  if (!tool) {
    return null
  }

  return {
    id: tool.id,
    name: tool.name,
    emoji: tool.emoji
  } as Tool
})

export const checkPasscode = server$(async (key: string) => {
  const prisma = new PrismaClient()

  const passcode = await prisma.admin.findFirst({
    where: {
      passcode: key
    }
  })

  return !!passcode
})

export const updateTool = server$<(tool: Tool) => Promise<Tool>>(async (tool: Tool) => {
  const prisma = new PrismaClient()

  const updatedTool = await prisma.tools.update({
    where: {
      id: tool.id
    },
    data: {
      name: tool.name,
      emoji: tool.emoji
    }
  })

  return {
    id: updatedTool.id,
    name: updatedTool.name,
    emoji: updatedTool.emoji ?? undefined
  }
})

export const createTool = server$<(tool: Tool) => Promise<Tool>>(async (tool: Tool) => {
  const prisma = new PrismaClient()

  const createdTool = await prisma.tools.create({
    data: {
      name: tool.name,
      emoji: tool.emoji
    }
  })

  return {
    id: createdTool.id,
    name: createdTool.name,
    emoji: createdTool.emoji ?? undefined
  }
})

export const deleteTool = server$<(toolId: number) => Promise<void>>(async (toolId: number) => {
  const prisma = new PrismaClient()

  await prisma.tools.delete({
    where: {
      id: toolId
    }
  })
})

export const updateExplainer = server$<(explainer: Explainer) => Promise<Explainer>>(
  async (explainer: Explainer) => {
    const prisma = new PrismaClient()

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
    })

    if (updatedExplainer.dependency_type === "TOOL" && updatedExplainer.dependency) {
      return {
        id: updatedExplainer.id,
        title: updatedExplainer.title,
        text: updatedExplainer.text,
        toolId: updatedExplainer.dependency,
        stage: updatedExplainer.stage
      }
    } else {
      return {
        id: updatedExplainer.id,
        title: updatedExplainer.title,
        text: updatedExplainer.text,
        stage: updatedExplainer.stage
      }
    }
  }
)

export const createExplainer = server$<(explainer: Explainer) => Promise<Explainer>>(
  async (explainer: Explainer) => {
    const prisma = new PrismaClient()

    const createdExplainer = await prisma.explainers.create({
      data: {
        title: explainer.title,
        text: explainer.text,
        dependency: isToolExplainer(explainer) ? explainer.toolId : null,
        stage: explainer.stage,
        dependency_type: isToolExplainer(explainer) ? "TOOL" : undefined
      }
    })

    if (createdExplainer.dependency_type === "TOOL" && createdExplainer.dependency) {
      return {
        id: createdExplainer.id,
        title: createdExplainer.title,
        text: createdExplainer.text,
        toolId: createdExplainer.dependency,
        stage: createdExplainer.stage
      }
    } else {
      return {
        id: createdExplainer.id,
        title: createdExplainer.title,
        text: createdExplainer.text,
        stage: createdExplainer.stage
      }
    }
  })

export const deleteExplainer = server$<(explainerId: number) => Promise<void>>(
  async (explainerId: number) => {
    const prisma = new PrismaClient()

    await prisma.explainers.delete({
      where: {
        id: explainerId
      }
    })
  })