import { CheckIcon, DocumentIcon, EyeIcon, ListBulletIcon, MicrophoneIcon, PaperAirplaneIcon, PhotoIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline"
import { useState, useEffect, use, useRef } from "react";
import { io } from "socket.io-client";
import { varrr } from "./variables/rs";
import { conexiones } from './variables/env';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import AudioRecorder from "./func_audio";
import { ImSpinner3 } from "react-icons/im";


if (window.location.href.includes(conexiones.front1)) {
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
            {(respuestarapida.length === 0 || open === false || rrs.length === 0)
                ? null
                : (
                    <div className="absolute bottom-[6.5vh] left-0 right-0 ml-[6.5rem] w-[84%] max-h-[25rem] overflow-auto bg-white shadow-lg rounded-md border border-gray-200">
                        {rrs.map((i, index) => (
                            <p
                                key={index}
                                className="text-sm text-gray-800 font-normal py-3 px-4 border-b border-gray-100 hover:bg-gray-100 cursor-pointer whitespace-pre-line"
                                onClick={(e) => handleClicRR(e)}
                            >
                                {i}
                            </p>
                        ))}
                    </div>
                )
            }
        </>
    );


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
        <div className="bg-[#0F172A] py-3 px-4 flex items-center gap-3 rounded-b-md shadow-inner">
            {/* Ícono de Foto */}
            <div className="flex items-center justify-center hover:bg-white/10 p-1 rounded transition">
                <PhotoIcon className="h-6 w-6 cursor-pointer text-white" onClick={handleClick} />
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            {/* Ícono de PDF */}
            <div className="flex items-center justify-center hover:bg-white/10 p-1 rounded transition">
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
                    style={{ display: "none" }}
                />
            </div>

            {/* Grabador de audio */}
            <div className="flex items-center justify-center">
                <AudioRecorder onBase64={handleGrabarAudio} onMymetype={setHandleMymetype} />
            </div>

            {/* Campo de texto */}
            <textarea
                className="rounded-md w-full text-xs px-3 py-2 resize-none bg-white/10 text-white placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-white"
                type="text"
                placeholder="Escribe un mensaje 💬"
                onChange={(e) => {
                    setMessage(e.target.value);
                    handleRespuestaRapida(e.target.value);
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
                value={message}
            />

            {/* Botón de enviar */}
            <PaperAirplaneIcon
                className="h-5 w-5 ml-2 cursor-pointer text-white hover:text-green-300 transition"
                onClick={handleSend}
            />
        </div>

    )
}

function MensajeEnviadoCliente({ infodatos }) {
    return (
        <div className="bg-green-100 self-start px-4 py-2 rounded-xl max-w-lg shadow text-sm text-gray-800 mb-1">
            {
                infodatos.type === 'chat' || infodatos.type === 'list_response' ? (
                    <p className="whitespace-pre-line break-words break-all">{infodatos.body.filename || infodatos.body}</p>
                ) : infodatos.type === 'image' ? (
                    <>
                        <img src={`data:image/jpeg;base64,${infodatos.datamedia}`} className="w-48 rounded mb-2" alt="Imagen enviada" />
                        <p>{infodatos.body === 'No definido' ? 'Descargar' : infodatos.body}</p>
                    </>
                ) : infodatos.type.includes('ptt') || infodatos.type.includes('audio') ? (
                    <audio src={`data:audio/ogg;base64,${infodatos.datamedia}`} className="w-full mt-1" controls />
                ) : infodatos.type === 'sticker' ? (
                    <img src={`data:image/webp;base64,${infodatos.datamedia}`} className="w-32 h-auto" alt="Sticker" />
                ) : infodatos.type === 'list' ? (
                    <p>{infodatos.body}</p>
                ) : infodatos.type === 'document' ? (
                    <a href={`data:application/pdf;base64,${infodatos.datamedia}`} className="text-blue-600 underline" download={infodatos.body}>{infodatos.body}</a>
                ) : (
                    <p>Tipo Mensaje: {infodatos.body} - {infodatos.type}</p>
                )
            }
            <p className="text-[10px] text-right text-gray-500 mt-1">
                {new Date(infodatos.time).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
            </p>
        </div>
    );
}

function MensajeEnviadoUsuario({ infodatos }) {
    return (
        <div className="bg-white self-end px-4 py-2 rounded-xl max-w-lg shadow text-sm text-gray-800 border border-gray-200 mb-1">
            {
                infodatos.type === 'chat' || infodatos.type === 'list_response' ? (
                    <p className="whitespace-pre-line break-words break-all">{infodatos.body.filename || infodatos.body}</p>
                ) : infodatos.type === 'image' ? (
                    <>
                        <img src={`data:image/jpeg;base64,${infodatos.datamedia}`} className="w-48 rounded mb-2" alt="Imagen enviada" />
                        {infodatos.body !== 'No definido' && <p>{infodatos.body}</p>}
                    </>
                ) : infodatos.type.includes('ptt') || infodatos.type.includes('audio') ? (
                    <audio src={`data:audio/ogg;base64,${infodatos.datamedia}`} className="w-full mt-1" controls />
                ) : infodatos.type === 'sticker' ? (
                    <img src={`data:image/webp;base64,${infodatos.datamedia}`} className="w-32 h-auto" alt="Sticker" />
                ) : infodatos.type === 'list' ? (
                    <p>{infodatos.body}</p>
                ) : infodatos.type === 'document' ? (
                    <a href={`data:application/pdf;base64,${infodatos.datamedia}`} className="text-blue-600 underline" download={infodatos.body}>{infodatos.body}</a>
                ) : (
                    <p>Tipo Mensaje: {infodatos.body} - {infodatos.type}</p>
                )
            }
            <p className="text-[10px] text-right text-gray-500 mt-1">
                {new Date(infodatos.time).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
            </p>
        </div>
    );
}


function DetalleChat({ dataclic, dataclicuser }) {

    const [firtload, setFirtload] = useState(true);
    const [load, setLoad] = useState(true);
    const [datacontentchat, setDataContentchat] = useState([]);
    const [datachatclienteuni, setDatachatclienteuni] = useState([]);
    const [respuestarapida, setRespuestarapida] = useState("");
    const [mensajerrs, setMensajerrs] = useState("");
    const [loading, setLoading] = useState(false);
    const [scroll, setScroll] = useState(false);

    // Referencia para autoscroll
    const scrollRef = useRef(null);

    // Referencias para almacenar los valores anteriores

    useEffect(() => {
        // Solo se obtienes los valores del chat una vez al cargar el componente
        setDatachatclienteuni([]);
        setFirtload(false);
        setLoad(true);
        socket.emit('list-clients-content-chat', { 'cCliente': dataclic, 'cUsuario': dataclicuser });
    }, [dataclic, dataclicuser])

    // 1️⃣ Escuchar socket y actualizar mensajes
    useEffect(() => {
        socket.on('list-clients-content-chat', (e) => {
            const newfilter = e.data.filter(i => {
                return !(i.to === i.from)
            })
            const ordenado = newfilter.sort((a, b) => new Date(a.time) - new Date(b.time));
            setDatachatclienteuni(ordenado);
            setScroll(false); // Habilitamos el scroll para que se haga una vez
            setLoad(false);
        });

        return () => {
            socket.off('list-clients-content-chat');
        };
    }, []); // Solo se configura una vez el socket

    // 2️⃣ Hacer scroll una vez después de que se rendericen los mensajes
    useEffect(() => {
        if (!scroll && scrollRef.current && datachatclienteuni.length > 0) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            setScroll(true);
        }
    }, [datachatclienteuni, scroll]); // Se activa cuando se actualizan los mensajes

    // Enviara mensaje en tiempo real cada 1 segundo al backend con que cliente esta chateando

    useEffect(() => {
        const interval = setInterval(() => {
            const body = {
                online: true,
                time: Date.now(),
                cCliente: dataclic,
                cUsuario: dataclicuser
            };

            socket.emit('chat-abierto-frontend', body);
            //console.log('Enviando al backend:', body);
        }, 1000); // cada 1 segundo

        return () => clearInterval(interval); // limpiar al desmontar
    }, [dataclic, dataclicuser]);


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

            console.log('Nuevo mensaje recibido:', e.data);

            //console.log(e);
            //console.log(dataclicRef,'|' ,dataclicuserRef);

            // filtra e.data donde dataclicRef y dataclicuserRef coincidan

            const mensaje = e.data;

            const esEntreUsuarios =
                (mensaje.from === dataclicRef.current && mensaje.to === dataclicuserRef.current) ||
                (mensaje.from === dataclicuserRef.current && mensaje.to === dataclicRef.current);

            console.log('Nuevo mensaje filtrado:', esEntreUsuarios);

            // Usar las referencias para acceder a los valores más actuales 

            //const filtrado = e.data.filter(item =>
            //    (item.from === dataclicRef.current && item.to === dataclicuserRef.current) ||
            //    (item.from === dataclicuserRef.current && item.to === dataclicRef.current)
            //);

            //console.log('filtrado', dataclicRef.current, dataclicuserRef.current, filtrado);
            if (esEntreUsuarios) {
                setDatachatclienteuni((prev) => {
                    // Agregar el nuevo mensaje al final, sin eliminar los anteriores
                    return [...prev, mensaje];
                });
            } else {
                console.log('Mensaje ignorado: no es entre los usuarios seleccionados');
            }
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
            {firtload === true ? null :
                load === true && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <ImSpinner3 className="h-10 w-10 animate-spin text-blue-600" />
                    </div>
                )
            }

            <div ref={scrollRef} className="bg-blue-100 flex flex-col flex-grow overflow-y-auto max-h-full pb-5">
                <div className="pt-4 px-4 flex flex-col gap-3">
                    {loading === true && (
                        <div className="bg-[#0F172A] py-3 px-4 rounded-r-md rounded-bl-md max-w-lg self-start shadow-sm">
                            <p className="text-sm font-light text-white">Cargando...</p>
                        </div>
                    )}

                    {dataclic !== '' && datachatclienteuni.map((e, index) => {
                        try {
                            return e.fromMe === false
                                ? <MensajeEnviadoCliente key={index} infodatos={e} />
                                : <MensajeEnviadoUsuario key={index} infodatos={e} />
                        } catch (error) {
                            console.log(error);
                            return null;
                        }
                    })}
                </div>
            </div>

            <RespuestasRapidas
                respuestarapida={respuestarapida}
                setRespuestarapida={setRespuestarapida}
                setMensajerrs={setMensajerrs}
            />

            <BarradeMensaje
                dataclic={dataclic}
                dataclicuser={dataclicuser}
                respuestarapida={respuestarapida}
                setRespuestarapida={setRespuestarapida}
                mensajerrs={mensajerrs}
            />
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

    const handleCrearNuevoChat = async () => {
        const numpromt = prompt('SOLO AGENCIA - Ingrese el número de WhatsApp del nuevo cliente (con código de país):');
        if (numpromt) {
            console.log('Nuevo número ingresado:', numpromt);

            try {

                const back = window.location.href.includes(conexiones.front1) ? conexiones.back1 : conexiones.back2;
                const request = await fetch(`${back}send-message`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(
                        {
                            "mensajes": [
                                {
                                    "mensaje": ".",
                                    "tipomensaje": "texto"
                                }
                            ],
                            "cCliente": numpromt + "@c.us",
                            "cUsuario": "51986230303@c.us"
                        }
                    )
                });

                const response = await request.json();
                console.log('Respuesta del servidor:', response);

            } catch (error) {

                console.error('Error al enviar el mensaje de prueba:', error);
                alert("Error al enviar el mensaje de prueba, revisa la consola para mas detalles.");

            }

        } else {
            console.log('No se ingresó ningún número.');
        }
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
        <div className="bg-[#0F172A] px-4 py-4 rounded-t-md h-16 flex items-center shadow-md">
            {/* Contenido principal */}
            <div className="flex flex-row justify-between items-center ml-5 w-full">

                {/* Texto y botón de copiar */}
                <div className="flex flex-row gap-3 items-center">
                    <div className="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                        🔴 {dataclic.replace("@c.us", "")}
                    </div>
                    <span className="text-white font-bold text-sm">⬅️</span>
                    <div className="bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                        🟢 WSP {dataclicuser.replace("@c.us", "")}
                    </div>
                    <div className="relative w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition">
                        <ClipboardDocumentListIcon
                            className="text-white w-5 h-5 cursor-pointer"
                            onClick={copiarTexto}
                        />
                    </div>
                </div>


                {/* Botones de acciones */}
                <div className="flex items-center gap-2">
                    <input
                        type="button"
                        className="bg-[#ffd140] hover:bg-yellow-400 px-4 py-2 rounded-md shadow font-bold text-xs text-black transition cursor-pointer"
                        value="G. PayPal"
                        onClick={() => handleOpenModal()}
                    />
                    <input
                        type="button"
                        className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-md shadow border-2 border-red-600 text-white font-bold text-xs transition cursor-pointer"
                        value="C. PayPal"
                        onClick={() => handleOpenModalConsulta()}
                    />
                    <input
                        type="button"
                        className="bg-lime-400 hover:bg-lime-300 px-4 py-2 rounded-md shadow border-2 border-lime-600 font-bold text-xs transition cursor-pointer"
                        value="C. Nuevo Chat"
                        onClick={() => handleCrearNuevoChat()}
                    />
                </div>
            </div>

            {/* Modales */}
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