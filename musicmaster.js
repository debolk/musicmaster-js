function BrowseCapability(plugin)
{
    this.uri = plugin.url + "/browse/";
    this.name = plugin.name;
}

BrowseCapability.prototype.open = function(success, failure) { return Directory.fromUri(this.uri, success, failure); };
function Directory(data, previous)
{
    this.type = "directory";

    this.name = data.name;
    this.entries = data.entries;

    this.previous = previous;
}

Directory.fromUri = function(uri, success, failure)
{
    MusicMaster.get(uri, function(request)
            {
                success(new Directory(request.responseJson));
            }, failure);
}

Directory.prototype.open = function(filename, success, failure)
{
    MusicMaster.get(filename, function(request)
            {
                var result = request.responseJson;
                if(result.type == "song")
                    success(new Song(filename, result));
                if(result.type == "directory")
                    success(new Directory(result, this));
            }, failure);
}
function Files(master)
{
    this.master = master;
}

Files.prototype.get = function(success, failure)
{
    this.master.get('plugin/',
            function(request) { success(request.responseJson.plugins); },
            failure);
}

Files.prototype.listCapability = function(name, success, failure)
{
    this.get(function(plugins){
        var result = [];
        for(var id in plugins)
        {
            var plugin = plugins[id];
            var matches = false;
            for(var capability_id in plugin.capabilities)
            {
                var capability = plugin.capabilities[capability_id];
                if(capability.name == name)
                    matches = true;
            }
            
            if(matches)
                result.push(plugin);
        }

        success(result);

    }, failure);
}

Files.prototype.listBrowse = function(success, failure)
{
    this.listCapability("browse", function(plugins)
            {
                var results = [];
                for(id in plugins)
                {
                    var plugin = plugins[id];
                    results.push(new BrowseCapability(plugin));
                }
                success(results);
            }, failure);
}

Files.prototype.listSearch = function(success, failure)
{
    this.listCapability("search", success, failure);
}
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
function MusicMaster(uri)
{
    this.uri = uri;
    this.get = function(path, success, failure) { MusicMaster.get(uri + path, success, failure); };

    this.players = new Players(this);
    this.files = new Files(this);
}

MusicMaster.accessToken = "";

//Utility functions

MusicMaster._onload = function(request, success, failure)
    {
        try
        {
            request.responseJson = JSON.parse(request.responseText);
        } catch (e) {
            console.log("Invalid json received: " + e.message);
            request.responseJson = {};
        }
        if(request.status >= 200 && request.status < 400)
        {
            success(request);
        }
        else
        {
            failure(request);
        }
    }

MusicMaster.get = function(uri, success, failure)
{
    var request = new XMLHttpRequest();
    request.open('GET', uri, true);
    request.onload = function() { MusicMaster._onload(request, success, failure); };
    request.onerror = failure;

    request.send();
}

MusicMaster.post = function(uri, data, success, failure)
{
    if(MusicMaster.accessToken != "")
    {
        if(uri.indexOf("?") == -1)
            uri = uri + "?access_token=" + MusicMaster.accessToken;
        else
            uri = uri + "&access_token=" + MusicMaster.accessToken;
    }

    var request = new XMLHttpRequest();
    request.open('POST', uri, true);
    request.onload = function() { MusicMaster._onload(request, success, failure); };
    request.onerror = failure;

    var encoding = JSON.stringify(data);

    request.send(encoding);
}

MusicMaster.delete = function(uri, success, failure)
{
    if(MusicMaster.accessToken != "")
    {
        if(uri.indexOf("?") == -1)
            uri = uri + "?access_token=" + MusicMaster.accessToken;
        else
            uri = uri + "&access_token=" + MusicMaster.accessToken;
    }

        
    var request = new XMLHttpRequest();
    request.open('DELETE', uri, true);
    request.onload = function() { MusicMaster._onload(request, success, failure); };
    request.onerror = failure;

    request.send();
}

MusicMaster.put = function(uri, success, failure)
{
    if(MusicMaster.accessToken != "")
    {
        if(uri.indexOf("?") == -1)
            uri = uri + "?access_token=" + MusicMaster.accessToken;
        else
            uri = uri + "&access_token=" + MusicMaster.accessToken;
    }

    var request = new XMLHttpRequest();
    request.open('PUT', uri, true);
    request.onload = function() { MusicMaster._onload(request, success, failure); };
    request.onerror = failure;

    request.send();
}
function Players(master)
{
    this.master = master;
}

