/**
 * Selectable_text_word
 * 
 * 建立Selectable_text中的Word
 * 
 * @package     KALS
 * @category    Webpage Application Libraries
 * @author      Pulipuli Chen <pulipuli.chen@gmail.com>
 * @copyright   Copyright (c) Expression year is undefined on line 7, column 33 in Templates/KALS/KALS_JavaScript_Class.js., Pudding Chen
 * @license     http://opensource.org/licenses/gpl-license.php GNU Public License
 * @link        https://github.com/pulipulichen/kals
 * @version     1.0 2014/1/2 下午 08:25:49
 */
/*global KALS_CONFIG:false */ /*global KALS_context:false */ /*global KALS_util:false */ /*global KALS_text:false */ /*global KALS_toolbar:false */ /*global KALS_window:false */

/**
 * @memberOf {Selectable_text_word}
 * @extends {KALS_user_interface}
 * @constructor
 * @param {Selectable_text} _selectable_text 父物件
 */
function Selectable_text_word(_selectable_text) {
    
    this._selectable_text = _selectable_text;
    
    /**
     * @type Selectable_text
     */
    this._text = _selectable_text._text;
    
    // 監聽site_reform事件
    var _this = this;
    KALS_context.ready(function () {
        //KALS_context.module_ready("KALS_context.site_reform", function (_site_reform) {
            //$.test_msg("開始註冊site_reform");
            KALS_context.site_reform.add_instant_listener(function (_site_reform) {
                var _is_pdf2htmlex = _site_reform.is_site("pdf2htmlEx");
                //$.test_msg("是pdf2htmlEx嗎？", _is_pdf2htmlex);
                _this._mouse_event_enable = (_is_pdf2htmlex === false);
            });
        //});
    });
    
    if ($.is_number(KALS_CONFIG.annotation_tool.auto_select)) {
        //$.test_msg("已經設定");
        this._auto_select = true;
    }
    
    return this;
}

/**
 * Extends from KALS_user_interface.
 * @memberOf {Selectable_text_word}
 */
Selectable_text_word.prototype = new KALS_user_interface();

/**
 * 父物件
 * @type {Selectable_text}
 */
Selectable_text_word.prototype._selectable_text;

// -----------------------------------
// 內部參數設定
// -----------------------------------

/**
 * 文字記數，初始化時使用。
 * @type {number}
 */
Selectable_text_word.prototype.word_count = 0;

/**
 * 可選取文字的classname
 * @type {String}
 * @author Pudding 20140102 尚未更新相關使用的程式碼 this.word_classname
 */
Selectable_text_word.prototype.word_classname = 'kals-word';

/**
 * 可選取文字的ID前置
 * @type {String}
 * @author Pudding 20140102 尚未更新相關使用的程式碼 this.word_id_prefix
 */
Selectable_text_word.prototype.word_id_prefix = 'kals_word_';


Selectable_text_word.prototype._span_classname = 'span';

/**
 * 鎖
 * @type Array
 */
Selectable_text_word.prototype.locks = [];

// -----------------------------------
// 方法
// -----------------------------------

/**
 * 取得word_id_prefix
 * @returns {Selectable_text_word.word_id_prefix}
 */
Selectable_text_word.prototype.get_word_id_prefix = function () {
    return this.word_id_prefix;
};

/**
 * 從ID取得Word
 * @param {number} _index
 * @return {jQuery}
 */
Selectable_text_word.prototype.get_word_by_index = function(_index) {
    
    var _word_id_prefix = this.word_id_prefix;
    var _word_id = _word_id_prefix + _index;
    var _word = $('#' + _word_id);
    return _word;
};

/**
 * 取得指定ID的word
 * 
 * 2307 轉接完成，不需檢查
 * @param {int} _word_id
 * @returns {jQuery}
 */
Selectable_text_word.prototype.get_word = function (_word_id) {
    return this.get_word_by_index(_word_id);
};

/**
 * 取得word id，但似乎沒有人使用他
 * 
 * 2317 轉接完成，檢查完成
 * @param {jQuery} _word
 */
Selectable_text_word.prototype.get_word_id = function (_word) {
    if ($.is_object(_word)) {
        if ($.is_jquery(_word)) {
            _word = _word.attr('id');
        }
        else {
            _word = _word.id;
        }
    }
       
    var _id_prefix = this.word_id_prefix;
    if ($.starts_with(_word, _id_prefix)) {
        _word = _word.substring(_id_prefix.length, _word.length);
    }
    return parseInt(_word,10);
};


