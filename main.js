window.addEventListener('DOMContentLoaded', () => {
  let converter = new Converter();

  /**
   @type {HTMLDivElement}
   */
  let editor = document.querySelector('div.editor');

  /**
   * @type {HTMLSpanElement | null}
   */
  let buffer;

  let onFocus = function () {
    buffer = document.createElement('span');
    buffer.className = 'input-buffer';

    setTimeout(() => {
      /**
       * @type {Selection}
       */
      let sel = getSelection();

      if (sel.rangeCount === 0) {
        return;
      }

      let range = sel.getRangeAt(0);

      if (
        (range.commonAncestorContainer.nodeType === Node.TEXT_NODE &&
          range.commonAncestorContainer.parentElement.className !== 'editor') ||
        (range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE &&
          range.commonAncestorContainer.className !== 'editor')
      ) {
        return;
      }

      range.insertNode(buffer);
      range.setStart(buffer, 0);
      range.collapse(false);
    }, 0);
  };

  let onBlur = function () {
    if (buffer) {
      let txt = editor.textContent;
      buffer.innerHTML = '';
      editor.textContent = txt;
      converter.clear();
      buffer.remove();
    }
  };

  let moveBufferToEditor = function () {
    let sib = buffer.previousSibling;
    if (!sib) {
      sib = document.createTextNode(buffer.textContent);
      buffer.textContent = '';
      editor.insertBefore(sib, buffer);
      return;
    }

    sib.textContent += buffer.textContent;
    buffer.textContent = '';
  }

  editor.addEventListener('blur', onBlur);
  editor.addEventListener('mousedown', function (e) { onBlur(e); onFocus(e); });
  editor.addEventListener('keydown', function (e) {
    if (!buffer || !buffer.parentNode) {
      return;
    }

    switch (true) {
      case true:
        if (e.metaKey || e.ctrlKey || e.altKey) {
          break;
        }

        if (e.key === 'Backspace') {
          e.preventDefault();
          if (buffer.textContent.length === 0) {
            let sib = buffer.previousSibling;

            if (sib) {
              sib.textContent = sib.textContent.slice(0, -1);
            }

            break;
          }

          if (converter.converting) {
            converter.clear();
            break;
          }

          converter.removeLast();
          break;
        }

        if (e.key === ' ') {
          e.preventDefault();
          if (!converter.empty) {
            converter.convert();
            break;
          } else {
            buffer.textContent = ' ';
            moveBufferToEditor();
            return;
          }
        }

        if (e.key === 'Enter') {
          e.preventDefault();
          if (!converter.empty) {
            converter.confirm();
          }
          buffer.textContent += '\n';
          moveBufferToEditor();
          return;
        }

        if (e.key.length !== 1) {
          break;
        }

        e.preventDefault();

        if (e.shiftKey && !converter.empty) {
          converter.convert();
        }

        if (converter.converting) {
          buffer.textContent = converter.buffer;
          converter.confirm();
          moveBufferToEditor();
        }

        let key = e.shiftKey ? e.key.toUpperCase() : e.key;
        converter.append(key);
    }
    buffer.textContent = converter.buffer;
  });
});
