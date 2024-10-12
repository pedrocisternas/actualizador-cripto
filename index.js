require('dotenv').config();
const { Client } = require("@notionhq/client");
const axios = require('axios');

// Acceso a las variables de entorno
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.DATABASE_ID;

const notion = new Client({ auth: NOTION_TOKEN });

async function getPriceFromDexscreener(contract, retries = 3) {
  const url = `https://api.dexscreener.com/latest/dex/tokens/${contract}`;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url);
      if (response.data && response.data.pairs && response.data.pairs.length > 0) {
        const firstPair = response.data.pairs[0];
        return { priceUsd: parseFloat(firstPair.priceUsd), source: 'DexScreener' };
      } else {
        console.log(`No se encontraron pares para el contrato: ${contract}`);
        return null;
      }
    } catch (error) {
      console.error(`Intento ${attempt} - Error al obtener datos de DEXScreener para el contrato ${contract}:`, error.message);
      if (attempt === retries) {
        return null;
      }
      // Esperar 1 segundo antes de reintentar
      await new Promise(res => setTimeout(res, 1000));
    }
  }
}

async function getPriceFromCoinGecko(id) {
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${id}`;
  try {
    const response = await axios.get(url);
    if (response.data && response.data.length > 0 && response.data[0].current_price) {
      return { priceUsd: parseFloat(response.data[0].current_price), source: 'CoinGecko' };
    } else {
      console.log(`No se encontró el precio para el ID de CoinGecko: ${id}`);
      return null;
    }
  } catch (error) {
    console.error(`Error al obtener datos de CoinGecko para el ID ${id}:`, error.message);
    return null;
  }
}

async function fetchCryptocurrencies() {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
    });

    console.log("Criptomonedas encontradas:");

    for (const [index, page] of response.results.entries()) {
      // Acceder a las propiedades utilizando notación de corchetes
      const nombre = page.properties["Nombre"].title[0]?.plain_text || "Sin Nombre";
      const precio = page.properties["Precio Actual"].number || "Sin Precio";
      console.log(`${index + 1}. ${nombre} - Precio Actual: ${precio}`);

      // Obtener las propiedades "ID CoinGecko" y "Contract"
      const idCoinGecko = page.properties["ID CoinGecko"].rich_text[0]?.plain_text || "";
      const contract = page.properties["Contract"].rich_text[0]?.plain_text || "";

      if (idCoinGecko) {
        // Si tiene ID de CoinGecko, obtener precio desde CoinGecko
        console.log(`Obteniendo precio para ${nombre} desde CoinGecko...`);
        const result = await getPriceFromCoinGecko(idCoinGecko);

        if (result !== null) {
          const { priceUsd, source } = result;
          try {
            await notion.pages.update({
              page_id: page.id,
              properties: {
                "Precio Actual": {
                  number: priceUsd,
                },
              },
            });
            console.log(`${nombre} - Precio Nuevo: $${priceUsd} -> ${source}`);
            console.log("Actualizado en Notion");
          } catch (updateError) {
            console.error(`Error al actualizar el precio para ${nombre}:`, updateError.body || updateError);
          }
        } else {
          // Si CoinGecko falla, intentar con DEXScreener
          if (contract.startsWith("0x")) {
            console.log(`CoinGecko falló para ${nombre}. Intentando con DEXScreener...`);
            const dexResult = await getPriceFromDexscreener(contract);
            if (dexResult !== null) {
              const { priceUsd, source } = dexResult;
              try {
                await notion.pages.update({
                  page_id: page.id,
                  properties: {
                    "Precio Actual": {
                      number: priceUsd,
                    },
                  },
                });
                console.log(`${nombre} - Precio Nuevo: $${priceUsd} -> ${source} (se intentó con CoinGecko)`);
                console.log("Actualizado en Notion");
              } catch (updateError) {
                console.error(`Error al actualizar el precio para ${nombre}:`, updateError.body || updateError);
              }
            } else {
              console.log(`No se pudo obtener el precio para ${nombre} desde ninguna fuente.`);
            }
          } else {
            console.log("No hay actualización");
          }
        }
      } else if (contract.startsWith("0x")) {
        // Si no tiene ID de CoinGecko pero tiene contrato válido, usar DEXScreener
        console.log(`Obteniendo precio para ${nombre} desde DEXScreener...`);
        const result = await getPriceFromDexscreener(contract);

        if (result !== null) {
          const { priceUsd, source } = result;
          try {
            await notion.pages.update({
              page_id: page.id,
              properties: {
                "Precio Actual": {
                  number: priceUsd,
                },
              },
            });
            console.log(`${nombre} - Precio Nuevo: $${priceUsd} -> ${source}`);
            console.log("Actualizado en Notion");
          } catch (updateError) {
            console.error(`Error al actualizar el precio para ${nombre}:`, updateError.body || updateError);
          }
        }
      } else {
        console.log("No hay actualización");
      }
    }
  } catch (error) {
    console.error("Error al acceder a la base de datos de Notion:", error.body || error);
  }
}

fetchCryptocurrencies();
