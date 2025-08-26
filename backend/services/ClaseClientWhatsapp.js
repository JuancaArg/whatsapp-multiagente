import { clientsMap } from '../variables/ChatsTiempoReal.js';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;

export class WhatsappSession {

    constructor({device, socket}) {
        this.device = device;
        this.socket = socket;
        this.clientsMap = clientsMap;
        this.client = null;
    }

    async start(){

        this.client = new Client({
            authStrategy: new LocalAuth({
                dataPath: `./public/${this.device}`,
                clientId: this.device
            }),
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process',
                    '--disable-infobars',
                    '--disable-web-security',
                    '--disable-features=IsolateOrigins,site-per-process'
                ],
                timeout: 0
            }
        });

        this._registerEvents();

    }

    _registerEvents() {

        this.client.on('qr', (qr) => {
            this.socket.emit('qr-code',{DeviceName: "",qrCodeUrl: qr});
        });

        this.client.on('authentication', async () => {
            await updateUser(process.env.FIREBASE_COLECCION_SESIONES, this.device);
            this.socket.emit('authenticated', {status: true});
        });

        this.client.on('ready', () => {
            this.socket.emit('client-status', {DeviceName,status: 'ready'});
        });

        this.client.on('message_create', async (message) => {
            const isFromMe = message.fromMe === false;
            await InsertaContacto(process.env.FIREBASE_COLECCION_CONTACTOS, isFromMe ? message.to : message.from, isFromMe ? message.from : message.to);
        });

    }
}