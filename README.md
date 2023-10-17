# OSCtoBrowserViaWS
A NodeJS OSC Bridge that servers data via We sockets to your browser

# Prerequisites
- Latest NodeJS installed on the pc
- This https://github.com/websockets/ws web socket lib
- You will need to setup a localhost SSL cert and key to host WSS

# Basic operation
Launch the bride via 

````
node oscbridge.js
````

The app will listen on UDP port 5454 or OSC Messages. ATM only FLOAT values are supported. You can send multiple values in the same message. Data will come across to your browser ONLY once it has made a connection to the secure localhost Web Socket.


