/**
 * Worker Category Mapping — Single Source of Frontend Truth
 *
 * Mirrors the backend CATEGORY_WORKER_MAP from workers.service.db.ts.
 * The backend accepts `?category=construction` etc. and resolves
 * to the Prisma workerType array internally — so the frontend
 * should pass `category` directly rather than expanding types.
 *
 * Source: production backend workers.service.db.ts (verified via SSH)
 * Prisma WorkerType enum: 37 values across 5 groups
 * DTO WorkerType enum: 18 values (subset exposed via API)
 */

import { WorkerType } from "./workers.api";

// ─── Category definitions matching backend CATEGORY_WORKER_MAP ───

export type WorkerCategory =
  | "construction"
  | "finishing"
  | "design"
  | "electrical"
  | "plumbing"
  | "aluminum";

export interface CategoryInfo {
  /** Category key accepted by backend ?category= param */
  id: WorkerCategory;
  /** Vietnamese display label */
  label: string;
  /** Icon name (Ionicons) */
  icon: string;
  /** DTO WorkerType values in this group (subset that backend DTO exposes) */
  dtoTypes: WorkerType[];
}

/**
 * Complete category→workerType mapping from backend CATEGORY_WORKER_MAP.
 *
 * NOTE: The backend Prisma enum has MORE types than the DTO enum.
 * The `dtoTypes` array here only includes types present in the DTO enum,
 * which are the ones the frontend can reference.  The backend internally
 * resolves additional Prisma-only types when `?category=` is used.
 *
 * Example: `finishing` backend maps to 10 Prisma types, but only 4
 * of those have DTO counterparts.  Using `?category=finishing` is
 * therefore MORE complete than manually listing workerType values.
 */
export const WORKER_CATEGORIES: Record<WorkerCategory, CategoryInfo> = {
  construction: {
    id: "construction",
    label: "Xây dựng thô",
    icon: "construct-outline",
    dtoTypes: [
      WorkerType.THO_XAY,
      WorkerType.THO_SAT,
      WorkerType.THO_COFFA,
      WorkerType.EP_COC,
      WorkerType.DAO_DAT,
      WorkerType.NHAN_CONG,
    ],
  },
  finishing: {
    id: "finishing",
    label: "Hoàn thiện",
    icon: "color-palette-outline",
    dtoTypes: [
      WorkerType.THO_SON,
      WorkerType.THO_GACH,
      WorkerType.THO_THACH_CAO,
      WorkerType.THO_MOC,
    ],
  },
  design: {
    id: "design",
    label: "Thiết kế",
    icon: "easel-outline",
    dtoTypes: [WorkerType.KY_SU],
  },
  electrical: {
    id: "electrical",
    label: "Điện",
    icon: "flash-outline",
    dtoTypes: [WorkerType.THO_DIEN, WorkerType.THO_CAMERA],
  },
  plumbing: {
    id: "plumbing",
    label: "Nước",
    icon: "water-outline",
    dtoTypes: [WorkerType.THO_NUOC],
  },
  aluminum: {
    id: "aluminum",
    label: "Nhôm kính",
    icon: "grid-outline",
    dtoTypes: [WorkerType.THO_NHOM_KINH],
  },
};

/** All category keys */
export const ALL_CATEGORIES = Object.keys(
  WORKER_CATEGORIES,
) as WorkerCategory[];

/** Resolve a WorkerType to its parent category (or undefined) */
export function getCategoryForType(
  type: WorkerType,
): WorkerCategory | undefined {
  for (const [cat, info] of Object.entries(WORKER_CATEGORIES)) {
    if (info.dtoTypes.includes(type)) return cat as WorkerCategory;
  }
  return undefined;
}

/** Get label for a category */
export function getCategoryLabel(cat: WorkerCategory): string {
  return WORKER_CATEGORIES[cat]?.label ?? cat;
}

/**
 * Map a Vietnamese skill keyword → best-matching WorkerCategory.
 * Used by AI assistant to translate natural language → API category param.
 */
export function matchSkillToCategory(
  skill: string,
): WorkerCategory | undefined {
  const q = skill.toLowerCase();

  const map: [WorkerCategory, string[]][] = [
    // Aluminum before finishing so "cửa nhôm kính" matches aluminum, not "cửa" in finishing
    ["aluminum", ["nhôm", "kính", "nhôm kính", "alu", "cửa kính"]],
    [
      "construction",
      [
        "xây",
        "tường",
        "xi măng",
        "đổ bê tông",
        "cốt thép",
        "ván khuôn",
        "coffa",
        "ép cọc",
        "đào đất",
        "móng",
        "nhân công",
      ],
    ],
    [
      "finishing",
      [
        "sơn",
        "son",
        "gạch",
        "lát",
        "ốp",
        "thạch cao",
        "trần",
        "mộc",
        "gỗ",
        "cửa",
        "lan can",
      ],
    ],
    ["design", ["kiến trúc", "thiết kế", "kỹ sư", "bản vẽ", "giám sát"]],
    [
      "electrical",
      [
        "điện",
        "dien",
        "ổ cắm",
        "công tắc",
        "tủ điện",
        "camera",
        "máy lạnh",
        "điều hòa",
      ],
    ],
    ["plumbing", ["nước", "ống nước", "bồn nước", "van", "thoát nước"]],
  ];

  for (const [cat, keywords] of map) {
    if (keywords.some((k) => q.includes(k))) return cat;
  }
  return undefined;
}
