class Spark {
  constructor(
    pos = [0, 0],
    velocity = 2,
    velocity_range = 14,
    direct = 0,
    direct_range = Math.PI,
    friction = 0.94,
    /*angular_range = 0.1,
    angular_limit = Math.PI * 0.4,*/
    gravity = 0.981,
    gravity_direct = Math.PI * 0.5,
    lifespan = 25,
    lifespan_range = 25,
    thickness = 3
  ) {
    this.options = {
      pos,
      velocity,
      velocity_range,
      direct,
      direct_range,
      friction,
      /*angular_range,
      angular_limit,*/
      gravity,
      gravity_direct,
      lifespan,
      lifespan_range,
      thickness,
    };
    this.init();
  }
  init() {
    this.prevPos = this.options.pos.slice();
    this.pos = this.options.pos.slice();
    //this.velocity = this.options.velocity + this.options.velocity_range * Math.random();
    //this.direct = this.options.direct + this.options.direct_range * (1 - Math.random() * 2);

    let velocity = this.options.velocity + this.options.velocity_range * Math.random();
    let direct = this.options.direct + this.options.direct_range * (1 - Math.random() * 2);
    this.velocityPos = [Math.cos(direct) * velocity, Math.sin(direct) * velocity];
    //this.angular = this.options.angular_range * (1 - Math.random() * 2);
    this.lifespan = Math.round(this.options.lifespan + this.options.lifespan_range * Math.random());
    this.maxlife = this.lifespan;
  }
  update() {
    this.prevPos[0] = this.pos[0];
    this.prevPos[1] = this.pos[1];
    this.pos[0] += this.velocityPos[0];
    this.pos[1] += this.velocityPos[1];
    this.velocityPos[0] += Math.cos(this.options.gravity_direct) * this.options.gravity;
    this.velocityPos[1] += Math.sin(this.options.gravity_direct) * this.options.gravity;
    this.velocityPos[0] *= this.options.friction;
    this.velocityPos[1] *= this.options.friction;
    //this.pos[0] += Math.cos(this.direct) * this.velocity;
    //this.pos[0] += Math.cos(this.options.gravity_direct) * this.options.gravity;
    //this.pos[1] += Math.sin(this.direct) * this.velocity;
    //this.pos[1] += Math.sin(this.options.gravity_direct) * this.options.gravity;
    /*if (this.velocity > 0.2) {
      this.velocity *= this.options.friction;
    }*/
    //this.direct = Math.atan2(this.pos[1] - this.prevPos[1], this.pos[0] - this.prevPos[0]);
    /*this.direct += this.angular;
    if (
      this.direct > this.options.direct + this.options.angular_limit ||
      this.direct < this.options.direct - this.options.angular_limit
    ) {
      this.angular *= -1;
    }*/
    this.lifespan > 0 && this.lifespan--;
  }
  render(ctx, strokeStyle) {
    if (this.lifespan <= 0) return;
    ctx.beginPath();
    let rate = this.lifespan / this.maxlife;
    ctx.globalAlpha = rate;
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = rate * this.options.thickness;
    ctx.moveTo(this.prevPos[0], this.prevPos[1]);
    ctx.lineTo(this.pos[0], this.pos[1]);
    ctx.stroke();
  }
}
export { Spark };
