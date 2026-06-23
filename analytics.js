function loadAnalytics(){

    fetch("http://127.0.0.1:5000/api/data")
    .then(response => response.json())
    .then(data => {

        let total = data.length;

        if(total === 0) return;

        let tempSum = 0;
        let voltageSum = 0;
        let maxTemp = 0;
        let faultCount = 0;

        data.forEach(item => {

            tempSum += item.temperature;
            voltageSum += item.voltage;

            if(item.temperature > maxTemp){
                maxTemp = item.temperature;
            }

            if(item.status !== "Normal"){
                faultCount++;
            }

        });

        let avgTemp =
        (tempSum / total).toFixed(2);

        let avgVoltage =
        (voltageSum / total).toFixed(2);

        let faultPercent =
        ((faultCount / total) * 100)
        .toFixed(2);

        document.getElementById(
            "avgTemp"
        ).innerText =
        avgTemp + "°C";

        document.getElementById(
            "maxTemp"
        ).innerText =
        maxTemp + "°C";

        document.getElementById(
            "avgVoltage"
        ).innerText =
        avgVoltage + "V";

        document.getElementById(
            "faultPercent"
        ).innerText =
        faultPercent + "%";

    });

}

loadAnalytics();
let trendChart;

function loadTrendChart(){

    fetch("http://127.0.0.1:5000/api/data")

    .then(response => response.json())

    .then(data => {

        let labels = [];
        let temps = [];

        data.reverse().forEach(item => {

            labels.push(item.id);
            temps.push(item.temperature);

        });

        const ctx =
        document.getElementById(
            "trendChart"
        );

        if(trendChart){

            trendChart.destroy();

        }

        trendChart =
        new Chart(ctx,{

            type:"line",

            data:{

                labels:labels,

                datasets:[{

                    label:
                    "Temperature Trend",

                    data:temps

                }]

            }

        });

    });

}

loadTrendChart();