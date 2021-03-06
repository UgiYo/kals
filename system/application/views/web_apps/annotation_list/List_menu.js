/**
 * List_menu
 *
 * @package    KALS
 * @category   Webpage Application Libraries
 * @author     Pudding Chen <puddingchen.35@gmail.com>
 * @copyright  Copyright (c) 2010, Pudding Chen
 * @license    http://opensource.org/licenses/gpl-license.php GNU Public License
 * @link       http://sites.google.com/site/puddingkals/
 * @version    1.0 2010/10/30 下午 05:03:09
 * @extends {Tooltip_modal}
 * @param {List_item} _item
 * @param {String[]} _disable_option
 */
function List_menu(_item, _disable_option) {
    
    Tooltip_modal.call(this);
    
    this._set_list_item(_item, _disable_option);
}

List_menu.prototype = new Tooltip_modal();

// --------
// List Item
// --------

/**
 * @type {List_item}
 */
List_menu.prototype._item = null;

/**
 * 不使用的功能
 * @author Pulipuli Chen 20141111
 * @type Array<String>
 */
List_menu.prototype._disable_option = [];

/**
 * 預設不使用的功能
 * @author Pulipuli Chen 20141111
 * @type Array<String>
 */
List_menu.prototype._default_disable_option = [];

List_menu.prototype._set_list_item = function (_item, _disable_option) {
    if ($.isset(_item))
    {
        var _this = this;
        
        this._item = _item;
        this._item.add_listener('set', function (_item) {
            _this.set_data();
        });
        
        // -----------------------------
        /**
         * @author Pulipuli Chen 20141111
         * 為_disable_option多加一些功能
         */
        if ($.is_string(_disable_option)) {
            _disable_option = [_disable_option];
        }
        
        if ($.is_array(_disable_option)) {
            this._disable_option = _disable_option;
        }
        
        for (var _i in this._default_disable_option) {
            this._disable_option.push(this._default_disable_option[_i]);
        }
    }
    return this;
};

List_menu.prototype.set_data = function () {
    this._toggle_is_my();
    this._listen_auth();
};

// --------
// UI
// --------

/**
 * 基本的樣板
 * @type String
 */
List_menu.prototype._$template = '<div><table cellpadding="0" cellspacing="0" align="right"><tbody>'
    + '<tr class="timestamp-container select-container review-container view-container respond-container delete-container edit-container"></tr>'
    + '</tbody></table><span>&nbsp;</span></div>';

/**
 * Create UI
 * @memberOf {List_menu}
 * @type {jQuery} UI
 */
List_menu.prototype._$create_ui = function ()
{
    var _writable = KALS_context.policy.writable();
    
    var _ui = $(this._$template)
        .addClass('list-menu')
        .addClass(this._not_login_classname);
    
    //var _tr = _ui.find('tr:first');
    
    if (KALS_CONFIG.enable_annotation_editor === true
        && this.is_enable('edit') && _writable === true) {
        var _edit = this._create_edit_ui();
        _edit.appendTo(_ui.find(".edit-container"));
    }
    
    if (this.is_enable('delete') && _writable === true) {
        var _delete = this._create_delete_ui();
        _delete.appendTo(_ui.find(".delete-container"));
    }
    
    if (this.is_enable('respond') && _writable === true) {
        var _respond = this._create_respond_ui();
        _respond.appendTo(_ui.find(".respond-container"));    
    }
    
    //$.test_msg('List_menu._$create_ui() this._enable_view_thread', this._enable_view_thread);
    //if (this._enable_view_thread == true)
    if (this.is_enable('view')) {
        var _view = this._create_view_ui();
        _view.appendTo(_ui.find(".view-container"));    
    }
    if (this.is_enable('review')) {
        var _review = this._create_review_ui();
        _review.appendTo(_ui.find(".review-container"));    
    }
    
    if (this.is_enable('select')) {
        if (KALS_text.selection.select.equals(this._item.get_scope_coll()) === false) {
            var _select = this._create_select_ui();
            _select.appendTo(_ui.find(".select-container"));    
        }   
    }
    
    var _timestamp = this._setup_timestamp();
    _timestamp.get_ui().prependTo(_ui.find(".timestamp-container"));
    
    return _ui;
};

