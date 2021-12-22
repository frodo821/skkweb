window.addEventListener('DOMContentLoaded', () => {
  const params = Object.fromEntries(location.search.substring(1).split('&').map(it => it.split('=')));
  const converter = new Converter();

  /**
   * @type {HTMLCanvasElement}
   */
  const canvas = document.getElementById('overlay');
  const animator = new CanvasAnimator(canvas);
  animator.setEnable(params['gaming'] !== 'disable');

  /**
   @type {HTMLDivElement}
   */
  const editor = document.querySelector('div.editor');

  /**
   * @type {HTMLSpanElement | null}
   */
  let buffer;

  window.addEventListener('resize', animator.onWindowResized);

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

  let createRenderable = (text) => {
    let size = Math.floor(Math.random() * 40) + 20;
    console.log(size);
    return new TextRenderer(
      animator,
      text,
      animator.centerCenter[0] + (getRandom() * 200),
      animator.centerCenter[1] + (getRandom() * 200),
      `hsl(${Math.random() * 360}deg 100% 50%)`,
      `${size}px serif`,
      [getRandom() * 200, getRandom() * 400]);
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
  };

  let onCursorMove = function () {
    converter.confirm();
    moveBufferToEditor();
    if (buffer) {
      setTimeout(() => {
        buffer.remove();
        buffer = document.createElement('span');
        buffer.className = 'input-buffer';
        let sel = getSelection();

        if (sel && sel.rangeCount > 0) {
          let ran = sel.getRangeAt(0);
          ran.insertNode(buffer);
          ran.collapse(false);
        }
      }, 0);
    }
  };

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

        if (e.key.startsWith('Arrow') || e.key === 'Home' || e.key === 'End') {
          onCursorMove();
          break;
        }

        if (e.key === ' ') {
          e.preventDefault();
          if (!converter.empty) {
            converter.convert();
            createRenderable(converter.buffer);
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
            moveBufferToEditor();
            getSelection().setPosition(buffer, 1);
            return;
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
          createRenderable(converter.buffer);
        }

        if (converter.converting) {
          buffer.textContent = converter.buffer;
          converter.confirm();
          moveBufferToEditor();
        }

        let key = e.shiftKey ? e.key.toUpperCase() : e.key;
        createRenderable(key);
        converter.append(key);
    }
    buffer.textContent = converter.buffer;
  });
});

function getRandom() {
  return 2 * Math.random() - 1;
}
