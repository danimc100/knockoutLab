$("#lanzaPromesa1").on("click", function() {
    var pedirDatos = new Promesa(function(resolve, reject, heredar) {
        // Hacemos algo y....
        if(confirm("Quiere solicitar datos al servidor?")) {
            //resolve();
            heredar($.ajax({type: "GET", url: "https://restcountries.eu/rest/v2/all"}));
        } else {
            reject();
        }
    });

    pedirDatos
        .then(function(p1, p2, p3){
            console.log("La pedirDatos then.", p1, p2, p3);
        })
        .always(function(p1, p2, p3) {
            console.log("pedirDatos always", p1, p2, p3);
        });
});

$("#lanzaPromesaEncadenada").on("click", function() {

    var p1 = new Promesa(function(resolve, reject, heredar) {
        heredar($.ajax({type: "GET", url: "https://restcountries.eu/rest/v2/all"}));
    });

    var p2 = new Promesa(function(resolve, reject, heredar) {
        heredar($.ajax({type: "GET", url: "https://restcountries.eu/rest/v2/all"}));
    });

    var p3 = new Promesa(function(resolve, reject, heredar) {
        heredar($.ajax({type: "GET", url: "https://restcountries.eu/rest/v2/all"}));
    });

    Promesa.all([p1, p2, p3]).then(function(p1, p2, p3) {
        console.log("Prosas encadenadas then: ", p1, p2, p3);
    })

});


// var pedirDatos = new Promesa(function(resolve, reject, heredar){
//     // Hacemos algo y....
//     if(confirm("Quiere solicitar datos al servidor?")) {
//         //resolve();
//         heredar($.ajax({type: "GET", url: "https://restcountries.eu/rest/v2/all"}));
//     } else {
//         reject();
//     }
// });

// pedirDatos
//     .then(function(datos, masDatos){
//         console.log("La pedirDatos then.", datos, masDatos);
//     })
//     .always(function(p1, p2, p3) {
//         console.log("pedirDatos always", p1, p2, p3);
//     });

// ---------------------------------------------------------------------------------------------------------

// var obtenerPaises = new Promesa(function(resolve, reject, heredar) {
//     heredar($.ajax({type: "GET", url: "https://restcountries.eu/rest/v2/all"}));
// });

// obtenerPaises
//     .then(function(data) {
//         console.log("Datos de países recuperador.", data);
//     })
//     .always(function(data) {
//         console.log("obtenerPaises finalizada", data);
//     });