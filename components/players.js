function Players(master)
{
    this.master = master;
}

Players.prototype.get = function(success, failure)
{
    this.master.get('player',
            function(request) { success(request.responseJson.players); },
            failure);
}

Players.prototype.listCapability = function(name, success, failure)
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

Players.prototype.listMjs = function(success, failure)
{
    this.listCapability("mjs", function(plugins)
            {
                var result = [];
                for(id in plugins)
                {
                    plugin = plugins[id];
                    result.push(new MjsPlayer(plugin));
                }
                success(result);
            }, failure);
}
