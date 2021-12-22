class CanvasAnimator {
  /**
   * @type {boolean}
   */
  #enabled;
  /**
   * @type {[number, number]}
   */
  #size;
  /**
   * @type {number?}
  */
  #callbackId;
  /**
   * @type {number}
  */
  #prevFrameTime;

  /**
   * @param {HTMLCanvasElement} canvas 
   */
  constructor(canvas) {
    /**
     * @type {HTMLCanvasElement}
     */
    this.canvas = canvas;
    /**
     * @type {CanvasRenderingContext2D}
     */
    this.context = canvas.getContext('2d');
    this.#size = [0, 0];

    this.onWindowResized();
    this.#enabled = true;
    this.#callbackId = requestAnimationFrame(this.#tick);
    this.#prevFrameTime = -1;
    /**
     * @type {Renderable[]}
     */
    this.renderables = [];
  }

  get isEnabled() {
    return this.#enabled;
  }

  get centerTop() {
    return [this.#size[0] / 2, 0];
  }

  get centerCenter() {
    return [this.#size[0] / 2, this.#size[1] / 2];
  }

  setEnable(state) {
    this.#enabled = state;
  }

  onWindowResized = () => {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.#size = [window.innerWidth, window.innerHeight];
    this.context.clearRect(0, 0, this.#size[0], this.#size[1]);
  }

  #tick = () => {
    if (!this.isEnabled) {
      return;
    }

    let delta = this.#prevFrameTime === -1 ? 0 : (performance.now() - this.#prevFrameTime) / 1000;
    this.render(delta);
    this.#prevFrameTime = performance.now();
    this.#callbackId = requestAnimationFrame(this.#tick);
  }

  dispose() {
    cancelAnimationFrame(this.#callbackId);
    this.renderables.length = 0;
  }

  render(delta) {
    this.context.clearRect(0, 0, this.#size[0], this.#size[1]);
    this.renderables.forEach(it => it.render(this.context, delta));
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   * @returns {boolean}
   */
  isInsideCanvas(x, y, w, h) {
    return x + w >= 0 && y + h >= 0 && x <= this.#size[0] && y <= this.#size[1];
  }
}

class Renderable {
  /**
   * @param {CanvasAnimator} animator 
   */
  constructor(animator) {
    animator.renderables.push(this);
    this.animator = animator;
  }

  /**
   * 
   * @param {CanvasRenderingContext2D} context
   * @param {number} deltaTime
   */
  render(context, deltaTime) { }

  destory() {
    this.animator.renderables = this.animator.renderables.filter(it => it !== this);
  }
}

class TextRenderer extends Renderable {
  /**
   * @type {[number, number]}
   */
  pos;
  /**
   * @type {[number, number]}
   */
  vel;
  /**
   * @type {[number, number]}
   */
  acc;

  /**
   * @param {CanvasAnimator} animator 
   * @param {string} text
   * @param {number} x
   * @param {number} y
   * @param {string} color
   * @param {string} font
   * @param {[number, number]} accerelation
   */
  constructor(animator, text, x, y, color, font, accerelation) {
    super(animator);
    this.text = text;
    this.color = color;
    this.font = font;
    let bound = this.getBound();
    this.pos = [x - bound[0], y - bound[1]];
    this.vel = [0, 0];
    this.acc = accerelation || [0, 0];
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {number} deltaTime
   */
  render(context, deltaTime) {
    context.fillStyle = this.color;
    context.font = this.font;
    this.vel = [this.vel[0] + this.acc[0] * deltaTime, this.vel[1] + this.acc[1] * deltaTime];
    this.pos = [this.pos[0] + this.vel[0] * deltaTime, this.pos[1] + this.vel[1] * deltaTime];
    context.fillText(this.text, this.pos[0], this.pos[1]);

    if (!this.animator.isInsideCanvas(this.pos[0], this.pos[1], ...this.getBound())) {
      this.destory();
    }
  }

  getBound() {
    let span = document.createElement('span');
    span.textContent = this.text;
    span.style.font = this.font;

    return [span.clientWidth, span.clientHeight];
  }
}
