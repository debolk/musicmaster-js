/**
 * Represents a song in a playlist
 * @constructor
 */
function PlaylistItem(data)
{
    /** The uri of this object (also uid) */
    this.uri = data.url;
    /** The physical location of the song (may or may not be accessible from the web) */
    this.location = data.location;
    /** The uri of the song data */
    this.songUri = data.song;

    /** This overridable function gets called when this PlaylistItem is removed from a playlist */
    this.onRemove = function(playlistItem, index){};
    /** This overridable function gets called when this PlaylistItem moves within the playlist */
    this.onMove = function(playlistItem, oldindex, newindex){};
}

/**
 * Fetches the song corresponding to this PlaylistItem
 */
PlaylistItem.prototype.getSong = function(success, failure)
{
    if(this.song != undefined)
    {
        success(this.song);
        return;
    }

    var context = this;

    Song.fromUri(this.songUri, function(song)
            {
                context.song = song;
                success(song);
            }, failure);
}

PlaylistItem.prototype.remove = function(success, failure)
{
    MusicMaster.delete(this.uri, success, failure);
}
