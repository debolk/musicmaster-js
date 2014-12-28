function PlaylistItem(data)
{
    this.uri = data.url;
    this.location = data.url;
    this.songUri = data.song;

    this.onRemove = function(playlistItem, index){};
    this.onMove = function(playlistItem, oldindex, newindex){};
}

PlaylistItem.prototype.getSong = function(success, failure)
{
    return Song.fromUri(this.songUri, success, failure);
}

