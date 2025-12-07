// index.js - Bot de Telegram para Luna Esmeralda 🌙💚

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// =========================
// FUNCION PARA DIVIDIR MENSAJES LARGOS
// =========================
function dividirMensaje(texto) {
  const limite = 3900; // Telegram permite 4096, dejamos margen
  const partes = [];

  if (!texto || typeof texto !== 'string') return partes;

  for (let i = 0; i < texto.length; i += limite) {
    partes.push(texto.substring(i, i + limite));
  }

  return partes;
}

// =========================
// MAPA DE CARTAS -> URL DE IMAGEN
// =========================
// ⚠️ REEMPLAZA LAS URLS "https://TU_SERVIDOR/..." POR LAS REALES
const cartaImagenes = {{ "deck_name": "Luna Esmeralda - Arcanos Mayores", "reverso": "https://res.cloudinary.com/dy3hsvova/image/upload/v1764111858/reverso_juzham.png", "arcanos_mayores": [ {"nombre": "El Loco","url": "https://res.cloudinary.com/dy3hsvova/image/upload/v1764111839/el_loco_vgxwfw.png"}, {"nombre": "La Maga","url": "https://res.cloudinary.com/dy3hsvova/image/upload/v1764111857/la_maga_gthzro.png"}, {"nombre": "La Sacerdotisa","url": "https://res.cloudinary.com/dy3hsvova/image/upload/v1764111845/la_sacerdotisa_ludvqz.png"}, {"nombre": "La Emperatriz","url": "https://res.cloudinary.com/dy3hsvova/image/upload/v1764111839/la_emperatriz_rfyw1l.png"}, {"nombre": "El Emperador","url": "https://res.cloudinary.com/dy3hsvova/image/upload/v1764111869/el_emperador_zg0wp2.png"}, {"nombre": "El Hierofrante","url": "https://res.cloudinary.com/dy3hsvova/image/upload/v1764111868/el_hierofrante_jeccsv.png"}, {"nombre": "Los Enamorados","url": "https://res.cloudinary.com/dy3hsvova/image/upload/v1764111847/los_enamorados_u5gwdp.png"}, {"nombre": "El Carro","url": "https://res.cloudinary.com/dy3hsvova/image/upload/v1764111865/el_carro_rgdw1l.png"}, {"nombre": "La Justicia","url": "https://res.cloudinary.com/dy3hsvova/image/upload/v1764111864/la_justicia_qbqaw0.png"}, {"nombre": "La Ermitaña","url": "https://res.cloudinary.com/dy3hsvova/image/upload/v1764111847/la_ermitana_hmcnrx.png"}, {"nombre": "La Rueda de la Fortuna","url": "https://res.cloudinary.com/dy3hsvova/image/upload/v17641 11839/la_rueda_de_la_fortuna_m3eesx.png"}, {"nombre": "La Fuerza","url": "https://res.cloudinary.com/dy3hsvova/image/upload/v1764111852/la_fuerza_fvo6iq.png"}, {"nombre": "El Colgado","url": "https://res.cloudinary.com/dy3hsvova/image/upload/v1764111838/el_colgado_nwsvbp.png"}, {"nombre": "La Muerte","url": "https://res.cloudinary.com/dy3hsvova/image/upload/v1764111852/la_muerte_wxdpfv.png"}, {"nombre": "La Templanza","url": "https://res.cloudinary.com/dy3hsvova/image/upload/v1764112559/C hatGPT_Image_25_nov_2025_08_15_26_p.m._biavuj.png"}, {"nombre": "El Diablo","url": "https://res.cloudinary.com/dy3hsvova/image/upload/v1764111863/el_diablo_uutxcj.png"}, {"nombre": "La Torre","url": "https://res.cloudinary.com/dy3hsvova/image/upload/v1764111875/la_torre_nns9wj.png"}, {"nombre": "La Estrella","url": "https://res.cloudinary.com/dy3hsvova/image/upload/v1764111870/la_estrella_n38omw.png"}, {"nombre": "La Luna","url": "https://res.cloudinary.com/dy3hsvova/image/upload/v1764111847/la_luna_xraqpd.png"}, {"nombre": "El Sol","url":

"https://res.cloudinary.com/dy3hsvova/image/upload/v1764111852/el_sol_yqusqp.png"}, {"nombre": "El Juicio","url": "https://res.cloudinary.com/dy3hsvova/image/upload/v1764111844/el_juicio_prfz0b.png"}, {"nombre": "El Mundo","url": "https://res.cloudinary.com/dy3hsvova/image/upload/v1764111872/el_mundo_lte7rj.png"} ] }
  
  // Puedes seguir agregando Arcanos Menores si quieres
};

