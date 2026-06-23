function login(){

    let username =
    document.getElementById("username").value;

    let password =
    document.getElementById("password").value;

    if(
        username === "admin" &&
        password === "admin123"
    ){

        localStorage.setItem(
            "loggedIn",
            "true"
        );

        window.location.href =
        "index.html";

    }
    else{

        alert(
            "Invalid Username or Password"
        );

    }

}