import { MagnifyingGlassCircleIcon } from "@heroicons/react/24/outline";
import { use, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { conexiones, LineasServicio } from './variables/env';

if (window.location.href.includes(conexiones.front1)) {
    var socket = io(conexiones.back1, {
        withCredentials: true
    });
} else {
    var socket = io(conexiones.back2, {
        withCredentials: true
    });
}

function Elementos({ search, setSearch, inputSearch, setDataclic, setDataclicuser }) {

    const [arrayda, setArrayda] = useState([]);
    const [previousValues, setPreviousValues] = useState({ cCliente: null, cUsuario: null }); // Estado para valores anteriores


    // Obtiene datos de la base de datos segun el valor del campo search

    useEffect(() => {
        if (search === true) {
            //console.log(inputSearch)
            socket.emit('message-search-contacto-req', { 'search': inputSearch });
            setSearch(false);
        }
    }, [search]);

    useEffect(() => {
        if(search) return;
        socket.on('message-search-contacto-res', (x) => {
            const uniqueData = Array.from(new Set(x.data.map(item => `${item.cCliente}-${item.cUsuario}`)))
                .map(uniqueKey => {
                    const [cCliente, cUsuario] = uniqueKey.split('-');
                    return x.data.find(item => item.cCliente === cCliente && item.cUsuario === cUsuario);
                });
            const newdata = uniqueData.filter(i => !i.cUsuario.includes(':'));
            setArrayda(newdata);
        });

        return () => {
            socket.off('message-search-contacto-res');
        };

    },[search])

    const handleClicElem = (a, b) => {
        if (previousValues.cCliente && previousValues.cUsuario) {
            //console.log("Saliendo del Chat", previousValues.cCliente, previousValues.cUsuario);

            socket.emit('message-search-contacto-elimina', {
                cCliente: previousValues.cCliente,
                cUsuario: previousValues.cUsuario,
            });
        };
        setPreviousValues({ cCliente: a, cUsuario: b });
        setDataclic("");
        setDataclicuser("");
        setDataclic(a);
        setDataclicuser(b);
    }

    const listelemnt = arrayda.map((e, i) => (
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer" key={i} onClick={() => handleClicElem(e.cCliente, e.cUsuario)} >
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-300 shadow-sm">
                <img src="profilewsp.webp" className="w-full h-full object-cover" alt="Perfil" />
            </div>

            {/* Info + Categoría a la derecha */}
            <div className="flex justify-between items-center w-full">
                <div className="flex flex-col justify-center gap-1">
                    <p className="text-sm font-semibold text-gray-800">➡️ {e.cCliente.replace("@c.us", "")}</p>
                    <p className="text-sm font-medium bg-orange-100 text-orange-800 px-3 py-1 rounded-md border border-orange-300 shadow-sm w-fit">
                        {e.cUsuario.replace("@c.us", "").replace(/\s+/g, "").replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4")}
                    </p>
                </div>
                <div className="relative">
                    <span
                        className={`absolute top-[-14px] right-0 text-xs font-semibold px-3 py-1 rounded-bl-lg shadow 
                            ${ !['Bloqueado',undefined].includes(LineasServicio.find(i => e.cUsuario.includes(i.telefono))?.servicio) ? "bg-green-600" : "bg-red-600"} text-white`}
                    >
                        {
                        LineasServicio.find(i => e.cUsuario.includes(i.telefono))?.servicio || "No definido"  
                        }
                    </span>
                </div>

            </div>
        </div>

    ));


    return (<>{listelemnt}</>)

}

export default function ListadoChat({ setDataclic, setDataclicuser }) {

    const [inputSearch, setInputSearch] = useState("");
    const [search, setSearch] = useState(false)
    const [notificacion, setNotificacion] = useState(false);

    const onHandleEnterSearch = () => {
        if (inputSearch.length >= 7) {
            setSearch(true);
        }
        else {
            setNotificacion(true);
            setTimeout(() => {
                setNotificacion(false);
            }, 3000);
        }
    }

    const onHandleChange = (e) => {
        const sanitizedValue = e.target.value.replace(/[\s+\-()]/g, "");
        setInputSearch(sanitizedValue);
    }



    return (
        <div className="w-[20%] py-4 flex flex-col h-full relative" >
            <div className="bg-[#0F172A] rounded-t-md flex items-center px-4 py-4 h-16">
                <MagnifyingGlassCircleIcon className="text-white w-9 h-9 mr-2" />
                <input type="search" className="py-1 px-2 w-full rounded-sm text-sm" onChange={(e) => onHandleChange(e)}
                    onKeyDown={(x) => {
                        if (x.key === 'Enter') {
                            onHandleEnterSearch();
                        }
                    }}
                    value={inputSearch}
                    placeholder="Buscar un telefono 😄" />
            </div>
            <div className="bg-blue-100 h-full rounded-b-md overflow-y-auto border-[#CED4DA] border">
                <Elementos search={search} setSearch={setSearch} inputSearch={inputSearch} setInputSearch={setInputSearch} setDataclic={setDataclic} setDataclicuser={setDataclicuser} />
            </div>
            {notificacion &&
                <div className="bg-red-600 left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 absolute w-80 h-12 rounded-md opacity-70 shadow-md flex items-center justify-center">
                    <p className="text-white text-lg font-semibold">Ingresa minimo 7 números</p>
                </div>
            }

        </div>
    )
}