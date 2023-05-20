import express from "express";
import { nanoid } from "nanoid";

import { readFile, writeFile } from 'node:fs/promises';

import path from 'path';
import { URL } from 'url';

//Creación instancia express
const app = express();

//MIDDLEWARE POST
app.use(express.json());

//PATH PARA PÁGINA
const __dirname = new URL('.', import.meta.url).pathname;
console.log("Ruta concatenando con dirname: " + __dirname + "index.html");
const ruta = path.join(__dirname + "index.html");
console.log("Ruta con path.join: ", ruta);



app.use(express.static('public'));


//GET
app.get("/canciones", async (req, res) => {
    const canciones = JSON.parse(await readFile("repertorio.json"));
    res.send(canciones);
});


//POST
app.post("/canciones", async (req, res) => {
    const { titulo, artista, tono } = req.body;//traigo los 3 elementos que componen la canción

    //Validación POST
    if (!titulo || !artista || !tono) {
        return res.status(400).json({ ok: false, msg: "Titulo, artista y tono son requeridos" });
    }


    const cancion = {
        id: nanoid(),//agrego id para cada canción con nanoid
        titulo,
        artista,
        tono
    }

    const canciones = JSON.parse(await readFile("repertorio.json"));
    canciones.push(cancion);
    await writeFile("repertorio.json", JSON.stringify(canciones));
    res.status(201).json({ ok: true, msg: "Canción agregada" });
});


//DELETE
app.delete("/canciones/:id", async (req, res) => {
    const { id } = req.params;

    const canciones = JSON.parse(await readFile("repertorio.json"));
    console.log(canciones);
    const filtroCanciones = canciones.filter((cancion) => cancion.id !== parseInt(id));

    console.log("caciones filtradas");
    console.log(filtroCanciones);
    await writeFile("repertorio.json", JSON.stringify(filtroCanciones));

    res.status(200).json({ ok: true, msg: "Canción eliminada" });


});


// PUT
app.put("/canciones/:id", async (req, res) => {
    const { id } = req.params;
    const { titulo, artista, tono } = req.body;

    //Validación PUT
    if (!titulo || !artista || !tono) {
        return res.status(400).json({ ok: false, msg: "Titulo, artista y tono son requeridos" });
    }


    const canciones = JSON.parse(await readFile("repertorio.json"));

    const editaCancion = canciones.map((cancion) => {
        if (cancion.id === id) {
            return {
                ...cancion,
                titulo,
                artista,
                tono
            };
        }
        return cancion;
    });

    await writeFile("repertorio.json", JSON.stringify(editaCancion));

    res.status(200).json({ ok: true, msg: "Canción actualizada" });
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "index.html")
    //res.sendFile(ruta);
});


//----------------------------------------------------------

const PORT = 7000;

app.listen(PORT, () => {
    console.log("Comenzamos en puerto: " + PORT);
});
