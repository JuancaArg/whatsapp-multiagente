// firebase.js

// Importar funciones necesarias desde Firebase SDK
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs, addDoc, updateDoc, query, where, onSnapshot, orderBy } from "firebase/firestore";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAA9kJJEwxS835FmSi19Pmx77jMkoHVbO8",
  authDomain: "multiagente-924cd.firebaseapp.com",
  projectId: "multiagente-924cd",
  storageBucket: "multiagente-924cd.firebasestorage.app",
  messagingSenderId: "31715056154",
  appId: "1:31715056154:web:8fae1307ed4b1d6c9acfa3"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Referencia a la colección 'sesiones'
const sesionesCollection = collection(db, "Sesiones");

// Función para agregar un nuevo documento
export const addUser = async (newUser) => {
  try {
    const docRef = await addDoc(sesionesCollection, newUser);
    //console.log('New user added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding user:', error);
  }
};

export const addReg = async (collec, data) => {
  //console.log(data);
  const docRef = await addDoc(collection(db, collec), data)
  return docRef.id;
}

export const updateUser = async (collection, id) => {
  //console.log(collection, id);
  try {
    const docRef = doc(db, collection, id);
    await updateDoc(docRef, { nIdRef: id, cDataJson: "" });
    //console.log("se actualizo registro");
  } catch (error) {
    console.error(error)
  }
}

export const ListDevices = async (collect) => {
  const querySnapshot = await getDocs(collection(db, collect));
  const devices = [];
  querySnapshot.forEach((doc) => {
    const datos = doc.data();
    devices.push(datos)
  });
  return devices;
}

export const InsertaContacto = async (collec, user, client) => {
  // Valida si el contacto existe
  const search = collection(db, collec);
  const ressearch = query(search, where("cCliente", "==", client), where("cUsuario", "==", user))
  const querySnapshot = await getDocs(ressearch)
  const datasearch = []
  querySnapshot.forEach((doc) => {
    datasearch.push(doc.data());
  })

  // Si el contacto no exite agrega al Firebase

  const data = {
    cUsuario: user,
    cCliente: client
  }

  datasearch.length === 0 ? await addDoc(collection(db, collec), data) : void 0;

}

// Obtiene Lista de clientes en tiempo real 
export const ListContactChats = async (collect) => {
  return Contacts;
}

export const ListContactContentChats = async (collect) => {
  const Contacts = [];
  return Contacts;
}


export const ListContactosTimeReal = async (collec, io) => {
  io.emit('list-clients-chat', { data: { data: [] } })
}

// Busqueda en coleccion de firebase

export const SearchCollecion = async (collec, search) => {
  const searchRef = collection(db, collec);
  const q = query(
    searchRef,
    where("cCliente", ">=", search),
    where("cCliente", "<=", search + '\uf8ff')
  );
  const querySnapshot = await getDocs(q);
  const data = [];
  querySnapshot.forEach((doc) => {
    data.push(doc.data());
    //console.log(doc.id, " => ", doc.data());
  });
  return data;
}

// Busqueda de Conetnido de Chat en firebase

export const SearchContentChat = async (collec, cCliente, cUsuario) => {
  //console.log(cCliente,cUsuario,collec);
  const searchRef = collection(db, collec);
  // Primera consulta: from == cCliente AND to == cUsuario
  const q1 = query(
    searchRef,
    where("from", "==", cCliente),
    where("to", "==", cUsuario)
  );

  // Segunda consulta: from == cUsuario AND to == cCliente
  const q2 = query(
    searchRef,
    where("from", "==", cUsuario),
    where("to", "==", cCliente)
  );

  // Ejecutar ambas consultas
  const [querySnapshot1, querySnapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);

  // Combinar los resultados
  const data = [];
  querySnapshot1.forEach((doc) => {
    data.push(doc.data());
  });
  querySnapshot2.forEach((doc) => {
    // Evitar duplicados si un documento aparece en ambas consultas
    if (!data.some(item => item.id === doc.id)) {
      data.push(doc.data());
    }
  });

  return data;
}


// Obtener los elementos que se cambiaron en la coleccion de firebase "Chats" segun el chat seleccionado

let subscriptions = new Map();

