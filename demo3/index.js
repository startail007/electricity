import { getVector, pushVector, getDistance } from "./vector.js";
import { setShadow, clearShadow, numberCrop } from "./base.js";
import { Spark } from "./spark.js";
import { Electricity } from "./electricity.js";
function getTextData(s, font) {
  if (s.length <= 0) return;
  let pool = document.createElement("canvas");
  let buffer = pool.getContext("2d");
  buffer.font = font;
  let measureText = buffer.measureText(s);
  let tw = measureText.width;
  let th = measureText.actualBoundingBoxAscent + measureText.actualBoundingBoxDescent;
  pool.width = tw;
  pool.height = th + 2;
  buffer.font = font;
  buffer.fillStyle = "#ffffff";
  buffer.fillText(s, 0, th);
  let imageData = buffer.getImageData(0, 0, pool.width, pool.height);
  let data = imageData.data;
  function getIndex(imageData, x, y) {
    return (x + y * imageData.width) * 4;
  }
  let dir = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ];
  let posList = [];
  let temp = ctx.createImageData(imageData.width, imageData.height);
  for (let j = 0; j < imageData.height; j++) {
    for (let i = 0; i < imageData.width; i++) {
      let index = getIndex(imageData, i, j);
      if (data[index + 3] > 127) {
        let bool = dir.some((el) => {
          if (i + el[0] < 0 || i + el[0] >= imageData.width || j + el[1] < 0 || j + el[1] >= imageData.height) {
            return true;
          }
          return data[getIndex(imageData, i + el[0], j + el[1]) + 3] <= 127;
        });
        if (bool) {
          temp.data[index + 0] = 255;
          temp.data[index + 1] = 255;
          temp.data[index + 2] = 255;
          temp.data[index + 3] = 255;
          posList.push([i, j]);
        }
      }
    }
  }

  let spliceList = [];
  let tempPos;
  for (let i = 0; i < posList.length - 1; i++) {
    let index = -1;
    for (let j = i + 1; j < posList.length; j++) {
      let x = Math.abs(posList[i][0] - posList[j][0]);
      let y = Math.abs(posList[i][1] - posList[j][1]);
      if (x <= 1 && y <= 1) {
        index = j;
        if (x * y === 0) {
          break;
        }
      }
    }
    if (index >= 0) {
      tempPos = posList[index];
      posList[index] = posList[i + 1];
      posList[i + 1] = tempPos;
    } else {
      spliceList.push(i + 1);
    }
  }
  spliceList.push(posList.length);

  let posListG = [];
  let index = 0;
  for (let i = 0; i < spliceList.length; i++) {
    posListG.push(posList.slice(index, spliceList[i]));
    index = spliceList[i];
  }

  /*buffer.putImageData(temp, 0, 0);
      buffer.fillStyle = "#ff0000";
      let base64 = pool.toDataURL();
      let image = new Image();
      image.src = base64;*/

  return { width: imageData.width, height: imageData.height, posList, posListG };
}

function getNearestDistance(pos, posList) {
  let data = { i: -1, j: -1, r: Infinity };
  for (let i = 0; i < text_posListG.length; i++) {
    let posList = text_posListG[i];
    for (let j = 0; j < posList.length; j++) {
      let r = getDistance(posList[j], pos);
      if (r < data.r) {
        data.i = i;
        data.j = j;
        data.r = r;
      }
    }
  }
  return data;
}

function drawLight(ctx, pp, rr) {
  let gradient = ctx.createRadialGradient(pp[0], pp[1], 2, pp[0], pp[1], rr);
  gradient.addColorStop(0, "hsla(0,100%,100%,0.5)");
  gradient.addColorStop(0.15, "hsla(90,100%,75%,0.25)");
  gradient.addColorStop(1, "hsla(180,100%,50%,0)");
  //clearShadow();
  ctx.beginPath();
  ctx.fillStyle = gradient;
  ctx.arc(pp[0], pp[1], rr, 0, 2 * Math.PI);
  ctx.fill();
}

