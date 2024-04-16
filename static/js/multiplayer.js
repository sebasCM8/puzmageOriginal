var players = [];
var socket = io();
var playerData = {};
var puntos = 0;

//PUZZLE VARIABLES
var H;
var W;
var b64Str;
var MAGNITUD;
var pieces = [];

function pageLoad() {
    MAGNITUD = document.getElementById("sal_level").textContent;
    playerData.listo = false;
    playerData.usu_id = document.getElementById("usu_id").textContent;
    playerData.usu_email = document.getElementById("usu_email").textContent;
    playerData.sal_code = document.getElementById("sal_code").textContent;
    players.push(playerData);
    newTagPlayer(playerData);
    socket.emit("newPlayer", playerData);
}

socket.on("existentPlayer", (data) => {
    var newPlayer = true;
    for (var i = 0; i < players.length; i++) {
        if (players[i].usu_email === data.usu_email) {
            newPlayer = false;
            break;
        }
    }
    if (newPlayer) {
        players.push(data);
        newTagPlayer(data);
    }
});

socket.on("newPlayer", (data) => {
    var newPlayer = true;
    for (var i = 0; i < players.length; i++) {
        if (players[i].usu_email === data.usu_email) {
            newPlayer = false;
            break;
        }
    }
    if (newPlayer) {
        players.push(data);
        newTagPlayer(data);
    }
    socket.emit("existentPlayer", playerData);
});

socket.on("playerLeft", (data) => {
    for (var i = 0; i < players.length; i++) {
        if (data.usu_id === players[i].usu_id) {
            players.splice(i, 1);
            break;
        }
    }
    removeTagPlayer(data);
});

socket.on("listo", (data) => {
    for (var i = 0; i < players.length; i++) {
        if (data.usu_id === players[i].usu_id) {
            players[i].listo = data.listo;
            listoOtro(players[i]);
            break;
        }
    }
});

socket.on("pieza", (data) => {
    piezaFit(data);
});

socket.on("piezaO", (data) => {
    piezaOcupada(data);
});

socket.on("piezaL", (data) => {
    piezaLibre(data);
});

function removeTagPlayer(data) {
    var ele = document.getElementById("p" + String(data.usu_id));
    ele.remove();
}

function newTagPlayer(pData) {
    var mePlayer = document.createElement("div");
    mePlayer.className = "cmPlayerTag";
    mePlayer.style.backgroundColor = (pData.listo) ? "green" : "blue";
    mePlayer.setAttribute("id", "p" + String(pData.usu_id));
    var emailStr = pData.usu_email;
    var playerName = document.createElement("label");
    playerName.textContent = emailStr.substring(0, 4);
    mePlayer.appendChild(playerName);

    document.getElementById("pContainer").appendChild(mePlayer);
}

window.addEventListener("beforeunload", function () {
    socket.emit("playerLeft", playerData);
});

function playerLeaving() {
    socket.emit("playerLeft", playerData);
}

function listo() {
    playerData.listo = !playerData.listo;

    var btnListo = document.getElementById("btnListo");
    btnListo.className = playerData.listo ? "btn btn-danger" : "btn btn-success";
    btnListo.textContent = playerData.listo ? "CANCELAR" : "LISTO";

    document.getElementById("p" + String(playerData.usu_id)).style.backgroundColor = (playerData.listo) ? "green" : "blue";
    checkStartGame();
    socket.emit("listo", playerData);
}

function listoOtro(pData) {
    document.getElementById("p" + String(pData.usu_id)).style.backgroundColor = (pData.listo) ? "green" : "blue";
    checkStartGame();
}

function checkStartGame() {
    for (var i = 0; i < players.length; i++) {
        if (players[i].listo === false) {
            return;
        }
    }
    //alert("Comenzando el juego!");
    document.getElementById("btnListo").style.display = "none";
    start();
    closeMatch();
}

