import { CheckIcon, DocumentIcon, EyeIcon, ListBulletIcon, MicrophoneIcon, PaperAirplaneIcon, PhotoIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline"
import { useState, useEffect, use, useRef } from "react";
import { io } from "socket.io-client";
import { varrr } from "./variables/rs";
import { conexiones } from './variables/env';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import AudioRecorder from "./func_audio";


if (window.location.href.includes('192.168.100.100')) {
    var socket = io(conexiones.back1, {
        withCredentials: true
    });
} else {
    var socket = io(conexiones.back2, {
        withCredentials: true
    });
}

// Consultar link de paypal

function Obtiene_Datos_Ordern(id, token, { setOpenModalConsulta }) {

    var myHeaders = new Headers();
    myHeaders.append("Cookie", "l7_az=ccg14.slc");
    myHeaders.append("Authorization", "Bearer " + token);
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch("https://api-m.paypal.com/v2/invoicing/invoices/" + id, requestOptions)
        .then(response => response.text())
        .then(result =>

        // Show Payment

        {

            var myHeaders = new Headers();
            myHeaders.append("Cookie", "l7_az=ccg01.phx");
            myHeaders.append("Authorization", "Bearer " + token);
            myHeaders.append("Content-Type", "application/json");

            var requestOptions = {
                method: 'GET',
                headers: myHeaders,
                redirect: 'follow'
            };

            const resultado = JSON.parse(result);

            fetch("https://api-m.paypal.com/v2/payments/captures/" + resultado.payments.transactions[0].payment_id, requestOptions)
                .then(response => response.text())
                .then(result => {

                    // Show Orders

                    {

                        var myHeaders = new Headers();
                        myHeaders.append("Cookie", "l7_az=ccg01.phx");
                        myHeaders.append("Authorization", "Bearer " + token);
                        myHeaders.append("Content-Type", "application/json");

                        var requestOptions = {
                            method: 'GET',
                            headers: myHeaders,
                            redirect: 'follow'
                        };

                        const resultado_cap = JSON.parse(result);

                        fetch("https://api-m.paypal.com/v2/checkout/orders/" + resultado_cap.supplementary_data.related_ids.order_id, requestOptions)
                            .then(response => response.text())
                            .then(result =>

                            // Datos de order
                            {
                                const resultado_order = JSON.parse(result);
                                let countryName = "";
                                switch (resultado_order.payer.address.country_code) {
                                    case 'CO':
                                        countryName = 'Colombia';
                                        break;
                                    case 'PE':
                                        countryName = 'Perú';
                                        break;
                                    case 'CL':
                                        countryName = 'Chile';
                                        break;
                                    case 'MX':
                                        countryName = 'México';
                                        break;
                                    case 'EC':
                                        countryName = 'Ecuador';
                                        break;
                                    case 'AR':
                                        countryName = 'Argentina';
                                        break;
                                    default:
                                        countryName = resultado_order.payer.address.country_code;
                                }
                                alert("Nombres: " + resultado_order.payer.name.given_name + " " + resultado_order.payer.name.surname + "  \nCodigo Pais : " + countryName)
                                setOpenModalConsulta(false);
                                //const datamostrat = Json.stringify(resultado_order.purchase_units[0]);
                                //alert(datamostrat);
                            }

                            )
                            .catch(error => { alert('Error al Consultar Orden de Pago, Revisar si el link fue pagado, intente nuevamente más tarde') });

                    }

                })
                .catch(error => { alert('Error al Consultar Orden de Pago, Revisar si el link fue pagado, intente nuevamente más tarde') });

        }

        )
        .catch(error => { alert('Error al Consultar Orden de Pago, Revisar si el link fue pagado, intente nuevamente más tarde') });

}

function Obtiene_Token(id, { setOpenModalConsulta }) {

    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Basic QVpiS2ZoZ1gtb0oydWhmQjU3cENXOEQ5RU1WWS04ZmFjNHpROWdXMGF1RTN3THJhNldaSi1TX0NOWkF2MjJzOGVHc1Y5d2FTZ2NVSVN0UlQ6RU9kOGZpYmhiREk0ZWxxcldnaU1NdkwwR1NTaXljcmc2S1JhS0phSW5wT1BLWnc4MTRwclEzUTRheHo1d1BGNXdVRG00dFVpZVIybzNuYmQ=");
    myHeaders.append("Cookie", "l7_az=ccg14.slc");
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("grant_type", "client_credentials");

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow'
    };

    fetch("https://api-m.paypal.com/v1/oauth2/token", requestOptions)
        .then(response => response.text())
        .then(
            result => {
                const resultado = JSON.parse(result);
                const token = resultado.access_token;
                Obtiene_Datos_Ordern(id, token, { setOpenModalConsulta });
            }
        )
        .catch(error => console.log('error', error));

}

