# websockets-for-dummies
<img src="https://github.com/WDP3-FH/websockets-for-dummies/blob/main/assets/cover.png" align="right"
     alt="book with 'WebSockets for dummies' as title" width="25%">
**Thema**: WebSockets

**Team**: Elias Rist, Jan Donnerbauer

## Ressources
### I) Documentation
#### General
- [WebSocket vs HTTP](https://www.wallarm.com/what/a-simple-explanation-of-what-a-websocket-is)
- [MDN Web Dock WebSockets API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [MDN WebSocket client applications](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications)
- [MDN WebSocket servers](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers)
- [WebSockets Allgemein](https://www2.htw-dresden.de/~sobe/Internet_2017/Vo/5b_Websockets.pdf)
- [WebSockets Introduction javascript.info](https://javascript.info/websocket)

#### Node.js (for WebSocket Server)
- [Node.js NET documentation](https://nodejs.org/api/net.html)
- [ws: a Node.js WebSocket library](https://www.npmjs.com/package/ws)
  
#### Socket.io 
- [Plain WebSockets vs Socket.io](https://ably.com/topic/socketio-vs-websocket)
- [Socket.io Server API](https://socket.io/docs/v4/server-api/)
- [Socket.io Client API](https://socket.io/docs/v4/client-api/)
- [Working WebSocket Chat Example](https://socket.io/demos/chat/)
- [Working WebSocket Chat Example - Code](https://github.com/socketio/socket.io/tree/master/examples/chat)

### II) Guides & Tutorials
- [WebSocket Game & Chat](https://unsere-schule.org/programmieren/javascript/websocket-chat-und-multiplayer-spiel/)
- [Create Node.js WebSocket Server](https://www.honeybadger.io/blog/websocket-node/)

### III) Videos
- [How to use WebSockets - JavaScript Tutorial For Beginners](https://www.youtube.com/watch?v=FduLSXEHLng&ab_channel=dcode)

### IV) Testing tools
- [Simple WebSocket Client (Chrome Extension)](https://github.com/olshevskiy87/simple-websocket-client)


## OUTLINE / Struktur der Zusammenfassungs-Website / Präsentation
1. **Einleitung zu WebSockets**
     <img src="https://assets-global.website-files.com/5ff66329429d880392f6cba2/63fe48adb8834a29a618ce84_148.3.png" align="right"
     alt="WebSocket Communication Diagram" width="35%">
   - Funktionsweise von WebSockets erklären
        - Kommunikationsaufbau --> Kommunikation --> Kommunikationsabbau
        - Unterschiede zu HTTP
        - Einsatzgebiete
2. **WebSockets in der Praxis**
   - SERVER
        - Aufbau eines einfachen WebSocket-Servers mit Node.js ([Create Node.js WebSocket Server](https://www.honeybadger.io/blog/websocket-node/))
        - Erweiterung des WebSocket-Servers
             - Verwendung von Socket.io ([Plain WebSockets vs Socket.io](https://ably.com/topic/socketio-vs-websocket))
   - CLIENT
        - Erstellung eines einfachen WebSocket-Clients ([MDN WebSocket client applications](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications))
        - Erweiterung des WebSocket-Clients
             - Verwendung von Socket.io ([Socket.io Client API](https://socket.io/docs/v4/client-api/))
4. **Code-Beispiele** *(Demo: [WebSocket Game & Chat](https://unsere-schule.org/programmieren/javascript/websocket-chat-und-multiplayer-spiel/))*
   - WebSocket Chat
   - WebSocket Game
5. **Testwerkzeuge**
   - Simple WebSocketClient
        - Vorstellung und Anleitung zur Verwendung von Tools zur Überprüfung und Testen von WebSocket-Verbindungen
6. **Zusätzliche Ressourcen (zum selber ausprobieren)**
   - Empfehlungen
        - Verwendung von Abstraktionsschichten (beispielsweise: Socket.io)
   - Schritt-für-Schritt-Anleitungen für die Erstellung von WebSocket-basierten Anwendungen
   - Videotutorials zur Veranschaulichung der Verwendung von WebSockets ([How to use WebSockets - JavaScript Tutorial For Beginners](https://www.youtube.com/watch?v=FduLSXEHLng&ab_channel=dcode))
