(function(w) {
  w.OOYALA = w.OOYALA || {};
  const OOYALA = w.OOYALA;

  /**
   * Represents data point collected in a given day
   * @param {string} type  "Running" or "Daily"
   * @param {string} date  Date in YYYY-MM-DD form
   * @param {number} value Data point value
   */
  OOYALA.DataPoint = function (type, date, value) {
      this.type = type; // "Running" or "Daily"
      this.date = date;
      this.value = value;
  };

  /**
   * Represents a campaign goal data set
   * @param {object} rawGoalData Raw goal data acquired from web service
   */
  OOYALA.CampaignGoal = function (rawGoalData) {
      this.name = rawGoalData["name"];

      let dailyData = {};

      for (let dateTime in rawGoalData["data"]) {
          let dateTimeComponents = dateTime.split('.');

          if (typeof dailyData[dateTimeComponents[0]] === "undefined") {
              dailyData[dateTimeComponents[0]] = rawGoalData["data"][dateTime];
          } else {
              dailyData[dateTimeComponents[0]] += rawGoalData["data"][dateTime];
          }
      }

      let dailyDataPoints = [];
      for (let day in dailyData) {
          dailyDataPoints.push(new OOYALA.DataPoint("Daily", day, dailyData[day]));
      }

      dailyDataPoints.sort(function (a, b) {
        return a.date > b.date;
      });

      let runningDataPoints = [];
      for (let i = 0, len = dailyDataPoints.length; i < len; i++) {
          let previousDataValue = i > 0 ? runningDataPoints[i - 1]["value"] : 0;

          runningDataPoints[i] = new OOYALA.DataPoint(
              "Running",
              dailyDataPoints[i]["date"],
              dailyDataPoints[i]["value"] + previousDataValue
          );
      }


      this.dailyDataPoints = dailyDataPoints;
      this.runningDataPoints = runningDataPoints;
  };


  /**
   * Represents OOYALA campaign data
   * @param {object} rawCampaignData Raw Campaign Data acquired
   */
  OOYALA.Campaign = function (rawCampaignData) {
      this.name = rawCampaignData["name"];
      this.goals = rawCampaignData["goals"].map(function (rawGoalData) {
          return new OOYALA.CampaignGoal(rawGoalData);
      });
  };

  /**
   * OOYALA Data Service, provides interface to the web services
   * @param {[type]} serviceUrl [description]
   */
  OOYALA.DataService = function (serviceUrl) {

      /**
       * Returns campaign data as an array of OOYALA.Campaign objects via a promise.
       * @return {object} Promise
       */
      this.getCampaigns = function () {
          return fetch(serviceUrl)
                  .then(function(response) {
                      return response.json();
                  })
                  .then(function(json) {
                      return json["campaigns"].map(function (rawCampaignData) {
                          return new OOYALA.Campaign(rawCampaignData);
                      });
                  });
      };
  };


})(window);
