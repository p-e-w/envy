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

import {EditorContext} from './base-classes';

export default class Clipboard extends EditorContext {
  constructor() {
    super();
    this.data = [];
  }

  copy() {
    this.data = [];

    // https://github.com/atom/atom/blob/v1.14.4/src/text-editor.coffee#L3108
    for (let selection of this.editor.getSelectionsOrderedByBufferPosition()) {
      if (selection.isEmpty()) {
        // Copy line
        let range = selection.getBufferRange();
        selection.selectLine();
        this.data.push(selection.getText());
        selection.setBufferRange(range);
      } else {
        this.data.push(selection.getText());
      }
    }
  }

  cut() {
    this.copy();

    this.editor.mutateSelectedText(selection => {
      if (selection.isEmpty()) {
        selection.deleteLine();
      } else {
        selection.delete();
      }
    });
  }

  paste() {
    let corresponding = (this.data.length === this.editor.getSelections().length);
    let joinedData = this.data.join('\n');

    this.editor.mutateSelectedText((selection, i) => {
      selection.insertText(corresponding ? this.data[i] : joinedData);
    });
  }
}
