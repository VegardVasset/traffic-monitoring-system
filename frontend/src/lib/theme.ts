export const chartColors = [
  "rgba(75,192,192,1)",    // Light Teal
  "rgba(0,0,0,1)",         // Dark Black
  "rgba(255,99,132,1)",    // Light Red
  "rgba(139,0,0,1)",       // Dark Red
  "rgba(54,162,235,1)",    // Light Blue
  "rgba(0,0,139,1)",       // Dark Blue
  "rgba(255,206,86,1)",    // Light Yellow
  "rgba(139,139,0,1)",     // Dark Yellow
  "rgba(153,102,255,1)",   // Light Purple
  "rgba(128,0,128,1)",     // Dark Purple
  "rgba(255,159,64,1)",    // Light Orange
  "rgba(255,69,0,1)",      // Dark Orange
  "rgba(199,199,199,1)",   // Light Gray
  "rgba(169,169,169,1)",   // Dark Gray
];


  
  export const chartColorsOpacity = (opacity: number) =>
    chartColors.map((color) => {
      // Replace opacity in the rgba color string
      return color.replace(/,\s*\d+\)/, `,${opacity})`);
    });
  