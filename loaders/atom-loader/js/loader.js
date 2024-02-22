const ShowHideLoader = () => {
    let containerLoader = document.getElementById('loader-container');
    if (containerLoader.classList.contains("d-none")) {
        containerLoader.classList.remove("d-none");
    } else {
        containerLoader.classList.add("d-none");
    }
}