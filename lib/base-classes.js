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

export class EditorContext {
  get editor() {
    return atom.workspace.getActiveTextEditor();
  }

  isEmptyLine(row) {
    return row < 0 || row > this.editor.getLastBufferRow() || this.editor.getBuffer().isRowBlank(row);
  }

  getNthMatch(regex, startPosition, n) {
    let match = null;

    let i = 0;

    let iterator = ({range, stop}) => {
      i++;
      if (i === Math.abs(n)) {
        match = range;
        stop();
      }
    };

    if (n > 0) {
      this.editor.scanInBufferRange(regex, [startPosition, [Infinity, Infinity]], iterator);
    } else {
      this.editor.backwardsScanInBufferRange(regex, [[0, 0], startPosition], iterator);
    }

    return match;
  }
}

export class SelectionTransformer extends EditorContext {
  transform(selections) {
    throw 'Method not implemented!';
  }
}

export class SingleSelectionTransformer extends SelectionTransformer {
  transform(selections) {
    let result = [];
    for (let i = 0; i < selections.length; i++) {
      for (let transformedSelection of this.transformSingle(selections[i], i, selections)) {
        result.push(transformedSelection);
      }
    }
    return result;
  }

  transformSingle(selection, i, selections) {
    throw 'Method not implemented!';
  }
}

export class MapSelectionTransformer extends SingleSelectionTransformer {
  constructor(callback) {
    super();
    this.transformSingle = callback;
  }
}

export class SelectionFilter extends MapSelectionTransformer {
  constructor(filter) {
    super((selection, i, selections) => filter(selection, i, selections) ? [selection] : []);
  }
}
