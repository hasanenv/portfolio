// CloudFront Function (viewer-request).
//
// Two jobs:
//   1. Redirect www -> apex, so there is one canonical address.
//   2. Rewrite directory-style routes to their index.html, because S3 behind
//      OAC has no directory index. /projects/foo/ -> /projects/foo/index.html
//
// Runs at the edge on every request, so it stays deliberately small.

function handler(event) {
  var request = event.request;
  var headers = request.headers;
  var uri = request.uri;

  var host = headers.host ? headers.host.value : '';

  if (host === 'www.${apex_domain}') {
    var query = '';
    var keys = Object.keys(request.querystring || {});
    if (keys.length > 0) {
      var parts = [];
      for (var i = 0; i < keys.length; i++) {
        parts.push(keys[i] + '=' + request.querystring[keys[i]].value);
      }
      query = '?' + parts.join('&');
    }

    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: { value: 'https://${apex_domain}' + uri + query },
      },
    };
  }

  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
  } else if (uri.lastIndexOf('.') < uri.lastIndexOf('/')) {
    // No file extension in the last path segment: treat it as a directory.
    request.uri = uri + '/index.html';
  }

  return request;
}
