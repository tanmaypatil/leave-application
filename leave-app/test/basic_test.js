var assert = require('assert');
let moment = require("moment");
let utils = require("./test_utils");
describe('Array', function () {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});

describe('Datediff', function () {
    describe('#noofdays', function () {
      it('date difference should be number of days between 2 dates', function () {
        //assert.equal([1, 2, 3].indexOf(4), -1);
        let date1 = moment("2020-06-19");
        let date2 = moment("2020-06-20");
        let totDays = date2.diff(date1,'days');
        assert.equal(1,totDays);
      });
      it('date difference should be number of days between 2 dates of diff months', function () {
        //assert.equal([1, 2, 3].indexOf(4), -1);
        let date1 = moment("2020-06-19");
        let date2 = moment("2020-07-01");
        let totDays = date2.diff(date1,'days');
        assert.equal(12,totDays);

      });

    });
  });

  describe('Work-days', function () {
    describe('#work-day', function () {
      it('should return work days as days between from date ,to date if are no weekend in between ', function () {
        let days = utils.work_days("2020-06-15","2020-06-19");
        assert.equal(5,days);   
      });
      it('from date - friday , to-date - upcoming monday should consider weekend included in them for work day calculation ', function () {
        let days = utils.work_days("2020-06-12","2020-06-15");
        assert.equal(2,days);   
      });
    });

  });

