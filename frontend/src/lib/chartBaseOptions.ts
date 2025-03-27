
export const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
      onClick: () => {}, 
    },
    title: {
      display: true,
    },
  },
};