// =========================
// PROCESAR MENSAJE: IMAGEN + TEXTO
// =========================
// Busca [IMAGEN: NOMBRE_CARTA], envía la imagen, limpia el texto y envía el resto
async function procesarYEnviarMensaje(message, chatId) {
  if (!message || typeof message !== 'string') return;

  let texto = message;

  // Detecta patrón [IMAGEN: lo que sea]
  const match = message.match(/\[IMAGEN:\s*(.*?)\s*\]/i);

  if (match) {
    const nombreCartaRaw = match[1].trim().toUpperCase();

    if (cartaImagenes[nombreCartaRaw]) {
      try {
        await bot.sendPhoto(chatId, cartaImagenes[nombreCartaRaw]);
      } catch (err) {
        console.error('Error enviando imagen de carta:', err.message);
      }
    }

    // Quitar la etiqueta [IMAGEN: ...] del texto antes de enviarlo
    texto = message.replace(match[0], '').trim();
  }

  if (texto.length > 0) {
    const partes = dividirMensaje(texto);

    for (const parte of partes) {
      await bot.sendMessage(chatId, parte, {
        parse_mode: 'Markdown'
      });
    }
  }
}

// =========================
// VARIABLES DE ENTORNO
// =========================
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const VOICEFLOW_API_KEY = process.env.VOICEFLOW_API_KEY;
const VOICEFLOW_VERSION_ID = process.env.VOICEFLOW_VERSION_ID;

if (!TELEGRAM_TOKEN || !VOICEFLOW_API_KEY || !VOICEFLOW_VERSION_ID) {
  console.error(
    '❌ Faltan variables de entorno. Revisa TELEGRAM_BOT_TOKEN, VOICEFLOW_API_KEY y VOICEFLOW_VERSION_ID en tu .env'
  );
  process.exit(1);
}

// =========================
// INICIALIZACIÓN DEL BOT
// =========================
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// URL base de Voiceflow runtime
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
– PROCESAR LAS TRACES DE VOICEFLOW
// =========================
async function handleVoiceflowTraces(chatId, traces) {
  for (const trace of traces) {
    try {
      if (trace.type === 'text') {
        const message = trace.payload?.message;
        if (message) {
          await procesarYEnviarMensaje(message, chatId);
        }

      } else if (trace.type === 'speak') {
        const message = trace.payload?.message;
        if (message) {
          await procesarYEnviarMensaje(message, chatId);
        }

      // Si quieres seguir usando imágenes que vengan de Voiceflow, descomenta esto.
      // Pero como ahora controlamos las imágenes con [IMAGEN: ...], mejor dejarlo apagado.
      //
      // } else if (trace.type === 'visual' && trace.payload?.image) {
      //   await bot.sendPhoto(chatId, trace.payload.image);

      } else if (trace.type === 'end') {
        // Trace de fin de conversación (opcional)
        // Puedes mandar un mensaje de cierre aquí si quieres.
        // await bot.sendMessage(chatId, "🌙 Gracias por conectar con Luna Esmeralda. Vuelve cuando lo sientas.");
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
