# OSCtoBrowserViaWS
A NodeJS OSC Bridge that servers data via We sockets to your browser

# Prerequisites
- Latest NodeJS installed on the pc
- This https://github.com/websockets/ws web socket lib
- LOCALHOST SSL certs provided

# Basic operation
Launch the bridje via 

````
Launch FROM te directory so it picks up the certificates dircetory
node oscWebSocketServer.js "Wi-Fi"
````
Your interface name may not be called "Wi-Fi" look it up in control panel :)

The app will listen on UDP port 5454  at IP address set in "udpHOST" by your interface name for OSC Messages. 
ATM only FLOAT values are supported. 
You can send multiple values in the same message. 
Data will come across to your browser ONLY once it has made a connection to the secure localhost Web Socket.
Browser code is in "BrowserDemo" folder


