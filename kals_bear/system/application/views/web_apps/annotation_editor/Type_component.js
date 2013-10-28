/**
 * Type_component
 *
 * @package    KALS
 * @category   Webpage Application Libraries
 * @author     Pudding Chen <puddingchen.35@gmail.com>
 * @copyright  Copyright (c) 2010, Pudding Chen
 * @license    http://opensource.org/licenses/gpl-license.php GNU Public License
 * @link       http://sites.google.com/site/puddingkals/
 * @version    1.0 2010/10/18 下午 03:31:54
 * @extends {Event_dispatcher}
 * @param {Annotation_editor} _editor
 */
function Type_component(_editor) {
    
    Event_dispatcher.call(this);
    if ($.isset(_editor))
    {
        this._editor = _editor;
        this._default_type = new Annotation_type_param();
        //this._type = new Annotation_type_param();
        //$.test_msg('Type_component() _type', this._type.export_json());
    }
}

// Extend from KALS_user_interface
Type_component.prototype = new Event_dispatcher();

Type_component.prototype._$enable_changed_lock = false;

/**
 * @type {Annotation_editor}
 */
Type_component.prototype._editor = null;

/**
 * @type {Annotation_type_param}
 */
Type_component.prototype._default_type = null;

/**
 * @type {Type_menu}
 */
Type_component.prototype.menu = null;

/**
 * 現在所選擇的type
 * @type {Annotation_type_param}
 */
Type_component.prototype._type = null;

/**
 * Create UI
 * @memberOf {Type_component}
 * @type {jQuery} UI
 */
Type_component.prototype._$create_ui = function ()
{
    var _ui = $('<span></span>')
        .addClass('type-component');
    
    var _this = this;
    
    setTimeout(function () {
        _this.set_type();
    }, 0);
    
    var _menu = this._setup_menu();
    _menu.get_ui().appendTo(_ui);
    var _config = _menu._$get_config();
    
    //$.test_msg('Type_component._$create_ui()', _config);
    
    var _options = _menu.create_type_option_list();
    
    for (var _i in _options)
    {
        var _option = _options[_i];
        
        _option.tooltip(_config);
        
        if (_i == 'custom')
        {
            _option = this._create_custom_type_option(_option);
        }
        _option.hide().appendTo(_ui);
    }
    
    _ui.tooltip(_config);
    //_ui.setup_hover();
    
    
    this._listen_editor();
    
    return _ui;
};

/**
 * 
 * @param {Annotation_type_param} _type
 */
Type_component.prototype.set_type = function (_type) {
    
    //$.test_msg('Type_component.set_type()', _type);
    
    //if (_type == this._type
    //    && _type != null)
    
    //改變UI
    //var _ui = this.get_ui();
    //_ui.empty();
    
    if ($.is_null(_type))
        _type = this.get_type();
    else if ($.is_class(_type, 'Annotation_type_param') == false)
    {
        _type = new Annotation_type_param(_type);
    }
    
    //$.test_msg('Type_component.set_type()', [$.isset(this._type), _type.equals(this._type)]);
    
    if ($.isset(this._type)
        && _type.equals(this._type))
        return this;
    
    //$.test_msg('Type_component.set_type() pass', [_type.export_json(), _type.export_json()
    //    , _type.get_id(), _type.get_type_name()
    //    , _type.is_custom(), _type.has_custom_name()]);
    
    
    //_type = this.menu.filter_type(_type);
    
    //var _type_ui = this.menu.create_type_option(_type)
    //    .appendTo(_ui);
    
    var _ui = this.get_ui();
    
    _ui.children(':not(.' + _type.get_type_name() + ')').hide();
    _ui.children('.' + _type.get_type_name()).css('display', 'inline');
    
    if (_type.is_custom())
    {   
        if (_type.has_custom_name())
        {
            this.set_custom_name(_type.get_custom_name());    
        }
        else
        {
            this.reset_custom_name();
        }
    }
    
    this._type = _type;
    
    return this.notify_change();
};

Type_component.prototype.notify_change = function () {
    
    //通知監聽者
    this.notify_listeners(this._type);
    
    return this;
};

/**
 * @type {Annotation_type_param}
 */
Type_component.prototype.get_type = function () {
    if ($.is_null(this._type))
    {
        return this._default_type;
    }
    else
    {
        return this._type;
    }    
};


Type_component.prototype.get_default_type = function () {
    return this._default_type;
};


Type_component.prototype.reset_type = function () {
    this.reset_custom_name();
    return this.set_type(this._default_type);
};

Type_component.prototype._setup_menu = function () {
    
    var _menu = new Type_menu(this);
    this.menu = _menu;
    return _menu;
    
};

/**
 * 監聽Editor的動作來反應
 */
Type_component.prototype._listen_editor = function () {
    
    var _this = this;
    
    this._editor.add_listener('reset', function () {
        _this.reset_type();
    });
    
    this._editor.add_listener('set', function (_editor, _param) {
        _this.set_data(_param);
    });
    
    this._editor.add_listener('get', function (_editor, _annotation_param) {
        //$.test_msg('Type_component.listen_editor() get', _this.get_type());
        
        var _type = _this.get_type();
        
        //如果是預設值，則不回傳，由伺服器去取得預設值
        if (_type != _this._default_type)
        {
            _annotation_param.type.set_type(_type);
        }
            
    });
    
};

/**
 * 設置標註參數
 * @param {Annotation_param} _param
 */
Type_component.prototype.set_data = function (_param) {
    
    if ($.isset(_param)
        && typeof(_param.type) != 'undefined')
    {
        this.set_type(_param.type);
    }
    return this;
};

/**
 * 自訂選項
 */
Type_component.prototype._custom_type_option = null;

Type_component.prototype._create_custom_type_option = function (_option) {
    
    var _ui = $('<span></span>')
        .addClass('type-option')
        .addClass('custom');
        
    _ui.append(_option);
    
    var _custom = $('<input type="text" class="custom-type-option"></input>')
        .hide()
        .focus(function () {
            this.blur();
        })
        .appendTo(_ui);
    
    var _config = this.menu._$get_config();
    //_custom.tooltip(_config);
    _ui.tooltip(_config);
    
    _custom.mouseover(function () {
        _ui.tooltip().show();
    });
    
    this._custom_type_option = _ui;
    
    return _ui;
};

Type_component.prototype._custom_name = null;

Type_component.prototype.set_custom_name = function (_name) {
    
    var _classname = '.custom-type-option';
    if ($.isset(_name))
    {
        this._type.set_type(_name);
        
        this._custom_type_option.children(_classname)
            .val(_name)
            .css('display', 'inline');
            
        this._custom_type_option.children(':not(' + _classname + ')')
            .hide();
        
    }
    else
    {
        //this._type.reset_custom_name();
        
        this._custom_type_option.children(_classname)
            .val('')
            .hide();
        this._custom_type_option.children(':not(' + _classname + ')')
            .css('display', 'inline');
    }
    return this;
};

Type_component.prototype.reset_custom_name = function () {
    return this.set_custom_name();
};

/* End of file Type_component */
/* Location: ./system/application/views/web_apps/Type_component.js */