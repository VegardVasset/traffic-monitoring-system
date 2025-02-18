// lib/chartBaseOptions.ts

export const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      // Use a literal so TypeScript knows it's valid
      position: "bottom" as const,
      onClick: () => {}, // disable built-in toggling
    },
    title: {
      display: true,
    },
  },
};
