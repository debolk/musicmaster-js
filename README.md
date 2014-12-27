musicmaster-js
==============

Javascript interface for musicmaster


MusicMaster
-----------

The root object for this library. Create a MusicMaster object that points to your musicmaster server: `var master = new MusicMaster("http://example.com/musicmaster/");`

`MusicMaster.__constructor(uri)`: Create a new musicmaster object with a given uri

`MusicMaster.players`: A reference to an instance of the `Players` object

`MusicMaster.files`: A reference to an instance of the `Files` object

Players
-------

A class for finding players

`Players.get(success, failure)`: Returns a list of all registered players

`Players.findMjs(success, failure)`: Returns a list of MjsPlayer objects

MjsPlayer
---------

A class for interacting with an MJS client

`MjsPlayer.getPlaylist(success, failure)`: Returns a Playlist object

Playlist
--------

Represents a playlist

`Playlist.items`: A list of PlaylistItem objects

PlaylistItem
------------

Represents a song in a playlist

`PlaylistItem.getSong(success, failure)`: Gets the Song object corresponding to this playlist item

Song
----

Represents a song that can be played

`Song.title`: The name of the song

`Song.artist`: The artist

static `Song.fromUri(uri, success, failure)`: Parses a remote song object and returns it.

Files
-----

A class for finding playable music