async function closeMatch() {
    const url = "http://127.0.0.1:3004/matchStarted";
    var response;
    var data = { sal_code: playerData.sal_code };
    try {
        response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }).then(response => response.json());
    } catch (err) {
        console.log(err.message);
        return;
    }
    if (response.ok == false) {
        console.log(response.msg);
    }
}

function piezaFit(data) {
    var col = data.pieza.substring(2);
    var row = data.pieza.substring(1, 2);
    var iW = -1 * (W / MAGNITUD) * (parseInt(col));
    var iH = -1 * (H / MAGNITUD) * (parseInt(row));
    var casilla = document.getElementById("c" + data.pieza.substring(1));
    casilla.style.backgroundImage = "url(" + b64Str + ")";
    casilla.style.backgroundPosition = String(iW) + "px " + String(iH) + "px";

    var piezaColocada = document.getElementById(data.pieza);
    piezaColocada.remove();

    for (var i = 0; i < pieces.length; i++) {
        if (pieces[i].id === data.pieza) {
            pieces.splice(i, 1);
        }
    }
    sumarPunto(data);
    checkGameOver();
}

function sumarPunto(data) {
    for (var i = 0; i < players.length; i++) {
        if (parseInt(players[i].usu_id) === parseInt(data.usu_id)) {
            var e = "puntos" in players[i];
            if (e === false) {
                players[i].puntos = 1;
            } else {
                players[i].puntos += 1;
            }
            break;
        }
    }
}

function piezaOcupada(data) {
    document.getElementById(data.pieza).style.display = "none";
}

function piezaLibre(data) {
    var pie = document.getElementById(data.pieza);
    if (pie !== null) {
        pie.style.display = "inline-block";
    }
}

//PUZZLE METHODS
function start() {
    var img = document.getElementById("imgGame");
    H = img.height;
    W = img.width;

    //GETTING RESIZED IMG B64 STRING
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    b64Str = ctx.canvas.toDataURL("image/jpeg");

    //CREATING GRID PUZZLE
    var gridContainer = document.createElement("div");
    gridContainer.style.height = H + "px";
    gridContainer.style.width = W + "px";
    gridContainer.className = "gridContainer";
    document.body.appendChild(gridContainer);
    for (var f = 0; f < MAGNITUD; f++) {
        var fila = document.createElement("div");
        fila.className = "fila";
        fila.style.height = String(((H / MAGNITUD) * 100) / H) + "%";
        gridContainer.appendChild(fila);
        for (var i = 0; i < MAGNITUD; i++) {
            var divC = document.createElement("div");
            divC.setAttribute("id", "c" + String(f) + String(i));
            divC.style.border = "thin solid black";
            divC.setAttribute("ondragover", "allowDrop(event)");
            divC.setAttribute("ondrop", "drop(event)");
            divC.style.flexBasis = String(((W / MAGNITUD) * 100) / W) + "%";
            fila.appendChild(divC);
        }
    }
    createPieces();
    img.style.display = "none";
    document.getElementById("imgContainer").style.display = "none";
}


function createPieces() {
    var h = H / MAGNITUD;
    var w = W / MAGNITUD;
    var iH;
    var iW;
    for (var i = 0; i < MAGNITUD; i++) {
        iH = i * (-h);
        for (var j = 0; j < MAGNITUD; j++) {
            iW = j * (-w);
            var divP = document.createElement("div");
            divP.setAttribute("id", "p" + String(i) + String(j));
            divP.style.display = "inline-block";
            divP.style.height = String(h) + "px";
            divP.style.width = String(w) + "px";
            divP.style.backgroundImage = "url(" + b64Str + ")";
            divP.style.backgroundPosition = String(iW) + "px " + String(iH) + "px";
            divP.style.border = "thin solid black";
            divP.setAttribute("draggable", "true");
            divP.setAttribute("ondragstart", "drag(event)");
            divP.setAttribute("ondragend", "dragend(event)");
            pieces.push(divP);
        }
    }
    pieces.sort(function (a, b) { return 0.5 - Math.random() });
    for (var i2 = 0; i2 < pieces.length; i2++) {
        document.body.appendChild(pieces[i2]);
    }
    var esp1 = document.createElement("br");
    var esp2 = document.createElement("br");
    var esp3 = document.createElement("br");
    document.body.appendChild(esp1);
    document.body.appendChild(esp2);
    document.body.appendChild(esp3);
}


