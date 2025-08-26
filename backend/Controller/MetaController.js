import { CapturaMensajes } from "../services/Meta/CapturaMensajes.js"; 

export const MetaController = (body) => {

    try {

        console.log(JSON.stringify(body));

        if (body?.entry[0]?.changes[0]?.field === 'messages') {

            CapturaMensajes(body);

        }
    } catch (error) {

        console.error('Error in MetaController:', error);

    }

}