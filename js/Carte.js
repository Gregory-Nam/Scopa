class Carte {

    constructor(nom, couleur, valeur){
        this.nom_ = nom;
        this.couleur_ = couleur;
        this.valeur_ = valeur;
        this.chemin_ = "ressources/images/cartes/" + this.nom_ + ".png";
    }

    get valeur() {
        return this.valeur_;
    }

    get couleur(){
        return this.couleur_;
    }

    get nom(){
        return this.nom_;
    }

    get chemin(){
        return  this.chemin_;
    }


}

module.exports = Carte