const express = require('express')
const Jeu = require('./js/Jeu.js');
const app = express();
const path = require('path');

const directory = path.join(__dirname, '.');
const Joueur = require('./js/Joueur.js');


app.use(express.static(directory));
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

function gestionsocket(){
    let joueurs = [];
    let nbConnexion = 0;
    io.on('connection', function(socket){
        ++nbConnexion;
        if(nbConnexion > 2){
            --nbConnexion;
            socket.disconnect();
            console.log("troisieme personne => deconnecte");
        }
        if(joueurs.length == 1) socket.emit("affiche pseudo", joueurs[0].pseudo);


        socket.emit('demande pseudo', joueurs.length + 1);
        
        //reception du pseudo
        socket.on('envoie pseudo', function(pseudo){
            io.emit("affiche pseudo", pseudo);
            joueurs.push(new Joueur(socket, pseudo));

            if(joueurs.length == 2) {
                let lesJoueurs = joueurs;
                Jeu.commencer(lesJoueurs, io);
                joueurs  = [];
            }
        });

        

        socket.on('disconnect', function(){
            nbConnexion--;
            io.emit("deconnexion");
            joueurs = [];
        });
    });
    
    
    
    http.listen(8100, function(){
        console.log('listenin');
    })
}


gestionsocket();
