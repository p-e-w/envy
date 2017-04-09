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

import {CompositeDisposable} from 'atom';

import Clipboard from './clipboard';
import Extent from './extent';
import {SelectionTransformer, MapSelectionTransformer, SelectionFilter} from './base-classes';
import SelectionInverter from './selection-inverter';
import {BracketSelector, BracketSelectionMover} from './bracket-selection';
import {BlockSelector, BlockSelectionMover} from './block-selection';
import {MatchSelector, MatchSelectionMover} from './match-selection';

export default {
  subscriptions: null,

  secondaryClipboard: new Clipboard(),

  activate(state) {
    let commands = {
      'envy:toggle': function() {
        this.classList.toggle('envy-mode');
      },

      'envy:select-all-brackets': () => this.transformSelectionsCumulative(
          [new BracketSelectionMover(-1), new BracketSelectionMover(1)]),
      'envy:select-all-blocks': () => this.transformSelectionsCumulative(
          [new BlockSelectionMover(-1, true), new BlockSelectionMover(1, true)]),

      'envy:copy-to-secondary-clipboard': () => this.secondaryClipboard.copy(),
      'envy:paste-from-secondary-clipboard': () => this.secondaryClipboard.paste(),
      'envy:cut-to-secondary-clipboard': () => this.secondaryClipboard.cut(),

      'envy:swap-selections': () => this.replaceSelections((i, selectionTexts) => {
        // Replace with text of other selection in pair (1 <-> 2, 3 <-> 4 etc.)
        if (i % 2 === 1) {
          return selectionTexts[i - 1];
        } else if (i < selectionTexts.length - 1) {
          return selectionTexts[i + 1];
        } else {
          return null;
        }
      }),
      'envy:swap-selections-alternative': () => this.replaceSelections((i, selectionTexts) => {
        // Replace with text of other selection in pair (1 <-> 3, 2 <-> 4 etc.)
        if (i % 4 >= 2) {
          return selectionTexts[i - 2];
        } else if (i < selectionTexts.length - 2) {
          return selectionTexts[i + 2];
        } else {
          return null;
        }
      }),

      'envy:rotate-selections-forward': () => this.replaceSelections(
          (i, selectionTexts) => selectionTexts[(i - 1 + selectionTexts.length) % selectionTexts.length]),
      'envy:rotate-selections-backward': () => this.replaceSelections(
          (i, selectionTexts) => selectionTexts[(i + 1) % selectionTexts.length]),

      'envy:left-align-selections': () => this.alignSelections(false),
      'envy:right-align-selections': () => this.alignSelections(true)
    };

    let selectionTransformerCommands = [
      ['remove-every-second-selection-even', new SelectionFilter((s, i) => i % 2 === 0), false],
      ['remove-every-second-selection-odd', new SelectionFilter((s, i) => i % 2 === 1), false],

      ['split-selections-into-cursors', new MapSelectionTransformer(s => [[s.start, s.start], [s.end, s.end]]), false],

      ['invert-selections-in-lines', new SelectionInverter(true), false],
      ['invert-selections', new SelectionInverter(false), false],

      ['select-surrounding-brackets', new BracketSelector(), false],
      ['move-bracket-selection-backward', new BracketSelectionMover(-1), false],
      ['add-bracket-selection-backward', new BracketSelectionMover(-1), true],
      ['move-bracket-selection-forward', new BracketSelectionMover(1), false],
      ['add-bracket-selection-forward', new BracketSelectionMover(1), true],

      ['select-surrounding-block', new BlockSelector(), false],
      ['move-block-selection-backward', new BlockSelectionMover(-1, true), false],
      ['add-block-selection-backward', new BlockSelectionMover(-1, true), true],
      ['move-block-selection-backward-alternative', new BlockSelectionMover(-1, false), false],
      ['add-block-selection-backward-alternative', new BlockSelectionMover(-1, false), true],
      ['move-block-selection-forward', new BlockSelectionMover(1, true), false],
      ['add-block-selection-forward', new BlockSelectionMover(1, true), true],
      ['move-block-selection-forward-alternative', new BlockSelectionMover(1, false), false],
      ['add-block-selection-forward-alternative', new BlockSelectionMover(1, false), true],

      ['select-all-matches-in-lines', new MatchSelector(true), false],
      ['select-all-matches', new MatchSelector(false), false],
      ['select-previous-match', new MatchSelectionMover(-1), false],
      ['add-select-previous-match', new MatchSelectionMover(-1), true],
      ['select-next-match', new MatchSelectionMover(1), false],
      ['add-select-next-match', new MatchSelectionMover(1), true]
    ];

    for (let command of selectionTransformerCommands) {
      commands['envy:' + command[0]] = () => this.transformSelections(command[1], command[2]);
    }

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-text-editor', commands));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  transformSelections(transformer, addToExistingSelections) {
    if (!(transformer instanceof SelectionTransformer))
      throw 'transformer must be an instance of SelectionTransformer!';

    let editor = atom.workspace.getActiveTextEditor();

    let selections = editor.getSelectionsOrderedByBufferPosition().map(s => Extent.fromRange(s.getBufferRange()));

    let transformedSelections = transformer.transform(selections);

    if (addToExistingSelections) {
      for (let selection of transformedSelections) {
        selections.push(selection);
      }
    } else {
      selections = transformedSelections;
    }

    if (selections.length > 0)
      editor.setSelectedBufferRanges(selections);
  },

  transformSelectionsCumulative(transformers) {
    let buffer = atom.workspace.getActiveTextEditor().getBuffer();

    this.transformSelections(new MapSelectionTransformer(selection => {
      let result = [];

      for (let transformer of transformers) {
        let currentSelection = selection;

        while (true) {
          let nextSelection = transformer.transform([currentSelection])[0];
          nextSelection = buffer.clipRange(nextSelection);
          nextSelection = Extent.fromRange(nextSelection);

          if (nextSelection.isEqual(currentSelection))
            break;

          result.push(nextSelection);
          currentSelection = nextSelection;
        }
      }

      return result;
    }), true);
  },

  replaceSelections(callback) {
    let editor = atom.workspace.getActiveTextEditor();

    let selectionTexts = editor.getSelectionsOrderedByBufferPosition().map(selection => selection.getText());

    editor.mutateSelectedText((selection, i) => {
      let replacementText = callback(i, selectionTexts);

      if (replacementText !== null) {
        let range = selection.getBufferRange();
        selection.insertText(replacementText);
        selection.setBufferRange([range.start, selection.getBufferRange().end]);
      }
    });
  },

  alignSelections(alignRight) {
    let editor = atom.workspace.getActiveTextEditor();

    let selections = editor.getSelectionsOrderedByBufferPosition();

    let binnedSelections = [];

    for (let i = 0; i < selections.length; i++) {
      let row = selections[i].getBufferRange().start.row;

      // bin = index of selection among selections on the same line
      let bin = 0;
      for (let j = i - 1; j >= 0; j--) {
        if (selections[j].getBufferRange().start.row !== row)
          break;
        bin++;
      }

      if (!(bin in binnedSelections))
        binnedSelections[bin] = [];

      binnedSelections[bin].push(selections[i]);
    }

    editor.transact(() => {
      for (let binSelections of binnedSelections) {
        let maxColumn = 0;

        for (let selection of binSelections) {
          let range = selection.getBufferRange();
          maxColumn = Math.max(maxColumn, alignRight ? range.end.column : range.start.column);
        }

        for (let selection of binSelections) {
          let range = selection.getBufferRange();
          let start = range.start;
          let padding = ' '.repeat(maxColumn - (alignRight ? range.end.column : start.column));
          editor.setTextInBufferRange([start, start], padding);
          selection.setBufferRange([[start.row, start.column + padding.length], selection.getBufferRange().end]);
        }
      }
    });
  }
};
