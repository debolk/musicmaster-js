function Players(master)
{
    this.master = master;
}

Players.prototype.get(success, failure)
{
    master.get('player',
            function(request) { success(request.responseJson.plugins); },
            failure);
}

Players.prototype.listCapability(name, success, failure)
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

Players.prototype.listMjs(success, failure)
{
    this.listCapability("mjs", function(plugins)
            {
                for(plugin in plugins)
                {
                    plugin.open = function(MjsPlayer(plugin));
                }
            }, failure);
}
