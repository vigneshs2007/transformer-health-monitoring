fetch("/api/data")
.then(response => response.json())
.then(data => {

    let table = document.getElementById("historyTable");

    table.innerHTML = "";

    data.forEach(item => {

        table.innerHTML += `
        <tr>
            <td>${item.timestamp}</td>
            <td>${item.temperature}°C</td>
            <td>${item.voltage}V</td>
            <td>${item.current}A</td>
            <td>${item.status}</td>
        </tr>
        `;
    });

})
.catch(error => {
    console.log(error);
});
function loadHistory(){

    fetch("/api/data")
    .then(response => response.json())
    .then(data => {

        let table = "";

        data.forEach(item => {

            table += `
            <tr>
                <td>${item.id}</td>
                <td>${item.temperature}</td>
                <td>${item.voltage}</td>
                <td>${item.current}</td>
                <td>${item.status}</td>
                <td>${item.timestamp}</td>
            </tr>
            `;

        });

        document.getElementById("historyTable").innerHTML =
        table;

    });

}

loadHistory();
function exportCSV(){

    fetch("/api/data")
    .then(response => response.json())
    .then(data => {

        let csv =
        "ID,Temperature,Voltage,Current,Status,Timestamp\n";

        data.forEach(item => {

            csv +=
            `${item.id},${item.temperature},${item.voltage},${item.current},${item.status},${item.timestamp}\n`;

        });

        let blob = new Blob(
            [csv],
            { type: "text/csv" }
        );

        let url =
        window.URL.createObjectURL(blob);

        let a =
        document.createElement("a");

        a.href = url;
        a.download = "transformer_history.csv";

        a.click();

    });

}

function filterDropdown(){

    let filter =
    document.getElementById("statusFilter").value;

    let rows =
    document.getElementById("historyTable")
    .getElementsByTagName("tr");

    for(let i = 0; i < rows.length; i++){

        let statusCell =
        rows[i].getElementsByTagName("td")[4];

        if(statusCell){

            let status =
            statusCell.innerText;

            if(filter === "" || status === filter){

                rows[i].style.display = "";

            }
            else{

                rows[i].style.display = "none";

            }

        }

    }

}
async function generatePDF(){

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    const response =
    await fetch("/api/data");

    const data =
    await response.json();

    // Statistics
    let totalRecords = data.length;

    let faultCount = data.filter(
        item => item.status !== "Normal"
    ).length;

    let latestStatus =
    data.length > 0 ?
    data[0].status :
    "No Data";

    // Title
    doc.setFontSize(18);

    doc.text(
        "Transformer Health Monitoring Report",
        20,
        20
    );

    // Summary Section
    doc.setFontSize(12);

    doc.text(
        `Generated On: ${new Date().toLocaleString()}`,
        20,
        35
    );

    doc.text(
        `Total Records: ${totalRecords}`,
        20,
        50
    );

    doc.text(
        `Fault Count: ${faultCount}`,
        20,
        60
    );

    doc.text(
        `Latest Status: ${latestStatus}`,
        20,
        70
    );

    // Divider
    doc.line(20, 80, 190, 80);

    doc.text(
        "Detailed Records",
        20,
        90
    );

    let y = 105;

    data.forEach(item => {

        doc.text(
            `ID:${item.id} | Temp:${item.temperature}°C | Voltage:${item.voltage}V | Current:${item.current}A`,
            10,
            y
        );

        y += 8;

        doc.text(
            `Status:${item.status} | Time:${item.timestamp}`,
            10,
            y
        );

        y += 12;

        if(y > 270){

            doc.addPage();

            y = 20;
        }

    });

    doc.save(
        "Transformer_Health_Report.pdf"
    );

}