/**
 * 如果下一個字是英文的話
 * 
 * 2316 檢查完成
 * 2317 轉接完成
 * @param {jQuery} _word
 * @returns {Boolean}
 */
Selectable_text_word.prototype.is_word_next_english = function (_word) {
    var _word_id = this.get_word_id(_word);
    _word_id++;
    var _next = this.get_word_by_index(_word_id);
    var _text = _next.text();
    if (_text.length > 1) {
        // 如果超過一個字，那大概就是英文了
        return true;
    }
    else if ($.match_english(_text)) {
        return true;
    }
    
    return false;
};

/**
 * 如果下一個字是空格的話
 * 
 * 2318 轉接完成，檢查完成
 * @param {jQuery} _word
 * @returns {Boolean}
 */
Selectable_text_word.prototype.is_word_next_span = function (_word) {
    var _next = _word.next();
    if (_next.length === 0) {
        return false;
    }
    else {
        return _next.hasClass(this._span_classname);
    }
};

/**
 * 取得下一個span
 * 
 * 2319 檢查完成，轉接完成
 * @param {jQuery} _word
 * @returns {jQuery|null}
 */
Selectable_text_word.prototype.get_word_next_span = function (_word) {
    var _next = _word.next();
    //_next.css('background-color', 'red');
    //$.test_msg('Selectable_text.is_word_next_span()', _next.length);
    if (_next.length === 0) {
        return null;
    }
    else {
        return _next;
    }
};

/**
 * 建立一個不可選取的文字
 * 
 * 2323 轉接完成，檢查完成
 * @param {String} _text
 * @type {jQuery}
 */
Selectable_text_word.prototype.create_span_word = function(_text) {
    //$.test_msg("Selectable_text_word.prototype.create_span_word");
    
    var _word = document.createElement("span");
    _word.className = this._span_classname + ' ' + this.word_classname;
    
    var _t_text = document.createTextNode(_text);
    _word.appendChild(_t_text);

    return _word;
};

/**
 * 建立一個可選取的文字
 * 
 * 2324 轉接完畢，檢查完畢
 * @param {number} _para_id Paragraph ID
 * @param {number} _point_id Word ID
 * @param {string} _text 內容文字
 * @type {jQuery}
 */
Selectable_text_word.prototype.create_selectable_word = function(_para_id, _point_id, _text) {
    
    //$.test_msg("Selectable_text_word.prototype.create_selectable_word");
    
    var _word = document.createElement("span");

    _word.className = this.word_classname
        + ' ' + this._selectable_text.tooltip.trigger_classname;

    var _word_id = this.word_id_prefix + _point_id; 

    _word.id = _word_id;

    var _t_text = document.createTextNode(_text);
    _word.appendChild(_t_text);

    // 20140223 Pudding Chen
    // 停止在這裡設定事件，移到setup_word_selectable去做
    //_word = this.setup_word_tooltip(_word);

    /**
     * 加入統計目前字串次數的功能
     * @author Pulipuli Chen  20131227
     */
    KALS_context.progress.add_count();
    
    /*
    var _progress = _point_id;
    //每10統計一次
    if (_progress % 10 === 0) {
        _progress = (_progress / this._estimate_words_length) * 100;
        _progress = parseInt(_progress, 10);
        $.test_msg("[create_selectable_word] _point_id", _progress + "%");
    }
    */
    return _word;
};

/**
 * 建立一個可選取的標註討論點
 * @param {number} _para_id Paragraph ID
 * @param {number} _point_id Word ID
 * @param {string} _text 內容文字
 * @type {jQuery}
 * @author Pudding 20151029
 */
//Selectable_text_word.prototype.create_selectable_word_spot = function(_para_id, _point_id, _word) {
//    
//    _word.className =  $.trim(_word.className + " " + this.word_classname
//        + ' ' + this._selectable_text.tooltip.trigger_classname);
//
//    var _word_id = this.word_id_prefix + _point_id; 
//
//    _word.id = _word_id;
//
//    KALS_context.progress.add_count();
// 
//    return _word;
//};

/**
 * 建立一個可選取的標註討論點
 * @param {number} _para_id Paragraph ID
 * @param {number} _point_id Word ID
 * @param {string} _text 內容文字
 * @type {jQuery}
 * @author Pudding 20151029
 */
//Selectable_text_word.prototype.create_selectable_image_spot = function(_para_id, _point_id, _word) {
//    
//    _word.className =  $.trim(_word.className + " " + this.word_classname);
//
//    var _word_id = this.word_id_prefix + _point_id; 
//
//    _word.id = _word_id;
//
//    KALS_context.progress.add_count();
// 
//    return _word;
//};


