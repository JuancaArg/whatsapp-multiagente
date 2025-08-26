export const RetornoTipoMensaje = (tipo) => {

    // Mapea los tipos de mensajes de WhatsApp a tipos de mensajes internos
    const tipoMap = {
        text: 'texto',
        image: 'image',
        video: 'Video',
        audio: 'Audio',
        document: 'Documento',
        sticker: 'Sticker',
        location: 'Ubicación',
        contacts: 'Contacto',
        button: 'Botón',
        interactive: 'Interactivo',
        // Agrega más mapeos según sea necesario
    };

    return tipoMap[tipo] || 'No Definido'; // Retorna 'Desconocido' si el tipo no está en el mapa

}