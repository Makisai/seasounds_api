# seasounds_api

## Einleitung
Das Backend ist ein Server, das als Schnittstelle zwischen Frontend Webanwendung und dem TouchDesigner dient. Integraler Bestandteil ist hierbei die Warteschlange, die auf dem Server befüllt und abgearbeitet wird. Dabei kann die Warteschlange über beliebig viele Socket-Verbindungen befüllt werden. Über eine einzelnen Socket Verbindung mit dem TouchDesigner wird diesem jeweils ein Objekt aus der Warteschlange zur Verarbeitung zugesandt.

## Allgemein
Kommunikation findet über Websockets statt, da dies zum Einen vom ITS Team als Vorgabe gemacht wurde und zum Anderen ein sofortiges Update der angezeigten Warteschlangenposition möglich macht.

## Bibliotheken
**Express**
Einfaches und flexibles Node.js-Framework, dass zahlreiche leistungsfähige Features und Funktionen für Webanwendungen bereitstellt
ws WebSocket
Einfach zu bedienende WebSocket-Client(TouchDesigner)- und -Server(seasounds-api) -Implementierung
SocketIO
Kommunikation zwischen Client (Webseite) und Server (seasounds-api Backend)
Weniger Overhead als reines WebSocket und dadurch leichter und flexibler nutzbar


## Versionsverwaltung
Auch für die Arbeit am Backend wurde ein Github Repository erstellt: 

https://github.com/Makisai/seasounds_api

Logik & Schnittstellen (verworfen da keine REST Schnittstelle benutzt wurde)
Obwohl die REST Anbindung verworfen wurde, wurde die grundlegende Logik für die WebSockets übernommen.

APP — SERVER
Beschreibung
Type
Route
Parameter
Response
Sende Sound in die Warteschlange
POST
BASE_URL/api/add-to-queue
sound name
ID


Warteschlangenplatz
Abfrage der Warteschlange
GET
BASE_URL/api/queue/check




Warteschlangenplatz
Warteschlange leeren



DELETE
BASE_URL/api/queue/clear


ok
Sende Sound an die erste Stelle der Warteschlangen
POST
BASE_URL/api/queue/add-priority
sound name ID
Warteschlangenplatz


Tabelle 4.2b: App — Server

SERVER — TOUCHDESIGNER
Beschreibung
Type
Route
Parameter
Response
Schicke Sound an Touch Designer zum Abspielen
POST
TOUCH_DESIGNER_URL/api/play
sound name
ok


Tabelle 4.2c: Server — TouchDesigner



Ablauf 
1. 	Besucher:in  betritt die Website

2. 	Es wird über Socket.IO eine Verbindung vom Frontend zum Backend
hergestellt

3. 	Im Backend wird geprüft, ob es vom Benutzer:in bereits eine Verbindung 
 	gibt (Überprüfung im Session Store)

4a. 	Es gibt bereits eine Verbindung: 
	Die entsprechenden Daten werden weiter genutzt
4b.  	Es gibt noch keine Verbindung: 
	Es wird eine UUID im Backend generiert. Diese wird in den Session 
Store geschrieben und auch an den/die Besucher:in übermittelt und 
dort auch im local Storage gespeichert. So wird die Session persistiert 
und gewährleistet, dass das jede:r Besucher:in eindeutig zugeordnet 
werden kann

5. 	Besucher:in möchte einen Sound abspielen und drückt den entsprechenden  
	Button

6. 	Die Anfrage wird über die offene Socket Verbindung direkt an den Backend 
 	Server geschickt und dort vom der Socket.IO Hook “add-to-queue” 
 	entgegengenommen und verarbeitet. 
	Hierbei wird die Nutzer:innen ID und der Name des gewünschten Sounds in  
 	einem Array gespeichert. Außerdem wird dem/der Besucher:in der 
 	jeweilige Warteschlangeplatz mitgeteilt.


  socket.on("add_to_queue", (id, soundName) => {
    position = queue.findIndex((item) => item.id == id);
    if (position < 0){
    queue.push({ id: id, soundName: soundName });
    console.log(id,soundName);
    socket.emit("position", queue.length);
    }
  })


