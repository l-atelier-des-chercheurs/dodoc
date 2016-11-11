#Exec Queue
Safely run exec in a loop.

I ran into an `Error: spawn EMFILE` when trying to call exec too many times
(ie. in a loop).  This module safely packages exec so that you may use it in a
loop without creating too many child processes.

##Usage
`npm install exec-queue`

```javascript
var exec = require('exec-queue');
for (var i = 0; i < 100; ++i) {
  exec('ls', function (err, stdout, stderr) {
    console.log(stdout);
  });
}
```

Try the above example with `require('child_process').exec` instead. ;)

The current limit is 10 child processes running simultaneously.  I did not test
the limit (maybe it can be queried by OS). If you need more, please file an
issue, as I could add to the API to be able to specify the limit.

