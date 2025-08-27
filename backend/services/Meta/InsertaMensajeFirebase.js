import { addReg, InsertaContacto } from '../firebase.js';
import dotenv from 'dotenv'

dotenv.config();

export const InsertaMensajeFirebase = async (data) => {

    try {
        // Lógica para insertar el mensaje en Firebase
        //console.log('Inserting message into Firebase:', data);

        const formato = {
            body : data.cMensaje || null,
            datamedia : data.datamedia || null,
            from : data.isMe ? '51968782524' : data.cNumberCliente, // Numero de la empresa Cambiar por variable de entorno
            fromMe : data.isMe,
            id : data.nIdMensaje,
            time : data.dFechaMensaje,
            to : data.isMe ? data.cNumberCliente : '51968782524', // Numero de la empresa Cambiar por variable de entorno
            type : data.cTipoMensaje,
            origen : data.Origen
        }

        await InsertaContacto(process.env.FIREBASE_COLECCION_CONTACTOS, formato.fromMe ? formato.from : formato.to, formato.fromMe ? formato.to : formato.from );
        await addReg(process.env.FIREBASE_COLECCION_CHATS, formato);
        // Aquí iría el código real para interactuar con Firebase
    } catch (error) {
        console.error('Error inserting message into Firebase:', error);
    }

}