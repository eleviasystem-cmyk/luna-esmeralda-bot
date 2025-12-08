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
// MAPA DE CARTAS -> URL DE IMAGEN (MAYÚSCULAS)
// =========================
const cartaImagenes = {
  'EL LOCO':
    'https://res.cloudinary.com/dy3hsvova/image/upload/v1764111839/el_loco_vgxwfw.png',
  'LA MAGA':
    'https://res.cloudinary.com/dy3hsvova/image/upload/v1764111857/la_maga_gthzro.png',
  'LA SACERDOTISA':
    'https://res.cloudinary.com/dy3hsvova/image/upload/v1764111845/la_sacerdotisa_ludvqz.png',
  'LA EMPERATRIZ':
    'https://res.cloudinary.com/dy3hsvova/image/upload/v1764111839/la_emperatriz_rfyw1l.png',
  'EL EMPERADOR':
    'https://res.cloudinary.com/dy3hsvova/image/upload/v1764111869/el_emperador_zg0wp2.png',
  'EL HIEROFRANTE':
    'https://res.cloudinary.com/dy3hsvova/image/upload/v1764111868/el_hierofrante_jeccsv.png',
  'LOS ENAMORADOS':
    'https://res.cloudinary.com/dy3hsvova/image/upload/v1764111847/los_enamorados_u5gwdp.png',
  'EL CARRO':
    'https://res.cloudinary.com/dy3hsvova/image/upload/v1764111865/el_carro_rgdw1l.png',
  'LA JUSTICIA':
    'https://res.cloudinary.com/dy3hsvova/image/upload/v1764111864/la_justicia_qbqaw0.png',
  'LA ERMITAÑA':
    'https://res.cloudinary.com/dy3hsvova/image/upload/v1764111847/la_ermitana_hmcnrx.png',
  'LA RUEDA DE LA FORTUNA':
    'https://res.cloudinary.com/dy3hsvova/image/upload/v1764111839/la_rueda_de_la_fortuna_m3eesx.png',
  'LA FUERZA':
    'https://res.cloudinary.com/dy3hsvova/image/upload/v1764111852/la_fuerza_fvo6iq.png',
  'EL COLGADO':
    'https://res.cloudinary.com/dy3hsvova/image/upload/v1764111838/el_colgado_nwsvbp.png',
  'LA MUERTE':
    'https://res.cloudinary.com/dy3hsvova/image/upload/v1764111852/la_muerte_wxdpfv.png',
  'LA TEMPLANZA':
    'https://res.cloudinary.com/dy3hsvova/image/upload/v1764112559/ChatGPT_Image_25_nov_2025_08_15_26_p.m._biavuj.png',
  'EL DIABLO':
    'https://res.cloudinary.com/dy3hsvova/image/upload/v1764111863/el_diablo_uutxcj.png',
  'LA TORRE':
    'https://res.cloudinary.com/dy3hsvova/image/upload/v1764111875/la_torre_nns9wj.png',
  'LA ESTRELLA':
    'https://res.cloudinary.com/dy3hsvova/image/upload/v1764111870/la_estrella_n38omw.png',
  'LA LUNA':
    'https://res.cloudinary.com/dy3hsvova/image/upload/v1764111847/la_luna_xraqpd.png',
  'EL SOL':
    'https://res.cloudinary.com/dy3hsvova/image/upload/v1764111852/el_sol_yqusqp.png',
  'EL JUICIO':
    'https://res.cloudinary.com/dy3hsvova/image/upload/v1764111844/el_juicio_prfz0b.png',
  'EL MUNDO':
    'https://res.cloudinary.com/dy3hsvova/image/upload/v1764111872/el_mundo_lte7rj.png'
};

// =========================
// RECORDATORIO DE INACTIVIDAD (30 MIN)
// =========================
const recordatorios = new Map(); // chatId -> timeout

function programarRecordatorio(bot, chatId) {
  if (recordatorios.has(chatId)) {
    clearTimeout(recordatorios.get(chatId));
  }

  const timeout = setTimeout(() => {
    bot
      .sendMessage(
        chatId,
        'Mi luz ✨, sigo aquí cuando tu alma lo necesite. ' +
          'Si deseas otra lectura o ritual, solo escríbeme 🌙💚'
      )
      .catch((err) => console.error('Error enviando recordatorio:', err.message));
  }, 30 * 60 * 1000);

  recordatorios.set(chatId, timeout);
}

// =========================
// FIDELIZACIÓN ESPIRITUAL (PREMIUM + REGALO MÍSTICO)
// =========================
const fidelizacion = new Map(); // chatId -> { lastPremiumAt, checkTimeout, giftTimeout }