List_menu.prototype.is_enable = function (_option_name) {
    if (_option_name === undefined || _option_name === null || this._disable_option === null || this._disable_option === undefined || this._disable_option.length === 0) {
        return true;
    }
    else {
        return ($.inArray(_option_name, this._disable_option) === -1);
    }
};

// --------
// List_timestamp_component
// --------

/**
 * @type {List_timestamp_component}
 */
List_menu.prototype.timestamp = null;
List_menu.prototype.timestamp_full_dispaly = false;

List_menu.prototype._setup_timestamp = function () {
    var _component = new List_timestamp_component(this._item, this.timestamp_full_dispaly);
    this.child('timestamp', _component);
    return _component;
};

// -------
// Other UI
// -------

List_menu.prototype._create_edit_ui = function () {
    var _ui = $('<td></td>')
        .addClass('list-menu-option')
        .addClass('edit');
        
    var _lang = new KALS_language_param(
        'EDIT',
        'list_menu.edit'
    );
    
    var _msg = KALS_context.lang.line(_lang);
    _ui.html(_msg);
    
    var _this = this;
    _ui.click(function (_e) {
        _this.edit_annotation();
        _this.close();
        _e.preventDefault();
        return false;
    });
    
    _ui.setup_hover();
    
    return _ui;
};

List_menu.prototype._create_delete_ui = function () {
    var _ui = $('<td></td>')
        .addClass('list-menu-option')
        .addClass('delete');
        
    var _lang = new KALS_language_param(
        'DELETE',
        'list_menu.delete'
    );
    
    var _msg = KALS_context.lang.line(_lang);
    _ui.html(_msg);
    
    var _this = this;
    _ui.click(function (_e) {
        _this.delete_annotation();
        _e.preventDefault();
        return false;
    });
    
    _ui.setup_hover();
    
    return _ui;
};

List_menu.prototype._create_respond_ui = function () {
    var _ui = $('<td></td>')
        .addClass('list-menu-option')
        .addClass('respond');
        
    var _lang = new KALS_language_param(
        'RESPOND',
        'list_menu.respond'
    );
    
    var _msg = KALS_context.lang.line(_lang);
    _ui.html(_msg);
    
    var _this = this;
    _ui.click(function () {
        _this.respond_annotation();
    });
    
    _ui.setup_hover();
    
    this.child("respond", _ui);
    
    return _ui;
};

List_menu.prototype._create_view_ui = function () {
    var _ui = $('<td></td>')
        .addClass('list-menu-option')
        .addClass('view');
        
    var _lang = new KALS_language_param(
        'VIEW',
        'list_menu.view'
    );
    
    var _msg = KALS_context.lang.line(_lang);
    _ui.html(_msg);
    
    var _this = this;
    _ui.click(function () {
        //_this.view_thread();
        _this.respond_annotation();
    });
    
    _ui.setup_hover();
    
    this.child("view", _ui);
    
    return _ui;
};

List_menu.prototype._create_review_ui = function () {
    var _ui = $('<td></td>')
        .addClass('list-menu-option')
        .addClass('review');
        
    var _lang = new KALS_language_param(
        'REVIEW',
        'list_menu.review'
    );
    
    var _msg = KALS_context.lang.line(_lang);
    _ui.html(_msg);
    
    var _this = this;
    _ui.click(function () {
        //$.test_msg("click review_ui");
        _this.view_thread();
    });
    
    _ui.setup_hover();
    
    return _ui;
};

/**
 * 選擇位置的按鈕
 * @author 20131115 Pulipuli Chen
 */
