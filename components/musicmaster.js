/**
 * The root object of this library.
 * Create a MusicMaster object that points to your musicmaster server:
 *  var master = new MusicMaster("http://www.example.com/musicmaster/");
 * @constructor
 */
function MusicMaster(uri)
{
    this.uri = uri;
    this.get = function(path, success, failure) { MusicMaster.get(uri + path, success, failure); };

    this.players = new Players(this);
    this.files = new Files(this);
}

/**
 * Certain operations require authorization. For these operations a valid access token is required. This token can be obtained through oauth and set here.
 * The access token is global for all musicmasters.
 */
MusicMaster.accessToken = "";

//Utility functions

MusicMaster._onload = function(request, success, failure)
    {
        try
        {
            request.responseJson = JSON.parse(request.responseText);
        } catch (e) {
            console.log("Invalid json received: " + e.message);
            request.responseJson = {};
        }
        if(request.status >= 200 && request.status < 400)
        {
            success(request);
        }
        else
        {
            failure(request);
        }
    }

/**
 * Does an ajax GET request and aprses the results as JSON
 */
MusicMaster.get = function(uri, success, failure)
{
    var request = new XMLHttpRequest();
    request.open('GET', uri, true);
    request.onload = function() { MusicMaster._onload(request, success, failure); };
    request.onerror = failure;

    request.send();
}

/**
 * Does an ajax POST request with the given data and aprses the results as JSON
 */
MusicMaster.post = function(uri, data, success, failure)
{
    if(MusicMaster.accessToken != "")
    {
        if(uri.indexOf("?") == -1)
            uri = uri + "?access_token=" + MusicMaster.accessToken;
        else
            uri = uri + "&access_token=" + MusicMaster.accessToken;
    }

    var request = new XMLHttpRequest();
    request.open('POST', uri, true);
    request.onload = function() { MusicMaster._onload(request, success, failure); };
    request.onerror = failure;

    var encoding = JSON.stringify(data);

    request.send(encoding);
}

/**
 * Does an ajax DELETE request and aprses the results as JSON
 */
MusicMaster.delete = function(uri, success, failure)
{
    if(MusicMaster.accessToken != "")
    {
        if(uri.indexOf("?") == -1)
            uri = uri + "?access_token=" + MusicMaster.accessToken;
        else
            uri = uri + "&access_token=" + MusicMaster.accessToken;
    }

        
    var request = new XMLHttpRequest();
    request.open('DELETE', uri, true);
    request.onload = function() { MusicMaster._onload(request, success, failure); };
    request.onerror = failure;

    request.send();
}

/**
 * Does an ajax PUT request with the given data and aprses the results as JSON
 */
MusicMaster.put = function(uri, success, failure)
{
    if(MusicMaster.accessToken != "")
    {
        if(uri.indexOf("?") == -1)
            uri = uri + "?access_token=" + MusicMaster.accessToken;
        else
            uri = uri + "&access_token=" + MusicMaster.accessToken;
    }

    var request = new XMLHttpRequest();
    request.open('PUT', uri, true);
    request.onload = function() { MusicMaster._onload(request, success, failure); };
    request.onerror = failure;

    request.send();
}
