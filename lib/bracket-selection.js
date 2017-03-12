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
import {getTextRegex, getBracketBalance} from './utilities';

let unpairedBrackets = [];
let pairedBrackets = [
  // XML tag pair
  [/<[a-zA-Z](?:[^>]*[^/>])?>/g, /<\/[a-zA-Z]+>/g],
  // XML comment
  [/<!--/g, /-->/g],
  // C-style comment
  [/\/\*/g, /\*\//g]
];

const autocompleteCharacters = atom.config.get('bracket-matcher.autocompleteCharacters');

for (let characterPair of autocompleteCharacters.map(s => Array.from(s))) {
  if (characterPair[0] === characterPair[1]) {
    unpairedBrackets.push(getTextRegex(characterPair[0]));
  } else {
    pairedBrackets.push(characterPair.map(getTextRegex));
  }
}

export class BracketSelector extends SingleSelectionTransformer {
  transformSingle(selection) {
    let matches = [];

    for (let bracket of unpairedBrackets) {
      // Only expand to unpaired brackets of types not contained in the selection
      if (selection.getMatchCount(bracket) === 0) {
        let startRange = this.getNthMatch(bracket, selection.start, -1);
        let endRange = this.getNthMatch(bracket, selection.end, 1);

        // Only accept single-line ranges for unpaired brackets
        // to avoid matching unrelated brackets across the buffer
        if (startRange !== null && endRange !== null && startRange.end.row === endRange.start.row) {
          matches.push({
            startRange: startRange,
            endRange: endRange
          });
        }
      }
    }

    for (let bracketPair of pairedBrackets) {
      let startRange = this.getNthMatch(bracketPair[0], selection.start, -1);
      let endRange = this.getNthMatch(bracketPair[1], selection.end, 1);

      while (startRange !== null && endRange !== null) {
        let bracketText = this.editor.getTextInBufferRange([startRange.end, endRange.start]);
        let bracketBalance = getBracketBalance(bracketPair, bracketText);

        if (bracketBalance[0] === 0 && bracketBalance[1] === 0)
          break;

        if (bracketBalance[1] > 0)
          startRange = this.getNthMatch(bracketPair[0], startRange.start, -bracketBalance[1]);

        if (bracketBalance[0] > 0)
          endRange = this.getNthMatch(bracketPair[1], endRange.end, bracketBalance[0]);
      }

      if (startRange !== null && endRange !== null) {
        matches.push({
          startRange: startRange,
          endRange: endRange
        });
      }
    }

    if (matches.length > 0) {
      for (let match of matches) {
        match.score = this.editor.getTextInBufferRange([match.startRange.end, match.endRange.start]).length;
      }

      let bestMatch = matches.sort((a, b) => a.score - b.score)[0];

      if (bestMatch.startRange.end.isEqual(selection.start) && bestMatch.endRange.start.isEqual(selection.end)) {
        // Selection completely covers the range enclosed by the brackets => expand to outside of brackets
        return [[bestMatch.startRange.start, bestMatch.endRange.end]];
      } else {
        // Expand to inside of brackets
        return [[bestMatch.startRange.end, bestMatch.endRange.start]];
      }

    } else {
      return [selection];
    }
  }
}

export class BracketSelectionMover extends SingleSelectionTransformer {
  constructor(direction) {
    super();
    this.direction = direction;
  }

  transformSingle(selection) {
    let matches = [];

    for (let bracket of unpairedBrackets) {
      let startPosition = (this.direction > 0) ? selection.end : selection.start;

      let startRange = null;
      let endRange = null;

      while (true) {
        startRange = this.getNthMatch(bracket, startPosition, this.direction);
        if (startRange === null)
          break;

        startPosition = (this.direction > 0) ? startRange.end : startRange.start;
        endRange = this.getNthMatch(bracket, startPosition, this.direction);
        if (endRange === null)
          break;

        if (startRange.end.row === endRange.start.row)
          break;
      }

      if (startRange !== null && endRange !== null) {
        matches.push({
          startRange: (this.direction > 0) ? startRange : endRange,
          endRange: (this.direction > 0) ? endRange : startRange
        });
      }
    }

    for (let bracketPair of pairedBrackets) {
      let startPosition = (this.direction > 0) ? selection.end : selection.start;
      let startRange = this.getNthMatch(bracketPair[(this.direction > 0) ? 0 : 1], startPosition, this.direction);

      if (startRange !== null) {
        startPosition = (this.direction > 0) ? startRange.end : startRange.start;
        let endRange = this.getNthMatch(bracketPair[(this.direction > 0) ? 1 : 0], startPosition, this.direction);

        while (endRange !== null) {
          let bracketText = this.editor.getTextInBufferRange((this.direction > 0) ?
              [startRange.end, endRange.start] :
              [endRange.end, startRange.start]);
          let bracketBalance = getBracketBalance(bracketPair, bracketText);

          if (bracketBalance[0] === 0 && bracketBalance[1] === 0)
            break;

          if (bracketBalance[0] > 0 && this.direction > 0) {
            endRange = this.getNthMatch(bracketPair[1], endRange.end, bracketBalance[0]);
          } else if (bracketBalance[1] > 0 && this.direction < 0) {
            endRange = this.getNthMatch(bracketPair[0], endRange.start, -bracketBalance[1]);
          } else {
            throw 'Unexpected bracket balance!';
          }
        }

        if (endRange !== null) {
          matches.push({
            startRange: (this.direction > 0) ? startRange : endRange,
            endRange: (this.direction > 0) ? endRange : startRange
          });
        }
      }
    }

    if (matches.length > 0) {
      for (let match of matches) {
        let distanceRange = (this.direction > 0) ?
            [selection.end, match.startRange.start] :
            [selection.start, match.endRange.end];
        match.score = this.editor.getTextInBufferRange(distanceRange).length;
      }
      let bestMatch = matches.sort((a, b) => a.score - b.score)[0];
      return [[bestMatch.startRange.start, bestMatch.endRange.end]];
    } else {
      return [selection];
    }
  }
}
