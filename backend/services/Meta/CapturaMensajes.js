import { ObtieneDataMensajeisMe } from './ObtieneMensajeMe.js';
import { InsertaMensajeFirebase } from './InsertaMensajeFirebase.js';
import { RetornoTipoMensaje } from './RetornoTipoMensaje.js';
import { DescargaMedia } from './Media.js';

export const CapturaMensajes = async (body) => {

    try {
        
        console.log('Received POST request with body desde CapturaMensajes.js :', body);

        // Formata el mensaje recibido

        let cIdWhatsappBusinees = body?.entry?.[0]?.id;
        let isMe = !body?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.wa_id ;
        let cNumberCliente = !isMe ? body?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.wa_id : null;
        let nIdMensaje  = !isMe ? body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.id : null;
        let dFechaMensaje = new Date().toISOString();
        let Origen = 'Whatsapp API';
        let cTipoMensaje = !isMe ? body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.type : null;
        let cMensaje;
        let datamedia = null;

        // Actualiza el tipo de mensaje a formato interno
        cTipoMensaje = RetornoTipoMensaje(cTipoMensaje);

        // Valida el tipo de mensaje y completa los datos
        if (cTipoMensaje === 'texto'){
            cMensaje  = !isMe ? body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body : null;
        }else if (cTipoMensaje === 'image'){
            cMensaje  = !isMe ? body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.image?.caption : null;
            datamedia = (await DescargaMedia(body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.image?.id)).base64;
        }

        if (isMe){
            // Solo continua el proceso si el mensaje tiene como status 'sent'
            if (body?.entry?.[0]?.changes?.[0]?.value?.statuses?.[0]?.status === 'sent') {

                const id = body?.entry?.[0]?.changes?.[0]?.value?.statuses?.[0]?.id;
                const dataMensaje = await ObtieneDataMensajeisMe(id);

                cNumberCliente = body?.entry?.[0]?.changes?.[0]?.value?.statuses?.[0]?.recipient_id;
                cTipoMensaje = dataMensaje.tipo;
                cMensaje = dataMensaje.mensaje;
                nIdMensaje = id;
            }
        }

        const data = {
            cIdWhatsappBusinees,
            isMe,
            cNumberCliente,
            cTipoMensaje,
            cMensaje,
            datamedia,
            nIdMensaje,
            dFechaMensaje,
            Origen
        };

        InsertaMensajeFirebase(data);

    } catch (error) {

        console.error('Error in CapturaMensajes:', error);
        
    }

}