var assert = require('assert');
describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});

let test_cases = require('./test_cases.json')
let util = require('./util.js')
describe('graphql sanity', function() {
    describe('#emp_master()', function() {
      it('should return emp master when queried against it', async function() {
        let query_name = test_cases[0].request
        let query_str = util.getGraphQLQueryStr(query_name)
        let response = await util.executeGraphQLQuery(query_str,null)
        console.log('inside graphql sanity ' + JSON.stringify(response))

      });
    });
  });