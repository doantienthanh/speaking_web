/*
*   This content is licensed according to the W3C Software License at
*   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
*/
var storeWCAG = storeWCAG || {};

storeWCAG.Utils = storeWCAG.Utils || {};

(function () {
  /*
   * When util functions move focus around, set this true so the focus listener
   * can ignore the events.
   */
  storeWCAG.Utils.IgnoreUtilFocusChanges = false;

  storeWCAG.Utils.dialogOpenClass = 'has-dialog';

  /**
   * @desc Set focus on descendant nodes until the first focusable element is
   *       found.
   * @param element
   *          DOM node for which to find the first focusable descendant.
   * @returns
   *  true if a focusable element is found and focus is set.
   */
  storeWCAG.Utils.focusFirstDescendant = function (element) {
    for (var i = 0; i < element.childNodes.length; i++) {
      var child = element.childNodes[i];
      if (storeWCAG.Utils.attemptFocus(child) ||
          storeWCAG.Utils.focusFirstDescendant(child)) {
			
        return true;
      }
    }
    return false;
  }; // end focusFirstDescendant

  /**
   * @desc Find the last descendant node that is focusable.
   * @param element
   *          DOM node for which to find the last focusable descendant.
   * @returns
   *  true if a focusable element is found and focus is set.
   */
  storeWCAG.Utils.focusLastDescendant = function (element) {
    for (var i = element.childNodes.length - 1; i >= 0; i--) {
      var child = element.childNodes[i];
      if (storeWCAG.Utils.attemptFocus(child) ||
          storeWCAG.Utils.focusLastDescendant(child)) {
        return true;
      }
    }
    return false;
  }; // end focusLastDescendant

  /**
   * @desc Set Attempt to set focus on the current node.
   * @param element
   *          The node to attempt to focus on.
   * @returns
   *  true if element is focused.
   */
  storeWCAG.Utils.attemptFocus = function (element) {
	if (!storeWCAG.Utils.isFocusable(element)) {
      return false;
    }

    storeWCAG.Utils.IgnoreUtilFocusChanges = true;
    try {
    element.focus();
    }
    catch (e) {
    }
	storeWCAG.Utils.IgnoreUtilFocusChanges = false;
	  return (document.activeElement === element);
  }; // end attemptFocus

  /* Modals can open modals. Keep track of them with this array. */
  storeWCAG.OpenDialogList = storeWCAG.OpenDialogList || new Array(0);

  /**
   * @returns the last opened dialog (the current dialog)
   */
  storeWCAG.getCurrentDialog = function () {
    if (storeWCAG.OpenDialogList && storeWCAG.OpenDialogList.length) {
      return storeWCAG.OpenDialogList[storeWCAG.OpenDialogList.length - 1];
    }
  };

  // storeWCAG.closeCurrentDialog = function (event) {
  //   var key = event.which || event.keyCode;
  //   if (key === storeWCAG.KeyCode.ESC) {
  //     var currentDialog = storeWCAG.getCurrentDialog();
  //     if (currentDialog) {
  //       currentDialog.close();
  //       event.stopPropagation();
  //     }
  //   }
  // };

  storeWCAG.closeCurrentDialog = function () {
    var currentDialog = storeWCAG.getCurrentDialog();
    if (currentDialog) {
      currentDialog.close();
      return true;
    }

    return false;
  };

  storeWCAG.handleEscape = function (event) {
    
    var key = event.which || event.keyCode;
       
    if (key === storeWCAG.KeyCode.ESC && storeWCAG.closeCurrentDialog()) {
	    event.stopPropagation();
  	}
	
  };

  storeWCAG.onDocumentClick = function (event) {
    
    var OpenDialogListLength = storeWCAG.OpenDialogList.length;
    
    if(OpenDialogListLength > 0 && !storeWCAG.getCurrentDialog().dialogNode.contains(event.target)) {

      if (storeWCAG.closeCurrentDialog()) {
	    event.stopPropagation();
      }
   }
	};

  document.addEventListener('keyup', storeWCAG.handleEscape);
    
   /**
   * @constructor
   * @desc Dialog object providing modal focus management.
   *
   * Assumptions: The element serving as the dialog container is present in the
   * DOM and hidden. The dialog container has role='dialog'.
   *
   * @param dialogId
   *          The ID of the element serving as the dialog container.
   * @param focusAfterClosed
   *          Either the DOM node or the ID of the DOM node to focus when the
   *          dialog closes.
   * @param focusFirst
   *          Optional parameter containing either the DOM node or the ID of the
   *          DOM node to focus when the dialog opens. If not specified, the
   *          first focusable element in the dialog will receive focus.
   */
  storeWCAG.Dialog = function (dialogId, focusAfterClosed, focusFirst, modalType) {
    
    if( modalType == 'foundation') {
      document.addEventListener('mouseup', storeWCAG.onDocumentClick);
    }
    this.dialogNode = document.getElementById(dialogId);
    if (this.dialogNode === null) {
      throw new Error('No element found with id="' + dialogId + '".');
    }

    var validRoles = ['dialog', 'alertdialog'];
    var isDialog = (this.dialogNode.getAttribute('role') || '')
      .trim()
      .split(/\s+/g)
      .some(function (token) {
        return validRoles.some(function (role) {
          return token === role;
        });
      });
    if (!isDialog) {
      throw new Error(
        'Dialog() requires a DOM element with ARIA role of dialog or alertdialog.');
    }

    // Wrap in an individual backdrop element if one doesn't exist
    // Native <dialog> elements use the ::backdrop pseudo-element, which
    // works similarly.
    // var backdropClass = 'dialog-backdrop';
    // if (this.dialogNode.parentNode.classList.contains(backdropClass)) {
    //   this.backdropNode = this.dialogNode.parentNode;
    // }
    // else {
    //   this.backdropNode = document.createElement('div');
    //   this.backdropNode.className = backdropClass;
    //   this.dialogNode.parentNode.insertBefore(this.backdropNode, this.dialogNode);
    //   this.backdropNode.appendChild(this.dialogNode);
    // }
    // this.backdropNode.classList.add('active');

    // // Disable scroll on the body element
    document.documentElement.classList.add(storeWCAG.Utils.dialogOpenClass);
    //document.getElementsByTagName('html')[0].style.overflow='hidden';
    //this.dialogId = dialogId;
    if (typeof focusAfterClosed === 'string') {
      this.focusAfterClosed = document.getElementById(focusAfterClosed);
    }
    else if (typeof focusAfterClosed === 'object') {
      this.focusAfterClosed = focusAfterClosed;
    }
    else {
      this.focusAfterClosed = $('body');
    }

    if (typeof focusFirst === 'string') {
      this.focusFirst = document.getElementById(focusFirst);
    }
    else if (typeof focusFirst === 'object') {
      this.focusFirst = focusFirst;
    }
    else {
      this.focusFirst = null;
    }

    // Bracket the dialog node with two invisible, focusable nodes.
    // While this dialog is open, we use these to make sure that focus never
    // leaves the document even if dialogNode is the first or last node.
    var preDiv = document.createElement('div');
    this.preNode = this.dialogNode.parentNode.insertBefore(preDiv,
      this.dialogNode);
    this.preNode.tabIndex = 0;
    //this.preNode.className = "preNode";
    var postDiv = document.createElement('div');
    this.postNode = this.dialogNode.parentNode.insertBefore(postDiv,
      this.dialogNode.nextSibling);
    this.postNode.tabIndex = 0;
    //this.postNode.className = "postNode";

    // If this modal is opening on top of one that is already open,
    // get rid of the document focus listener of the open dialog.
    if (storeWCAG.OpenDialogList.length > 0) {
      storeWCAG.getCurrentDialog().removeListeners();
    }

    this.addListeners();
    storeWCAG.OpenDialogList.push(this);
    //this.clearDialog();
    $(this.dialogNode).css('display','block'); // make visible

    if (this.focusFirst) {
      this.focusFirst.focus();
    }
    else {
      storeWCAG.Utils.focusFirstDescendant(this.dialogNode);
    }

    this.lastFocus = document.activeElement;
  }; // end Dialog constructor

  /*storeWCAG.Dialog.prototype.clearDialog = function () {
    Array.prototype.map.call(
      this.dialogNode.querySelectorAll("input:not([type='hidden']):not([type='submit']),textarea"),
      function (input) {
        input.value = '';
      }
    );
  };*/

  /**
   * @desc
   *  Hides the current top dialog,
   *  removes listeners of the top dialog,
   *  restore listeners of a parent dialog if one was open under the one that just closed,
   *  and sets focus on the element specified for focusAfterClosed.
   */
  storeWCAG.Dialog.prototype.close = function () {
    storeWCAG.OpenDialogList.pop();
    // for(var i=storeWCAG.OpenDialogList.length-1;i>=0;i--){ //To remove multiple dialog entries with same ID
    //   if(storeWCAG.OpenDialogList[i].dialogNode.id === this.dialogId) {
    //     storeWCAG.OpenDialogList.splice(i,1);
    //   }
    // }
    this.removeListeners();
    //$('.preNode,.postNode').remove(); // To remove all the appended pre and post nodes on dialog closes
    storeWCAG.Utils.remove(this.preNode);
    storeWCAG.Utils.remove(this.postNode);
    //$(this.dialogNode).css('display','none');
   // this.backdropNode.classList.remove('active');
    //this.backdropNode.remove();
    this.focusAfterClosed.focus();

    // If a dialog was open underneath this one, restore its listeners.
    if (storeWCAG.OpenDialogList.length > 0) {
      storeWCAG.getCurrentDialog().addListeners();
    }
    else {
      document.documentElement.classList.remove(storeWCAG.Utils.dialogOpenClass);
    }
  }; // end close

  /**
   * @desc
   *  Hides the current dialog and replaces it with another.
   *
   * @param newDialogId
   *  ID of the dialog that will replace the currently open top dialog.
   * @param newFocusAfterClosed
   *  Optional ID or DOM node specifying where to place focus when the new dialog closes.
   *  If not specified, focus will be placed on the element specified by the dialog being replaced.
   * @param newFocusFirst
   *  Optional ID or DOM node specifying where to place focus in the new dialog when it opens.
   *  If not specified, the first focusable element will receive focus.
   */
  storeWCAG.Dialog.prototype.replace = function (newDialogId, newFocusAfterClosed,
    newFocusFirst) {
    var closedDialog = storeWCAG.getCurrentDialog();
    storeWCAG.OpenDialogList.pop();
    this.removeListeners();
    storeWCAG.Utils.remove(this.preNode);
    storeWCAG.Utils.remove(this.postNode);
    //$('.prenode,.postnode').remove();
    $(this.dialogNode).css('display','none');
    //this.backdropNode.classList.remove('active');

    var focusAfterClosed = newFocusAfterClosed || this.focusAfterClosed;
    var dialog = new storeWCAG.Dialog(newDialogId, focusAfterClosed, newFocusFirst);
  }; // end replace

  storeWCAG.Dialog.prototype.addListeners = function () {
    document.addEventListener('focus', this.trapFocus, true);
  }; // end addListeners

  storeWCAG.Dialog.prototype.removeListeners = function () {
    document.removeEventListener('focus', this.trapFocus, true);
  }; // end removeListeners

  storeWCAG.Dialog.prototype.trapFocus = function (event) {
    if (storeWCAG.Utils.IgnoreUtilFocusChanges || event.target.innerHTML == undefined) {//if (!storeWCAG.Utils.IgnoreUtilFocusChanges && (currentDialog.lastFocus != document.activeElement)) {
      return;
    }
    var currentDialog = storeWCAG.getCurrentDialog();
    if (currentDialog.dialogNode.contains(event.target)) {
      currentDialog.lastFocus = event.target;
    }
    else {
      storeWCAG.Utils.focusFirstDescendant(currentDialog.dialogNode);
      if (currentDialog.lastFocus == document.activeElement) {
        storeWCAG.Utils.focusLastDescendant(currentDialog.dialogNode);
      }
      currentDialog.lastFocus = document.activeElement;
    }
  }; // end trapFocus

  
  window.storeWCAGOpenDialog = function (dialogId, focusAfterClosed, focusFirst, modalType) {
    var dialog = new storeWCAG.Dialog(dialogId, focusAfterClosed, focusFirst, modalType);
    // if(storeWCAG.OpenDialogList.length == 0){
    //   var dialog = new storeWCAG.Dialog(dialogId, focusAfterClosed, focusFirst);
    // }
    // else {
    //   for(i=0;i<storeWCAG.OpenDialogList.length;i++){
    //     if(storeWCAG.OpenDialogList[i].dialogNode.id != dialogId){
    //       //storeWCAG.OpenDialogList.splice(i,1);
    //       var dialog = new storeWCAG.Dialog(dialogId, focusAfterClosed, focusFirst);
    //     }
    //   }
    // }
  };

  window.storeWCAGCloseDialog = function (closeButton) {
    var topDialog = storeWCAG.getCurrentDialog();
    if (topDialog.dialogNode.contains(closeButton)) {
      topDialog.close();
    }
  }; // end closeDialog

  window.storeWCAGReplaceDialog = function (newDialogId, newFocusAfterClosed,
    newFocusFirst) {
    var topDialog = storeWCAG.getCurrentDialog();
    if (topDialog.dialogNode.contains(document.activeElement)) {
      topDialog.replace(newDialogId, newFocusAfterClosed, newFocusFirst);
    }
  }; // end replaceDialog

}());

