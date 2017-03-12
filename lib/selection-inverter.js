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

import {SelectionTransformer} from './base-classes';

export default class SelectionInverter extends SelectionTransformer {
  constructor(invertInLines) {
    super();
    this.invertInLines = invertInLines;
  }

  transform(selections) {
    let result = [];

    let selectionsStart = selections[0].start;
    let selectionsEnd = selections[selections.length - 1].end;

    if (this.invertInLines) {
      if (!selectionsStart.isLineStart())
        result.push([[selectionsStart.row, 0], selectionsStart]);

      for (let i = 0; i < selections.length - 1; i++) {
        let start = selections[i].end;
        let end = selections[i + 1].start;

        if (start.row === end.row) {
          result.push([start, end]);
        } else {
          if (!start.isLineEnd())
            result.push([start, [start.row, Infinity]]);
          if (!end.isLineStart())
            result.push([[end.row, 0], end]);
        }
      }

      if (!selectionsEnd.isLineEnd())
        result.push([selectionsEnd, [selectionsEnd.row, Infinity]]);

    } else {
      if (!selectionsStart.isBufferStart())
        result.push([[0, 0], selectionsStart]);

      for (let i = 0; i < selections.length - 1; i++) {
        result.push([selections[i].end, selections[i + 1].start]);
      }

      if (!selectionsEnd.isBufferEnd())
        result.push([selectionsEnd, [Infinity, Infinity]]);
    }

    return result;
  }
}
