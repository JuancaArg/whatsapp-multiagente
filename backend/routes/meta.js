import { Router } from "express";
import {MetaController} from '../Controller/MetaController.js';
import {EnvioMensajes} from '../services/Meta/EnvioMensajes.js';
const router = Router();

const verifyToken = process.env.VERIFY_TOKEN || 'my_verify_token';

// Route for GET requests
router.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

// Route for POST requests
router.post('/', (req, res) => {

    MetaController(req.body);
    res.status(200).end();
  
});

router.post('/send-message', (req,res)=>{

  try {
    EnvioMensajes(req.body)
    res.status(200).json({mensaje: "Se envio correctamente"})
  } catch (error) {
    res.status(500).json({error: error})
  }

})

export default router;