/**
 * print-pdf.js — Generates a PDF from a wrapped chapter HTML file.
 *
 * Usage:
 *   node build/print-pdf.js <chapter-slug>
 *
 * Example:
 *   node build/print-pdf.js 01-why-the-cloud
 *
 * Requires:
 *   npm install   (installs puppeteer-core)
 *   Google Chrome at the default macOS path
 */

const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const BOOK_TITLE = "Let's Build on AWS Together";
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

(async () => {
  const slug = process.argv[2];
  if (!slug) {
    console.error('Usage: node build/print-pdf.js <chapter-slug>');
    console.error('Example: node build/print-pdf.js 01-why-the-cloud');
    process.exit(1);
  }

  const htmlPath = path.resolve(__dirname, `${slug}.html`);
  if (!fs.existsSync(htmlPath)) {
    console.error(`ERROR: HTML file not found: ${htmlPath}`);
    console.error(`Run first: python3 build/wrap.py ${slug}`);
    process.exit(1);
  }

  try {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: true,
      args: ['--disable-gpu', '--no-sandbox'],
    });

    const page = await browser.newPage();
    const fileUrl = `file://${htmlPath}`;

    console.log(`Loading: ${fileUrl}`);
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });

    console.log('Waiting for Mermaid diagrams...');
    try {
      await page.waitForSelector('.mermaid svg', { timeout: 5000 });
      console.log('Mermaid diagrams rendered.');
    } catch {
      console.log('No Mermaid diagrams detected, proceeding...');
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    const pdfPath = path.resolve(__dirname, `${slug}.pdf`);
    console.log(`Generating PDF at ${pdfPath}...`);

    await page.pdf({
      path: pdfPath,
      format: 'A4',
      margin: { top: '25mm', bottom: '25mm', left: '20mm', right: '20mm' },
      displayHeaderFooter: true,
      headerTemplate: `<div style="font-size: 8px; margin: 0 auto; color: #94a3b8;">${BOOK_TITLE}</div>`,
      footerTemplate: '<div style="font-size: 8px; margin: 0 auto; color: #94a3b8;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
      printBackground: true,
    });

    console.log('PDF generated successfully!');
    await browser.close();
  } catch (error) {
    console.error('Error generating PDF:', error);
    process.exit(1);
  }
})();
