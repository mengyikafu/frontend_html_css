$(function() {
    let timing = [5, 10, 10, 10, 10];
    let scope = 0;
    let kamo = document.getElementById("animation_kamo_dom")
    set_kamo_class_add_remove(timing[scope]);

    function set_kamo_class_add_remove(timing_time) {
        setTimeout(function() {
            kamo.classList.add("kamo_anime_start")
            setTimeout(function() {
                kamo.classList.remove("kamo_anime_start")
                scope = (scope <= 5) ? scope + 1 : 1;
                set_kamo_class_add_remove(timing[scope])
            }, 5000)
        }, timing_time * 1000);
    }
})