7.  	Sobald sich Elemente im queue Array befinden wird die “digest” Funktion 
 	ausgeführt. Diese Funktion sendet alle 13 Sekunden jeweils den 
 	Soundnamen des ersten Elements (Index 0) aus der Warteschlange an den 
 	TouchDesigner. Dies geschieht über eine einfache WebSocket Verbindung mit 
 	dem TouchDesigner. Damit dieser Prozess funktioniert muss der
TouchDesigner, welcher in diesem Fall den Client darstellt, zunächst eine Verbindung zum seasounds-api Backend hergestellt haben. Jedes mal, wenn ein Element auf diese Art und Weise aus der Warteschlange entfernt wird, wird ein Update an alle bestehen Socket.IO Verbindungen gefeuert.

/*
     DIGEST
*/

let queue = [];

const digest = () => {
  item = queue.shift();
  setTimeout(() => digest(), 13000);
  if (item && socket && frontendIO) {
    console.log(`digest: ${item.soundName} from ${item.id}`);
    socket.send(item.soundName);
    frontendIO.emit("positionUpdate");
  }
};
digest();


8.	Der:Die Benutzer:in erhält ein Positionsupdate durch das im Frontend die initiale 
	Warteschlangeposition um 1 verringert wird.

9. 	Wird so Warteschlangenplatz  “0” erreicht, so wird “ Dein Sound läuft gerade” 
	angezeigt.

Abbildung 4.2: Sound (Wiedergabe)

10.  	Die “Dein Sound läuft gerade” Meldung wird 10 Sekunden lang angezeigt, 
 	bevor der Button zum abspielen eines neuen Sounds wieder freigegeben wird.


Warum ist der TouchDesigner der Client?
Hierbei handelt es sich um eine bewusste Entscheidung, da so keine Konfigurationen zur Portfreigabe am TouchDesigner getroffen werden mussten.
Diese Entscheidung wurde getroffen als noch davon ausgegangen wurde, dass das Backend im Internet gehostet wird. Somit sollten mögliche Komplikationen umgangen werden, die mit einer Kommunikation vom Internet zum Universitätsnetzwerk einhergegangen wären. 

Refactoring
Eines der Probleme während der Programmierung war das mehrfache Refactoring des Codes zur Kommunikation zwischen TouchDesigner-Backend-Frontend. 

Dies entstand daraus, dass ursprünglich eine REST Schnittstelle geplant war, aber REST und Websocket nicht zusammenpassen. Mit REST hätte jedesmal ein Request erstellt werden müssen, um den aktuellen Warteschlangenplatz zu bekommen. Eine solche Änderung teilt Websocket automatisiert mit. 

Daneben gab es einen Refactor von Socket.IO zu ws WebSocket für Kommunikation zwischen Backend und TouchDesigner. Leider ist an dieser Stelle Socket.IO nicht hundertprozentig kompatibel mit dem vom IT Systeme Team verwendeten WebSocket im TouchDesigner. In diesem Fall war die Kommunikation mit dem IT Systeme Team nicht präzise genug und die verwendeten Technologien zum Zeitpunkt der initialen Implementierung noch zu neu für das Team, so dass der technologische Unterschied nicht bekannt war.

Abschließend ist auch der Refactor der Kommunikation zum TouchDesigner auf WebSocket zu erwähnen. In diesem Fall war zunächst der TouchDesigner als Webserver geplant. Ein solches Vorgehen hätte aber im Uni Netzwerk mit tatsächlichem Hosting im Internet zu Problemen geführt. Aus diesem Grund musste ein letzter Refactor zum TouchDesigner als Websocket, welcher sich mit der seasounds-api als Backend Server verbinden muss passieren.
