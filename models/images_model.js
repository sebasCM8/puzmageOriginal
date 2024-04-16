/*
create table images(
	img_id int auto_increment,
	img_usuario int not null,
	img_content text not null,
    img_estado int not null,
    
    primary key(img_id),
    foreign key(img_usuario) references users(usu_id)
);
*/
const pool = require("../db/db_helper");
const Users = require("./usuarios_model");

class Images{
    constructor(){
        this.img_id = null;
        this.img_usuario = null;
        this.img_content = null;
        this.img_estado = null;
    }
    async registrar_img(data){
        var eContent;
        var eUsuemail;
        var response;
        try{
            eContent = "img_content" in data;
            eUsuemail = "usu_email" in data;
        }catch(err){
            response = {ok: false, msg: String(err)};
            return response;
        }
        this.img_content = data.img_content;
        if(!eContent || this.img_content === "" || this.img_content === null){
            response = {ok: false, msg: "Contenido vacio"};
            return response;
        }
        if(!eUsuemail || data.usu_email === "" || data.usu_email === null){
            response = {ok: false, msg: "Email de usuario vacio"};
            return response;
        }
        var userObj = new Users();
        var dbResponse = await userObj.obtenerUsarioEmail(data.usu_email);
        if(dbResponse.ok === false){
            response = {ok: false, msg:"No se encontro usuario"};
            return response;
        }
        this.img_usuario = dbResponse.result.usu_id;

        var imgnsUsu = await this.listar_img(data.usu_email);
        if(imgnsUsu.ok === false){
            response = {ok:false, msg: imgnsUsu.msg};
            return response;
        }
        if(imgnsUsu.result.length >= 5){
            response = {ok: false, msg: "Usuario tiene muchas imagenes...elimine una para agregar una nueva"};
            return response;
        }

        var imgData = {
            img_usuario: this.img_usuario,
            img_content: this.img_content,
            img_estado: 1
        };
        var sqlString = 'INSERT INTO images SET ?';
        try{
            dbResponse = await pool.query(sqlString, [imgData]);
        }catch(err){
            console.log(err);
            response = {ok: false, msg: String(err)};
            return response;
        }
        response = {ok: true, msg:"Imagen registrada correctamente"};
        return response;
    }
    async listar_img(email){
        var response; 
        var userObj = new Users();
        var dbResponse = await userObj.obtenerUsarioEmail(email);
        if(dbResponse.ok === false){
            response = {ok:false, msg: "No se encontro usuario"};
            return response;
        }
        this.img_usuario = dbResponse.result.usu_id;
        var sqlString = "SELECT * FROM images where img_estado = 1 AND img_usuario = " + this.img_usuario + " ";
        try{
            dbResponse = await pool.query(sqlString);
        }catch(err){
            response = {ok: false, msg: String(err)};
            return response;
        }
        response = {
            ok: true,
            result: dbResponse
        };
        return response;
    }
    async delete_img(data){
        var eImgid;
        var response;
        try{
            eImgid = "img_id" in data;
        }catch(err){
            response = {ok:false, msg: String(err)};
            return response;
        }
        this.img_id = data.img_id;
        if(!eImgid || this.img_id === "" || this.img_id === null){
            response = {ok:false, msg: "Imgagen id no puede ser vacio"};
            return response;
        }
        var sqlString = "UPDATE images SET img_estado = 0 WHERE img_id = " + this.img_id + " ";
        var dbResponse;
        try{
            dbResponse = await pool.query(sqlString);
        }catch(err){
            response = {ok:false, msg:String(err)};
            return response;
        }
        response = {ok:true, msg: "Imagen eliminada..."};
        return response;
    }
    async obtenerImgId(id){
        var response;
        if(id === null){
            response = {ok:false, msg:"Id debe ser nulo y no vacio"};
            return response;
        }
        this.img_id = id;
        var sqlString = "SELECT * FROM images WHERE img_estado = 1 AND img_id = " + this.img_id;
        var dbResponse;
        try{
            dbResponse = await pool.query(sqlString);
        }catch(err){
            response = {ok: false, msg: String(err)};
            return response;
        }
        if(dbResponse.length === 0){
            response = {ok:false, msg:"No se encontro imagen con el id"};
            return response;
        }
        response = {ok:true, result: dbResponse[0], msg:"Imagen seleccionada"};
        return response;
    }
}

module.exports = Images;