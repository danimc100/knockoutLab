;
(function () {
    "use strict";
    EduCore.register({
        module: "SM.Edu.Core.Modules.Promesas.Promesa",
        collaborators: {
            PromesaProvider: "SM.Edu.Core.Modules.Promesas.PromesaProvider"
        },
        definition: obtenerPromesa
    });
    function obtenerPromesa(sandBox) {
        var Promesa = (function () {
            function Promesa(promesaPadre, promesaPadreArgs) {
                this.MOTIVO_RECHAZO_MANUAL = 0;
                this.MOTIVO_RECHAZO_ERROR_SERVIDOR = 1;
                this.MOTIVO_RECHAZO_ERROR_JS = 2;
                this.MOTIVO_RECHAZO_ERROR_VALIDACIONES = 3;
                var self = this;
                self._sandBox = sandBox;
                self._resolved = false;
                self._rejected = false;
                self._hasError = false;
                self._tieneHerencia = false;
                self._inprocess = false;
                self._argumentos = undefined;
                self._callbacks = [];
                self._motivoRechazo;
                self._errores = [];
                self.esPromesa = true;
                var esPromesaHeredable = promesaPadre !== undefined && typeof promesaPadre !== 'function';
                var esExecute = promesaPadre !== undefined && typeof promesaPadre === 'function';
                if (esPromesaHeredable) {
                    self.heredar(promesaPadre, promesaPadreArgs);
                }
                if (esExecute) {
                    self.execute(promesaPadre);
                }
            }
            Promesa.prototype.obtenerMotivosRechazo = function () {
                return {
                    Manual: this.MOTIVO_RECHAZO_MANUAL,
                    ErrorServidor: this.MOTIVO_RECHAZO_ERROR_SERVIDOR,
                    ErrorJs: this.MOTIVO_RECHAZO_ERROR_JS,
                    ErrorValidaciones: this.MOTIVO_RECHAZO_ERROR_VALIDACIONES
                };
            };
            ;
            Promesa.prototype.resolve = function (args) {
                /// <summary>da por resuelta la promesa, params: arguments (opcional)</summary>
                /// <returns type="promesa (then / always / catch)"></returns>
                var self = this;
                self._inprocess = true;
                self._argumentos = arguments;
                self._resolved = true;
                self._rejected = false;
                self._hasError = false;
                self._executeCallbacks();
                return self;
            };
            ;
            Promesa.prototype.reject = function (args, motivoRechazo, error) {
                /// <summary>rechaza la promesa, params: arguments (opcional)</summary>        
                /// <returns type="promesa (then / always / catch)"></returns>
                var self = this;
                self._inprocess = true;
                self._argumentos = args || [];
                self._rejected = true;
                self._resolved = false;
                self._hasError = false;
                self._motivoRechazo = self.MOTIVO_RECHAZO_MANUAL;
                if (motivoRechazo) {
                    self._motivoRechazo = motivoRechazo;
                }
                if (error) {
                    self._errores.push(error);
                }
                self._executeCallbacks();
                return self;
            };
            ;
            Promesa.prototype.setError = function (args) {
                var self = this;
                self._argumentos = args;
                self._hasError = true;
                self._executeCallbacks();
            };
            ;
            Promesa.prototype.then = function (callbackResolved, callbackRejected) {
                /// <summary>handler cuando la promesa es resuelta o rechazada</summary>        
                /// <param name="callbackResolved" type="callback">definición de handler cuando la promesa es resuelta</param>
                /// <param name="callbackRejected" type="callback">definición de handler cuando la promesa es rechazada</param>
                /// <returns type="promesa"></returns>
                var self = this, callback = {};
                if (!!callbackResolved) {
                    callback.callbackResolved = callbackResolved;
                }
                if (!!callbackRejected) {
                    callback.callbackRejected = callbackRejected;
                }
                self._callbacks.push(callback);
                if (!self._inprocess) {
                    self._executeCallbacks();
                }
                return self;
            };
            ;
            Promesa.prototype.always = function (callbackAlways) {
                /// <summary>handler cuando la promesa es resuelta, rechazada o tuvo error</summary>        
                /// <param name="callbackAlways" type="callback">definición de handler</param>
                /// <returns type="promesa"></returns>
                var self = this, callback = {};
                if (!!callbackAlways) {
                    callback.callbackAlways = callbackAlways;
                }
                self._callbacks.push(callback);
                if (!self._inprocess) {
                    self._executeCallbacks();
                }
                return self;
            };
            ;
            Promesa.prototype.execute = function (definition) {
                /// <summary>metodo para ejecutar una promesa</summary>        
                /// <param name="definition" type="definition">definición para poder resolver o rechazar</param>
                /// <returns type="promesa"></returns>
                var self = this, ok = function () {
                    self.resolve.apply(self, arguments);
                }, rej = function (argumentos, motivoRechazo) {
                    self.reject(argumentos, motivoRechazo);
                }, heredarPromesa = function (promesa, argumentos) {
                    self.heredar(promesa, argumentos);
                };
                try {
                    definition(ok, rej, heredarPromesa);
                }
                catch (excepcion) {
                    if (!excepcion.stack) {
                        console.error(excepcion);
                        self._errores.push(excepcion);
                    }
                    else {
                        console.error(excepcion.stack);
                        self._errores.push(excepcion.stack);
                    }
                    self._hasError = true;
                    self._motivoRechazo = self.MOTIVO_RECHAZO_ERROR_JS;
                }
                return self;
            };
            ;
            Promesa.prototype.heredar = function (promesaPadre, argumentos) {
                /// <summary>metodo para heredar una promesa (promesa EduCore o deferred)</summary>        
                /// <param name="definition" type="definition">definición para poder resolver o rechazar</param>
                /// <returns type="promesa">promesa con el estado y valores de origen</returns>
                /// ** Se presupone que un deferred viene de un serviceBase, si no es asi hay que especificarlo
                var self = this, argumentosEsArray = argumentos && Object.prototype.toString.call(argumentos) === '[object Array]';
                if (argumentos && !argumentosEsArray) {
                    throw "El parametro argumentos tienen que ser array";
                }
                self._tieneHerencia = true;
                var esDeferred = (promesaPadre.fail && promesaPadre.done && promesaPadre.then && promesaPadre.resolve);
                var esJQXHR = (promesaPadre.fail && promesaPadre.done && promesaPadre.then && !promesaPadre.resolve && !promesaPadre.reject && promesaPadre.always);
                var esPromesaEducamos = (promesaPadre.esPromesa);
                var esPromesaEduCore = (!promesaPadre.fail && promesaPadre.done && promesaPadre.then && !promesaPadre.resolve && !promesaPadre.reject && !promesaPadre.always);
                if (esPromesaEducamos) {
                    self._heredarDesdePromesaEducamos(promesaPadre, argumentos);
                }
                else if (esPromesaEduCore) {
                    self._heredarDesdePromesaEducore(promesaPadre);
                }
                else if (esDeferred || esJQXHR) {
                    self._heredarDesdeXHR_Deferred(promesaPadre);
                }
                else {
                    throw "El parametro de entrada no es una promesa EduCore, promesa jQuery o Deferred";
                }
                return self;
            };
            ;
            Promesa.prototype._heredarDesdePromesaEducore = function (promesaPadre) {
                //J.Aparisi (5/7/2016) Por ahora solo hereda sin concatenar params, pensado solo para heredar desde educorestart con un new Promise o con el metodo heredar
                var self = this;
                self._inprocess = true;
                promesaPadre.then(function () {
                    self.resolve.apply(self, arguments);
                });
            };
            Promesa.prototype._heredarDesdePromesaEducamos = function (promesaPadre, argumentos) {
                var self = this;
                self._inprocess = true;
                //Prioridad -> Primero: self, Segundo: promesaPadre, Tercero: argumentos
                var argumentosConcatenados = [];
                if (self._argumentos) {
                    for (var i = 0; i < self._argumentos.length; i++) {
                        argumentosConcatenados.push(self._argumentos[i]);
                    }
                }
                if (promesaPadre._argumentos) {
                    for (var i = 0; i < promesaPadre._argumentos.length; i++) {
                        argumentosConcatenados.push(promesaPadre._argumentos[i]);
                    }
                }
                if (argumentos) {
                    for (var i = 0; i < argumentos.length; i++) {
                        argumentosConcatenados.push(argumentos[i]);
                    }
                }
                promesaPadre.always(function () {
                    if (arguments.length > 0) {
                        for (var i = 0; i < arguments.length; i++) {
                            argumentosConcatenados.push(arguments[i]);
                        }
                    }
                    promesaPadre._resolverPromesa(self, argumentosConcatenados);
                });
            };
            Promesa.prototype._heredarDesdeXHR_Deferred = function (promesaPadre) {
                var self = this;
                self._inprocess = true;
                self.execute(function (resolve, reject) {
                    promesaPadre.done(function () {
                        resolve.apply(resolve, arguments);
                    });
                    promesaPadre.fail(function () {
                        reject(arguments, self.MOTIVO_RECHAZO_ERROR_SERVIDOR, arguments[0]);
                    });
                });
            };
            Promesa.prototype._executeCallbacks = function () {
                var self = this, promesaIniciada = self._resolved || self._rejected || self._hasError, tieneCallbacksSinEjecutar = self._callbacks.length > 0;
                if (promesaIniciada) {
                    if (tieneCallbacksSinEjecutar) {
                        var nextCallback = self._callbacks.shift();
                        var valorDevuelto = undefined;
                        if (!!nextCallback.callbackResolved && self._resolved && !self._hasError) {
                            valorDevuelto = self._executeCallback(nextCallback.callbackResolved);
                        }
                        if (!!nextCallback.callbackRejected && (self._rejected || self._hasError)) {
                            valorDevuelto = self._executeCallback(nextCallback.callbackRejected, true);
                        }
                        if (!!nextCallback.callbackAlways) {
                            valorDevuelto = self._executeCallback(nextCallback.callbackAlways);
                        }
                        var valorDevueltoEsPromesa = (!!valorDevuelto && valorDevuelto['then']);
                        if (valorDevueltoEsPromesa) {
                            self.heredar(valorDevuelto);
                        }
                        else {
                            if (valorDevuelto != undefined) {
                                //Forzamos un nuevo parametro para el siguiente callback (el original es sustituido)
                                self._argumentos = [valorDevuelto];
                            }
                            self._resolverPromesa(self, self._argumentos);
                        }
                    }
                    else {
                        //Esto no es un final necesariamente -> por el momento estan resueltos todos los callbaks 
                        //luego se pueden añadir luego mas callbacks
                        self._inprocess = false;
                    }
                }
            };
            ;
            Promesa.prototype._executeCallback = function (callback, mostrarMotivoRechazo) {
                var self = this, valorDevuelto = undefined;
                try {
                    if (!mostrarMotivoRechazo) {
                        valorDevuelto = callback.apply(callback, self._argumentos);
                    }
                    else {
                        var parametroCallback = {
                            params: self._argumentos, motivoRechazo: self._motivoRechazo, registrarTraza: function () {
                                self._registrarTraza.apply(self, arguments);
                            }, pintarEnLaPantallaError: function (selector) {
                                $(selector).html('<div class="text-center w100x100 mtop50"><img src="/cdn/Content/images/error_tabs.png"/></div>');
                            }
                        };
                        valorDevuelto = callback(parametroCallback);
                    }
                }
                catch (excepcion) {
                    if (!excepcion || (excepcion && !excepcion.stack)) {
                        if (excepcion) {
                            self._argumentos = [excepcion];
                        }
                        console.error(excepcion);
                        self._errores.push(excepcion);
                    }
                    else {
                        console.error(excepcion.stack);
                        self._errores.push(excepcion.stack);
                    }
                    self._hasError = true;
                    self._motivoRechazo = self.MOTIVO_RECHAZO_ERROR_JS;
                }
                return valorDevuelto;
            };
            ;
            Promesa.prototype._resolverPromesa = function (nuestraPromesa, argumentos) {
                var self = this;
                if (argumentos == undefined) {
                    argumentos = self._argumentos;
                }
                if (self._hasError) {
                    nuestraPromesa._motivoRechazo = self._motivoRechazo;
                    self._errores.forEach(function (err) {
                        nuestraPromesa._errores.push(err);
                    });
                    nuestraPromesa.setError.apply(nuestraPromesa, argumentos);
                }
                else {
                    if (self._resolved) {
                        nuestraPromesa.resolve.apply(nuestraPromesa, argumentos);
                    }
                    if (self._rejected) {
                        nuestraPromesa.reject(argumentos, self._motivoRechazo);
                    }
                }
            };
            Promesa.prototype._registrarTraza = function (infoTraza) {
                var self = this, errores = "";
                self._errores.forEach(function (itemError) {
                    errores += itemError;
                });
                //TODO: De momento escribimos en el Elmah. Hay que revisar toda la traza de errores.
                EduCore.trigger({
                    event: "ThrowEx", context: "Errors", args: {
                        Id: infoTraza.area, Fn: infoTraza.modulo, Sb: {}, Er: errores, Ar: infoTraza.argumentos, Mr: self._motivoRechazo, Re: self._argumentos
                    }
                });
            };
            return Promesa;
        }());
        Promesa.all = function () {
            var proms = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                proms[_i] = arguments[_i];
            }
            var promesaProvider = new sandBox.collaborators.PromesaProvider();
            return promesaProvider.all.apply(promesaProvider, proms);
        };
        return Promesa;
    }
}());
