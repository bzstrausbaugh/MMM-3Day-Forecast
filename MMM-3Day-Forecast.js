/* Magic Mirror Module: MMM-FAA-Delay
 * Version: 1.0.0
 *
 * By Nigel Daniels https://github.com/nigel-daniels/
 * MIT Licensed.
 */

Module.register('MMM-3Day-Forecast', {
  defaults: {
    api_key: '',
    lat: 0.0,
    lon: 0.0,
    units: 'M',
    lang: 'en',
    horizontalView: false,
    interval: 900000, // Every 15 mins
  },

  start: function () {
    Log.log('Starting module: ' + this.name);

    // Set up the local values, here we construct the request url to use
    this.units = this.config.units;
    this.loaded = false;
    this.url =
      'http://api.weatherapi.com/v1/forecast.json?q=' +
      this.config.lat +
      ',' +
      this.config.lon +
      '&days=3&lang=' +
      this.config.lang +
      '&hour=12&key=' +
      this.config.api_key;
    this.forecast = [];
    this.horizontalView = this.config.horizontalView;

    // Trigger the first request
    this.getWeatherData(this);
  },

  getScripts: function () {
    return ['moment.js'];
  },

  getStyles: function () {
    return ['3day_forecast.css', 'font-awesome.css'];
  },

  getTranslations: function () {
    return {
      da: 'translations/da.json',
      de: 'translations/de.json',
      en: 'translations/en.json',
      fr: 'translations/fr.json',
      it: 'translations/it.json',
      nb: 'translations/nb.json',
      nl: 'translations/nl.json',
      pt: 'translations/pt.json',
    };
  },

  getWeatherData: function (_this) {
    // Make the initial request to the helper then set up the timer to perform the updates
    _this.sendSocketNotification('GET-3DAY-FORECAST', _this.url);
    setTimeout(_this.getWeatherData, _this.config.interval, _this);
  },

  getDom: function () {
    // Set up the local wrapper
    var wrapper = null;

    // If we have some data to display then build the results
    if (this.loaded) {
      if (this.horizontalView) {
        wrapper = document.createElement('table');
        wrapper.className = 'small';

        // Set up the forecast for three three days
        for (var i = 0; i < 3; i++) {
          var title = '';

          // Determine which day we are detailing
          switch (i) {
            case 0:
              title = moment().format('MMM Do, YYYY');
              break;
            case 1:
              title = moment().add(1, 'days').format('MMM Do, YYYY');
              break;
            case 2:
              title = moment().add(2, 'days').format('MMM Do, YYYY');
              break;
          }

          row1 = document.createElement('tr');

          forecastIconCell = document.createElement('td');
          forecastIconCell.className = 'forecastIcon2';
          forecastIconCell.setAttribute('rowspan', '2');

          forecastIcon = document.createElement('img');
          forecastIcon.setAttribute('height', '25');
          forecastIcon.setAttribute('width', '25');
          forecastIcon.src =
            './modules/MMM-3Day-Forecast/images/icon/' +
            this.forecast[i].icon +
            '.gif';

          forecastTitleCell = document.createElement('td');
          forecastTitleCell.className = 'forecastTitle2 bright';
          forecastTitleCell.setAttribute('colspan', '4');
          forecastTitleCell.innerHTML = title;

          row2 = document.createElement('tr');

          tempIconCell = document.createElement('td');
          tempIconCell.className = 'detailIcon2';

          tempIcon = document.createElement('img');
          tempIcon.setAttribute('height', '15');
          tempIcon.setAttribute('width', '15');
          tempIcon.src = './modules/MMM-3Day-Forecast/images/high.png';

          tempCell = document.createElement('td');
          tempCell.className = 'detailText2';

          if (this.units === 'M') {
            if (this.forecast[i].high_c !== '--') {
              tempCell.innerHTML =
                Math.round(this.forecast[i].high_c) + '&deg; C';
            } else {
              tempCell.innerHTML = this.forecast[i].high_c + '&deg; C';
            }
          } else {
            if (this.forecast[i].high_f !== '--') {
              tempCell.innerHTML =
                Math.round(this.forecast[i].high_f) + '&deg; F';
            } else {
              tempCell.innerHTML = this.forecast[i].high_f + '&deg; F';
            }
          }

          rainIconCell = document.createElement('td');
          rainIconCell.className = 'detailIcon2';

          rainIcon = document.createElement('img');
          rainIcon.setAttribute('height', '15');
          rainIcon.setAttribute('width', '15');
          rainIcon.src = './modules/MMM-3Day-Forecast/images/wet.png';

          rainCell = document.createElement('td');
          rainCell.className = 'detailText2';
          rainCell.innerHTML = this.forecast[i].pop + '%';

          row3 = document.createElement('tr');

          forecastTextCell = document.createElement('td');
          forecastTextCell.className = 'forecastText2';
          forecastTextCell.innerHTML = this.forecast[i].conditions;

          windIconCell = document.createElement('td');
          windIconCell.className = 'detailIcon2';

          windIcon = document.createElement('img');
          windIcon.setAttribute('height', '15');
          windIcon.setAttribute('width', '15');
          windIcon.src =
            './modules/MMM-3Day-Forecast/images/dir/' +
            this.forecast[i].wdir +
            '.png';

          windCell = document.createElement('td');
          windCell.className = 'detailText2';

          if (this.units === 'M') {
            if (this.forecast[i].wspd_k !== '--') {
              windCell.innerHTML =
                Math.round(this.forecast[i].wspd_k / 3.6) +
                ' ' +
                this.translate('MPS');
            } else {
              windCell.innerHTML =
                this.forecast[i].wspd_k + ' ' + this.translate('MPS');
            }
          } else {
            if (this.forecast[i].wspd_m !== '--') {
              windCell.innerHTML =
                Math.round(this.forecast[i].wspd_m) +
                ' ' +
                this.translate('MPH');
            } else {
              windCell.innerHTML =
                this.forecast[i].wspd_m + ' ' + this.translate('MPH');
            }
          }

          forecastIconCell.appendChild(forecastIcon);

          tempIconCell.appendChild(tempIcon);
          rainIconCell.appendChild(rainIcon);
          windIconCell.appendChild(windIcon);

          row1.appendChild(forecastIconCell);
          row1.appendChild(forecastTitleCell);

          row2.appendChild(tempIconCell);
          row2.appendChild(tempCell);
          row2.appendChild(rainIconCell);
          row2.appendChild(rainCell);

          row3.appendChild(forecastTextCell);
          row3.appendChild(windIconCell);
          row3.appendChild(windCell);

          wrapper.appendChild(row1);
          wrapper.appendChild(row2);
          wrapper.appendChild(row3);
        }
      } else {
        wrapper = document.createElement('table');
        wrapper.className = 'forecast small';

        forecastRow = document.createElement('tr');

        // Set up the forecast for three three days
        for (var i = 0; i < 3; i++) {
          var forecastClass = '';
          var title = '';

          // Determine which day we are detailing
          switch (i) {
            case 0:
              forecastClass = 'today';
              title = moment().format('MMM Do, YYYY');
              break;
            case 1:
              forecastClass = 'tomorrow';
              title = moment().add(1, 'days').format('MMM Do, YYYY');
              break;
            case 2:
              forecastClass = 'dayAfter';
              title = moment().add(2, 'days').format('MMM Do, YYYY');
              break;
          }

          // Create the details for this day
          forcastDay = document.createElement('td');
          forcastDay.className = 'forecastday ' + forecastClass;

          forcastTitle = document.createElement('div');
          forcastTitle.className = 'forecastTitle';
          forcastTitle.innerHTML = title;

          forecastIcon = document.createElement('img');
          forecastIcon.className = 'forecastIcon';
          forecastIcon.setAttribute('height', '25');
          forecastIcon.setAttribute('width', '25');
          forecastIcon.src =
            './modules/MMM-3Day-Forecast/images/icon/' +
            this.forecast[i].icon +
            '.gif';

          forecastText = document.createElement('div');
          forecastText.className = 'forecastText horizontalView bright';
          forecastText.innerHTML = this.forecast[i].conditions;

          forecastBr = document.createElement('br');

          // Create div to hold all of the detail data
          forecastDetail = document.createElement('div');
          forecastDetail.className = 'forecastDetail';

          // Build up the details regarding temprature
          tempIcon = document.createElement('img');
          tempIcon.className = 'detailIcon';
          tempIcon.setAttribute('height', '15');
          tempIcon.setAttribute('width', '15');
          tempIcon.src = './modules/MMM-3Day-Forecast/images/high.png';

          tempText = document.createElement('span');
          tempText.className = 'normal';

          if (this.units === 'M') {
            if (this.forecast[i].high_c !== '--') {
              tempText.innerHTML =
                Math.round(this.forecast[i].high_c) + '&deg; C';
            } else {
              tempText.innerHTML = this.forecast[i].high_c + '&deg; C';
            }
          } else {
            if (this.forecast[i].high_f !== '--') {
              tempText.innerHTML =
                Math.round(this.forecast[i].high_f) + '&deg; F';
            } else {
              tempText.innerHTML = this.forecast[i].high_f + '&deg; F';
            }
          }

          tempBr = document.createElement('br');

          // Build up the details regarding precipitation %
          rainIcon = document.createElement('img');
          rainIcon.className = 'detailIcon';
          rainIcon.setAttribute('height', '15');
          rainIcon.setAttribute('width', '15');
          rainIcon.src = './modules/MMM-3Day-Forecast/images/wet.png';

          rainText = document.createElement('span');
          rainText.innerHTML = this.forecast[i].pop + '%';

          rainBr = document.createElement('br');

          // Build up the details regarding wind
          windIcon = document.createElement('img');
          windIcon.className = 'detailIcon';
          windIcon.setAttribute('height', '15');
          windIcon.setAttribute('width', '15');
          windIcon.src = './modules/MMM-3Day-Forecast/images/wind.png';

          windText = document.createElement('span');

          if (this.units === 'M') {
            if (this.forecast[i].wspd_k !== '--') {
              windText.innerHTML =
                Math.round(this.forecast[i].wspd_k / 3.6) +
                ' ' +
                this.translate('MPS');
            } else {
              windText.innerHTML =
                this.forecast[i].wspd_k + ' ' + this.translate('MPS');
            }
          } else {
            if (this.forecast[i].wspd_m !== '--') {
              windText.innerHTML =
                Math.round(this.forecast[i].wspd_m) +
                ' ' +
                this.translate('MPH');
            } else {
              windText.innerHTML =
                this.forecast[i].wspd_m + ' ' + this.translate('MPH');
            }
          }
          //windBr = document.createElement('br');

          // Now assemble the details
          forecastDetail.appendChild(tempIcon);
          forecastDetail.appendChild(tempText);
          forecastDetail.appendChild(tempBr);
          forecastDetail.appendChild(rainIcon);
          forecastDetail.appendChild(rainText);
          forecastDetail.appendChild(rainBr);
          forecastDetail.appendChild(windIcon);
          forecastDetail.appendChild(windText);
          //forecastDetail.appendChild(windBr);

          forcastDay.appendChild(forcastTitle);
          forcastDay.appendChild(forecastIcon);
          forcastDay.appendChild(forecastText);
          forcastDay.appendChild(forecastBr);
          forcastDay.appendChild(forecastDetail);

          // Now assemble the final output
          forecastRow.appendChild(forcastDay);
        }

        wrapper.appendChild(forecastRow);
      }
    } else {
      // Otherwise lets just use a simple div
      wrapper = document.createElement('div');
      wrapper.innerHTML = this.translate('LOADING');
    }

    return wrapper;
  },

  socketNotificationReceived: function (notification, payload) {
    // check to see if the response was for us and used the same url
    if (notification === 'GOT-3DAY-FORECAST' && payload.url === this.url) {
      // we got some data so set the flag, stash the data to display then request the dom update
      this.loaded = true;
      this.forecast = payload.forecast;
      this.updateDom(1000);
    }
  },
});