/**
 * 初始化next_element，只用於setup_selectable_element
 * @param {jQuery} _child_obj
 * @returns {HTMLNode}
 * @author Pudding 20151113
 */
Selectable_text_word.prototype.create_selectable_word_spot = function (_child_obj) {
    // 變數簡化
    var _selectable_text_paragraph = this._selectable_text.paragraph;
    var _selectable_text_word = this;
    var _selectable_text_spot = this._selectable_text.spot;
    //var _selectable_text_sentence = this._selectable_text.sentence;
    //var _sentence_punctuation_class_name = this._selectable_text.sentence.sententce_punctuation_classname;
    //var _punctuation_classname = this._selectable_text.sentence.punctuation_classname;
    
    
    var _next_element = $(_child_obj).clone().get(0);
//    _next_element = _selectable_text_word.create_selectable_word_spot(
//            _selectable_text_paragraph.paragraph_count
//            , _selectable_text_word.word_count
//            , _next_element
//    );
    
    _next_element.className =  $.trim(_next_element.className + " " + this.word_classname
        + ' ' + this._selectable_text.tooltip.trigger_classname);

    var _word_id = this.word_id_prefix + _selectable_text_word.word_count; 

    _next_element.id = _word_id;

    KALS_context.progress.add_count();
    
    _selectable_text_word.word_count++;
    
    return _next_element;
};

/**
 * 初始化next_element，只用於setup_selectable_element
 * @param {jQuery} _child_obj
 * @returns {HTMLNode}
 * @author Pudding 20151113
 */
Selectable_text_word.prototype.create_selectable_image_spot = function (_child_obj) {
    // 變數簡化
    var _selectable_text_paragraph = this._selectable_text.paragraph;
    var _selectable_text_word = this;
    var _selectable_text_spot = this._selectable_text.spot;
    //var _selectable_text_sentence = this._selectable_text.sentence;
    //var _sentence_punctuation_class_name = this._selectable_text.sentence.sententce_punctuation_classname;
    //var _punctuation_classname = this._selectable_text.sentence.punctuation_classname;
    
    //$.test_msg("create_selectable_image_spot", _child_obj.tagName);
    
    var _next_element = $(_child_obj).clone().get(0);
    
    _next_element.className =  $.trim(_next_element.className + " " + _selectable_text_spot.img_spot_classname);

    var _word_id = this.word_id_prefix + _selectable_text_word.word_count; 

    _next_element.id = _word_id;

    KALS_context.progress.add_count();
 
    _selectable_text_word.word_count++;
    
    return _next_element;
};

/**
 * 建立一個可選取的標註討論點
 * @param {number} _para_id Paragraph ID
 * @param {number} _point_id Word ID
 * @param {string} _text 內容文字
 * @type {jQuery}
 * @author Pudding 20151113
 * @deprecated Pudding 20151113
 */
//Selectable_text_word.prototype.create_selectable_img_spot = function(_para_id, _point_id, _word) {
//    
//    var _spot = this._selectable_text.spot;
//    
//    _word.className =  $.trim(_word.className 
//            + " " + _spot.img_spot_classname);
//
//    var _word_id = this.word_id_prefix + _point_id; 
//
//    _word.id = _word_id;
//
//    KALS_context.progress.add_count();
// 
//    return _word;
//};

// -------------------------------------------

Selectable_text_word.prototype.KALS_SELECT_MOUSEDOWN_LOCK;
Selectable_text_word.prototype.KALS_SELECT_LOCK;

/**
 * 設定文字的滑鼠事件
 * @param {jQuery} _words
 * @param {Function} _callback
 * @returns {Selectable_text_word}
 */
