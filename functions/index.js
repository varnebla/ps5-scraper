//@ts-check

const { chromium } = require('playwright');
// const { Telegraf } = require('telegraf');
const { Telegraf } = require('telegraf');
require('dotenv').config();

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
  {
    vendor: 'Amazon',
    url: 'https://www.amazon.es/Playstation-Consola-PlayStation-5-Digital/dp/B08KKJ37F7?th=1',
    checkStock: async ({ page }) => {
      const content = await page.textContent('#availability>span');
      return content.includes('No disponible') == false;
    },
  },
  {
    vendor: 'GAME',
    url: 'https://www.game.es/consola-playstation-5-playstation-5-183224',
    checkStock: async ({ page }) => {
      const content = await page.textContent('.buy--type>span');
      return content.includes('Producto no disponible') == false;
    },
  },
];

const token = process.env.BOT_TOKEN;
exports.handler = async function (event, context) {
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const bot = new Telegraf(process.env.BOT_TOKEN);
  const shopsInformation = [];

  try {
    for (const shop of shops) {
      const { vendor, url, checkStock } = shop;

      const page = await browser.newPage();
      await page.goto(url);

      const hasStock = await checkStock({ page });

      hasStock &&
        shopsInformation.push({
          vendor,
          url,
        });
      await page.close();
    }

    const availableShopsList =
      shopsInformation.length &&
      shopsInformation.map((shop) => {
        return `${shop.vendor} TIENE STOCK!! CORRE: ${shop.url}`;
      });

    const availableShops = availableShopsList.length
      ? availableShopsList.join(', ')
      : 'No hay stock en ninguna parte';

    bot.telegram.sendMessage(process.env.CHAT_ID, availableShops);
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error,
      }),
    };
  } finally {
    browser && (await browser.close());
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Scraping successful.',
    }),
  };
};
