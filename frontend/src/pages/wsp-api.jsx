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
];


export function Page_wspapi() {
  const [selectedContact, setSelectedContact] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredContacts = contactsMock.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="absolute top-[64px] bottom-0 left-0 right-0 flex font-sans bg-gray-100 dark:bg-[#121212] text-black dark:text-white">
      {/* Sidebar */}
      <div className="w-[25%] border-r border-gray-300 dark:border-gray-800 bg-white dark:bg-[#1e1e1e] flex flex-col">
        <div className="p-4 font-bold text-lg border-b border-gray-300 dark:border-gray-700">Chats</div>
        <div className="p-2 border-b border-gray-300 dark:border-gray-700">
          <div className="flex items-center bg-gray-100 dark:bg-[#2a2a2a] rounded px-2 py-1">
            <FiSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Buscar contacto"
              className="bg-transparent outline-none w-full text-black dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className={`p-4 cursor-pointer border-b border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] ${
                selectedContact?.id === contact.id ? "bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 text-white" : ""
              }`}
              onClick={() => setSelectedContact(contact)}
            >
              <div className="flex justify-between">
                <div className="font-medium">{contact.name}</div>
                <div className="text-xs text-gray-500">{contact.time}</div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {contact.lastMessage}
              </div>
              {contact.unread > 0 && (
                <div className="text-xs mt-1 text-white bg-green-500 w-6 h-6 rounded-full inline-flex items-center justify-center">
                  {contact.unread > 9 ? "9+" : contact.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="w-[75%] flex flex-col">
        {selectedContact ? (
          <>
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-300 dark:border-gray-800 p-4 bg-white dark:bg-[#1e1e1e] relative">
              <div className="font-medium text-lg">{selectedContact.name}</div>
              <div className="relative">
                <FiMoreVertical
                  className="text-gray-600 dark:text-gray-300 cursor-pointer"
                  onClick={() => setMenuOpen(!menuOpen)}
                />
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#2a2a2a] rounded shadow-lg z-10 text-sm">
                    <button
                      className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#3a3a3a] text-left"
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
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-[#181818]">
              {messagesMock.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[60%] px-4 py-2 rounded-lg text-sm shadow ${
                    msg.sender === "me"
                      ? "bg-green-600 text-white self-end ml-auto"
                      : "bg-[#2a2a2a] text-white self-start mr-auto"
                  }`}
                >
                  {msg.text}
                  <div className="text-xs text-gray-300 mt-1 text-right">
                    {msg.time}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1e1e1e] flex items-center gap-2">
              <button className="text-gray-500 dark:text-gray-300">
                <FiMic size={20} />
              </button>
              <button className="text-gray-500 dark:text-gray-300">
                <FiImage size={20} />
              </button>
              <button className="text-gray-500 dark:text-gray-300">
                <FiFileText size={20} />
              </button>
              <input
                type="text"
                placeholder="Escribe un mensaje"
                className="border border-gray-300 dark:border-gray-600 rounded px-4 py-2 w-full bg-white dark:bg-[#2a2a2a] text-black dark:text-white"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button className="bg-green-500 text-white px-4 py-2 rounded">
                Enviar
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
            Selecciona un contacto para iniciar el chat
          </div>
        )}
      </div>
    </div>
  );
}

