fetch("http://127.0.0.1:5000/api/data")
.then(response => response.json())
.then(data => {

    let container = document.getElementById("alertsContainer");

    container.innerHTML = "";

    data.forEach(item => {

        if(item.status !== "Normal"){

            container.innerHTML += `
            <div class="alert alert-danger">
                ${item.timestamp} - ${item.status}
            </div>
            `;
        }

    });

});