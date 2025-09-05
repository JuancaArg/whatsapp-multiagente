import request from 'request';
import fs from 'fs';
import {InsertaRegistroCollecion} from '../../services/firebase.js';
import dotenv from 'dotenv'
import { Datos_ObtieneIdentificar } from './datos.js';
dotenv.config();

export const EnvioMensajes = async (data) => {

    try {

        const datoswaba = await Datos_ObtieneIdentificar();
        const meWaba = datoswaba.find(i => data.cUsuario.includes(i.phonenumber));  
        const phoneId = !Array.isArray(meWaba) && meWaba?.phoneId
        if(!phoneId) return console.log('Alerta: Duplicidad o no se encontró waba - EnvioMensajes.js');        

        if (data.tipomensaje === 'texto'){
            SendTextSimple(data.cCliente, data.message, data, phoneId);
        }else if(data.tipomensaje === 'imagen' || data.tipomensaje === 'pdf'){
            sendImageandText(data.cCliente, null , data.message, data, phoneId);
        }

    } catch (error) {

        console.error('Error in EnvioMensajes:', error);

    }

}

const SendTextSimple = (to,mensaje,data,phoneId) => {

    try{

        return new Promise((resolve, reject) => {
            var options = {
            'method': 'POST',
            'url': `https://graph.facebook.com/v22.0/${phoneId}/messages`,
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
            if (error) return console.log('Error Enviamensaje -> ', error);
            const json = {
                body : JSON.parse(response.body),
                res : data
            }
            console.log(JSON.parse(response.body))
            try {
                const req = await InsertaRegistroCollecion(process.env.FIREBASE_COLECCION_MENSAJESAPI, json , JSON.parse(response.body).messages?.[0]?.id)    
            } catch (error) {
                console.log('Error en req | EnvioMensaje.js ->', error)
                console.log('El Mensaje que genero el error ->', JSON.parse(response.body).messages)
            }
            
            });
        });
    }catch(e){
        console.log(e);
    }
}

const sendImageandText = async (to, mensaje, imagen, data, phoneId) => {

    try {

        const type  = data.tipomensaje === 'imagen' ? 'image' : 'document';

        // Generar el payload

        const IdUpload = await ApiUploadImage(imagen,phoneId);
        
        return new Promise((resolve, reject) => {
            var options = {
            'method': 'POST',
            'url': `https://graph.facebook.com/v22.0/${phoneId}/messages`,
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
            const req = await InsertaRegistroCollecion(process.env.FIREBASE_COLECCION_MENSAJESAPI, json , JSON.parse(response.body).messages?.[0]?.id || 'No Encontrado')
            });
        });        
    } catch (error) {
        
        console.log(error);

    }



}

const ApiUploadImage = (payload, phoneId) => {

    try{

        console.log('Iniciando ApiUploadImage');

        return new Promise((resolve, reject) => {
            const base64Data = payload.data.replace(/^data:.+;base64,/, "");
            const buffer = Buffer.from(base64Data, "base64");
            const filepath = 'images/' + payload.filename;

            fs.writeFileSync(filepath, buffer);

            const options = {
                method: 'POST',
                url: `https://graph.facebook.com/v22.0/${phoneId}/media`,
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
    }
    catch(e){
        console.log(e);
    }
};

