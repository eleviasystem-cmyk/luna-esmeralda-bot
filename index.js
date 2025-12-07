// index.js - Bot de Telegram para Luna Esmeralda 🌙💚

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// =========================
// FUNCION PARA DIVIDIR MENSAJES LARGOS
// =========================
function dividirMensaje(texto) {
  const limite = 3900; // Telegram permite 4096 — dejamos margen
  const partes = [];

  for (let i = 0; i < texto.length; i += limite) {
    partes.push(texto.substring(i, i + limite));
  }
  return partes;
}

// =========================
// VARIABLES DE ENTORNO
// =========================
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const VOICEFLOW_API_KEY = process.env.VOICEFLOW_API_KEY;
const VOICEFLOW_VERSION_ID = process.env.VOICEFLOW_VERSION_ID;

if (!TELEGRAM_TOKEN || !VOICEFLOW_API_KEY || !VOICEFLOW_VERSION_ID) {
  console.error('❌ Faltan variables de entorno. Revisa TELEGRAM_BOT_TOKEN, VOICEFLOW_API_KEY y VOICEFLOW_VERSION_ID en tu .env');
  process.exit(1);
}

// =========================
// INICIALIZACIÓN DEL BOT
// =========================
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Voiceflow runtime URL
const VF_BASE_URL = 'https://general-runtime.voiceflow.com/state';

// =========================
// ENVIAR TEXTO A VOICEFLOW
// =========================
async function sendToVoiceflow(userId, text) {
  const url = `${VF_BASE_URL}/${VOICEFLOW_VERSION_ID}/user/${userId}/interact`;

  try {
    const response = await axios.post(
      url,
      {
        request: { type: 'text', payload: text },
        config: { tts: false, stripSSML: true }
      },
      {
        headers: {
          Authorization: VOICEFLOW_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error hablando con Voiceflow:', error.response?.data || error.message);
    throw error;
  }
}

// =========================
// PROCESAR RESPUESTA DE VOICEFLOW
// =========================
async function handleVoiceflowTraces(chatId, traces) {
  for (const trace of traces) {
    try {
      let message = null;

      if (trace.type === 'text') {
        message = trace.payload?.message;

      } else if (trace.type === 'speak') {
        message = trace.payload?.message;

      } else if (trace.type === 'visual' && trace.payload?.image) {
        await bot.sendPhoto(chatId, trace.payload.image);
        continue;
      }

      // ---- ENVÍO DE MENSAJE DIVIDIDO ----
      if (message && typeof message === 'string') {
        const partes = dividirMensaje(message);

        for (const parte of partes) {
          await bot.sendMessage(chatId, parte, {
            parse_mode: 'Markdown'
          });
        }
      }

    } catch (err) {
      console.error('Error enviando mensaje a Telegram:', err.message);
    }
  }
}

// =========================
// MANEJO DE MENSAJES DE TELEGRAM
// =========================
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = String(chatId);

  let userText = '';

  if (msg.text) {
    userText = msg.text;

  } else if (msg.photo && msg.photo.length > 0) {
    userText = 'te envío una foto de comprobante';

  } else if (msg.document) {
    userText = 'te envío un archivo de comprobante';

  } else if (msg.sticker) {
    userText = 'sticker enviado';

  } else if (msg.voice || msg.audio) {
    userText = 'nota de voz enviada';

  } else {
    userText = 'contenido enviado';
  }

  console.log(`👤 Usuario ${chatId} →`, userText);

  try {
    await bot.sendChatAction(chatId, 'typing');
  } catch (err) {
    console.error('Error enviando acción typing:', err.message);
  }

  try {
    const traces = await sendToVoiceflow(userId, userText);
    await handleVoiceflowTraces(chatId, traces);

  } catch (error) {
    await bot.sendMessage(
      chatId,
      '✨ Mi luz, algo no funcionó bien al conectar con mi energía. Intenta de nuevo en un momento por favor 🌙💚'
    );
  }
});

// =========================
// BOT LISTO
// =========================
console.log('🌙 Luna Esmeralda Telegram Bot está corriendo...');