function generarRegaloMistico() {
  // Pequeño pool de regalos posibles
  const opciones = [
    () =>
      'Regalo místico ✨\n\n' +
      'Toma una respiración profunda y suave.\n' +
      'Repite internamente:\n' +
      '“Me permito recibir luz, guía y amor en este momento”.\n\n' +
      'Siente cómo tu pecho se expande un poco más cada vez que inhalas.\n' +
      'Estoy aquí contigo, cuando desees seguir explorando tu camino, mi luz.',

    () =>
      'Regalo místico ✨\n\n' +
      'Siento en tu energía una invitación a soltar una pequeña carga.\n' +
      'Puedes escribir en un papel aquello que ya no deseas cargar y, con cuidado, romperlo en pequeños trozos mientras respiras profundo.\n\n' +
      'Mientras lo haces, repite:\n' +
      '“Libero con amor aquello que ya no vibra conmigo”.\n\n' +
      'Cuando tu alma lo sienta, podemos abrir otra puerta juntos, mi luz.',

    () =>
      'Regalo místico ✨\n\n' +
      'Si tienes una vela en casa, enciéndela con intención consciente.\n' +
      'Mientras la llama se estabiliza, piensa en una sola cosa que desees sanar o iluminar.\n\n' +
      'Dile en silencio:\n' +
      '“Luz, acompáñame en este proceso”.\n\n' +
      'Estoy aquí para seguir leyendo las señales contigo cuando tu corazón lo sienta.',

    () => {
      // Carta energética extra aleatoria usando el mazo
      const nombres = Object.keys(cartaImagenes);
      const indice = Math.floor(Math.random() * nombres.length);
      const carta = nombres[indice]; // ya viene en MAYÚSCULAS

      return (
        '✨ CARTA REGALO: ' +
        carta +
        '\n' +
        '[IMAGEN: ' +
        carta +
        ']\n\n' +
        'Esta carta llega como un susurro extra para tu camino.\n' +
        'Obsérvala como un símbolo, no como un mandato. ' +
        'Permite que su energía te acompañe de forma suave y amorosa.\n\n' +
        'Si tu alma desea seguir profundizando, estoy aquí contigo.'
      );
    }
  ];

  const idx = Math.floor(Math.random() * opciones.length);
  return opciones[idx]();
}

function marcarPremium(bot, chatId) {
  const ahora = Date.now();
  const dataAnterior = fidelizacion.get(chatId) || {};

  if (dataAnterior.checkTimeout) clearTimeout(dataAnterior.checkTimeout);
  if (dataAnterior.giftTimeout) clearTimeout(dataAnterior.giftTimeout);

  // Check-in suave después de 6 horas
  const checkTimeout = setTimeout(() => {
    const data = fidelizacion.get(chatId);
    if (!data || data.lastPremiumAt !== ahora) return;

    bot
      .sendMessage(
        chatId,
        'He seguido sintiendo tu energía desde nuestra última lectura ✨\n' +
          'Si deseas profundizar en lo que vimos o abrir una nueva pregunta, estoy aquí contigo, cuando tu alma lo sienta.'
      )
      .catch((err) => console.error('Error enviando check-in de fidelización:', err.message));
  }, 6 * 60 * 60 * 1000);

  // Regalo místico después de 24 horas
  const giftTimeout = setTimeout(() => {
    const data = fidelizacion.get(chatId);
    if (!data || data.lastPremiumAt !== ahora) return;

    const regalo = generarRegaloMistico();

    // Usamos la misma función que procesa [IMAGEN: ...]
    procesarYEnviarMensaje(bot, regalo, chatId).catch((err) =>
      console.error('Error enviando regalo místico:', err.message)
    );
  }, 24 * 60 * 60 * 1000);

  fidelizacion.set(chatId, {
    lastPremiumAt: ahora,
    checkTimeout,
    giftTimeout
  });
}

// =========================
// PROCESAR MENSAJE: IMAGEN + TEXTO
// =========================
async function procesarYEnviarMensaje(bot, message, chatId) {
  if (!message || typeof message !== 'string') return;

  let texto = message;

  // Detectar UNA etiqueta [IMAGEN: ...]
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

    // Eliminamos la etiqueta del texto
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
// PROCESAR LAS TRACES DE VOICEFLOW
// =========================
async function handleVoiceflowTraces(chatId, traces) {
  for (const trace of traces) {
    try {
      if (trace.type === 'text' || trace.type === 'speak') {
        let message = trace.payload?.message;

        if (message && typeof message === 'string') {
          // Detectamos si termina en [PREMIUM_COMPLETADO]
          const tienePremiumTag = message.includes('[PREMIUM_COMPLETADO]');

          if (tienePremiumTag) {
            message = message.replace('[PREMIUM_COMPLETADO]', '').trim();
            marcarPremium(bot, chatId);
          }

          await procesarYEnviarMensaje(bot, message, chatId);
        }
      } else if (trace.type === 'end') {
        // Si quieres, puedes mandar algo aquí, pero por ahora no cerramos conversación.
        // Ejemplo (comentado):
        // await bot.sendMessage(chatId, 'Cuando tu energía lo sienta, podemos seguir explorando juntos 🌙💚');
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

  // Reprogramar recordatorio de inactividad cada vez que habla
  programarRecordatorio(bot, chatId);

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
      '✨ Mi luz, algo no funcionó bien al conectar con mi energía. Intenta de nuevo en un momento, estoy aquí contigo. 🌙💚'
    );
  }
});

// =========================
// BOT LISTO
// =========================
console.log('🌙 Luna Esmeralda Telegram Bot está corriendo...');
