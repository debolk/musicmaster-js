function MusicMaster(uri)
{
    this.uri = uri;
    this.get = function(path, success, failure) { MusicMaster.get(uri + path, success, failure); };

    this.players = new Players(this);
    this.files = new Files(this);
}

MusicMaster.accessToken = "";

//Utility functions

MusicMaster._onload = function(success, failure)
    {
        try
        {
            request.responseJson = JSON.parse(request.responseText);
        } catch (e) {
            console.log("Invalid json received: " + e.message);
            request.responseJson = {};
        }
        if(request.status >= 200 && request.status < 400)
            success(request);
        else
            failure(request);
    }

MusicMaster.get = function(uri, success, failure)
{
    request = new XMLHttpRequest();
    request.open('GET', uri, true);
    request.onload = function() { MusicMaster._onload(success, failure); };
    request.onerror = failure;

    request.send();
}

MusicMaster.post = function(uri, data, success, failure)
{
    if(MusicMaster.accessToken != "")
    {
        if(uri.indexOf("?") == -1)
            uri = uri + "?access_token=" + MusicMaster.accessToken;
        else
            uri = uri + "&access_token=" + MusicMaster.accessToken;
    }

    request = new XMLHttpRequest();
    request.open('POST', uri, true);
    request.onload = function() { MusicMaster._onload(success, failure); };
    request.onerror = failure;

    var encoding = JSON.stringify(data);

    request.send(encoding);
}

MusicMaster.delete = function(uri, success, failure)
{    
    request = new XMLHttpRequest();
    request.open('DELETE', uri, true);
    request.onload = function() { MusicMaster._onload(success, failure); };
    request.onerror = failure;

    request.send();
}
