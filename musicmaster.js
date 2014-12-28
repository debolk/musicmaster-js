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
                    success(new Song(result));
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
    MusicMaster.put(uri + "/status", data, success, failure);
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

    for(var itemid in data.items)
    {
        var itemdata = data.items[itemid];
        var item = new PlaylistItem(itemdata);
        this.items.push(item);
        this.uids.push(item.uri);
    }

    this.onAdd = function(playlistItem, index){};
}

Playlist.fromUri = function(uri, success, failure)
{
    MusicMaster.get(uri, function(request) {
        success(new Playlist(uri, request.responseJson));
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

            }, failure);
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
    return Song.fromUri(this.songUri, success, failure);
}

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
