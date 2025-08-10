import logo from './logo.svg';
import './App.css';
import Dashboard from './components/dashboard/index';
import { Toaster, toast } from 'react-hot-toast';
import { io } from "socket.io-client";
import { useState, useEffect } from 'react';
import { conexiones } from './components/dashboard/variables/env';


if (window.location.href.includes(conexiones.front1)) {
    var socket = io(conexiones.back1, {
        withCredentials: true
    });
} else {
    var socket = io(conexiones.back2, {
        withCredentials: true
    });
}

function App() {

  useEffect(() => {
    socket.on("notification", (data) => {
      console.log(data);
      data.status === "success" 
      ? toast(data.message,{icon : data?.icon || "", duration: data?.duration * 1000 || 5000 }) 
      : toast(data.message,{icon : data?.icon || "", duration: data?.duration * 1000 || 5000 });
    });

    // Limpieza al desmontar el componente
    return () => {
      socket.off("notification");
    };
  }, []);

  return (
  <>
    <Toaster />
    <Dashboard />
  </>
  );
}

export default App;
