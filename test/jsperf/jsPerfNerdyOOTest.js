window.onload = function() {

    function createBaseClass() {
        return nerdyOO.declare({
            testMethod: function() {
            }
        });
    }

    function extendClass(Base) {
        return nerdyOO.inherit([Base], {
            testMethod: function() {
                this.base.testMethod();
            }
        });
    }

    var BaseClass = createBaseClass();
    var NewClass = extendClass(BaseClass);
    new NewClass().testMethod();    
}