Selectable_text_word.prototype.setup_word_mouse_event = function (_words, _callback) {
    
    
    /**
     * @type Selection_select
     */
    var _select = KALS_text.selection.select;
    
    // @20130612 Pudding Chen
    // 加入了拖曳選取時也能用的選取範圍功能
    if (typeof(this.KALS_SELECT_MOUSEDOWN_LOCK) === "undefined") {
        this.KALS_SELECT_MOUSEDOWN_LOCK = null;
        this.KALS_SELECT_LOCK = false;
    }

    var _this = this;
    
    // -----------------------------
    
    var _mouseout_event = function () {
        
        // 如果不啟用滑鼠事件，則關閉這整個事件
        if (_this._mouse_event_enable === false) {
            return;
        }
        
        // 單點按壓選擇
        _this.KALS_SELECT_LOCK = false;
    };
    
    _words.mouseout(_mouseout_event);

    // -----------------------------
    
    var _mousedown_event = function (_event) {
        
        // 如果不啟用滑鼠事件，則關閉這整個事件
        if (_this._mouse_event_enable === false) {
            return;
        }

        // 限制只能用左鍵選取
        if (_event.which !== 1) {
            return;
        }

        /**
         * 先做超連結偵測
         * @author Pulipuli Chen <pulipuli.chen@gmail.com> 
         */
        var _md_this = this;
        var _word = $(_md_this);
        var _is_link = false;

        var _link_tag = _word.parents("a[href]:first");
        if (_link_tag.length === 1) {
            // 如果是超連結的話
            
            _mousedown_link_event(_link_tag);

            return;
        }

        _this.KALS_SELECT_LOCK = true;
        _this.KALS_SELECT_MOUSEDOWN_LOCK = 1;

        // 短時間點選事件
        _mousedown_click_event(_md_this);

        // 單點按壓選擇
        _mousedown_hold_press_event(_md_this);
    };
    
    /**
     * 點選位置是連結的事件
     * @param {jQuery} _link_tag
     */
    var _mousedown_link_event = function (_link_tag) {
        var _is_link = true;

        var _link_url = _link_tag.attr("href");

        //alert(_link_tag.attr("target"));
        /*
        var _target = "_blank";
        if (_link_url.substr(0,1) != "#"
                && (_link_tag.hasAttr("target") === false || _link_tag.attr("target") == "") ) {
            _link_tag.attr("target", "_blank");
        }
        else {
            _target = _link_tag.attr("target");
        }
        */
        var _target = "_self";
        if (_link_tag.hasAttr("target") === false 
                || _link_tag.attr("target") === "") {
            _target = _link_tag.attr("target");
        }
        //_link_url = "//";

        var _log_data = {
            "url": _link_url,
            "target": _target
        };

        //$.test_msg("送出超連結", _log_data);
        var _action = 39;
        KALS_util.log(_action, _log_data);
    };
    
    var _mousedown_click_event = function (_md_this) {
        setTimeout(function () {
            if (_this.KALS_SELECT_MOUSEDOWN_LOCK === 1) {
                var _word = $(_md_this);

                _select.cancel_select();
                _select.set_select(_word);  

                _this.KALS_SELECT_MOUSEDOWN_LOCK = 2;
            }
        }, 300);
    };
    
    var _mousedown_hold_press_event = function (_md_this) {
        setTimeout(function () {
            if (_this.KALS_SELECT_MOUSEDOWN_LOCK === 2 
                    && _this.KALS_SELECT_LOCK === true) {
                //$.test_msg("單點按壓選擇");
                
                // 相同位置選擇
                var _word = $(_md_this);
                
                //_select.set_select(_word);
                
                var _sentence_start_word = _this.get_setence_start_word(_word);
                var _sentence_end_word = _this.get_setence_end_word(_word);
                
                _select.cancel_select();
                
                _select.set_select(_sentence_start_word);
                _select.set_select(_sentence_end_word);
                
                _this.KALS_SELECT_MOUSEDOWN_LOCK = null;
            }
        }, 1000);
    };
    
    _words.mousedown(_mousedown_event);

    // -----------------------------
    
    var _mouseup_event = function () {
        
        // 如果不啟用滑鼠事件，則關閉這整個事件
        if (_this._mouse_event_enable === false) {
            return;
        }
        
        var _mu_this = this;
        setTimeout(function () {
            if (_this.KALS_SELECT_MOUSEDOWN_LOCK === 2) {
                var _word = $(_mu_this);
                _select.set_select(_word);  
            }
            _this.KALS_SELECT_MOUSEDOWN_LOCK = null;
        }, 100);

        if (_this.KALS_SELECT_MOUSEDOWN_LOCK === 1) {

            //表示這是一個Click事件
            _this.KALS_SELECT_MOUSEDOWN_LOCK = null;

            if (_this.initialized === false) {
                return this;
            }

            var _word = $(this);
            setTimeout(function () {
                _word.tooltip().hide();
            }, 100);

            //_manager.listen_select(_word);
            _select.set_select(_word);

            if ($.is_function(_callback)) {
                _callback();
            }
        }
    };
    
    _words.mouseup(_mouseup_event);
    
    // ---------------------------------------

    if ($.is_function(_callback)) {
        _callback();
    }
    return this;
};

