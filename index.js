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
  {
    vendor: 'Fnac',
    url: 'https://www.fnac.es/Consola-PlayStation-5-Videoconsola-Consola/a7724798',
    checkStock: async ({ page }) => {
      const content = await page.$$('.f-buyBox-availabilityStatus-unavailable');
      return content.length == 0;
    },
  },
];
(async () => {
  const browser = await chromium.launch({ headless: false });

  for (const shop of shops) {
    const { vendor, url, checkStock } = shop;

    const page = await browser.newPage();
    await page.goto(url);

    const hasStock = await checkStock({ page });

    console.log(`${vendor}: ${hasStock ? 'HAS STOCK!!!' : 'Out of stock'}`);
    await page.screenshot({ path: `${vendor}.png` });
    await page.close();
  }
  await browser.close();
})();
