import React, { useState, useRef } from "react";

export default function AudioRecorder({onBase64,onMymetype}) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorderRef.current.mimeType || 'audio/webm',
        });
        onMymetype(audioBlob.type); // <- este es el real
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);

        const reader = new FileReader();

     reader.onloadend = () => {
      let base64Audio = reader.result.split(',')[1];
      onBase64(base64Audio);
    };


        reader.readAsDataURL(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("No se pudo acceder al micrófono. Revisa los permisos.");
      console.error(err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  return (
    <div >
      <div className="relative flex justify-center items-center">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          style={{
            position: "relative",
            width: 20,
            height: 20,
            borderRadius: "50%",
            border: "none",
            backgroundColor: isRecording ? "#D93025" : "#25D366", // rojo o verde
            color: "white",
            fontSize: 28,
            cursor: "pointer",
            outline: "none",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1,
            transition: "background-color 0.3s ease",
          }}
          aria-label={isRecording ? "Detener grabación" : "Grabar audio"}
        >
          🎤
        </button>

        {/* Círculo pulsante alrededor */}
        {isRecording && (<span className="h-8 w-8 bg-red-500 absolute rounded-full animate-ping"/>)}
      </div>
      
    </div>
  );
}
