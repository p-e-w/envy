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

import {Range} from 'atom';

import {EditorContext} from './base-classes';
import {getTextType} from './utilities';
import Position from './position';

// An editor-aware "Range" alternative
export default class Extent extends EditorContext {
  constructor(start, end) {
    super();
    this.start = new Position(start[0], start[1]);
    this.end = new Position(end[0], end[1]);
  }

  static fromRange(range) {
    range = Range.fromObject(range);
    return new Extent([range.start.row, range.start.column], [range.end.row, range.end.column]);
  }

  toRange() {
    return new Range(this.start, this.end);
  }

  isEqual(extent) {
    return this.toRange().isEqual(extent);
  }

  isEmpty() {
    return this.toRange().isEmpty();
  }

  isSingleLine() {
    return this.toRange().isSingleLine();
  }

  isFullLine() {
    return (this.start.isLineStart() && this.end.isLineEnd() && this.isSingleLine()) ||
        (this.start.isLineStart() && this.end.isLineStart() && this.end.row === this.start.row + 1);
  }

  isFullLines() {
    return (this.start.isLineStart() && this.end.isLineEnd()) ||
        (this.start.isLineStart() && this.end.isLineStart() && !this.isSingleLine());
  }

  getText() {
    return this.editor.getTextInBufferRange(this);
  }

  getTextType() {
    if (this.isEmpty()) {
      // Choose the higher priority type
      return Math.max(this.start.getRelativeTextType(-1), this.end.getRelativeTextType(1));
    } else {
      return getTextType(this.getText());
    }
  }

  getMatchCount(regex) {
    // http://stackoverflow.com/q/1072765#comment9785878_1072782
    return (this.getText().match(regex) || []).length;
  }
}
