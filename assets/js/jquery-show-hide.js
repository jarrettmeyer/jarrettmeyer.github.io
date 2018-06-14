(function () {

    var _array = [];
    var _maxCount = 5e7;
    var _startTime = null;

    function compute(durationSelector) {
        var startTime = Date.now();
        _array.splice(0, _array.length);
        for (var i = 0; i < _maxCount; i++) {
            _array.push(Math.random());
        }
        var endTime = Date.now();
        var durationSeconds = (endTime - startTime) / 1000;
        var durationString = Number.parseFloat(durationSeconds).toFixed(2);
        $(durationSelector).text(durationString + " seconds");
        $("#block").css("opacity", 0);
    }

    function doImportantStuff() {
        $("#block").css("opacity", 1);
        compute("#duration1");
    }

    function doImportantStuffSetTimeout() {
        $("#block").css("opacity", 1);
        setTimeout(function () {
            compute("#duration2");
        }, 0);
    }

    $("#clicker1").on("click", doImportantStuff);
    $("#clicker2").on("click", doImportantStuffSetTimeout);

})();
