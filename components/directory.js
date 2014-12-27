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
