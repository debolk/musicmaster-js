function MjsPlayer(plugin)
{
    this.name = plugin.name;
    this.uri = plugin.url;
}

MjsPlayer.prototype.initialize = function(success, failure)
{
    var orig = this;
    this.getPlaylist(function(playlist){
        orig.playlist = playlist;
        success();
    }, failure);
}

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

MjsPlayer.prototype.getPlaylist = function(success, failure)
{
    Playlist.fromUri(this.uri + "/playlist", success, failure);
}

MjsPlayer.prototype.getStatus = function(success, failure)
{
    MusicMaster.get(this.uri + "/status", function(request) {
        success(request.responseJson.status);
    }, failure);
}

MjsPlayer.prototype.setStatus = function(status, success, failure)
{
    var data = {"status": status};
    MusicMaster.put(this.uri + "/status", data, success, failure);
}

MjsPlayer.prototype.getCurrent = function(success, failure)
{
    MusicMaster.get(this.uri + "/current", function(request){
        success(request.responseJson);
    }, failure);
}

MjsPlayer.prototype.setCurrent = function(playlistItem, success, failure)
{
    MusicMaster.put(this.uri + "/current", {"uid": playlistItem.uri}, success, failure);
}

MjsPlayer.prototype.play = function(success, failure)
{
    this.setStatus("playing", success, failure);
}

MjsPlayer.prototype.pause = function(success, failure)
{
    this.setStatus("paused", success, failure);
}

MjsPlayer.prototype.stop = function(success, failure)
{
    this.setStatus("stopped", success, failure);
}

MjsPlayer.prototype.next = function(success, failure)
{
    MusicMaster.post(this.uri + "/current", {"action": "next"}, success, failure);
}

MjsPlayer.prototype.previous = function(success, failure)
{
    MusicMaster.post(this.uri + "/current", {"action": "previous"}, success, failure);
}