/**
 * @namespace storeWCAG
 */

var storeWCAG = storeWCAG || {};

/**
 * @desc
 *  Key code constants
 */
storeWCAG.KeyCode = {
  BACKSPACE: 8,
  TAB: 9,
  RETURN: 13,
  ESC: 27,
  SPACE: 32,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  END: 35,
  HOME: 36,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  DELETE: 46
};

storeWCAG.Utils = storeWCAG.Utils || {};

// Polyfill src https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
storeWCAG.Utils.matches = function (element, selector) {
  if (!Element.prototype.matches) {
    Element.prototype.matches =
      Element.prototype.matchesSelector ||
      Element.prototype.mozMatchesSelector ||
      Element.prototype.msMatchesSelector ||
      Element.prototype.oMatchesSelector ||
      Element.prototype.webkitMatchesSelector ||
      function (s) {
        var matches = element.parentNode.querySelectorAll(s);
        var i = matches.length;
        while (--i >= 0 && matches.item(i) !== this) {}
        return i > -1;
      };
  }

  return element.matches(selector);
};

storeWCAG.Utils.remove = function (item) {
  if (item.remove && typeof item.remove === 'function') {
    return item.remove();
  }
  if (item.parentNode &&
      item.parentNode.removeChild &&
      typeof item.parentNode.removeChild === 'function') {
    return item.parentNode.removeChild(item);
  }
  return false;
};

storeWCAG.Utils.isFocusable = function (element) {

  if (element.tabIndex > 0 || (element.tabIndex === 0 && element.getAttribute('tabIndex') !== null)) {
    return true;
  }

  if (element.disabled) {
    return false;
  }

  switch (element.nodeName) {
    case 'A':
      return !!element.href && element.rel != 'ignore';
    case 'INPUT':
      return element.type != 'hidden' && element.type != 'file';
    case 'BUTTON':
    case 'SELECT':
    case 'TEXTAREA':
      return true;
    default:
      return false;
  }


};

storeWCAG.Utils.getAncestorBySelector = function (element, selector) {
  if (!storeWCAG.Utils.matches(element, selector + ' ' + element.tagName)) {
    // Element is not inside an element that matches selector
    return null;
  }

  // Move up the DOM tree until a parent matching the selector is found
  var currentNode = element;
  var ancestor = null;
  while (ancestor === null) {
    if (storeWCAG.Utils.matches(currentNode.parentNode, selector)) {
      ancestor = currentNode.parentNode;
    }
    else {
      currentNode = currentNode.parentNode;
    }
  }

  return ancestor;
};

storeWCAG.Utils.hasClass = function (element, className) {
  return (new RegExp('(\\s|^)' + className + '(\\s|$)')).test(element.className);
};

