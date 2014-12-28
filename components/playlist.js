function Playlist(uri, data)
{
    this.uri = uri;
    this.items = [];
    this.uids = [];

    for(var item in data.items)
    {
        var item = new PlaylistItem(data);
        this.items.push(item);
        this.uids.push(item.uri);
    }

    this.onAdd = function(playlistItem, index){};
}

Playlist.fromUri(uri, success, failure)
{
    MusicMaster.get(uri, function(request) {
        success(new Playlist(uri, request.responseJson));
    }, failure);
}

Playlist.prototype.push(song, success, failure)
{
    MusicMaster.post(this.uri, song, success, failure);
}

Playlist.prototype.insert(song, before, success, failure)
{
    MusicMaster.post(before.uri, song, success, failure);
}

Playlist.prototype.update(success, failure)
{
    var orig = this;
    Playlist.fromUri(this.uri, function(newplaylist)
            {
                var removelist = [];
                var addlist = [];
                
                for(var i = 0; i < orig.uids.length; i++)
                    if(newplaylist.uids.indexOf(orig.uids[i].uri) == -1)
                        removelist.push(orig.uids[i].uri);

                for(var i = 0; i < newplaylist.uids.lenght; i++)
                    if(orig.uids.indexOf(newplaylist.uids[i].uri) == -1)
                        addlist.push(newplaylist.uids[i].uri);

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