function drawE(ctx, electricity, pp0, pp1, r, lineWidth, glow, light0, light1) {
  let m = r / electricity.segmentNum;
  electricity.data_deform = m;
  electricity.data_wave = electricity.data_limit * m;
  electricity.update();
  electricity.flow(pp0, pp1);
  electricity.render(ctx, "#ffffff", lineWidth, "#00ffff", glow);
  ctx.globalAlpha = 0.5;
  if (light0) {
    drawLight(ctx, pp0, light0);
  }
  if (light1) {
    drawLight(ctx, pp1, light1);
  }
  ctx.globalAlpha = 1;
}

function getArrayCycle(ary, value) {
  value %= ary.length;
  if (value < 0) {
    value += ary.length;
  }
  return ary[Math.floor(value)];
}

function shake(value, swing, limit) {
  return numberCrop(value + swing * (1 - Math.random() * 2), -limit, limit);
}

let canvas, ctx, cWidth, cHeight;
canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");
cWidth = canvas.width;
cHeight = canvas.height;

let mPos = [0, 0];

canvas.addEventListener("mousemove", function (el) {
  mPos[0] = el.clientX;
  mPos[1] = el.clientY;
});
let text = "POWER";
let textFont = "bold 100px Courier New";
let textData = getTextData(text, textFont);
let textPos = [cWidth * 0.5 - textData.width * 0.5, cHeight * 0.5 - textData.height * 0.5];

let text_posListG = textData.posListG;

let text_data = [];

for (let i = 0; i < 10; i++) {
  let electricity = new Electricity(20);
  electricity.setSegmentAngleParameter();
  text_data.push({ id: -1, electricity: electricity, indexPos: [], transform: [], reset: true });
}

let main_transform = 0;
let main_electricity = new Electricity(50, 0.05, 0.15);

let sub_data = [];
for (let i = 0; i < 2; i++) {
  let sub_electricity = new Electricity(20);
  //sub_electricity.setSegmentAngleParameter(0.05, 0.15);
  //sub_electricity.setSegmentPosParameter(1, 20, 20);
  sub_data.push({ electricity: sub_electricity, indexPos: [], transform: [], reset: true });
}

/*let gradient = ctx.createRadialGradient(0, 0, 2, 100, 100, 5);
    console.log(gradient);*/
