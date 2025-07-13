import { useEffect, useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { ExclamationTriangleIcon, EyeIcon, MapIcon, NewspaperIcon } from '@heroicons/react/24/outline'
import { QRCodeSVG } from 'qrcode.react';
import { io } from "socket.io-client";
import { conexiones } from './variables/env';

/*http://localhost:4000/*/

// si la la url tiene la ip 192.168.1.66 se conecta a la ip local
// si la url tiene la ip http://100.80.67.12:3000 se conecta a la ip publica

if (window.location.href.includes('192.168.100.100')) {
    var socket = io(conexiones.back1, { 
        withCredentials: true
    });
} else {
    var socket = io(conexiones.back2, {
        withCredentials: true
    });
}

function Modal({ open, setOpen }) {

    //console.log("renderizado Modal");

    const [qr, setQr] = useState(false);
    const [nombre, setNombre] = useState();
    const [imagenqr, setImagenqr] = useState(false);
    const [qrdata, setQrdata] = useState();
    const [estadocliente, setEstadocliente] = useState(false);

    const generaqr = () => {

        //console.log("generaqr");

        try {
            if (nombre.length > 0) {
                setQr(true);
                setImagenqr(true);
            };
        } catch (error) {
            alert("Se encuentra vacio el campo nombre")
        }
    }
 

    useEffect(() => {

        if (imagenqr) {

            //console.log("creando cliente");

            socket.emit('create-client', nombre);

            const handleQrCode = (data) => {
                setQrdata(data.qrCodeUrl);
            };

            socket.on('qr-code', handleQrCode);

        }

    }, [imagenqr])

    // Escuchado si se conecto correctamnte cliente

    socket.on('authenticated', (e) => {

        setEstadocliente(e.status);
    })


    const obtienenombre = (e) => {
        setNombre(e.target.value);
    }

    const guardar = () => {
        setOpen(false);
    }

    return (
        <Dialog open={open} onClose={() => { }} className="relative z-10">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <DialogPanel
                        transition
                        className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                    >
                        <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:size-10">
                                    <EyeIcon aria-hidden="true" className="size-6 text-green-600" />
                                </div>
                                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                    <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                                        Nueva conexión
                                    </DialogTitle>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Porfavor ingrese el nombre del dispostivo
                                        </p>
                                        <input onChange={(e) => obtienenombre(e)} type='text' className='border rounded-md border-gray-300 my-3 py-1 pl-2' />
                                        <>
                                            {
                                                !estadocliente ?
                                                    (qr ?
                                                        (qrdata ?
                                                            <QRCodeSVG className='my-2' width={200} height={200} value={qrdata} />
                                                            : <p>Cargando QR....</p>)
                                                        : null)
                                                    : <p className='font-light text-sm py-2'>🟢 Se conecto correctamente !!!</p>
                                            }
                                        </>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="pb-5 pt-5 px-4 flex justify-end bg-gray-50">
                            <button
                                type="button"
                                className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto"
                            >
                                Cancelar
                            </button>
                            {qr === false ?
                                <button
                                    type="button"
                                    className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto"
                                    onClick={() => generaqr()}
                                >
                                    Generar QR
                                </button>
                                :
                                <button
                                    type="button"
                                    className={estadocliente ? "inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto" : "inline-flex w-full justify-center rounded-md bg-gray-400 px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto cursor-not-allowed"}
                                    disabled={estadocliente ? false : true}
                                    onClick={() => guardar()}
                                >
                                    Guardar
                                </button>
                            }
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}

function ListadoConexiones() {

    const [dispoitivos, setDispositivos] = useState([])
    const [estadoactualizacion, setEstadoactualizacion] = useState(false)
    const [estado, setEstado] = useState(false)

    useEffect(() => {
        if (estado === false) {
            //console.log("enviando peticion");
            socket.emit('list-devices-req');
            setEstado(true);
        }
    }, [estado])

    socket.on('list-devices-res', (e) => {
        setDispositivos(e.data)
        setEstadoactualizacion(true);
    });    

    useEffect(() => {
        if (estadoactualizacion === true) {
            setEstadoactualizacion(false)
        }
    }, [estadoactualizacion])

    const handleClickEliminar = (e) => {
        socket.on("Elimina-Dispositvo",e)
    }

    // Tabla con estilos para mostrar productos
    return (<>
        <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">
                            Nombre WhatsApp
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Numero WhatsApp
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Estado
                        </th>
                        <th scope="col" className="px-6 py-3 text-center">
                            Opciones
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {
                        dispoitivos.map((e,i) =>
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700" key={i}>
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {e.cNombreDispositivo}
                                </th>
                                <td className="px-6 py-4">
                                    Procesando
                                </td>
                                <td className="px-6 py-4">
                                    🟠 Procesando
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button className='bg-red-400 py-1 px-2 text-white rounded-lg cursor-pointer' onClick={()=>handleClickEliminar(e.cNombreDispositivo)}>Eliminar</button>
                                </td>
                            </tr>
                        )
                    }

                </tbody>
            </table>
        </div>
    </>)
}

export default function Conexiones() {

    const [open, setOpen] = useState(false);

    return (
        <>
            <header className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Lista de Conexiones</h1>
                    <button onClick={() => setOpen(true)} className="bg-blue-400 px-3 py-2 border rounded-lg text-white cursor-pointer text-sm font-bold">Nueva Conexion</button>
                </div>
            </header>
            <main>
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <ListadoConexiones />
                </div>
            </main>

            <Modal open={open} setOpen={setOpen} />
        </>
    )
}