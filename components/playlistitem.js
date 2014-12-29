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
    if(this.song != undefined)
    {
        success(this.song);
        return;
    }

    Song.fromUri(this.songUri, function(song)
            {
                this.song = song;
                success(song);
            }, failure);
}

