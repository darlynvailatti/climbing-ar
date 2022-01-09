export interface CircleRenderizationMetadata {
  x: number;
  y: number;
  radius: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
  strokeWidth?: number;
}

export interface CircleMetadata {
  renderizationMetadata: CircleRenderizationMetadata;
}

export class Circle {
  number?: number;
  touched?: boolean;
  renderizationMetadata: CircleRenderizationMetadata;

  constructor(metaData: CircleMetadata) {
    this.touched = false;
    this.renderizationMetadata = metaData.renderizationMetadata;
  }

  updateRenderizationMetadata(
    renderizationMetadata: CircleRenderizationMetadata
  ) {
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

export class CircleGame {
  circles: Array<Circle>;

  constructor() {
    this.circles = [];
  }

  addCircle(ball: Circle) {
    const number = this.circles.length + 1;
    ball.number = number;
    this.circles.push(ball);
  }

  removeCircle(number: number) {
    this.circles = this.circles.filter((b) => b.number !== number);
  }

  resetGame() {
    this.circles.map((c) => (c.touched = false));
  }

  resetCirclesState() {
    this.circles = [];
  }
}