storeWCAG.Utils.addClass = function (element, className) {
  if (!storeWCAG.Utils.hasClass(element, className)) {
    element.className += ' ' + className;
  }
};

storeWCAG.Utils.removeClass = function (element, className) {
  var classRegex = new RegExp('(\\s|^)' + className + '(\\s|$)');
  element.className = element.className.replace(classRegex, ' ').trim();
};

storeWCAG.Utils.bindMethods = function (object /* , ...methodNames */) {
  var methodNames = Array.prototype.slice.call(arguments, 1);
  methodNames.forEach(function (method) {
    object[method] = object[method].bind(object);
  });
};
'use strict';
function initializeAccordion() {
Array.prototype.slice.call(document.querySelectorAll('.wacg-accordion')).forEach(function (accordion) {

  // Allow for multiple accordion sections to be expanded at the same time
  var allowMultiple = accordion.hasAttribute('data-allow-multiple');
  // Allow for each toggle to both open and close individually
  var allowToggle = (allowMultiple) ? allowMultiple : accordion.hasAttribute('data-allow-toggle');

  // Create the array of toggle elements for the accordion group
  var triggers = Array.prototype.slice.call(accordion.querySelectorAll('.wacg-accordion-trigger'));
  var panels = Array.prototype.slice.call(accordion.querySelectorAll('.wacg-accordion-panel'));


  accordion.addEventListener('click', function (event) {
    var target = event.target;
    if (target.classList)
    {
     if(!target.classList.contains('wacg-accordion-trigger') && target.parentElement && target.parentElement.classList.contains('wacg-accordion-trigger'))
    {
      target = target.parentElement;
    }
    if (target.classList.contains('wacg-accordion-trigger')) {
      // Check if the current toggle is expanded.
      var isExpanded = target.getAttribute('aria-expanded') == 'true';
      var active = accordion.querySelector('[aria-expanded="true"]');

      // without allowMultiple, close the open accordion
      if (!allowMultiple && active && active !== target) {
        // Set the expanded state on the triggering element
        active.setAttribute('aria-expanded', 'false');
        // Hide the accordion sections, using aria-controls to specify the desired section
        document.getElementById(active.getAttribute('aria-controls')).setAttribute('hidden', '');

        // When toggling is not allowed, clean up disabled state
        // if (!allowToggle) {
        //   active.removeAttribute('aria-disabled');
        // }
      }

      if (!isExpanded) {
        // Set the expanded state on the triggering element
        target.setAttribute('aria-expanded', 'true');
        // Hide the accordion sections, using aria-controls to specify the desired section
        try {
          document.getElementById(target.getAttribute('aria-controls')).removeAttribute('hidden');
        }
        catch(e){}
        // If toggling is not allowed, set disabled state on trigger
        /*if (!allowToggle) {
          target.setAttribute('aria-disabled', 'true');
        }*/
      }
      else if (allowToggle && isExpanded) {
        // Set the expanded state on the triggering element
        target.setAttribute('aria-expanded', 'false');
        // Hide the accordion sections, using aria-controls to specify the desired section
        document.getElementById(target.getAttribute('aria-controls')).setAttribute('hidden', '');
      }

      event.preventDefault();
    }
  }
  });

  // Bind keyboard behaviors on the main accordion container
  accordion.addEventListener('keydown', function (event) {
    var target = event.target;
    var key = event.which.toString();

    var isExpanded = target.getAttribute('aria-expanded') == 'true';
    var allowToggle = (allowMultiple) ? allowMultiple : accordion.hasAttribute('data-allow-toggle');

    // 33 = Page Up, 34 = Page Down
    var ctrlModifier = (event.ctrlKey && key.match(/33|34/));

    // Is this coming from an accordion header?
    if (target.classList.contains('wacg-accordion-trigger')) {
      // Up/ Down arrow and Control + Page Up/ Page Down keyboard operations
      // 38 = Up, 40 = Down
      if (key.match(/38|40/) || ctrlModifier) {
        var index = triggers.indexOf(target);
        var direction = (key.match(/34|40/)) ? 1 : -1;
        var length = triggers.length;
        var newIndex = (index + length + direction) % length;

        triggers[newIndex].focus();

        event.preventDefault();
      }
      else if (key.match(/35|36/)) {
        // 35 = End, 36 = Home keyboard operations
        switch (key) {
          // Go to first accordion
          case '36':
            triggers[0].focus();
            break;
            // Go to last accordion
          case '35':
            triggers[triggers.length - 1].focus();
            break;
        }
        event.preventDefault();

      }

    }
  });

  // These are used to style the accordion when one of the buttons has focus
  accordion.querySelectorAll('.wacg-accordion-trigger').forEach(function (trigger) {

    trigger.addEventListener('focus', function (event) {
      accordion.classList.add('focus');
    });

    trigger.addEventListener('blur', function (event) {
      accordion.classList.remove('focus');
    });

    trigger.addEventListener('keydown', function (e) {
      if (e.which == 32 || e.keyCode == 32) {
        e.preventDefault();
        trigger.click();
      }
    });

  });

  // Minor setup: will set disabled state, via aria-disabled, to an
  // expanded/ active accordion which is not allowed to be toggled close
  if (!allowToggle) {
    // Get the first expanded/ active accordion
    var expanded = accordion.querySelector('[aria-expanded="true"]');

    // If an expanded/ active accordion is found, disable
    if (expanded) {
      expanded.setAttribute('aria-disabled', 'true');
    }
  }

});
}

