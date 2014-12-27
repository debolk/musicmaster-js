function Song(data)
{
    this.type = "song";
    this.title = data.title;
    this.artist = data.artist;
    this.location = data.location;
    this.uri = data.url;
}

Song.fromUri = function(uri, success, failure)
{
    MusicMaster.get(uri, function(request)
            {
                success(new Song(request.responseJson));
            }, failure);
}
