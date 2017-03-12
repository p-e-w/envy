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

import {SingleSelectionTransformer} from './base-classes';
import {getTextType} from './utilities';

export class BlockSelector extends SingleSelectionTransformer {
  transformSingle(selection) {
    let start = selection.start;
    let end = selection.end;

    if (selection.isSingleLine()) {
      let textType = selection.getTextType();

      if (start.canExpandTextType(textType, -1) || end.canExpandTextType(textType, 1)) {
        // Expand to token
        while (start.canExpandTextType(textType, -1)) {
          start = start.getRelativePosition(-1);
        }
        while (end.canExpandTextType(textType, 1)) {
          end = end.getRelativePosition(1);
        }
        return [[start, end]];

      } else {
        // Expand to full line
        return [[
          [start.row, 0],
          [end.row + 1, 0]
        ]];
      }

    } else if (selection.isFullLines()) {
      // Expand to paragraph
      let startRow = start.row;
      while (!this.isEmptyLine(startRow - 1)) {
        startRow--;
      }
      let endRow = (end.column === 0) ? end.row - 1 : end.row;
      while (!this.isEmptyLine(endRow + 1)) {
        endRow++;
      }
      return [[
        [startRow, 0],
        [endRow + 1, 0]
      ]];

    } else {
      // Expand to full lines
      return [[
        [start.row, 0],
        [end.row + 1, 0]
      ]];
    }
  }
}

export class BlockSelectionMover extends SingleSelectionTransformer {
  constructor(direction, sameTextType) {
    super();
    this.direction = direction;
    this.sameTextType = sameTextType;
  }

  transformSingle(selection) {
    let textType = selection.getTextType();

    if (selection.isFullLine()) {
      // Move to next line
      return [[
        [selection.start.row + this.direction, 0],
        [selection.start.row + this.direction + 1, 0]
      ]];

    } else if (textType >= 0) {
      // Move to next token
      let start = (this.direction > 0) ? selection.end : selection.start;
      while (start.getRelativeTextType(this.direction) === textType) {
        start = start.getRelativePosition(this.direction);
      }

      let nextTextType = -1;

      if (this.sameTextType) {
        // Find start of next token with same type as selected one
        while (true) {
          let character = start.getRelativeText(this.direction);
          if (character.length === 0) {
            // End of buffer reached
            break;
          }
          if (getTextType(character) === textType) {
            nextTextType = textType;
            break;
          }
          start = start.getRelativePosition(this.direction);
        }
      } else {
        nextTextType = start.getRelativeTextType(this.direction);
      }

      if (nextTextType >= 0) {
        // There is a next token
        let end = start.getRelativePosition(this.direction);
        while (end.getRelativeTextType(this.direction) === nextTextType) {
          end = end.getRelativePosition(this.direction);
        }
        return [[start, end]];
      } else {
        return [selection];
      }

    } else if (selection.isSingleLine()) {
      // Move to next line
      return [[
        [selection.start.row + this.direction, 0],
        [selection.start.row + this.direction + 1, 0]
      ]];

    } else {
      // Move to next paragraph
      let startRow = (this.direction > 0) ?
          (selection.end.isLineStart() ? selection.end.row : selection.end.row + 1) :
          (selection.start.row - 1);

      let buffer = this.editor.getBuffer();

      while (!(!buffer.isRowBlank(startRow) && buffer.isRowBlank(startRow - this.direction))) {
        if (startRow <= 0 || startRow >= this.editor.getLastBufferRow()) {
          // End of buffer reached without finding another paragraph
          return [selection];
        }
        startRow += this.direction;
      }

      let endRow = startRow;

      while (!this.isEmptyLine(endRow + this.direction)) {
        endRow += this.direction;
      }

      return [[
        [Math.min(startRow, endRow), 0],
        [Math.max(startRow, endRow) + 1, 0]
      ]];
    }
  }
}
