
var YellowPageEditDialog = new function() {
  var self = this;
  var dialog = null;
  $(document).ready(function() {
    dialog = $('#yellowPageEditDialog');
    dialog.modal({show: false});
    dialog.on('hide', self.onHide);
    ko.applyBindings(self, dialog.get(0));
    PeerCast.getYellowPageProtocols(function(result) {
      if (result) {
        self.yellowPageProtocols.splice.apply(
          self.yellowPageProtocols,
          [0, self.yellowPageProtocols().length].concat(result));
      }
    });
  });
  self.yellowPageProtocols = ko.observableArray();
  self.name     = ko.observable("");
  self.uri      = ko.observable("");
  self.protocol = ko.observable("");
  self.onOK     = null;

  self.show = function(ok) {
    self.onOK = ok;
    dialog.modal('show');
  };

  self.onUpdate = function() {
    self.onOK(self);
    dialog.modal('hide');
  };
};

var ListenerEditDialog = new function() {
  var self = this;
  var dialog = null;
  $(document).ready(function() {
    dialog = $('#listenerEditDialog');
    dialog.modal({show: false});
    dialog.on('hide', self.onHide);
    ko.applyBindings(self, dialog.get(0));
  });
  self.address            = ko.observable('0.0.0.0');
  self.port               = ko.observable(7144);
  self.localAccepts       = ko.observable(15);
  self.localAuthRequired  = ko.observable(false);
  self.globalAccepts      = ko.observable(PeerCast.OutputStreamType.Relay | PeerCast.OutputStreamType.Metadata);
  self.globalAuthRequired = ko.observable(true);
  self.onOK          = null;

  self.lanPlayAccept = ko.computed({
    read: function() { return (self.localAccepts() & PeerCast.OutputStreamType.Play)!=0; },
    write: function(value) {
      if (value) self.localAccepts(self.localAccepts() | PeerCast.OutputStreamType.Play);
      else       self.localAccepts(self.localAccepts() & ~PeerCast.OutputStreamType.Play);
    }
  });

  self.lanRelayAccept = ko.computed({
    read: function() { return (self.localAccepts() & PeerCast.OutputStreamType.Relay)!=0; },
    write: function(value) {
      if (value) self.localAccepts(self.localAccepts() | PeerCast.OutputStreamType.Relay);
      else       self.localAccepts(self.localAccepts() & ~PeerCast.OutputStreamType.Relay);
    }
  });

  self.lanInterfaceAccept = ko.computed({
    read: function() { return (self.localAccepts() & PeerCast.OutputStreamType.Interface)!=0; },
    write: function(value) {
      if (value) self.localAccepts(self.localAccepts() | PeerCast.OutputStreamType.Interface);
      else       self.localAccepts(self.localAccepts() & ~PeerCast.OutputStreamType.Interface);
    }
  });

  self.wanPlayAccept = ko.computed({
    read: function() { return (self.globalAccepts() & PeerCast.OutputStreamType.Play)!=0; },
    write: function(value) {
      if (value) self.globalAccepts(self.globalAccepts() | PeerCast.OutputStreamType.Play);
      else       self.globalAccepts(self.globalAccepts() & ~PeerCast.OutputStreamType.Play);
    }
  });

  self.wanRelayAccept = ko.computed({
    read: function() { return (self.globalAccepts() & PeerCast.OutputStreamType.Relay)!=0; },
    write: function(value) {
      if (value) self.globalAccepts(self.globalAccepts() | PeerCast.OutputStreamType.Relay);
      else       self.globalAccepts(self.globalAccepts() & ~PeerCast.OutputStreamType.Relay);
    }
  });

  self.wanInterfaceAccept = ko.computed({
    read: function() { return (self.globalAccepts() & PeerCast.OutputStreamType.Interface)!=0; },
    write: function(value) {
      if (value) self.globalAccepts(self.globalAccepts() | PeerCast.OutputStreamType.Interface);
      else       self.globalAccepts(self.globalAccepts() & ~PeerCast.OutputStreamType.Interface);
    }
  });

  self.show = function(ok) {
    self.onOK = ok;
    dialog.modal('show');
  };

  self.onUpdate = function() {
    self.onOK(self);
    dialog.modal('hide');
  };
};

