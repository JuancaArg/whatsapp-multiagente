//const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, MessageMedia } = pkg;
import { addUser, updateUser, ListDevices, addReg, InsertaContacto } from './firebase.js';

import fs from 'fs';
import path from 'path';

// Alimenta Objeto Clientes 

const clientsMap = new Map();

export async function ObtieneWspConectados(io) {
    try {
        const clients = await ListDevices('Sesiones');
        const sessionsDir = './public/';
        const validFolders = clients.map(client => client.nIdRef);

        const allFolders = fs.readdirSync(sessionsDir);
        allFolders.forEach(folder => {
            const folderPath = path.join(sessionsDir, folder);

            // Verifica si la carpeta es válida
            if (!validFolders.includes(folder)) {
                console.log(`Eliminando carpeta no válida: ${folderPath}`);
                fs.rmSync(folderPath, { recursive: true, force: true });
            }
        });

        for (const element of clients) {
            console.log(`Inicializando sesión para: ${element.cNombreDispositivo}`);

            const cl = new Client({
                authStrategy: new LocalAuth({
                    dataPath: `./public/${element.nIdRef}`,
                    clientId: element.nIdRef,
                }),
                puppeteer: {
                    // Ejecutar en modo headless (sin interfaz gráfica)
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-infobars',
                        '--window-position=0,0',
                        '--ignore-certifcate-errors',
                        '--ignore-certifcate-errors-spki-list',
                        '--disable-web-security',
                        '--disable-site-isolation-trials',
                        '--no-first-run',
                        '--no-zygote',
                        '--single-process',
                        '--disable-gpu'
                    ],
                }
            });

            // Esperar a que el cliente esté listo antes de continuar con el siguiente
            await new Promise((resolve, reject) => {
            
                cl.on('ready', () => {
                    console.log(`Cliente listo: ${element.cNombreDispositivo}`);
                    resolve();
                });
                

                cl.on('authenticated', () => {
                    console.log(`Sesión autenticada: ${element.cNombreDispositivo}`);
                });

                cl.on('auth_failure', (error) => {
                    console.error(`Fallo en la autenticación para ${element.cNombreDispositivo}:`, error);
                    reject(error);
                });

                cl.on('message_create', async (message) => {
                    try {
                        const isFromMe = message.fromMe === false;
                        await InsertaContacto('Contactos', isFromMe ? message.to : message.from, isFromMe ? message.from : message.to);

                        const data = {
                            from: message.from || 'No definido',
                            to: message.to || 'No definido',
                            fromMe: message.fromMe || false,
                            type: message.type || 'No definido',
                            body: message.body || message._data?.list?.description || 'No definido',
                            id: message.id.id || 'No definido',
                            time: new Date().toISOString(),
                            datamedia: null,
                        };

                        if (message.hasMedia) {
                            const media = await message.downloadMedia();
                            if (media && ['image', 'sticker', 'ptt', 'audio'].includes(message.type)) {
                                data.datamedia = media.data;      
                            }
                            else if (message.type === 'document') {
                                data.datamedia = media.data;
                                data.body = media.filename || 'No definido';
                            }
                        }
                    
                        await addReg('Chats', data);


                        // Logica para mandar mensaje a Microservicio de Google 

                        try {                 
                            
                            //console.log(data.body, data.to);

                            var myHeaders = new Headers();
                            myHeaders.append("Content-Type", "application/json");

                            var raw = JSON.stringify({
                            "body": data.body,
                            "to": data.to,
                            "from": data.from
                            });

                            var requestOptions = {
                            method: 'POST',
                            headers: myHeaders,
                            body: raw,
                            redirect: 'follow'
                            };

                            fetch("https://updatenotion-31715056154.me-west1.run.app", requestOptions)
                            .catch(error => console.log('error', error));                            

                        } catch (error) {
                            console.error('Error con el microservicio', error);
                            // No lanzamos error para que el proceso siga
                        }

                    } catch (error) {
                        console.error('Error procesando mensaje:', error);
                    }
                });

                cl.initialize();
            });

            // Agregar el cliente al mapa después de que esté listo
            clientsMap.set(element.nIdRef, cl);
        }

        console.log('Todos los clientes se han inicializado correctamente.');
    } catch (error) {
        console.error('Error al cargar las sesiones:', error);
    }
}



