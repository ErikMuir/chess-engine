const clearCanvas = (context) => {
  const { width, height } = context.canvas;
  context.clearRect(0, 0, width, height);
};
const isDigit = (str) => /^\d+$/.test(str);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

export {
  clearCanvas,
  isDigit,
  sleep,
  randomElement,
};