/*
*   This content is licensed according to the W3C Software License at
*   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
*/
(function () {
  var storeWCAGTablist = document.querySelectorAll('[role="tablist"]')[0];
  var storeWCAGTabs;
  var storeWCAGPanels;

  storeWCAGGenerateArrays();

  function storeWCAGGenerateArrays() {
    storeWCAGTabs = document.querySelectorAll('[role="tab"]');
    storeWCAGPanels = document.querySelectorAll('[role="tabpanel"]');
  };

  // For easy reference
  var keys = {
    end: 35,
    home: 36,
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    delete: 46,
    enter: 13,
    space: 32
  };

  // Add or subtract depending on key pressed
  var direction = {
    37: -1,
    38: -1,
    39: 1,
    40: 1
  };

  // Bind listeners
  // for (i = 0; i < storeWCAGTabs.length; ++i) {
  //   storeWCAGAddListeners(i);
  // };

  function storeWCAGAddListeners(index) {
    storeWCAGTabs[index].addEventListener('click', storeWCAGClickEventListener);
    storeWCAGTabs[index].addEventListener('keydown', storeWCAGKeydownEventListener);
    storeWCAGTabs[index].addEventListener('keyup', storeWCAGKeyupEventListener);

    // Build an array with all tabs (<button>s) in it
    storeWCAGTabs[index].index = index;
  };

  window.storeWCAGInitialiseTabs = function () {
    storeWCAGTablist = document.querySelectorAll('[role="tablist"]')[0];
    storeWCAGGenerateArrays();
    // Bind listeners
    for (i = 0; i < storeWCAGTabs.length; ++i) {
      storeWCAGAddListeners(i);
    };
  }

  // When a tab is clicked, activateTab is fired to activate it
  function storeWCAGClickEventListener(event) {
    var tab = event.target;
    storeWCAGActivateTab(tab, false);
  };

  // Handle keydown on tabs
  function storeWCAGKeydownEventListener(event) {
    var key = event.keyCode;

    switch (key) {
      case keys.end:
        event.preventDefault();
        // Activate last tab
        storeWCAGFocusLastTab();
        break;
      case keys.home:
        event.preventDefault();
        // Activate first tab
        storeWCAGFocusFirstTab();
        break;

      // Up and down are in keydown
      // because we need to prevent page scroll >:)
      case keys.up:
      case keys.down:
        storeWCAGDetermineOrientation(event);
        break;
    };
  };

  // Handle keyup on tabs
  function storeWCAGKeyupEventListener(event) {
    var key = event.keyCode;

    switch (key) {
      case keys.left:
      case keys.right:
        storeWCAGDetermineOrientation(event);
        break;
      case keys.delete:
        storeWCAGDetermineDeletable(event);
        break;
      case keys.enter:
      case keys.space:
        storeWCAGActivateTab(event.target);
        break;
    };
  };

  // When a tablistâ€™s aria-orientation is set to vertical,
  // only up and down arrow should function.
  // In all other cases only left and right arrow function.
  function storeWCAGDetermineOrientation(event) {
    var key = event.keyCode;
    var vertical = storeWCAGTablist.getAttribute('aria-orientation') == 'vertical';
    var proceed = false;

    if (vertical) {
      if (key === keys.up || key === keys.down) {
        event.preventDefault();
        proceed = true;
      };
    }
    else {
      if (key === keys.left || key === keys.right) {
        proceed = true;
      };
    };

    if (proceed) {
      storeWCAGSwitchTabOnArrowPress(event);
    };
  };

  // Either focus the next, previous, first, or last tab
  // depending on key pressed
  function storeWCAGSwitchTabOnArrowPress(event) {
    var pressed = event.keyCode;

    if (direction[pressed]) {
      var target = event.target;
      if (target.index !== undefined) {
        if (storeWCAGTabs[target.index + direction[pressed]]) {
          storeWCAGTabs[target.index + direction[pressed]].focus();
        }
        else if (pressed === keys.left || pressed === keys.up) {
          storeWCAGFocusLastTab();
        }
        else if (pressed === keys.right || pressed == keys.down) {
          storeWCAGFocusFirstTab();
        };
      };
    };
  };

  // Activates any given tab panel
  function storeWCAGActivateTab(tab, setFocus) {
    setFocus = setFocus || true;
    // Deactivate all other tabs
    storeWCAGDeactivateTabs();

    // Remove tabindex attribute
    tab.removeAttribute('tabindex');

    // Set the tab as selected
    tab.setAttribute('aria-selected', 'true');

    // Get the value of aria-controls (which is an ID)
    var controls = tab.getAttribute('aria-controls');

    // Remove hidden attribute from tab panel to make it visible
    if(document.getElementById(controls)) {
      document.getElementById(controls).removeAttribute('hidden');
    }else{
      if(document.getElementsByClassName('tab-data').length > 0) {
        document.getElementsByClassName('tab-data')[0].removeAttribute('hidden');
      }
    }

    // Set focus when required
    if (setFocus) {
      tab.focus();
    };
  };

  // Deactivate all tabs and tab panels
  function storeWCAGDeactivateTabs() {
    for (t = 0; t < storeWCAGTabs.length; t++) {
      storeWCAGTabs[t].setAttribute('tabindex', '-1');
      storeWCAGTabs[t].setAttribute('aria-selected', 'false');
    };

    for (p = 0; p < storeWCAGPanels.length; p++) {
      storeWCAGPanels[p].setAttribute('hidden', 'hidden');
    };
  };

  // Make a guess
  function storeWCAGFocusFirstTab() {
    storeWCAGTabs[0].focus();
  };

  // Make a guess
  function storeWCAGFocusLastTab() {
    storeWCAGTabs[storeWCAGTabs.length - 1].focus();
  };

  // Detect if a tab is deletable
  function storeWCAGDetermineDeletable(event) {
    target = event.target;

    if (target.getAttribute('data-deletable') !== null) {
      // Delete target tab
      storeWCAGDeleteTab(event, target);

      // Update arrays related to tabs widget
      storeWCAGGenerateArrays();

      // Activate the closest tab to the one that was just deleted
      if (target.index - 1 < 0) {
        storeWCAGActivateTab(storeWCAGTabs[0]);
      }
      else {
        storeWCAGActivateTab(storeWCAGTabs[target.index - 1]);
      };
    };
  };

  // Deletes a tab and its panel
  function storeWCAGDeleteTab(event) {
    var target = event.target;
    var panel = document.getElementById(target.getAttribute('aria-controls'));

    target.parentElement.removeChild(target);
    panel.parentElement.removeChild(panel);
  };

  // Determine whether there should be a delay
  // when user navigates with the arrow keys
  function storeWCAGDetermineDelay() {
    var hasDelay = storeWCAGTablist.hasAttribute('data-delay');
    var delay = 0;

    if (hasDelay) {
      var delayValue = storeWCAGTablist.getAttribute('data-delay');
      if (delayValue) {
        delay = delayValue;
      }
      else {
        // If no value is specified, default to 300ms
        delay = 300;
      };
    };

    return delay;
  };
}());var storeWCAGMenuButton = function (domNode, openMethodName, closeMethodName, focusDomNode, dropDownType, restrictTabInDropdown) {

  this.domNode = domNode;
  this.popupMenu = false;

  this.hasFocus = false;
  this.hasHover = false;
  this.openMethodName = openMethodName;
  this.closeMethodName = closeMethodName;
  this.focusDomNode = focusDomNode;
  this.dropDownType = dropDownType;
  this.restrictTabInDropdown;

  if ((typeof restrictTabInDropdown != 'undefined') && typeof restrictTabInDropdown === 'string') {
    this.restrictTabInDropdown = restrictTabInDropdown;
  }


  this.keyCode = Object.freeze({
    'TAB': 9,
    'RETURN': 13,
    'ESC': 27,
    'SPACE': 32,
    'PAGEUP': 33,
    'PAGEDOWN': 34,
    'END': 35,
    'HOME': 36,
    'LEFT': 37,
    'UP': 38,
    'RIGHT': 39,
    'DOWN': 40
  });
};

storeWCAGMenuButton.prototype.init = function () {

  //this.domNode.setAttribute('aria-haspopup', 'true');

  this.domNode.addEventListener('keydown', this.handleKeydown.bind(this));
  //this.domNode.addEventListener('click',      this.handleClick.bind(this));
  //this.domNode.addEventListener('focus',      this.handleFocus.bind(this));
  //this.domNode.addEventListener('blur',       this.handleBlur.bind(this));
  //this.domNode.addEventListener('mouseover',  this.handleMouseover.bind(this));
  //this.domNode.addEventListener('mouseout',   this.handleMouseout.bind(this));

  // initialize pop up menus

  var popupMenu = document.getElementById(this.domNode.getAttribute('aria-controls'));

  if (popupMenu) {
    this.popupMenu = new PopupMenuLinks(popupMenu, this);
    this.popupMenu.init();
  }

};

storeWCAGMenuButton.prototype.reinit = function (domNode, focusDomNode) {

  //this.domNode.setAttribute('aria-haspopup', 'true');

  //this.domNode.addEventListener('keydown',    this.handleKeydown.bind(this));
  //this.domNode.addEventListener('click',      this.handleClick.bind(this));
  //this.domNode.addEventListener('focus',      this.handleFocus.bind(this));
  //this.domNode.addEventListener('blur',       this.handleBlur.bind(this));
  //this.domNode.addEventListener('mouseover',  this.handleMouseover.bind(this));
  //this.domNode.addEventListener('mouseout',   this.handleMouseout.bind(this));

  // initialize pop up menus
  this.domNode = domNode;
  this.focusDomNode = focusDomNode;
  //this.popupMenu = false;
  var popupMenu = document.getElementById(this.domNode.getAttribute('aria-controls'));

  if (popupMenu) {
    //this.popupMenu = new PopupMenuLinks(popupMenu, this);
    this.popupMenu.reinit(popupMenu, this);
  }

};

storeWCAGMenuButton.prototype.handleKeydown = function (event) {
  var flag = false;

  switch (event.keyCode) {
    case this.keyCode.SPACE:
    case this.keyCode.RETURN:
    case this.keyCode.DOWN:
      if (this.popupMenu) {
        this.popupMenu.open(event);
        if (this.focusDomNode) {
          this.popupMenu.setFocusToSelectedItem(this.focusDomNode);
        } else {
          this.popupMenu.setFocusToFirstItem();
        }
      }
      flag = true;
      break;

    case this.keyCode.UP:
      if (this.popupMenu) {
        this.popupMenu.open(event);
        if (this.focusDomNode) {
          this.popupMenu.setFocusToSelectedItem(this.focusDomNode);
        } else {
          this.popupMenu.setFocusToLastItem();
        }
        flag = true;
      }
      break;

    default:
      break;
  }

  if (flag) {
    event.stopPropagation();
    event.preventDefault();
  }
};

