function Files(master)
{
    this.master = master;
}

Files.prototype.get(success, failure)
{
    master.get('files',
            function(request) { success(request.responseJson.plugins); },
            failure);
}

Files.prototype.listCapability(name, success, failure)
{
    this.get(function(plugins){
        var result = [];
        for(var plugin in plugins)
        {
            var matches = false;
            for(var capability in plugin.capabilities)
                if(capability.name == name)
                    matches = true;
            
            if(matches)
                result.push(plugin);
        }

        success(result);

    }, failure);
}

Files.prototype.listBrowse(success, failure)
{
    this.listCapability("browse", function(plugins)
            {
                for(plugin in plugins)
                {
                    plugin.open = function(BrowseCapability(plugin));
                }
            }, failure);
}

Files.prototype.listSearch(success, failure)
{
    this.listCapability("search", success, failure);
}
