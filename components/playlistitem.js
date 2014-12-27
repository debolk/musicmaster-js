function PlaylistItem(data)
{
    this.uri = data.url;
    this.location = data.url;
    this.songUri = data.song;
}

PlaylistItem.prototype.getSong(success, failure)
{
    return Song.fromUri(this.songUri, success, failure);
}

