export interface CommonRenderizationMeta {
  x: number;
  y: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
  strokeWidth?: number;
}

export interface CircleRenderizationMeta extends CommonRenderizationMeta {
  radius: number;
}

export interface CircleMetadata {
  renderizationMetadata: CircleRenderizationMeta;
}

export class Circle {
  number?: number;
  touched?: boolean;
  renderizationMetadata: CircleRenderizationMeta;

  constructor(metaData: CircleMetadata) {
    this.touched = false;
    this.renderizationMetadata = metaData.renderizationMetadata;
  }

  updateRenderizationMetadata(renderizationMetadata: CircleRenderizationMeta) {
    this.renderizationMetadata = { ...renderizationMetadata };
  }

  touch() {
    this.touched = !this.touched;
  }

  didColide(x: number, y: number, radius: number) {
    const circleRadius = this.renderizationMetadata.radius;
    const circleX = this.renderizationMetadata.x;
    const circleY = this.renderizationMetadata.y;
    var dx = circleX + circleRadius - (x + radius);
    var dy = circleY + circleRadius - (y + radius);
    var distance = Math.sqrt(dx * dx + dy * dy);
    return distance < circleRadius + radius;
  }
}

export interface ScoreRenderizationMeta extends CommonRenderizationMeta {}

export class Score {
  value: number;
  renderizationMeta: ScoreRenderizationMeta;

  constructor(renderizationMeta?: ScoreRenderizationMeta) {
    this.value = 0;
    this.renderizationMeta = renderizationMeta ?? {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
  }

  updateRenderizationMeta(renderizationMeta: ScoreRenderizationMeta) {
    this.renderizationMeta = { ...renderizationMeta };
  }
}

export class CircleGame {
  circles: Array<Circle>;
  isStarted: boolean;
  score: Score;

  constructor() {
    this.circles = [];
    this.isStarted = false;
    this.score = new Score();
  }

  start() {
    this.isStarted = true;
  }

  stop() {
    this.isStarted = false;
  }

  addCircle(ball: Circle) {
    const number = this.circles.length + 1;
    ball.number = number;
    this.circles.push(ball);
  }

  removeCircle(number: number) {
    this.circles = this.circles.filter((b) => b.number !== number);
  }

  updateCircle(circle: Circle, updateCallback: (circle: Circle) => void) {
    // do some other stuff
    console.log(`Circle ${circle.number} was updated`);
    updateCallback(circle);
  }

  resetGame() {
    this.circles.map((c) => (c.touched = false));
    this.score.value = 0;
  }

  resetCirclesState() {
    this.circles = [];
  }

  touch(circle: Circle) {
    circle.touch();
    this.updateScore(circle);
  }

  updateScore(circle: Circle) {
    this.score.value += circle.renderizationMetadata.radius;
    this.score.value = Math.trunc(this.score.value);
  }
}
