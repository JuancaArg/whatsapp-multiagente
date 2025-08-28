'use client'

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

/*

Estructura para un modal de dialogo

props:{
    title: "Titulo del modal",
    description: "Descripción del modal",
    components : Componente(s) a renderizar dentro del modal (opcional),
    icon: Componente de icono (opcional),
    colorIcon: "color del icono (opcional, por defecto es rojo)",
    colorFondoIcon: "color de fondo del icono (opcional, por defecto es rojo claro)",
    actionText: "Texto del botón de acción",
    cancelText: "Texto del botón de cancelar",
    onAction: function a ejecutar al hacer click en el botón de acción,
    onCancel: function a ejecutar al hacer click en el botón de cancelar
}

*/

export default function Componente_Modal({ open, setOpen, props }) {

    const componente = props.components || null;

    return (
        <div>
            <Dialog open={open} onClose={() => {}} className="relative z-10">
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
                                    <div className={`mx-auto flex size-12 shrink-0 items-center justify-center rounded-full ${props?.colorFondoIcon || "bg-red-200" } sm:mx-0 sm:size-10`}>
                                        <ExclamationTriangleIcon aria-hidden="true" className={`size-6 ${props?.colorFondoIcon || "bg-red-600" }`} />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                                            { props?.title || "Titulo del modal"}
                                        </DialogTitle>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                { props?.description || "Descripción del modal" }
                                            </p>
                                            <div>
                                                { componente || <div></div> }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button
                                    type="button"
                                    onClick={props?.onAction || (() => setOpen(false))}
                                    className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-xs sm:ml-3 sm:w-auto"
                                >
                                    {   props?.actionText || "Aceptar" }
                                </button>
                                <button
                                    type="button"
                                    data-autofocus
                                    onClick={props?.onCancel || (() => setOpen(false))}
                                    className="mt-3 inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs inset-ring inset-ring-gray-300 sm:mt-0 sm:w-auto"
                                >
                                    { props?.cancelText || "Cancelar" }
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}