/*storeWCAGMenuButton.prototype.handleClick = function (event) {
  if (this.domNode.getAttribute('aria-expanded') == 'true') {
    this.popupMenu.close(true);
  }
  else {
    this.popupMenu.open();
    this.popupMenu.setFocusToFirstItem();
  }
};*/

storeWCAGMenuButton.prototype.destroy = function () {
  this.popupMenu.destroy();
  //this.popupMenu = null;
  //delete this.popupMenu;
  this.domNode = null;
  delete this.domNode;
};

/*storeWCAGMenuButton.prototype.handleFocus = function (event) {
  this.popupMenu.hasFocus = true;
};

storeWCAGMenuButton.prototype.handleBlur = function (event) {
  this.popupMenu.hasFocus = false;
};*/

/*storeWCAGMenuButton.prototype.handleMouseover = function (event) {
  this.hasHover = true;
  this.popupMenu.open();
};

storeWCAGMenuButton.prototype.handleMouseout = function (event) {
  this.hasHover = false;
  setTimeout(this.popupMenu.close.bind(this.popupMenu, false), 300);
};*/var MenuItemLinks = function (domNode, menuObj) {

  this.domNode = domNode;
  this.menu = menuObj;

  this.restrictTabInDropdown = null;

  this.keyCode = Object.freeze({
    'TAB': 9,
    'RETURN': 13,
    'ESC': 27,
    'SPACE': 32,
    'PAGEUP': 33,
    'PAGEDOWN': 34,
    'END': 35,
    'HOME': 36,
    'LEFT': 37,
    'UP': 38,
    'RIGHT': 39,
    'DOWN': 40
  });
};

MenuItemLinks.prototype.init = function () {
  this.domNode.tabIndex = -1;

  if (!this.domNode.getAttribute('role')) {
    this.domNode.setAttribute('role', 'menuitem');
  }

  //this.domNode.removeEventListener('keydown',    this.handleKeydown.bind(this));
  //this.domNode.removeEventListener('click',      this.handleClick.bind(this));
  if ($(this.domNode).attr('data-has-listener') == undefined) {
    this.domNode.addEventListener('keydown', this.handleKeydown.bind(this));
    $(this.domNode).attr('data-has-listener', 'present');
  }
  //this.domNode.addEventListener('click',      this.handleClick.bind(this));
  /*this.domNode.addEventListener('focus',      this.handleFocus.bind(this));
  this.domNode.addEventListener('blur',       this.handleBlur.bind(this));
  this.domNode.addEventListener('mouseover',  this.handleMouseover.bind(this));
  this.domNode.addEventListener('mouseout',   this.handleMouseout.bind(this));
*/
  this.restrictTabInDropdown = this.menu.restrictTabInDropdown;
};

/* EVENT HANDLERS */

MenuItemLinks.prototype.handleKeydown = function (event) {
  var flag = false,
    char = event.key;

  function isPrintableCharacter(str) {
    return str.length === 1 && str.match(/\S/);
  }
  /*if((event.keyCode === this.keyCode.RETURN))
  {
     this.domNode.click();
     return;
  }*/
  if (event.ctrlKey || event.altKey || event.metaKey || (event.keyCode === this.keyCode.SPACE) || (event.keyCode === this.keyCode.RETURN)) {
    return;
  }

  if (event.shiftKey) {
    if (isPrintableCharacter(char)) {
      this.menu.setFocusByFirstCharacter(this, char);
      flag = true;
    }

    if (event.keyCode === this.keyCode.TAB) {
      this.menu.setFocusToController();
      this.menu.close(true);
    }
  } else {
    switch (event.keyCode) {

      case this.keyCode.ESC:
        this.menu.setFocusToController();
        this.menu.close(true);
        flag = true;
        break;

      case this.keyCode.UP:
        this.menu.setFocusToPreviousItem(this);
        flag = true;
        break;

      case this.keyCode.DOWN:
        this.menu.setFocusToNextItem(this);
        flag = true;
        break;

      case this.keyCode.HOME:
      case this.keyCode.PAGEUP:
        this.menu.setFocusToFirstItem();
        flag = true;
        break;

      case this.keyCode.END:
      case this.keyCode.PAGEDOWN:
        this.menu.setFocusToLastItem();
        flag = true;
        break;

      case this.keyCode.TAB:
        if ((typeof this.menu.restrictTabInDropdown == 'undefined') || this.menu.restrictTabInDropdown != 'restrictTabInDropdown') {
          this.menu.setFocusToController();
          this.menu.close(true);
        }
        break;

      default:
        if (isPrintableCharacter(char)) {
          this.menu.setFocusByFirstCharacter(this, char);
        }
        break;
    }
  }

  if (flag) {
    event.stopPropagation();
    event.preventDefault();
  }
};

/*MenuItemLinks.prototype.handleClick = function (event) {
  if(this.domNode.attr('aria-haspopup')!='true') {
    this.menu.setFocusToController();
    this.menu.close(true);
  }
};*/

/*MenuItemLinks.prototype.handleFocus = function (event) {
  this.menu.hasFocus = true;
};

MenuItemLinks.prototype.handleBlur = function (event) {
  this.menu.hasFocus = false;
  //setTimeout(this.menu.close.bind(this.menu, false), 300);
};

MenuItemLinks.prototype.handleMouseover = function (event) {
  this.menu.hasHover = true;
  //this.menu.open();

};

MenuItemLinks.prototype.handleMouseout = function (event) {
  this.menu.hasHover = false;
  //setTimeout(this.menu.close.bind(this.menu, false), 300);
};*/var PopupMenuLinks = function (domNode, controllerObj) {
  var elementChildren,
    msgPrefix = 'PopupMenuLinks constructor argument domNode ';

  // Check whether domNode is a DOM element
  if (!domNode instanceof Element) {
    throw new TypeError(msgPrefix + 'is not a DOM Element.');
  }

  // Check whether domNode has child elements
  if (domNode.childElementCount === 0) {
    throw new Error(msgPrefix + 'has no element children.');
  }

  // Check whether domNode descendant elements have A elements
  /*var childElement = domNode.firstElementChild;
  while (childElement) {
    var menuitem = childElement.firstElementChild;
    if (menuitem && menuitem.tagName !== 'A') {
      throw new Error(msgPrefix + 'has descendant elements that are not A elements.');
    }
    childElement = childElement.nextElementSibling;
  }*/

  this.domNode = domNode;
  this.controller = controllerObj;

  this.menuitems = []; // see PopupMenuLinks init method
  this.firstChars = []; // see PopupMenuLinks init method

  this.firstItem = null; // see PopupMenuLinks init method
  this.lastItem = null; // see PopupMenuLinks init method

  this.hasFocus = false; // see MenuItemLinks handleFocus, handleBlur
  this.hasHover = false; // see PopupMenuLinks handleMouseover, handleMouseout

  this.restrictTabInDropdown = null;
};

/*
 *   @method PopupMenuLinks.prototype.init
 *
 *   @desc
 *       Add domNode event listeners for mouseover and mouseout. Traverse
 *       domNode children to configure each menuitem and populate menuitems
 *       array. Initialize firstItem and lastItem properties.
 */
