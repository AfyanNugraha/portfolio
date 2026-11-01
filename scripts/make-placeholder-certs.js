const fs = require('fs');
const path = require('path');

function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function makePdf(title, issuer, out) {
  const contentLines = [
    '0.05 0.05 0.05 rg',
    'BT /F2 44 Tf 50 740 Td (' + esc(title) + ') Tj ET',
    '0.23 0.51 0.96 rg',
    'BT /F1 16 Tf 50 700 Td (' + esc(issuer) + ') Tj ET',
    '0.35 0.35 0.35 rg',
    'BT /F1 13 Tf 50 640 Td (This is a placeholder file.) Tj ET',
    'BT /F1 13 Tf 50 620 Td (Replace it with your real certificate PDF at public/certs/ -) Tj ET',
    'BT /F1 13 Tf 50 600 Td (same file name - and this preview will show your actual document.) Tj ET',
    '0.7 0.7 0.7 rg',
    'BT /F1 11 Tf 50 80 Td (Achmad Afyan Nugraha - Cybersecurity Analyst / DFIR Specialist) Tj ET',
    '0.23 0.51 0.96 RG 2 w 50 90 m 545 90 l S',
  ];
  const content = contentLines.join('\n');

  const objs = {
    1: '<< /Type /Catalog /Pages 2 0 R >>',
    2: '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    3: '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>',
    4: '<< /Length ' + content.length + ' >>\nstream\n' + content + '\nendstream',
    5: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    6: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
  };

  let pdf = '%PDF-1.4\n';
  const offsets = {};
  const maxObj = 6;
  for (let i = 1; i <= maxObj; i++) {
    offsets[i] = pdf.length;
    pdf += i + ' 0 obj\n' + objs[i] + '\nendobj\n';
  }
  const xrefPos = pdf.length;
  pdf += 'xref\n0 ' + (maxObj + 1) + '\n0000000000 65535 f \n';
  for (let i = 1; i <= maxObj; i++) {
    pdf += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }
  pdf +=
    'trailer\n<< /Size ' + (maxObj + 1) + ' /Root 1 0 R >>\nstartxref\n' + xrefPos + '\n%%EOF';

  fs.writeFileSync(out, pdf, 'latin1');
  console.log('wrote', path.basename(out), fs.statSync(out).size, 'bytes');
}

const dir = path.join(__dirname, '..', 'public', 'certs');
fs.mkdirSync(dir, { recursive: true });

makePdf('Certified Ethical Hacker (CEH)', 'EC-Council', path.join(dir, 'ceh-certificate.pdf'));
makePdf('GIAC Certified Incident Handler (GCIH)', 'GIAC / SANS', path.join(dir, 'gcih-certificate.pdf'));
makePdf('CompTIA Security+', 'CompTIA', path.join(dir, 'securityplus-certificate.pdf'));
