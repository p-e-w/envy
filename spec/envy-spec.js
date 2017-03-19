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

import fs from 'fs';
import path from 'path';

// Return value: [text without selection annotations, selection ranges]
function extractSelections(text) {
  let regex = /<\|([\s\S]*?)\|>/g;

  let selections = [];

  let match;
  let i = 0;

  while ((match = regex.exec(text)) !== null) {
    // For every preceding selection annotation, 4 characters are removed
    let start = match.index - (4 * i);
    selections.push([start, start + match[1].length]);
    i++;
  }

  return [text.replace(regex, (match, p1) => p1), selections];
}

describe('Envy', () => {
  let editor;
  let editorElement;

  beforeEach(() => {
    // The bracket-matcher package contains the bracket character pairs used by Envy
    waitsForPromise(() => atom.packages.activatePackage('bracket-matcher'));

    waitsForPromise(() => atom.packages.activatePackage('envy'));

    waitsForPromise(() => atom.workspace.open().then(e => {
      editor = e;
      editorElement = atom.views.getView(e);
    }));
  });

  describe('when the envy:toggle command is executed', () => {
    it('toggles the envy-mode class on the editor', () => {
      expect(editorElement.classList.contains('envy-mode')).toBe(false);
      atom.commands.dispatch(editorElement, 'envy:toggle');
      expect(editorElement.classList.contains('envy-mode')).toBe(true);
      atom.commands.dispatch(editorElement, 'envy:toggle');
      expect(editorElement.classList.contains('envy-mode')).toBe(false);
    });
  });

  let testsDir = path.join(__dirname, 'tests');

  for (let file of fs.readdirSync(testsDir)) {
    let filePath = path.join(testsDir, file);

    if (path.extname(file) === '.test' && fs.lstatSync(filePath).isFile()) {
      describe(file, () => {
        let contents = fs.readFileSync(filePath, {encoding: 'utf8'});

        let parts = contents.split('\n---\n');

        for (let i = 0; i < parts.length - 3; i += 3) {
          let [before, description, commands, after] = parts.slice(i, i + 4);

          it(description, () => {
            let [text, selections] = extractSelections(before);
            editor.setText(text);
            editor.setSelectedBufferRanges(selections.map(selection => {
              return selection.map(index => editor.getBuffer().positionForCharacterIndex(index));
            }));

            for (let command of commands.split('\n')) {
              atom.commands.dispatch(editorElement, command);
            }

            [text, selections] = extractSelections(after);
            let actualSelections = editor.getSelectionsOrderedByBufferPosition().map(selection => {
              let range = selection.getBufferRange();
              return [range.start, range.end].map(point => editor.getBuffer().characterIndexForPosition(point));
            });
            expect(editor.getText()).toBe(text);
            expect(actualSelections).toEqual(selections);
          });
        }
      });
    }
  }
});
