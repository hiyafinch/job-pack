// Generates an SVG infographic from a {pros, cons} object.
// Each line of text is a separate <text> element at an explicit absolute y — no tspan nesting.

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wordWrap(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    if (!current) {
      current = word;
    } else if (current.length + 1 + word.length <= maxChars) {
      current += ' ' + word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

export function generateInfographic(data) {
  const { pros = [], cons = [] } = data;

  // Layout constants
  const SVG_WIDTH   = 800;
  const FONT_SIZE   = 13;
  const LINE_H      = 22;   // px between text baselines
  const ITEM_GAP    = 14;   // extra px between items
  const COL_PAD     = 16;   // inner padding inside each column panel
  const COL_WIDTH   = 370;  // each column panel width
  const LEFT_X      = 10;   // left panel x
  const RIGHT_X     = LEFT_X + COL_WIDTH + 10; // 390
  const TITLE_H     = 60;   // height reserved for the page title
  const HEADER_H    = 46;   // height reserved for each column's "Pros"/"Cons" heading
  const BOTTOM_PAD  = 24;

  // At 13px font, ~7px per char average; content width = COL_WIDTH - 2*COL_PAD = 338px → ~48 chars.
  // Use 44 to stay conservative.
  const CHARS = 44;

  // Wrap all items upfront so we can calculate heights
  const prosWrapped = pros.map(p => wordWrap(p, CHARS));
  const consWrapped = cons.map(c => wordWrap(c, CHARS));

  function totalLines(wrapped) {
    return wrapped.reduce((sum, lines) => sum + lines.length, 0);
  }

  function colContentH(wrapped) {
    if (!wrapped.length) return LINE_H; // at least one line of breathing room
    return totalLines(wrapped) * LINE_H + wrapped.length * ITEM_GAP;
  }

  const panelContentH = Math.max(colContentH(prosWrapped), colContentH(consWrapped));
  const panelH        = HEADER_H + panelContentH + COL_PAD;
  const svgHeight     = TITLE_H + panelH + BOTTOM_PAD;

  // Build <text> elements for one column
  // textX = absolute x for text; symbol = '✓' or '✗'; fill = color
  function buildItems(wrappedItems, textX, symbol, fill) {
    const elements = [];
    let y = TITLE_H + HEADER_H + COL_PAD + LINE_H; // first baseline

    for (const lines of wrappedItems) {
      for (let l = 0; l < lines.length; l++) {
        const label = l === 0
          ? `${symbol}  ${escapeXml(lines[l])}`
          :  `    ${escapeXml(lines[l])}`; // indent continuations
        elements.push(
          `<text x="${textX}" y="${y}" font-size="${FONT_SIZE}" fill="${fill}">${label}</text>`
        );
        y += LINE_H;
      }
      y += ITEM_GAP;
    }
    return elements.join('\n  ');
  }

  const prosTextX = LEFT_X  + COL_PAD;
  const consTextX = RIGHT_X + COL_PAD;
  const panelY    = TITLE_H;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="${SVG_WIDTH}" height="${svgHeight}"
     font-family="Helvetica, Arial, sans-serif">

  <!-- Background -->
  <rect width="${SVG_WIDTH}" height="${svgHeight}" fill="#f0f4f8" rx="12"/>

  <!-- Page title -->
  <text x="${SVG_WIDTH / 2}" y="38" font-size="20" font-weight="bold"
        text-anchor="middle" fill="#1a202c">Company Fit Infographic</text>

  <!-- Pros panel -->
  <rect x="${LEFT_X}" y="${panelY}" width="${COL_WIDTH}" height="${panelH}"
        fill="#d4edda" rx="8"/>
  <text x="${LEFT_X + COL_WIDTH / 2}" y="${panelY + 30}" font-size="16" font-weight="bold"
        text-anchor="middle" fill="#155724">Pros</text>
  ${buildItems(prosWrapped, prosTextX, '✓', '#155724')}

  <!-- Cons panel -->
  <rect x="${RIGHT_X}" y="${panelY}" width="${COL_WIDTH}" height="${panelH}"
        fill="#f8d7da" rx="8"/>
  <text x="${RIGHT_X + COL_WIDTH / 2}" y="${panelY + 30}" font-size="16" font-weight="bold"
        text-anchor="middle" fill="#721c24">Cons</text>
  ${buildItems(consWrapped, consTextX, '✗', '#721c24')}

</svg>`;
}
