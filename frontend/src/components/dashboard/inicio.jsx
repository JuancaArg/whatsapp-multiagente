import { useState, useEffect } from "react";
import ContenidoChat from "./contenidochat";
import ListadoChat from "./listadochat";


export default function Inicio() {

    const [dataclic, setDataclic] = useState("");
    const [dataclicuser, setDataclicuser] = useState("");


    return (
        <>
            <header className="bg-white shadow-md">
                <div className="max-w-full py-4 px-8 sm:px-10">
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">📨 Chats</h1>
                </div>
            </header>
            <main className=" h-[80vh] my-[-2vh]">
                <div className="flex flex-row px-10 my-4 gap-5 h-full">
                    <ListadoChat setDataclic={setDataclic} setDataclicuser={setDataclicuser}/>
                    <ContenidoChat dataclic= {dataclic} dataclicuser={dataclicuser}/>
                </div>
            </main>
        </>
    )
}