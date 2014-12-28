function MjsPlayer(plugin)
{
    this.name = plugin.name;
    this.uri = plugin.url;
}

MjsPlayer.prototype.getPlaylist = function(success, failure)
{
    Playlist.fromUri(this.uri + "/playlist", success, failure);
}

MjsPlayer.prototype.getStatus = function(success, failure)
{
    MusicMaster.get(uri + "/status", function(request) {
        success(request.responseJson.status);
    }, failure);
}

MjsPlayer.prototype.setStatus = function(status, success, failure)
{
    var data = {"status": status};
    MusicMaster.post(uri + "/status", data, success, failure);
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
