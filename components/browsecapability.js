function BrowseCapability(plugin)
{
    this.uri = plugin.url + "/browse/";
    this.name = plugin.name;
}

BrowserCapability.prototype.open = function(success, failure) { return Directory.fromUri(this.uri, success, failure); };
