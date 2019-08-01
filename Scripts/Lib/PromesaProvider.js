var sandBox = {};

var PromesaProvider = (function () {
    function PromesaProvider() {
        this.sandBox = sandBox;
        this._disponible = true;
    }
    PromesaProvider.prototype.informarRetorno = function (valor, posicion, esRejected) {
        var self = this, todasLasPromesasEjecutadas;
        self._contador++;
        if (self._esArray) {
            todasLasPromesasEjecutadas = (self._contador == self._args[0].length);
        }
        else {
            todasLasPromesasEjecutadas = (self._contador == self._args.length);
        }
        self._argsRetorno[posicion] = valor;
        self._argsRetornoEstado[posicion] = !esRejected;
        self._argsRetornoEstado.forEach(function (estado) {
            if (!estado) {
                self._algunaPromesaRechazada = true;
            }
        });
        if (todasLasPromesasEjecutadas) {
            if (!self._algunaPromesaRechazada && !self.algunaPromesaConError) {
                self._promesaAll.resolve.apply(self._promesaAll, self._argsRetorno);
            }
            else {
                if (self.algunaPromesaConError) {
                    self._promesaAll._errores = self.errores;
                    self._promesaAll._motivoRechazo = self.motivoRechazo;
                    self._promesaAll.setError(self._args);
                }
                if (self._algunaPromesaRechazada) {
                    self._promesaAll.execute(function (resolve, reject) {
                        self._argsRetorno.push(self._argsRetornoEstado);
                        reject(self._argsRetorno, self.motivoRechazo);
                    });
                }
            }
        }
    };
    PromesaProvider.prototype.all = function () {
        var proms = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            proms[_i] = arguments[_i];
        }
        /// <summary>paraleliza la ejecución de n promesas (pueden ser educore o deferred)</summary>        
        /// <returns type="promesa">promesa con los retornos en arguments (en el mismo orden de carga)</returns>
        var self = this, Promesa = SM.Edu.Core.Utiles.Promesa;
        self._id = Math.floor((Math.random() * 100) + 1);
        self._args = arguments;
        self._argsRetorno = [];
        self._argsRetornoEstado = [];
        self.errores = [];
        self.motivoRechazo;
        self._contador = 0;
        self._promesaAll = new Promesa();
        self.algunaPromesaConError = false;
        self._algunaPromesaRechazada = false;
        self._esArray = Object.prototype.toString.call(self._args[0]) === '[object Array]';
        if (self._disponible) {
            self._disponible = false;
            if (self._esArray) {
                if (self._args[0].length > 0) {
                    for (var i = 0; i < self._args[0].length; i++) {
                        new CadaPromesa(self, self._args[0][i], i);
                    }
                }
                else {
                    self._promesaAll.resolve();
                }
            }
            else {
                if (self._args.length > 0) {
                    for (var i = 0; i < self._args.length; i++) {
                        new CadaPromesa(self, self._args[i], i);
                    }
                }
                else {
                    self._promesaAll.resolve();
                }
            }
        }
        else {
            throw new Error("PromesaProvider no es reutilizable, es necesario usar una instancia nueva");
        }
        return self._promesaAll;
    };
    return PromesaProvider;
}());
var CadaPromesa = (function () {
    function CadaPromesa(prov, prom, pos) {
        var promesa = prom, posicion = pos;
        if (prom.esPromesa !== true) {
            prom = new SM.Edu.Core.Utiles.Promesa(prom);
        }
        if (prom._hasError) {
            prov.algunaPromesaConError = true;
            if (prom._errores.length > 0) {
                prom._errores.forEach(function (itemError) {
                    prov.errores.push(itemError);
                });
            }
        }
        if (promesa._motivoRechazo) {
            prov.motivoRechazo = promesa._motivoRechazo;
        }
        promesa.then(function (valor) {
            prov.informarRetorno(valor, posicion);
        }, function (valor) {
            if (promesa._motivoRechazo) {
                prov.motivoRechazo = promesa._motivoRechazo;
            }
            prov.informarRetorno(valor, posicion, true);
        });
    }
    return CadaPromesa;
}());