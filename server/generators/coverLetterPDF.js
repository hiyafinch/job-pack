import PDFDocument from 'pdfkit';

function parseInline(line) {
  const runs = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let match;
  while ((match = re.exec(line)) !== null) {
    if (match.index > last) runs.push({ text: line.slice(last, match.index), bold: false });
    runs.push({ text: match[1], bold: true });
    last = match.index + match[0].length;
  }
  if (last < line.length) runs.push({ text: line.slice(last), bold: false });
  return runs;
}

function renderLine(doc, line) {
  if (/^---+$/.test(line.trim())) {
    const y = doc.y + 4;
    doc.moveTo(doc.page.margins.left, y)
       .lineTo(doc.page.width - doc.page.margins.right, y)
       .strokeColor('#a0aec0').lineWidth(0.5).stroke()
       .strokeColor('#000000').lineWidth(1);
    doc.moveDown(0.3);
    return;
  }

  if (line.trim() === '') {
    doc.moveDown(0.5);
    return;
  }

  const runs = parseInline(line);
  const x = doc.page.margins.left;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  if (runs.every(r => !r.bold)) {
    doc.fontSize(12).font('Helvetica').fillColor('#2d3748')
       .text(runs.map(r => r.text).join(''), x, doc.y, { width, lineGap: 4 });
    return;
  }

  runs.forEach((run, i) => {
    doc.fontSize(12)
       .font(run.bold ? 'Helvetica-Bold' : 'Helvetica')
       .fillColor('#2d3748')
       .text(run.text, i === 0 ? x : undefined, i === 0 ? doc.y : undefined, {
         continued: i < runs.length - 1,
         width,
         lineGap: 4,
       });
  });
}

export function generateCoverLetterPDF(text) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 60 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).font('Helvetica-Bold').fillColor('#1a202c')
       .text('Cover Letter', { align: 'center' });
    doc.moveDown(0.8);
    doc.fontSize(12).font('Helvetica').fillColor('#2d3748');

    for (const line of text.split('\n')) {
      renderLine(doc, line);
    }

    doc.end();
  });
}
