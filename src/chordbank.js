(function() {

    var _chord_library = [
        {
            type: 'M',
            recipe: ['3', '5']
        },
        {
            type: 'm',
            recipe: ['-3', '5']
        },
        {
            type: 'dim',
            recipe: ['-3', '--5']
        },
        {
            type: 'aug',
            recipe: ['3', '++5']
        },
        {
            type: 'dim7',
            recipe: ['-3', '--5', '--7']
        },
        {
            type: 'm7-5',
            recipe: ['-3', '--5', '-7']
        },
        {
            type: 'm7',
            recipe: ['-3', '5', '-7']
        },
        {
            type: 'mM7',
            recipe: ['-3', '5', '7']
        },
        {
            type: '7',
            recipe: ['3', '5', '-7']
        },
        {
            type: 'M7',
            recipe: ['3', '5', '7']
        },
        {
            type: 'aug7',
            recipe: ['3', '++5', '-7']
        },
        {
            type: 'augM7',
            recipe: ['3', '++5', '-7']
        }
    ];

    var _message_prefix = '[ChordBank]';

    /**
     * Send a console notification
     *
     * @param type
     * @param message
     * @private
     */
    function _notify(type, message) {
        if(type == 'error' || type == 'log' || type == 'warn') {
            console[type](_message_prefix + ' ' + message);
        }
    }

    var Chord = function(args) {

        this.type = args.type;
        this.recipe = args.recipe;
    }

    var _ChordLibrary = function() {

        var _chords = [];

        function _initialize() {
            for(var i = 0; i < _chord_library.length; i++) {
                _chords.push(new Chord(_chord_library[i]));
            }
        }

        /**
         * Iterate over library and return first item matching callback expression
         * @param callback
         */
        this.find = function(callback) {
            for(var i = 0; i < _chords.length; i++) {
                if(callback(_chords[i])) {
                    return _chords[i];
                }
            }
            _notify('warn', 'No matching chords found');
        }

        _initialize();
    }

    var ChordBank = function(arguments) {

        var _library;

        function _initialize() {
            _library = new _ChordLibrary();
        }

        /**
         * Validate a set of arguments against certain rules, returns boolean.
         * Executes callback if valid
         *
         * @param validations
         * @param parameters
         * @param callback
         * @returns {boolean}
         * @private
         */
        function _validate_arguments(validations, parameters, callback) {

            var required_fields = validations.requires,
                valid = true;

            if(required_fields) {
                var missing_fields = [];
                for(var i = 0; i < required_fields.length; i++) {
                    if(!parameters[required_fields[i]]) {
                        missing_fields.push(required_fields[i]);
                    }
                }
                if(missing_fields.length) {
                    _notify('warn', 'The following fields are required: ' + missing_fields.join(', '));
                    valid = false;
                }
            }

            if(callback && valid) {
                callback(parameters);
            }

            return valid;
        }

        /**
         * Create a new chord object with given parameters
         *
         * @param arguments
         */
        this.create = function(arguments) {

            _validate_arguments({
                requires: ['root', 'type']
            }, arguments, function(args) {

                var chord = _library.find(function(chord) {
                    return chord.type === args.type;
                });

                console.log(chord);
            });
        };

        /**
         * Return the chord library
         */
        this.library = function() {

        }

        _initialize();
    }

    window.ChordBank = window.ChordBank || ChordBank;
})();