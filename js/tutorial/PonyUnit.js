function Failed(message) {
    this.name = "Failed";
    this.message = message || "Default Message";
}
Failed.prototype = new Error();
Failed.prototype.constructor = Failed;

/*
 * Du test au vrai goût de poney !
 */
var PonyUnit = (function () {

    var countAssert;

    window.execTestsSteps = function (steps) {

        if (steps.length == 0) return;
        var step = steps.shift();

        countAssert = 0;
        var failed = false;
        var assertionFailed = [];
        try {
            step.test();
            execTestsSteps(steps);
        } catch (e) {

            failed = true;
            if (e instanceof Failed) {
                assertionFailed.push(e.message);
            } else {
                assertionFailed.push("Error :" + e.message);
            }
        } finally {

            step.setProperties({
                executed: true,
                passed: !failed,
                errors: assertionFailed
            });
        }
    }

    window.ok = function (testPassed, msg) {
        countAssert++;
        testPassed = !!testPassed;
        if (!testPassed) {
            throw new Failed(msg)
        }
    }

    window.fail = function (msg) {
        ok(false, msg)
    }

    window.equal = function (a, b, msg) {
        ok(a === b, msg);
    }

    return {
        // some public methods ...
    };
})();