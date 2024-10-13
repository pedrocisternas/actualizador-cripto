# Actualizador de Precios de Criptomonedas para Notion

## Tecnologías Utilizadas
- **Node.js**: Lenguaje de programación.
- **AWS Lambda**: Ejecuta el script en la nube.
- **AWS API Gateway**: Exposición de la función Lambda como API HTTP.
- **Notion API**: Interacción con la base de datos de Notion.
- **Axios**: Biblioteca para solicitudes HTTP.
- **GitHub**: Control de versiones y alojamiento del código.

## Instalación

1. **Clonar el Repositorio**
    ```bash
    git clone https://github.com/tu_usuario/actualizador-cripto.git
    cd actualizador-cripto
    ```

2. **Instalar Dependencias**
    ```bash
    npm install
    ```

## Configuración de Variables de Entorno

1. **Crear archivo `.env`**
    ```bash
    touch .env
    ```

2. **Agregar Variables**
    ```env
    NOTION_TOKEN=tu_notion_integration_token
    DATABASE_ID=tu_database_id_de_notion
    ```

## Ejecutar el Script Localmente

1. **Configurar Variables de Entorno**
    - Asegúrate de que `.env` contiene `NOTION_TOKEN` y `DATABASE_ID`.

2. **Ejecutar el Script**
    ```bash
    node index.js
    ```

## Despliegue en AWS Lambda

1. **Preparar Paquete de Despliegue**
    ```bash
    zip -r function.zip . -x "*.git*" -x "node_modules/.git*" -x "*.env"
    ```

2. **Subir a AWS Lambda**
    - Crea una nueva función Lambda en la consola de AWS.
    - Selecciona **Node.js 20.x** como runtime.
    - Sube `function.zip` en la sección de código.
    - Configura las variables de entorno `NOTION_TOKEN` y `DATABASE_ID`.

3. **Ajustar Timeout**
    - Configura el timeout a **1 minuto** en la configuración general de Lambda.

## Configuración de AWS API Gateway

1. **Crear API HTTP**
    - En API Gateway, crea una nueva API HTTP.
    - Configura una ruta `GET /actualizar-cripto` que integre con tu función Lambda.

2. **Obtener URL del Endpoint**
    - Después de crear la API, copia la URL del endpoint (ejemplo: `https://abc123.execute-api.region.amazonaws.com/actualizadorcripto`).

## Configuración del Botón en Notion

    - Se creó un botón en Notion que apunta a la url  de arriba. Esa es el disparador para actualizar los precios.

## Monitoreo y Logs

- **Ver Logs en CloudWatch**
    1. Ve a la consola de AWS Lambda.
    2. Selecciona tu función `ActualizadorCripto`.
    3. Navega a la pestaña **Monitor** y haz clic en **View logs in CloudWatch**.

## Seguridad

- **Endpoint Público**
    - Actualmente, el endpoint no tiene protección. Para mayor seguridad, considera implementar un token secreto o autenticación.

- **Protección de Credenciales**
    - Nunca expongas `NOTION_TOKEN` o `DATABASE_ID` en el código fuente.
    - Mantén el archivo `.env` en `.gitignore`.

## Solución de Problemas

- **Timeout de Lambda**
    - Asegúrate de haber aumentado el timeout a 1 minuto.
    - Revisa los logs en CloudWatch para identificar retrasos.

- **Errores en Notion**
    - Verifica que `NOTION_TOKEN` y `DATABASE_ID` sean correctos.
    - Revisa los permisos de la integración de Notion.

- **Problemas con el Botón**
    - Asegúrate de que la URL en `button.html` es correcta y accesible.
    - Verifica que la página web esté correctamente hospedada.
