import { Circle } from "./circle";
import { Score } from "./score";
import { StartCheckPoint } from "./widgets";

export class CircleGame {
  circles: Array<Circle>;
  isStarted: boolean;
  score: Score;
  startCheckpoint: StartCheckPoint;

  constructor() {
    this.circles = [];
    this.isStarted = false;
    this.score = new Score();
    this.startCheckpoint = new StartCheckPoint();
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
