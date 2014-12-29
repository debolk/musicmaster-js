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
