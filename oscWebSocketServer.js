import { createServer } from 'https';
import { readFileSync } from 'fs';
import { WebSocketServer } from 'ws';
import { createSocket } from 'dgram';
import { networkInterfaces } from 'os';

//start with 
//	nodejs oscWebSocketServer.js "Wi-Fi"
//
var PORT = 8000, udpPORT = 5454;
var HOST = '127.0.0.1', udpHOST = '192.168.1.113';	//set this to your PCs local LAN address that you want to TX OSC to
var udpServer = createSocket('udp4');
var globalWS, wsOn=0;
const nets = networkInterfaces();
const results = Object.create(null);

getLocalIP();

function getLocalIP()
{
	for (const name of Object.keys(nets)) 
	{
		for (const net of nets[name]) 
		{
			// Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
			// 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
			const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
			if (net.family === familyV4Value && !net.internal) 
			{
				if (!results[name]) {
					results[name] = [];
				}
				results[name].push(net.address);
			}
		}
	}
	console.log("\r\nLocal IP address of ["+process.argv[2]+"]\t["+results[process.argv[2]][0]+"]");
	udpHOST = results[process.argv[2]][0];
}

const server = createServer({
  cert: readFileSync('./certs/cert.pem'),
  key: readFileSync('./certs/key.pem')
});
const wss = new WebSocketServer({ server });

wss.on('connection', function connection(ws) 
{
  ws.on('error', console.error);

  ws.on('message', function message(data)
  {
    console.log('received: %s', data);
	globalWS = ws;
	wsOn=1;
  });

  
});

udpServer.on('listening', function ()
{
    var address = udpServer.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});
udpServer.on('message', function (message, remote)
{
    var startIndex=0, endIndex=0;
	var data = ""+message;
	var oscValues, numOfValues;
	var buf1 = Buffer.alloc(4);
	var typeIndex=0, bufferIndex=message.length;
	var valCounter=0;
	var valueString="";
		
	//Find end of controll name
	endIndex = findNeedle(0,message,0);
	//find start of value type
	typeIndex = findNeedle(44,message,0);
	numOfValues = countNumberOfValues(102,message,typeIndex+1);
	oscValues = new Array(numOfValues);
	//store values in array
	for(valCounter=0; valCounter<numOfValues; valCounter++)
	{
		buf1.writeUint8(message[bufferIndex-4],0);
		buf1.writeUint8(message[bufferIndex-3],1);
		buf1.writeUint8(message[bufferIndex-2],2);
		buf1.writeUint8(message[bufferIndex-1],3);
		oscValues[valCounter] = buf1.readFloatBE();
		bufferIndex-=4;
	}
	console.log("\tOSC Control["+data.substr(startIndex, endIndex)+"]");
	for(valCounter=0; valCounter<numOfValues; valCounter++)
	{
		console.log("\t\tValue["+valCounter+"]["+oscValues[valCounter]+"]");
		if(valCounter+1<numOfValues)
		{
			valueString+=oscValues[valCounter]+",";
		}
		else
		{
			valueString+=oscValues[valCounter];
		}
	}
	if(wsOn==1)
	{
		globalWS.send(data.substr(startIndex+1,endIndex-1)+","+numOfValues+","+valueString);
	}
});

function findNeedle(needle, haystack, needleCount)
{
	var aIndex=0, nCount=0;
	for(aIndex=0; aIndex<haystack.length; aIndex++)
	{
		if(haystack[aIndex]==needle && nCount==needleCount)
		{
			return aIndex;
		}
		else if(haystack[aIndex]==needle && nCount<needleCount)
		{
			nCount++;
		}
	}
	return -1;
}

function countNumberOfValues(needle, haystack, startPos)
{
	var vCount=0, dataIndex=0;
	for(dataIndex=startPos; dataIndex<haystack.length; dataIndex++)
	{
		if(haystack[dataIndex]==needle)
		{
			vCount++;
		}
		else if(haystack[dataIndex]!=needle)
		{
			break;
		}
	}
	return vCount;
}

udpServer.bind(udpPORT, udpHOST);
server.listen(PORT, HOST);