Players.prototype.get = function(success, failure)
{
    this.master.get('player',
            function(request) { success(request.responseJson.players); },
            failure);
}

Players.prototype.listCapability = function(name, success, failure)
{
    this.get(function(plugins){
        var result = [];
        for(var id in plugins)
        {
            var plugin = plugins[id];
            var matches = false;
            for(var capability_id in plugin.capabilities)
            {
                var capability = plugin.capabilities[capability_id];
                if(capability.name == name)
                    matches = true;
            }
            
            if(matches)
                result.push(plugin);
        }

        success(result);

    }, failure);
}

Players.prototype.listMjs = function(success, failure)
{
    this.listCapability("mjs", function(plugins)
            {
                var result = [];
                for(id in plugins)
                {
                    plugin = plugins[id];
                    result.push(new MjsPlayer(plugin));
                }
                success(result);
            }, failure);
}
function Playlist(uri, data)
{
    this.uri = uri;
    this.items = [];
    this.uids = [];
    this.prefetch = false;

    for(var itemid in data.items)
    {
        var itemdata = data.items[itemid];
        var item = new PlaylistItem(itemdata);
        this.items.push(item);
        this.uids.push(item.uri);
    }

    this.onAdd = function(playlistItem, index){};
}

Playlist.fromUri = function(uri, success, failure, prefetch)
{
    if(prefetch == undefined)
        prefetch = false;

    MusicMaster.get(uri, function(request) {
        var playlist = new Playlist(uri, request.responseJson);

        if(!prefetch)
        {
            success(playlist);
            return;
        }

        playlist.prefetch = true;

        var left = 0;
        var errorResponse = undefined;

        var done = function()
        {
            left--;
            if(left > 0)
                return;
            
            if(errorResponse != undefined)
                failure(errorResponse);
            else
                success(playlist);
        }

        left = playlist.items.length;
        for(var i = 0; i < left; i++)
            playlist.items[i].getSong(done, function(e) { errorResponse = e; done(); });

    }, failure);
}

Playlist.prototype.push = function(song, success, failure)
{
    MusicMaster.post(this.uri, song, success, failure);
}

Playlist.prototype.insert = function(song, before, success, failure)
{
    MusicMaster.post(before.uri, song, success, failure);
}

Playlist.prototype.update = function(success, failure)
{
    var orig = this;
    Playlist.fromUri(this.uri, function(newplaylist)
            {
                var removelist = [];
                var addlist = [];
                
                for(var i = 0; i < orig.uids.length; i++)
                    if(newplaylist.uids.indexOf(orig.uids[i]) == -1)
                        removelist.push(orig.uids[i]);

                for(var i = 0; i < newplaylist.uids.length; i++)
                    if(orig.uids.indexOf(newplaylist.uids[i]) == -1)
                        addlist.push(newplaylist.uids[i]);

                for(var i = 0; i < removelist.length; i++)
                {
                    var uri = removelist[i];
                    orig.uids.splice(orig.uids.indexOf(uri), 1);
                    for(var j = 0; j < orig.items.length; j++)
                        if(orig.items[j].uri == uri)
                        {
                            var item = orig.items[j];
                            orig.items.splice(j, 1);
                            item.onRemove(item, j);
                            break;
                        }
                }

                for(var i = 0; i < addlist.length; i++)
                {
                    var uri = addlist[i];
                    orig.uids.push(uri);
                    for(var j = 0; j < newplaylist.items.length; j++)
                        if(newplaylist.items[j].uri == uri)
                        {
                            var item = newplaylist.items[j];
                            orig.items.splice(j, 0, item);
                            orig.onAdd(item, j);
                        }
                }

                for(var i = 0; i < orig.items.length; i++)
                {
                    if(orig.items[i].uri == newplaylist.items[i].uri)
                        break;

                    var item = orig.items[i];
                    for(var j = 0; j < newplaylist.items.length; j++)
                    {
                        if(item.uri != newplaylist.items[j].uri)
                            continue;

                        orig.items.splice(i, 1);
                        orig.items.splice(j, 0, item);
                        item.onMove(item, i, j);
                        i--;
                        break;
                    }
                }

                success(orig);

            }, failure, prefetch);
}
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
