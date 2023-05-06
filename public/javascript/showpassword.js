function showPassword() {
    const x = document.getElementById("myPassword");
    if (x.type === "password") {
    x.type = "text";
    }else{
        x.type = "password";
    }
}