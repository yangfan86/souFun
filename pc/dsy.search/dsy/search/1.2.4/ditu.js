/*
 * @file: 地图找房搜索
 * @author: yangfan
 * @Create Time: 2016-07-01 09:50:39
 */
define('dsy/search/1.2.4/ditu', [
    'jquery',
    'dsy/search/1.2.4/interface'
], function (require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var vars = seajs.data.vars;
    var Search = require('dsy/search/1.2.4/interface');

    function getHttp(url) {
        var urlReg = /http:\/\/([^\/]+)/i;
        var domain = url.match(urlReg);
        return domain !== null && domain.length > 0 ? domain[0] : '';
    }

    function DituSearch() {
        Search.call(this);
        this.tag = 'ditu';
        this.suffix = '地图';
        this.init();
    }

    $.extend(DituSearch.prototype, new Search());

    // DituSearch.prototype = Object.create(Search.prototype);
    // DituSearch.prototype.constructor = DituSearch;

    DituSearch.prototype.init = function () {
        this.tpl = [
            '<tr data-key="{{search_key}}" data-search=\'{{search_object}}\'>',
            '<th><p>{{suggest_word}}&nbsp;<span class="gray9">{{suggest_type}}</span>&nbsp;<span class="gray9">{{suggest_ext}}</span></p></th>',
            '<td></td>',
            '</tr>'
        ].join('');
        this.defaultText = vars.searchDefaultText.ditu;

        this.defaultHref = {
            xf: getHttp(vars.searchDefaultHref.xf) + '/house/s/list/',
            esf: getHttp(vars.searchDefaultHref.esf) + '/map/',
            zf: getHttp(vars.searchDefaultHref.zf) + '/map/'
        };

        this.historyKey = this.getHistoryKey(this.tag);
        this.one = {};
    };

    DituSearch.prototype.formatSearch = function (opts) {
        return {
            // 搜索词
            key: opts.key || '',
            // 搜索跳转 url
            hrefUrl: opts.hrefUrl || '',
            type: opts.type || '',
            // 扩展字段
            ext: opts.ext || '',
            tag: this.tag,
            suffix: this.suffix
        };
    };

    DituSearch.prototype.replaceTpl = function (obj) {

        var tpl = this.tpl;

        tpl = tpl.replace('{{search_key}}', obj.key);
        tpl = tpl.replace('{{search_object}}', JSON.stringify(obj));
        tpl = tpl.replace('{{suggest_word}}', obj.key);

        tpl = tpl.replace('{{suggest_type}}', this.typeNick[obj.type]);
        tpl = tpl.replace('{{suggest_ext}}', obj.ext);
        return tpl;
    };

    DituSearch.prototype.getSuggestHtml = function (res) {
        var rows = JSON.parse(res).data,
            html = '';

        this.one = {};

        if (rows && rows.length) {
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                var obj = this.formatSearch({
                    key: row.name,
                    type: row.ywType,
                    ext: row.ext
                });

                html += this.replaceTpl(obj);

                if (rows.length === 1) {
                    this.one = obj;
                }
            }
        }

        this.suggestHtml = html;
    };

    // window.clickZhaozufang(e);
    DituSearch.prototype.searchByKey = function (pKey, pData) {
        var key = pKey,
            data = pData;

        // 点击历史记录
        var url = data ? data.hrefUrl : '';

        // 默认：新房、二手房随机一个，如果不是点击下拉列表情况，根据用户身份跳转
        var type = vars.userType || ['xf', 'esf'][Math.floor(Math.random() * 2)];
        if (data) {
            type = data.type;
        }

        // 点击列表或直接搜索
        if (!url) {
            if (key === this.one.key) {
                data = this.one;
                type = this.one.type;
            }

            switch (type) {
                case 'xf':
                    url = this.defaultHref[type] + (key ? 'a9' + this.encode(key) + '/' : '');
                    break;
                case 'esf':
                case 'zf':
                    url = this.defaultHref[type] + (key ? 'kw' + encodeURIComponent(key) + '/' : '');
                    break;
            }
        }

        // 生成正确的跳转 url
        if (url) {
            this.openUrl(key, url);
            // 直接进行回车的时候，没有 data 传进来

            data = data || this.formatSearch({
                key: key,
                hrefUrl: url,
                type: type
            });

            this.setHistory(key, data);
        }
    };

    module.exports = new DituSearch();
});