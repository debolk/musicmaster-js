/**
 * Represents a directory in a music repository
 * @constructor
 */
function Directory(data, previous)
{
    /** Constant "directory" */
    this.type = "directory";

    /** The name of this directory */
    this.name = data.name;
    /** A list of subdirectories (as uri) */
    this.entries = data.entries;

    /** The parent directory or null if none */
    this.previous = previous;
}

/**
 * Parses a uri to a directory
 */
Directory.fromUri = function(uri, success, failure)
{
    MusicMaster.get(uri, function(request)
            {
                success(new Directory(request.responseJson));
            }, failure);
}

/**
 * Opens a subdirectory or a song and returns the corresponding object
 */
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
