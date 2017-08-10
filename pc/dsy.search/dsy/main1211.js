/*
 * @file: main
 * @author: yangfan
 * @Create Time: 2016-05-31 15:30:35
 */
define('dsy/main1211', [
    'jquery',
    'dsy/util/1.1.0/util',
    'dsy/util/1.1.2/historyUtil',
    'dsy/search/1.2.1.1/interfaceSearch',
    'dsy/search/1.2.1.1/xfSearch',
    'dsy/search/1.2.1.1/esfSearch',
    'dsy/search/1.2.1.1/zfSearch',
    'dsy/search/1.2.1.1/jiajuSearch',
    'dsy/search/1.2.1.1/kuaixunSearch',
    'dsy/search/1.2.1.1/tejiaSearch',
    'dsy/search/1.2.1.1/fangjiaSearch',
    'dsy/search/1.2.1.1/haiwaiSearch',
    'dsy/search/1.2.1.1/homeSearch'
], function(require) {
    'use strict';
    var $ = require('jquery');

    $.fn.setCursorPosition = function(idx) {
        if (!this.is('input') && !this.is('textarea')) {
            console.log('element is not input or textarea');
            return false;
        }
        var elem = this[0],
            value = this.val();
        var length = value.length;
        var index = idx || length;

        setTimeout(function() {
            // elem.focus();
            if (elem.setSelectionRange) {
                // 标准浏览器
                elem.setSelectionRange(index, index);
            } else {
                // IE9-
                var range = elem.createTextRange();
                range.moveStart('character', -length);
                range.moveEnd('character', -length);
                range.moveStart('character', index);
                range.moveEnd('character', 0);
                range.select();
            }
        }, 10);
        return false;
    };

    var cityName = $('#cityName').val() || $('#dsy_D01_17 .s4Box a').text();
    var seajs = window.seajs;

    var cityCode = window.location.hostname.split('.')[0];

    if (cityCode.substr(0, 3) === 'www') {
        cityCode = 'quanguo';
    }

    seajs.data.vars = {
        requestNumber: window.mxfTimeTag,
        cityCode: window.cityCode || cityCode,
        cityName: cityName,
        sfsf: {
            city: escape(window.SFSF.city),
            url: window.SFSF.info[window.SFSF.city].house.suggest_url + '?t=' + Math.random()
        },
        aHref: $('#pinggu')[0],
        getRequestNumber: function() {
            return window.mxfTimeTag;
        },
        setRequestNumber: function() {
            var nextTimeTag = window.mxfTimeTag + 1;
            window.mxfTimeTag = nextTimeTag;
        },
        getAdvertUrl: function(key) {
            return $('#xinfangList li[id="' + key + '"]').html();
        },
        searchInput: $('#projnames').removeAttr('flag onmousedown onmouseout onmousemove onblur onfocus'),
        searchWrapper: $('#SFmenu'),
        searchButton: $('.sbuttonstyle').removeAttr('onclick'),
        searchNavigate: $('.news02 .s1 a').removeAttr('onmouseover onclick'),
        // 20160708 新需求：添加广告标签
        searchInputAdvertImage: $('#projad'),
        vwg: 'dsy_D02_02',
        localStorage: window.localStorage,
        tejiaCityCode: {
            xf: {
                quanguo: 'bj',
                bj:'bj',
                cd:'cd',
                fz:'fz',
                gz:'gz',
                hz:'hz',
                jn:'jn',
                nc:'nc',
                nanjing:'nanjing',
                nj:'nanjing',
                qd:'qd',
                sh:'sh',
                sz:'sz',
                sy:'sy',
                sjz:'sjz',
                suzhou:'suzhou',
                tj:'tj',
                wuxi:'wuxi',
                wuhan:'wuhan',
                wh:'wuhan',
                xian:'xian',
                cs:'cs',
                zz:'zz',
                cq:'cq',
                cz:'cz',
                dg:'dg',
                fs:'fs',
                hn:'hn',
                hf:'hf',
                huizhou:'huizhou',
                ks:'ks',
                nn:'nn',
                nb:'nb',
                taiyuan:'taiyuan',
                yz:'yz',
                changchun:'changchun'
            },
            esf: {
                quanguo:'bj',
                bj:'bj',
                cd:'cd',
                fz:'fz',
                gz:'gz',
                hz:'hz',
                jn:'jn',
                nc:'nc',
                nanjing:'nanjing', // 给的 excel 是 nj, 测试站 跳转必须是 nanjing 否则404. 测试又扒拉扒了拉
                nj:'nanjing',
                qd:'qd',
                sh:'sh',
                sz:'sz',
                sy:'sy',
                sjz:'sjz',
                suzhou:'suzhou',
                tj:'tj',
                wuxi:'wuxi',
                wuhan:'wuhan',
                wh:'wuhan',
                xian:'xian',
                cs:'cs',
                zz:'zz',
                cq:'cq'
            },
            zf: {
                quanguo:'bj',
                bj:'bj',
                cd:'cd',
                gz:'gz',
                hz:'hz',
                nanjing:'nanjing',
                nj:'nanjing',
                sh:'sh',
                sz:'sz',
                suzhou:'suzhou',
                tj:'tj',
                wuhan:'wuhan',
                wh:'wuhan',
                cq:'cq'
            }
        }
    };

    var ie = (function() {
        var userAgent = navigator.userAgent;
        var ua = userAgent.toLowerCase();
        var rMsie = /(msie\s|trident\/7)([\w.]+)/;
        var rTrident = /(trident)\/([\w.]+)/;
        var matchBS = rMsie.exec(ua);
        if (matchBS !== null) {
            var matchBS2 = rTrident.exec(ua);
            if (matchBS2 !== null) {
                switch (matchBS2[2]) {
                    case '4.0':
                        return { browser: 'IE', version: '8' };
                        break;
                    case '5.0':
                        return { browser: 'IE', version: '9' };
                        break;
                    case '6.0':
                        return { browser: 'IE', version: '10' };
                        break;
                    case '7.0':
                        return { browser: 'IE', version: '11' };
                        break;
                    default:
                        return { browser: 'IE', version: 'undefined' };
                }
            } else
                return { browser: 'IE', version: matchBS[2] || '0' };
        }
    })();
    if (ie && ie.version - 0 > 9) {
        var n = document.createElement('style'),
            str = '::-ms-clear, ::-ms-reveal{display: none;}';
        n.type = 'text/css';
        if (n.styleSheet) {
            n.styleSheet.cssText = str;
        } else {
            n.innerHTML = str;
        }
        document.getElementsByTagName('head')[0].appendChild(n);
    }

    var Search = require('dsy/search/1.2.1.1/homeSearch') || {};
    Search.dropdown = function(html) {
        window.SFSF.makeMenu.apply(window.SFSF, [$('#projnames')[0], window.SFSF.menu, html]);
        $('#SFmenu').find('table').width($('#SFmenu').find('.paneltable').width());
    };
    Search.init();

    _ub.city = cityName;
    _ub.request('vwg.business', function() {
        _ub.load(2);
        var vwg = _ub['vwg.business'];
        if (vwg) {
            vwg = {
                N: 'dsy_D02_02',
                E: 'dsy_D02_03',
                Z: 'dsy_D02_04',
                H: 'dsy_D02_05',
                I: 'dsy_D02_06',
                W: 'dsy_D02_20',
                V: 'dsy_D02_19'
            }[vwg];
        } else {
            vwg = 'dsy_D02_19';
        }
        // 初始化 searchTag
        Search.vwgCallback(vwg);
    });


});