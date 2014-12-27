function BrowseCapability(plugin)
{
    this.uri = plugin.url + "/browse/";
    this.name = plugin.name;
}

BrowserCapability.prototype.open = function(success, failure) { return Directory.fromUri(this.uri, success, failure); };
function Directory(data, previous)
{
    this.type = "directory";

    this.name = data.name;
    this.entries = data.entries;

    this.previous = previous;
}

Directory.fromUri(uri, success, failure)
{
    MusicMaster.get(uri, function(request)
            {
                success(new Directory(success.responseJson));
            }, failure);
}

Directory.prototype.open(subdirectory)
{
    MusicMaster.get(subdirectory, function(request)
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

Files.prototype.get(success, failure)
{
    master.get('files',
            function(request) { success(request.responseJson.plugins); },
            failure);
}

Files.prototype.listCapability(name, success, failure)
{
    this.get(function(plugins){
        var result = [];
        for(var plugin in plugins)
        {
            var matches = false;
            for(var capability in plugin.capabilities)
                if(capability.name == name)
                    matches = true;
            
            if(matches)
                result.push(plugin);
        }

        success(result);

    }, failure);
}

Files.prototype.listBrowse(success, failure)
{
    this.listCapability("browse", function(plugins)
            {
                for(plugin in plugins)
                {
                    plugin.open = function(BrowseCapability(plugin));
                }
            }, failure);
}

Files.prototype.listSearch(success, failure)
{
    this.listCapability("search", success, failure);
}
function MjsPlayer(plugin)
{
    this.name = plugin.name;
    this.uri = plugin.url;
}

MjsPlayer.prototype.getPlaylist(success, failure)
{

}
function MusicMaster(uri)
{
    this.uri = uri;
    this.get = function(path, success, failure) { MusicMaster.get(uri + path, success, failure); };

    this.players = new Players(this);
    this.files = new Files(this);
}

//Utility functions

MusicMaster._onload = function(success, failure)
    {
        try
        {
            request.responseJson = JSON.parse(request.reponseText);
        } catch (e) {
            console.log("Invalid json received: " + e.message);
            request.responseJson = {};
        }
        if(request.status > 200 && request.status < 400)
            success(request);
        else
            failure(request);
    }

MusicMaster.get(uri, success, failure)
{
    request = new XMLHttpRequest();
    request.open('GET', uri, true);
    request.onload = function() { MusicMaster._onload(success, failure); };
    request.onerror = failure;

    request.send();
}

MusicMaster.post(uri, data, success, failure)
{
    request = new XMLHttpRequest();
    request.open('POST', uri, true);
    request.onload = function() { MusicMaster._onload(success, failure); };
    request.onerror = failure;

    var encoding = JSON.stringify(data);

    request.send(encoding);
}

MusicMaster.delete(uri, success, failure)
{    
    request = new XMLHttpRequest();
    request.open('DELETE', uri, true);
    request.onload = function() { MusicMaster._onload(success, failure); };
    request.onerror = failure;

    request.send();
}
function Players(master)
{
    this.master = master;
}

Players.prototype.get(success, failure)
{
    master.get('player',
            function(request) { success(request.responseJson.plugins); },
            failure);
}

Players.prototype.listCapability(name, success, failure)
{
    this.get(function(plugins){
        var result = [];
        for(var plugin in plugins)
        {
            var matches = false;
            for(var capability in plugin.capabilities)
                if(capability.name == name)
                    matches = true;
            
            if(matches)
                result.push(plugin);
        }

        success(result);

    }, failure);
}

Players.prototype.listMjs(success, failure)
{
    this.listCapability("mjs", function(plugins)
            {
                for(plugin in plugins)
                {
                    plugin.open = function(MjsPlayer(plugin));
                }
            }, failure);
}
function Playlist(data)
{
    this.items = [];

    for(var item in data.items)
        this.items.append(new PlaylistItem(data));
}
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

function Song(data)
{
    this.type = "song";
    this.title = data.title;
    this.artist = data.artist;
    this.location = data.location;
    this.uri = data.url;
}

Song.fromUri(uri, success, failure)
{
    MusicMaster.get(uri, function(request)
            {
                success(new Song(request.responseJson));
            }, failure);
}
