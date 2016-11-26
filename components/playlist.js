/**
 * Represents a playlist
 * @constructor
 */
function Playlist(uri, data)
{
    /** The uri of the playlist */
    this.uri = uri;
    /** A list of PlaylistItem objects */
    this.items = [];
    /** The list of uids in this playlist */
    this.uids = [];
    /** Wether PlaylistItems should automatically fetch songdata */
    this.prefetch = false;

    for(var itemid in data.items)
    {
        var itemdata = data.items[itemid];
        var item = new PlaylistItem(itemdata);
        this.items.push(item);
        this.uids.push(item.uri);
    }

    /** An overridable function that gets called when a new PlaylistItem is added during an update */
    this.onAdd = function(playlistItem, index){};
}

/**
 * Parses a playlist from a given uri
 */
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
        for(var i = 0; i < playlist.items.length; i++)
        {
            if(playlist.items[i].songUri !== undefined)
            {
                playlist.items[i].getSong(done, function(e) { errorResponse = e; done(); });
            }
            else
            {
                playlist.items[i].song = undefined;
                left--;
            }
        }

    }, failure);
}

/**
 * Appends a song to the playlist
 */
Playlist.prototype.append = function(song, success, failure)
{
    MusicMaster.post(this.uri, song, success, failure);
}

/** 
 * Inserts a song before a specific PlaylistItem 
 */
Playlist.prototype.insert = function(song, before, success, failure)
{
    MusicMaster.post(before.uri, song, success, failure);
}

/**
 * Clear playlist
 */
Playlist.prototype.clear = function(success, failure)
{
    MusicMaster.delete(this.uri, success, failure);
}

/**
 * Automatically updates the current playlist with the version on the remote player
 */
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

            }, failure, this.prefetch);
}
