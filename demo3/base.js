let setShadow = function (ctx, offsetX, offsetY, blur, color) {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetX = offsetX;
  ctx.shadowOffsetY = offsetY;
};
let clearShadow = function (ctx) {
  setShadow(ctx, 0, 0, 0, "rgba(0, 0, 0, 0)");
};
let numberCrop = function (value, min, max) {
  if (value <= min) {
    return min;
  }
  if (value >= max) {
    return max;
  }
  return value;
};
let debounce = function (func, delay = 250) {
  let timeout = null;
  return function () {
    let context = this;
    let args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
};
let randomSeedList = new Array(200);
for (let i = 0, len = randomSeedList.length; i < len; i++) {
  randomSeedList[i] = 1 - 2 * Math.random();
}
export { setShadow, clearShadow, numberCrop, debounce, randomSeedList };
