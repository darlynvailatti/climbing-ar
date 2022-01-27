import { CommonRenderizationMeta } from "./common";

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
