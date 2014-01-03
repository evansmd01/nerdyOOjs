
require(["nerdyOO"], function(nerdyOO) {

    /************************************
    *              BASE
    ************************************/
    var LoggerBase = nerdyOO.declare({
        construct: function(color) {
            this.color = color;
            this.console = document.getElementById('Console');
            this.log("In LoggerBase.construct!!!");
        },

        log: function(message) {
            var p = document.createElement('p');
            p.style.color = this.color;
            p.innerHTML = message;
            this.console.appendChild(p);
        }
    });

    /************************************
    *        Single Inheritance
    ************************************/
    var ClassA = nerdyOO.inherit([LoggerBase], {
        construct: function(color) {
            this.base.construct(color);
            this.log("In ClassA.construct");
        },

        method1: function() {
            this.log("In ClassA.method1");
        }
    });
    new ClassA('blue').method1();

    /************************************
    *  Multiple Levels of Inheritance
    ************************************/

    var ClassB = nerdyOO.inherit([ClassA], {
        construct: function(color) {
            this.base.construct(color);
            this.log("In ClassB.construct");
        },

        method1: function() {
            this.log("In ClassB.method1");
        }
    });
    new ClassB('red').method1();


    /************************************
    *         Deadly Diamond of Death
    ************************************/
    var ClassC = nerdyOO.inherit([ClassA, ClassB], {
        construct: function(color) {
            this.base.construct(color); //calls both parents contruct methods
            this.log("In ClassC.construct");
        }
    });
    var c = new ClassC("green");
    c.method1(); //only calls ClassB's method1. Last one in to the inhertance array wins
    c.base.method1(); //calls both parents' method1. 

});
