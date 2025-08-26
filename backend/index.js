// Importar dependencias necesarias en ES Modules
import express from 'express';
import http from 'http';
import fs from 'fs';
import https from 'https';
import {
    Server as socketIo
} from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';

// Cargar variables de entorno
dotenv.config();

const privateKey = fs.readFileSync('./certs/server.key', 'utf8');
const certificate = fs.readFileSync('./certs/server.cert', 'utf8');
const credentials = {
    key: privateKey,
    cert: certificate
};

import {
    createClient,
    ObtieneWspConectados,
    enviaMensaje
} from './services/whatsappService.js';
import {
    ListDevices,
    ListContactChats,
    ListContactContentChats,
    SearchCollecion,
    SearchContentChatTimeReal,
    SearchLastChatsBetweenUsers,
    SearchLastChatsBetweenUsersAll,
    OpenSuscripcion_ChatAbierto,
    BuscaUltimosMensajes
} from './services/firebase.js';
import {
    Suscripcion_ChatAbierto,
    Timer_Expiracion_Chat,
    TIEMPO_EXPIRACION_MS,
    clientsMap
} from './variables/ChatsTiempoReal.js';

import RouteMeta from './routes/meta.js';

// Crear la aplicación Express
const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(express.json({
    limit: '10mb'
})); // <-- necesario para leer JSON

// Importar rutas

app.use('/meta', RouteMeta);

// Crear servidor HTTP
const server = https.createServer(credentials, app);

