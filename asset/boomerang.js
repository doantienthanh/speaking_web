if (ns('cms').service != 'store' && ns('cms').service != 'create' && ns('cms').service != 'cart') {
    var c = encodeURIComponent(unescape(document.cookie.split(";")));
    var bip = [];

    try {

      var headStart = ns('cms').pageBeginTimer;
      var bodyStart = ns('cms').pageBodyTimer;
      var bodyEnd = ns('cms').pageEndTimer;
      var bodyOpen = bodyStart - headStart;
      var headerClose = ns('cms').pageHeaderTimer - headStart;
      var bodyClose = bodyEnd - headStart;

      if (!String.prototype.trim) {
        String.prototype.trim = function () {
          return this.replace(/^\s+|\s+$/g, '');
        };
      }
      if (!String.prototype.startsWith) {
        Object.defineProperty(String.prototype, 'startsWith', {
          enumerable: false,
          configurable: false,
          writable: false,
          value: function (searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
          }
        });
      }
      for (ii = 0; ii < c.length; ii++) { k = c[ii].split("="); var key = k[0].trim(); if (key.startsWith("bip")) { bip.push(k[1]) } }
      bip = bip.join(";");
      var tmz = new Date().toTimeString().split(" ")[1];
      bip = bip + "&tmz=" + tmz

    } catch (e) {
    }
    if (document.location.href.indexOf("library") != -1) {
      setTimeout(function () {
        BOOMR.init({
          beacon_url: ('https:' == document.location.protocol ? 'https://' : 'http://') + ns("cms").siteHost + ns("cms").storeBasePath + "/resources/images/dots.gif?device=" + store.deviceType + "&bip=" + bip + "&bodyOpen=" + bodyOpen + "&bodyClose=" + bodyClose + "&headerClose=" + headerClose + "&context=" + ns('cms').context + "&cdcr=" + store.isCrossDCSession + "&ls=" + store.isUserLoggedIn,
          log: null, beacon_type: "GET", ResourceTiming: {
            enabled: false
          }
        });
      }, 2000);
    } else {
      BOOMR.init({
        beacon_url: ('https:' == document.location.protocol ? 'https://' : 'http://') + ns("cms").siteHost + ns("cms").storeBasePath + "/resources/images/dots.gif?device=" + store.deviceType + "&bip=" + bip + "&bodyOpen=" + bodyOpen + "&bodyClose=" + bodyClose + "&headerClose=" + headerClose + "&context=" + ns('cms').context + "&cdcr=" + store.isCrossDCSession + "&ls=" + store.isUserLoggedIn,
        log: null, beacon_type: "GET",
        ResourceTiming: {
          enabled: false
        }
      });
    }
  }
  else if (ns('cms').service == 'store') {
    var c = encodeURIComponent(unescape(document.cookie.split(";")));
    var bip = [];

    try {

      var headStart = ns('cms').pageBeginTimer;
      var bodyStart = ns('cms').pageBodyTimer;
      var bodyEnd = ns('cms').pageEndTimer;
      var bodyOpen = bodyStart - headStart;
      var headerClose = ns('cms').pageHeaderTimer - headStart;
      var bodyClose = bodyEnd - headStart;
      var noodle = getCookieVal("PNOODLE");

      var componentsResponseTime = "";
      for (key in ns('cms').componentMap) {
        componentsResponseTime = componentsResponseTime.concat("&", key, "=", ns('cms').componentMap[key]);
      }
      //console.log("components response time==>"+componentsResponseTime);


      if (!String.prototype.trim) {
        String.prototype.trim = function () {
          return this.replace(/^\s+|\s+$/g, '');
        };
      }
      if (!String.prototype.startsWith) {
        Object.defineProperty(String.prototype, 'startsWith', {
          enumerable: false,
          configurable: false,
          writable: false,
          value: function (searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
          }
        });
      }
      for (ii = 0; ii < c.length; ii++) { k = c[ii].split("="); var key = k[0].trim(); if (key.startsWith("bip")) { bip.push(k[1]) } }
      bip = bip.join(";");
      var tmz = new Date().toTimeString().split(" ")[1];
      bip = bip + "&tmz=" + tmz

    } catch (e) {
    }

    if (typeof ns('cms').boomerangCustomAttributesFlag != 'undefined' && ns('cms').boomerangCustomAttributesFlag == 'true') {
      BOOMR.init({
        beacon_url: ('https:' == document.location.protocol ? 'https://' : 'http://') + ns("cms").siteHost + ns("cms").storeBasePath + "/resources/images/dots.gif?device=" + store.deviceType + "&bip=" + bip + "&bodyOpen=" + bodyOpen + "&bodyClose=" + bodyClose + "&headerClose=" + headerClose + componentsResponseTime,
        log: null, beacon_type: "GET", ResourceTiming: {
          enabled: false
        }
      });
  
      BOOMR.addVar({ "noodle": noodle, "cdcr": store.isCrossDCSession, "context": ns('cms').context ,"ls":store.isUserLoggedIn});
    }
    else {
      BOOMR.init({
        beacon_url: ('https:' == document.location.protocol ? 'https://' : 'http://') + ns("cms").siteHost + ns("cms").storeBasePath + "/resources/images/dots.gif?device=" + store.deviceType + "&bip=" + bip + "&bodyOpen=" + bodyOpen + "&bodyClose=" + bodyClose + "&headerClose=" + headerClose + "&noodle=" + noodle + componentsResponseTime + "&context=" + ns('cms').context + "&cdcr=" + store.isCrossDCSession + "&ls=" + store.isUserLoggedIn,
        log: null, beacon_type: "GET",ResourceTiming: {
          enabled: false
        }
      });
   
    }
  
  }
  
  function getCookieVal(NameOfCookie) {
    if (document.cookie.length > 0) {
      begin = document.cookie.indexOf(NameOfCookie + "=");
      if (begin != -1) {
        begin += NameOfCookie.length + 1;
        end = document.cookie.indexOf(";", begin);
        if (end == -1) end = document.cookie.length;
        return unescape(document.cookie.substring(begin, end));
      }
    }
    return null;
  }
  