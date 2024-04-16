var H;
var W;
var b64Str;
var MAGNITUD;
var pieces = [];

function start(){
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
        fila.style.height = String(((H/MAGNITUD)*100)/H) + "%";
        gridContainer.appendChild(fila);
        for (var i = 0; i < MAGNITUD; i++) {
            var divC = document.createElement("div");
            divC.setAttribute("id", "c" + String(f) + String(i));
            divC.style.border = "thin solid black";
            divC.setAttribute("ondragover", "allowDrop(event)");
            divC.setAttribute("ondrop", "drop(event)");
            divC.style.flexBasis = String(((W/MAGNITUD)*100)/W) + "%";
            fila.appendChild(divC);
        }
    }
    createPieces();
    img.style.display = "none";
    document.getElementById("btnEmpezar").style.display = "none";
    document.getElementById("imgContainer").style.display = "none";
}

function createPieces(){
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
            pieces.push(divP);
        }
    }
    pieces.sort(function(a, b){return 0.5 - Math.random()});
    for(var i2 = 0; i2<pieces.length; i2++){
        document.body.appendChild(pieces[i2]);
    }
    var esp1 = document.createElement("br");
    var esp2 = document.createElement("br");
    var esp3 = document.createElement("br");
    document.body.appendChild(esp1);
    document.body.appendChild(esp2);
    document.body.appendChild(esp3);
}

function drag(ev){
    ev.dataTransfer.setData("text", ev.target.id);
}

function allowDrop(ev){
    ev.preventDefault();
}

function drop(ev){
    ev.preventDefault();
    var cId = ev.target.id;
    var pId = ev.dataTransfer.getData("text");
    if(pId.substring(1) === cId.substring(1)){
        var col = cId.substring(2);
        var row = cId.substring(1,2);
        var iW = -1 * (W/MAGNITUD) * (parseInt(col));
        var iH = -1 * (H/MAGNITUD) * (parseInt(row));
        ev.target.style.backgroundImage = "url(" + b64Str + ")";
        ev.target.style.backgroundPosition = String(iW) + "px " + String(iH) + "px";

        document.getElementById(pId).style.display = "none";
        for(var i = 0; i < pieces.length; i++){
            if(pieces[i].id === pId){
                pieces.splice(i, 1);
            }
        }
        if(pieces.length === 0){
            gameOver();
        }
    }
}

function gameOver(){
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
}

function continueGame(){
    var rBtns = document.querySelectorAll("input[name='pLevel']");
    for(var radioBtn of rBtns){
        if(radioBtn.checked){
            MAGNITUD = radioBtn.value;
            break;
        }
    }
    document.getElementById("overlay").style.display = "none";
}

function overlayOff(){
    
}