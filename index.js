const easymidi = require('easymidi')
const OBSWebSocket = require('obs-websocket-js');
const obs = new OBSWebSocket();

/* Error catching */
const inputs = easymidi.getInputs();
if (!inputs.includes('MPK mini 3 1')) {
    console.log('Midi Keyboard not connected.')
    process.exit(1)
}

const input = new easymidi.Input('MPK mini 3 1', false)

obs.connect({address: 'localhost:4444', password: 'MFgQ[P-;5WPc9ykXjryzrrP^ZDz&'})
    .then(() => console.log(`Success! We're connected & authenticated.`))
    .catch(err => console.log(err))

/* Events */
input.on('cc', msg => {
    switch (msg.controller) {
        case 70:
            changeVolume(msg.value / 128, 17)
            break
        case 71:
            changeVolume(msg.value / 128, 16)
            break
        case 20:
            if (msg.value < 50) break
            toggleMute(17)
            break
        case 21:
            if (msg.value < 50) break
            toggleMute(16)
            break
    }
})

const stuff = ['noteon', 'noteoff', 'poly aftertouch', 'cc', 'program', 'channel aftertouch', 'pitch', 'position', 'mtc', 'select', 'clock', 'start', 'continue', 'stop', 'activesense', 'reset', 'sysex']
for (let thing of stuff) {
    input.on(thing, msg => {
        console.log(msg)
    })
}

/* OBS socket requests */
function changeVolume(volume, source) {
    obs.send('GetSourcesList')
        .then(data => data.sources[source])
        .then(source => {
            obs.send('SetVolume', {
                source: source.name,
                volume: volume
            })
            console.log(`Success! Set Volume to ${volume * 100}%.`);
        })
        .catch(err => console.log(err))
}

function toggleMute(source) {
    obs.send('GetSourcesList')
        .then(data => data.sources[source])
        .then(source => {
            obs.send('ToggleMute', {
                source: source.name
            })
            console.log(`Success! Toggled Mute of ${source.name}.`);
        })
        .catch(err => console.log(err))
}