List_menu.prototype._create_select_ui = function () {
    var _ui = $('<td></td>')
        .addClass('list-menu-option')
        .addClass('select');
        
    var _lang = new KALS_language_param (
        'SELECT',
        'list_menu.select'
    );
    
    var _msg = KALS_context.lang.line(_lang);
    _ui.html(_msg);
    
    var _this = this;
    _ui.click(function () {
        _this.select();
    });
    
    _ui.setup_hover();
    
    return _ui;
};


// --------
// Get Data Methods
// --------

/**
 * @type {Annotation_editor}
 */
List_menu.prototype.get_editor = function () {
    //return KALS_text.tool.editor_container.editor;
    return this._item.get_editor();
};

/**
 * 取得標註的ID
 * @returns {Number}
 */
List_menu.prototype.get_annotation_id = function () {
    return this._item.get_data().annotation_id;
};


/**
 * 取得標註參數
 * @returns {Annotation_param}
 */
List_menu.prototype.get_annotation_param = function () {
    return this._item.get_data();
};

/**
 * 顯示討論視窗
 * @param {function} _callback
 */
List_menu.prototype.view_thread = function (_callback) {
    if ($.isset(this._item)) {
        // @20130604 Pudding Chen
        // 不知道為什麼關掉這串就會恢復正常
        this._item.view_thread(_callback);
        this.close();
    }   
    return this;
};

/**
 * 選擇標註所在的指定位置
 * @param {function} _callback
 */
List_menu.prototype.select = function (_callback) {
    if ($.isset(this._item))
    {
        this._item.select(_callback);
        this.close();
    }   
    return this;
};

List_menu.prototype.get_topic_id = function () {
    return this._item.get_topic_id();
};

List_menu.prototype.is_my_annotation = function () {
    return this._item.get_data().is_my_annotation();
};


// --------
// Public Methods
// --------

List_menu.prototype.edit_annotation = function () {
    this._item.edit_annotation();
    return this;
};

/**
 * 回應標註
 * @author Pudding 20151103
 * @returns {List_menu.prototype}
 */
List_menu.prototype.respond_annotation = function () {
    $.test_msg("respond_annotation", this._item.respond_annotation);
    this._item.respond_annotation();
    
    return this;
};

// --------
// Delete Method
// --------

List_menu.prototype._delete_url = 'annotation_setter/delete';

List_menu.prototype._delete_lock = false;


/**
 * 刪除標註
 * @returns {List_menu}
 */
List_menu.prototype.delete_annotation = function () {
    
    if (this.is_loading() === true) {
        return this;
    }
    
    var _annotation_id = this.get_annotation_id();
    var _annotation_param = this.get_annotation_param();
    
    if ($.is_null(_annotation_id)) {
        return this;
    }
        
    var _this = this;
    
    var _callback = function (_data) {
        //回傳的資料是重新讀取的my annotation範圍，回傳資料的形態請參考annotation_getter/my
        if (_data !== false) {   //如果是錯誤的狀況，才會回傳false
            
            //因為範圍改變了，所以需要重新讀取
            KALS_text.load_my.reload(_data, function () {
                _this._item.remove();
                
                //$.test_msg('Item remove()');
                
                var _lang = new KALS_language_param(
                    'Annotation #{0} is deleted.',
                    'list_menu.delete_complete',
                    [_annotation_id]
                );
                KALS_util.notify(_lang);
                
                _this._toggle_loading(false);
                
                // 設定計數
                _this._set_anntation_count_reduce(_annotation_param);
                KALS_context.user.load_user_params();
                
                var _editor = _this.get_editor();
                if ($.isset(_editor._editing_param)
                    && _editor._editing_param.annotation_id === _annotation_id)
                {
                    _editor.reset();
                }
            });
            
            if (typeof(_data.nav) !== 'undefined') {
                var _nav_data = _data.nav;
                if (KALS_context.user.get_anchor_navigation_type() === 'all') {
                    KALS_text.load_navigation.reload(_nav_data);
                }
            }
        }
    };
    
    var _config = {
        data: _annotation_id,
        url: this._delete_url,
        callback: _callback
    };
    
    this._toggle_loading(true);
    
    //_callback({}); return;
    
    KALS_util.ajax_get(_config);
    return this;
};

