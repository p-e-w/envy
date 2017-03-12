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

import _ from 'underscore-plus';

const nonWordCharacters = atom.config.get('editor.nonWordCharacters');

const wordRegex = new RegExp('^[^\\s' + _.escapeRegExp(nonWordCharacters) + ']+$');
const nonWordRegex = new RegExp('^[' + _.escapeRegExp(nonWordCharacters) + ']+$');
const whitespaceRegex = /^\s+$/;

export function getTextType(text) {
  if (text.length === 0) {
    return -1;
  } else if (wordRegex.test(text)) {
    return 2;
  } else if (nonWordRegex.test(text)) {
    return 1;
  } else if (whitespaceRegex.test(text)) {
    return 0;
  } else {
    // Mixed
    return -1;
  }
}

export function getTextRegex(text) {
  return new RegExp(_.escapeRegExp(text), 'g');
}

// Return value: [unmatched opening brackets, unmatched closing brackets]
export function getBracketBalance(bracketPair, text) {
  // Matches either half of the pair
  let pairRegex = new RegExp(bracketPair[0].source + '|' + bracketPair[1].source, 'g');

  let openingBrackets = 0;
  let closingBrackets = 0;

  for (let match of (text.match(pairRegex) || [])) {
    if (match.match(bracketPair[0]) !== null) {
      // Opening bracket
      openingBrackets++;
    } else if (match.match(bracketPair[1]) !== null) {
      // Closing bracket
      if (openingBrackets > 0) {
        openingBrackets--;
      } else {
        closingBrackets++;
      }
    } else {
      throw 'Unexpected match!';
    }
  }

  return [openingBrackets, closingBrackets];
}