/**
 * 加上自動選取的功能
 * @author Pudding 20151028
 * @param {jQuery} _words
 */
Selectable_text_word.prototype._setup_auto_select_event = function (_words) {
    var _this = this;
    
    /**
     * @type Selection_manager
     */
    var _selection_manager = KALS_text.selection;
    
    if (_selection_manager.has_annotation(_words) === false) {
        //$.test_msg("沒有標註", _word.text());
        return this;
    }
    
    _words.addClass("auto-select");
    
    /**
     * @type Selection_select
     */
    var _select = _selection_manager.select;
    
    var _hover_time = KALS_CONFIG.annotation_tool.auto_select * 1000;  //選取時的秒數

    // 自動選取
    _words.mouseover(function () {
        var _word = $(this);
        _word.addClass("wait");
        //$.test_msg("有觸發事件嗎？", _word.text());
        
        //$.test_msg("KALS_CONFIG.auto_select", ["開始選取", _hover_time, _word.text()]);
        clearTimeout(_this._auto_select_timer);
        _this._auto_select_timer = setTimeout(function () {
            //_word.dblclick();
            //_word.css("border", "1px solid red");
            //$.test_msg("KALS_CONFIG.auto_select", ["選取了", _hover_time, _word.text()]);
            _select.set_complete_select(_word);
            //_this._auto_select_timer = null;
            _this._auto_select_timer = undefined;
            _word.removeClass("wait");
        }, _hover_time);
    });

    // 取消選取
    _words.mouseout(function () {
        var _word = $(this);
        
        if (_this._auto_select_timer !== undefined) {
            //$.test_msg("_setup_auto_select_event", "取消");
            //_select.cancel_select();
            clearTimeout(_this._auto_select_timer);
            _this._auto_select_timer = undefined;
        }
    });
    
    return this;
};

/**
 * 加上單一選取的功能
 * @author Pudding 20151029
 * @param {jQuery} _words
 */
Selectable_text_word.prototype._setup_word_annotation_spot_event = function (_words) {
    
    /**
     * @type Selection_select
     */
    //var _select = KALS_text.selection.select;
    
    //$.test_msg("已經設定");
    _words.click(function () {
        var _word = $(this);
        //_select.set_complete_select(_word);
        //$.test_msg("_setup_word_annotation_spot_event", $.get_prefixed_id(_word));
        KALS_context.module.get_module("Annotation_spot").set_select(_word);
    });
};

/**
 * 自動選取的計時器
 * @type Null 或是setTimeout
 */
Selectable_text_word._auto_select_timer;

/**
 * 檢查是否啟用滑鼠事件
 * @type Boolean
 */
Selectable_text_word.prototype._mouse_event_enable = true;

/**
 * 初始化這個文字的事件
 * @param {jQuery} _word
 * @returns {Selectable_text_word}
 */
Selectable_text_word.prototype._init_word_selectable_event = function (_word) {
    
    if ($.is_jquery(_word) === false) {
        _word = $(_word);
    }
    
    var _spot = this._selectable_text.spot;
    //$.test_msg("_init_word_selectable_event", 1);
    

    //$.test_msg("_init_word_selectable_event", 2);

    // 20140518 Pulipuli Chen
    // 分開來做選取事件
    //if (_word.hasClass("kals-word-spot")) {
    if (_spot.is_annotation_spot(_word)) {
        this._setup_word_annotation_spot_event(_word);
    }
    else if (this._auto_select === false) {
        // 20140223 Pudding Chen
        // 轉移到這邊做tooltip
        this.setup_word_tooltip(_word);
        
        this.setup_word_mouse_event(_word);
    }
    else {
        this._setup_auto_select_event(_word);
    }
    
    //$.test_msg("_init_word_selectable_event", 3);
    
    
    
    //$.test_msg("_init_word_selectable_event", 4);
    
    return this;
};

/**
 * 自動選取模式
 * @type Boolean
 * @author Pudding 20151029
 */
Selectable_text_word.prototype._auto_select = false;

/**
 * 讓所有文字都保持在可選取的狀態
 * 
 * 2254 轉接完畢，檢查完畢
 * @param {function} _callback
 */
