const PaquetDeCarte = require('./PaquetDeCarte.js');
const fs = require('fs');
const Carte = require('./Carte.js');

let joueurs_ = [];
let joueurCourant;
let io_;
let paquet;
let paquetTable;
let dernierJoueurQuiPrend;

var self = module.exports = {

    commencer : function(joueurs, io){
        io_ = io;
        joueurs_ = joueurs;
        self.init();
        paquet = self.initialisationDuPaquetDeCarte();
        paquetTable = new PaquetDeCarte();
        self.evenementJoueur();
        self.proposerCarte();
    },
    
    init : function(){
        let indiceDuJoueurCourant = Math.round((Math.random()));    
        joueurCourant = joueurs_[indiceDuJoueurCourant];
        
    },

    distributionTable : function(prise){
        let cartes;
        console.log("distribueTable");
        if(prise) 
            cartes = paquet.distribue(4);
        else 
            cartes = paquet.distribue(3);
        io_.emit("ajout carte table", cartes);
        paquetTable.ajoutePlusieursCarte(cartes);

    },
    
    distributionMain : function(){
        console.log("distribue main chaque joueur");
        joueurs_.forEach(joueur => {
            let main = paquet.distribue(3);
            joueur.socket.emit('ajout carte main', main);   
            joueur.main = main;
        });
    },
    
    distributionMainPrise : function(carte){
        console.log("distributionmainprise 1 ");
        let cartes = paquet.distribue(2);
        cartes.push(carte);
        joueurCourant.socket.emit("ajout carte main", cartes);
        joueurCourant.main = cartes;
        cartes = paquet.distribue(3);
        this.getJoueurNonCourant().socket.emit("ajout carte main", cartes);
        this.getJoueurNonCourant().main = cartes;
    },

    proposerCarte : function(){
        let carte = paquet.distribue(1)[0];
        joueurCourant.socket.emit("propose carte", carte.chemin);
        joueurCourant.socket.once("reponse carte proposee", function(prise){
            if(prise){
                self.distributionMainPrise(carte);
                self.distributionTable(true);
            }
            else {
                self.distributionMain();
                io_.emit("ajout carte table", [carte]);
                self.distributionTable(false);
            }
            joueurCourant.socket.emit("envoie joueur courant", true);
        });
        self.getJoueurNonCourant().socket.emit("envoie joueur courant", false);

        
    },

    continue : function() {
        //reinitialisation des joueurs
        joueurs_.forEach( j => {
            j.reinitialiserCarte();
        });
        //nouveau paquet de table et nouveau paquet de carte
        paquetTable = new PaquetDeCarte();
        paquet = self.initialisationDuPaquetDeCarte();
        //proposition d'une carte au joueur courant;
        self.proposerCarte();
    },

    evenementJoueur : function(){
        joueurs_.forEach((j) => {
            j.socket.on("interraction", (cartes) => {
                let changeJoueur = true;
                if(cartes.length === 1){
                    joueurCourant.socket.emit("enlever carte", [cartes[0]], "main");
                    let carte = joueurCourant.carteEnMain(cartes[0]);
                    io_.emit("ajout carte table", [carte]);
                    paquetTable.ajoute(carte);
                    joueurCourant.supprimerCarteEnMain([carte]);
                }
                else {
                    changeJoueur = self.prendre(cartes);
                }
                joueurCourant.socket.emit("reponse interraction", changeJoueur);

                if(self.partieFini()){
                    self.calculDesPoints(paquetTable);
                    io_.emit("changement score", joueurs_[0].score, joueurs_[1].score);
                    if(joueurs_[0].peutGagner() || joueurs_[1].peutGagner()) {
                        let iGagnant = 1;
                        let iPerdant = 0;
                        if(joueurs_[0].compareScore(joueurs_[1])) {
                            iGagnant = 0;
                            iPerdant = 1;
                        }
                        io_.emit("joueur gagnant", joueurs_[iGagnant].pseudo, joueurs_[iGagnant].score, joueurs_[iPerdant].score);
                        io_.emit("changement score", 0, 0);
                        joueurs_.forEach( j => j.reinitialiserScore());
                    }

                    setTimeout(function(){
                        self.continue();
                    },3200);
                }
                else if(changeJoueur) {
                    if(joueurCourant.main.taille() == 0 && paquet.taille() != 0){
                        let nouvelleMain = paquet.distribue(3);
                        joueurCourant.socket.emit("ajout carte main", nouvelleMain);
                        joueurCourant.main = nouvelleMain;
                    }
                    io_.emit("dernier pli", cartes, self.quelJoueur(joueurCourant.socket.id));
                    joueurCourant.socket.emit("envoie joueur courant", false);
                    joueurCourant = self.getJoueurNonCourant();
                    joueurCourant.socket.emit("envoie joueur courant",true);
                }
                
            });

            j.socket.on("demande joueur courant", (idsocket)=> {
                if(joueurCourant.socket.id === idsocket)
                    j.socket.emit("envoie joueur courant", true);
                else
                    j.socket.emit("envoie joueur courant", false);
            });
        });
        
    },

    calculDesPoints : function(paquetTable){
        dernierJoueurQuiPrend.cartesPrise.ajoutPaquet(paquetTable);
        let nomcartes = [];
        for(let i = 0; i < paquetTable.taille(); ++i)
            nomcartes.push(paquetTable.recupere(i).nom);

        io_.emit("enlever carte", nomcartes, "table");
        joueurs_.forEach(j => {
            j.calculScoreTour();
        });
    },

    prendre : function(nomcartes){
        let carteAPrendre = [];
        let carteMain = joueurCourant.carteEnMain(nomcartes[0]);
        carteAPrendre.push(carteMain);

        nomcartes.shift();
        
        let valeurTable = 0;
        let memeValeurSurTable = false;
        if(paquetTable.existeMemeValeur(carteMain.valeur)) {
            memeValeurSurTable = true;
        }
    
        for(nom in nomcartes){
            let carte = paquetTable.getCarteParNom(nomcartes[nom]);
            if(nomcartes.length != 1 && memeValeurSurTable) {
                return false;
            }
            carteAPrendre.push(carte);
            valeurTable += parseInt(carte.valeur);
        }

        if(valeurTable == carteMain.valeur) {
            dernierJoueurQuiPrend = joueurCourant;
            joueurCourant.cartePrise = carteAPrendre;
            joueurCourant.supprimerCarteEnMain([carteMain]);
            paquetTable.supprimer(carteAPrendre);
            if(paquetTable.taille() == 0 && paquet.taille() != 0){
                joueurCourant.ajoutPointScopa();
            }
            io_.emit("enlever carte", nomcartes, "table");
            joueurCourant.socket.emit("enlever carte", [carteMain.nom], "main");
            nomcartes.unshift(carteMain.nom);
            return true;
        }
        
        return false;
    },

    partieFini : function(){
        return (paquet.taille() == 0) && (joueurs_[0].main.taille() == 0) && (joueurs_[1].main.taille() == 0);
    },

    initialisationDuPaquetDeCarte : function(){
        const dossierDesCartes = "./ressources/images/cartes/";
        let paquet = new PaquetDeCarte();
        fs.readdirSync(dossierDesCartes).forEach(file => {
            let couleur;
            let valeur;
            file = file.replace(".png","");
            let longueur = file.length;
            switch(file[0]){
                case 'p' :
                    couleur = "pique";
                    break;
                case 't' :
                    couleur = "trefle";
                    break;
                case 'c' :
                    if(file[1] == 'a')
                        couleur = "carreau";
                    else 
                        couleur = "coeur";
                    break;
                default:
                    return;     
            }
            if(longueur == 4) valeur = "10";
            else if(longueur == 2) valeur = file[1];
            else if(couleur == "carreau") valeur = file[2];
            else valeur = "10";
            const carte = new Carte(file, couleur, valeur);
            paquet.ajoute(carte);
        });
        return paquet;
    
    },
    
    quelJoueur : (id) => {
        return (id == joueurs_[0].socket.id) ? 1 : 2;
    },

    getJoueurNonCourant : () => {
        return joueurs_.filter((x) => {return x.socket !== joueurCourant.socket})[0];
    }
};