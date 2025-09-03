import { useState } from "react";
import { FiSearch, FiMoreVertical, FiX, FiMic, FiImage, FiFileText } from "react-icons/fi";

const contactsMock = [
    { id: 1, name: "María López", lastMessage: "Nos vemos mañana", time: "12:30", unread: 2 },
    { id: 2, name: "Carlos Ruiz", lastMessage: "Gracias!", time: "11:02", unread: 0 },
    { id: 3, name: "Grupo Proyecto APE", lastMessage: "Actualicé el diseño", time: "10:15", unread: 5 },
];

const messagesMock = [
    { id: 1, sender: "me", text: "Hola, ¿cómo estás?", time: "12:00" },
    { id: 2, sender: "other", text: "Bien, ¿y tú?", time: "12:01" },
    { id: 3, sender: "me", text: "Todo bien también", time: "12:02" },
    { id: 1, sender: "me", text: "Hola, ¿cómo estás?", time: "12:00" },
    { id: 2, sender: "other", text: "Bien, ¿y tú?", time: "12:01" },
    { id: 3, sender: "me", text: "Todo bien también", time: "12:02" },
        { id: 1, sender: "me", text: "Hola, ¿cómo estás?", time: "12:00" },
    { id: 2, sender: "other", text: "Bien, ¿y tú?", time: "12:01" },
    { id: 3, sender: "me", text: "Todo bien también", time: "12:02" },
        { id: 1, sender: "me", text: "Hola, ¿cómo estás?", time: "12:00" },
    { id: 2, sender: "other", text: "Bien, ¿y tú?", time: "12:01" },
    { id: 3, sender: "me", text: "Todo bien también", time: "12:02" },
        { id: 1, sender: "me", text: "Hola, ¿cómo estás?", time: "12:00" },
    { id: 2, sender: "other", text: "Bien, ¿y tú?", time: "12:01" },
    { id: 3, sender: "me", text: "Todo bien también", time: "12:02" },
        { id: 1, sender: "me", text: "Hola, ¿cómo estás?", time: "12:00" },
    { id: 2, sender: "other", text: "Bien, ¿y tú?", time: "12:01" },
    { id: 3, sender: "me", text: "Todo bien también", time: "12:02" },
        { id: 1, sender: "me", text: "Hola, ¿cómo estás?", time: "12:00" },
    { id: 2, sender: "other", text: "Bien, ¿y tú?", time: "12:01" },
    { id: 3, sender: "me", text: "Todo bien también", time: "12:02" },
        { id: 1, sender: "me", text: "Hola, ¿cómo estás?", time: "12:00" },
    { id: 2, sender: "other", text: "Bien, ¿y tú?", time: "12:01" },
    { id: 3, sender: "me", text: "Todo bien también", time: "12:02" },
        { id: 1, sender: "me", text: "Hola, ¿cómo estás?", time: "12:00" },
    { id: 2, sender: "other", text: "Bien, ¿y tú?", time: "12:01" },
    { id: 3, sender: "me", text: "Todo bien también", time: "12:02" },
        { id: 1, sender: "me", text: "Hola, ¿cómo estás?", time: "12:00" },
    { id: 2, sender: "other", text: "Bien, ¿y tú?", time: "12:01" },
    { id: 3, sender: "me", text: "Todo bien también", time: "12:02" },
        { id: 1, sender: "me", text: "Hola, ¿cómo estás?", time: "12:00" },
    { id: 2, sender: "other", text: "Bien, ¿y tú?", time: "12:01" },
    { id: 3, sender: "me", text: "Todo bien también", time: "12:02" },
        { id: 1, sender: "me", text: "Hola, ¿cómo estás?", time: "12:00" },
    { id: 2, sender: "other", text: "Bien, ¿y tú?", time: "12:01" },
    { id: 3, sender: "me", text: "Todo bien también", time: "12:02" },
        { id: 1, sender: "me", text: "Hola, ¿cómo estás?", time: "12:00" },
    { id: 2, sender: "other", text: "Bien, ¿y tú?", time: "12:01" },
    { id: 3, sender: "me", text: "Todo bien también", time: "12:02" },
        { id: 1, sender: "me", text: "Hola, ¿cómo estás?", time: "12:00" },
    { id: 2, sender: "other", text: "Bien, ¿y tú?", time: "12:01" },
    { id: 3, sender: "me", text: "Todo bien también", time: "12:02" },
        { id: 1, sender: "me", text: "Hola, ¿cómo estás?", time: "12:00" },
    { id: 2, sender: "other", text: "Bien, ¿y tú?", time: "12:01" },
    { id: 3, sender: "me", text: "Todo bien también", time: "12:02" },
        { id: 1, sender: "me", text: "Hola, ¿cómo estás?", time: "12:00" },
    { id: 2, sender: "other", text: "Bien, ¿y tú?", time: "12:01" },
    { id: 3, sender: "me", text: "Todo bien también", time: "12:02" },
        { id: 1, sender: "me", text: "Hola, ¿cómo estás?", time: "12:00" },
    { id: 2, sender: "other", text: "Bien, ¿y tú?", time: "12:01" },
    { id: 3, sender: "me", text: "Todo bien también", time: "12:02" },
        { id: 1, sender: "me", text: "Hola, ¿cómo estás?", time: "12:00" },
    { id: 2, sender: "other", text: "Bien, ¿y tú?", time: "12:01" },
    { id: 3, sender: "me", text: "Todo bien también", time: "12:02" },
];