function update() {
  ctx.clearRect(0, 0, cWidth, cHeight);
  clearShadow(ctx);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, cWidth, cHeight);

  //setShadow(0, 0, 2 * 2, "#00ffff");
  //ctx.drawImage(text.image, 50, 200);

  let temp_mPos = getVector(textPos, mPos);
  ctx.save();
  ctx.translate(textPos[0], textPos[1]);
  ctx.globalCompositeOperation = "lighter";
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  let indexData = getNearestDistance(temp_mPos, text_posListG);
  let dischargeRange = 200;
  let discharge = indexData.r < dischargeRange;

  setShadow(ctx, 0, 0, 2 * 5, "#00ffff");
  ctx.font = textFont;
  let measureText = ctx.measureText(text);
  let th = measureText.actualBoundingBoxAscent + measureText.actualBoundingBoxDescent;
  ctx.fillStyle = discharge ? "#ffffffee" : "#ffffffcc";
  ctx.fillText(text, 0, th);
  /*ctx.lineWidth = 3;
  ctx.strokeStyle = "#ffffff66";
  ctx.strokeText(text, 0, th);*/

  for (let i = 0; i < (discharge ? text_data.length : 3); i++) {
    let id = text_data[i].id;
    let electricity = text_data[i].electricity;
    let indexPos = text_data[i].indexPos;
    let transform = text_data[i].transform;
    let bool = false;
    if (text_data[i].reset || Math.random() > (discharge ? 0.7 : 0.9)) {
      id = Math.floor(Math.random() * text_posListG.length);
      text_data[i].id = id;
      electricity.init();
      let startIndex = Math.floor(Math.random() * text_posListG[id].length);
      indexPos[0] = startIndex;
      indexPos[1] =
        startIndex +
        Math.floor(Math.min(Math.random() * (text_posListG[id].length - startIndex), text_posListG[id].length * 0.3));
      transform[0] = 0;
      transform[1] = 0;
      bool = true;
    }

    let posList = text_posListG[id];

    let index = pushVector(indexPos, transform);

    let startPos = getArrayCycle(posList, index[0]);
    let endPos = getArrayCycle(posList, index[1]);

    let r = getDistance(startPos, endPos);

    if (r > 10 && r < 40) {
      text_data[i].reset = false;
      transform[0] = shake(transform[0], 2, 5);
      transform[1] = shake(transform[1], 2, 5);
      let rand = 1 + Math.random();
      drawE(ctx, electricity, startPos, endPos, r, rand, rand * 2, rand * 8, rand * 8);

      if (bool || Math.random() > 0.95) {
        particles.push(
          new Spark(
            startPos,
            2,
            5,
            undefined,
            undefined,
            undefined,
            Math.random() * 0.25 + 0.25,
            undefined,
            undefined,
            undefined,
            1 + 3 * Math.random()
          )
        );
      }
    } else {
      text_data[i].reset = true;
    }
  }

  if (indexData.r < dischargeRange) {
    if (Math.random() > 0.9) {
      main_electricity.init();
    }

    main_transform = shake(main_transform, 2, 10);
    let pp = getArrayCycle(text_posListG[indexData.i], indexData.j + main_transform);

    let main_rate = 0.25 + 0.75 * (1 - indexData.r / dischargeRange);

    drawE(
      ctx,
      main_electricity,
      temp_mPos,
      pp,
      indexData.r,
      3 * main_rate,
      3 * main_rate * 5,
      0,
      100 * (main_rate + 0.5 * Math.random())
    );
    let angle = Math.atan2(pp[1] - temp_mPos[1], pp[0] - temp_mPos[0]);
    if (Math.random() > 0.5) {
      //for (let i = 0; i < 2; i++) {
      particles.push(
        new Spark(
          pp,
          5,
          8,
          angle + Math.PI,
          1.2,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          1 + 3 * Math.random()
        )
      );
      //}
    }

    let posList = main_electricity.segmentShow;

    for (let i = 0; i < sub_data.length; i++) {
      let electricity = sub_data[i].electricity;
      let indexPos = sub_data[i].indexPos;
      let transform = sub_data[i].transform;

      if (sub_data[i].reset || Math.random() > 0.9) {
        electricity.init();
        indexPos[0] = Math.floor(Math.random() * posList.length);
        indexPos[1] = 40 * (1 - 2 * Math.random());
        transform[0] = 0;
        transform[1] = 0;
      }

      let index = pushVector(indexPos, transform);
      let pp0 = getArrayCycle(posList, index[0]);
      let pp1 = getArrayCycle(text_posListG[indexData.i], indexData.j + index[1]);
      let r = getDistance(pp0, pp1);
      if (r < 50) {
        transform[0] = shake(transform[0], 2, 20);
        transform[1] = shake(transform[1], 2, 20);
        sub_data[i].reset = false;
        let rate = (0.25 + 0.75 * (1 - r / 50)) * 0.7 + main_rate * 0.3;
        drawE(ctx, electricity, pp0, pp1, r, 3 * rate, 3 * rate * 5, 0, 100 * (rate + 0.5 * Math.random()));
        if (Math.random() > 0.5) {
          //for (let i = 0; i < 2; i++) {
          particles.push(
            new Spark(
              pp1,
              5,
              8,
              angle + Math.PI,
              1.2,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              1 + 3 * Math.random()
            )
          );
          //}
        }
      } else {
        sub_data[i].reset = true;
      }
    }
  }

  particles.forEach((s, i, ary) => {
    s.update();
    s.lifespan <= 0 && ary.splice(i, 1);
  });

  setShadow(ctx, 0, 0, 2 * 5, "#00ffff");
  particles.forEach((s) => s.render(ctx, "#ffffff"));
  ctx.globalAlpha = 1;

  ctx.restore();
}
let particles = [];
update();
let oldTime = Date.now();
let count = 0;
let animate = function () {
  requestAnimationFrame(animate);
  let nowTime = Date.now();
  let delta = (nowTime - oldTime) / 1000;
  oldTime = nowTime;

  count += delta;
  if (count >= 0.02) {
    count %= 0.02;
    update();
  }
};
animate();