function ModalConsultarPayPal({ openModalConsulta, setOpenModalConsulta }) {

    const [codigo, setCodigo] = useState('')

    const handleChangeCodigo = (e) => {
        setCodigo(e.target.value)
    }

    const handleConsulta = () => {
        if (codigo === '') {
            alert('Faltan Datos por Ingresar');
            return;
        }

        Obtiene_Token(codigo, { setOpenModalConsulta });

    }

    return (
        <Dialog open={openModalConsulta} onClose={setOpenModalConsulta} className="relative z-10">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <DialogPanel
                        transition
                        className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                    >
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:size-10">
                                    <EyeIcon aria-hidden="true" className="size-6 text-green-400" />
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                    <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                                        Consultar
                                    </DialogTitle>
                                    <div className="mt-5 flex flex-row justify-center items-center gap-2">
                                        <label className="font-ligh text-sm" htmlFor="">Codigo de Link de paypal </label>
                                        <input className="border-2 px-2 rounded-md py-1 w-48 border-red-600 text-xs font-light"
                                            onChange={(e) => handleChangeCodigo(e)}
                                            type="text" name="" id="" />
                                    </div>
                                    <p className="font-light mt-4 text-sm">Solo copiar codigo, Ejemplo :</p>
                                    <img className="mt-5" src="ExampleCon.png" alt="" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            <button
                                type="button"
                                onClick={() => handleConsulta()}
                                className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-500 sm:ml-3 sm:w-auto"
                            >
                                Consultar
                            </button>
                            <button
                                type="button"
                                data-autofocus
                                onClick={() => setOpenModalConsulta(false)}
                                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                            >
                                Cancelar
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}



//

function SendInvoice(id, token, { setLoading, setOpenModal }) {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + token);
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("PayPal-Request-Id", id);

    var raw = JSON.stringify({
        "send_to_invoicer": true
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch("https://api-m.paypal.com/v2/invoicing/invoices/" + id + "/send", requestOptions)
        .then(response => response.text())
        .then(result => {
            const data = JSON.parse(result);
            alert(data.href);  // Muestra la alerta
            setLoading(false);
            setOpenModal(false);
        })
        .catch(error => console.log('error', error));
}

function CreateInvoce(token, body, { setLoading, setOpenModal }) {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + token);
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Prefer", "return=representation");

    var raw = JSON.stringify({
        "primary_recipients": [
            {
                "billing_info": {
                    "name": {
                        "full_name": body.name
                    },
                    "phones": [
                        {
                            "country_code": body.country_code,
                            "national_number": body.national_number,
                            "phone_type": "MOBILE"
                        }
                    ],
                    "email_address": body.email_address
                }
            }
        ],
        "items": [
            {
                "name": "Software de Marketing para Whatsapp Web - CRM o WM",
                "description": body.description,
                "quantity": "1",
                "unit_amount": {
                    "currency_code": "USD",
                    "value": body.value
                }
            }
        ],
        "detail": {
            "currency_code": "USD"
        },
        "invoicer": {
            "business_name": "Aprendelope Marketing & Software",
            "website": "www.aprendelope.com",
            "logo_url": "https://aprendelope.com/wp-content/uploads/2021/04/Logo.png",
            "email_address": "info@aprendelope.com"
        }
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch("https://api-m.paypal.com/v2/invoicing/invoices", requestOptions)
        .then(response => response.text())
        .then(result => {
            const data = JSON.parse(result);
            const idpago = data.id;
            SendInvoice(idpago, token, { setLoading, setOpenModal });

        }
        )
        .catch(error => console.log('error', error));
}

function ModalEnlacePayPal({ openModal, setOpenModal }) {
    const [open, setOpen] = useState(false)
    const [nombre, setNombre] = useState('')
    const [pretelefono, setPretelefono] = useState('')
    const [telefono, setTelefono] = useState('')
    const [email, setEmail] = useState('')
    const [software, setSoftware] = useState('')
    const [monto, setMonto] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setOpen(openModal)
    }
        , [openModal])

    const handleClosed = () => {
        setOpenModal(false)
    }

    const handleChangeNombre = (e) => {
        setNombre(e.target.value)
    }

    const handleChangePreTelefono = (e) => {
        setPretelefono(e.target.value)
    }

    const handleChangeTelefono = (e) => {
        setTelefono(e.target.value)
    }

    const handleChangeEmail = (e) => {
        setEmail(e.target.value)
    }

    const handleChangeSoftware = (e) => {
        setSoftware(e.target.value)
    }

    const handleChangeMonto = (e) => {
        setMonto(e.target.value)
    }

    const handleGenerateLinkPaypal = () => {

        if (pretelefono === '' || telefono === '' || software === '' || monto === '') {
            alert('Faltan Datos por Ingresar');
            return;
        }

        let body;

        if (nombre === '' || email === '') {
            body = { "name": "Cliente Generico Varios Paises", "country_code": pretelefono, "national_number": telefono, "email_address": "carlosargueda31@gmail.com", "description": software, "value": monto };
        }
        else {
            body = { "name": nombre, "country_code": pretelefono, "national_number": telefono, "email_address": email, "description": software, "value": monto };
        }

        setLoading(true);

        // Obtener Token de Sesion

        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Basic QVpiS2ZoZ1gtb0oydWhmQjU3cENXOEQ5RU1WWS04ZmFjNHpROWdXMGF1RTN3THJhNldaSi1TX0NOWkF2MjJzOGVHc1Y5d2FTZ2NVSVN0UlQ6RU9kOGZpYmhiREk0ZWxxcldnaU1NdkwwR1NTaXljcmc2S1JhS0phSW5wT1BLWnc4MTRwclEzUTRheHo1d1BGNXdVRG00dFVpZVIybzNuYmQ=");
        myHeaders.append("Cookie", "l7_az=ccg14.slc");
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        var urlencoded = new URLSearchParams();
        urlencoded.append("grant_type", "client_credentials");

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: urlencoded,
            redirect: 'follow'
        };

        fetch("https://api-m.paypal.com/v1/oauth2/token", requestOptions)
            .then(response => response.text())
            .then(
                result => {
                    const resultado = JSON.parse(result);
                    const token = resultado.access_token;
                    CreateInvoce(token, body, { setLoading, setOpenModal });
                }
            )
            .catch(error => console.log('error', error));

    }


    return (
        <Dialog open={open} onClose={handleClosed} className="relative z-10">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <DialogPanel
                        transition
                        className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                    >
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start w-full">
                                <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:size-10">
                                    <CheckIcon aria-hidden="true" className="size-6 text-green-600" />
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                    <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                                        Generar Enlace de PayPal
                                    </DialogTitle>
                                    {
                                        loading === true ?
                                            <div className="px-4 py-4 bg-red-400 text-white font-bold flex flex-row absolute bottom-[50%] left-[40%] rounded-md justify-center items-center">
                                                <p>Cargando ......</p>
                                            </div>
                                            : null
                                    }

                                    <div className="mt-4 w-full">
                                        <div className="w-full flex flex-row">
                                            <label htmlFor="" className="text-sm w-[33%]">Nombre del Cliente</label>
                                            <input type="text" className="border rounded-md ml-4 py-1 px-1 font-light text-sm border-gray-300" placeholder="Ingresar Nombres" onChange={(e) => handleChangeNombre(e)} name="" id="" />
                                        </div>
                                        <div className="w-full flex flex-row mt-4">
                                            <label htmlFor="" className="text-sm w-[33%]">Telefono Cliente</label>
                                            <input type="text" className="border-2 rounded-md ml-4 py-1 px-1 font-light text-sm border-red-300 w-14 " placeholder="Codigo Pais" onChange={(e) => handleChangePreTelefono(e)} name="" id="" />
                                            <input type="text" className="border-2 rounded-md ml-4 py-1 px-1 font-light text-sm border-red-300" placeholder="Numero" name="" id="" onChange={(e) => handleChangeTelefono(e)} />
                                        </div>
                                        <div className="w-full flex flex-row mt-4">
                                            <label htmlFor="" className="text-sm w-[33%]">Correo Cliente</label>
                                            <input type="email" className="border rounded-md ml-4 py-1 px-1 font-light text-sm border-gray-300" placeholder="Ingresar Email" name="" id="" onChange={(e) => handleChangeEmail(e)} />
                                        </div>
                                        <div className="w-full flex flex-row mt-4">
                                            <label htmlFor="" className="text-sm w-[33%]">Software Venta</label>
                                            <input type="text" className="border-2 rounded-md ml-4 py-1 px-1 font-light text-sm border-red-300" placeholder="Chatbot o Masivo" name="" id="" onChange={(e) => handleChangeSoftware(e)} />
                                        </div>
                                        <div className="w-full flex flex-row mt-4">
                                            <label htmlFor="" className="text-sm w-[33%]">Monto de Pago</label>
                                            <input type="number" className="border-2 rounded-md ml-4 py-1 px-1 font-light text-sm border-red-300" placeholder="Ej. 50.00" min="0" name="" id="" onChange={(e) => handleChangeMonto(e)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            <button
                                type="button"
                                onClick={() => handleGenerateLinkPaypal()}
                                className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-500 sm:ml-3 sm:w-auto"
                            >
                                Generar
                            </button>
                            <button
                                type="button"
                                data-autofocus
                                onClick={() => handleClosed()}
                                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                            >
                                Cancelar
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}

function RespuestasRapidas({ respuestarapida, setRespuestarapida, setMensajerrs }) {

    const rr = varrr

    const [rrs, setRrs] = useState(rr)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        setOpen(true)
        //console.log(respuestarapida, respuestarapida.length)
        setRrs(rr.filter(i => i.toLowerCase().includes(respuestarapida.toLowerCase())))
    }, [respuestarapida])

    const handleClicRR = (e) => {
        setMensajerrs(e.target.textContent);
        setOpen(false)
    }

    return (
        <>
            {respuestarapida.length === 0 || open === false || rrs.length === 0 ? void 0 :
                <div className="bg-white py-1 px-4 flex flex-col absolute bottom-[6.5vh] left-0 right-0 overflow-auto max-h-[25rem] rounded-md ml-[6.5rem] w-[84%] shadow-md">
                    {rrs.map(i => <p className="text-sm font-normal border-gray-300 border-b-[1px] py-4 cursor cursor-pointer" style={{ whiteSpace: 'pre-line' }} onClick={(e) => handleClicRR(e)}>{i}</p>)}
                </div>}

        </>
    )
}