/**
 * 減少Context_user的標註次數
 * @param {Annotation_param} _annotation_param
 * @returns {List_menu}
 */
List_menu.prototype._set_anntation_count_reduce = function (_annotation_param) {
    
    // ------------------------
    // 加入Context_user的計數
    /*
    var _is_respond = _annotation_param.is_respond();
    var _annotation_type_param = _annotation_param.type;
    if (_is_respond === false) {
        //$.test_msg("create callback", _annotation_type_param);
        KALS_context.user.set_topic_annotation_count_reduce(_annotation_type_param);
    } 
    else {
        var _topic_annotation_param = _annotation_param.topic;
        var _is_my_topic = _topic_annotation_param.is_my_annotation();
        
        if (_is_my_topic) {
            KALS_context.user.set_respond_to_my_annotation_count_reduce(_annotation_type_param);
        }
        else {
            KALS_context.user.set_respond_to_other_annotation_count_reduce(_annotation_type_param);
        }
    }
    */
    //$.test_msg("List_menu._set_anntation_count_reduce()", "減少標註");
    KALS_context.user.set_annotation_count_reduce_by_param(_annotation_param);
    return this;
};

// --------
// My & Login
// --------

List_menu.prototype._is_my_classname = 'is-my';

List_menu.prototype._toggle_is_my = function (_is_my) {
    
    if ($.is_null(_is_my))
    {
        _is_my = this.is_my_annotation();
    }
    
    var _ui = this.get_ui();
    if (_is_my === true)
    {
        _ui.addClass(this._is_my_classname);
    }
    else
    {
        _ui.removeClass(this._is_my_classname);
    }
    return this;
};

List_menu.prototype._not_login_classname = 'not-login';

List_menu.prototype._listen_auth = function () {
    var _not_login_classname = this._not_login_classname;
    var _ui = this.get_ui();
    
    /*
    KALS_context.auth.add_listener(function (_auth) {
        if (_auth.is_login() == true)
        {
            _ui.removeClass(_not_login_classname);
        }
        else
        {
            _ui.addClass(_not_login_classname);
        }
    }, true);
    */
    KALS_context.policy.add_attr_listener('write', function (_policy) {
        if (_policy.writable() === true) {
            _ui.removeClass(_not_login_classname);
        }
        else {
            _ui.addClass(_not_login_classname);
        }
    }, true);
};

// --------
// Loading Methods
// -------- 

List_menu.prototype._loading_classname = 'loading';
List_menu.prototype._toggle_loading = function (_is_loading) {
    
    if ($.is_null(_is_loading)) {
		_is_loading = !(this.is_loading());
	}
    
    var _ui = this.get_ui();
    if (_is_loading === true) {
		_ui.addClass(this._loading_classname);
	}
	else {
		_ui.removeClass(this._loading_classname);
	}
    return this;
};

List_menu.prototype.is_loading = function () {
    var _ui = this.get_ui();
    return _ui.hasClass(this._loading_classname);
};

// ----------------------
// set_respond_wrtiable
// Context_policy
// ----------------------

/**
 * 禁止回應標註
 * @type String
 */
List_menu.prototype._deny_respond_writable_classname = "deny-respond-writable";

/**
 * 設定可否執行「回應」與「留言」
 * @param {Boolean} _writable
 * @returns {List_menu.prototype}
 */
List_menu.prototype.set_respond_writable = function (_writable) {
    var _ui = this.get_ui();
    if (_writable === true) {
        _ui.removeClass(this._deny_respond_writable_classname);
    }
    else {
        _ui.addClass(this._deny_respond_writable_classname);
    }
    
    return this;
};

/* End of file List_menu */
/* Location: ./system/application/views/web_apps/List_menu.js */