function Playlist(data)
{
    this.items = [];

    for(var item in data.items)
        this.items.append(new PlaylistItem(data));
}

Playlist.fromUri(uri, success, failure)
{
    MusicMaster.get(uri, function(request) {
        success(new Playlist(request.responseJson));
    }, failure);
}
