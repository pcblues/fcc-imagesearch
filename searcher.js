'use strict';

let https=require('https')

// Replace the subscriptionKey string value with your valid subscription key.
let subscriptionKey = process.env.IMAGEKEY


exports.doSearch= function(term,offset,callback) {
   var results=[]
    // Verify the endpoint URI.  At this writing, only one endpoint is used for Bing
    // search APIs.  In the future, regional endpoints may be available.  If you
    // encounter unexpected authorization errors, double-check this host against
    // the endpoint for your Bing Search instance in your Azure dashboard.
    let host = 'api.cognitive.microsoft.com';
    let path = '/bing/v7.0/images/search';
    
    let response_handler = function (response) {
        let body = '';
        response.on('data', function (d) {
            body += d;
        });
        response.on('end', function () {
            console.log('\nRelevant Headers:\n');
            for (var header in response.headers)
                // header keys are lower-cased by Node.js
                if (header.startsWith("bingapis-") || header.startsWith("x-msedge-"))
                     console.log(header + ": " + response.headers[header]);
            var rawResults = JSON.parse(body).value
            
            for (var c=0;c<rawResults.length;c++) {
              var newResult={url:rawResults[c].contentUrl,
                            snippet:rawResults[c].name,
                            thumbnail:rawResults[c].thumbnailUrl,
                            context:rawResults[c].hostPageUrl}
              
              results.push(newResult)
              
            }
          callback(results)
        
        });
        response.on('error', function (e) {
            console.log('Error: ' + e.message);
        });
    };

    let bing_image_search = function (term,offset) {
      console.log('Searching images for: ' + term);
      var offsetStr=""
      if (offset!==undefined) {
        offsetStr = '&offset='+offset
      }
        
      let request_params = {
            method : 'GET',
            hostname : host,
            path : path + '?q=' + encodeURIComponent(term)+
            offsetStr,
            headers : {
                'Ocp-Apim-Subscription-Key' : subscriptionKey,
            }
        };

        let req = https.request(request_params, response_handler);
        req.end();
      
    }

    if (subscriptionKey.length === 32) {
        bing_image_search(term,offset);
        
      
    } else {
        console.log('Invalid Bing Search API subscription key!');
        console.log('Please paste yours into the source code.');
    }   
}


