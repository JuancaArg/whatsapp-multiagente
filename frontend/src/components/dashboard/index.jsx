import Example from "./menu";
import Conexiones from './conexiones';
import Inicio from './inicio';
import { Page_wspapi } from '../../pages/wsp-api'
import { Route, Routes, Navigate, BrowserRouter } from "react-router-dom";

export default function Dashboard() {
    return (
        <BrowserRouter>
                <Example>
                    <Routes>
                        <Route path='/' element={<Navigate to="/inicio" />} />
                        <Route path="/inicio" element={<Inicio />} />
                        <Route path="/conexiones" element={<Conexiones />} />
                        <Route path="/wspapi" element={<Page_wspapi/>}/>
                    </Routes>
                </Example>
        </BrowserRouter>
    )
}

