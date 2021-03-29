let fs = require('fs');
let fetch = require('node-fetch');

/* Function to get the graphql query text. All queries are stored in graphql folder.
 * input - query path 
 * output - query text
*/
function getGraphQLQueryStr(qryPath) {
    let query = fs.readFileSync('test/request/' + qryPath, { encoding: 'utf8' });
    console.log(query);
    return query;
}
/* Function to execute a graphql query
 * input - query 
 * input - variables
 * output - query text
*/
function executeGraphQLQuery(query, variables) {
    return new Promise(async function (resolve, reject) {
        let url = ''
        if (process.env.GRAPHQL_HOST ){
            url = 'http://' + process.env.GRAPHQL_HOST + ':8080/v1/graphql'
        }
        else {
           url  = 'http://localhost:8080/v1/graphql';
        }
        console.log('graphql server url '+ url)
        const opts = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: query, variables: variables })
        };
        try {
            let response = await fetch(url, opts);
            let jsonResponse = await response.json();
            resolve(jsonResponse);
        }
        catch (error) {
            console.log("Error in graphql query execution " + error);
            reject(error);
        }
    });

}

module.exports = {
    getGraphQLQueryStr: getGraphQLQueryStr,
    executeGraphQLQuery: executeGraphQLQuery
}