PopupMenuLinks.prototype.init = function () {
  var childElement, menuElement, menuItem, textContent, numItems, label, inputValue;

  // Configure the domNode itself
  //this.domNode.tabIndex = -1;
  //this.menuitems  = [];
  //this.firstChars = []; 
  //this.firstItem  = null;
  //this.lastItem   = null;
  //this.hasFocus   = false;

    this.restrictTabInDropdown = this.controller.restrictTabInDropdown;
 
  this.domNode.setAttribute('role', 'menu');
  /* if (!this.domNode.getAttribute('aria-labelledby') && !this.domNode.getAttribute('aria-label') && !this.domNode.getAttribute('title')) {
    label = this.controller.domNode.innerHTML;
    this.domNode.setAttribute('aria-label', label);
  } */

  //this.domNode.addEventListener('mouseover', this.handleMouseover.bind(this));
  //this.domNode.addEventListener('mouseout',  this.handleMouseout.bind(this));

  // Traverse the element children of domNode: configure each with
  // menuitem role behavior and store reference in menuitems array.
  //childElement = this.domNode.firstElementChild;

  /*while (childElement) {
    menuElement = childElement.firstElementChild;

    if (menuElement && menuElement.tagName === 'A') {
      menuItem = new MenuItemLinks(menuElement, this);
      menuItem.init();
      this.menuitems.push(menuItem);
      textContent = menuElement.textContent.trim();
      this.firstChars.push(textContent.substring(0, 1).toLowerCase());
    }
    childElement = childElement.nextElementSibling;
  }*/
  var itemsList = ($(this.domNode).find('.wcag-mb-links').length > 0) ? $(this.domNode).find('.wcag-mb-links') : $(this.domNode).find('a');
  for (var cnt = 0; cnt < itemsList.length; cnt++) {
    if (typeof store != 'undefined' && typeof store.isUserLoggedIn != 'undefined') {
      if ((store.isUserLoggedIn == 'true' && $(itemsList[cnt]).hasClass('store2LoginOnly')) || (store.isUserLoggedIn == 'false' && $(itemsList[cnt]).hasClass('store2LogoutOnly')) || ((!$(itemsList[cnt]).hasClass('store2LoginOnly')) && (!$(itemsList[cnt]).hasClass('store2LogoutOnly')))) {
        menuElement = itemsList[cnt];
        if (menuElement.classList.contains('filter-checkbox')) {
          if (menuElement.disabled === false) {
            menuItem = new MenuItemLinks(menuElement, this);
            menuItem.init();
            this.menuitems.push(menuItem);
            inputValue = menuElement.defaultValue.trim();
            this.firstChars.push(inputValue.substring(0, 1).toLowerCase());
          }
        } else {
          menuItem = new MenuItemLinks(menuElement, this);
          menuItem.init();
          this.menuitems.push(menuItem);
          textContent = menuElement.textContent.trim();
          this.firstChars.push(textContent.substring(0, 1).toLowerCase());
        }
      }
    }
  }

  // Use populated menuitems array to initialize firstItem and lastItem.
  numItems = this.menuitems.length;
  if (numItems > 0) {
    this.firstItem = this.menuitems[0];
    this.lastItem = this.menuitems[numItems - 1];
    if (typeof this.controller.dropDownType != 'undefined') {
      if (typeof this.controller.dropDownType === 'string' && this.controller.dropDownType === 'filter') {
        for (var i = 0; i < numItems; i++) {
          if ($(this.menuitems[i].domNode).prop('disabled') == true) {} else {
            this.firstItem = this.menuitems[i];
            break;
          }
        }
      }
    }
  }

};
PopupMenuLinks.prototype.reinit = function (domNode, controllerObj) {
  var childElement, menuElement, menuItem, textContent, numItems, label, inputValue;

  // Configure the domNode itself
  //this.domNode.tabIndex = -1;
  this.domNode = domNode;
  this.controller = controllerObj;

  this.menuitems = []; // see PopupMenuLinks init method
  this.firstChars = []; // see PopupMenuLinks init method

  this.firstItem = null; // see PopupMenuLinks init method
  this.lastItem = null; // see PopupMenuLinks init method

  this.hasFocus = false; // see MenuItemLinks handleFocus, handleBlur
  this.hasHover = false; // see PopupMenuLinks handleMouseover, handleMouseout

    this.restrictTabInDropdown = this.controller.restrictTabInDropdown;

  this.domNode.setAttribute('role', 'menu');
  var itemsList = ($(this.domNode).find('.wcag-mb-links').length > 0) ? $(this.domNode).find('.wcag-mb-links') : $(this.domNode).find('a');
  for (var cnt = 0; cnt < itemsList.length; cnt++) {
    if (typeof store != 'undefined' && typeof store.isUserLoggedIn != 'undefined') {
      if ((store.isUserLoggedIn == 'true' && $(itemsList[cnt]).hasClass('store2LoginOnly')) || (store.isUserLoggedIn == 'false' && $(itemsList[cnt]).hasClass('store2LogoutOnly')) || ((!$(itemsList[cnt]).hasClass('store2LoginOnly')) && (!$(itemsList[cnt]).hasClass('store2LogoutOnly')))) {
        menuElement = itemsList[cnt];
        if (menuElement.classList.contains('filter-checkbox')) {
          if (menuElement.disabled === false) {
            menuItem = new MenuItemLinks(menuElement, this);
            menuItem.init();
            this.menuitems.push(menuItem);
            inputValue = menuElement.defaultValue.trim();
            this.firstChars.push(inputValue.substring(0, 1).toLowerCase());
          }
        } else {
          menuItem = new MenuItemLinks(menuElement, this);
          menuItem.init();
          this.menuitems.push(menuItem);
          textContent = menuElement.textContent.trim();
          this.firstChars.push(textContent.substring(0, 1).toLowerCase());
        }
      }
    }
  }

  // Use populated menuitems array to initialize firstItem and lastItem.
  numItems = this.menuitems.length;
  if (numItems > 0) {
    if (numItems > 0) {
      this.firstItem = this.menuitems[0];
      this.lastItem = this.menuitems[numItems - 1];
      if (typeof this.controller.dropDownType != 'undefined') {
        if (typeof this.controller.dropDownType === 'string' && this.controller.dropDownType === 'filter') {
          for (var i = 0; i < numItems; i++) {
            if ($(this.menuitems[i].domNode).prop('disabled') == true) {} else {
              this.firstItem = this.menuitems[i];
              break;
            }
          }
        }
      }
    }
  }
};
/* EVENT HANDLERS */

/*PopupMenuLinks.prototype.handleMouseover = function (event) {
  this.hasHover = true;
};

PopupMenuLinks.prototype.handleMouseout = function (event) {
  this.hasHover = false;
  setTimeout(this.close.bind(this, false), 300);
};*/

/* FOCUS MANAGEMENT METHODS */

PopupMenuLinks.prototype.setFocusToController = function (command) {
  if (typeof command !== 'string') {
    command = '';
  }

  if (command === 'previous') {
    this.controller.menubar.setFocusToPreviousItem(this.controller);
  } else {
    if (command === 'next') {
      this.controller.menubar.setFocusToNextItem(this.controller);
    } else {
      if ($(this.controller.domNode).prop('tagName') == "A") {
        this.controller.domNode.focus();
      } else if ($(this.controller.domNode).find('a').length > 0) {
        $(this.controller.domNode).find('a')[0].focus();
      }
    }
  }
};

PopupMenuLinks.prototype.setFocusToFirstItem = function () {
  // if ($(this.firstItem.domNode).prop('disabled') == true) {
  //   var nextItem = this.menuitems[1];
  //   nextItem.domNode.focus();
  // } else {
  this.firstItem.domNode.focus();
  //}
};

PopupMenuLinks.prototype.setFocusToLastItem = function () {
  this.lastItem.domNode.focus();
};

PopupMenuLinks.prototype.setFocusToSelectedItem = function (item) {
  var index = this.findDomNodeIndex(item);
  this.menuitems[index].domNode.focus();
};

PopupMenuLinks.prototype.findDomNodeIndex = function (currentItem) {
  var matchedItemFound = false;
  var matchedIndex = -1;
  for (var i = 0; i < this.menuitems.length && !matchedItemFound; i++) {
    if (this.menuitems[i].domNode == currentItem) {
      matchedItemFound = true;
      matchedIndex = i;
      break;
    }
  }
  return matchedIndex;
}

PopupMenuLinks.prototype.findIndex = function (currentItem) {
  var matchedItemFound = false;
  var matchedIndex = -1;
  for (var i = 0; i < this.menuitems.length && !matchedItemFound; i++) {
    if (this.menuitems[i].domNode == currentItem.domNode) {
      matchedItemFound = true;
      matchedIndex = i;
      break;
    }
  }
  return matchedIndex;
}

