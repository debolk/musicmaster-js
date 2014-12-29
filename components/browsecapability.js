/**
 * Represents a reference to a browseable music repository
 * @constructor
 */
function BrowseCapability(plugin)
{
    this.uri = plugin.url + "/browse/";
    this.name = plugin.name;
}

/**
 * Returns a Directory representing the root of this repository.
 */
BrowseCapability.prototype.open = function(success, failure) { return Directory.fromUri(this.uri, success, failure); };