Selectable_text_word.prototype.setup_word_selectable = function (_callback) {
    
    var _select = KALS_text.selection.select;
    
    // 如果是一般模式
    if ($.is_mobile_mode() === false) {
        if (typeof(this.locks.word_click) === 'undefined') {
            var _this = this;
            
            var _words = this._text.find('.'+ this.word_classname + ':not(.' + this._span_classname + ')');
            
            var _i = 0;
            var _wait_i = 1000;
            var _loop = function () {
                
                var _word = _words.eq(_i);
                
                /**
                 * 在滑鼠移上去的時候才開始設定事件
                 * @author Pudding 20151029
                 */
                var _lock_name = "kals_word_selectable";
                
                _word.one("mouseover", function () {
                    if ($(this).hasAttr(_lock_name)) {
                        return;
                    }
                    $(this).attr(_lock_name, 1);
                    _this._init_word_selectable_event(this);
                    $(this).trigger("mouseover");
                });
                
                _word.one("click", function () {
                    if ($(this).hasAttr(_lock_name)) {
                        return;
                    }
                    $(this).attr(_lock_name, 1);
                    _this._init_word_selectable_event(this);
                    $(this).trigger("click");
                });
                
                KALS_context.progress.add_count(2);
                
                _continue();
            };
            
            var _continue = function () {
                _i++;
                if (_i < _words.length) {
                    
                    if (_i % _wait_i === 0) {
                        setTimeout(function () {
                            _loop();
                        }, 10);
                    }
                    else {
                        _loop();
                    }
                }
                else {
                    _complete();
                }
            };
            
            var _complete = function () {
                _this.locks.word_click = true;
                $.trigger_callback(_callback);
            };
            
            _loop();
        }
    }
    else {
        $.trigger_callback(_callback);
    }
    
    return this;
};


/**
 * 設定Word的Tooltip
 * 
 * 2325 轉接完畢，檢查完畢
 * @param {jQuery|HTMLElement} _word
 * @returns {jQuery}
 */
Selectable_text_word.prototype.setup_word_tooltip = function (_word) {
    
    var _tooltip_config = this._selectable_text.tooltip.get_tooltip_config();
    
    /**
     * 如果是自動選取，那就不設定Tooltip
     * @author Pudding 20151029
     */
    //if ($.is_number(KALS_CONFIG.auto_select) === false) {
        $(_word).tooltip(_tooltip_config);
    //}
    
    return _word;
};

/**
 * 設定Word的Tooltip
 * 
 * 2325 轉接完畢，檢查完畢
 * 未完成，目前不使用
 * @deprecated 不使用逐字設定toolip，改用on
 * @param {jQuery|HTMLElement} _word
 * @returns {jQuery}
 */
/*
Selectable_text_word.prototype._init_word_tooltip = function () {
    
    var _tooltip_config = this._selectable_text.tooltip.get_tooltip_config();
    
    var _word_classname = this.word_classname;
    var _paragraph_classname = this._selectable_text.paragraph.paragraph_classname;
    var _selector = '.' + _paragraph_classname + ' .' + _word_classname;
    //$(_word).tooltip(_tooltip_config);
    this._text.on('append', _selector , function () {
        
    });
    //return _word;
};
*/
/**
 * 估算大概會多少字
 * 
 * 2326 檢查完畢，轉接完畢
 * @param {String} _text
 * @returns {Number}
 */
Selectable_text_word.prototype.get_estimate_total_words = function (_text) {
    
    //$.test_msg("預測字 1", _text);
    
    // 濃縮英數
    _text = _text.replace(/[\w]{1,}/gi, "_");
    
    // 去掉空格
    _text = _text.replace(/([\s|\t]*)/g, "");
    
    //$.test_msg("預測字 2", _text);
    
    var _total = 0;
    _total = _text.length;
    
    return _total;
};

///**
// * 儲存到快取中
// * @param {String} _cache_id
// * @param {funciton} _callback
// * @returns {Selectable_text_word}
// */
//Selectable_text_word.prototype.cache_save = function (_cache_id, _callback) {
//    _cache_id = _cache_id + '_word';
//    //$.test_msg('word save: ' + _cache_id, this.word_count);
//    KALS_context.storage.set(_cache_id, this.word_count, _callback);
//    return this;
//};
//
///**
// * 從快取中復原
// * @param {String} _cache_id
// * @param {funciton} _callback
// * @returns {Selectable_text_word}
// */
//Selectable_text_word.prototype.cache_restore = function (_cache_id, _callback) {
//    _cache_id = _cache_id + '_word';
//    var _this = this;
//    KALS_context.storage.get(_cache_id, function (_value) {
//        if (_value !== undefined) {
//            _this.word_count = _value;
//        }
//        
//        $.trigger_callback(_callback);
//    });
//    //this.word_count = $.localStorage.get(_cache_id);
//    //$.test_msg('word restore: ' + _cache_id, this.word_count);
//    return this;
//};