// Configurar Socket.IO
const io = new socketIo(server, {
    cors: {
        origin: [process.env.URL_FRONTEND_LOCAL, process.env.URL_FRONTEND_TAILSCALE] || '*', // Puedes permitir solicitudes desde cualquier origen o desde uno específico
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Obtiene Datos

ObtieneWspConectados(io);

// Conectar Socket.IO
io.on('connection', (socket) => {
    socket.on('create-client', (DeviceName) => {
        console.log(`Creating client with session: ${DeviceName}`);
        createClient(DeviceName, io); // Crear un cliente de WhatsApp y vincularlo a Socket.IO
    });

    socket.on('disconnect', () => {
        //console.log('A user disconnected');
    });

    socket.on('list-devices-req', async () => {
        const data = await ListDevices(process.env.FIREBASE_COLECCION_SESIONES);
        socket.emit('list-devices-res', {
            data: data
        })
    })

    socket.on('list-clients-chat-on-first', async () => {
        const data = await ListContactChats(process.env.FIREBASE_COLECCION_CONTACTOS);
        socket.emit('list-clients-chat-emit-first', data)
    })

    socket.on('list-clients-chat-content-on-first', async () => {
        const data = await ListContactContentChats(process.env.FIREBASE_COLECCION_CHATS); // Limpiado
        socket.emit('list-clients-chat-content-emit-first', data) // Limpiado
    })

    socket.on('send-message-chat', async (e) => {
        await enviaMensaje(e.message, e.cCliente, e.cUsuario, e.tipomensaje);
    })

    socket.on('message-search-contacto-req', async (e) => {
        const data = await SearchCollecion(process.env.FIREBASE_COLECCION_CONTACTOS, e.search);
        socket.emit('message-search-contacto-res', {
            'data': data
        })
    })

    // Obtiene contenido del chat del clic seleccionado

    socket.on('list-clients-content-chat', async (e) => {
        const data = await BuscaUltimosMensajes(process.env.FIREBASE_COLECCION_CHATS, e.cCliente, e.cUsuario);
        socket.emit('list-clients-content-chat', {
            'data': data
        })
        //await SearchContentChatTimeReal(process.env.FIREBASE_COLECCION_CHATS, e.cCliente, e.cUsuario, maxDate, io , connectedUsers , socket.id);
    })

    socket.on('message-search-contacto-elimina', async (e) => {
        await SearchContentChatTimeReal(process.env.FIREBASE_COLECCION_CHATS, e.cCliente, e.cUsuario, "", io);
    })

    socket.on('chat-abierto-frontend', async (e) => {

        try {
            //Verificacion si e.cCliente y e.cUsuario existen
            if (!e.cCliente || !e.cUsuario) {
                //console.error('cCliente y cUsuario son requeridos para abrir un chat');
                return;
            }
            //Ccliente = Whatsapp del usuario | | cUsuario = Whatsapp del agente de marketing
            const key = socket.id + e.cCliente + e.cUsuario;

            // Verificar si ya existe una suscripción para este cliente
            if (Suscripcion_ChatAbierto[key]) {
                clearTimeout(Timer_Expiracion_Chat[key]);
                Timer_Expiracion_Chat[key] = setTimeout(() => {
                    //console.log('⛔ Suscripción expirada por inactividad:', key);
                    // Cerrar la suscripción
                    Suscripcion_ChatAbierto[key]?.unsubscribe?.(); // llamamos al unsubscribe guardado
                    delete Suscripcion_ChatAbierto[key];
                    delete Timer_Expiracion_Chat[key];
                }, TIEMPO_EXPIRACION_MS);
                return;
            }
            // Creamos suscripción y guardamos el unsubscribe
            Suscripcion_ChatAbierto[key] = await OpenSuscripcion_ChatAbierto(io, e, key, socket.id);
            //console.log('⏏️ Suscripción creada por ingreso:', key);

            Timer_Expiracion_Chat[key] = setTimeout(() => {
                //console.log('⛔ Suscripción expirada por inactividad:', key);
                Suscripcion_ChatAbierto[key]?.unsubscribe?.();
                delete Suscripcion_ChatAbierto[key];
                delete Timer_Expiracion_Chat[key];
            }, TIEMPO_EXPIRACION_MS);

        } catch (error) {

            console.error('Error al abrir suscripción de chat:', error);
            socket.emit('error-chat-abierto', {
                error: 'Error al abrir suscripción de chat'
            });

        }

    });

    // Reconectar dispositivo de Whatsapp en base a mapa de Clientes

    socket.on('obtener-qr-reconectar', async (cNombreDispositivo) => {

        //console.log(clientsMap);

        const clientData = clientsMap.get(cNombreDispositivo);

        if (!clientData) {
            console.error(`No se encontró el cliente con nombre: ${cNombreDispositivo}`);
            return;
        }

        socket.emit('qr-reconectar', clientData.QR || null);

    });

    // Desconectar dispositivo de Whatsapp en base a mapa de Cliente y hacer que se vuelva a conectar

    socket.on('Desconectar-Dispositvo', (cNombreDispositivo) => {

        console.log(`Desconectando cliente: ${cNombreDispositivo}`);

        const clientData = clientsMap.get(cNombreDispositivo);

        if (!clientData) {
            console.error(`No se encontró el cliente con nombre: ${cNombreDispositivo}`);
            return;
        }

        // Desconectar el cliente
        clientData.client.destroy().then(() => {
            console.warn('Cliente desconectado correctamente');
            clientsMap.delete(clientData.nIdRef);
            Sesion_Eliminar(clientData.nIdRef);
            console.warn('Se eliminó la sesión de Firebase:', clientData.nIdRef);

        }).catch(err => {
            console.error('Error en el proceso de reinicio del cliente:', err);
        });
    });

});

// Pagina Principal

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/send-message', async (req, res) => {
    const {
        mensajes,
        cCliente,
        cUsuario
    } = req.body;

    // Validación básica
    if (!Array.isArray(mensajes)) {
        return res.status(400).json({
            error: 'mensajes debe ser un array de objetos con mensaje y tipomensaje'
        });
    }

    // Limpiar número de cliente
    const cClienteSinEspacios = cCliente.replace(/\s+/g, '');
    const cClienteSinSignos = cClienteSinEspacios.replace(/\+/g, '');

    try {
        for (const {
                mensaje,
                tipomensaje
            }
            of mensajes) {
            await enviaMensaje(mensaje, cClienteSinSignos, cUsuario, tipomensaje);
        }

        res.status(200).json({
            message: 'Todos los mensajes fueron enviados correctamente'
        });
    } catch (error) {
        console.error('Error enviando mensajes:', error);
        res.status(500).json({
            error: 'Error al enviar uno o más mensajes'
        });
    }
});


// Endpoint para obtener los ultimos chats de un cliente ( Agencia de Marketing)


app.post('/get-last-chats-agencia', async (req, res) => {
    const {
        cCliente,
        cUsuario
    } = req.body;

    if (!cCliente?.trim() || !cUsuario?.trim()) {
        return res.status(400).json({
            error: 'cCliente y cUsuario son requeridos'
        });
    }

    try {
        const data = await SearchLastChatsBetweenUsers(process.env.FIREBASE_COLECCION_CHATS, cCliente + '@c.us', cUsuario + '@c.us', 10); // Cambia a 5 si quieres
        res.status(200).json({
            data
        });
    } catch (error) {
        console.error('Error obteniendo los últimos chats:', error);
        res.status(500).json({
            error: 'Error al obtener los últimos chats'
        });
    }
});

app.post('/get-last-chats-agenciall', async (req, res) => {
    const {
        cCliente,
        cUsuario
    } = req.body;

    if (!cCliente?.trim() || !cUsuario?.trim()) {
        return res.status(400).json({
            error: 'cCliente y cUsuario son requeridos'
        });
    }

    try {
        const data = await SearchLastChatsBetweenUsersAll(process.env.FIREBASE_COLECCION_CHATS, cCliente + '@c.us', cUsuario + '@c.us', 10); // Cambia a 5 si quieres
        res.status(200).json({
            data
        });
    } catch (error) {
        console.error('Error obteniendo los últimos chats:', error);
        res.status(500).json({
            error: 'Error al obtener los últimos chats'
        });
    }
});

app.post('/notification', (req, res) => {

    io.emit('notification', req.body);

    return res.status(200).json({
        message: 'Notification sent successfully'
    });

})
// Iniciar el servidor
const port = process.env.PORT;
server.listen(port, () => {
    console.log(`App is listening on port  ${port}`);
});