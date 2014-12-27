function Playlist(data)
{
    this.items = [];

    for(var item in data.items)
        this.items.append(new PlaylistItem(data));
}
