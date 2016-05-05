'use strict';

module.exports = function(app) {
  app.controller('FindCharacterController', ['httpService', 'CharacterService', '$location', '$window', '$scope', function(httpService, CharacterService, $location, $window, $scope) {
    // Internal Variables
    const saveCharacter = CharacterService();
    const httpReq = httpService('herofinder');
    const _this = this;
    var results = [];

    // Controller Variables
    _this.filterOpts = [];
    _this.showResults = false;
    _this.onLeft = true;
    _this.onRight = false;
    _this.filtered = [];
    _this.num = 0;
    _this.options = [
      ['No Preference', 'Male', 'Female', 'Unknown'],
      ['No Preference', 'Dark', 'Bronze', 'Silver', 'Golden', 'Modern'],
      ['No Preference'],
      ['No Preference']
    ]

    _this.init = () => {
      httpReq.getAll()
        .then(res => {
          results = res.data;
          results = results.map(char => {
            char.thumbnail = char.thumbnail.slice(0, char.thumbnail.length - 4) + '/portrait_fantastic.jpg';
            return char;
          });
        });
    }

    var filter0 = (num, option) => {
      console.log(results);
      if (option == 'No Preference') return _this.filtered = results;
      _this.filtered = results.filter(char => {
        return (char.gender == option);
      });
      console.log(_this.filtered);
    }

    var filter1 = (num, option) => {
      if (option == 'No Preference') {
        _this.filtered.forEach(char => {
          if (!_this.options[2].includes(char.identity_status)) _this.options[2].push(char.identity_status);
        });
        return _this.filtered;
      }

      _this.filtered = _this.filtered.filter(char => {
        return char[option.toLowerCase()];
      }).map(char => {
        if (!_this.options[2].includes(char.identity_status)) _this.options[2].push(char.identity_status);
        return char;
      });

      if (_this.options[2].length < 3) _this.num += 1;

      if (_this.filtered.length <= 20) {
        return _this.getResults();
      }
      console.log(_this.filtered);
    }

    var filter2 = (num, option) => {
      if (option == 'No Preference') {
        _this.filtered.forEach(char => {
          if (char.citizenship == 'U.S.A.') {
            if (!_this.options[3].includes('U.S.A.')) _this.options[3].push('U.S.A.');
          } else {
            if (!_this.options[3].includes('Other')) _this.options[3].push('Other');
          }
        });
        return _this.filtered;
      }

      _this.filtered = _this.filtered.filter(char => {
        return char.identity_status == option;
      }).map(char => {
        if (char.citizenship == 'U.S.A.') {
          if (!_this.options[3].includes('U.S.A.')) _this.options[3].push('U.S.A.');
        } else {
          if (!_this.options[3].includes('Other')) _this.options[3].push('Other');
        }
        return char;
      });

      if (_this.options[3].length < 3) _this.num += 1;

      if (_this.filtered.length <= 20) {
        return _this.getResults();
      }
      console.log(_this.filtered);
    }

    var filter3 = (num, options) => {
      if (options[3] == 'No Preference') return _this.filtered;

      _this.filtered = _this.filtered.filter(char => {
        if (options[3] == 'U.S.A.') return char.citizenship == 'U.S.A.';
        return char.citizenship == 'Other';
      });

      // if (_this.filtered.length <= 20 || _this.options[num].length < 3) {
      //   return _this.getResults();
      // }
      console.log(_this.filtered);
    }

    _this.lastFilter = (num, option) => {
      _this.filterOpts[num] =  option;
      _this.filterList[num](num, option);
      _this.filtered = _this.filtered.length >= 20 ? _this.filtered.slice(0, 20) : _this.filtered;
      console.log(_this.filtered);
      _this.getResults();
    }

    _this.filterList = [filter0, filter1, filter2, filter3];

    _this.questions = [
      'What is their gender?',
      'What era did they first appear in?',
      'Do you want a character who\'s identity is:',
      'What is their citizenship?'
      // 'What is the color of their hair?',
      // 'How many publications have they appeared in?',
      // 'What weight-class are they?',
    ];

    _this.nxtQ = (num, option) => {
      console.log(option);
      if (num == _this.questions.length-1) return;
      _this.filterOpts[num] = option;
      _this.filterList[num](num, option);
      _this.num = _this.num += 1;
      console.log(_this.num);
    }

    // _this.back = (num) => {
    //   if (num == 0) return;
    //   _this.num = _this.num -= 1;
    //   console.log(_this.num);
    // }

    _this.getResults = () => {
      // TODO: setup a #/find-charater/results route
      _this.showResults = true;
      endScroll();
    }

    _this.selectCharacter = (character) => {
      saveCharacter.set(character);
      $location.path('/character');
    }

    function endScroll() {
      var scroll = document.getElementById('character-images');
      var inner = $('#character-images');
      var ele = $('#results');
      inner.scroll(function() {
        var scrollWidth = inner.scrollLeft() + ele.width();
        if (inner.scrollLeft() <= 15) {
          _this.onLeft = true;
        } else if (inner.scrollLeft() > 15 && inner.scrollLeft() < 30) {
          _this.onLeft = false;
        } else if (scrollWidth >= scroll.scrollWidth - 15) {
          _this.onRight = true;
        } else if (scrollWidth < scroll.scrollWidth - 15 && scrollWidth > scroll.scrollWidth - 30) {
          _this.onRight = false;
        }
        $scope.$digest();
      });
    }
  }]);

  app.directive('question', function() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'views/question.html'
    }
  });

  app.directive('questionResults', function() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'views/question_results.html'
    }
  });
}
