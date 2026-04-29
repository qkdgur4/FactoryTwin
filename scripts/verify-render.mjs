import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDir = 'C:\\tmp\\FactoryTwin-render-check';
const url = process.env.FACTORY_TWIN_URL ?? 'http://127.0.0.1:5173/';

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
  args: ['--use-angle=swiftshader', '--use-gl=angle'],
});

const results = [];

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('canvas', { timeout: 10_000 });
  await page.waitForTimeout(2_000);

  const screenshotPath = `${outputDir}\\${viewport.name}.png`;
  await page.screenshot({ fullPage: true, path: screenshotPath });

  const inspection = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    const text = document.body.innerText;

    if (!canvas) {
      return {
        canvasFound: false,
        canvasHeight: 0,
        canvasWidth: 0,
        hasDashboardText: false,
        hasMachineLabels: false,
        nonZeroPixels: 0,
        uniqueColorBuckets: 0,
      };
    }

    const rect = canvas.getBoundingClientRect();
    let nonZeroPixels = 0;
    const colorBuckets = new Set();

    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 128;
    sampleCanvas.height = 128;
    const sampleContext = sampleCanvas.getContext('2d', { willReadFrequently: true });

    if (sampleContext) {
      sampleContext.drawImage(canvas, 0, 0, 128, 128);
      const pixels = sampleContext.getImageData(0, 0, 128, 128).data;

      for (let index = 0; index < pixels.length; index += 4) {
        const red = pixels[index];
        const green = pixels[index + 1];
        const blue = pixels[index + 2];
        const alpha = pixels[index + 3];

        if (red || green || blue || alpha) {
          nonZeroPixels += 1;
        }

        colorBuckets.add(
          `${Math.floor(red / 16)}-${Math.floor(green / 16)}-${Math.floor(blue / 16)}`,
        );
      }
    }

    return {
      canvasFound: true,
      canvasHeight: Math.round(rect.height),
      canvasWidth: Math.round(rect.width),
      hasDashboardText:
        text.includes('FactoryTwin') &&
        text.includes('설비 관제') &&
        text.includes('최근 20초 온도') &&
        text.includes('실시간 로그 캐스터'),
      hasMachineLabels:
        text.includes('id-1') && text.includes('id-2') && text.includes('id-3'),
      nonZeroPixels,
      uniqueColorBuckets: colorBuckets.size,
    };
  });

  results.push({
    viewport: viewport.name,
    screenshotPath,
    ...inspection,
  });

  if (viewport.name === 'desktop') {
    await page.getByText('id-2 · 가동 중').click();
    await page.waitForSelector('text=Machine Detail', { timeout: 5_000 });

    const modalText = await page.locator('[role="dialog"]').innerText();
    if (!modalText.includes('CNC Cell Beta')) {
      throw new Error('desktop: machine detail modal did not show CNC Cell Beta');
    }

    await page.getByRole('button', { name: '가동 중지' }).click();
    await page.waitForTimeout(500);

    const stoppedText = await page.locator('[role="dialog"]').innerText();
    if (!stoppedText.includes('정지')) {
      throw new Error('desktop: stop command did not update modal status');
    }

    await page.getByLabel('닫기').click();
  }

  await page.close();
}

await browser.close();

for (const result of results) {
  if (!result.canvasFound) {
    throw new Error(`${result.viewport}: canvas was not found`);
  }

  if (result.canvasWidth < 300 || result.canvasHeight < 300) {
    throw new Error(
      `${result.viewport}: canvas is too small (${result.canvasWidth}x${result.canvasHeight})`,
    );
  }

  if (result.nonZeroPixels < 512 || result.uniqueColorBuckets < 3) {
    throw new Error(
      `${result.viewport}: canvas appears blank (${result.nonZeroPixels} pixels, ${result.uniqueColorBuckets} color buckets)`,
    );
  }

  if (!result.hasDashboardText) {
    throw new Error(`${result.viewport}: dashboard text was not detected`);
  }

  if (!result.hasMachineLabels) {
    throw new Error(`${result.viewport}: machine labels were not detected`);
  }
}

console.log(JSON.stringify(results, null, 2));
