import type { RawMarkersFile, MarkerInstance } from "../types/game";

/**
 * Convert deeply-nested marker YAML structure into a flat list.
 *
 * Structure expected:
 * {
 *   version: 1,
 *   locations: {
 *     tpPoint: {
 *       starterTown: { position: [x, y], ... },
 *       westGate: { position: [x, y], ... }
 *     },
 *     npc: {...}
 *   },
 *   gatheringPoints: {...},
 *   questPoints: {...},
 *   enemies: {...}
 * }
 */
export function flattenMarkers(raw: RawMarkersFile): MarkerInstance[] {
  const result: MarkerInstance[] = [];

  // Safe cast for Object.entries
  const rawObj = raw as Record<string, any>;

  for (const [categoryId, categoryValue] of Object.entries(rawObj)) {
    // Skip non-category keys
    if (categoryId === "version") continue;
    if (typeof categoryValue !== "object" || categoryValue === null) continue;

    const categoryObj = categoryValue as Record<string, any>;

    for (const [subtypeId, subtypeValue] of Object.entries(categoryObj)) {
      if (typeof subtypeValue !== "object" || subtypeValue === null) continue;

      const subtypeObj = subtypeValue as Record<string, any>;

      for (const [markerId, markerData] of Object.entries(subtypeObj)) {
        if (
          typeof markerData !== "object" ||
          markerData === null ||
          !("position" in markerData)
        ) {
          continue;
        }

        const position = (markerData as any).position as [number, number];

        // Ensure valid coordinate array
        if (
          !Array.isArray(position) ||
          position.length !== 2 ||
          typeof position[0] !== "number" ||
          typeof position[1] !== "number"
        ) {
          continue;
        }

        const images = (markerData as any).images as string[] || [];

        result.push({
          id: markerId,
          categoryId,
          subtypeId,
          position, // [x, y]
          images,
        });
      }
    }
  }

  return result;
}
