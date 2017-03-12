'use babel';

/*
 * Envy - Text editing supercharger
 *
 * Copyright (c) 2017 Philipp Emanuel Weidmann <pew@worldwidemann.com>
 *
 * Nemo vir est qui mundum non reddat meliorem.
 *
 * Released under the terms of the MIT License
 * (https://opensource.org/licenses/MIT)
 */

import {Point} from 'atom';

import {EditorContext} from './base-classes';
import {getTextType} from './utilities';

// An editor-aware "Point" alternative
export default class Position extends EditorContext {
  constructor(row, column) {
    super();
    this.row = row;
    this.column = column;
  }

  static fromPoint(point) {
    point = Point.fromObject(point);
    return new Position(point.row, point.column);
  }

  toPoint() {
    return new Point(this.row, this.column);
  }

  isEqual(position) {
    return this.toPoint().isEqual(position);
  }

  copy(row = this.row, column = this.column) {
    return new Position(row, column);
  }

  setClipped(row, column) {
    let point = this.editor.clipBufferPosition([row, column]);
    this.row = point.row;
    this.column = point.column;
  }

  isBufferStart() {
    return this.isEqual([0, 0]);
  }

  isBufferEnd() {
    return this.isEqual(this.editor.getBuffer().getEndPosition());
  }

  isLineStart() {
    return this.column === 0;
  }

  isLineEnd() {
    return this.column === this.editor.getBuffer().lineLengthForRow(this.row);
  }

  getRelativePosition(offset) {
    let position = this.copy();

    for (let i = 0; i < Math.abs(offset); i++) {
      if (offset > 0) {
        if (position.isLineEnd()) {
          position.setClipped(position.row + 1, 0);
        } else {
          position.column++;
        }
      } else {
        if (position.isLineStart()) {
          position.setClipped(position.row - 1, Infinity);
        } else {
          position.column--;
        }
      }
    }

    return position;
  }

  getRelativeText(offset) {
    return this.editor.getTextInBufferRange([this, this.getRelativePosition(offset)]);
  }

  getRelativeTextType(offset) {
    return getTextType(this.getRelativeText(offset));
  }

  canExpandTextType(textType, direction) {
    return textType >= 0 && this.getRelativeTextType(direction) === textType &&
        !((direction > 0) ? this.isLineEnd() : this.isLineStart());
  }
}
