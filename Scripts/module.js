(function(){

    var Registro = function(nombre, dir, telf) {
        this.nombre = nombre;
        this.dir = dir;
        this.telf = telf;
    }

    var ModelView = function () {
        var self = this;

        this.nombre = ko.observable("Daniel");
        this.telefono = ko.observable("676470386");
        this.combinado = ko.computed(function() {
            return self.nombre() + ":" + self.telefono();
        });

        this.listaSencilla = ko.observable(["Canyon", "Trek", "Giant", "Pinarello"]);

        var datos = [
            new Registro("Cris", "M40", "5555"),
            new Registro("Mila", "Ventas", "4444"),
            new Registro("Angelica", "M40", "3333")
        ];

        this.lista = ko.observableArray(datos);
        //this.lista = ko.observable(datos);

        this.addALista = function() {
            self.lista.push(new Registro("Corina", "Toledo", "1234"));
        }

        this.eliminar = function(item, aux) {
            console.log(item, aux);
            self.lista.remove(item);
        }

        this.contar = ko.computed(function() {
            return self.lista().length;
        });

        // ---------------------------------------------------------------

        this.hayDatos = ko.observableArray([]);

        this.generaDatos = function() {
            self.hayDatos(["Portátil", "Consola", "PC sobremesa"]);
        }

        this.eliminaDatos= function() {
            self.hayDatos(undefined);
        }

        // ----------------------------------------------------------------
        this.comboValue = ko.observable(1);

    }

    var miModelView = new ModelView();

    $("#cambiaNombreBtn").on("click", function() {
        var nombre = miModelView.nombre();
        miModelView.nombre(nombre.toUpperCase());        
    });

    ko.applyBindings(miModelView);

})();