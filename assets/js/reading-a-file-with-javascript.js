$(".file-input").on("change", (e) => {    
    let reader = new FileReader();
    reader.readAsText($("#file-input")[0].files[0]);
    let header = $("#header").is(":checked");

    let text = null;
    let rows = null;
    let firstRow = 0;

    let style = " style=\"font-size: 75%;\" ";
    
    reader.onload = () => {
        text = reader.result;
        rows = d3.csvParseRows(text);

        // Clear out all previous data.
        $("#file-preview").html("");

        let table = $("<table style=\"margin-bottom: 0;\"></table>");
        let tbody = $("<tbody></tbody>");
        
        if (header) {
            firstRow = 1;
            let head = "<thead><tr><th" + style + ">";
            head += rows[0].join("</th><th" + style + ">");
            head += "</tr></th></thead>";
            table.append(head);
        }

        table.append(tbody);

        for (let i = firstRow; i < rows.length; i++) {
            let row = "<tr><td" + style + ">";
            row += rows[i].join("</td><td" + style + ">");
            row += "</td></tr>";
            tbody.append(row);
        }        
        
        $("#file-preview").append(table);
    };
});
