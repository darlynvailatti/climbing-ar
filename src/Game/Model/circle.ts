import { CommonRenderizationMeta } from "./common";

export interface CircleRenderizationMeta extends CommonRenderizationMeta {
  radius: number;
}

export interface CircleMetadata {
  renderizationMetadata: CircleRenderizationMeta;
}

export class Circle {
  number: number;
  touched?: boolean;
  renderizationMetadata: CircleRenderizationMeta;

  constructor(number: number, metaData: CircleMetadata) {
    this.number = number
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
    const circleRadius = this.renderizationMetadata.radius * Math.max(this.renderizationMetadata.scaleX || 1, this.renderizationMetadata.scaleY || 1);
    const circleX = this.renderizationMetadata.x;
    const circleY = this.renderizationMetadata.y;
    const d = Math.sqrt((circleX - x) ** 2 + (circleY - y) ** 2);
    return d <= radius + circleRadius;
  }
}
