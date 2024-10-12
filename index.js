const { Client } = require("@notionhq/client");

// Reemplaza con tu token de integración de Notion
const NOTION_TOKEN = "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";

// Reemplaza con el ID de tu base de datos de Notion
const DATABASE_ID = "10f33ed399d581efa522d22cc48b8796";

const notion = new Client({ auth: NOTION_TOKEN });

async function fetchCryptocurrencies() {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
    });

    console.log("Criptomonedas encontradas:");
    response.results.forEach((page, index) => {
      // Acceder a las propiedades utilizando notación de corchetes
      const nombre = page.properties["Nombre"].title[0]?.plain_text || "Sin Nombre";
      const precio = page.properties["Precio Actual"].number || "Sin Precio";
      console.log(`${index + 1}. ${nombre} - Precio Actual: ${precio}`);
    });
  } catch (error) {
    console.error("Error al acceder a la base de datos de Notion:", error.body || error);
  }
}

fetchCryptocurrencies();