PopupMenuLinks.prototype.setFocusToPreviousItem = function (currentItem) {
  var index;

  if (currentItem.domNode == this.firstItem.domNode) {
    this.lastItem.domNode.focus();
  } else {
    index = this.findIndex(currentItem);
    this.menuitems[index - 1].domNode.focus();
  }
};

PopupMenuLinks.prototype.setFocusToNextItem = function (currentItem) {
  var index;

  if (currentItem.domNode == this.lastItem.domNode) {
    this.firstItem.domNode.focus();
  } else {
    index = this.findIndex(currentItem);
    this.menuitems[index + 1].domNode.focus();
  }
};

PopupMenuLinks.prototype.setFocusByFirstCharacter = function (currentItem, char) {
  var start, index, char = char.toLowerCase();

  // Get start index for search based on position of currentItem
  start = this.findIndex(currentItem) + 1;
  if (start === this.menuitems.length) {
    start = 0;
  }

  // Check remaining slots in the menu
  index = this.getIndexFirstChars(start, char);

  // If not found in remaining slots, check from beginning
  if (index === -1) {
    index = this.getIndexFirstChars(0, char);
  }

  // If match was found...
  if (index > -1) {
    this.menuitems[index].domNode.focus();
  }
};

PopupMenuLinks.prototype.getIndexFirstChars = function (startIndex, char) {
  for (var i = startIndex; i < this.firstChars.length; i++) {
    if (char === this.firstChars[i]) {
      return i;
    }
  }
  return -1;
};

/* MENU DISPLAY METHODS */

PopupMenuLinks.prototype.open = function (event) {
  // get position and bounding rectangle of controller object's DOM node
  //var rect = this.controller.domNode.getBoundingClientRect();

  // set CSS properties
  //this.domNode.style.display = 'block';
  //this.domNode.style.position = 'absolute';
  //this.domNode.style.top  = rect.height + 'px';
  //this.domNode.style.left = '0px';
  //$(this.domNode).css('opacity', 0).show().animate({ opacity: 1 }, 0);
  if (typeof this.controller.openMethodName != 'undefined') {
    if (typeof this.controller.openMethodName === 'string') {
      eval(this.controller.openMethodName)(this.domNode);
    } else {
      this.controller.openMethodName(this.domNode);
    }
  }
  // set aria-expanded attribute
  this.controller.domNode.setAttribute('aria-expanded', 'true');
};

PopupMenuLinks.prototype.close = function (force) {

  if (force || (!this.hasFocus && !this.hasHover && !this.controller.hasHover)) {
    //this.domNode.style.display = 'none';
    //$(this.domNode).css('opacity', 1).hide().animate({ opacity: 0 }, 0);
    if (typeof this.controller.closeMethodName != 'undefined') {
      if (typeof this.controller.closeMethodName === 'string') {
        eval(this.controller.closeMethodName)(this.domNode);
      } else {
        this.controller.closeMethodName(this.domNode);
      }
    }
    this.controller.domNode.setAttribute('aria-expanded', 'false');
  }
  this.controller.domNode.focus();
};
PopupMenuLinks.prototype.destroy = function () {
  this.controller = null;
  delete this.controller;
  this.domNode = null;
  delete this.domNode;
  this.menuitems = null;
  delete this.menuitems;
  this.firstItem = null;
  delete this.firstItem;
  this.firstChars = null;
  delete this.firstChars;
  this.lastItem = null;
  delete this.lastItem;
};function storeWCAGMenuOpenMegaDropDown(elem) {
  $(elem).css('opacity', 0).show().animate({
    opacity: 1
  }, 0);
}

function storeWCAGMenuCloseMegaDropDown(elem) {
  $(elem).css('opacity', 1).hide().animate({
    opacity: 0
  }, 0);
}


function storeWCAGFoundationDropdown(elem) {
  try {
    var triggerEl = $(elem)[0].getAttribute('aria-labelledby');
    $('#' + triggerEl).click();
  } catch (e) { }
}

function storeWCAGCloseOffCanvasMenu(elem) {
  try {
    $('.cms-offcanvas').removeClass('move-right');
    $('#store-offcanvas-menu').attr('aria-expanded', 'false');
  }
  catch (e) { }
}

function closeSizeDropDown(elem) {
  /*$('#size-dd').hide();
  //var triggerEl = $(elem)[0].getAttribute('aria-labelledby');
  $('#size-dd').removeClass('active');*/
  $('#size-dd').find('ul').hide();
  $('#size-dd').removeClass('active');
}
function storeWCAGGlobalDropDown(elem) {
  //$('#size-dd').click();
  $(elem).toggle();
  $(elem).parent().toggleClass('active');
}
function storeCloseWCAGGlobalDropDown(elem) {
  //$('#size-dd').click();
  $(elem).hide();
  $(elem).parent().removeClass('active');
}
function storeWCAOpenFiltersDropdown(elem) {
  try {
    var triggerEl = $(elem)[0].getAttribute('aria-labelledby');
    var dropdownEl = $(elem)[0].getAttribute('id');
    $('#' + triggerEl).click();
    $('#' + dropdownEl + ' .facet-filter-copy-info').css('max-width', $('#' + dropdownEl).width() + 'px');
    //$('#' + triggerEl).
    if ($('#' + triggerEl).hasClass('more-filter-link')) {
      $('#' + triggerEl).closest('li').addClass('open')
    } else {
      $('#' + triggerEl).addClass('link-active');
      $(elem).parent().addClass('open')
    }
  } catch (e) { }

}

function storeWCACloseFiltersDropdown(elem) {
  try {
    var triggerEl = $(elem)[0].getAttribute('aria-labelledby');
    $('#' + triggerEl).click();
    if ($('#' + triggerEl).hasClass('more-filter-link')) {
      $('#' + triggerEl).closest('li').removeClass('open')
    } else {
      $('#' + triggerEl).removeClass('link-active');
      $(elem).parent().removeClass('open')
    }

  } catch (e) { }

}
/* Remove focus outline for mouse click and devices starts */
try {
    var htmlElement = document.querySelector('html');
        
    /* Function to remove 'focus-none' class for other than touch devices */
    function rmFocusNone() { 
        if(htmlElement.classList.contains('no-touch') && htmlElement.classList.contains('focus-none')) { //remove .focus-none only 
            htmlElement.classList.remove('focus-none');
        }
    }

    /* Remove focus outline for mouse click starts */
    document.addEventListener('mousedown', function(){
    htmlElement.classList.add('focus-none');
    });

    /* To remove .focus-none and show focus highlight for keyboard navigation */
    document.addEventListener('keyup', function(){
        rmFocusNone();
    });
}
catch(err) {
console.log(err.message);
}
/* Remove focus outline for mouse click end */