function BarradeMensaje({ dataclic, dataclicuser, respuestarapida, setRespuestarapida, mensajerrs }) {

    const [message, setMessage] = useState('');
    const [handleMymetype, setHandleMymetype] = useState('');
    const handleMumetypeRef = useRef(handleMymetype);

    const fileInputRef = useRef(null);
    const fileInputRefPDF = useRef(null);

    useEffect(() => {
        handleMumetypeRef.current = handleMymetype;
    }, [handleMymetype]);

    const handleSend = () => {

        const data = { 'message': message, 'cCliente': dataclic, 'cUsuario': dataclicuser, 'tipomensaje': 'texto' }
        socket.emit('send-message-chat', data)
        setMessage('');
        setRespuestarapida('');
    }

    const handleRespuestaRapida = (e) => {
        setRespuestarapida(e);
    }

    useEffect(() => {
        setMessage(mensajerrs)
        //console.log(mensajerrs)
    }, [mensajerrs])

    const handleClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        //console.log(file);
        if (file) {
            if (file.size <= 700000) {
                // convertir imagen a base64 y imprimir valor en consola
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    const base64Data = reader.result.split(',')[1];
                    //console.log(base64Data);
                    const body = { 'message': { mimetype: 'image', data: base64Data, filename: file.name }, 'cCliente': dataclic, 'cUsuario': dataclicuser, tipomensaje: 'imagen' }
                    //console.log(body);
                    socket.emit('send-message-chat', body);
                };
                reader.onerror = error => {
                    console.error(error);
                }
            } else {
                alert('El archivo no puede ser mayor a 700 KB')
            }
        };
    };

    const handleIconClickPDF = () => {
        fileInputRefPDF.current.click();
    };

    const handleFileChangePDF = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size <= 700000) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    const base64Data = reader.result.split(',')[1];
                    const body = { 'message': { mimetype: 'document', data: base64Data, filename: file.name }, 'cCliente': dataclic, 'cUsuario': dataclicuser, tipomensaje: 'pdf' }
                    socket.emit('send-message-chat', body);
                }
            } else {
                alert('El archivo PDF no puede ser mayor a 700 KB')
            }
        }
    };

    // Grabar audio

    const handleGrabarAudio = (valor) => {
    if (valor === '') {
        alert('No se ha grabado ningún audio');
        return;
    }

    //console.log(valor);
    const confirmarEnvio = window.confirm('¿Estás seguro de que quieres enviar este audio?');
    if (!confirmarEnvio) return;

    const body = {
        message: {
            mimetype: 'audio/webm',//'audio/ogg; codecs=opus',
            data: valor,
            filename: 'mensaje.webm'
        },
        cCliente: dataclic,
        cUsuario: dataclicuser,
        tipomensaje: 'audio'
    };

    //console.log(body);

    socket.emit('send-message-chat', body);
    };


    return (
        <div className="bg-[#0F172A] py-4 px-4 flex items-center gap-2 rounded-b-md">
            <div>
                <PhotoIcon className="h-6 w-6 cursor-pointer text-white" onClick={handleClick} />
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>
            <div>
                <DocumentIcon
                    className="h-6 w-6 cursor-pointer text-white"
                    title="Cargar PDF"
                    onClick={handleIconClickPDF}

                />
                <input
                    type="file"
                    accept="application/pdf"
                    ref={fileInputRefPDF}
                    onChange={handleFileChangePDF}
                    style={{ display: "none" }} // Oculta el input
                />
            </div>
            <div>
                <AudioRecorder onBase64 ={handleGrabarAudio} onMymetype={setHandleMymetype}/>
            </div>            
            <textarea className="rounded-md w-full text-xs px-2 py-1 whitespace-pre-wrap"
                type="text"
                placeholder="Escribe un mensaje 💬"
                onChange={(e) => { setMessage(e.target.value); handleRespuestaRapida(e.target.value) }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
                        e.preventDefault(); // Previene el salto de línea
                        handleSend(); // Envía el mensaje
                    }
                }}
                value={message} />
            <PaperAirplaneIcon className="h-5 w-5 cursor-pointer text-white" onClick={handleSend} />
        </div>
    )
}