/**
 * 取得要快取的資料
 * @returns {Number}
 */
Selectable_text_word.prototype.get_data = function () {
    return this.word_count;
};

/**
 * 設定被快取的資料
 * @param {Int} _data 從快取中取回的資料
 * @returns {Selectable_text_word}
 */
Selectable_text_word.prototype.set_data = function (_data) {
    if ($.is_number(_data)) {
        this.word_count = _data;
    }
    return this;
};

/**
 * 捲動到指定文字
 * @param {Int} _heading_id
 * @param {Function} _callback
 * @returns {Selectable_text_chapter.prototype}
 */
Selectable_text_word.prototype.scroll_to = function (_target_id, _callback) {
    
    if (_target_id === undefined) {
        return this;
    }
    
    var _position = {
        selector: "#" + this.word_id_prefix + _target_id
    };
    
    var _speed = 500;
    //$.test_msg("chapter scroll_to", _position);
    $.scroll_to(_position, _speed, _callback);
    
    return this;
};
/**
 * 取得現在捲軸的位置的first word id
 * 
 * @param {Function} _callback
 * @return {int} word_id
 */

Selectable_text_word.prototype.get_current_progress_word = function (_callback) {

    // 1.先比對kals_paragraph_i
    // 2.再比對該層內的word_id 直到比現在捲軸位置還大(y)的 記錄id
    var _scroll_top = $(window).scrollTop();
    _scroll_top = _scroll_top + KALS_toolbar.get_height();

    // 取得所有的kals_paragraph(array)
    var _paragraph_collection = $('.kals-paragraph');
    
    //$.test_msg('save_reading_progress, para length', _paragraph_len);

    var _target_paragraph, _target_word, _words;
    
    var _word_id = 1;
    var _para_index = 0;
    var _wait_index = 100;
    
    var _para_loop = function () {
        var _paragraph = _paragraph_collection.eq(_para_index);
        //var _paragraph_height = parseInt($('.kals_paragraph_' + _i).offset().top, 10);        
        //取得每個paragraph的第一個word的top
        var _paragraph_height = $.get_offset_top(_paragraph.find(".kals-word:first")); 
        //$.test_msg('save_reading_progress', [_paragraph_height, _scroll_top, _index]);
            
        if (_paragraph_height > _scroll_top) {
            //找前一段
            _target_paragraph = _paragraph_collection.eq(_para_index-1);
            _para_complete();
            return;
        }
        
        _para_continue();
        return;
    };
    
    var _para_continue = function () {
        _para_index++;
        
        if (_para_index < _paragraph_collection.length) {
            
            if (_para_index % _wait_index === 0) {
                setTimeout(function () {
                    _para_loop();
                }, 1);
            }
            else {
                _para_loop();
            }
            return;
        }
        else {
            _para_complete();
            return;
        }
    };
    
    var _para_complete = function () {
        if (_target_paragraph !== undefined) {
            //段落中所有的word
            _words = _target_paragraph.find(".kals-word");
            _word_loop();
            return;
        }
        else {
            _target_word = $(".kals-word:last");
            _word_complete();
            return;
        }
    };
    
    /*
    for (var _index = 0; _index < _paragraph_collection.length; _index++ ) {
        var _paragraph = _paragraph_collection.eq(_index);
        //var _paragraph_height = parseInt($('.kals_paragraph_' + _i).offset().top, 10);        
        //取得每個paragraph的第一個word的top
        var _paragraph_height = $.get_offset_top(_paragraph.find(".kals-word:first")); 
        //$.test_msg('save_reading_progress', [_paragraph_height, _scroll_top, _index]);
            
        if (_paragraph_height > _scroll_top) {
            //找前一段
            _target_paragraph = _paragraph_collection.eq(_index-1);
            break;
        }
            //$.test_msg('i', _i);
    }
    */
        
    var _word_index = 0;
    var _word_loop = function () {
        
        _target_word = _words.eq(_word_index);
        if (_target_word === undefined) {
            $.test_msg("word_loop", [_words.length, _word_index, typeof(_target_word)]);
        }   
        
        //比較每個字與現在捲軸位置的高度
        var _word_height = $.get_offset_top(_target_word);
        if (_word_height > _scroll_top) {
            _word_complete();
            return;
        }
        // 如果在這一段裡面都沒有找到位置比捲軸還低的word，表示實際上是下一個paragraph
        if (_word_index === _words.length - 1) {
            // get_prefixed_id 只取ID的值
            var _word_id = $.get_prefixed_id(_target_word.attr("id"));
            // id裡的值為"kals-word_id"
            _target_word = $("#kals_word_" + (_word_id+1));
            _word_complete();
            return;
        }
        
        _word_continue();
    };
    
    var _word_continue = function () {
        _word_index++;
        if (_word_index < _words.length) {
            
            if (_word_index % _wait_index === 0) {
                setTimeout(function () {
                    _word_loop();
                }, 1);
            }
            else {
                _word_loop();
            }
            return;
        }
        else {
            _word_complete();
            return;
        }
    };
    
    var _word_complete = function () {
        if (_target_word !== undefined && _target_word.length !== 0) {
            _word_id = _target_word.attr("id");
            _word_id = $.get_prefixed_id(_word_id);
            //$.test_msg("get_current_progress_word", [_word_id, _target_paragraph.attr("className")]);
        }

        if ($.is_function(_callback)) {
            _callback(_word_id);
        }
    };
    
    //已經找到該段落
    /*
    if (_target_paragraph !== undefined) {
        //段落中所有的word
        var _words = _target_paragraph.find(".kals-word");
            
        for (var _w = 0; _w < _words.length; _w++) {
            _target_word = _words.eq(_w);
            //比較每個字與現在捲軸位置的高度
            var _word_height = $.get_offset_top(_target_word);
            if (_word_height > _scroll_top) {
                break;
            }
            // 如果在這一段裡面都沒有找到位置比捲軸還低的word，表示實際上是下一個paragraph
            if (_w === _words.length - 1) {
                // get_prefixed_id 只取ID的值
                var _word_id = $.get_prefixed_id(_target_word.attr("id"));
                // id裡的值為"kals-word_id"
                _target_word = $("#kals_word_" + (_word_id+1));
                break;
            }
        };
    }
    else {
        _target_word = $(".kals-word:last");
    }
    */
      
    /*
    var _word_id = 1;
    if (_target_word !== undefined) {
        _word_id = _target_word.attr("id");
        _word_id = $.get_prefixed_id(_word_id);
    }
    //$.test_msg("get_current_progress_word", [_word_id, _target_paragraph.attr("className")]);
    
    if ($.is_function(_callback)) {
        _callback(_word_id);
    }
    */
    //return _word_id;
    
    // 開始執行迴圈
    _para_loop();
    
    return this;
};

