import { CommonRenderizationMeta } from "./common";

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
