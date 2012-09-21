(function($) {
    
    $.fn.tabs = function (swap_cb) { this.each(function(i, tab_container) { new TabInterface($(tab_container), i, swap_cb); }); }

    //vars referenced by tab interfaced via closure
    var headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6' ];
    
    function TabInterface($cabinet, _i, _swap_cb) {
  // Public Properties
  this.Version = '1.4'; // version

  // make sure we have a unique iterator if one wasnÕt passed
  _i = _i || ( new Date() ).getTime();
  
  var _tabList = $('<ul class="optionList tabList" role="tablist" />'), // the tab list
            _tab     = $('<li role="tab" aria-selected="false" tabindex="-1" />'), // prototype tab
      self     = this; 
    
  // Private Methods
  function initialize() {

            var tag = false, firstHeading,
    id  = $cabinet.attr( 'id' ) || 'folder-' + _i,
    containers;

    //find the containers (tab folders)
    containers = $cabinet.children();

    // find the tag representing the tab heading
    tag = containers.children().get(0).nodeName.toLowerCase(); //our first guess is that it's just the first child
    if($.inArray(tag, headings)===-1) {   //but if that's not a heading, we just opt for the first heading we find
        firstHeading = containers.eq(0).filter(':header');
        if(!firstHeading.length) {
      return; //expect if there's no first heading, in which case we just stop.
        }
        tag = firstHeading.get(0).nodeName.toLowerCase();
    }
    
    //configure our elements (bases classes and aria) now that we know we have a valid tag for tabs
    $cabinet.addClass('tabbed-on').removeClass('tabbed').attr({'role':'application', 'id':id});
    containers.addClass('folder').attr({'role':'tabpanel', 'aria-hidden':'true', 'tabindex':'-1'})

    // add the index
    $cabinet.prepend( _tabList );
    
    //build the tabs, folders, and set up listeners
    containers.each(function(i, container) {
        var $container = $(this),
      $tab       = _tab.clone(),

            container_id = $container.attr('id') || id + '-' + i,
      tab_id       = container_id + '-tab';
      
      $container.attr({'id': container_id, 'aria-labelledby':tab_id});
      $tab.attr({'id':tab_id, 'aria-controls':container_id, 'aria-describedby':container_id}).html($container.find(tag).eq(0).addClass('accessibility').html());
      
      _tabList.append($tab);
    });

    $cabinet.delegate('li[role="tab"]', 'click focus', swap);
    $cabinet.delegate('li[role="tab"]', 'keydown', moveFocus); //add keyboard control
    
    //set the first tab active & call the swap cb (since first active is a swap of sorts)
    setActive(_tabList.find('li:first-child'));
    if(typeof _swap_cb=="function") { _swap_cb(_tabList.find('li:first-child').get(0), null, swap); }
  }

  function swap(event)
  {
      var $oldTab = $('#' + $cabinet.attr('aria-activedescendant') + '-tab'),
    $newTab = $(this);

      if($newTab!==$oldTab) {
    deActivate($oldTab); //the old tab
    setActive($(this));  //the new tab
    
    //run the cb
         if(typeof _swap_cb=="function") { _swap_cb(this, $oldTab.get(0), self.swap); }
      }
  }

  function setActive($tab) {
      var $container = $('#'+$tab.attr('aria-controls'));

      $container.attr( 'aria-hidden', 'false' ).addClass('visible');
      $tab.attr({'aria-selected': 'true', 'tabindex':0}).addClass('active current');
      
      //update the container's aria interface too
      $cabinet.attr('aria-activedescendant', $container.attr('id'));
  }
  
  function deActivate($tab) {
      var $container = $('#'+$tab.attr('aria-controls'));
      
      $container.attr('aria-hidden', 'true').removeClass('visible');
      $tab.removeClass('active').removeClass('current').attr({'aria-selected':'false', 'tabindex':'-1'});
  }

  function moveFocus(event) {
      var $tab = $(this),
    key  = event.which,
    pass = true;

    switch (key)
    {
        case 13: // enter
      document.getElementById( _active ).focus();
      pass = false;
      break;    
        case 37: // left arrow
        case 38: // up arrow
      move($tab, 'previous', false );
      pass = false;
      break;
        case 39: // right arrow
        case 40: // down arrow
      move($tab, 'next', false );
      pass = false;
      break;
        case 36: // home
      move($tab, 'previous', true );
      pass = false;
      break;    
        case 35: // end
      move($tab, 'next', true );
      pass = false;
      break;
        case 27: // escape
      tab.blur();
      pass = false;
      break;
    }

    if (!pass) {
        event.stopPropagation();
        event.preventDefault();
        return false;
    }
  }

  function move($tab, direction, complete )
  {
    if (complete) {

        if (direction == 'previous') {
      $tab.parent().children(':first-child').focus();
        }
        else {
      $tab.parent().children(':last-child').focus();
        }
    }

    else {
        var target = (direction == 'previous') ? $tab.prev() : $tab.next();

        if (target.length) {
      target.focus();
        }
        // wrap
        else {
      if (direction == 'next') {
          $tab.parent().children(':first-child').focus();
      }
      else {
          $tab.parent().children(':last-child').focus();
      }
        }
    }
  }

  // start it up
  initialize();
    };
})(jQuery);
hasher.prependHash = '';
hasher.init();
hasher.changed.add(function() { })
jQuery('.tabbed').tabs(function(new_tab, old_tab, swap) {
    if(!old_tab) {//initial load
  var hash = hasher.getHash();
  
  if(hash) {
      swap.apply($('#' + hash + '-tab'));
  }
    }
    else { //swap
    var prevTop = $(document).scrollTop(), new_panel_id = $(new_tab).attr('id').substr(0, $(new_tab).attr('id').length -4);
    hasher.setHash(new_panel_id);
    
    $('form input', new_tab).trigger('blur').trigger('focusout'); //so that the error messages go away w/ tab switch
    
    if(navigator.userAgent.indexOf('Chrome')!==-1) {    
        setTimeout(function() {
      $(document).scrollTop(prevTop);
        }, 2);
    }
    else {
        $(document).scrollTop(prevTop); 
    }
    }
});