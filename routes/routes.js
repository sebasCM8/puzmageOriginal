const express = require("express");
const router = express.Router();

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

const Users = require("../models/usuarios_model");
const Images = require("../models/images_model");
const Salas = require("../models/salas_model");

/* ======================================
================= PAGES =================
====================================== */
//HOME PAGE
router.get("/", (req, res) => {
    return res.render("pages/home");
});

//LOGIN FORM PAGE
router.get("/login", (req, res) => {
    if (req.session.usu_email) {
        //return res.render("pages/profile", { usu_email: req.session.usu_email });
        return res.redirect("/profile");
    }
    return res.render("pages/login");
});

//SIGNUP FORM PAGE
router.get("/signup", (req, res) => {
    if (req.session.usu_email) {
        //return res.render("pages/profile", { usu_email: req.session.usu_email });
        return res.redirect("/profile");
    }
    return res.render("pages/signup");
});

//PROFILE FORM PAGE
router.get("/profile", async (req, res) => {
    var response;
    var imgObj = new Images();
    if (req.session.usu_email) {
        response = await imgObj.listar_img(req.session.usu_email);
        if (response.ok === false) {
            return res.render("pages/profile", { usu_email: req.session.usu_email, msgE: response.msg, ok: false });
        } else {
            return res.render("pages/profile", { usu_email: req.session.usu_email, uImages: response.result, ok: true });
        }
    } else {
        return res.render("pages/login");
    }
});

//UPLOAD IMG PAGE
router.get("/uploadImg", (req, res) => {
    if (req.session.usu_email) {
        return res.render("pages/uploadImg", { usu_email: req.session.usu_email });
    } else {
        return res.render("pages/login");
    }
});

//JOIN MULTIPLAYER MATCH PAGE
router.get("/unirse", (req, res)=>{
    if(req.session.usu_email){
        return res.render("pages/unirse");
    }else{
        return res.redirect("/profile");
    }
});

/* ======================================
================ ACTIONS ================
====================================== */

//SIGNUP ACTION
router.post("/signup", urlencodedParser, async (req, res) => {
    var userObj = new Users();
    var data = {
        usu_email: req.body.usu_email,
        usu_password: req.body.usu_password
    };
    if (data.usu_password !== req.body.usu_password2) {
        return res.render("pages/signup", {
            msg_e: "Las constraseñas no coinciden"
        });
    }
    var response = await userObj.registrar_usu(data);
    if (response.ok === true) {
        return res.render("pages/signup", { msg_s: response.msg });
    } else {
        return res.render("pages/signup", { msg_e: response.msg });
    }
});

//LOGIN ACTION
router.post("/login", urlencodedParser, async (req, res) => {
    var userObj = new Users();
    var data = {
        usu_email: req.body.usu_email,
        usu_password: req.body.usu_password
    };
    var response = await userObj.login_usu(data);
    if (response.ok === true) {
        req.session.usu_email = req.body.usu_email;
        //return res.render("pages/profile", { usu_email: req.body.usu_email });
        return res.redirect("/profile");
    } else {
        return res.render("pages/login", { msg_e: response.msg });
    }
});

//LOGOUT ACTION
router.post("/logout", urlencodedParser, async (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
            return res.redirect('/');
        }
        res.redirect('/login');
    });
});

//UPLOAD IMG ACTION
router.post("/uploadImg", async (req, res) => {
    var imgObj = new Images();
    var data;
    var response;
    try {
        data = {
            img_content: req.body.img_content,
            usu_email: req.body.usu_email
        };
    } catch (err) {
        response = { ok: false, msg: String(err) };
        return res.status(200).send(response);
    }
    response = await imgObj.registrar_img(data);
    return res.status(200).send(response);
});

//DELETE IMAGE ACTION
router.post("/deleteImg", async(req, res)=>{
    var data; 
    var imgObj = new Images();
    try{
        data = { img_id: req.body.img_id };
    }catch(err){
        console.log(err);
    }
    var response = await imgObj.delete_img(data);
    if(response.ok === false){
        console.log(response.msg);
        return res.redirect("/profile");
    }else{
        return res.redirect("/profile");
    }
});

//PLAY IMAGE ACTION
router.post("/playImg", (req, res)=>{
    if(req.body.pimg_id){
        return res.render("pages/playImg", {img_id: req.body.pimg_id});
    }
    return res.redirect("/profile");
});

//PLAY SOLO ACTION
router.post("/playSolo", async(req, res)=>{
    if(req.body.img_id){
        var imgObj = new Images();
        var response = await imgObj.obtenerImgId(req.body.img_id);
        if(response.ok === true){
            return res.render("pages/solo", {imgObj: response.result});
        }else{
            console.log(response.msg);
            return res.redirect("/profile");
        }
    }else{
        return res.redirect("/profile");
    }
});

//PLAY MULTIPLAYER ACTION
router.post("/playMulti", (req, res)=>{
    if(req.body.img_id && req.session.usu_email){
        return res.render("pages/createMatch", {img_id: req.body.img_id, usu_email: req.session.usu_email});
    }else{
        return res.redirect("/profile");
    }
});

//CREATE MATCH ACTION
router.post("/createMatch", async(req, res)=>{
    var response;
    var data;
    try{
        data = {
            usu_email: req.body.usu_email,
            sal_img: req.body.img_id,
            sal_code: req.body.sal_code,
            sal_level: req.body.sal_level
        };
    }catch(err){
        console.log(err);
        return res.redirect("/profile");
    }
    var salaObj = new Salas();
    response = await salaObj.crear_sal(data);
    if(response.ok === false){
        console.log(response.msg);
        return res.render("pages/createMatch", {img_id: req.body.img_id, usu_email: req.session.usu_email, msgE: response.msg});
    }
    return res.redirect(307, "/multiplayerMatch");
});

//PLAY MULTIPLAYER MATCH ACTION
router.post("/multiplayerMatch", async (req, res)=>{
    if(req.body.sal_code && req.session.usu_email){
        var salaObj = new Salas();
        var usuObj = new Users();
        var data = {sal_code: req.body.sal_code};
        var response = await salaObj.unirse_sal(data);
        var userReq = await usuObj.obtenerUsarioEmail(req.session.usu_email);
        if(response.ok === false || userReq.ok === false){
            return res.render("pages/unirse", {msgE: response.msg});
        }
        return res.render("pages/multiplayer", {usu: userReq.result, sal: response.salObj, img: response.imgObj});
    }else{
        return res.redirect("/profile");
    }
});

//CLOSE MULTIPLAYERMATCH
router.post("/matchStarted", async(req, res)=>{
    var response; 
    var salObj = new Salas();
    var data;
    try{
        data = {sal_code: req.body.sal_code};
    }catch(err){
        response = {ok: false, msg: String(err)};
        return res.status(200).send(response);
    }
    response = await salObj.close_sal(data);
    if(response.ok === false){
        console.log(response.msg);
    }
    return res.status(200).send(response);
});

module.exports = router;