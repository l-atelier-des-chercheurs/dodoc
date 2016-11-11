//Most for use with gyre
/*
git remote add origin https://github.com/hollowdoor/more_events.git
git push -u origin master
*/
function MoreEvents(context){
    this.listeners = {};
    this.__context = context || this;
}

MoreEvents.prototype = {
    constructor: MoreEvents,
    on: function(event, listener){
        this.listeners[event] = this.listeners[event] || [];
        this.listeners[event].push(listener);
        return this;
    },
    one: function(event, listener){
        function onceListener(){
            listener.apply(this, arguments);
            this.off(event, onceListener);
            return this;
        }
        return this.on(event, onceListener);
    },
    emit: function(event){
        if(typeof this.listeners[event] === 'undefined' || !this.listeners[event].length)
            return this;

        var args = Array.prototype.slice.call(arguments, 1),
            canRun = this.listeners[event].length;

        do{
            this.listeners[event][--canRun].apply(this.__context, args);
        }while(canRun);

        return this;
    },
    off: function(event, listener){
        if(this.listeners[event] === undefined || !this.listeners[event].length)
            return this;
        this.listeners[event] = this.listeners[event].filter(function(item){
            return item !== listener;
        });
        return this;
    },
    dispose: function(){
        for(var n in this){
            this[n] = null;
        }
    }
};

module.exports.Emitter = MoreEvents;