var ListenerViewModel = function(value) {
  var self = this;
  self.id                     = ko.observable(value.listenerId);
  self.address                = ko.observable(value.address);
  self.port                   = ko.observable(value.port);
  self.localAccepts           = ko.observable(value.localAccepts);
  self.globalAccepts          = ko.observable(value.globalAccepts);
  self.localAuthRequired      = ko.observable(value.localAuthorizationRequired);
  self.globalAuthRequired     = ko.observable(value.globalAuthorizationRequired);
  self.authenticationId       = ko.observable(value.authenticationId);
  self.authenticationPassword = ko.observable(value.authenticationPassword);
  self.checked                = ko.observable(false);
  self.setAccepts = function() {
    PeerCast.setListenerAccepts(self.id(), self.localAccepts(), self.globalAccepts());
  };
  self.setAuthorizationRequired = function() {
    PeerCast.setListenerAuthorizationRequired(self.id(), self.localAuthRequired(), self.globalAuthRequired());
  };
  self.localAuthRequired.subscribe(function (value) {
    self.setAuthorizationRequired();
  });
  self.globalAuthRequired.subscribe(function (value) {
    self.setAuthorizationRequired();
  });

  self.update = function(data) {
    self.id(data.listenerId);
    self.address(data.address);
    self.port(data.port);
    self.localAccepts(data.localAccepts);
    self.globalAccepts(data.globalAccepts);
    self.localAuthRequired(data.localAuthorizationRequired);
    self.globalAuthRequired(data.globalAuthorizationRequired);
    self.authenticationId(data.authenticationId);
    self.authenticationPassword(data.authenticationPassword);
  };

  self.addressLabel = ko.computed(function() {
    var addr = self.address();
    if (addr=='0.0.0.0')   return 'IPv4 Any';
    else if (addr=='0::0') return 'IPv6 Any';
    else                   return addr;
  });

  self.lanPlayAccept = ko.computed({
    read: function() { return (self.localAccepts() & PeerCast.OutputStreamType.Play)!=0; },
    write: function(value) {
      if (value) self.localAccepts(self.localAccepts() | PeerCast.OutputStreamType.Play);
      else       self.localAccepts(self.localAccepts() & ~PeerCast.OutputStreamType.Play);
      self.setAccepts();
    }
  });

  self.lanRelayAccept = ko.computed({
    read: function() { return (self.localAccepts() & PeerCast.OutputStreamType.Relay)!=0; },
    write: function(value) {
      if (value) self.localAccepts(self.localAccepts() | PeerCast.OutputStreamType.Relay);
      else       self.localAccepts(self.localAccepts() & ~PeerCast.OutputStreamType.Relay);
      self.setAccepts();
    }
  });

  self.lanInterfaceAccept = ko.computed({
    read: function() { return (self.localAccepts() & PeerCast.OutputStreamType.Interface)!=0; },
    write: function(value) {
      if (value) self.localAccepts(self.localAccepts() | PeerCast.OutputStreamType.Interface);
      else       self.localAccepts(self.localAccepts() & ~PeerCast.OutputStreamType.Interface);
      self.setAccepts();
    }
  });

  self.wanPlayAccept = ko.computed({
    read: function() { return (self.globalAccepts() & PeerCast.OutputStreamType.Play)!=0; },
    write: function(value) {
      if (value) self.globalAccepts(self.globalAccepts() | PeerCast.OutputStreamType.Play);
      else       self.globalAccepts(self.globalAccepts() & ~PeerCast.OutputStreamType.Play);
      self.setAccepts();
    }
  });

  self.wanRelayAccept = ko.computed({
    read: function() { return (self.globalAccepts() & PeerCast.OutputStreamType.Relay)!=0; },
    write: function(value) {
      if (value) self.globalAccepts(self.globalAccepts() | PeerCast.OutputStreamType.Relay);
      else       self.globalAccepts(self.globalAccepts() & ~PeerCast.OutputStreamType.Relay);
      self.setAccepts();
    }
  });

  self.wanInterfaceAccept = ko.computed({
    read: function() { return (self.globalAccepts() & PeerCast.OutputStreamType.Interface)!=0; },
    write: function(value) {
      if (value) self.globalAccepts(self.globalAccepts() | PeerCast.OutputStreamType.Interface);
      else       self.globalAccepts(self.globalAccepts() & ~PeerCast.OutputStreamType.Interface);
      self.setAccepts();
    }
  });

  self.resetAuthenticationKey = function() {
    PeerCast.resetListenerAuthenticationKey(self.id(), function (data) {
      self.update(data);
    });
  };
};

var YellowPageViewModel = function(value) {
  var self = this;
  self.id       = ko.observable(value.yellowPageId);
  self.name     = ko.observable(value.name);
  self.uri      = ko.observable(value.uri);
  self.protocol = ko.observable(value.protocol);
  self.checked  = ko.observable(false);
};

