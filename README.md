<h1 align="center">Envy</h1>
<h3 align="center">Text editing supercharger</h3>
<br>

Envy is an [Atom](https://github.com/atom/atom) :atom: package that provides a switchable mode in which letter keypresses are mapped to text editing operations.

![Screencast](https://cloud.githubusercontent.com/assets/2702526/25304025/4a1e3a0e-274e-11e7-9504-3cf802405cbe.gif)

This approach is shared with the [Vim](http://www.vim.org) family of editors, but only conceptually. Envy doesn't have any key bindings in common with Vim and augments, rather than modifies, the standard Atom editing experience. It simply wouldn't make sense to create yet another Vim clone or derivative – there are already so many. Instead, Envy is built from scratch to be an ergonomic modal editing system without any legacy baggage.

Where applicable, Envy's design choices seek to avoid problems associated with Vim and its descendants. _Envy = N.V. = **N**ot **V**im._ Unlike Vim/[vim-mode](https://github.com/atom/vim-mode), Envy

* takes mere minutes to learn and master
* embraces multiple selections
* has a logical, easy to remember [keyboard layout](#keymap) designed with ergonomics in mind
* has no <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> key bindings and therefore doesn't interfere with other editor shortcuts
* works great with [international keyboards](#using-envy-with-non-us-keyboards) :earth_africa:

Envy offers a much smaller set of operations than Vim, but the easy accessibility of those operations and their tight integration with Atom's editing model means they can be used to their fullest, making Atom+Envy a competitive alternative to established modal text editors.


## Installation

Either run

```
apm install envy
```

from the command line or search for `envy` in Atom's *Install Packages* settings screen and click the *Install* button on the package card.


## Keymap

Vim's default keymap is largely based on mnemonic abbreviations, that is, the letter pressed is found in the English name for the action performed. For example, in Vim, <kbd>B</kbd> and <kbd>E</kbd> move the cursor to the _**b**eginning_ and _**e**nd_ of the word, respectively.

By contrast, **Envy's keymap is based on the _location of keys on the keyboard._** The keyboard is divided into connected groups of keys that perform related actions in a consistent and predictable manner. Thus, on the default QWERTY layout, <kbd>E</kbd>/<kbd>R</kbd> move the selection to the previous/next bracket, <kbd>D</kbd>/<kbd>F</kbd> move it to the previous/next *block* (word, line or paragraph), and <kbd>C</kbd>/<kbd>V</kbd> move it to the previous/next match. For layouts other than QWERTY, [patches are provided](#using-envy-with-non-us-keyboards) that produce the same key arrangement.

**<kbd>Alt+J</kbd> enters Envy mode and <kbd>P</kbd> leaves it.** In Envy mode, this keymap applies:

![Keymap](https://cloud.githubusercontent.com/assets/2702526/25304030/6ce2d1b2-274e-11e7-9e4e-a3910a8b6765.png)

<small>*(Based on https://commons.wikimedia.org/wiki/File:KB_United_States.svg by Denelson83.)*</small>

A detailed listing of all commands and their mapping follows. Note that the *Key* column shows the label of the letter key in the QWERTY keyboard layout, which may be different in another layout (but the physical position of the key is the same across all layouts).

### Cursor movement

#### Arrow keys

| Key | Command | Description |
| --- | --- | --- |
| <kbd>J</kbd> | **Move left** | :arrow_left: Moves each cursor one position to the left.<br>**With <kbd>Shift</kbd>:** Selects instead of moving.<br>**With <kbd>Alt</kbd>:** Moves one subword boundary instead of one position. |
| <kbd>L</kbd> | **Move right** | :arrow_right: Moves each cursor one position to the right.<br>**With <kbd>Shift</kbd>:** Selects instead of moving.<br>**With <kbd>Alt</kbd>:** Moves one subword boundary instead of one position. |
| <kbd>I</kbd> | **Move up** | :arrow_up: Moves each cursor one line up.<br>**With <kbd>Shift</kbd>:** Selects instead of moving.<br>**With <kbd>Alt</kbd>:** Adds a selection above each selection instead of moving cursors. Cannot be combined with <kbd>Shift</kbd>. |
| <kbd>K</kbd> | **Move down** | :arrow_down: Moves each cursor one line down.<br>**With <kbd>Shift</kbd>:** Selects instead of moving.<br>**With <kbd>Alt</kbd>:** Adds a selection below each selection instead of moving cursors. Cannot be combined with <kbd>Shift</kbd>. |

#### Other

| Key | Command | Description |
| --- | --- | --- |
| <kbd>Y</kbd> | **Move to beginning of previous paragraph** | Moves each cursor to the start of the paragraph preceding the cursor.<br>**With <kbd>Shift</kbd>:** Selects instead of moving. |
| <kbd>H</kbd> | **Move to beginning of next paragraph** | Moves each cursor to the start of the paragraph succeeding the cursor.<br>**With <kbd>Shift</kbd>:** Selects instead of moving. |
| <kbd>Alt+Y</kbd> | **Page up** | Moves each cursor one editor page up.<br>**With <kbd>Shift</kbd>:** Selects instead of moving. |
| <kbd>Alt+H</kbd> | **Page down** | Moves each cursor one editor page down.<br>**With <kbd>Shift</kbd>:** Selects instead of moving. |
| <kbd>U</kbd> | **Move to beginning of line** | Moves each cursor to the start of the line it is on.<br>**With <kbd>Shift</kbd>:** Selects instead of moving. |
| <kbd>O</kbd> | **Move to end of line** | Moves each cursor to the end of the line it is on.<br>**With <kbd>Shift</kbd>:** Selects instead of moving. |

### Selection manipulation

#### Brackets

Supported bracket pairs include all pairs defined by the [bracket-matcher](https://github.com/atom/bracket-matcher) Atom core package.

| Key | Command | Description |
| --- | --- | --- |
| <kbd>W</kbd> | **Select surrounding brackets** | Expands each selection to cover the inside of the nearest surrounding bracket pair. If a selection already completely covers the inside of a bracket pair, expands the selection to the outside of that bracket pair. |
| <kbd>Shift+W</kbd> | **Select all brackets** | Repeatedly applies the **Move bracket selection backward/forward** commands (see below) to each selection and creates a selection containing all of the results. |
| <kbd>E</kbd> | **Move bracket selection backward** | Moves each selection to the outside of the first bracket pair that completely precedes the selection.<br>**With <kbd>Shift</kbd>:** Preserves the existing selection. |
| <kbd>R</kbd> | **Move bracket selection forward** | Moves each selection to the outside of the first bracket pair that completely succeeds the selection.<br>**With <kbd>Shift</kbd>:** Preserves the existing selection. |

#### Blocks

In Envy, a *block* is either

* a homogeneous sequence of word characters, non-word characters (excluding whitespace), or whitespace characters (e.g. `abc`, `{.-` and `   `) contained within a single line of text,
* a single line of text, or
* a single paragraph of text.

| Key | Command | Description |
| --- | --- | --- |
| <kbd>S</kbd> | **Select surrounding block** | Expands each selection to cover the nearest block that completely contains the selection. |
| <kbd>Shift+S</kbd> | **Select all blocks** | Repeatedly applies the **Move block selection backward/forward** commands (see below) to each selection and creates a selection containing all of the results. |
| <kbd>D</kbd> | **Move block selection backward** | Moves each selection to the first block of the same type that completely precedes the selection.<br>**With <kbd>Shift</kbd>:** Preserves the existing selection.<br>**With <kbd>Alt</kbd>:** Considers all first-tier blocks (runs of word/non-word/whitespace characters) to be of the same type. |
| <kbd>F</kbd> | **Move block selection forward** | Moves each selection to the first block of the same type that completely succeeds the selection.<br>**With <kbd>Shift</kbd>:** Preserves the existing selection.<br>**With <kbd>Alt</kbd>:** Considers all first-tier blocks (runs of word/non-word/whitespace characters) to be of the same type. |

#### Matches

| Key | Command | Description |
| --- | --- | --- |
| <kbd>X</kbd> | **Select all matches** | For each selection, selects all occurrences of the selected text in the lines covered by the selection.<br>**With <kbd>Shift</kbd>:** Selects all matches in the entire buffer instead. |
| <kbd>C</kbd> | **Select previous match** | Moves each selection to the previous occurrence of the selected text.<br>**With <kbd>Shift</kbd>:** Preserves the existing selection. |
| <kbd>V</kbd> | **Select next match** | Moves each selection to the next occurrence of the selected text.<br>**With <kbd>Shift</kbd>:** Preserves the existing selection. |

#### Other

| Key | Command | Description |
| --- | --- | --- |
| <kbd>Q</kbd> | **Remove every second selection** | Drops all selections (*not* the selection contents) with even-numbered indices, where the first selection has index 1.<br>**With <kbd>Shift</kbd>:** Drops odd-numbered selections instead. |
| <kbd>A</kbd> | **Consolidate selections** | Drops all selections except the first one. |
| <kbd>Shift+A</kbd> | **Split selections into cursors** | Turns every non-empty selection into two cursors, one at the start of the selection and one at the end. |
| <kbd>Z</kbd> | **Invert selections** | Selects all unselected text and deselects all selected text in the lines covered by selections.<br>**With <kbd>Shift</kbd>:** Inverts selections in the entire buffer instead. |

### Text manipulation

| Key | Command | Description |
| --- | --- | --- |
| <kbd>N</kbd> | **Swap selections** | Assuming the selections are indexed starting from 1, swaps the contents of selections 1 and 2, 3 and 4, etc.<br>**With <kbd>Shift</kbd>:** Swaps selections 1 and 3, 2 and 4, etc. instead. |
| <kbd>Alt+N</kbd> | **Rotate selections** | Cyclically replaces the contents of each selection with those of the preceding selection.<br>**With <kbd>Shift</kbd>:** Uses the contents of the succeeding selection instead. |
| <kbd>M</kbd> | **Align selections** | Left-aligns all selections by inserting spaces to the left of them. If there are multiple selections on a single line, those selections are aligned with the corresponding selections on other lines.<br>**With <kbd>Shift</kbd>:** Right-aligns selections instead. |

### Clipboard

| Key | Command | Description |
| --- | --- | --- |
| <kbd>T</kbd> | **Copy** | Copies the selected text to the system clipboard.<br>**With <kbd>Shift</kbd>:** Uses Envy's internal ("secondary") clipboard instead. |
| <kbd>G</kbd> | **Paste** | Pastes the text from the system clipboard.<br>**With <kbd>Shift</kbd>:** Uses Envy's internal ("secondary") clipboard instead. |
| <kbd>B</kbd> | **Cut** | Cuts the selected text to the system clipboard.<br>**With <kbd>Shift</kbd>:** Uses Envy's internal ("secondary") clipboard instead. |


## Using Envy with non-US keyboards

Envy's keymap consists exclusively of letters. As the shapes and positions of the letter keys are identical for all standard keyboards (as opposed to, say, the <kbd>Enter</kbd> and left <kbd>Shift</kbd> keys), it is possible to achieve exactly the same Envy mode layout regardless of the keyboard layout used.

The only thing needed is to swap the bindings for any letter keys that in the local keyboard layout are rearranged compared to Envy's default layout (QWERTY). Most regional layouts have only minor rearrangements, and the necessary changes can be easily achieved by adding a "patch" to Atom's `keymap.cson`.

### :de: QWERTZ keymap patch

[QWERTZ](https://en.wikipedia.org/wiki/QWERTZ) keyboard layouts are used mainly in the German-speaking world and in parts of Eastern Europe. As far as letter keys go, QWERTZ differs from QWERTY only in that <kbd>Y</kbd> and <kbd>Z</kbd> are exchanged, so the following will make Envy use its [default positional arrangement](#keymap) on a QWERTZ keyboard:

```coffeescript
'atom-text-editor.envy-mode':
  'y': 'envy:invert-selections-in-lines'
  'Y': 'envy:invert-selections'
  'z': 'editor:move-to-beginning-of-previous-paragraph'
  'Z': 'editor:select-to-beginning-of-previous-paragraph'
  'alt-z': 'core:page-up'
  'alt-Z': 'core:select-page-up'
```

### :fr: AZERTY keymap patch

[AZERTY](https://en.wikipedia.org/wiki/AZERTY) is the predominant keyboard layout in France, and is also used by French speakers in Belgium and some other countries. Compared to QWERTY, it swaps <kbd>A</kbd> and <kbd>Q</kbd>, <kbd>W</kbd> and <kbd>Z</kbd>, and has <kbd>,</kbd>/<kbd>?</kbd> in place of <kbd>M</kbd>, giving rise to this patch:

```coffeescript
'atom-text-editor.envy-mode':
  'a': 'envy:remove-every-second-selection-even'
  'A': 'envy:remove-every-second-selection-odd'
  'q': 'editor:consolidate-selections'
  'Q': 'envy:split-selections-into-cursors'
  'w': 'envy:invert-selections-in-lines'
  'W': 'envy:invert-selections'
  'z': 'envy:select-surrounding-brackets'
  'Z': 'envy:select-all-brackets'
  ',': 'envy:left-align-selections'
  '?': 'envy:right-align-selections'
```


## Contributing

Contributors are always welcome. However, **please file an issue describing what you intend to add before opening a pull request,** *especially* for new features! I have a clear vision of what I want (and do not want) Envy to be, so discussing potential additions might help you avoid duplication and wasted work.

By contributing, you agree to release your changes under the same license as the rest of the project (see below).


## License

Copyright &copy; 2017 Philipp Emanuel Weidmann (<pew@worldwidemann.com>)

Released under the terms of the [MIT License](https://opensource.org/licenses/MIT)
