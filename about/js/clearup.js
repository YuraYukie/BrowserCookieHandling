
globalCookies = [];

var PopupController = function () {
  this.button_ = document.getElementById('button');
  this.timeframe_ = document.getElementById('timeframe');
  this.deleteChecked = document.getElementById('deleteChecked');
  this.deleteAll = document.getElementById('deleteAll');
  this.insertCookieTable();
  this.addListeners_();
  var arr = document.getElementsByClassName('search-input');
  for (i = 0; i < arr.length; i++) {
    arr[i].onkeyup = function (e) {
      PopupController.prototype.insertCookieTable();
    }
  }
};

PopupController.prototype = {

  button_: null,
  timeframe_: null,

  addListeners_: function () {
    this.button_.addEventListener('click', this.handleClick_.bind(this));
    this.timeframe_.addEventListener('change', this.handleChange.bind(this));
    this.deleteChecked.addEventListener('click', this.deleteCheckedCookies.bind(this));
    this.deleteAll.addEventListener('click', this.deleteAllCookies.bind(this));
  },

  insertCookieTable: function () {
    var self = this;
    chrome.cookies.getAll({}, function (cookies) {
      cookies = self.getFilter(cookies);
      globalCookies = cookies;
      console.log("cookies:", cookies);
      var found = '';
      found += '<span class="found-count">Found:' + cookies.length + '</span>' + (cookies.length > 0 ? '<a href="javascript:void(0)" class="selectall">Select all</a>' : '') + '</div>';
      found += '<div class="found-result ' + (cookies.length > 0 ? 'show' : '') + '"><table id="optionData">';
      if (cookies.length > 0)
        found += '<tr><th>Domain</th><th>Name</th><th>Expiration Date</th></tr>';
      for (var i = 0; i < cookies.length; i++) {
        var domain = cookies[i].domain;
        found += '<tr><td><input type="checkbox" id="check' + i + '"><span class="domain">' + domain + '</span></td>';
        found += '<td>' + cookies[i].name + '</td>';
        found += '<td>' + cookies[i].expirationDate + '</td></tr>';
      }
      found += '</table></div>';

      document.getElementById("foundList").innerHTML = found;
    })
  },

  getFilter: function (cookies) {
    var valueText = document.getElementById("searchValue").value ? document.getElementById("searchValue").value : '';
    var domainText = document.getElementById("searchDomain").value ? document.getElementById("searchDomain").value : '';
    var nameText = document.getElementById("searchName").value ? document.getElementById("searchName").value : '';

    console.log(RegExp(domainText, "i"));

    var result = [];
    for (i = 0; i < cookies.length; i++) {
      if ((cookies[i].domain.search(RegExp(domainText, "i")) != -1) &&
        (cookies[i].name.search(RegExp(nameText, "i")) != -1) &&
        (cookies[i].value.search(RegExp(valueText, "i")) != -1)) {
        console.log(cookies[i]);
        result.push(cookies[i]);
      }
    }

    return result;
  },

  parseMilliseconds_: function (timeframe) {
    var now = new Date().getTime();
    var milliseconds = {
      'hour': 60 * 60 * 1000,
      'day': 24 * 60 * 60 * 1000,
      'week': 7 * 24 * 60 * 60 * 1000,
      '4weeks': 4 * 7 * 24 * 60 * 60 * 1000
    };

    if (milliseconds[timeframe])
      return now - milliseconds[timeframe];

    if (timeframe === 'forever')
      return 0;

    return null;
  },

  handleCallback_: function () {
    this.insertCookieTable();
    /*
    var this_button_ = this.button_;
    setTimeout(function() { 
       this_button_.innerText = 'Completed!'; 
    }, 2000);
    */
  },

  handleChange: function () {
      this.button_.disabled = false;
      this.button_.innerText = 'Clean Now!';
  },

  handleClick_: function () {
    console.log(this.timeframe_.value);
    var removal_start = this.parseMilliseconds_(this.timeframe_.value);
    if (removal_start !== undefined) {
      chrome.browsingData.removeCookies({ "since": removal_start },
        this.handleCallback_.bind(this));
    }
  },
  deleteAllCookies: function () {
    if (confirm("Are you sure you want to remove all cookies?(cannot be undone)")) {
      chrome.browsingData.removeCookies({},
        this.handleCallback_.bind(this));
    }

  },

  deleteCheckedCookies: function () {
    for (var i = 0; i < globalCookies.length; i++) {
      if (document.getElementById("check" + i).checked) {
        var cookie = globalCookies[i];
        console.log(cookie);
        chrome.cookies.remove({ url: "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path, name: cookie.name, storeId: cookie.storeId },
          this.handleCallback_.bind(this));
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', function () {
  window.PC = new PopupController();
});

$(document).on('click', '.selectall', function () {
  var parent = $('#optionData');
  $(this).toggleClass('check').text($(this).hasClass('check') ? 'Uncheck all' : 'Select all');
  var checked = $(this).hasClass('check') ? true : false;

  parent.find('input').prop('checked', checked);
})

