//　全共通　////////////////////////////////////////////////////////////////////////////////////////
//取得
const header = document.getElementById("shopify-section-header");
const headerhH = document.getElementById("hedstop");
const body = document.querySelector('body')

//高さを取得
const hH = headerhH.clientHeight;
//定義
let pos = 0;
//直前の位置
let lastPos = 0;
let stopclick = "";
let targets = document.getElementsByClassName("product-form__submit");



// navbtn ------------------------------
//ボタン１をクリックした時の処理
let bl = document.getElementsByTagName("body"),
    hbm = document.getElementById('smpNavi')
ch_inp = document.getElementById('hbm1')
button = document.querySelector('#cl_bg_btn');


naviFlg = true;

function btn1Click() {
    if (naviFlg) {
        naviFlg = false;

        bl[0].classList.add("lock");
        hbm.classList.add('selected');
    } else {
        naviFlg = true;
        bl[0].classList.remove('lock');
        hbm.classList.remove('selected');
    }
}


button.addEventListener('click', function(event) {
    naviFlg = true;
    bl[0].classList.remove('lock');
    hbm.classList.remove('selected');
    ch_inp.checked = false;
});


// navbtn ------------------------------
hedFlg = true;
hedFlg2 = true;
let catbtn = document.getElementById('cat'), //category
    hedid = document.getElementById('hedcat'),
    bgover = document.getElementById('modal-overlay-hedbag'),
    catid = document.getElementById('catbox'),
    hedbg = document.getElementById('catbg');





catbtn.addEventListener('click', function() {
    if (hedFlg) {
        hedFlg = false;
        hedid.classList.add('on');
        bgover.classList.add('on');
    } else {
        hedFlg = true;
        hedid.classList.remove('on');
        bgover.classList.remove('on');
    }
});

hedid.addEventListener('mouseover', function() {
    hedid.classList.add('on');
    bgover.classList.add('on');
});
catbtn.addEventListener('mouseover', function() {
    hedid.classList.add('on');
    bgover.classList.add('on');
});
hedid.addEventListener('mouseout', function() {
    hedid.classList.remove('on');
    bgover.classList.remove('on');
});
catbtn.addEventListener('mouseout', function() {
    hedid.classList.remove('on');
    bgover.classList.remove('on');
});
// let tarclass = document.getElementsByClassName("news");

// for(let i = 0; i < targets.length; i++){
//     targets[i].addEventListener("click",() => {
//       header.classList.remove('hed-none');
//     }, false);
//   }


$(function() {

    // cat category ------------------------------
    $("h3.cattitle").click(function() {
        $(this).children("svg").toggleClass("on");
        $(this).parent().next(".inBox").slideToggle(200);
    });
    $(".inBox dl dt").click(function() {
        $(this).children("svg").toggleClass("on");
        $(this).next("dd").slideToggle(200);
    });



    // search ------------------------------
    sFlg = true;
    $(".sb_icon .header__icon").on({
        'click': function() {
            if (sFlg) {
                sFlg = false;
                $("body").addClass("lock");
                $(".sb_icon .header__icon").addClass("on");
                $(".search-modal").fadeIn();
                $(".closeseach").delay(200).fadeIn();
                document.getElementById('Search-In-Modal').focus();

            } else {
                sFlg = true;
                $("body").removeClass("lock");
                $(".sb_icon .header__icon").removeClass("on");
                $(".search-modal").fadeOut();
                $(".closeseach").fadeOut();
            }
        }
    });

    $(".closeseach,.search-modal__close-button,.modal-overlay").click(function() {
        sFlg = true;
        $("body").removeClass("lock");
        $(".sb_icon .header__icon").removeClass("on");
        $(".search-modal").fadeOut();
        $(".closeseach").fadeOut();
    });
});