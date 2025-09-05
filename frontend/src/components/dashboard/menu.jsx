import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Conexiones from './conexiones';
import Inicio from './inicio';
import { useState, useEffect } from 'react';
import pkg from '../../../package.json';
import { io } from "socket.io-client";
import { conexiones } from './variables/env';
import { Link, Outlet } from 'react-router-dom';

/*http://localhost:4000/*/

// si la la url tiene la ip 192.168.1.66 se conecta a la ip local
// si la url tiene la ip http://100.80.67.12:3000 se conecta a la ip publica

if (window.location.href.includes(conexiones.front1)) {
    var socket = io(conexiones.back1, {
        withCredentials: true
    });
} else {
    var socket = io(conexiones.back2, {
        withCredentials: true
    });
}


const navigation = [
    { name: 'Inicio', current: true , path: 'inicio' },
    { name: 'Conexiones', current: false , path: 'conexiones' },
    { name: 'Whatsapp API', current: false  , path: 'wspapi' }
    //,
    //{ name: 'Respuestas Rapidas', current: false },
    //{ name: 'Integraciones', current: false },
]
const userNavigation = [
    { name: 'Mi perfil', href: '#' },
    { name: 'Configuraciones', href: '#' },
    { name: 'Cerrar Sesión', href: '#' },
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function Example({ children }) {

    const [conectados, setConectados] = useState(false);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const urlActual = window.location.href;
        const socketURL = urlActual.includes(conexiones.front1)
            ? conexiones.back1
            : conexiones.back2;

        const newSocket = io(socketURL, {
            withCredentials: true,
        });

        // Eventos
        newSocket.on('connect', () => {
            setConectados(true);
        });

        newSocket.on('connect_error', () => {
            setConectados(false);
        });

        // Guardar socket en el estado si lo necesitas en otras partes
        setSocket(newSocket);

        // Limpieza al desmontar
        return () => {
            newSocket.disconnect();
        };
    }, []);

    const [opcion, setOpcion] = useState('Inicio');
    const [controladormenu, setControladormenu] = useState(<Inicio />)

    const user = {
        name: 'Tom Cook',
        email: 'tom@example.com',
        imageUrl:
            'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png',
    };

    useEffect(() => {
        switch (opcion) {
            case 'Inicio': setControladormenu(<Inicio />); break;
            case 'Conexiones': setControladormenu(<Conexiones />); break;
        }
    }, [opcion])

    return (
        <>
            <div className="min-h-full">
                <Disclosure as="nav" className="bg-[#1E1E2F]">
                    <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center">
                                <div className="shrink-0 flex flex-row items-end space-x-2">
                                    <div className="relative h-10 w-auto">
                                        <img
                                            alt="Your Company"
                                            src="logom.png"
                                            className="h-10 w-auto"
                                        />
                                    </div>
                                    <p className="text-white text-sm self-end">v {pkg.version}</p>
                                </div>
                                <div className="hidden md:block">
                                    <div className="ml-4 flex items-baseline space-x-4">
                                        {navigation.map((item) => (
                                        <Link key={item.name} to={item.path} 
                                                onClick={() => setOpcion(item.name)}
                                                className={classNames(
                                                    item.name == "Whatsapp API"
                                                        ? [
                                                            "relative overflow-hidden rounded-md px-4 py-2 text-sm font-bold tracking-wide",
                                                            "bg-gradient-to-r from-green-500 via-purple-500 to-indigo-500",
                                                            "text-white z-10", // 👈 texto siempre por encima
                                                            "drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]", // 👈 sombra marcada para legibilidad
                                                            "ring-1 ring-white/20 shadow-md transition-all duration-300 ease-out",
                                                            "hover:brightness-105 hover:scale-[1.02] hover:shadow-lg",
                                                            "bg-[length:200%_200%] motion-safe:animate-[gradientShift_6s_ease_infinite]",
                                                            // capa glass separada con menos opacidad y detrás
                                                            "before:absolute before:inset-0 before:rounded-md before:bg-white/10 before:backdrop-blur-sm before:opacity-20 before:-z-10"
                                                        ].join(" ")
                                                        : item.name === opcion
                                                            ? "bg-[#3d3d539c] text-white rounded-md px-3 py-2 text-sm font-medium"
                                                            : "text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium")
                                                }>                                            
                                                {item.name}                                       
                                        </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="hidden md:block">
                                <div className="ml-4 flex items-center md:ml-6">
                                    <button
                                        type="button"
                                        className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                                    >
                                        <span className="absolute -inset-1.5" />
                                        <span className="sr-only">View notifications</span>
                                        <BellIcon aria-hidden="true" className="size-6" />
                                    </button>

                                    {/* Profile dropdown */}
                                    <Menu as="div" className="relative ml-3">
                                        <div>
                                            <MenuButton className="relative flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                                                <span className="absolute -inset-1.5" />
                                                <span className="sr-only">Open user menu</span>
                                                <img alt="" src={user.imageUrl} className="size-8 rounded-full" />
                                            </MenuButton>
                                        </div>
                                        <MenuItems
                                            transition
                                            className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                                        >
                                            {userNavigation.map((item) => (
                                                <MenuItem key={item.name}>
                                                    <a
                                                        href={item.href}
                                                        className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:outline-none"
                                                    >
                                                        {item.name}
                                                    </a>
                                                </MenuItem>
                                            ))}
                                        </MenuItems>
                                    </Menu>
                                </div>
                            </div>
                            <div className="-mr-2 flex md:hidden">
                                {/* Mobile menu button */}
                                <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                                    <span className="absolute -inset-0.5" />
                                    <span className="sr-only">Open main menu</span>
                                    <Bars3Icon aria-hidden="true" className="block size-6 group-data-[open]:hidden" />
                                    <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-[open]:block" />
                                </DisclosureButton>
                            </div>
                        </div>
                    </div>

                    <DisclosurePanel className="md:hidden">
                        <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                            {navigation.map((item) => (
                                <DisclosureButton
                                    key={item.name}
                                    as="a"
                                    href={item.href}
                                    aria-current={item.current ? 'page' : undefined}
                                    className={classNames(
                                        item.current ? 'bg-[#312d4a] text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                        'block rounded-md px-3 py-2 text-base font-medium',
                                    )}
                                >
                                    {item.name}
                                </DisclosureButton>
                            ))}
                        </div>
                        <div className="border-t border-gray-700 pb-3 pt-4">
                            <div className="flex items-center px-5">
                                <div className="shrink-0">
                                    <img alt="" src={user.imageUrl} className="size-10 rounded-full" />
                                </div>
                                <div className="ml-3">
                                    <div className="text-base/5 font-medium text-white">{user.name}</div>
                                    <div className="text-sm font-medium text-gray-400">{user.email}</div>
                                </div>
                                <button
                                    type="button"
                                    className="relative ml-auto shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                                >
                                    <span className="absolute -inset-1.5" />
                                    <span className="sr-only">View notifications</span>
                                    <BellIcon aria-hidden="true" className="size-6" />
                                </button>
                            </div>
                            <div className="mt-3 space-y-1 px-2">
                                {userNavigation.map((item) => (
                                    <DisclosureButton
                                        key={item.name}
                                        as="a"
                                        href={item.href}
                                        className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                                    >
                                        {item.name}
                                    </DisclosureButton>
                                ))}
                            </div>
                        </div>
                    </DisclosurePanel>
                </Disclosure>
                <div className={`${conectados ? 'bg-green-600' : 'bg-red-500'} h-9 flex items-center justify-center px-4`}>
                    <p className="text-white text-xs sm:text-sm font-semibold text-center">
                        {conectados ? (
                            '✅ Estás conectado y tienes los permisos de acceso necesarios'
                        ) : window.location.href.includes(conexiones.front1) ? (
                            <>
                                Estás presencial, pero te faltan los permisos de acceso ➡️{' '}
                                <a
                                    href={conexiones.back1}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline text-blue-100 hover:text-blue-200 transition-colors"
                                >
                                    Dar Permisos
                                </a>
                            </>
                        ) : (
                            <>
                                Estás en remoto, pero te faltan los permisos de acceso ➡️{' '}
                                <a
                                    href={conexiones.back2}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline text-blue-100 hover:text-blue-200 transition-colors"
                                >
                                    Dar Permisos
                                </a>
                            </>
                        )}
                    </p>
                </div>

                { children || <Outlet/> }
            </div>
        </>
    )
}
