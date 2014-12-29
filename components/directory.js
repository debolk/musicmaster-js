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
                    success(new Song(filename, result));
                if(result.type == "directory")
                    success(new Directory(result, this));
            }, failure);
}