$(window).on('load', function () {
    if($('input').is(':focus')) { /* Remove focus-none class for input focus on load */
      rmFocusNone();
    }
    // if(document.activeElement.tagName.toLocaleLowerCase() == 'input') {
    //     rmFocusNone();
    // }
});/* starts : WCAG_appendOpenNewWindowMsg, Open new window message if target="_blank" */
try {
  storeWCAG.appendOpenNewWindowMsg = function() {
      $('.ls-area a[target="_blank"]').each(function() {
          var anchor_val = $(this).text();
          var img_val = $(this).children("img").attr("alt");
          var aria_val = $(this).attr("aria-label");
          var title_val = $(this).attr("title");

          if (anchor_val) {
              $(this).attr("aria-label", anchor_val + ' ' + store.WCAG_appendOpenNewWindowMsg);
          }
          if (img_val) {
              $(this).attr("aria-label", img_val + ' ' + store.WCAG_appendOpenNewWindowMsg);
          }
          if (aria_val && aria_val.indexOf(store.WCAG_appendOpenNewWindowMsg) == -1) {
              $(this).attr("aria-label", aria_val + ' ' + store.WCAG_appendOpenNewWindowMsg);
          }
          if (title_val && title_val.indexOf(store.WCAG_appendOpenNewWindowMsg) == -1) {
              $(this).attr("title", title_val + ' ' + store.WCAG_appendOpenNewWindowMsg);
          }
      });
  }
  storeWCAG.checkTargetBlank = function() {

    if (( ns('cms').cobrand != 'amazonus' ) && ($('.ls-area a[target="_blank"]').length > 0)){
      if ((typeof store.WCAG_appendOpenNewWindowMsg !== "undefined") && store.WCAG_appendOpenNewWindowMsg !== "") 
        {

          storeWCAG.appendOpenNewWindowMsg();
          
        } else {
          var WCAG_appendOpenNewWindow_ErrorMsg;

          // message if WCAG_appendOpenNewWindowMsg is undefined,when variable which is defined in globalheader.xsl is not loaded
          if (typeof store.WCAG_appendOpenNewWindowMsg == "undefined") {
              WCAG_appendOpenNewWindow_ErrorMsg = "WCAG_appendOpenNewWindowMsg variable is not available";
          }
          //message if WCAG_appendOpenNewWindowMsg is empty ,when variable is not configured in DCR
          if ((typeof store.WCAG_appendOpenNewWindowMsg != "undefined") && store.WCAG_appendOpenNewWindowMsg == "") {
            WCAG_appendOpenNewWindow_ErrorMsg = "WCAG_appendOpenNewWindowMsg variable value is empty";
        }
          if (typeof businessLogger != 'undefined') {
              businessLogger
                  .error()
                  .key("new-window.js")
                  .noodle()
                  .env()
                  .service("store")
                  .errorCode("DSTORE_WCAG_appendOpenNewWindowMsg")
                  .errorId()
                  .description("Failed to append Opnes new Window text, " + WCAG_appendOpenNewWindow_ErrorMsg + " ")
                  .context()
                  .origin("store")
                  .logMessage().postlogToSplunk();
          }
      }
    }
  }
} catch (err) {
  if (typeof businessLogger != 'undefined') {
      businessLogger
          .error()
          .key("new-window.js")
          .noodle()
          .env()
          .service("store")
          .errorCode("DSTORE_WCAG_appendOpenNewWindowMsg")
          .errorId()
          .description("Failed to append open new window text" +  JSON.stringify(err))
          .context()
          .origin("store")
          .logMessage().postlogToSplunk();
  }
}

$(window).load(function() {
  try {
    // verify if anchor link has target="_blank" lenght more than zero
    // verify 'WCAG_appendOpenNewWindowMsg' variable available
    // verify 'WCAG_appendOpenNewWindowMsg' variable not empty
    storeWCAG.checkTargetBlank();
    } catch (err) {
      if (typeof businessLogger != 'undefined') {
          businessLogger
              .error()
              .key("new-window.js")
              .noodle()
              .env()
              .service("store")
              .errorCode("DSTORE_WCAG_appendOpenNewWindowMsg")
              .errorId()
              .description("DSTORE_WCAG_appendOpenNewWindowMsg window load " + JSON.stringify(err))
              .context()
              .origin("store")
              .logMessage().postlogToSplunk();
      }
  }

});

/* end : WCAG_appendOpenNewWindowMsg, Open new window message if target="_blank" *//* Add role="button" attribute for buttons starts */
try {
    storeWCAG.addRoleButton = function() {

        var arr = [".gwb-p",".gwb-s",".gdb-p",".gdb-s",".gdb-s-v2",
                    ".button-01",".button-01-arrow",".button-01-secondary",".button-02",
                    ".button-02-arrow",".button-02-whitearrow",".button-05-s",
                    ".homepage-pill-button",".homepage-pill-button-1"];

        $.each(arr, function( index, value ) {
            $(".ls-area a"+value).attr("role", "button");
        });
        
    }
} catch (err) {
    if(typeof businessLogger != 'undefined'){
        businessLogger
            .error()
            .key("role-button.js")
            .noodle()
            .env()
            .service("store")
            .errorCode("DSTORE_DOM_Failed_Role_Button")
            .errorId()
            .description("Failed to append role button attribute" + JSON.stringify(err))
            .context()
            .origin("store")
            .logMessage().postlogToSplunk();
        }
    }

$(window).load(function () {

    storeWCAG.addRoleButton();

});

/* Add role="button" attribute for buttons end *///
var offcanvasButton;
var countryDropdownbutton;
setTimeout(function(){ 
    try {
      if(typeof globalSearchJsFlag != 'undefined' && globalSearchJsFlag == 'true' ) {
        $('.header-container .header-banner').find('a').each(function() {
          $(this).attr('tabindex',1);
        });
        $('.header-container .user-right-nav').find('a').each(function() {
          $(this).attr('tabindex',1);
        });
        $('.header-container .ticker-f-header').find('a').each(function() {
            $(this).attr('tabindex',1);
          });
      }
    }
    catch(e) {}
  }, 6000);
if (!(/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent))) {

    $(window).load(function() {
        var WCAG_website;
        if( typeof ns('cms') != 'undefined' && isNotEmptyStr(ns('cms')) && typeof ns('cms').website != 'undefined' &&isNotEmptyStr(ns('cms').website)) {
            WCAG_website = ns('cms').website;    
        }

        /* Not loading it for CVS for now. Need to remove WCAG_website !="cvs_us" condition to make it load for CVS too*/
        
            /* Start -- initialisation of dropdown menus */
            try {
                if(document.getElementById('CountryDropDownLink') != null ) {
                    countryDropdownbutton = new storeWCAGMenuButton(document.getElementById('CountryDropDownLink'), storeWCAGFoundationDropdown, storeWCAGFoundationDropdown);
                    countryDropdownbutton.init();
                }
            } catch (e) {
                console.log(e);
            }

            try {
                if(document.getElementById('globalHeaderUserMenu') != null ) {
                    var userMenuButton = new storeWCAGMenuButton(document.getElementById('globalHeaderUserMenu'), storeWCAGFoundationDropdown, storeWCAGFoundationDropdown);
                    userMenuButton.init();
                }
            } catch (e) {}

            try {
                if(document.getElementById('globalHeaderHelp1') != null ) {
                    var helpMenuButton = new storeWCAGMenuButton(document.getElementById('globalHeaderHelp1'), storeWCAGFoundationDropdown, storeWCAGFoundationDropdown);
                    helpMenuButton.init();
                }
            } catch (e) {}

            try {
                if(document.getElementById('store-offcanvas-menu-id') != null ) {
                    offcanvasButton = new storeWCAGMenuButton(document.getElementById('store-offcanvas-menu-id'), storeWCAGFoundationDropdown,storeWCAGFoundationDropdown);
                    offcanvasButton.init();
                }
            } catch (e) {}

            var megaDropdownbutton = [];
            var shopmainlinks = $('.shopmenu-main-links');
            try {
                $.each(shopmainlinks, function(index, value) {
                    //if($(shopmainlinks[index]).attr('aria-controls') && document.getElementById($(shopmainlinks[index]).attr('id'))!=null) {
                    megaDropdownbutton[index] = new storeWCAGMenuButton(value, storeWCAGMenuOpenMegaDropDown, storeWCAGMenuCloseMegaDropDown);
                    megaDropdownbutton[index].init();
                    //}
                });
            } catch (e) {}

            /* End -- initialisation of dropdown menus */

            /* Start -- initialisation of accordion */
            setTimeout(function() {
                initializeAccordion();
            }, 3000);
            /* End -- initialisation of accordion */
            

        
        var menuButtonLinkArray = [];
        var menuButtonLinks = $('[data-menu-button]'); //document.querySelector('[data-menu-button=""]');
        try {
            $.each(menuButtonLinks, function(index, value) {
                menuButtonLinkArray[index] = new storeWCAGMenuButton(value, $(value).attr('data-menu-open'), $(value).attr('data-menu-close')); // , $(value).attr('data-default-selection')
                menuButtonLinkArray[index].init();
            });
        } catch (e) {}
        /* To load ASYNC Walgreens customised js code for WCAG file  on doc ready */
        if ( typeof WCAG_WG_Src != 'undefined' && isNotEmptyStr(WCAG_WG_Src) && WCAG_website=="walgreens_us" ) {
            appendJSDynamic(WCAG_WG_Src,'async');
        }
        
    });

}

