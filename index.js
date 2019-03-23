const $ = (s, doc = document) => {
  return doc.querySelector(s);
};

const $$ = (s, doc = document) => {
  return [...doc.querySelectorAll(s)];
};

const $el = (tag, attr = {}, cb = () => {}) => {
  const el = document.createElement(tag);
  Object.assign(el, attr);
  cb(el);
  return el;
};

if (!String.prototype.matchAll) {
  String.prototype.matchAll = function(regexp) {
    const self = this;
    return {
      *[Symbol.iterator]() {
        while((matches = regexp.exec(self)) !== null) {
          yield matches;
        }
      }
    };
  }
}

const render = (str, pos) => {
  let result = '';
  for (let i = 0; i < pos.length - 1; ++i) {
      const substr = str.slice(pos[i], pos[i + 1]);
      const match = substr.match(/^([^(]+)\(([^)]+)\)$/);
      console.log(substr, match);
      if (match) {
          result += `<ruby>${match[1]}<rp>(</rp><rt>${match[2]}</rt><rp>)</rp></ruby>`;
      } else {
          result += substr;
      }
  }
  return `<div class="lyric-row">${result}</div>`;
};

const process = () => {
  const lines = $('#text-editor + label + .tab-content pre').innerHTML
      .split(/\n|<br\/?>/g)
      .map(r => r.trim());

  const rendered = [];
  for (const line of lines) {
      /* 平仮名 3041-3093 */
      /* 片仮名 30A0-30FF*/
      const lineIter = line.matchAll(/[^\u{3041}-\u{3093}\u{30A0}-\u{30FF}\s「」？?、]+\([^)]+\)/gu);
      const collect = new Set([0, line.length]);
      for (const wordAnchor of lineIter) {
          collect.add(wordAnchor.index);
          collect.add(wordAnchor.index + wordAnchor[0].length);
      }
      const position = [...collect].sort((a, b) => a - b);
      // console.log(position);
      rendered.push(render(line, position));
  }
  console.log(rendered);
  const title = $('#text-editor + label + .tab-content h1');
  $('#ruby-rendered-lyrics').innerHTML = title.outerHTML + rendered.join('');
}

const toFullHTML = (html) => {
  const title = $('#ruby-rendered-lyrics h1').textContent;
  return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <title>${title}</title>
      </head>
      <body>
          ${html}
      </body>
      </html>
  `.split('\n').map(l => l.trim()).join('\n');
}

$('#ruby-renderer').addEventListener('change', process);

new ClipboardJS('#copy-btn', {
  text: () => $('#ruby-rendered-lyrics').outerHTML,
});

$('#download-btn').addEventListener('click',() => {
  const blob = new Blob([toFullHTML($('#ruby-rendered-lyrics').outerHTML)], {type: 'text/html;charset=utf-8'});
  const title = $('#ruby-rendered-lyrics h1').textContent;
  saveAs(blob, `${title}.html`.replace(/\//g, '／'));
});
