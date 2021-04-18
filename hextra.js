/*
* Hextra Todo:
*  - Add selection support
*  - Store loaded values on the elements and change the background class of cells when values are different than file
*  - Address conversions built into the editor
*  - Table support and text viewing
*  - hex to asm view -- for program views
*  - categorize different areas of a rom (similar to bookmarking)
*  - pointer table traversal
*  - pointer table data block auto-categorization and marking
*  - exporting/importing of data
*  - searching by "text" or hexadecimal value
*  - save most recent searches in history
*  - project saving
*  - file diff and comparison
*  - hextra must be converted to a class
* */

var hextra_sticky_headers_loaded = false;
var hextra_prolyfill_loaded = false;
var hextra_roboto_loaded = false;

var int = parseInt;
var str = String;
var float = parseFloat;
String.prototype.format = function() {
  let s = this;
  for (let i = 0; i < arguments.length; i++) {
    let reg = new RegExp("\\{" + i + "\\}", "gm");
    s = s.replace(reg, arguments[i]);
  }
  return s;
};

const hextra_template = `
  <table class="hextra-table table table-striped table-dark table-bordered">
          <thead class="thead-light">
            <div class="hextra-header">
            <tr class="hextra-file-menu-row" style="text-align: left;">
              <th scope="col" class="top-header" colspan="17">
                <nav class="navbar navbar-expand navbar-dark bg-dark hextra-file-menu">
                  <img alt="Hextra Icon" title="Hextra" class="hextra-logo" src="./hextra.svg"/>
                  <ul class="navbar-nav mr-auto">
                      <li class="nav-item dropdown">
                        <a class="nav-link" href="#" id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                          File
                        </a>
                        <div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                          <a class="dropdown-item" href="#">Load File</a>
                          <a class="dropdown-item" href="#">Load Table</a>
                          <div class="dropdown-divider"></div>
                          <a class="dropdown-item" href="#">Save</a>
                          <a class="dropdown-item" href="#">Export Selection</a>
                        </div>
                      </li>
                      <li class="nav-item">
                        <a class="nav-link" onclick="showhextraAbout()">About</a>
                      </li>
                    </ul>
                    <div class="form-inline">
                      <input class="form-control search-control mr-2" type="search" placeholder="Search" aria-label="Search">
                    </div>
                </nav>
              </th>
            </tr>
            <tr>
              <th scope="col" class="file-pos-header">FILE POSITION</th>
              <th scope="col" class="hex-header">0</th>
              <th scope="col" class="hex-header">1</th>
              <th scope="col" class="hex-header">2</th>
              <th scope="col" class="hex-header">3</th>
              <th scope="col" class="hex-header">4</th>
              <th scope="col" class="hex-header">5</th>
              <th scope="col" class="hex-header">6</th>
              <th scope="col" class="hex-header">7</th>
              <th scope="col" class="hex-header">8</th>
              <th scope="col" class="hex-header">9</th>
              <th scope="col" class="hex-header">A</th>
              <th scope="col" class="hex-header">B</th>
              <th scope="col" class="hex-header">C</th>
              <th scope="col" class="hex-header">D</th>
              <th scope="col" class="hex-header">E</th>
              <th scope="col" class="hex-header">F</th>
            </tr>
            </div>
          </thead>
          <tbody class="hextra-data-rows">
            {0}
          </tbody>
        </table>`;

const hextra_row_template = `
<tr class="hex-row" id="hxr_{17}">
  <th scope="row" class="file-pos">{0}</th>
  <td id="hxc_{17}" class="hex-col" contenteditable="true">{1}</td>
  <td id="hxc_{18}" class="hex-col" contenteditable="true">{2}</td>
  <td id="hxc_{19}" class="hex-col" contenteditable="true">{3}</td>
  <td id="hxc_{20}" class="hex-col" contenteditable="true">{4}</td>
  <td id="hxc_{21}" class="hex-col" contenteditable="true">{5}</td>
  <td id="hxc_{22}" class="hex-col" contenteditable="true">{6}</td>
  <td id="hxc_{23}" class="hex-col" contenteditable="true">{7}</td>
  <td id="hxc_{24}" class="hex-col" contenteditable="true">{8}</td>
  <td id="hxc_{25}" class="hex-col" contenteditable="true">{9}</td>
  <td id="hxc_{26}" class="hex-col" contenteditable="true">{10}</td>
  <td id="hxc_{27}" class="hex-col" contenteditable="true">{11}</td>
  <td id="hxc_{28}" class="hex-col" contenteditable="true">{12}</td>
  <td id="hxc_{29}" class="hex-col" contenteditable="true">{13}</td>
  <td id="hxc_{30}" class="hex-col" contenteditable="true">{14}</td>
  <td id="hxc_{31}" class="hex-col" contenteditable="true">{15}</td>
  <td id="hxc_{32}" class="hex-col" contenteditable="true">{16}</td>
</tr>`;

