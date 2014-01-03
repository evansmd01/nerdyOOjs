window.onload = function() {

    function createBaseClass() {
        return nerdyOO.declare({
            testMethod: function(i) {
                console.log(i);
            }
        });
    }

    function extendClass(Base) {
        return nerdyOO.inherit([Base], {
            testMethod: function(i) {
                this.base.testMethod(i);
            }
        });
    }

    var BaseClass = createBaseClass();
    var NewClass = extendClass(BaseClass);
    new NewClass().testMethod(i);    
}