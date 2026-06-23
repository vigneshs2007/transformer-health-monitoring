if(
    localStorage.getItem("loggedIn")
    !== "true"
){
    window.location.href =
    "login.html";
}
function loadData(){

    fetch("http://127.0.0.1:5000/api/data")
    .then(response => response.json())
    .then(data => {

        if(data.length > 0){

            let latest = data[0];

            document.getElementById("temperature").innerText =
            latest.temperature + "°C";

            document.getElementById("voltage").innerText =
            latest.voltage + "V";

            document.getElementById("current").innerText =
            latest.current + "A";

            let statusElement =
            document.getElementById("status");

            statusElement.innerText =
            latest.status;

            if(latest.status == "Overheated"){
                statusElement.style.color = "red";
            }
            else if(latest.status == "Voltage Surge"){
                statusElement.style.color = "orange";
            }
            else if(latest.status == "Overload"){
                statusElement.style.color = "blue";
            }
            else{
                statusElement.style.color = "green";
            }
        }

    })
    .catch(error => {
        console.log(error);
    });

}

function loadStats(){

    fetch("http://127.0.0.1:5000/api/stats")
    .then(response => response.json())
    .then(data => {

        document.getElementById("totalRecords").innerText =
        data.total_records;

        document.getElementById("faultCount").innerText =
        data.fault_count;

    })
    .catch(error => {
        console.log(error);
    });

}

loadData();
loadStats();

setInterval(loadData, 5000);
setInterval(loadStats, 5000);
let chart;

function loadChart(){

    fetch("http://127.0.0.1:5000/api/data")
    .then(response => response.json())
    .then(data => {

        let labels = [];
        let temperatures = [];

        data.reverse().forEach(item => {

            labels.push(item.id);
            temperatures.push(item.temperature);

        });

        const ctx =
        document.getElementById("tempChart");

        if(chart){
            chart.destroy();
        }

        chart = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Temperature",
                    data: temperatures
                }]
            }
        });

    });

}

loadChart();

setInterval(loadChart, 5000);
let voltageChart;

function loadVoltageChart(){

    fetch("http://127.0.0.1:5000/api/data")
    .then(response => response.json())
    .then(data => {

        let labels = [];
        let voltages = [];

        data.reverse().forEach(item => {
            labels.push(item.id);
            voltages.push(item.voltage);
        });

        const ctx =
        document.getElementById("voltageChart");

        if(voltageChart){
            voltageChart.destroy();
        }

        voltageChart = new Chart(ctx,{
            type:"line",
            data:{
                labels:labels,
                datasets:[{
                    label:"Voltage",
                    data:voltages
                }]
            }
        });

    });

}

loadVoltageChart();

setInterval(loadVoltageChart,5000);
let currentChart;

function loadCurrentChart(){

    fetch("http://127.0.0.1:5000/api/data")
    .then(response => response.json())
    .then(data => {

        let labels = [];
        let currents = [];

        data.reverse().forEach(item => {

            labels.push(item.id);
            currents.push(item.current);

        });

        const ctx =
        document.getElementById("currentChart");

        if(currentChart){
            currentChart.destroy();
        }

        currentChart = new Chart(ctx,{
            type:"line",
            data:{
                labels:labels,
                datasets:[{
                    label:"Current",
                    data:currents
                }]
            }
        });

    });

}

loadCurrentChart();

setInterval(loadCurrentChart,5000);
let statusChart;

function loadStatusChart(){

    fetch("http://127.0.0.1:5000/api/data")
    .then(response => response.json())
    .then(data => {

        let normal = 0;
        let overheated = 0;
        let overload = 0;
        let surge = 0;

        data.forEach(item => {

            if(item.status === "Normal")
                normal++;

            else if(item.status === "Overheated")
                overheated++;

            else if(item.status === "Overload")
                overload++;

            else if(item.status === "Voltage Surge")
                surge++;

        });

        const ctx =
        document.getElementById("statusChart");

        if(statusChart){
            statusChart.destroy();
        }

        statusChart = new Chart(ctx,{
            type:"pie",
            data:{
                labels:[
                    "Normal",
                    "Overheated",
                    "Overload",
                    "Voltage Surge"
                ],
                datasets:[{
                    data:[
                        normal,
                        overheated,
                        overload,
                        surge
                    ]
                }]
            },
            options:{
                responsive:true,
                maintainAspectRatio:false
            }
        });

    });

}

loadStatusChart();

setInterval(loadStatusChart,5000);
function loadLatestFault(){

    fetch("http://127.0.0.1:5000/api/data")
    .then(response => response.json())
    .then(data => {

        let fault =
        data.find(item =>
            item.status !== "Normal"
        );

        if(fault){

            document.getElementById(
                "latestFault"
            ).innerText =
            fault.status;

            document.getElementById(
                "faultTime"
            ).innerText =
            fault.timestamp;

        }

    });

}

loadLatestFault();

setInterval(loadLatestFault,5000);
function loadAlertBanner(){

    fetch("http://127.0.0.1:5000/api/data")
    .then(response => response.json())
    .then(data => {

        let latest = data[0];

        let banner =
        document.getElementById("alertBanner");

        if(latest.status === "Normal"){

            banner.className =
            "alert alert-success text-center";

            banner.innerText =
            "✅ SYSTEM NORMAL";

        }
        else{

            banner.className =
            "alert alert-danger text-center";

            banner.innerText =
            "⚠ " + latest.status.toUpperCase()
            + " DETECTED";

        }

    });

}

loadAlertBanner();

setInterval(loadAlertBanner,5000);
function logout(){

    localStorage.removeItem(
        "loggedIn"
    );

    window.location.href =
    "login.html";
}
function loadHealthScore(){

    fetch(
        "http://127.0.0.1:5000/api/healthscore"
    )

    .then(response => response.json())

    .then(data => {

        let score = data.score;

        document.getElementById(
            "healthScore"
        ).innerText =
        score + "%";

        let status = "Excellent";

        if(score < 80)
            status = "Warning";

        if(score < 50)
            status = "Critical";

        document.getElementById(
            "healthStatus"
        ).innerText =
        status;

    });

}

loadHealthScore();

setInterval(
    loadHealthScore,
    5000
);