function MensajeEnviadoCliente({ infodatos }) {

    return (
        <>
            <div className="bg-[#DCF8C6] self-start py-3 px-3 rounded-r-md rounded-bl-md max-w-lg flex flex-col break-words">
                {
                    infodatos.type === 'chat' || infodatos.type === 'list_response'
                        ? <p className="w-auto text-sm whitespace-pre-line">{infodatos.body.filename ? infodatos.body.filename : infodatos.body}</p>
                        : infodatos.type === 'image'
                            ? <p className="font-light text-sm"><img src={`data:image/jpeg;base64,${infodatos.datamedia}`} className="w-48 h-auto pb-3" />{infodatos.body == 'No definido' ? 'Descargar' : infodatos.body}</p>
                            : infodatos.type.includes('ptt') || infodatos.type.includes('audio')
                                ? <p className="font-light text-sm"><audio src={`data:audio/ogg;base64,${infodatos.datamedia}`} className="h-10 pb-3" controls>{infodatos.body}</audio></p>
                                : infodatos.type === 'sticker'
                                    ? <p className="font-light text-sm"><img src={`data:image/webp;base64,${infodatos.datamedia}`} className="w-48 h-auto pb-3" />{infodatos.body}</p>
                                    : infodatos.type === 'list'
                                        ? <p className="font-light text-sm">{infodatos.body}</p>
                                        : infodatos.type === 'document'
                                            ? <p className="font-light text-sm"><a href={`data:application/pdf;base64,${infodatos.datamedia}`} className="text-blue-500" download={infodatos.body}>{infodatos.body}</a></p>
                                            : <p className="font-light text-sm">Tipo Mensaje : {infodatos.body} - {infodatos.type}</p>
                }
                <p className="text-xs px-4 text-gray-400 py-1">{new Date(new Date(infodatos.time).setHours(new Date(infodatos.time).getHours() - 5)).toISOString()}</p>
            </div>
        </>
    )
}

