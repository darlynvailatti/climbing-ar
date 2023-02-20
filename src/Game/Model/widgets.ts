import { CommonRenderizationMeta } from "./common";

export interface StartCheckPointRenderizationMeta
  extends CommonRenderizationMeta {
  radius: number;
}

export class StartCheckPoint {
  lastTimeWasTouched: number;
  lastTimeWasActivated: number;
  touched: boolean;
  active: boolean;
  renderizationMeta: StartCheckPointRenderizationMeta;

  constructor(renderizationMeta?: StartCheckPointRenderizationMeta) {
    this.lastTimeWasTouched = 0;
    this.lastTimeWasActivated = 0;
    this.active = false;
    this.touched = false;
    this.renderizationMeta = renderizationMeta ?? {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      radius: 30,
      scaleX: 1,
      scaleY: 1
    };
  }

  setIsActive() {
    this.active = true;
  }

  setIsInactive() {
    this.active = false;
  }

  setUntouched() {
    this.touched = false;
    this.lastTimeWasTouched = Date.now();
  }

  setTouched() {
    this.touched = true;
    this.lastTimeWasTouched = Date.now();
  }

  updateRenderizationMeta(renderizationMeta: StartCheckPointRenderizationMeta) {
    this.renderizationMeta = { ...renderizationMeta };
  }

  didColide(x: number, y: number, radius: number): boolean {
    const circleRadius = this.renderizationMeta.radius * Math.max(this.renderizationMeta.scaleX || 1, this.renderizationMeta.scaleY || 1);
    const circleX = this.renderizationMeta.x
    const circleY = this.renderizationMeta.y
    const d = Math.sqrt((circleX - x) ** 2 + (circleY - y) ** 2);
    return d <= radius + circleRadius;
  }

  checkTrigger(): void {
    if (this.lastTimeWasTouched === 0) {
      this.lastTimeWasTouched = Date.now();
    }

    if (this.lastTimeWasActivated === 0) {
      this.lastTimeWasActivated = Date.now();
    }

    const elapsedTimeSinceWasActivate = Date.now() - this.lastTimeWasActivated;

    // Timeout, reset
    if (elapsedTimeSinceWasActivate > 5000) {
      this.lastTimeWasTouched = Date.now();
      this.lastTimeWasActivated = Date.now();
    }

    const elapsedTimeSinceLastTouch = Date.now() - this.lastTimeWasTouched;

    if (elapsedTimeSinceLastTouch >= 2000 && this.touched) {
      this.setIsActive();
      this.lastTimeWasActivated = Date.now();
    } else {
      this.setIsInactive();
    }
  }
}
