window.onload = function() {

    function createBaseClass() {
        var DeclaredClass = function() {

        };

        DeclaredClass.prototype.testMethod = function() {
        };

        return DeclaredClass;
    }

    function extendClass(Base) {
        var DeclaredClass = function() {

        };

        DeclaredClass.prototype = new Base();
        DeclaredClass.prototype.constructor = DeclaredClass;

        DeclaredClass.prototype.testMethod = function() {
            Base.prototype.testMethod.call(this);
        };
    }

    var BaseClass = createBaseClass();
    var NewClass = extendClass(BaseClass);
    new NewClass().testMethod();    
}