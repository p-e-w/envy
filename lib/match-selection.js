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
import {getTextRegex} from './utilities';

export class MatchSelector extends SingleSelectionTransformer {
  constructor(selectInLines) {
    super();
    this.selectInLines = selectInLines;
  }

  transformSingle(selection) {
    if (selection.isEmpty())
      return [selection];

    let result = [];

    let regex = getTextRegex(selection.getText());
    let iterator = ({range}) => result.push(range);

    if (this.selectInLines) {
      this.editor.scanInBufferRange(regex, [[selection.start.row, 0], [selection.end.row, Infinity]], iterator);
    } else {
      this.editor.scan(regex, iterator);
    }

    return result;
  }
}

export class MatchSelectionMover extends SingleSelectionTransformer {
  constructor(direction) {
    super();
    this.direction = direction;
  }

  transformSingle(selection) {
    if (selection.isEmpty())
      return [selection];

    let regex = getTextRegex(selection.getText());
    let startPosition = (this.direction > 0) ? selection.end : selection.start;

    let match = this.getNthMatch(regex, startPosition, this.direction);

    return [(match === null) ? selection : match];
  }
}