$('head').append(`<link rel="stylesheet" href="hextra-style.css">`);

if (typeof $().emulateTransitionEnd !== 'function') {  // bootstrap is not loaded...
    $('head').append(`<link rel='stylesheet' 
        href='https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.6.0/css/bootstrap.min.css'>`);
    $.getScript("https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.6.0/js/bootstrap.min.js");
}

if (typeof bootbox == "undefined") { // load bootbox...
    $.getScript("https://cdnjs.cloudflare.com/ajax/libs/bootbox.js/5.5.2/bootbox.min.js");
}

function showhextraAbout(){
    bootbox.alert({
        message: `<strong>hextra v0.01 - DackR 2021</strong><br>
Using the following open source projects:<br>
<a href="https://github.com/ausi/cq-prolyfill" target="_blank">cq-prolyfill v0.4</a><br>
<a href="https://github.com/jmosbech/StickyTableHeaders" target="_blank">StickyTableHeaders v0.1.24</a><br>
<a href="https://github.com/jquery/jquery" target="_blank">jQuery v3.6</a><br>
<a href="https://github.com/twbs/bootstrap" target="_blank">Twitter Bootstrap v4.6</a><br>
<a href="https://github.com/makeusabrew/bootbox" target="_blank">Bootbox 5.5.2</a><br>`,
        backdrop: true
    });
}

var HextraHelper = function() {}
// Helper "class" for getting and setting the caret position
HextraHelper.setCaretPos = function(element, position){
    let setpos = document.createRange();  // Creates range object
    let set = window.getSelection();  // Creates object for selection

    setpos.setStart(element.childNodes[0], position);  // Set start position of range

    setpos.collapse(true);  // Collapse range within its boundary points
    set.removeAllRanges();  // Remove all ranges set

    set.addRange(setpos);  // Add range with respect to range object.
    element.focus();  // Set cursor on focus
}
HextraHelper.getCaretPos = function(element){
    let caretPos = 0, sel, range;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
            range = sel.getRangeAt(0);
            if (range.commonAncestorContainer.parentNode === element) {
                caretPos = range.endOffset;
            }
        }
    } else if (document.selection && document.selection.createRange) {
        range = document.selection.createRange();
        if (range.parentElement() === element) {
            let tempEl = document.createElement("span");
            element.insertBefore(tempEl, element.firstChild);
            let tempRange = range.duplicate();
            tempRange.moveToElementText(tempEl);
            tempRange.setEndPoint("EndToEnd", range);
            caretPos = tempRange.text.length;
        }
    }
    return caretPos;
}
HextraHelper.setCharAtIndex = function(inString, index, char){
    if(index > inString.length-1) return inString;
    return inString.substring(0,index) + char + inString.substring(index+1);
}
HextraHelper.toHex = function(number, padding=null) {
    let hex = Number(number).toString(16).toUpperCase();
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;
    while (hex.length < padding) {
        hex = "0" + hex;
    }
    return hex;
}

class Hextra {
    constructor() {
        this.container = null;
        this.font_min = .5; // in rem units
        this.font_max = 2.2;
        this.min_width = 450; // in pixels
        this.max_width = 2048;
        this.auto_size_steps = 100; // number of steps in the font resize ramp
        this.sticky_headers = true;
        this.default_file_length = 512; // in bytes
        this.dynamic_resize = true;
        this.load_font = true;
        this.delete_value = 0;

        if (arguments.length === 1){
            if (arguments[0].constructor === Object) {
                // evaluate kwargs options dictionary
                Object.assign(this, arguments[0]);
            }else{
                Object.assign(this, {container: arguments[0]});
            }
        }else if (arguments.length > 1){
            if (arguments[1].constructor === Object) {
                // evaluate kwargs
                Object.assign(this, arguments[1]);
            }else{
                throw "hextra Error: Second argument must be an options dictionary."
            }
        }else{
            throw "hextra Error: Options or arguments must be supplied."
        }
        if (this.container == null) throw "hextra Error: The container parameter is required."

        let data_rows = '';
        for (let c=0; c<this.default_file_length; c+=16){
            data_rows += hextra_row_template.format(HextraHelper.toHex(c, 12),
                '00','00','00','00','00','00','00','00','00','00','00','00','00','00','00','00',
                c, c+1, c+2, c+3, c+4, c+5, c+6, c+7, c+8, c+9, c+10, c+11, c+12, c+13, c+14, c+15);
        }

        $(`${this.container}`).html(hextra_template.format(data_rows));

        if (this.load_font && !hextra_roboto_loaded) {
            hextra_roboto_loaded = true;
            $('head').append(`
            <link rel="preconnect" href="https://fonts.gstatic.com">
            <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap" rel="stylesheet">`);
        }

        if (this.sticky_headers) {
            if (!hextra_sticky_headers_loaded) {
                hextra_sticky_headers_loaded = true;
                $.getScript("https://unpkg.com/sticky-table-headers@0.1.24/js/jquery.stickytableheaders.min.js");
            }
            let container = this.container;
            setTimeout(function () {
                $(`${container} .hextra-table`).stickyTableHeaders();
            }, 1000);
        }

        // Set the dynamic ui font resize style rules
        if (!this.dynamic_resize) this.font_max = 0;
        else if (!hextra_prolyfill_loaded) {
            hextra_prolyfill_loaded = true;
            $.getScript("./cq-prolyfill.min.js");
        }
        // either set the billions of style rules, or just set a static size
        this.initFontSize();

        // remove the pedantic cell selection code... selection is handled elsewhere. Handle keydown.
        $(`${this.container} .hex-col`).attr('unselectable', 'on')
            .css('user-select', 'none').on('selectstart', false).on('keydown', this.hxKeyDown);
    }

