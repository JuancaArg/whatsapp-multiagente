import Example from "./menu";
import Conexiones from './conexiones';
import Inicio from './inicio';
import { Route, Router, Routes, Navigate, BrowserRouter } from "react-router-dom";

export default function Dashboard() {
    return (
        <BrowserRouter>
                <Example>
                    <Routes>
                        <Route path='/' element={<Navigate to="/inicio" />} />
                        <Route path="/inicio" element={<Inicio />} />
                        <Route path="/conexiones" element={<Conexiones />} />
                    </Routes>
                </Example>
        </BrowserRouter>
    )
}