var SettingsViewModel = new function() {
  var self = this;
  var updating = false;

  self.maxRelays             = ko.observable(null);
  self.maxDirects            = ko.observable(null);
  self.maxRelaysPerChannel   = ko.observable(null);
  self.maxDirectsPerChannel  = ko.observable(null);
  self.maxUpstreamRate       = ko.observable(null);
  self.inactiveChannelLimit  = ko.observable(null);
  self.channelCleanupMode    = ko.observable(null);
  self.listeners             = ko.observableArray();
  self.yellowPages           = ko.observableArray();

  $.each([
    self.maxRelays,
    self.maxDirects,
    self.maxRelaysPerChannel,
    self.maxDirectsPerChannel,
    self.maxUpstreamRate,
    self.inactiveChannelLimit,
    self.channelCleanupMode
  ], function (i, o) {
    o.subscribe(function (new_value) { if (!updating) self.submit(); });
  });
  self.submit = function() {
    var settings = {
      maxRelays:            self.maxRelays()!=null            ? Number(self.maxRelays()) : null,
      maxDirects:           self.maxDirects()!=null           ? Number(self.maxDirects()) : null,
      maxRelaysPerChannel:  self.maxRelaysPerChannel()!=null  ? Number(self.maxRelaysPerChannel()) : null,
      maxDirectsPerChannel: self.maxDirectsPerChannel()!=null ? Number(self.maxDirectsPerChannel()) : null,
      maxUpstreamRate:      self.maxUpstreamRate()!=null      ? Number(self.maxUpstreamRate()) : null,
      channelCleaner: {
        inactiveLimit: self.inactiveChannelLimit()!=null ? Number(self.inactiveChannelLimit())*60000 : null,
        mode:          self.channelCleanupMode()!=null   ? Number(self.channelCleanupMode()) : null
      }
    };
    PeerCast.setSettings(settings);
  };

  self.addYellowPage = function() {
    YellowPageEditDialog.show(function(yp) {
      var uri = yp.uri();
      if (!uri.match(/^\w+:\/\//)) {
        uri = yp.protocol() + '://' + yp.uri();
      }
      PeerCast.addYellowPage(yp.protocol(), yp.name(), uri, function() {
        self.update();
      });
    });
  }

  self.removeYellowPages = function() {
    var removed = self.yellowPages.remove(function(yp) { return yp.checked(); });
    $.each(removed, function(i, yp) {
      PeerCast.removeYellowPage(yp.id(), function() { self.update(); });
    });
  }

  self.addListener = function() {
    ListenerEditDialog.show(function(listener) {
      PeerCast.addListener(
          listener.address(),
          Number(listener.port()),
          listener.localAccepts(),
          listener.globalAccepts(),
          listener.localAuthRequired(),
          listener.globalAuthRequired(),
          function() {
        self.update();
      });
    });
  };

  self.removeListener = function() {
    var removed = self.listeners.remove(function(listener) { return listener.checked(); });
    $.each(removed, function(i, listener) {
      PeerCast.removeListener(listener.id(), function() { self.update(); });
    });
  };

  self.resetListenerAuthenticationKey = function() {
    $.each(self.listeners(), function(i, listener) {
      if (listener.checked()) {
        listener.resetAuthenticationKey();
      }
    });
  };

  self.update = function() {
    PeerCast.getSettings(function(result) {
      if (result) {
        updating = true;
        self.maxRelays(result.maxRelays);
        self.maxDirects(result.maxDirects);
        self.maxRelaysPerChannel(result.maxRelaysPerChannel);
        self.maxDirectsPerChannel(result.maxDirectsPerChannel);
        self.maxUpstreamRate(result.maxUpstreamRate);
        if (result.channelCleaner) {
          self.inactiveChannelLimit(result.channelCleaner.inactiveLimit/60000);
          self.channelCleanupMode(result.channelCleaner.mode);
        }
        updating = false;
      }
    });
    PeerCast.getListeners(function(result) {
      if (result) {
        updating = true;
        var new_listeners = $.map(result, function(listener) {
          return new ListenerViewModel(listener);
        });
        self.listeners.splice.apply(
          self.listeners,
          [0, self.listeners().length].concat(new_listeners));
        updating = false;
      }
    });
    PeerCast.getYellowPages(function(result) {
      if (result) {
        updating = true;
        var new_yps = $.map(result, function(yp) {
          return new YellowPageViewModel(yp);
        });
        self.yellowPages.splice.apply(
          self.yellowPages,
          [0, self.yellowPages().length].concat(new_yps));
        updating = false;
      }
    });
  };

  self.bind = function(target) {
    self.update();
    updating = true;
    ko.applyBindings(self, target);
    updating = false;
  };
};