    hxKeyDown(e) {
        let target = $(e.target);
        let index = int(target.attr('id').split('_')[1]);
        let next_elem = $(`#hxc_${index + 1}`);
        let prev_elem = $(`#hxc_${index - 1}`);
        let keycode = e.keyCode;
        let pos = HextraHelper.getCaretPos(e.target);
        let shift = e.shiftKey;
        console.log(keycode, e);

        let is_allowed = (keycode > 47 && keycode < 58) ||  // top-row numbers
            (keycode > 95 && keycode < 112) || // numpad
            (keycode > 64 && keycode < 71);  // allowed letters a-f

        let is_nav = (keycode > 32 && keycode < 41) || keycode === 9;

        if (is_allowed) {
            if (pos === 2){
                let next_str = HextraHelper.setCharAtIndex(next_elem.text(), 0, String.fromCharCode(keycode));
                next_elem.text(next_str);
                HextraHelper.setCaretPos(next_elem.get(0), 1);
            }else{
                let new_str = HextraHelper.setCharAtIndex(target.text(), pos, String.fromCharCode(keycode));
                target.text(new_str);
                HextraHelper.setCaretPos(target.get(0), pos + 1);
            }
        } else if (is_nav){
            let scroll_elem = null;
            if (keycode === 37 && pos === 0 && prev_elem.length) {
                scroll_elem = prev_elem.get(0);
                HextraHelper.setCaretPos(scroll_elem, 2);}  // left
            else if (keycode === 37) { return true; }  // left
            else if (keycode === 39 && pos === 2 && next_elem.length ) {
                scroll_elem = next_elem.get(0);
                HextraHelper.setCaretPos(scroll_elem, 0);}  // right
            else if (keycode === 39){ return true; }
            else if (keycode === 9 && shift && prev_elem.length) {
                scroll_elem = prev_elem.get(0);
                HextraHelper.setCaretPos(scroll_elem, pos);
            }
            else if (keycode === 9 && next_elem.length) {
                scroll_elem = next_elem.get(0);
                HextraHelper.setCaretPos(scroll_elem, pos);
            }
            else if (keycode === 38){ // up keypress
                let top_elem = $(`#hxc_${index - 16}`);
                if (top_elem.length) {
                    scroll_elem = top_elem.get(0);
                    HextraHelper.setCaretPos(scroll_elem, pos);
                } else { scroll_elem = e.target; }  // still make sure the current column is visible
            }
            else if (keycode === 40){ // down keypress
                let bot_elem = $(`#hxc_${index + 16}`);
                if (bot_elem.length) {
                    scroll_elem = bot_elem.get(0);
                    HextraHelper.setCaretPos(scroll_elem, pos);
                } else { scroll_elem = e.target; }  // make sure the current column is on the screen
            }
            else if(keycode>32&&keycode<37){  // page up/down home/end
                return true;
            }

            if (scroll_elem){
                scroll_elem.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
            }
        }
        return false;
    }

    initFontSize(){
        let options = this;
        console.log(options);
        let styles = `${options.container}>table {font-size: ${options.font_min}rem;}`;

        if (!(options.font_min  === options.font_max || options.max_width === 0)){
            let rem_change = (options.font_max - options.font_min) / options.auto_size_steps;
            let res_change = (options.max_width - options.min_width) / options.auto_size_steps;
            let this_rem = options.font_min + rem_change;
            let this_res = options.min_width;
            console.log(rem_change, res_change, this_rem, this_res);
            for (let c=0; c<=options.auto_size_steps;c++){
                styles += `
                ${options.container}>table[data-cq~="min-width:${this_res}px"] {font-size: ${this_rem}rem;}`;
                this_res+= res_change;
                this_rem+= rem_change;
            }
        }

        let style_container = str(options.container).replace(
            '-', '_').replace(
                ".", "").replace(
                    "#", "") + "_styles";
        $('head').append(`<style id="${style_container}">${styles}</style>`);
    }
}