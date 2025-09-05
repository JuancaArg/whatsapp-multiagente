import { addReg, InsertaContacto } from '../firebase.js';
import { sendWebhookNotification , InsertBigQuery } from '../N8N/SendWebHook.js';
import { Datos_ObtieneIdentificar } from './datos.js';
import dotenv from 'dotenv'

dotenv.config();

export const InsertaMensajeFirebase = async (data) => {

    try {

        let datoswaba, meWaba, mePhoneNumber

        datoswaba = await Datos_ObtieneIdentificar();
        meWaba = datoswaba.find(i => data.cIdWhatsappBusinees.includes(i.waba))
        mePhoneNumber = !Array.isArray(meWaba) && meWaba?.phonenumber
        if (!mePhoneNumber) return console.log('Alerta: Duplicidad o no se encontró waba');

        const formato = {
            body : data.cMensaje || null,
            datamedia : data.datamedia || null,
            from : data.isMe ? mePhoneNumber : data.cNumberCliente, // Numero de la empresa Cambiar por variable de entorno
            fromMe : data.isMe,
            id : data.nIdMensaje,
            time : data.dFechaMensaje,
            to : data.isMe ? data.cNumberCliente : mePhoneNumber, // Numero de la empresa Cambiar por variable de entorno
            type : data.cTipoMensaje,
            origen : data.Origen
        }

        //console.log(formato);

        //Inserta el contacto o lo guardar
        await InsertaContacto(process.env.FIREBASE_COLECCION_CONTACTOS, formato.fromMe ? formato.from : formato.to, formato.fromMe ? formato.to : formato.from );
        // Inserta Registro 
        addReg(process.env.FIREBASE_COLECCION_CHATS, formato);
        // Envia WebHook
        const datan8n = JSON.stringify({"from": formato.from, "to": formato.to, "body": formato.body})
        InsertBigQuery(datan8n)
        sendWebhookNotification(datan8n)
        // Aquí iría el código real para interactuar con Firebase
    } catch (error) {
        console.error('Error inserting message into Firebase:', error);
    }

}