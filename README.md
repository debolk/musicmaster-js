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

`MjsPlayer.name`: The name of the current player

`MjsPlayer.uri`: The uri of the current player

`MjsPlayer.getPlaylist(success, failure)`: Returns a Playlist object

`MjsPlayer.getStatus(success, failure)`: Returns the current status of the player (playing, paused, stopped)

`MjsPlayer.setStatus(status, success, failure)`: Sets the player status to a specific value (playing, paused, stopped)

`MjsPlayer.play(success, failure)`: Resumes playing in the player

`MjsPlayer.pause(success, failure)`: Pauses the playback in the player

`MjsPlayer.stop(success, failure)`: Stops playback in the player

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

`Files.get(success, failure)`: Returns a list of plugins enabled on the musicmaster server

`Files.listCapability(name, success, failure)`: Returns a list of plugins that have the specified capability name

`Files.listBrowse(success, failure)`: Returns a list of BrowseCapability objects

`Files.listSearch(success, failure)`: Returns a list of SearchCapability objects

BrowseCapability
----------------

Represents a reference to a browseable music repository

BrowseCapability.open(success, failure)`: Returns a Directory representing the root of this repository.

Directory
---------

Represents a directory in a music repository

`Directory.type`: Constant "directory"

`Directory.name`: The name of this directory

`Directory.previous`: The parent directory or null if none / unknown

`Directory.entries`: A list of subdirectories (as uri)

`Directory.open(filename, success, failure)`: Opens a subdirectory or a song and returns the corresponding object

static `Directory.fromUri(uri, success, failure)`: Parses a uri to a directory

Song
----

`Song.type`: Constant "song"

`Song.title`: The title of the song or null if there are no readable id3 tags

`Song.artist`: The artist of the song or null if there are no readable id3 tags

`Song.location`: The address where the player can find the audio file. This is not guaranteed to be reachable from the browser.

`Song.uri`: The uri for this song.

static `Song.fromUri(uri, success, failure)`: Parses a Song object from a given uri and returns it.