function MensajeEnviadoUsuario({ infodatos }) {


    return (
        <div className="bg-[#FFFFFF] self-end py-3 px-3 rounded-r-md rounded-bl-md max-w-lg flex flex-col break-words">
            {
                infodatos.type === 'chat' || infodatos.type === 'list_response'
                    ? <p className="w-auto text-sm whitespace-pre-line">{infodatos.body.filename ? infodatos.body.filename : infodatos.body}</p>
                    : infodatos.type === 'image'
                        ? <p className="font-light text-sm"><img src={`data:image/jpeg;base64,${infodatos.datamedia}`} className="w-48 h-auto pb-3" />{infodatos.body == 'No definido' ? null : infodatos.body}</p>
                        : infodatos.type.includes('ptt') || infodatos.type.includes('audio')
                            ? <p className="font-light text-sm"><audio src={`data:audio/ogg;base64,${infodatos.datamedia}`} className="h-10 pb-3" controls>{infodatos.body}</audio></p>
                            : infodatos.type === 'sticker'
                                ? <p className="font-light text-sm"><img src={`data:image/webp;base64,${infodatos.datamedia}`} className="w-48 h-auto pb-3" />{infodatos.body}</p>
                                : infodatos.type === 'list'
                                    ? <p className="font-light text-sm">{infodatos.body}</p>
                                    : infodatos.type === 'document'
                                        ? <p className="font-light text-sm"><a href={`data:application/pdf;base64,${infodatos.datamedia}`} className="text-blue-500" download={infodatos.body}>{infodatos.body}</a></p>
                                        : <p className="font-light text-sm">Tipo Mensaje : {infodatos.body} - {infodatos.type}</p>
            }
            <p className="text-xs px-4 text-gray-400 py-1">{new Date(new Date(infodatos.time).setHours(new Date(infodatos.time).getHours() - 5)).toISOString()}</p>
        </div>
    )
}

