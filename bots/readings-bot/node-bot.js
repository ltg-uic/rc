
var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);
// Optionally you can set the resource Id
//nutella.setResourceId('my_resource_id');

var readings = nutella.persist.getJsonObjectStore('readings');
readings.load();
if (!readings.hasOwnProperty('data')){
    readings.data =[];
    readings.save();
}


var quakes_schedule = nutella.persist.getJsonObjectStore('quakes_schedule');
quakes_schedule.load();
if (!quakes_schedule.hasOwnProperty('quakes_schedule')){
    quakes_schedule.quakes_schedule = [];
    quakes_schedule.save();
};

var demo_quakes = nutella.persist.getJsonObjectStore('demo_quakes');
demo_quakes.load();
if (!demo_quakes.hasOwnProperty('demo_quakes')){
    demo_quakes.quakes_schedule = [];
    demo_quakes.save();
};


var room = nutella.persist.getJsonObjectStore('room_config');
room.load();
if (!room.hasOwnProperty('data')){
    room.data = 
                    {
                        room_width_meters:10,
                        room_height_meters:10,
                        seismographs:[
                                {id:1,x:0.1,y:9.9},
                                {id:2,x:9,y:2},
                                {id:3,x:3,y:3},
                                {id:4,x:2,y:2},
                                {id:5,x:7,y:8}
                            ],
                        rq_mode:"schedule"
                    }
    room.save();
};

nutella.net.handle_requests('room_configuration', function(message){
    return room.data;
});

nutella.net.subscribe('room_config_update', function(message){
    room = nutella.persist.getJsonObjectStore('room_config');
    room.load();
    room.data = message;
    room.save();
});


nutella.net.subscribe('mode_update', function(message){

    room = nutella.persist.getJsonObjectStore('room_config');
    room.load();
    room.data.rq_mode = message.rq_mode;
    room.save();
});

nutella.net.handle_requests('quakes_schedule', function(message){
    if (room.data.rq_mode == 'schedule') return quakes_schedule;
    else return demo_quakes;
});

nutella.net.handle_requests('quakes_series', function(message){
    return quakes_schedule;
});

nutella.net.subscribe('new_demo_quake', function(message){
    demo_quakes = nutella.persist.getJsonObjectStore('demo_quakes');
    demo_quakes.load();
    var s = demo_quakes.quakes_schedule;
    s.push(message);
    demo_quakes.quakes_schedule = s;
    demo_quakes.save();
});

nutella.net.subscribe('demo_quakes_clean', function(message){

    demo_quakes = nutella.persist.getJsonObjectStore('demo_quakes');
    demo_quakes.load();
    demo_quakes.quakes_schedule = [];
    demo_quakes.save();
});

nutella.net.subscribe('quakes_schedule_update', function(message){
    quakes_schedule = nutella.persist.getJsonObjectStore('quakes_schedule');
    quakes_schedule.load();
    quakes_schedule = message;
    quakes_schedule.save();
});



nutella.net.handle_requests('get_readings', function (message, from){
    return (readings.data);
});


// //  nutella bug? workaround: must redefine and reload json objects prior to saving them
// //  

nutella.net.subscribe('set_readings', function (message, from){
    readings = nutella.persist.getJsonObjectStore('readings');
    readings.load();
    readings.data = message;
    readings.save();
    // portals = nutella.persist.getJsonObjectStore('portals');
    // portals.load();
    // portals = message.portals;
    // portals.save();
    // instances = nutella.persist.getJsonObjectStore('instances');
    // instances.load();
    // instances = message.instances;
    // instances.save();
    // nutella.net.publish('portals_set',portals);
    // nutella.net.publish('portals_set',message);
});

nutella.net.subscribe('reading', function (message, from){
    readings = nutella.persist.getJsonObjectStore('readings');
    readings.load();
    readings.data.push(message);
    readings.save();
});





