/**
 * A class for interacting with an MJS client
 * @constructor
 */
function MjsPlayer(plugin)
{
    this.name = plugin.name;
    this.uri = plugin.url;
    this.playlist = new Playlist(this.uri + "/playlist", Array());
}

/**
 * Initializes this object with information on the remote player
 * @deprecated No longer neccecary, set player.playlist.prefetch = true;
 */
MjsPlayer.prototype.initialize = function(success, failure, prefetch)
{
    var orig = this;
    this.getPlaylist(function(playlist){
        orig.playlist = playlist;
        orig.update(success, failure);
    }, failure, prefetch);
}

/**
 * Updates the information with information on the remote player
 */
MjsPlayer.prototype.update = function(success, failure)
{
    var orig = this;
    if(this.playlist == undefined)
    {
        failure({"error": "Player not initialized"});
        return;
    }

    var count = 0;
    var errorRequest = undefined;

    var close = function()
    {
        count++;
        if(count < 3)
            return;

        if(errorRequest != undefined)
            failure(errorRequest);
        else
            success();
    }

    var error = function(request)
    {
        errorRequest = request;
        close();
    }

    this.playlist.update(close, error);
    this.getCurrent(function(state)
            {
                orig.currentState = state;
                orig.currentSong = state.song;
                orig.currentItem = state.url;
                orig.duration = state.duration;
                orig.position = state.position;
                
                if(orig.position == undefined)
                    orig.estimatedStart = undefined;
                else
                    orig.estimatedStart = Date.now() - Date(orig.position * 1000);

                close();
            }, error);
    this.getStatus(function(state)
            {
                orig.status = state;
                close();
            }, error);
}

/**
 * Returns a Playlist object
 */
MjsPlayer.prototype.getPlaylist = function(success, failure, prefetch)
{
    Playlist.fromUri(this.uri + "/playlist", success, failure, prefetch);
}

/**
 * Returns the current status of the player (playing, paused, stopped)
 */
MjsPlayer.prototype.getStatus = function(success, failure)
{
    MusicMaster.get(this.uri + "/status", function(request) {
        success(request.responseJson.status);
    }, failure);
}

/**
 * Sets the player status to a specific value (playing, paused, stopped)
 */
MjsPlayer.prototype.setStatus = function(status, success, failure)
{
    var data = {"status": status};
    MusicMaster.put(this.uri + "/status", data, success, failure);
}

/**
 * Returns the current playback status
 */
MjsPlayer.prototype.getCurrent = function(success, failure)
{
    MusicMaster.get(this.uri + "/current", function(request){
        success(request.responseJson);
    }, failure);
}

/**
 * Sets a specific PlaylistItem as current
 */
MjsPlayer.prototype.setCurrent = function(playlistItem, success, failure)
{
    MusicMaster.put(this.uri + "/current", {"uid": playlistItem.uri}, success, failure);
}

/**
 * Resume playback
 */
MjsPlayer.prototype.play = function(success, failure)
{
    this.setStatus("playing", success, failure);
}

/**
 * Pause playback
 */
MjsPlayer.prototype.pause = function(success, failure)
{
    this.setStatus("paused", success, failure);
}

/**
 * Stops playback
 */
MjsPlayer.prototype.stop = function(success, failure)
{
    this.setStatus("stopped", success, failure);
}

/**
 * Skips a number
 */
MjsPlayer.prototype.next = function(success, failure)
{
    MusicMaster.post(this.uri + "/current", {"action": "next"}, success, failure);
}

/**
 * Got o previous number
 */
MjsPlayer.prototype.previous = function(success, failure)
{
    MusicMaster.post(this.uri + "/current", {"action": "previous"}, success, failure);
}
