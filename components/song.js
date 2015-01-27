/**
 * Represents a song that can be played
 * @constructor
 */
function Song(uri, data)
{
    /** The uri of this song */
    this.uri = uri;

    /** Constant "song" */
    this.type = "song";

    /** The title of the song (can be unknown) */
    this.title = data.title;
    /** The artist of the song (can be unknown) */
    this.artist = data.artist;
    /** The physical location of the song */
    this.location = data.location;
    if(data.url != undefined)
        this.uri = data.url;
    if(data.length != undefined)
        this.length = data.length;
}

Song.cache = Array();

/** 
 * Parses a song from a given uri
 */
Song.fromUri = function(uri, success, failure)
{
    if(Song.cache[uri] !== undefined)
    {
        success(Song.cache[uri]);
        return;
    }

    MusicMaster.get(uri, function(request)
            {
                var song = new Song(uri, request.responseJson);
                Song.cache[uri] = song;
                success(song);
            }, failure);
}
