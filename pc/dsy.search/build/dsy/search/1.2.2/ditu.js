define("dsy/search/1.2.2/ditu",["dsy/search/1.2.2/interface"],function(e,t,s){"use strict";function r(e){var t=/http:\/\/([^\/]+)/i,s=e.match(t);return null!==s&&s.length>0?s[0]:""}function a(){h.call(this),this.tag="ditu",this.suffix="\u5730\u56fe",this.init()}var i=seajs.data.vars,h=e("dsy/search/1.2.2/interface");a.prototype=Object.create(h.prototype),a.prototype.constructor=a,a.prototype.init=function(){this.tpl=["<tr data-key=\"{{search_key}}\" data-search='{{search_object}}'>",'<th><p>{{suggest_word}}&nbsp;<span class="gray9">{{suggest_type}}</span>&nbsp;<span class="gray9">{{suggest_ext}}</span></p></th>',"<td></td>","</tr>"].join(""),this.defaultText=i.searchDefaultText.ditu,this.defaultHref={xf:r(i.searchDefaultHref.xf)+"/house/s/list/",esf:r(i.searchDefaultHref.esf)+"/map/",zf:r(i.searchDefaultHref.zf)+"/map/"},this.historyKey=this.getHistoryKey(this.tag),this.one={}},a.prototype.formatSearch=function(e){return{key:e.key||"",hrefUrl:e.hrefUrl||"",type:e.type||"",ext:e.ext||"",tag:this.tag,suffix:this.suffix}},a.prototype.replaceTpl=function(e){var t=this.tpl;return t=t.replace("{{search_key}}",e.key),t=t.replace("{{search_object}}",JSON.stringify(e)),t=t.replace("{{suggest_word}}",e.key),t=t.replace("{{suggest_type}}",this.typeNick[e.type]),t=t.replace("{{suggest_ext}}",e.ext)},a.prototype.getSuggestHtml=function(e){var t=JSON.parse(e).data,s="";if(this.one={},t&&t.length)for(var r=0;r<t.length;r++){var a=t[r],i=this.formatSearch({key:a.name,type:a.ywType,ext:a.ext});s+=this.replaceTpl(i),1===t.length&&(this.one=i)}this.suggestHtml=s},a.prototype.searchByKey=function(e,t){var s=e,r=t,a=r?r.hrefUrl:"",h=i.userType||["xf","esf"][Math.floor(2*Math.random())];if(r&&(h=r.type),!a)switch(s===this.one.key&&(r=this.one,h=this.one.type),h){case"xf":a=this.defaultHref[h]+(s?"a9"+this.encode(s)+"/":"");break;case"esf":case"zf":a=this.defaultHref[h]+(s?"kw"+encodeURIComponent(s)+"/":"")}a&&(this.openUrl(s,a),r=r||this.formatSearch({key:s,hrefUrl:a,type:h}),this.setHistory(s,r))},s.exports=new a});