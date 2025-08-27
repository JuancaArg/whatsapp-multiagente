import { CapturaMensajes } from "../services/Meta/CapturaMensajes.js"; 
import { EnvioMensajes } from "../services/Meta/EnvioMensajes.js";

export const MetaController = (body) => {

    try {

        //console.log(JSON.stringify(body));

        if (body?.entry[0]?.changes[0]?.field === 'messages') {

            CapturaMensajes(body);

        }
    } catch (error) {

        console.error('Error in MetaController:', error);

    }

}


// Funciones controladores

export const MetaControladorFunciones = (tipo,data) => {

    if (tipo === 'Mensaje_envio') {

        EnvioMensajes(data);

    }

}
