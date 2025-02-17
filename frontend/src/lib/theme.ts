export const chartColors = [
    "rgba(75,192,192,1)",
    "rgba(255,99,132,1)",
    "rgba(54,162,235,1)",
    "rgba(255,206,86,1)",
    "rgba(153,102,255,1)",
    "rgba(255,159,64,1)",
    "rgba(199,199,199,1)",
    "rgba(83,102,255,1)",
    "rgba(255,102,102,1)",
    "rgba(102,255,102,1)",
    "rgba(255,102,255,1)",
  ];
  
  export const chartColorsOpacity = (opacity: number) =>
    chartColors.map((color) => {
      // Replace opacity in the rgba color string
      return color.replace(/,\s*\d+\)/, `,${opacity})`);
    });
  