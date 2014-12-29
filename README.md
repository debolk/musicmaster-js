musicmaster-js
==============

Javascript interface for musicmaster

Documentation can be found in the docs folder or might be available at http://delftelectronics.nl/musicmaster-js/docs/

Examples
--------

```javascript
var master = new MusicMaster("http://www.example.com/musicmaster/");
master.players.getMjs(function(player){
    window.player = player[0];
    window.player.initialize(function() {
        alert("Player is currently: " + window.player.status);
    }, function(e){ console.log("error: " + e); }, true);
}, function(e){ console.log("error: " + e); });
```
