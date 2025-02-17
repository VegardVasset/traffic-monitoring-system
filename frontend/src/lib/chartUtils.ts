// utils/chartUtils.ts
import { chartColors, chartColorsOpacity } from "@/lib/theme";

export function getChartColor(index: number, opacity: number = 1): string {
  return opacity === 1 ? chartColors[index % chartColors.length] : chartColorsOpacity(opacity)[index % chartColors.length];
}
