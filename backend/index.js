// Importar dependencias necesarias en ES Modules
import express from 'express';
import http from 'http';
import fs from 'fs';
import https from 'https';
import { Server as socketIo } from 'socket.io';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const privateKey = fs.readFileSync('./certs/server.key', 'utf8');
const certificate = fs.readFileSync('./certs/server.cert', 'utf8');
const credentials = { key: privateKey, cert: certificate };


import { createClient, ObtieneWspConectados, enviaMensaje } from './services/whatsappService.js';
import { ListDevices, SearchContentChat, ListContactChats, ListContactosTimeReal, ListContactContentChats, SearchCollecion, SearchContentChatTimeReal , SearchLastChatsBetweenUsers , SearchLastChatsBetweenUsersAll} from './services/firebase.js';

// Crear la aplicación Express
const app = express();
app.use(express.json({limit: '50mb'})); // <-- necesario para leer JSON

// Crear servidor HTTP
const server = https.createServer(credentials,app);

// Configurar Socket.IO
const io = new socketIo(server, {
  cors: {
    origin: [process.env.URL_FRONTEND_LOCAL, process.env.URL_FRONTEND_TAILSCALE] || '*',  // Puedes permitir solicitudes desde cualquier origen o desde uno específico
    methods: ["GET", "POST"],
    credentials: true
  }
});


// ListContactosTimeReal

//ListContactosTimeReal('Contactos', io);


// Obtiene Datos

ObtieneWspConectados(io);

const connectedUsers = {};  // Variable para almacenar usuarios conectados

// Conectar Socket.IO
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  connectedUsers[socket.id] = {
    userId,        // Almacenar userId (si está disponible)
    socketId: socket.id,  // Guardar el socket ID
    connectedAt: new Date()  // Puedes almacenar la fecha de conexión
  };


  socket.on('create-client', (DeviceName) => {
    console.log(`Creating client with session: ${DeviceName}`);
    createClient(DeviceName, io);  // Crear un cliente de WhatsApp y vincularlo a Socket.IO
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    delete connectedUsers[socket.id];
  });

  socket.on('list-devices-req', async () => {
    const data = await ListDevices('Sesiones')
    socket.emit('list-devices-res', { data: data })
  })

  socket.on('list-clients-chat-on-first', async () => {
    const data = await ListContactChats('Contactos');
    socket.emit('list-clients-chat-emit-first', data)
  })

  socket.on('list-clients-chat-content-on-first', async () => {
    const data = await ListContactContentChats('Chats'); // Limpiado
    socket.emit('list-clients-chat-content-emit-first', data) // Limpiado
  })

  socket.on('send-message-chat', async (e) => {
   await enviaMensaje(e.message, e.cCliente, e.cUsuario, e.tipomensaje);
  })

  socket.on('message-search-contacto-req', async (e) => {
    const data = await SearchCollecion('Contactos', e.search);
    socket.emit('message-search-contacto-res', { 'data': data })
  })

  // Obtiene contenido del chat del clic seleccionado
  
  socket.on('list-clients-content-chat', async (e) => {
    const data = await SearchContentChat('Chats', e.cCliente, e.cUsuario);
    socket.emit('list-clients-content-chat', { 'data': data })
    const maxTime = Math.max(...data.map(item => new Date(item.time).getTime()));
    const maxDate = new Date(maxTime);
    await SearchContentChatTimeReal('Chats', e.cCliente, e.cUsuario, maxDate, io , connectedUsers , socket.id);
  })

  socket.on('message-search-contacto-elimina', async (e) =>{
    await SearchContentChatTimeReal('Chats', e.cCliente, e.cUsuario, "", io , connectedUsers , socket.id);
  })

});

// Pagina Principal

app.get('/', (req, res) => {
  res.send('Hello World!');
}
);

app.post('/send-message', async (req, res) => {
  const { mensajes, cCliente, cUsuario } = req.body;

  // Validación básica
  if (!Array.isArray(mensajes)) {
    return res.status(400).json({ error: 'mensajes debe ser un array de objetos con mensaje y tipomensaje' });
  }

  // Limpiar número de cliente
  const cClienteSinEspacios = cCliente.replace(/\s+/g, '');
  const cClienteSinSignos = cClienteSinEspacios.replace(/\+/g, '');

  try {
    for (const { mensaje, tipomensaje } of mensajes) {
      await enviaMensaje(mensaje, cClienteSinSignos, cUsuario, tipomensaje);
    }

    res.status(200).json({ message: 'Todos los mensajes fueron enviados correctamente' });
  } catch (error) {
    console.error('Error enviando mensajes:', error);
    res.status(500).json({ error: 'Error al enviar uno o más mensajes' });
  }
});


// Endpoint para obtener los ultimos chats de un cliente ( Agencia de Marketing)


app.post('/get-last-chats-agencia', async (req, res) => {
  const { cCliente, cUsuario } = req.body;

  if (!cCliente?.trim() || !cUsuario?.trim()) {
    return res.status(400).json({ error: 'cCliente y cUsuario son requeridos' });
  }

  try {
    const data = await SearchLastChatsBetweenUsers('Chats', cCliente + '@c.us', cUsuario + '@c.us', 10); // Cambia a 5 si quieres
    res.status(200).json({ data });
  } catch (error) {
    console.error('Error obteniendo los últimos chats:', error);
    res.status(500).json({ error: 'Error al obtener los últimos chats' });
  }
});

app.post('/get-last-chats-agenciall', async (req, res) => {
  const { cCliente, cUsuario } = req.body;

  if (!cCliente?.trim() || !cUsuario?.trim()) {
    return res.status(400).json({ error: 'cCliente y cUsuario son requeridos' });
  }

  try {
    const data = await SearchLastChatsBetweenUsersAll('Chats', cCliente + '@c.us', cUsuario + '@c.us', 10); // Cambia a 5 si quieres
    res.status(200).json({ data });
  } catch (error) {
    console.error('Error obteniendo los últimos chats:', error);
    res.status(500).json({ error: 'Error al obtener los últimos chats' });
  }
});

// Iniciar el servidor
const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`App is listening on port  ${port}`);
});
