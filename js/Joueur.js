const Carte = require('./Carte.js');
const PaquetDeCarte = require('./PaquetDeCarte');
class Joueur {
    constructor(socket, pseudo){
        this.socket_ = socket;
        this.pseudo_ = pseudo;
        this.scoreTotal_ = 0;
        this.main_ = new PaquetDeCarte();
        this.cartesPrises_ = new PaquetDeCarte();
    }

    set main(main){
        this.main_.ajoutePlusieursCarte(main);
    }

    set cartePrise(cartes){
        this.cartesPrises_.ajoutePlusieursCarte(cartes);
    }

    get main(){
        return this.main_;
    }

    get cartesPrise(){
        return this.cartesPrises_;
    }

    get socket(){
        return this.socket_;
    }

    get pseudo(){
        return this.pseudo_;
    }

    get score(){
        return this.scoreTotal_;
    }

    carteEnMain(nomCarte){
        
        return this.main_.getCarteParNom(nomCarte);
    }

    supprimerCarteEnMain(carte){
        this.main_.supprimer(carte);
    }

    ajoutPointScopa(){
        this.scoreTotal_ += 1;
    }

    reinitialiserCarte(){
        this.cartesPrises_ = new PaquetDeCarte();
        this.carteEnMain_ = new PaquetDeCarte();
    }

    reinitialiserScore(){
        this.scoreTotal_ = 0;
    }


    peutGagner() {
        return this.scoreTotal_ >= 21;
    }

    //renvoie vrai si this a un plus grand score que joueur
    compareScore(joueur){
        return this.scoreTotal_ > joueur.score;
    }
    calculScoreTour(){
        let score = 0;
        // 7 de carreau
        if(this.cartesPrises_.getCarteParNom("ca7") != undefined){
            ++score;
        } 

        // nombre de carte
        if(this.cartesPrises_.taille() > 20) {
            ++score;
        } 
        
        // les carreaux
        if(this.cartesPrises_.nombreParCouleur("carreau") > 4){
             ++score;
        }

        // trois 7 et un 6
        // ou quatre 6 et 1 sept
        // ou trois 6 et 2 sept
        if((this.cartesPrises_.nombreParValeur(7) > 2 
            &&
            this.cartesPrises_.nombreParValeur(6) > 0)
            ||
            (this.cartesPrises_.nombreParValeur(6) == 4
            &&
            this.cartesPrises_.nombreParValeur(7) == 1)
            ||
            (this.cartesPrises_.nombreParValeur(6) == 3
            &&
            this.cartesPrises_.nombreParValeur(7) == 2)) {
                ++score;
            }
                
        this.scoreTotal_ += score;
        return score;
    }
}

module.exports = Joueur;