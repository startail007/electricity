function Spark(options) {
  options = options || {};
  this.x = options.x || w * 0.5;
  this.y = options.y || h * 0.5;
  this.v = options.v || {
    direct: Math.random() * 2 * Math.PI,
    weight: Math.random() * 14 + 2,
    friction: 0.88 + 0.06,
  };
  //console.log(this.v);
  this.a = options.a || {
    change: 0.1 - Math.random() * 0.2,
    min: this.v.direct - Math.PI * 0.4,
    max: this.v.direct + Math.PI * 0.4,
  };
  this.g = options.g || {
    direct: Math.PI * 0.5 + (0.2 - Math.random() * 0.4),
    weight: Math.random() * 0.25 + 0.25,
  };
  this.lineWidth = options.lineWidth || Math.random() * 3;
  this.lifespan = options.lifespan || Math.round(Math.random() * 25 + 50);
  this.maxlife = this.lifespan;
  this.color = options.color || "#16d9d9";
  this.prev = {
    x: this.x,
    y: this.y,
  };

  this.update = function () {
    this.prev = {
      x: this.x,
      y: this.y,
    };
    this.x += Math.cos(this.v.direct) * this.v.weight;
    this.x += Math.cos(this.g.direct) * this.g.weight;
    this.y += Math.sin(this.v.direct) * this.v.weight;
    this.y += Math.sin(this.g.direct) * this.g.weight;
    if (this.v.weight > 0.2) {
      this.v.weight *= 0.94;
    }
    this.v.direct += this.a.change;
    (this.v.direct > this.a.max || this.v.direct < this.a.min) && (this.a.change *= -1);
  };

  this.render = function (ctx) {
    if (this.lifespan <= 0) return;
    ctx.beginPath();
    ctx.globalAlpha = this.lifespan / this.maxlife;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.lineWidth;
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.prev.x, this.prev.y);
    ctx.stroke();
  };
}
