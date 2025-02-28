import { chartColors, chartColorsOpacity } from "@/lib/theme";

export function getChartColor(index: number, opacity: number = 1): string {
  const baseColor = chartColors[index % chartColors.length];

  // Apply alternating dark and light colors by checking if the index is even or odd
  const isEvenIndex = index % 2 === 0;

  // Modify the color logic to alternate between dark and light variations
  if (isEvenIndex) {
    return opacity === 1
      ? baseColor
      : chartColorsOpacity(opacity)[index % chartColors.length];
  } else {
    // Darken the color for odd indices
    const darkenedColor = baseColor.replace(
      /rgba\((\d+),(\d+),(\d+),(\d+.\d+)\)/,
      (_, r, g, b, a) => `rgba(${Math.max(0, parseInt(r) - 40)},${Math.max(0, parseInt(g) - 40)},${Math.max(0, parseInt(b) - 40)},${a})`
    );

    return opacity === 1
      ? darkenedColor
      : chartColorsOpacity(opacity)[index % chartColors.length];
  }
}
