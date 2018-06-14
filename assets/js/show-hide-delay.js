(function () {

    $("#clicker1").on("click", function () {
        $("#block1").css("opacity", 1);
        let maxDuration = 2000;
        let startTime = Date.now();
        let endTime = Date.now();
        let array = [];
        while ((!endTime) || (endTime - startTime < maxDuration)) {
            let x = Math.random() * 100;
            let s = x.toFixed(3);
            array.push(s);
            endTime = Date.now();
        }
        let duration = "Done in " + ((endTime - startTime) / 1000).toFixed(3) + " seconds";       
        $("#duration1").text(duration);
        $("#block1").css("opacity", 0);
    });
    
    
    $("#clicker2").on("click", function () {
        $("#block2").css("opacity", 1);
        setTimeout(function () {
            let maxDuration = 2000;
            let startTime = Date.now();
            let endTime = Date.now();
            let array = [];
            while ((!endTime) || (endTime - startTime < maxDuration)) {
                let x = Math.random() * 100;
                let s = x.toFixed(3);
                array.push(s);
                endTime = Date.now();
            }
            let duration = "Done in " + ((endTime - startTime) / 1000).toFixed(3) + " seconds";       
            $("#duration2").text(duration);
            $("#block2").css("opacity", 0);
        }, 0);
    });

})();
