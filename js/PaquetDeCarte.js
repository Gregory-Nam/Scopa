// Un paquet de carte (peut contenir des doublons)
class PaquetDeCarte {
    constructor(listeDeCarte){
        if(listeDeCarte != undefined)
            this.paquet_ = listeDeCarte;
        else
            this.paquet_ = [];
    }


    ajoute(carte){
        this.paquet_.push(carte);
    }

    ajoutePlusieursCarte(liste){
        this.paquet_ = this.paquet_.concat(liste);
    }

    ajoutPaquet(paquet){
        for(let i = 0; i < paquet.taille(); ++i){
            let carte = paquet.recupere(i);
            this.paquet_.push(carte);
        }
    }

    supprimer(carte){
        for(let i = 0; i < carte.length; ++i){
            
            let index = this.indiceDe(carte[i]);
            if(index == -1) continue;
            this.paquet_.splice(index,1);
        }
    }

    indiceDe(o) {   
        if (o === undefined) return -1;
        for (let i = 0; i < this.paquet_.length; i++) {
            if (this.paquet_[i].nom_ == o.nom_) {
                return i;
            }
        }
        return -1;
    }
    distribue(nbCarte){
        /* nombre aleatoire entre 1 et le nombre de carte du paquet*/
        if(this.paquet_.length < nbCarte) return console.log("on peut pas tout distribuer");
        let cartes = [];
        for(let i = 0; i < nbCarte; ++i){
                let indexAleatoire = Math.round((Math.random() * (this.paquet_.length - 1)));
                let carte = this.recupere(indexAleatoire);
                cartes.push(carte);
                this.supprimer([carte]);
        }
        return cartes;
    }

    estVide(){
        return this.paquet_.length == 0 ? true : false;
    }

    recupere(index){
        return this.paquet_[index];
    }

    getCarteParNom(nomCarte){
        let carte;
        this.paquet_.forEach(element => {
            if(element.nom === nomCarte){
                carte = element;
            } 
        });
        return carte;
    }

    existeMemeValeur(valeur){
        for(let i = 0; i < this.paquet_.length; ++i){
            if(valeur === this.paquet_[i].valeur){
                return true;
            } 
        }
        return false;
    }

    taille(){
        return this.paquet_.length;
    }

    nombreParCouleur(couleur){
        let nombre = 0;
        this.paquet_.forEach(carte => {
            if(carte.couleur == couleur)
                ++nombre;
        });
        return nombre;
    }

    nombreParValeur(valeur){
        let nombre = 0;
        this.paquet_.forEach(carte => {
            if(parseInt(carte.valeur) == valeur)
                ++nombre;
        });
        return nombre;
    }

}


module.exports = PaquetDeCarte;