function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);

    var pId = ev.target.id;
    playerData.pieza = pId;
    socket.emit("piezaO", playerData);
}

function dragend(ev) {
    var pId = ev.target.id;
    playerData.pieza = pId;
    socket.emit("piezaL", playerData);
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drop(ev) {
    ev.preventDefault();
    var cId = ev.target.id;
    var pId = ev.dataTransfer.getData("text");
    if (pId.substring(1) === cId.substring(1)) {
        var col = cId.substring(2);
        var row = cId.substring(1, 2);
        var iW = -1 * (W / MAGNITUD) * (parseInt(col));
        var iH = -1 * (H / MAGNITUD) * (parseInt(row));
        ev.target.style.backgroundImage = "url(" + b64Str + ")";
        ev.target.style.backgroundPosition = String(iW) + "px " + String(iH) + "px";

        document.getElementById(pId).style.display = "none";
        for (var i = 0; i < pieces.length; i++) {
            if (pieces[i].id === pId) {
                pieces.splice(i, 1);
            }
        }
        sumarPunto(playerData);
        playerData.pieza = pId;
        checkGameOver();
        socket.emit("pieza", playerData);
    }
}

function checkGameOver() {
    if (pieces.length === 0) {
        var msgContainer = document.createElement("div");
        msgContainer.style.margin = "auto";
        msgContainer.style.textAlign = "center";
        var msg = document.createElement("label");
        msg.textContent = "¡¡ PUZZLE COMPLETADO !!";
        msg.style.color = "green";
        msg.style.fontSize = "2.4rem";
        msg.style.fontWeight = "bold";
        msgContainer.appendChild(msg);
        document.body.appendChild(msgContainer);

        var ganador = players[0];
        var empate = false;
        for (var i = 0; i < players.length; i++) {
            if (players[i].puntos > ganador.puntos) {
                ganador = players[i];
            }
            var puntuacion = document.createElement("label");
            puntuacion.textContent = players[i].usu_email + " - " + String(players[i].puntos);
            var salto = document.createElement("br");

            msgContainer.appendChild(salto);
            msgContainer.appendChild(puntuacion);
        }
        for (var i = 0; i < players.length; i++) {
            if (parseInt(players[i].usu_id) !== parseInt(ganador.usu_id) && players[i].puntos == ganador.puntos) {
                empate = true;
                break;
            }
        }
        var salto = document.createElement("br");
        msgContainer.appendChild(salto);
        if (empate) {
            var msgE = document.createElement("label");
            msgE.textContent = "EMPATE >:(";
            msgE.style.color = "gray";
            msgE.style.fontSize = "2.4rem";
            msgE.style.fontWeight = "bold";
            msgContainer.appendChild(msgE);
        } else {
            var msgG = document.createElement("label");
            msgG.textContent = "¡¡ GANADOR "+ ganador.usu_email +" !!";
            msgG.style.color = "green";
            msgG.style.fontSize = "2.4rem";
            msgG.style.fontWeight = "bold";
            msgContainer.appendChild(msgG);
        }
        var salirBtn = document.createElement("a");
        salirBtn.textContent = "SALIR";
        salirBtn.setAttribute("href", "/profile");
        salirBtn.className = "btn btn-primary";
        salirBtn.style.width = "5rem";
        var salto2 = document.createElement("br");
        msgContainer.appendChild(salto2);
        msgContainer.appendChild(salirBtn);
    }
}