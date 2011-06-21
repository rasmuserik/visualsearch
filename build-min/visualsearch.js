/*
 VisualSearch.js 0.1.0
 (c) 2011 Samuel Clay, @samuelclay, DocumentCloud Inc.
 VisualSearch.js may be freely distributed under the MIT license.
 For all details and documentation:
 http://documentcloud.github.com/visualsearch
*/
(function(){var c=jQuery;if(!window.VS)window.VS={};if(!VS.app)VS.app={};if(!VS.ui)VS.ui={};if(!VS.model)VS.model={};if(!VS.utils)VS.utils={};VS.VERSION="0.1.0";VS.init=function(a){var b={container:"",query:"",unquotable:[],callbacks:{search:c.noop,focus:c.noop,categoryMatches:c.noop,facetMatches:c.noop}};VS.options=_.extend({},b,a);VS.options.callbacks=_.extend({},b.callbacks,a.callbacks);VS.app.hotkeys.initialize();VS.app.searchQuery=new VS.model.SearchQuery;VS.app.searchBox=new VS.ui.SearchBox(a);
if(a.container){b=VS.app.searchBox.render().el;c(a.container).html(b)}VS.app.searchBox.value(a.query||"");c(window).bind("unload",function(){});return VS.app.searchBox}})();
(function(){var c=jQuery;VS.ui.SearchBox=Backbone.View.extend({id:"search",events:{"click .VS-cancel-search-box":"clearSearch","mousedown .VS-search-box":"focusSearch","dblclick .VS-search-box":"highlightSearch","click .VS-search-box":"maybeTripleClick"},initialize:function(){this.flags={allSelected:false};this.facetViews=[];this.inputViews=[];_.bindAll(this,"renderFacets","_maybeDisableFacets","disableFacets");VS.app.searchQuery.bind("refresh",this.renderFacets);c(document).bind("keydown",this._maybeDisableFacets)},
render:function(){c(this.el).append(JST.search_box({}));c(document.body).setMode("no","search");return this},value:function(a){if(a==null)return this.getQuery();return this.setQuery(a)},getQuery:function(){var a=[],b=this.inputViews.length;VS.app.searchQuery.each(_.bind(function(d,e){a.push(this.inputViews[e].value());a.push(d.serialize())},this));b&&a.push(this.inputViews[b-1].value());return _.compact(a).join(" ")},setQuery:function(a){this.currentQuery=a;VS.app.SearchParser.parse(a);this.clearInputs()},
viewPosition:function(a){a=_.indexOf(a.type=="facet"?this.facetViews:this.inputViews,a);if(a==-1)a=0;return a},searchEvent:function(){var a=this.value();this.focusSearch();VS.options.callbacks.search(a)!==false&&this.value(a)},addFacet:function(a,b,d){a=VS.utils.inflector.trim(a);b=VS.utils.inflector.trim(b||"");if(a){var e=new VS.model.SearchFacet({category:a,value:b||""});VS.app.searchQuery.add(e,{at:d});this.renderFacets();_.detect(this.facetViews,function(f){if(f.model==e)return true}).enableEdit()}},
renderFacets:function(){this.facetViews=[];this.inputViews=[];this.$(".search_inner").empty();VS.app.searchQuery.each(_.bind(function(a,b){this.renderFacet(a,b)},this));this.renderSearchInput()},renderFacet:function(a,b){var d=new VS.ui.SearchFacet({model:a,order:b});this.renderSearchInput();this.facetViews.push(d);this.$(".search_inner").children().eq(b*2).after(d.render().el);d.calculateSize();_.defer(_.bind(d.calculateSize,d));return d},renderSearchInput:function(){var a=new VS.ui.SearchInput({position:this.inputViews.length});
this.$(".search_inner").append(a.render().el);this.inputViews.push(a)},clearSearch:function(a){this.value("");this.flags.allSelected=false;this.focusSearch(a)},clearInputs:function(){_.each(this.inputViews,function(a){a.clear()})},selectAllFacets:function(){this.flags.allSelected=true;_.each(this.facetViews,function(a){a.selectFacet()});_.each(this.inputViews,function(a){a.selectText()});c(document).one("click.selectAllFacets",this.disableFacets)},allSelected:function(a){if(a)this.flags.allSelected=
false;return this.flags.allSelected},disableFacets:function(a){_.each(this.inputViews,function(b){if(b!=a&&(b.modes.editing=="is"||b.modes.selected=="is"))b.blur()});_.each(this.facetViews,function(b){if(b!=a&&(b.modes.editing=="is"||b.modes.selected=="is")){b.disableEdit();b.deselectFacet()}});this.flags.allSelected=false;this.removeFocus();c(document).unbind("click.selectAllFacets")},resizeFacets:function(a){_.each(this.facetViews,function(b){if(!a||b==a)b.resize()})},_maybeDisableFacets:function(a){if(this.flags.allSelected&&
VS.app.hotkeys.key(a)=="backspace"){a.preventDefault();this.clearSearch(a);return false}else this.flags.allSelected&&VS.app.hotkeys.printable(a)&&this.clearSearch(a)},focusNextFacet:function(a,b,d){d=d||{};var e=this.facetViews.length,f=d.viewPosition||this.viewPosition(a);if(d.skipToFacet){if(d.skipToFacet&&a.type=="text"&&e==f&&b>=0)b=f=0}else{if(a.type=="text"&&b>0)b-=1;if(a.type=="facet"&&b<0)b+=1}var g;f=Math.min(e,f+b);if(a.type=="text"&&f>=0&&f<e){g=this.facetViews[f];if(d.selectFacet)g.selectFacet();
else{g.enableEdit();g.setCursorAtEnd(b||d.startAtEnd)}}else if(a.type=="facet")if(d.skipToFacet)if(f>=e||f<0){g=_.last(this.inputViews);g.focus()}else{g=this.facetViews[f];g.enableEdit();g.setCursorAtEnd(b||d.startAtEnd)}else{g=this.inputViews[f];g.focus();d.selectText&&g.selectText()}d.selectText&&g.selectText();this.resizeFacets()},focusSearch:function(a,b){var d=this.inputViews[this.inputViews.length-1];if(!a||c(a.target).is(".VS-search-box")||c(a.target).is(".search_inner")||a.type=="keydown"){this.disableFacets();
b?d.focus(b):d.setCursorAtEnd(-1);if(a&&a.type=="keydown"){d.keydown(a);d.box.trigger("keydown")}_.defer(_.bind(function(){this.$("input:focus").length||this.inputViews[this.inputViews.length-1].focus(b)},this))}},highlightSearch:function(a){this.inputViews[this.inputViews.length-1].startTripleClickTimer();this.focusSearch(a,true)},maybeTripleClick:function(a){return this.inputViews[this.inputViews.length-1].maybeTripleClick(a)},addFocus:function(){VS.options.callbacks.focus();this.$(".VS-search-box").addClass("VS-focus")},
removeFocus:function(){_.any(this.facetViews.concat(this.inputViews),function(a){return a.isFocused()})||this.$(".VS-search-box").removeClass("VS-focus")},showFacetCategoryMenu:function(a){a.preventDefault();a.stopPropagation();if(this.facetCategoryMenu&&this.facetCategoryMenu.modes.open=="is")return this.facetCategoryMenu.close();a=[{title:"Account",onClick:_.bind(this.addFacet,this,"account","")},{title:"Project",onClick:_.bind(this.addFacet,this,"project","")},{title:"Filter",onClick:_.bind(this.addFacet,
this,"filter","")},{title:"Access",onClick:_.bind(this.addFacet,this,"access","")}];a=this.facetCategoryMenu||(this.facetCategoryMenu=new dc.ui.Menu({items:a,standalone:true}));this.$(".VS-icon-search").after(a.render().open().content);return false}})})();
(function(){var c=jQuery;VS.ui.SearchFacet=Backbone.View.extend({type:"facet",className:"search_facet",events:{"click .category":"selectFacet","keydown input":"keydown","mousedown input":"enableEdit","mouseover .VS-icon-cancel":"showDelete","mouseout .VS-icon-cancel":"hideDelete","click .VS-icon-cancel":"remove"},initialize:function(){this.flags={canClose:false};_.bindAll(this,"set","keydown","deselectFacet","deferDisableEdit")},render:function(){c(this.el).html(JST.search_facet({model:this.model}));
this.setMode("not","editing");this.setMode("not","selected");this.box=this.$("input");this.box.val(this.model.get("value"));this.box.bind("blur",this.deferDisableEdit);this.setupAutocomplete();return this},calculateSize:function(){this.box.autoGrowInput();this.box.unbind("updated.autogrow");this.box.bind("updated.autogrow",_.bind(this.moveAutocomplete,this))},resize:function(a){this.box.trigger("resize.autogrow",a)},setupAutocomplete:function(){this.box.autocomplete({source:_.bind(this.autocompleteValues,
this),minLength:0,delay:0,autoFocus:true,select:_.bind(function(a,b){a.preventDefault();var d=this.model.get("value");this.set(b.item.value);if(d!=b.item.value||this.box.val()!=b.item.value)this.search(a);VS.app.searchBox.focusNextFacet(this,1,{viewPosition:this.options.order});return false},this)});this.box.autocomplete("widget").addClass("VS-interface")},moveAutocomplete:function(){var a=this.box.data("autocomplete");a&&a.menu.element.position({my:"left top",at:"left bottom",of:this.box.data("autocomplete").element,
collision:"flip",offset:"0 0"})},searchAutocomplete:function(){var a=this.box.data("autocomplete");if(a){var b=a.menu.element;a.search();b.outerWidth(Math.max(b.width("").outerWidth(),a.element.outerWidth()))}},closeAutocomplete:function(){var a=this.box.data("autocomplete");a&&a.close()},autocompleteValues:function(a,b){var d=this.model.get("category"),e=this.model.get("value"),f=a.term;d=VS.options.callbacks.facetMatches(d)||[];if(f&&e!=f){f=VS.utils.inflector.escapeRegExp(f||"");var g=RegExp("\\b"+
f,"i");d=c.grep(d,function(h){return g.test(h)||g.test(h.value)||g.test(h.label)})}b(_.sortBy(d,function(h){return h==e||h.value==e?"":h}))},set:function(a){a&&this.model.set({value:a})},search:function(a){this.closeAutocomplete();VS.app.searchBox.searchEvent(a)},enableEdit:function(){if(this.modes.editing!="is"){this.setMode("is","editing");this.deselectFacet();this.box.val()==""&&this.box.val(this.model.get("value"))}this.flags.canClose=false;VS.app.searchBox.disableFacets(this);VS.app.searchBox.addFocus();
_.defer(function(){VS.app.searchBox.addFocus()});this.box.is(":focus")||this.box.focus();this.resize();this.searchAutocomplete()},deferDisableEdit:function(){this.flags.canClose=true;_.delay(_.bind(function(){this.flags.canClose&&!this.box.is(":focus")&&this.modes.editing=="is"&&this.modes.selected!="is"&&this.disableEdit()},this),250)},disableEdit:function(){var a=VS.utils.inflector.trim(this.box.val());a!=this.model.get("value")&&this.set(a);this.flags.canClose=false;this.box.selectRange(0,0);this.box.blur();
this.setMode("not","editing");this.closeAutocomplete();VS.app.searchBox.removeFocus()},selectFacet:function(){var a=VS.app.searchBox.allSelected();if(this.box.is(":focus")){this.box.setCursorPosition(0);this.box.blur()}this.flags.canClose=false;this.closeAutocomplete();this.setMode("is","selected");this.setMode("not","editing");if(!a){c(document).unbind("keydown.facet",this.keydown);c(document).unbind("click.facet",this.deselectFacet);_.defer(_.bind(function(){c(document).unbind("keydown.facet").bind("keydown.facet",
this.keydown);c(document).unbind("click.facet").one("click.facet",this.deselectFacet)},this));VS.app.searchBox.disableFacets(this);VS.app.searchBox.addFocus()}},deselectFacet:function(){if(this.modes.selected=="is"){this.setMode("not","selected");this.closeAutocomplete();VS.app.searchBox.removeFocus()}c(document).unbind("keydown.facet",this.keydown);c(document).unbind("click.facet",this.deselectFacet)},isFocused:function(){return this.box.is(":focus")},showDelete:function(){c(this.el).addClass("search_facet_maybe_delete")},
hideDelete:function(){c(this.el).removeClass("search_facet_maybe_delete")},setCursorAtEnd:function(a){a==-1?this.box.setCursorPosition(this.box.val().length):this.box.setCursorPosition(0)},remove:function(){var a=this.model.has("value");this.deselectFacet();this.disableEdit();VS.app.searchQuery.remove(this.model);a?this.search():VS.app.searchBox.renderFacets();VS.app.searchBox.focusNextFacet(this,0,{viewPosition:this.options.order})},selectText:function(){this.box.selectRange(0,this.box.val().length)},
keydown:function(a){var b=VS.app.hotkeys.key(a);if(b=="enter"&&this.box.val()){this.disableEdit();this.search(a)}else if(b=="left"){if(this.box.getCursorPosition()==0&&!this.box.getSelection().length)if(this.modes.selected=="is"){this.deselectFacet();VS.app.searchBox.focusNextFacet(this,-1,{startAtEnd:true})}else this.selectFacet()}else if(b=="right")if(this.modes.selected=="is"){a.preventDefault();this.deselectFacet();this.setCursorAtEnd(0);this.enableEdit()}else{if(this.box.getCursorPosition()==
this.box.val().length){a.preventDefault();this.disableEdit();VS.app.searchBox.focusNextFacet(this,1)}}else if(VS.app.hotkeys.shift&&b=="tab"){a.preventDefault();this.deselectFacet();this.disableEdit();VS.app.searchBox.focusNextFacet(this,-1,{startAtEnd:true,skipToFacet:true,selectText:true})}else if(b=="tab"){a.preventDefault();this.deselectFacet();this.disableEdit();VS.app.searchBox.focusNextFacet(this,1,{skipToFacet:true,selectText:true})}else if(VS.app.hotkeys.command&&(a.which==97||a.which==65)){a.preventDefault();
VS.app.searchBox.selectAllFacets();return false}else if(VS.app.hotkeys.printable(a)&&this.modes.selected=="is"){VS.app.searchBox.focusNextFacet(this,-1,{startAtEnd:true});this.remove()}else if(b=="backspace")if(this.modes.selected=="is"){a.preventDefault();this.remove(a)}else if(this.box.getCursorPosition()==0&&!this.box.getSelection().length){a.preventDefault();this.selectFacet()}this.resize(a)}})})();
(function(){var c=jQuery;VS.ui.SearchInput=Backbone.View.extend({type:"text",className:"search_input",events:{"keypress input":"keypress","keydown input":"keydown","click input":"maybeTripleClick","dblclick input":"startTripleClickTimer"},initialize:function(){_.bindAll(this,"removeFocus","addFocus","moveAutocomplete")},render:function(){c(this.el).html(JST.search_input({}));this.setMode("not","editing");this.setMode("not","selected");this.box=this.$("input");this.box.autoGrowInput();this.box.bind("updated.autogrow",
this.moveAutocomplete);this.box.bind("blur",this.removeFocus);this.box.bind("focus",this.addFocus);this.setupAutocomplete();return this},setupAutocomplete:function(){this.box.autocomplete({minLength:1,delay:50,autoFocus:true,source:_.bind(this.autocompleteValues,this),select:_.bind(function(a,b){a.preventDefault();a.stopPropagation();var d=this.addTextFacetRemainder(b.item.value);VS.app.searchBox.addFacet(b.item.value,"",this.options.position+(d?1:0));this.clear();return false},this)});this.box.data("autocomplete")._renderMenu=
function(a,b){var d="";_.each(b,_.bind(function(e){if(e.category&&e.category!=d){a.append('<li class="ui-autocomplete-category">'+e.category+"</li>");d=e.category}this._renderItem(a,e)},this))};this.box.autocomplete("widget").addClass("VS-interface")},autocompleteValues:function(a,b){var d=a.term.match(/\w+$/);d=VS.utils.inflector.escapeRegExp(d&&d[0]||" ");var e=VS.options.callbacks.categoryMatches()||[],f=RegExp("^"+d,"i");d=c.grep(e,function(g){return f.test(g.label||g)});b(_.sortBy(d,function(g){return g.label?
g.category+"-"+g.label:g}))},closeAutocomplete:function(){var a=this.box.data("autocomplete");a&&a.close()},moveAutocomplete:function(){var a=this.box.data("autocomplete");a&&a.menu.element.position({my:"left top",at:"left bottom",of:this.box.data("autocomplete").element,collision:"none"})},searchAutocomplete:function(){var a=this.box.data("autocomplete");if(a){var b=a.menu.element;a.search();b.outerWidth(Math.max(b.width("").outerWidth(),a.element.outerWidth()))}},addTextFacetRemainder:function(a){var b=
this.box.val(),d=b.match(/\b(\w+)$/);if(d&&a.indexOf(d[0])==0)b=b.replace(/\b(\w+)$/,"");(b=b.replace("^s+|s+$",""))&&VS.app.searchBox.addFacet("text",b,this.options.position);return b},focus:function(a){this.addFocus();this.box.focus();a&&this.selectText()},blur:function(){this.box.blur();this.removeFocus()},removeFocus:function(){VS.app.searchBox.removeFocus();this.setMode("not","editing");this.setMode("not","selected");this.closeAutocomplete()},addFocus:function(){VS.app.searchBox.allSelected()||
VS.app.searchBox.disableFacets(this);VS.app.searchBox.addFocus();this.setMode("is","editing");this.setMode("not","selected");this.searchAutocomplete()},startTripleClickTimer:function(){this.tripleClickTimer=setTimeout(_.bind(function(){this.tripleClickTimer=null},this),500)},maybeTripleClick:function(a){if(this.tripleClickTimer){a.preventDefault();VS.app.searchBox.selectAllFacets();return false}},isFocused:function(){return this.box.is(":focus")},clear:function(){this.box.val("")},value:function(){return this.box.val()},
setCursorAtEnd:function(a){a==-1?this.box.setCursorPosition(this.box.val().length):this.box.setCursorPosition(0)},selectText:function(){this.box.selectRange(0,this.box.val().length);VS.app.searchBox.allSelected()?this.setMode("is","selected"):this.box.focus()},keypress:function(a){var b=VS.app.hotkeys.key(a);if(b=="enter")return VS.app.searchBox.searchEvent(a);else if(VS.app.hotkeys.colon(a)){this.box.trigger("resize.autogrow",a);b=this.box.val();var d=VS.options.callbacks.categoryMatches()||[];d=
_.map(d,function(e){return e.label?e.label:e});if(_.contains(d,b)){a.preventDefault();a=this.addTextFacetRemainder(b);VS.app.searchBox.addFacet(b,"",this.options.position+(a?1:0));this.clear();return false}}else if(b=="backspace")if(this.box.getCursorPosition()==0&&!this.box.getSelection().length){a.preventDefault();a.stopPropagation();a.stopImmediatePropagation();VS.app.searchBox.resizeFacets();return false}},keydown:function(a){var b=VS.app.hotkeys.key(a);if(b=="left"){if(this.box.getCursorPosition()==
0){a.preventDefault();VS.app.searchBox.focusNextFacet(this,-1,{startAtEnd:true})}}else if(b=="right"){if(this.box.getCursorPosition()==this.box.val().length){a.preventDefault();VS.app.searchBox.focusNextFacet(this,1,{selectFacet:true})}}else if(VS.app.hotkeys.shift&&b=="tab"){a.preventDefault();VS.app.searchBox.focusNextFacet(this,-1,{selectText:true})}else if(b=="tab"){a.preventDefault();b=this.box.val();if(b.length){var d=this.addTextFacetRemainder(b);VS.app.searchBox.addFacet(b,"",this.options.position+
(d?1:0))}else VS.app.searchBox.focusNextFacet(this,0,{skipToFacet:true,selectText:true})}else if(VS.app.hotkeys.command&&String.fromCharCode(a.which).toLowerCase()=="a"){a.preventDefault();VS.app.searchBox.selectAllFacets();return false}else if(b=="backspace"&&!VS.app.searchBox.allSelected())if(this.box.getCursorPosition()==0&&!this.box.getSelection().length){a.preventDefault();VS.app.searchBox.focusNextFacet(this,-1,{backspace:true});return false}this.box.trigger("resize.autogrow",a)}})})();
(function(){var c=jQuery;Backbone.View.prototype.setMode=function(a,b){this.modes||(this.modes={});if(this.modes[b]!==a){c(this.el).setMode(a,b);this.modes[b]=a}}})();
(function(){var c=jQuery;VS.app.hotkeys={KEYS:{"16":"shift","17":"control","91":"command","93":"command","224":"command","13":"enter","37":"left","38":"upArrow","39":"right","40":"downArrow","46":"delete","8":"backspace","9":"tab","188":"comma"},initialize:function(){_.bindAll(this,"down","up","blur");c(document).bind("keydown",this.down);c(document).bind("keyup",this.up)},down:function(a){if(a=this.KEYS[a.which])this[a]=true},up:function(a){if(a=this.KEYS[a.which])this[a]=false},blur:function(){for(var a in this.KEYS)this[this.KEYS[a]]=
false},key:function(a){return this.KEYS[a.which]},colon:function(a){return(a=a.which)&&String.fromCharCode(a)==":"},printable:function(a){var b=a.which;if(a.type=="keydown"){if(b==32||b>=48&&b<=90||b>=96&&b<=111||b>=186&&b<=192||b>=219&&b<=222)return true}else if(b>=32&&b<=126||b>=160&&b<=500||String.fromCharCode(b)==":")return true;return false}}})();
(function(){VS.utils.inflector={trim:function(c){return c.trim?c.trim():c.replace(/^\s+|\s+$/g,"")},escapeRegExp:function(c){return c.replace(/([.*+?^${}()|[\]\/\\])/g,"\\$1")}}})();
(function(){var c=jQuery;c.fn.extend({setMode:function(a,b){b=b||"mode";var d=RegExp("\\w+_"+b+"(\\s|$)","g"),e=a===null?"":a+"_"+b;this.each(function(){this.className=(this.className.replace(d,"")+" "+e).replace(/\s\s/g," ")});return e},autoGrowInput:function(){return this.each(function(){var a=c(this),b=c("<div />").css({opacity:0,top:-9999,left:-9999,position:"absolute",whiteSpace:"nowrap"}).addClass("VS-input-width-tester").addClass("VS-interface");a.next(".VS-input-width-tester").remove();a.after(b);
a.unbind("keydown.autogrow keypress.autogrow resize.autogrow change.autogrow").bind("keydown.autogrow keypress.autogrow resize.autogrow change.autogrow",function(d,e){if(e)d=e;var f=a.val();if(VS.app.hotkeys.key(d)=="backspace"){var g=a.getCursorPosition();if(g>0)f=f.slice(0,g-1)+f.slice(g,f.length)}else if(VS.app.hotkeys.printable(d)&&!VS.app.hotkeys.command)f+=String.fromCharCode(d.which);f=f.replace(/&/g,"&amp;").replace(/\s/g,"&nbsp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");b.html(f);a.width(b.width()+
3);a.trigger("updated.autogrow")});a.trigger("resize.autogrow")})},getCursorPosition:function(){var a=0,b=this.get(0);if(document.selection){b.focus();a=document.selection.createRange();var d=document.selection.createRange().text.length;a.moveStart("character",-b.value.length);a=a.text.length-d}else if(b&&c(b).is(":visible")&&b.selectionStart!=null)a=b.selectionStart;return a},setCursorPosition:function(a){return this.each(function(){return c(this).selectRange(a,a)})},selectRange:function(a,b){return this.each(function(){if(this.setSelectionRange){this.focus();
this.setSelectionRange(a,b)}else if(this.createTextRange){var d=this.createTextRange();d.collapse(true);d.moveEnd("character",b);d.moveStart("character",a);d.select()}})},getSelection:function(){var a=this[0];if(a.selectionStart!=null){var b=a.selectionStart,d=a.selectionEnd;return{start:b,end:d,length:d-b,text:a.value.substr(b,d-b)}}else if(document.selection){var e=document.selection.createRange();if(e){a=a.createTextRange();b=a.duplicate();a.moveToBookmark(e.getBookmark());b.setEndPoint("EndToStart",
a);b=b.text.length;d=b+e.text.length;return{start:b,end:d,length:d-b,text:e.text}}}return{start:0,end:0,length:0}}})})();
(function(){VS.app.SearchParser={ALL_FIELDS:/('.+?'|".+?"|[^'"\s]{2}\S*):\s*('.+?'|".+?"|[^'"\s]\S*)/g,FIELD:/(.+?):\s*/,parse:function(c){c=this._extractAllFacets(c);VS.app.searchQuery.refresh(c);return c},_extractAllFacets:function(c){for(var a=[],b=c;c;){var d,e;b=c;var f=this._extractNextField(c);if(f)if(f.indexOf(":")!=-1){d=f.match(this.FIELD)[1];e=f.replace(this.FIELD,"").replace(/(^['"]|['"]$)/g,"");c=VS.utils.inflector.trim(c.replace(f,""))}else{if(f.indexOf(":")==-1){d="text";e=f;c=VS.utils.inflector.trim(c.replace(e,
""))}}else{d="text";e=this._extractSearchText(c);c=VS.utils.inflector.trim(c.replace(e,""))}if(d&&e){f=new VS.model.SearchFacet({category:d,value:VS.utils.inflector.trim(e)});a.push(f)}if(b==c)break}return a},_extractNextField:function(c){var a=c.match(/^\s*(\S+)\s+(?=\w+:\s?(('.+?'|".+?")|([^'"]{2}\S*)))/);return a&&a.length>=1?a[1]:this._extractFirstField(c)},_extractFirstField:function(c){return(c=c.match(this.ALL_FIELDS))&&c.length&&c[0]},_extractSearchText:function(c){return VS.utils.inflector.trim((c||
"").replace(this.ALL_FIELDS,""))}}})();(function(){VS.model.SearchFacet=Backbone.Model.extend({serialize:function(){var c=this.get("category"),a=VS.utils.inflector.trim(this.get("value"));if(!a)return"";if(!_.contains(VS.options.unquotable||[],c)&&c!="text")a='"'+a+'"';if(c!="text")c+=": ";else c="";return c+a}})})();
(function(){VS.model.SearchQuery=Backbone.Collection.extend({model:VS.model.SearchFacet,value:function(){return this.map(function(c){return c.serialize()}).join(" ")},find:function(c){var a=this.detect(function(b){return b.get("category")==c});return a&&a.get("value")},count:function(c){return this.select(function(a){return a.get("category")==c}).length},values:function(c){var a=this.select(function(b){return b.get("category")==c});return _.map(a,function(b){return b.get("value")})},has:function(c,
a){return this.any(function(b){return a?b.get("category")==c&&b.get("value")==a:b.get("category")==c})},withoutCategory:function(c){return this.map(function(a){if(a.get("category")!=c)return a.serialize()}).join(" ")}})})();
(function(){window.JST=window.JST||{};window.JST.search_box=_.template('<div class="VS-search">  <div id="search_container">    <div class="VS-search-box-wrapper VS-search-box">      <div class="icon VS-icon-search"></div>      <div class="search_inner"></div>      <div class="icon VS-icon-cancel VS-cancel-search-box" title="clear search"></div>    </div>  </div></div>');window.JST.search_facet=_.template('<% if (model.has(\'category\')) { %>  <div class="category"><%= model.get(\'category\') %>:</div><% } %><div class="search_facet_input_container">  <input type="text" class="search_facet_input VS-interface" value="" /></div><div class="search_facet_remove icon VS-icon-cancel"></div>');
window.JST.search_input=_.template('<input type="text" />')})();
