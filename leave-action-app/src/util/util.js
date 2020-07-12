let fs = require('fs');
let fetch = require('node-fetch');

function getGraphQLQueryStr(qryPath) {
    let query = fs.readFileSync(qryPath, { encoding: 'utf8' });
    console.log(query);
    return query;
}

function executeGraphQLQuery(query , variables) {
    return new Promise (async function( resolve , reject ) {
    const url = process.env.GRAPHQL_HOST || "http://localhost:8080/v1/graphql";
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
    catch(error) {
        console.log("Error in graphql query execution "+error);
        reject(error);
    }
});

}

module.exports = {
    getGraphQLQueryStr : getGraphQLQueryStr,
    executeGraphQLQuery : executeGraphQLQuery
}