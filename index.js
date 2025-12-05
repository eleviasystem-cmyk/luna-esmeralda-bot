// index.js - Bot de Telegram para Luna Esmeralda 🌙💚

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Lee variables de entorno
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const VOICEFLOW_API_KEY = process.env.VOICEFLOW_API_KEY;
const VOICEFLOW_VERSION_ID = process.env.VOICEFLOW_VERSION_ID; // ID de la versión del proyecto en Voiceflow

if (!TELEGRAM_TOKEN || !VOICEFLOW_API_KEY || !VOICEFLOW_VERSION_ID) {
  console.error('❌ Faltan variables de entorno. Revisa TELEGRAM_BOT_TOKEN, VOICEFLOW_API_KEY y VOICEFLOW_VERSION_ID en tu .env');
  process.exit(1);
}

// Inicializa el bot de Telegram con long polling
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// URL base de la API de Voiceflow (runtime)
const VF_BASE_URL = 'https://general-runtime.voiceflow.com/state';

// Función que envía un mensaje del usuario a Voiceflow
async function sendToVoiceflow(userId, text) {
  const url = `${VF_BASE_URL}/${VOICEFLOW_VERSION_ID}/user/${userId}/interact`;

  try {
    const response = await axios.post(
      url,
      {
        request: {
          type: 'text',
          payload: text
        },
        config: {
          tts: false,
          stripSSML: true
        }
      },
      {
        headers: {
          Authorization: VOICEFLOW_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data; // traces de Voiceflow
  } catch (error) {
    console.error('Error hablando con Voiceflow:', error.response?.data || error.message);
    throw error;
  }
}

// Función que procesa las trazas que responde Voiceflow
async function handleVoiceflowTraces(chatId, traces) {
  // Cada "trace" es una acción en el flujo de Voiceflow (texto, speak, card, etc.)
  for (const trace of traces) {
    try {
      if (trace.type === 'text') {
        // Mensajes de texto normales
        const message = trace.payload?.message;
        if (message) {
          await bot.sendMessage(chatId, message, {
            parse_mode: 'Markdown'
          });
        }
      } else if (trace.type === 'speak') {
        // Algunos proyectos usan "speak" en vez de "text"
        const message = trace.payload?.message;
        if (message) {
          await bot.sendMessage(chatId, message, {
            parse_mode: 'Markdown'
          });
        }
      } else if (trace.type === 'visual') {
        // Si en algún momento usas imágenes en Voiceflow (opcionales)
        if (trace.payload?.image) {
          await bot.sendPhoto(chatId, trace.payload.image);
        }
      } else if (trace.type === 'end') {
        // Fin de conversación (si lo usas en Voiceflow)
        // Puedes decidir no hacer nada, o mandar un mensaje de cierre
        // await bot.sendMessage(chatId, "🌙 Gracias por conectar con Luna Esmeralda. Vuelve cuando tu alma lo sienta.");
      }
    } catch (err) {
      console.error('Error enviando mensaje a Telegram:', err.message);
    }
  }
}

// Manejo de mensajes de Telegram
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = String(chatId); // lo usamos como userId en Voiceflow

  // Detectar tipo de contenido
  let userText = '';

  if (msg.text) {
    // Mensaje de texto normal
    userText = msg.text;
  } else if (msg.photo && msg.photo.length > 0) {
    // Usuario envió una foto (puede ser comprobante)
    // Enviamos un texto especial a Voiceflow para que IA Comprobante lo entienda
    userText = 'te envío una foto de comprobante';
  } else if (msg.document) {
    // Usuario envió un archivo (PDF, imagen adjunta, etc.)
    userText = 'te envío un archivo de comprobante';
  } else if (msg.sticker) {
    userText = 'sticker enviado';
  } else if (msg.voice || msg.audio) {
    userText = 'nota de voz enviada';
  } else {
    // Cualquier otro tipo
    userText = 'contenido enviado';
  }

  console.log(`👤 Usuario ${chatId} →`, userText);

  // Escribe "escribiendo..." en el chat
  try {
    await bot.sendChatAction(chatId, 'typing');
  } catch (err) {
    console.error('Error enviando acción typing:', err.message);
  }

  try {
    // Mandamos el mensaje del usuario a Voiceflow
    const traces = await sendToVoiceflow(userId, userText);

    // Procesamos la respuesta de Voiceflow
    await handleVoiceflowTraces(chatId, traces);
  } catch (error) {
    await bot.sendMessage(
      chatId,
      '✨ Mi luz, algo no funcionó bien al conectar con mi energía. Intenta de nuevo en un momento por favor 🌙💚'
    );
  }
});

console.log('🌙 Luna Esmeralda Telegram Bot está corriendo...');
