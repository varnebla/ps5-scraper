//@ts-check

const { chromium } = require('playwright');

const shops = [
  {
    vendor: 'El Corte Inglés',
    url: 'https://www.elcorteingles.es/videojuegos/A37046604-consola-playstation-5/',
    checkStock: async ({ page }) => {
      const content = await page.textContent('#js_add_to_cart_desktop');
      return content.includes('Agotado temporalmente') == false;
    },
  },
];
(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 50 });

  for (const shop of shops) {
    const { vendor, url, checkStock } = shop;

    const page = await browser.newPage();
    await page.goto(url);

    const hasStock = await checkStock({ page });

    console.log(`${vendor}: ${hasStock ? 'HAS STOCK!!!' : 'Out of stock'}`);
    await page.screenshot({ path: `${vendor}.png` });
  }
  await browser.close();
})();