export function Page_wspapi() {
  const [selectedContact, setSelectedContact] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredContacts = contactsMock.filter((c) => {
    const matchName = c.name.toLowerCase().includes(search.toLowerCase());
    const matchUnread = showUnreadOnly ? c.unread > 0 : true;
    return matchName && matchUnread;
  });

  return (
    <div className="absolute top-[64px] bottom-0 left-0 right-0 flex font-sans bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white">
      {/* Sidebar */}
      <div className="w-[25%] border-r border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex flex-col">
        <div className="p-4 font-semibold text-lg border-b border-zinc-300 dark:border-zinc-700">Chats</div>
        <div className="p-2 border-b border-zinc-300 dark:border-zinc-700 flex items-center gap-2">
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-700 rounded-lg px-3 py-2">
            <FiSearch className="text-zinc-500 mr-2" />
            <input
              type="text"
              placeholder="Buscar contacto"
              className="bg-transparent outline-none w-full placeholder-zinc-400 text-black dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        <button
            className={`text-sm px-3 py-1 rounded-full border ${
              showUnreadOnly ? 'bg-green-600 text-white border-green-600' : 'border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300'
            }`}
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          >
            {showUnreadOnly ? 'Ver todos' : 'Solo no leídos'}
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className={`p-4 cursor-pointer border-b border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-none transition ${
                selectedContact?.id === contact.id ? "bg-gradient-to-r from-purple-100 via-fuchsia-200 to-indigo-100 text-black dark:from-[#363660] dark:via-[#4e3c5f] dark:to-[#2d2d48] dark:text-white" : ""
              }`}
              onClick={() => setSelectedContact(contact)}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium truncate w-4/5">{contact.name}</span>
                <span className="text-xs text-zinc-500">{contact.time}</span>
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
                {contact.lastMessage}
              </div>
              {contact.unread > 0 && (
                <div className="text-xs mt-1 text-white bg-green-500 w-5 h-5 rounded-full inline-flex items-center justify-center">
                  {contact.unread > 9 ? "9+" : contact.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="w-[75%] flex flex-col bg-zinc-50 dark:bg-zinc-800">
        {selectedContact ? (
          <>
            {/* Header */}
            <div className="flex justify-between items-center border-b border-zinc-300 dark:border-zinc-700 px-6 py-4 bg-white dark:bg-zinc-900">
              <h2 className="text-lg font-semibold truncate">{selectedContact.name}</h2>
              <div className="relative">
                <FiMoreVertical
                  className="text-zinc-600 dark:text-zinc-300 cursor-pointer"
                  onClick={() => setMenuOpen(!menuOpen)}
                />
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-zinc-800 rounded shadow-md z-10 text-sm">
                    <button
                      className="w-full px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-left"
                      onClick={() => {
                        setSelectedContact(null);
                        setMenuOpen(false);
                      }}
                    >
                      Cerrar chat
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messagesMock.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[70%] px-4 py-2 rounded-xl text-sm shadow-md ${
                    msg.sender === "me"
                      ? "bg-green-600 text-white self-end ml-auto"
                      : "bg-zinc-200 text-black self-start mr-auto dark:bg-zinc-700 dark:text-white"
                  }`}
                >
                  {msg.text}
                  <div className="text-[10px] text-right opacity-70 mt-1">
                    {msg.time}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="px-6 py-3 border-t border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center gap-3">
              <button className="text-zinc-500 dark:text-zinc-300">
                <FiMic size={18} />
              </button>
              <button className="text-zinc-500 dark:text-zinc-300">
                <FiImage size={18} />
              </button>
              <button className="text-zinc-500 dark:text-zinc-300">
                <FiFileText size={18} />
              </button>
              <input
                type="text"
                placeholder="Escribe un mensaje..."
                className="flex-1 border border-zinc-300 dark:border-zinc-600 rounded-lg px-4 py-2 text-sm bg-white dark:bg-zinc-800 text-black dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">
                Enviar
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-400 dark:text-zinc-500">
            Selecciona un contacto para iniciar el chat
          </div>
        )}
      </div>
    </div>
  );
}
