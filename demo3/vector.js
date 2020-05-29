let rotate = function (pos, angle) {
  let cos0 = Math.cos(angle);
  let sin0 = Math.sin(angle);
  return [pos[0] * cos0 - pos[1] * sin0, pos[1] * cos0 + pos[0] * sin0];
};
let toPosRate = function (p0, p1, rate) {
  return [p0[0] * (1 - rate) + p1[0] * rate, p0[1] * (1 - rate) + p1[1] * rate];
};
let cross = function (pos0, pos1, pos2) {
  return (pos0[0] - pos1[0]) * (pos2[1] - pos1[1]) - (pos2[0] - pos1[0]) * (pos0[1] - pos1[1]);
};
let getVector = function (pos0, pos1) {
  return [pos1[0] - pos0[0], pos1[1] - pos0[1]];
};
let pushVector = function (pos, vector) {
  return [pos[0] + vector[0], pos[1] + vector[1]];
};
let getDistance = function (pos0, pos1) {
  return getVectorLength(getVector(pos0, pos1));
};
let getVectorLength = function (vector) {
  return Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
};
let getQuadraticCurveTo = function (p0, p1, p2, t) {
  let x = p0[0] * (1 - t) * (1 - t) + 2 * p1[0] * (1 - t) * t + p2[0] * t * t;
  let y = p0[1] * (1 - t) * (1 - t) + 2 * p1[1] * (1 - t) * t + p2[1] * t * t;
  return [x, y];
};
let getQuadraticCurveToTangent = function (p0, p1, p2, t) {
  let x = 2 * t * (p0[0] - p1[0] * 2 + p2[0]) + 2 * (-p0[0] + p1[0]);
  let y = 2 * t * (p0[1] - p1[1] * 2 + p2[1]) + 2 * (-p0[1] + p1[1]);
  return [x, y];
};
export {
  rotate,
  toPosRate,
  cross,
  getVector,
  pushVector,
  getDistance,
  getVectorLength,
  getQuadraticCurveTo,
  getQuadraticCurveToTangent,
};
