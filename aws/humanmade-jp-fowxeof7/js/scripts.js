(function() {
    var __sections__ = {};
    (function() {
        for (var i = 0, s = document.getElementById('sections-script').getAttribute('data-sections').split(','); i < s.length; i++)
            __sections__[s[i]] = true;
    })();
    (function() {
        if (!__sections__["cart-collection"] && !window.DesignMode) return;
        try {

            var cart = JSON.parse(document.getElementById('cartId').innerHTML);
            var count = 0;
            var recommendHead = $('#recommend-head');
            var productStr = "";
            var cartIdList = new Array();
            var recommendStr = "";
            if (cart != '') {
                cart.forEach(function(item) {
                    productStr = productStr + "product_id=" + item.product_id + "&";
                    cartIdList.push(item.product_id);
                })

                fetch(`${window.Shopify.routes.root}recommendations/products.json?` + productStr)
                    .then(response => response.json())
                    .then((res) => {
                        for (var rec of res.products) {
                            if (count >= 4) {
                                break;
                            }
                            if (cartIdList.indexOf(rec.id) < 0) {
                                if (count == 0) {
                                    recommendStr = rec.id;
                                } else {
                                    recommendStr = recommendStr + ' OR id:' + rec.id;
                                }
                                count = count + 1;
                            }
                        }

                        if (recommendStr !== '') {
                            var getHtmlStr = `${window.Shopify.routes.root}search?type=product&q=id:` + recommendStr;
                            $.ajax({
                                    url: getHtmlStr,
                                    dataType: 'html',
                                })
                                .done(function(data) {
                                    var t = $(data).find('#ProductGridContainer');
                                    recommendHead.after(t);
                                })
                                .fail(function(data) {
                                    console.error(error)
                                });
                        }
                    })
                    .catch(error => console.error(error))
            }

        } catch (e) {
            console.error(e);
        }
    })();

    (function() {
        if (!__sections__["featured-product"] && !window.DesignMode) return;
        try {

            if (!customElements.get('product-modal')) {
                customElements.define('product-modal', class ProductModal extends ModalDialog {
                    constructor() {
                        super();
                    }

                    hide() {
                        super.hide();
                    }

                    show(opener) {
                        super.show(opener);
                        this.showActiveMedia();
                    }

                    showActiveMedia() {
                        this.querySelectorAll(`[data-media-id]:not([data-media-id="${this.openedBy.getAttribute("data-media-id")}"])`).forEach((element) => {
                            element.classList.remove('active');
                        })
                        const activeMedia = this.querySelector(`[data-media-id="${this.openedBy.getAttribute("data-media-id")}"]`);
                        const activeMediaTemplate = activeMedia.querySelector('template');
                        const activeMediaContent = activeMediaTemplate ? activeMediaTemplate.content : null;
                        activeMedia.classList.add('active');
                        activeMedia.scrollIntoView();

                        const container = this.querySelector('[role="document"]');
                        container.scrollLeft = (activeMedia.width - container.clientWidth) / 2;

                        if (activeMedia.nodeName == 'DEFERRED-MEDIA' && activeMediaContent && activeMediaContent.querySelector('.js-youtube'))
                            activeMedia.loadContent();
                    }
                });
            }

        } catch (e) {
            console.error(e);
        }
    })();

    (function() {
        if (!__sections__["footer"]) return;
        try {


            class LocalizationForm extends HTMLElement {
                constructor() {
                    super();
                    this.elements = {
                        input: this.querySelector('input[name="locale_code"], input[name="country_code"]'),
                        button: this.querySelector('button'),
                        panel: this.querySelector('.disclosure__list-wrapper'),
                    };
                    this.elements.button.addEventListener('click', this.openSelector.bind(this));
                    this.elements.button.addEventListener('focusout', this.closeSelector.bind(this));
                    this.addEventListener('keyup', this.onContainerKeyUp.bind(this));

                    this.querySelectorAll('a').forEach(item => item.addEventListener('click', this.onItemClick.bind(this)));
                }

                hidePanel() {
                    this.elements.button.setAttribute('aria-expanded', 'false');
                    this.elements.panel.setAttribute('hidden', true);
                }

                onContainerKeyUp(event) {
                    if (event.code.toUpperCase() !== 'ESCAPE') return;

                    this.hidePanel();
                    this.elements.button.focus();
                }

                onItemClick(event) {
                    event.preventDefault();
                    const form = this.querySelector('form');
                    this.elements.input.value = event.currentTarget.dataset.value;
                    if (form) form.submit();
                }

                openSelector() {
                    this.elements.button.focus();
                    this.elements.panel.toggleAttribute('hidden');
                    this.elements.button.setAttribute('aria-expanded', (this.elements.button.getAttribute('aria-expanded') === 'false').toString());
                }

                closeSelector(event) {
                    const shouldClose = event.relatedTarget && event.relatedTarget.nodeName === 'BUTTON';
                    if (event.relatedTarget === null || shouldClose) {
                        this.hidePanel();
                    }
                }
            }

            customElements.define('localization-form', LocalizationForm);

        } catch (e) {
            console.error(e);
        }
    })();

    (function() {
        if (!__sections__["header"]) return;
        try {

            class StickyHeader extends HTMLElement {
                constructor() {
                    super();
                }

                connectedCallback() {
                    this.header = document.getElementById('shopify-section-header');
                    this.headerBounds = {};
                    this.currentScrollTop = 0;
                    this.preventReveal = false;
                    this.predictiveSearch = this.querySelector('predictive-search');

                    this.onScrollHandler = this.onScroll.bind(this);
                    this.hideHeaderOnScrollUp = () => this.preventReveal = true;

                    this.addEventListener('preventHeaderReveal', this.hideHeaderOnScrollUp);
                    window.addEventListener('scroll', this.onScrollHandler, false);

                    this.createObserver();
                }

                disconnectedCallback() {
                    this.removeEventListener('preventHeaderReveal', this.hideHeaderOnScrollUp);
                    window.removeEventListener('scroll', this.onScrollHandler);
                }

                createObserver() {
                    let observer = new IntersectionObserver((entries, observer) => {
                        this.headerBounds = entries[0].intersectionRect;
                        observer.disconnect();
                    });

                    observer.observe(this.header);
                }

                onScroll() {
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

                    if (this.predictiveSearch && this.predictiveSearch.isOpen) return;

                    if (scrollTop > this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
                        requestAnimationFrame(this.hide.bind(this));
                    } else if (scrollTop < this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
                        if (!this.preventReveal) {
                            requestAnimationFrame(this.reveal.bind(this));
                        } else {
                            window.clearTimeout(this.isScrolling);

                            this.isScrolling = setTimeout(() => {
                                this.preventReveal = false;
                            }, 66);

                            requestAnimationFrame(this.hide.bind(this));
                        }
                    } else if (scrollTop <= this.headerBounds.top) {
                        requestAnimationFrame(this.reset.bind(this));
                    }


                    this.currentScrollTop = scrollTop;
                }

                hide() {
                    this.header.classList.add('shopify-section-header-hidden', 'shopify-section-header-sticky');
                    this.closeMenuDisclosure();

                }

                reveal() {
                    this.header.classList.add('shopify-section-header-sticky', 'animate');
                    this.header.classList.remove('shopify-section-header-hidden');
                }

                reset() {
                    this.header.classList.remove('shopify-section-header-hidden', 'shopify-section-header-sticky', 'animate');
                }

                closeMenuDisclosure() {
                    this.disclosures = this.disclosures || this.header.querySelectorAll('details-disclosure');
                    this.disclosures.forEach(disclosure => disclosure.close());
                }


            }
            customElements.define('sticky-header', StickyHeader);


            class LangSwitcher extends HTMLElement {
                constructor() {
                    super();
                    this.langSelect = this.querySelector('.lang-switch');
                    this.wovnLangSwitcher = this.querySelector('.wovn-languages');
                    this.langSelect.addEventListener('change', this.switch.bind(this));
                    this.init()
                }

                init() {
                    window.addEventListener('wovnApiReady', function(evt) {
                        const selectLang = WOVN.io.getCurrentLang()
                        document.querySelector('.lang-switch option[value="' + selectLang.code + '"]').selected = true;
                    });
                    window.addEventListener('wovnLangChanged', function(evt) {
                        this.lang = WOVN.io.getCurrentLang().code;
                        switch (this.lang) {
                            case "zh-CHS":
                                this.lang = "zh-CN"
                                break;
                            case "zh-CHT":
                                this.lang = "zh-TW"
                                break;
                        }
                        const directCheckout = document.getElementById('cart-notification-form')
                        if (directCheckout && this.lang != "ja") directCheckout.action = "/cart?locale=" + this.lang;
                    });
                }

                switch (event) {
                    event.preventDefault();
                    const selectLang = this.langSelect.value
                    WOVN.io.changeLang(selectLang)
                    window.dispatchEvent(new Event('wovnLangChanged'))
                }
            }

            customElements.define('lang-switch-ele', LangSwitcher);


        } catch (e) {
            console.error(e);
        }
    })();

    (function() {
        if (!__sections__["lookbook"] && !window.DesignMode) return;
        try {

            $(function() {
                $(".lookbox .clobtn").click(function() {
                    $(this).parents(".lookbox").toggleClass("on");
                    $(this).next(".txtbox").slideToggle(200);
                });
                $(window).on("scroll", function() {
                    const trigger = $('.swsc');

                    $(trigger).each(function() {
                        let scroll = $(window).scrollTop();
                        let windowHeight = $(window).height();
                        let triggerTop = $(this).offset().top;

                        if (scroll > triggerTop - windowHeight / 1.5) {
                            $(this).addClass("show");
                        };
                    });
                });
                $(window).trigger("scroll")
            });

        } catch (e) {
            console.error(e);
        }
    })();

    (function() {
        if (!__sections__["main-cart-footer"]) return;
        try {

            class CartNote extends HTMLElement {
                constructor() {
                    super();

                    this.addEventListener('change', debounce((event) => {
                        const body = JSON.stringify({
                            note: event.target.value
                        });
                        fetch(`${routes.cart_update_url}`, {
                            ...fetchConfig(),
                            ...{
                                body
                            }
                        });
                    }, 300))
                }
            }

            customElements.define('cart-note', CartNote);


            document.addEventListener('DOMContentLoaded', () => {
                chs.init({
                    form: document.getElementById('cart')
                })
            })
            /**
             * 言語に合わせてform action変更
             **/
            const chs = {
                lang: "ja",

                init: (config) => {
                    chs.form = config.form
                    window.addEventListener('wovnApiReady', chs.setLocal);
                    window.addEventListener('wovnLangChanged', chs.setLocal);
                },

                setLocal: () => {
                    chs.lang = WOVN.io.getCurrentLang().code;
                    switch (chs.lang) {
                        case "zh-CHS":
                            chs.lang = "zh-CN"
                            break;
                        case "zh-CHT":
                            chs.lang = "zh-TW"
                            break;
                    }
                    if (chs.lang != "ja") {
                        chs.form.action = "/cart?locale=" + chs.lang;
                    } else {
                        chs.form.action = "/cart";
                    }
                }
            }

        } catch (e) {
            console.error(e);
        }
    })();

    (function() {
        if (!__sections__["main-product"]) return;
        try {


            class ProductModal extends ModalDialog {
                constructor() {
                    super();
                }

                hide() {
                    super.hide();
                }

                show(opener) {
                    super.show(opener);
                    this.showActiveMedia();
                }

                showActiveMedia() {
                    this.querySelectorAll(`[data-media-id]:not([data-media-id="${this.openedBy.getAttribute("data-media-id")}"])`).forEach((element) => {
                        element.classList.remove('active');
                    })
                    const activeMedia = this.querySelector(`[data-media-id="${this.openedBy.getAttribute("data-media-id")}"]`);
                    const activeMediaTemplate = activeMedia.querySelector('template');
                    const activeMediaContent = activeMediaTemplate ? activeMediaTemplate.content : null;
                    activeMedia.classList.add('active');
                    activeMedia.scrollIntoView();

                    const container = this.querySelector('[role="document"]');
                    container.scrollLeft = (activeMedia.width - container.clientWidth) / 2;
                    if (activeMedia.nodeName == 'DEFERRED-MEDIA' && activeMediaContent && activeMediaContent.querySelector('.js-youtube'))
                        activeMedia.loadContent();
                }
            }

            if (!customElements.get('product-modal')) customElements.define('product-modal', ProductModal);


            document.addEventListener('DOMContentLoaded', () => {
                dpp.init({
                    mediaWrapperElement: document.querySelector('.product__media-wrapper'),
                    slideElement: document.querySelector('.mySwiper'),
                    contentElement: document.getElementById('product__info'),
                    headerElement: document.getElementById('shopify-section-header')
                })
                $(".product__media-wrapper").addClass("on");
                $(".product__info-wrapper").delay(300).queue(function() {
                    $(this).addClass("on");
                });
            })

            const dpp = {
                isSp: false,
                mediaWrapperElement: null,
                slideElement: null,
                contentElement: null,
                headerElement: null,
                start_pos: 0,
                window_height: window.innerHeight,
                is_touching: !1,
                is_scrolling: !1,
                touch_point_count: 0,
                touch_start_y: 0,
                slide: null,

                init: (config) => {
                    dpp.isSp = (window.innerWidth < 750) ? true : false,
                        dpp.mediaWrapperElement = config.mediaWrapperElement
                    dpp.slideElement = config.slideElement
                    dpp.contentElement = config.contentElement
                    dpp.headerElement = config.headerElement
                    if (dpp.isSp) {
                        dpp.createSlide()
                        dpp.slide.on('touchMove', dpp.slideElementOnScroll)
                        dpp.mediaWrapperElement.querySelector(".product__media-gallery").addEventListener("updateMedia", dpp.updateMedia);
                    }
                },

                slideElementOnScroll: (e) => {
                    /*if (e.swipeDirection == "next") {
                      //down
                      document.getElementById("shopify-section-header").classList.add("shopify-section-header-hidden", "hed-none")
                    }else{
                      //up
                      document.getElementById("shopify-section-header").classList.remove("shopify-section-header-hidden", "hed-none")
                    }*/
                },

                createSlide: () => {
                    let initialSlideNumber = 0;
                    let initialSlide = dpp.slideElement.getAttribute("data-wiper_initial_slide")
                    if (initialSlide != null) {
                        // 番号を知りたい要素
                        let initialElement = document.getElementById(`SpSlide-` + initialSlide)
                        // その li は ul の何番目にありますか？
                        initialSlideNumber = [].indexOf.call(dpp.slideElement.querySelectorAll(".swiper-slide"), initialElement)
                    }

                    dpp.slide = new Swiper(dpp.slideElement, {
                        direction: "vertical",
                        touchReleaseOnEdges: true,
                        loop: false,
                        mousewheel: true,
                        initialSlide: (initialSlideNumber > 0) ? initialSlideNumber : 0,
                        zoom: {
                            enabled: true
                        },
                        pagination: {
                            el: '.swiper-pagination',
                            type: 'bullets',
                            clickable: true,
                        },
                        on: {
                            init: function() {
                                $(".mySwiper").addClass("on");
                                console.log('images ready');
                            },
                        }
                    });

                    //console.log(dpp.mediaWrapperElement)
                    //dpp.contentElement.style.marginTop = dpp.mediaWrapperElement.scrollTop+dpp.mediaWrapperElement.clientHeight
                },

                resize: () => {
                    if (!isSp && dpp.slide != null) {
                        dpp.slide.destroy(false, true)
                    } else if (isSp && dpp.slide == null) {
                        createSlide();
                    }
                },

                updateMedia(e) {
                    // $("html,body").animate({scrollTop:0},400);
                    // 番号を知りたい要素
                    var element = document.getElementById(`SpSlide-` + e.detail.media_id);
                    dpp.mediaWrapperElement.querySelector(".product__media-gallery").addEventListener("updateMedia", dpp.updateMedia);
                    // その li は ul の何番目にありますか？
                    var count = [].indexOf.call(element.parentNode.children, element) - 1;
                    dpp.slide.slideTo(count, 0)

                }
            }

            beforSelling();

            function beforSelling() {
                var alcohol = JSON.parse(document.getElementById('ProductJsonData').innerHTML);
                var booking = JSON.parse(document.getElementById('booking').innerHTML);
                var check_alcohol = $('#check_alcohol').text();
                var check_booking = $('#check_booking').text();
                var show = $('#show').text();
                var nomalbtn = $('#nomalbtn');
                var btnMsg = $('#btn_msg');
                var alcoholCartBtn = $('#alcohol-cart-btn');
                var alcoholDisableBox = $('#alcohol-disable-box');
                var notBuyBtn = $('#notBuyBtn');
                var soldoutBadge = $('#soldoutBadge');
                var startDate = (document.getElementById('StartJsonData').innerHTML).replace(/\s+/g, "");
                var start = new Date(startDate);
                var endDate = (document.getElementById('EndJsonData').innerHTML).replace(/\s+/g, "");
                var end = new Date(endDate);
                var preStartDate = (document.getElementById('PreStartJsonData').innerHTML).replace(/\s+/g, "");
                var preStart = new Date(preStartDate);
                var preEndDate = (document.getElementById('PreEndJsonData').innerHTML).replace(/\s+/g, "");
                var preEnd = new Date(preEndDate);
                var today = new Date();
                //var buy_limit = JSON.parse(document.getElementById('buyLimit').innerHTML);
                var special = JSON.parse(document.getElementById('UserJsonData').innerHTML);
                var LimitJsonData = parseInt(JSON.parse(document.getElementById('LimitJsonData').innerHTML));

                var publicDate = (document.getElementById('PublicDateJsonData').innerHTML).replace(/\s+/g, "");
                var year = publicDate.substring(0, publicDate.indexOf('年'));
                var month = publicDate.substring(publicDate.indexOf('年') + 1, publicDate.indexOf('月'));
                var day = publicDate.substring(publicDate.indexOf('月') + 1, publicDate.indexOf('日'));
                var public = new Date(year, month, day);
                public.setMonth(public.getMonth() - 1);
                var coming = false;
                var CheckPreSaleFlg = false;
                var CheckSaleFlg = false;
                if (special) {
                    if ((today >= preStart && today <= preEnd) || (today >= preStart && today < start && preEndDate == '') ||
                        (today >= preStart && today <= end && preEndDate == '') || (today >= preStart && preEndDate == '' && startDate == '' && endDate == '') ||
                        (preStartDate == '' && today <= preEnd)) {
                        CheckPreSaleFlg = true;
                    } else if (today < preStart) {
                        coming = true;
                    }
                } else if (today < preStart || today > preStart && preEndDate == '' && startDate == '' && endDate == '' ||
                    today <= preEnd && preStartDate == '') {
                    coming = true;
                }

                if (CheckPreSaleFlg == false) {
                    if ((start <= today && end >= today) || (start <= today && endDate == '') || (today <= end && preEnd <= today && startDate == '') ||
                        (today <= end && preStartDate == '' && preEndDate == '' && startDate == '') ||
                        (endDate == '' && preStartDate == '' && preEndDate == '' && startDate == '')) {
                        CheckSaleFlg = true;
                    } else if (today < start) {
                        coming = true;
                    }
                }

                if (CheckPreSaleFlg || CheckSaleFlg) {
                    if (show === 'true') {
                        if (alcohol) {
                            alcoholCartBtn.css('display', 'flex');
                        } else {
                            nomalbtn.css('display', 'block');
                        }
                    } else {
                        if (check_alcohol === 'true' || check_booking === 'true') {
                            alcoholDisableBox.css('display', 'block');
                        }
                    }
                    notBuyBtn.css('display', 'none');
                } else {
                    if (coming) {
                        soldoutBadge.css('display', 'none');

                        btnMsg.text(theme.strings.coming_soon);
                    } else {
                        btnMsg.text(theme.strings.end_of_sales);
                    }
                    alcoholDisableBox.css('display', 'none');
                    alcoholCartBtn.css('display', 'none');
                    nomalbtn.css('display', 'none');
                    notBuyBtn.css('display', 'block');
                }

                //先行販売バッチ
                if (CheckPreSaleFlg) {
                    if (!$('li').hasClass('pre-sale')) {
                        $('.tags-list').append('<li class="pre-sale">先行販売</li>');
                    }
                } else {
                    $('.pre-sale').css('display', 'none');
                }

                //option表示数
                if (!Number.isNaN(LimitJsonData) || CheckPreSaleFlg) {
                    $('.preOption').css('display', 'none');
                }
            }

            var scrollPosition;
            $('.alcohol-cart-btn').on('click', function() {
                scrollPosition = $(window).scrollTop();
                $('body').addClass('fixed').css({
                    'top': -scrollPosition
                });
                $('.overlay-alcohol').show();
            });

            $('.no-btn').on('click', function() {
                $('body').removeClass('fixed').css({
                    'top': 0
                });
                window.scrollTo(0, scrollPosition);
                $('.overlay-alcohol').hide();
            });

            /*PC向けのコンテンツ部分スクロール制御*/
            //スクロール量
            var x = window.pageXOffset;
            var y = window.pageYOffset;

            //ウィンドウサイズ
            var whH = document.documentElement.clientHeight;

            //テキスト取得
            var txtareahH = document.getElementById("product__info"); // テキスト
            var photohH = document.getElementById("photoBox"); // 写真エリア
            var boxH = document.getElementById("sti-box"); // ボックス

            //高さを取得
            var hH1 = txtareahH.children[0].clientHeight; //テキストエリア
            var hH2 = photohH.clientHeight;
            var hH3 = boxH.getBoundingClientRect().top + y; //上からの位置

            var allpHh = hH3 + hH1 - whH + 100; //テキストエリアのスクロール量を計算
            var maxscb = hH2 - hH1 + hH3;

            var start_pos = 0;

            var posstayUP = 0;
            var posstayDown = 0;
            var areaSw = true;
            var udSw;
            var upSc = 0;
            var downSc = 0;
            var areaOut;
            var lastupSc = 0;


            if (hH1 > hH2) {
                document.getElementById('sti-box').classList.remove('product__contaner--sticky');
            } else {

                window.addEventListener('scroll', function(e) {
                    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    var current_pos = scrollTop;

                    if (maxscb > scrollTop) { //下限　下過ぎると行かないように
                        areaSw = true;
                    } else {
                        areaSw = false;
                    }

                    if (current_pos > start_pos) {
                        downSc = 0; //UPスクロール量をリセット
                        posstayUP = current_pos;

                        downSc = posstayDown - scrollTop;
                        downScPl = Math.abs(downSc);

                        //スクロールダウンでエリア外に出るかでないか
                        if (areaSw) {
                            areaOut = false;
                        } else {
                            areaOut = true;
                        }

                        //必要スクロール量
                        if (udSw) {
                            if (allpHh > downScPl) {
                                document.getElementById('product__info').children[0].style.transform = "translateY(" + (lastupSc - downScPl) + "px)";
                            }
                        }

                    } else {
                        //up
                        posstayDown = current_pos;
                        //DOWN時にエリア外に出ていたか
                        if (areaOut) {
                            //エリア外に出てた場合
                            if (areaSw) {
                                //エリアに入ったら実行
                                upSc = maxscb - scrollTop;
                            }
                        } else {
                            //エリア内限定
                            upSc = posstayUP - scrollTop;
                        }

                        if (allpHh > upSc) { //必要スクロール量
                            document.getElementById('product__info').children[0].style.transform = "translateY(" + upSc + "px)";
                            lastupSc = upSc;
                            udSw = true;
                        }

                        //上部到達時
                        if (scrollTop < lastupSc) {
                            udSw = false;
                            lastopsc = lastupSc - (-scrollTop + lastupSc); //セット位置からのスクロール量を計算
                            document.getElementById('product__info').children[0].style.transform = "translateY(" + lastopsc + "px)";
                        }
                    }
                    start_pos = current_pos;
                });
            };


            window.addEventListener('resize', function(e) {
                var hH1r = txtareahH.children[0].clientHeight; //テキストエリア
                var hH2r = photohH.clientHeight;
                if (hH1r > hH2r) {
                    document.getElementById('sti-box').classList.remove('product__contaner--sticky');
                }
            });
            if (maximgnum == 0) {
                document.getElementById('sti-box').classList.remove('product__contaner--sticky');
            }



        } catch (e) {
            console.error(e);
        }
    })();

    (function() {
        if (!__sections__["product-recommendations"]) return;
        try {

            class ProductRecommendations extends HTMLElement {
                constructor() {
                    super();

                    const handleIntersection = (entries, observer) => {
                        if (!entries[0].isIntersecting) return;
                        observer.unobserve(this);

                        fetch(this.dataset.url)
                            .then(response => response.text())
                            .then(text => {
                                const html = document.createElement('div');
                                html.innerHTML = text;
                                const recommendations = html.querySelector('product-recommendations');

                                if (recommendations && recommendations.innerHTML.trim().length) {
                                    this.innerHTML = recommendations.innerHTML;
                                }

                                if (html.querySelector('.grid__item')) {
                                    this.classList.add('product-recommendations--loaded');
                                }
                            })
                            .catch(e => {
                                console.error(e);
                            });
                    }

                    new IntersectionObserver(handleIntersection.bind(this), {
                        rootMargin: '0px 0px 200px 0px'
                    }).observe(this);
                }
            }

            customElements.define('product-recommendations', ProductRecommendations);

        } catch (e) {
            console.error(e);
        }
    })();

})();