// ----------------------------------------

/**
 * 取得開頭的文字
 * @param {jQuery} _index_word
 * @returns {jQuery} 目標文字
 */
Selectable_text_word.prototype.get_setence_start_word = function (_index_word) {
    return this.get_setence_position_word(_index_word, true);
};

/**
 * 取得結尾的文字
 * @param {jQuery} _index_word
 * @returns {jQuery} 目標文字
 */
Selectable_text_word.prototype.get_setence_end_word = function (_index_word) {
    return this.get_setence_position_word(_index_word, false);
};

/**
 * 找尋句子中的文字
 * @param {jQuery} _index_word
 * @param {Boolean} _target_start
 * @returns {jQuery} 目標文字
 */
Selectable_text_word.prototype.get_setence_position_word = function (_index_word, _target_start) {
    var _target_word = _index_word;
    var _punctuation_classname = this._selectable_text.sentence.punctuation_classname;
    var _sentence_punctuation_classname = this._selectable_text.sentence.sententce_punctuation_classname;
    var _span_classname = this._span_classname;
    
    // 如果自己就是斷句位置
    if (_index_word.hasClass(_punctuation_classname)) {
        return _index_word;
    }
    
    var _next_word;
    var _get_next_word = function (_next_word) {
        if (_target_start === true) {
            _next_word = _next_word.prev();
        }
        else {
            _next_word = _next_word.next();
        }
        return _next_word;
    };
    
    var _is_stop_word = function (_next_word) {
        return (_next_word.hasClass(_punctuation_classname)
            || _next_word.hasClass(_sentence_punctuation_classname)
            || _next_word.hasClass(_span_classname));
    };
    
    _next_word = _get_next_word(_index_word);
    while (_next_word.length === 1 
            && _is_stop_word(_next_word) === false) {
        _target_word = _next_word;
        _next_word = _get_next_word(_next_word);
    }
    
    return _target_word;
};

/* End of file Selectable_text_word */
/* Location: ./system/application/views/web_apps/Selectable_text_word.js */