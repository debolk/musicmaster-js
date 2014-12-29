/**
 * A class for finding playable music
 * @constructor
 */
function Files(master)
{
    /** The MusicMaster object this is part of */
    this.master = master;
}

/**
 * Returns a list of plugins enabled on the musicmaster server
 */
Files.prototype.get = function(success, failure)
{
    this.master.get('plugin/',
            function(request) { success(request.responseJson.plugins); },
            failure);
}

/**
 * Returns a list of plugins that have the specified capability name
 */
Files.prototype.listCapability = function(name, success, failure)
{
    this.get(function(plugins){
        var result = [];
        for(var id in plugins)
        {
            var plugin = plugins[id];
            var matches = false;
            for(var capability_id in plugin.capabilities)
            {
                var capability = plugin.capabilities[capability_id];
                if(capability.name == name)
                    matches = true;
            }
            
            if(matches)
                result.push(plugin);
        }

        success(result);

    }, failure);
}

/**
 * Returns a list of BrowseCapability objects
 */
Files.prototype.listBrowse = function(success, failure)
{
    this.listCapability("browse", function(plugins)
            {
                var results = [];
                for(id in plugins)
                {
                    var plugin = plugins[id];
                    results.push(new BrowseCapability(plugin));
                }
                success(results);
            }, failure);
}

/**
 * Returns a list of SearchCapability objects
 */
Files.prototype.listSearch = function(success, failure)
{
    this.listCapability("search", success, failure);
}
