# Whatsapp Servicies :

## Tabla de tipos de mensaje para Whatsapp Web y Api

| Tipos de Wsp Api | Comentario       |
|------------------|------------------|
| Texto            | Texto Plano      |
| Image            | Imagen y Sticker |
| audio            | Audio            |

## Formato de Funciones de Servicios

### [Services/N8N/SendWebHook](./services/N8N/SendWebHook.js)

``` 
# Ejemplo de Contenido de la variable data
{
    from : "51999999999@c.us",
    to :  "51999999999@c.us",
    body: "Este es el mensaje"
}
```
### [Services/Meta/EnvioMensajes/EnvioMensajes()](./services/Meta/EnvioMensajes.js)

```
 # Ejemplo de Contenido de la variable data
{ 
    'message': message, 
    'cCliente': dataclic, 
    'cUsuario': dataclicuser, 
    'tipomensaje': 'texto',
    'origen': origen -> Si viene de Wsp API = "Whatsapp API", contrario null o no declarar
}
``` 