function DetalleChat({ dataclic, dataclicuser }) {

    const [firstload, setFirstload] = useState(true);
    const [datacontentchat, setDataContentchat] = useState([]);
    const [datachatclienteuni, setDatachatclienteuni] = useState([]);
    const [respuestarapida, setRespuestarapida] = useState("");
    const [mensajerrs, setMensajerrs] = useState("");
    const [loading, setLoading] = useState(false);

    // Referencias para almacenar los valores anteriores

    useEffect(() => {
        socket.emit('list-clients-content-chat', { 'cCliente': dataclic, 'cUsuario': dataclicuser });
    }, [dataclic, dataclicuser])

    useEffect(() => {

        socket.on('list-clients-content-chat', (e) => {
            //setLoading(true);
            //Cargando loading
            //console.log('list-clients-content-chat', e.data);
            // Ordernar e.data por el valor de time
            setDatachatclienteuni([]);
            const ordenado = e.data.sort((a, b) => new Date(a.time) - new Date(b.time));
            setDatachatclienteuni(ordenado);
            //setLoading(false);
        })

        return () => {
            socket.off('list-clients-content-chat');
        };

    }, [datachatclienteuni])

    // Agregar nuevos valores recibidor al servidor en tiempo real

    // Creando referencias para mantener el valor más actualizado de los estados
    const dataclicRef = useRef(dataclic);
    const dataclicuserRef = useRef(dataclicuser);

    // Actualizar las referencias cada vez que los estados cambian
    useEffect(() => {
        dataclicRef.current = dataclic;
        dataclicuserRef.current = dataclicuser;
    }, [dataclic, dataclicuser]);

    useEffect(() => {
        socket.on('list-clients-content-chat-added', (e) => {

            // Usar las referencias para acceder a los valores más actuales
            const filtrado = e.data.filter(item =>
                (item.from === dataclicRef.current && item.to === dataclicuserRef.current) ||
                (item.from === dataclicuserRef.current && item.to === dataclicRef.current)
            );

            //console.log('filtrado', dataclicRef.current, dataclicuserRef.current, filtrado);

            setDatachatclienteuni((prev) => {
                // Filtrar los elementos duplicados basándonos en el ID
                const newData = filtrado.filter(item =>
                    !prev.some(prevItem => prevItem.id === item.id)
                );

                // Retornar los datos previos más los nuevos sin duplicados
                return [...prev, ...newData];
            });
        });

        // Limpiar la suscripción al desmontar el componente
        return () => {
            socket.off('list-clients-content-chat-added');
        };
    }, []); // Solo configuramos el socket una vez, no dependemos de dataclic ni dataclicuser aquí


    const containerRef = useRef(null);

    useEffect(() => {
        // Desplazar hacia abajo cada vez que los mensajes cambien
        if (containerRef.current) {
            //containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [datachatclienteuni]);

    return (
        <div className="flex flex-col h-[90%] relative">
            <div ref={containerRef} className="bg-blue-100 flex flex-col flex-grow overflow-y-auto max-h-full pb-5">
                <div className="pt-4 px-4 flex flex-col gap-3">
                    {
                        loading === true ?
                            <div className="bg-[#0F172A] py-3 px-3 rounded-r-md rounded-bl-md max-w-lg flex flex-col break-words">
                                <p className="text-sm font-light text-white">Cargando...</p>
                            </div>
                            : null
                    }
                    {
                        dataclic != '' ?
                            datachatclienteuni.map(e => {
                                try {
                                    return e.fromMe === false ? <MensajeEnviadoCliente infodatos={e} /> : <MensajeEnviadoUsuario infodatos={e} />
                                } catch (error) {
                                    console.log(error)
                                }

                            })
                            : null
                    }
                </div>
            </div>
            <RespuestasRapidas respuestarapida={respuestarapida} setRespuestarapida={setRespuestarapida} setMensajerrs={setMensajerrs} />
            <BarradeMensaje dataclic={dataclic} dataclicuser={dataclicuser} respuestarapida={respuestarapida} setRespuestarapida={setRespuestarapida} mensajerrs={mensajerrs} />
        </div>
    );
}

function Cabecerachat({ dataclic, dataclicuser }) {

    const [openModal, setOpenModal] = useState(false);
    const [openModalConsulta, setOpenModalConsulta] = useState(false);
    const [copiado, setCopiado] = useState(false);

    const handleOpenModal = () => {
        setOpenModal(true)
    }

    const handleOpenModalConsulta = () => {
        setOpenModalConsulta(true)
    }

    const copiarTexto = () => {
    const texto = '123456';  // Número a copiar
    navigator.clipboard.writeText(texto)
      .then(() => {
        setCopiado(true);  // Cambiar estado para mostrar el mensaje de copiado
        setTimeout(() => setCopiado(false), 2000); // Después de 2 segundos, quitar el mensaje
      })
      .catch(err => console.error('Error al copiar: ', err));
  };

    return (
        <div className="bg-[#0F172A] px-4 py-4 rounded-t-md h-16 flex items-center">
            <div className="bg-black rounded-full w-12 h-12"></div>
            <div className="flex flex-row justify-between items-center ml-5 w-full">
                <div className="flex flex-row gap-3 justify-center items-center">
                <p className="font-bold text-sm text-white">🔴 {dataclic} || 🟢 WSP {dataclicuser} </p>
                <div className="relative w-10 h-10 bg-blue-100/50 rounded-full items-center inline-flex justify-center">
                    <ClipboardDocumentListIcon className="text-white w-6 h-6 cursor-pointer absolute"
                    onClick={copiarTexto}/>
                </div>
                </div>
                <div>
                    <input
                        type="button"
                        className="bg-[#ffd140] px-4 py-2 rounded-md shadow-xl text-black font-bold text-sm m-4 cursor-pointer"
                        onClick={() => handleOpenModal()}
                        value="Generar Link PayPal" />
                    <input type="button"
                        className="bg-red-600 px-4 py-2 rounded-md shadow-xl border-2 border-red-600  text-white font-bold text-sm m-4 cursor-pointer"
                        value="Consultar Link PayPal"
                        onClick={() => handleOpenModalConsulta()} />
                </div>
            </div>
            <ModalEnlacePayPal openModal={openModal} setOpenModal={setOpenModal} />
            <ModalConsultarPayPal openModalConsulta={openModalConsulta} setOpenModalConsulta={setOpenModalConsulta} />
        </div>
    )
}


export default function ContenidoChat({ dataclic, dataclicuser }) {
    return (
        <div className="flex-1 py-4 flex flex-col h-full">
            <Cabecerachat dataclic={dataclic} dataclicuser={dataclicuser} />
            <DetalleChat dataclic={dataclic} dataclicuser={dataclicuser} />
        </div>
    )
}