export async function enviaMensaje(mensaje, cliente, usuario, tipomensaje) {

    try {
        const cConectados = await ListDevices('Sesiones');

        const cfiltrado = cConectados.filter((e) => { return e.nPhoneNumber.includes(usuario) })
        const nIdRef = cfiltrado[0].nIdRef

        const cl = clientsMap.get(nIdRef);

        if (cl) {

            if ( tipomensaje === 'texto' ) {
                await cl.sendMessage(cliente, mensaje);
            } else if (tipomensaje === 'imagen' || tipomensaje === 'pdf' || tipomensaje === 'audio') {
                const body = new MessageMedia( mensaje.mimetype,  mensaje.data, mensaje.filename);
                await cl.sendMessage(cliente, body);
            } else {
                console.log('Tipo de mensaje no soportado');
            }
       }

    } catch (error) {

        console.log(error)

    }

}

export async function createClient(DeviceName, io) {

    // Inserta registro en FireBase

    const dFecha = new Date();

    const DataReg = {
        cNombreDispositivo: DeviceName+"@c.us",
        dFechaConexion: dFecha,
        cDataJson: "",
        nIdRef: "",
        nPhoneNumber: DeviceName+"@c.us",
    }

    const idFireBase = await addUser(DataReg);

    const client = new Client({
        authStrategy: new LocalAuth({
            dataPath: "./public/" + idFireBase,
            clientId: idFireBase
        })
    });

    clientsMap.set(idFireBase, client);

    // Configurar eventos del cliente
    client.on('ready', () => {
        console.log(`Client with session ${DeviceName} is ready!`);
        io.emit('client-status', { DeviceName, status: 'ready' });
    });


    client.on('qr', (qr) => {
        console.log(`QR for session ${DeviceName} received`);
        console.log(qr);

        // Aquí, estamos enviando el QR como una cadena base64 para renderizar en el frontend
        //let qrgenerado = qrcode.generate(qr, {small:true})
        io.emit('qr-code', { DeviceName, qrCodeUrl: qr })
    });

    client.on('message_create', async (message) => {
                    try {
                        const isFromMe = message.fromMe === false;
                        await InsertaContacto('Contactos', isFromMe ? message.to : message.from, isFromMe ? message.from : message.to);

                        const data = {
                            from: message.from || 'No definido',
                            to: message.to || 'No definido',
                            fromMe: message.fromMe || false,
                            type: message.type || 'No definido',
                            body: message.body || message._data?.list?.description || 'No definido',
                            id: message.id.id || 'No definido',
                            time: new Date().toISOString(),
                            datamedia: null,
                        };

                        if (message.hasMedia) {
                            const media = await message.downloadMedia();
                            if (media && ['image', 'sticker', 'ptt', 'audio'].includes(message.type)) {
                                data.datamedia = media.data;      
                            }
                            else if (message.type === 'document') {
                                data.datamedia = media.data;
                                data.body = media.filename || 'No definido';
                            }
                        }
                    
                        await addReg('Chats', data);


                        // Logica para mandar mensaje a Microservicio de Google 

                        try {                 
                            
                            //console.log(data.body, data.to);

                            var myHeaders = new Headers();
                            myHeaders.append("Content-Type", "application/json");

                            var raw = JSON.stringify({
                            "body": data.body,
                            "to": data.to,
                            "from": data.from
                            });

                            var requestOptions = {
                            method: 'POST',
                            headers: myHeaders,
                            body: raw,
                            redirect: 'follow'
                            };

                            fetch("https://updatenotion-31715056154.me-west1.run.app", requestOptions)
                            .catch(error => console.log('error', error));                            

                        } catch (error) {
                            console.error('Error con el microservicio', error);
                            // No lanzamos error para que el proceso siga
                        }

                    } catch (error) {
                        console.error('Error procesando mensaje:', error);
                    }
                });

    client.on('authenticated', async () => {
        await updateUser('Sesiones', idFireBase);
        io.emit('authenticated', { status: true })
    })

    client.on('disconnected', (reason) => {
        console.log(`Client ${DeviceName} disconnected: ${reason}`);

        // Intentar reconectar si no es por logout
        if (reason !== 'user_logout') {
            setTimeout(() => {
                console.log(`Reconnecting client ${DeviceName}...`);
                createClient(DeviceName, io); // Reconectar cliente
            }, 5000);
        }
    });

    client.initialize();
    return client;
}