export const SearchContentChatTimeReal = (collec, cCliente, cUsuario, maxTime, io, connectedUsers, socket_id) => {

  // Crear una clave única para cada par cCliente - cUsuario

  const key = `${cCliente}-${cUsuario}`;

  // Si la suscripción ya existe, desuscribirla primero
  if (subscriptions.has(key)) {
    const unsubscribe = subscriptions.get(key);
    unsubscribe();  // Llamar a la función de desuscripción
    subscriptions.delete(key);  // Eliminar la suscripción del mapa
    console.log(`Suscripcion Eliminada para ${key}`);
  }

  try {
    const t = new Date(maxTime).toISOString();
    const searchRef = collection(db, collec);

    // Luego, suscribir de nuevo para este par de usuarios
    const q = query(
      searchRef,
      where("from", "in", [cCliente, cUsuario]),
      where("to", "in", [cCliente, cUsuario]),
      where("time", ">", t)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      //console.log(`Lecturas en tiempo real: ${snapshot.size}`);

      const changes = snapshot.docChanges();
      const datafilter = changes
        .map((change) => {
          if (change.type === "added" || change.type === "modified") {
            const doc = change.doc;
            const data = { id: doc.id, ...doc.data() };
            if ((data.from === cCliente && data.to === cUsuario) || (data.from === cUsuario && data.to === cCliente)) {
              return data;
            }
          }
          return null;
        })
        .filter((item) => item !== null);

      if (datafilter.length > 0) {
        //console.log("Largo del Mensaje :", datafilter.length);
        //console.log('Valores de la funcion: ', collec, cCliente, cUsuario, maxTime);
        io.emit('list-clients-content-chat-added', { data: datafilter });
      }
    });

    // Guardar la nueva suscripción en el mapa con la clave única
    subscriptions.set(key, unsubscribe);
    //console.log(`Nueva suscripción activa para ${key}`);
  } catch (error) {
    //console.error("ocurrio un error en suscrip");
  }
};

// Funcion para obtener los ultimos 5 mensajes de un chat en tiempo real
export const SearchLastChatsBetweenUsers = async (collec, cCliente, cUsuario, limitCount = 10) => {
  const searchRef = collection(db, collec);
  const last72h = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();

  // Mensajes de cCliente a cUsuario
  const qFromTo = query(
    searchRef,
    where("from", "==", cCliente),
    where("to", "==", cUsuario),
    where("time", ">", last72h),
    orderBy("time", "desc") // importante para filtrar por fecha en strings
  );

  // Mensajes de cUsuario a cCliente
  const qToFrom = query(
    searchRef,
    where("from", "==", cUsuario),
    where("to", "==", cCliente),
    where("time", ">", last72h),
    orderBy("time", "desc")
  );

  const [snapFromTo, snapToFrom] = await Promise.all([
    getDocs(qFromTo),
    getDocs(qToFrom)
  ]);

  const results = [];
  snapFromTo.forEach(doc => results.push({ id: doc.id, ...doc.data() }));
  snapToFrom.forEach(doc => results.push({ id: doc.id, ...doc.data() }));

  // Eliminar duplicados por ID (opcional si no hay repeticiones)
  const map = new Map();
  results.forEach(item => map.set(item.id, item));
  const uniqueResults = Array.from(map.values());

  // Ordenar por fecha descendente usando string ISO
  uniqueResults.sort((a, b) => new Date(b.time) - new Date(a.time));

  // Retornar los últimos N mensajes
  return uniqueResults.slice(0, limitCount);
};


// Funcion para obtener los ultimos 5 mensajes de un chat en tiempo real
export const SearchLastChatsBetweenUsersAll = async (collec, cCliente, cUsuario, limitCount = 10) => {
  const searchRef = collection(db, collec);

  // Mensajes de cCliente a cUsuario
  const qFromTo = query(
    searchRef,
    where("from", "==", cCliente),
    where("to", "==", cUsuario),
    orderBy("time", "desc") // importante para filtrar por fecha en strings
  );

  // Mensajes de cUsuario a cCliente
  const qToFrom = query(
    searchRef,
    where("from", "==", cUsuario),
    where("to", "==", cCliente),
    orderBy("time", "desc")
  );

  const [snapFromTo, snapToFrom] = await Promise.all([
    getDocs(qFromTo),
    getDocs(qToFrom)
  ]);

  const results = [];
  snapFromTo.forEach(doc => results.push({ id: doc.id, ...doc.data() }));
  snapToFrom.forEach(doc => results.push({ id: doc.id, ...doc.data() }));

  // Eliminar duplicados por ID (opcional si no hay repeticiones)
  const map = new Map();
  results.forEach(item => map.set(item.id, item));
  const uniqueResults = Array.from(map.values());

  // Ordenar por fecha descendente usando string ISO
  uniqueResults.sort((a, b) => new Date(b.time) - new Date(a.time));

  // Retornar los últimos N mensajes
  return uniqueResults.slice(0, limitCount);
};