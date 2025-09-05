export const Datos_ObtieneIdentificar = () => {

    /*
    Glosario :
    waba -> Identificador de la cuenta de WhatsApp Business
    phoneId -> Identificador de número de teléfono
    phonenumber -> Numero de Telefono
    */

    const resultado = []

    const datos = [
        { "waba" : "1718311682153712" , "phoneId" : "781873175008207", "phonenumber" : "51992708894" },
        { "waba" : "1581139553249191" , "phoneId" : "717333071471269", "phonenumber" : "51968782524" },
        { "waba" : "555441557594877" ,  "phoneId" : "794952240363908", "phonenumber" : "15551777161" },
    ]

    resultado.push(...datos);

    return resultado;

};