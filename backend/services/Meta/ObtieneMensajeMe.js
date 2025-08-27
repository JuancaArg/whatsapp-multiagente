import {ObtenerRegistroColeccion} from '../firebase.js';
import dotenv from 'dotenv'
dotenv.config();

export const ObtieneDataMensajeisMe = async (id) => {

  const maxIntentos = 4;
  const coleccion = process.env.FIREBASE_COLECCION_MENSAJESAPI;

  for (let intento = 1; intento <= maxIntentos; intento++) {
    const data = await ObtenerRegistroColeccion(coleccion, id);

    if (data) {
      return data;
    }

    console.log(`🔁 Intento ${intento} fallido.`);

    if (intento < maxIntentos) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 segundo
    }
  }

  console.warn('❌ No se encontró el documento después de 4 intentos.');
  return null;
  
};

