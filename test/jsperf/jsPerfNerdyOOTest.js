function createBaseClass() {
    return nerdyOO.declare({
        testMethod: function(i) {
            console.log(i);
        }
    });
}

function extendClass(Base) {
    return nerdyOO.inherit([Base], {
        testMethod: function (i) {
            this.base.testMethod(i);
        }
    });
}


var BaseClass = createBaseClass();

for (var i = 0; i < 10000; i++) {
    var NewClass = extendClass(BaseClass);
    new NewClass().testMethod(i);
}