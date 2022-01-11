$(document).ready(function(){
    var socket = io();
    let estJoueurCourant = false;
    let nomJoueur = "";
    

    socket.on('ajout carte main', function(cartes){
        let main = $(".faux-main");
        cartes.forEach((carte,i) => {
            $(main[i]).attr("src",carte.chemin_)
                      .attr("id", carte.nom_)
                      .addClass("non-selectionne-main")
                      .removeClass("faux-main");
            $(main[i]).off();
            $(main[i]).on('click', () => {                
                if(!estJoueurCourant || $(main[i]).hasClass("faux-main")) return;
                if($(".selectionne-main").eq(0).attr("src") === $(main[i]).attr("src")) {
                    $(main[i]).removeClass("selectionne-main");
                    enleverBouton("bouton-poser-carte");
                    enleverBouton("bouton-prendre-carte");
                    return;
                }

                $(".selectionne-main").eq(0).removeClass("selectionne-main")
                                            .addClass("non-selectionne-main");
                $(main[i]).addClass("selectionne-main").removeClass("non-selectionne-main");
                if($(".selectionne-table").length == 0)
                    ajoutBouton("bouton-poser-carte", "Poser");
                else
                    ajoutBouton("bouton-prendre-carte", "Prendre");

            });
        });
    });
    
    socket.on('un joueur deco', function(){
        for(;compteur <= 3; compteur++){
          $('.main'+compteur).remove($("<img>"));
        }
    });
    
    socket.on('ajout carte table', function(cartes){
        let placesVide = $(".faux-table");
        cartes.forEach((element,i) => {
            $(placesVide[i]).attr("src", element.chemin_).attr("id",element.nom_);
            $(placesVide[i]).removeClass("faux-table").addClass("non-selectionne-table");
            $(placesVide[i]).off();
            $(placesVide[i]).on("click", function(){
                if(!estJoueurCourant || $(this).hasClass("faux-table")) return;
                if($(this).hasClass("selectionne-table")) {
                    $(this).removeClass("selectionne-table").addClass("non-selectionne-table");
                    if($(".selectionne-main").length != 0 && $(".selectionne-table").length == 0){
                        ajoutBouton("bouton-poser-carte", "poser");
                        enleverBouton("bouton-prendre-carte");
                    }
                }
                else
                {
                    $(this).removeClass("non-selectionne-table")
                           .addClass("selectionne-table")
                           .attr("id", element.nom_);
                    if($(".selectionne-main").length != 0){
                        enleverBouton("bouton-poser-carte");
                        ajoutBouton("bouton-prendre-carte", "prendre");
                        
                    }
                    
                }
            });

          });

    });

    socket.on("enlever carte", function(ids, ou){

        ids.forEach((id, i) => {
            $("#" + id).attr("src", "ressources/images/cartes/_fake.png")
            .addClass("faux-" + ou)
            .removeClass("selectionne-" + ou)
            .removeAttr('id');
        });
        
    });

    socket.on('demande pseudo', function(num){
        $("#modal-pseudo").modal('show');
        $('#valide-pseudo').on('click',function(){
            let pseudo = $('#pseudo-input').val();
            $('#pseudo-input').val('');
            nomJoueur = pseudo;
            socket.emit('envoie pseudo', pseudo);
            $("#modal-pseudo").modal('hide');
        });
        $('#pseudo-input').bind("keypress", function(e){
            if(e.which == 13) {
                e.preventDefault();
                $("#valide-pseudo").click();
            }
        })
    });

    socket.on("affiche pseudo", function(pseudo){
        let noms = $('.nomjoueur');
        for(let i = 0; i < noms.length; ++i){
            let id = $(noms[i]).attr("id");
            console.log(id);
            if(id === false || id === undefined) {
                $(noms[i]).text(pseudo);
                $(noms[i]).attr("id", pseudo);
                break;
            }
        }       
    });

    socket.on("propose carte", function(c){
        //clearDernierPli();
        $("#div-carte-proposee").empty().append($("<img>").attr("src",c));
        $("#modal-carte").modal("show");
        estJoueurCourant = true;
    });
    

    function ajoutBouton(classe,texte){
        if($("."+classe).length !== 0) return;
        let bouton = $("<button>").addClass("btn btn-dark " + classe)
                                  .text(texte);

        $("#interaction").append(bouton);

        $(bouton).on("click", () => {
            socket.emit("interraction", getCartesSelectionnes());
           
        });
        
    }

    function enleverBouton(id){
        $("."+id).remove();
    }

    function getCartesSelectionnes(){
        let nomsDesCartes = [];

        let cartestable = $(".selectionne-table");
        let cartemain = $(".selectionne-main")[0];

        nomsDesCartes.push($(cartemain).attr("id"));
        $(cartestable).each(function(){
            nomsDesCartes.push($(this).attr("id"));
        });
        return nomsDesCartes;
    }

    function bindBoutonModal(){
        $("#prend-carte-proposee").on("click", function(){
            socket.emit("reponse carte proposee", true);
            $("#modal-carte").modal("hide");
        });
        
        $("#refuse-carte-proposee").on("click", () => {
            socket.emit("reponse carte proposee", false);
            $("#modal-carte").modal("hide");
        });
    }

    function clearDernierPli(){
        $(".dernier-pli-j1, .dernier-pli-j2").empty();
    }

    function afficheInfo(texte){

        $("body").append($("<p>").addClass("infos").text(texte));
        setTimeout(function(){
            $(".infos").fadeOut("normal", function() {
                $(this).remove();
            })
        }, 1500);
    }
    socket.on("envoie joueur courant", function(bool){
        estJoueurCourant = bool;
        if(estJoueurCourant)
            afficheInfo("C'est à toi de jouer !");
        else
            afficheInfo("C'est à ton adversaire de jouer !")
    });

    socket.on("reponse interraction", function(bool) {
        if(bool)
          $("#interaction").children().remove();
        else
            afficheInfo("Cette interaction n'est pas possible");
    });

    socket.on("dernier pli", function(cartes, num) {
        let divjoueur = $(".dernier-pli-j"+num);
        $(".dernier-pli-j"+num).empty().append($("<p>").html("Carte posee :"));
        $(".dernier-pli-j"+num).append($("<img>").attr("src","ressources/images/cartes/" + cartes[0] + ".png")
                               .addClass("petite-carte"));
        $(".dernier-pli-j"+num).append("<br>").append("<br>");
        
        for(let i = 1; i < cartes.length; ++i){
            if(i == 1)
                $(".dernier-pli-j"+num).append($("<p>").html("Cartes prises :"));
            $(".dernier-pli-j"+num).append($("<img>").attr("src","ressources/images/cartes/" + cartes[i] + ".png")
                                                         .addClass("petite-carte"));
        }
    });

    socket.on("joueur gagnant", function(pseudo, scoreGagnant, scorePerdant) {
        afficheInfo(pseudo + " a gagné la partie " + scoreGagnant + "-" + scorePerdant + " !");
        setTimeout(function(){
            afficheInfo("Une nouvelle partie va commencer")
        }, 1600);
    });
    socket.on("changement score", function(score1, score2) {
        $("#score1").html("Score : " + score1);
        $("#score2").html("Score : " + score2);
        clearDernierPli();
    });

    socket.on("deconnexion", function(){
        afficheInfo("Un joueur s'est deconncté...");
        setTimeout(function(){
            document.location.reload(true);
        }, 2000);
    });
    bindBoutonModal();

});
