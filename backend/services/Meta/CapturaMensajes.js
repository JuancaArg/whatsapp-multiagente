import { ObtieneDataMensajeisMe } from './ObtieneMensajeMe.js';
import { InsertaMensajeFirebase } from './InsertaMensajeFirebase.js';
import { RetornoTipoMensaje } from './RetornoTipoMensaje.js';
import { DescargaMedia } from './Media.js';

export const CapturaMensajes = async (body) => {

    try {
        
        //console.log(JSON.stringify(body));

        //console.log('Received POST request with body desde CapturaMensajes.js :', JSON.stringify(body));

        // Formata el mensaje recibido

        let cIdWhatsappBusinees = body?.entry?.[0]?.id;
        let isMe = !body?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.wa_id ;
        let cNumberCliente = !isMe ? body?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.wa_id : null;
        let nIdMensaje  = !isMe ? body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.id : null;
        let dFechaMensaje = new Date().toISOString();
        let Origen = 'Whatsapp API';
        let cTipoMensaje = !isMe ? body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.type : null;
        let cMensaje = null;
        let datamedia = null;

        // Actualiza el tipo de mensaje a formato interno
        cTipoMensaje = RetornoTipoMensaje(cTipoMensaje);

        // Valida el tipo de mensaje y completa los datos
        if (cTipoMensaje === 'texto'){
            cMensaje  = !isMe ? body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body : null;
        }else if (cTipoMensaje === 'image'){
            cMensaje  = !isMe ? body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.image?.caption : null;
            const image =  body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.image?.id 
                        || body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.sticker?.id
                        || null;
            datamedia = (await DescargaMedia(image)).base64;
        }else if (cTipoMensaje === 'audio'){
            const audio =  body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.audio?.id || null;
            datamedia = (await DescargaMedia(audio)).base64;
        }else if (cTipoMensaje === 'document'){
            const document =  body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.document?.id || null;
            const res = await DescargaMedia(document)
            console.log('res ', res);
            res?.error === 'si' ? (datamedia = null, cMensaje = res?.mensaje, cTipoMensaje = 'texto') : datamedia = res?.base64;
        }else if (cTipoMensaje === 'Botón'){
            cMensaje = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.button?.text || body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.button?.payload;
        }      

        if (isMe){
            // Solo continua el proceso si el mensaje tiene como status 'sent'
            if (body?.entry?.[0]?.changes?.[0]?.value?.statuses?.[0]?.status === 'sent') {

                const id = body?.entry?.[0]?.changes?.[0]?.value?.statuses?.[0]?.id;
                const dataMensaje = await ObtieneDataMensajeisMe(id);

                cNumberCliente = body?.entry?.[0]?.changes?.[0]?.value?.statuses?.[0]?.recipient_id;
                cTipoMensaje = dataMensaje?.res?.tipomensaje ? RetornoTipoMensaje(dataMensaje?.res?.tipomensaje) : 'texto';
                cMensaje = ['image','document'].includes(cTipoMensaje) ? null : dataMensaje?.res?.message || 'No se encontro Mensaje';
                datamedia = dataMensaje?.res?.message?.data || null;
                nIdMensaje = id;
            }
            else {
                return; // Sale de la funcion si el mensaje no es 'sent'
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

        //console.log('📩 Formatted message data:', data);
        InsertaMensajeFirebase(data);

    } catch (error) {

        console.error('Error in CapturaMensajes:', error);
        
    }

}