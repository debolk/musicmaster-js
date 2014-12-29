function Song(uri, data)
{
    this.uri = uri;

    this.type = "song";
    this.title = data.title;
    this.artist = data.artist;
    this.location = data.location;
    if(data.url != undefined)
        this.uri = data.url;
}

Song.fromUri = function(uri, success, failure)
{
    MusicMaster.get(uri, function(request)
            {
                success(new Song(uri, request.responseJson));
            }, failure);
}
