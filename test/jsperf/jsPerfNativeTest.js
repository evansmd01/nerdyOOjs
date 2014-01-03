function createBaseClass() {
    var DeclaredClass = function() {

    };

    DeclaredClass.prototype.testMethod = function(i) {
        console.log(i);
    };

    return DeclaredClass;
}

function extendClass(Base) {
    var DeclaredClass = function() {

    };

    DeclaredClass.prototype = new Base();
    DeclaredClass.prototype.constructor = DeclaredClass;

    DeclaredClass.prototype.testMethod = function(i) {
        Base.prototype.testMethod.call(this, i);
    };
}


var BaseClass = createBaseClass();

for (var i = 0; i < 10000; i++) {
    var NewClass = extendClass(BaseClass);
    new NewClass().testMethod(i);
}