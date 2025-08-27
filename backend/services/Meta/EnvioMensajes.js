import request from 'request';
import fs from 'fs';
import {InsertaRegistroCollecion} from '../../services/firebase.js';
import dotenv from 'dotenv'
dotenv.config();

export const EnvioMensajes = (data) => {

    try {

        if (data.tipomensaje === 'texto'){
            SendTextSimple(data.cCliente, data.message, data);
        }else if(data.tipomensaje === 'imagen' || data.tipomensaje === 'pdf'){
            sendImageandText(data.cCliente, null , data.message, data);
        }

    } catch (error) {

        console.error('Error in EnvioMensajes:', error);

    }

}

const SendTextSimple = (to,mensaje,data) => {
    
    return new Promise((resolve, reject) => {
        var options = {
        'method': 'POST',
        'url': 'https://graph.facebook.com/v22.0/717333071471269/messages',
        'headers': {
            'Content-Type': ['application/json', 'application/json'],
            'Authorization': 'Bearer '+ process.env.META_WHATSAPP_TOKEN
        },
        body: JSON.stringify({
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "text",
            "text": {
            "preview_url": false,
            "body": mensaje
            }
        })

        };
        request(options, async function (error, response) {
        if (error) throw new Error(error);
        const json = {
            body : JSON.parse(response.body),
            res : data
        }
        const req = await InsertaRegistroCollecion(process.env.FIREBASE_COLECCION_MENSAJESAPI, json , JSON.parse(response.body).messages[0].id)
        });
    });
}

const sendImageandText = async (to, mensaje, imagen, data) => {

    const type  = data.tipomensaje === 'imagen' ? 'image' : 'document';

    // Generar el payload

    const IdUpload = await ApiUploadImage(imagen);
     
    return new Promise((resolve, reject) => {
        var options = {
        'method': 'POST',
        'url': 'https://graph.facebook.com/v22.0/717333071471269/messages',
        'headers': {
            'Content-Type': ['application/json', 'application/json']
            ,'Authorization': 'Bearer '+ process.env.META_WHATSAPP_TOKEN
        },
        body: JSON.stringify({
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": type,
            [type]: {
            "id": JSON.parse(IdUpload).id
            }
        })

        };
        request(options, async function (error, response) {
        if (error) throw new Error(error);
        const json = {
            body : JSON.parse(response.body),
            res : data
        }

        //console.log('resonde - ', json.body);
        const req = await InsertaRegistroCollecion(process.env.FIREBASE_COLECCION_MENSAJESAPI, json , JSON.parse(response.body).messages[0].id)
        });
    });

}

const ApiUploadImage = (payload) => {
    console.log('Iniciando ApiUploadImage');

    return new Promise((resolve, reject) => {
        const base64Data = payload.data.replace(/^data:.+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        const filepath = 'images/' + payload.filename;

        fs.writeFileSync(filepath, buffer);

        const options = {
            method: 'POST',
            url: 'https://graph.facebook.com/v22.0/717333071471269/media',
            headers: {
                'Authorization': 'Bearer ' + process.env.META_WHATSAPP_TOKEN
            },
            formData: {
                'messaging_product': 'whatsapp',
                'file': fs.createReadStream(filepath)
            }
        };

        request(options, (error, response) => {
            // Limpieza del archivo temporal
            fs.unlinkSync(filepath);

            if (error) {
                reject(error);
            } else {
                resolve(response.body); // Aquí retornas correctamente
            }
        });
    });
};

