import { conexiones } from '../dashboard/variables/env';

export const EnvioMensajeWspWeb = async (data) => {
    try {
        const back = window.location.href.includes(conexiones.front1) ? conexiones.back1 : conexiones.back2;
        const request = await fetch(`${back}send-message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "mensajes": [{
                    "mensaje":data.message,
                    "tipomensaje": "texto"
                }],
                "cCliente": data.to + "@c.us",
                "cUsuario": data.from +"@c.us"
            })
        });

        const response = await request.json();
        alert('Respuesta del servidor: '  + response.message);

    } catch (error) {

        console.error('Error al enviar el mensaje de prueba:', error);
        alert("Error al enviar el mensaje de prueba, revisa la consola para mas detalles.");

    }
}