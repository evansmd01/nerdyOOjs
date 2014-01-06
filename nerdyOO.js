/**
 * @fileOverview
 * Javascript Objects Library & AMD definition
 *
 * @author michaele
 * @version 1.0
 */

var nerdyOO = {

    /**
     * Creates a prototype class using the declaration object literal
     *
     * @param {Object} declarationObjectLiteral An object defining properties and methods to apply to the prototype
     * @param {Object} staticPropertiesObjectLiteral An object defining static properties and methods to apply to the class function
     * @returns {Function} the new class
     */
    declare: function (declarationObjectLiteral, staticPropertiesObjectLiteral) {
        return nerdyOO.inherit(null, declarationObjectLiteral, staticPropertiesObjectLiteral);
    },

    /**
     * Creates a prototype class using the declaration object literal and an array of classes to inherit from
     *
     * @param {Array} arrayBaseClasses An array containing base classes from which to inherit
     * @param {Object} declarationObjectLiteral An object defining properties and methods to apply to the prototype     
     * @param {Object} staticPropertiesObjectLiteral An object defining static properties and methods to apply to the class function
     * @returns {Function} the new class
     */
    inherit: function (arrayBaseClasses, declarationObjectLiteral, staticPropertiesObjectLiteral) {

        //optionally allow them to pass in just a single base class, not packaged in an array
        if (typeof (arrayBaseClasses) === "function") {
            arrayBaseClasses = [arrayBaseClasses];
        }

        var DeclaredClass = function () {
            //create closures on this.base for invoking overridden functions
            nerdyOO._internal.mapBaseClosures(this);

            //then call the construct method if supplied
            if (typeof (this.construct) === 'function') {
                this.construct.apply(this, Array.prototype.slice.call(arguments, 0));
            }
        };

        //apply static members first (potentially overriden later)
        nerdyOO._internal.mapStaticMembers(DeclaredClass, arrayBaseClasses, staticPropertiesObjectLiteral);

        //apply base class prototype members to the prototype first. In case of conflicts, last in wins
        nerdyOO._internal.mapBasePrototypes(DeclaredClass.prototype, arrayBaseClasses);        

        //now apply the declaration object literal's members to the prototype, overriding any matching members from the base classes, 
        nerdyOO._internal.mapDeclaration(DeclaredClass.prototype, declarationObjectLiteral, staticPropertiesObjectLiteral);

        

        //map static members
        for (var staticMember in staticPropertiesObjectLiteral) {
            if (!staticPropertiesObjectLiteral.hasOwnProperty(staticMember)) {
                continue;
            }
            DeclaredClass[staticMember] = staticPropertiesObjectLiteral[staticMember];
        }


        /**
        * Invokes a method on the next highest base prototype. If multiple inheritance, and both base classes have the same method, both base methods will be called
        * If this gets invoked a second time before it has returned, it will go up a level to the next highest prototype, allowing us to crawl up through multiple levels of inheritance. 
        * Don't need to invoke directly, this gets wrapped in a closure and assigned to this.base.{memberName} for overriden functions
        *
        * @param {string} userAgent Browser's user agent
        * @returns {boolean}
        */
        DeclaredClass.prototype._invokeOnBase = function (strMethod, args) {
            this._invokeOnBasePrototypeContext[strMethod] = this._invokeOnBasePrototypeContext[strMethod] || [];
            if (this._invokeOnBasePrototypeContext[strMethod].length === 0) {
                this._invokeOnBasePrototypeContext[strMethod].push(DeclaredClass.prototype);
            }
            var prototypeContext = this._invokeOnBasePrototypeContext[strMethod].pop();
            for (var i = 0; i < prototypeContext.basePrototypes.length; i++) {
                var baseProto = prototypeContext.basePrototypes[i];
                if (baseProto.hasOwnProperty(strMethod)) {
                    this._invokeOnBasePrototypeContext[strMethod].push(baseProto);
                    baseProto[strMethod].apply(this, args);
                }
            }
            this._invokeOnBasePrototypeContext[strMethod] = [];
        };
        DeclaredClass.prototype._invokeOnBasePrototypeContext = {};

        return DeclaredClass;
    },

    /**
     * Namespace for methods used internally by the Javascript Objects Library
     *
     * @type {Object}
     */
    _internal: {
        /**
         * maps any base classes' prototypes onto the new prototype
         *
         * @param {Object} proto the new class's prototype
         * @param {Array} arrayBaseClasses An array containing base classes from which to inherit
         * @returns {undefined}
         */
        mapBasePrototypes: function (proto, arrayBaseClasses) {
            if(!(arrayBaseClasses instanceof Array && arrayBaseClasses.length > 0)){
                return;
            }
            proto.basePrototypes = [];
            //loop through base classes applying members to the instance. 
            //multiple inheritance is possible, and ugly, last in wins. 
            for (var i = 0; i < arrayBaseClasses.length; i++) {
                var baseProto = arrayBaseClasses[i].prototype;
                proto.basePrototypes.push(baseProto);
                // basePreConstructed = baseProto._preConstruct.apply(instance);
                for (var member in baseProto) {
                    if (!baseProto.hasOwnProperty(member) || member === 'basePrototypes' || member === 'base' || member === '_invokeOnBase') {
                        continue;
                    }
                    proto[member] = baseProto[member];
                }
            }
        },
        /**
         * creates closures for any base class functions so that they can be accessed via this.base[functionName]
         * This method should only be invoked from the constructor of the child class
         *
         * @param {Object} context The 'this' context of the child class. 
         * @returns {undefined}
         */
        mapBaseClosures: function (context) {
            if (!(context.basePrototypes instanceof Array && context.basePrototypes.length > 0)) {
                return;
            }
            context.base = {};
            //loop through base classes applying members to the instance. 
            //multiple inheritance is possible, and ugly, last in wins. 
            for (var i = 0; i < context.basePrototypes.length; i++) {
                var baseProto = context.basePrototypes[i];
                // basePreConstructed = baseProto._preConstruct.apply(instance);
                for (var member in baseProto) {
                    if (!baseProto.hasOwnProperty(member) || member === 'basePrototypes' || member === 'base' || member === '_invokeOnBase') {
                        continue;
                    }
                    //add a closure for any functions so they can be called via proto.base.{memberName}
                    if (typeof (baseProto[member]) === 'function') {
                        context.base[member] = function (functionName) {
                            return function () {
                                context._invokeOnBase(functionName, arguments);
                            };
                        }(member);
                    }
                }
            }
        },
        /**
         * Maps the declaration Object literal onto the new class's prototype
         *
         * @param {Object} proto the new class's prototype
         * @param {Object} declarationObjectLiteral An object defining properties and methods to apply to the prototype
         * @returns {undefined}
         */
        mapDeclaration: function (proto, declarationObjectLiteral, staticPropertiesObjectLiteral) {
            for (var declarationMember in declarationObjectLiteral) {
                if (!declarationObjectLiteral.hasOwnProperty(declarationMember)) {
                    continue;
                }
                //add the member to this instance, overriding any previously added member of the same name
                proto[declarationMember] = declarationObjectLiteral[declarationMember];
            }            
        },

        /**
         * Maps the static members from the base and the supplied object literal 
         *
         * @param {Function} classFunction The new class function
         * @param {Array} arrayBaseClasses An array containing base classes from which to inherit
         * @param {Object} staticPropertiesObjectLiteral An object defining static properties and methods to apply to the class function
         * @returns {undefined}
         */
        mapStaticMembers: function (classFunction, arrayBaseClasses, staticPropertiesObjectLiteral) {
            if (arrayBaseClasses instanceof Array && arrayBaseClasses.length > 0) {
                for (var i = 0; i < arrayBaseClasses.length; i++){
                    var Base = arrayBaseClasses[i];
                    for(var member in Base){
                        if(!Base.hasOwnProperty(member)){
                            continue;
                        }
                        classFunction[member] = Base[member];
                    }
                }
            }

            if(staticPropertiesObjectLiteral){
                for(var member in staticPropertiesObjectLiteral){
                    if(!staticPropertiesObjectLiteral.hasOwnProperty(member)){
                        continue;
                    }
                    classFunction[member] = staticPropertiesObjectLiteral[member];
                }
            }
        }
    }
};

/************************************************
*         Conditional AMD Packaging
************************************************/
if (typeof define === 'function' && define.amd) {
    define(function () {        
        return nerdyOO;
    });
}