(function() {

    var _chord_patterns = [
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

    /**
     * Return notes at given intervals
     *
     * @private
     */
    var _IntervalCalculator = function() {

        var _note_count = 12;

        var _notes = {
            'C': 1, 'C#': 2, 'Db': 2, 'D': 3, 'D#': 4, 'Eb': 4, 'E': 5, 'F': 6, 'F#': 7, 'Gb': 7, 'G': 8, 'G#': 9, 'Ab': 9, 'A': 10, 'A#': 11, 'Bb': 11, 'B': 12, 'Cb': 12
        }

        /**
         * Return note at a particular interval
         *
         * @param root
         * @param interval
         * @param type
         */
        this.note_at_interval = function(root, interval, type) {

            var key_type;
            root = root.charAt(0).toUpperCase() + root.slice(1);

            if(_notes[root]) {

                if(root.charAt(1) === 'b') {
                    key_type = 'flat'
                } else if(root.charAt(1) === '#') {
                    key_type = 'sharp'
                }

                var root_int = _notes[root],
                    total_int = root_int + interval,
                    calculated_int = (total_int <= _note_count) ? total_int : total_int - _note_count;

                var result = [];
                for (var key in _notes) {
                    if (_notes.hasOwnProperty(key) && _notes[key] == calculated_int) {
                        result.push(key);
                    }
                }

                console.log(result);

                // Find the root in the table, store its interval
                // Add the interval to the root inerval and return note name(s) at that position
                // If flat, return the flat, else return the sharp version

            } else {
                _notify('warn', 'Invalid root note');
            }
        }
    }

    /**
     * Chord model constructor, responsible for housing chord data
     *
     * @param args
     * @constructor
     */
    var Chord = function(args) {
        this.type = args.type;
        this.root = args.root;
    }

    /**
     * Chord factory constructor, responsible for creating chords from a given recipe
     *
     * @private
     */
    var _ChordFactory = function() {

        var _calculator;

        function _initialize() {
            _calculator = new _IntervalCalculator();
        }

        /**
         * Create a chord from a given root and recipe
         *
         * @param args
         */
        this.create_chord = function(args) {
            _calculator.note_at_interval(args.root, 1);
            //return new Chord(args);
        }

        _initialize();
    }

    /**
     * Pattern library model constructor
     *
     * @private
     */
    var _PatternLibrary = function() {

        var _patterns = [];

        function _initialize() {
            for(var i = 0; i < _chord_patterns.length; i++) {
                _patterns.push(_chord_patterns[i]);
            }
        }

        /**
         * Iterate over library and return first item matching callback expression
         * @param callback
         */
        this.find = function(callback) {
            for(var i = 0; i < _patterns.length; i++) {
                if(callback(_patterns[i])) {
                    return _patterns[i];
                }
            }
            _notify('warn', 'No matching chord patterns found');
        }

        _initialize();
    }

    var ChordBank = function() {

        var _library;
        var _factory;

        function _initialize() {
            _library = new _PatternLibrary();
            _factory = new _ChordFactory();
        }

        /**
         * Validate a set of parameters against certain rules, returns boolean.
         * Executes callback if valid
         *
         * @param validations
         * @param parameters
         * @param callback
         * @returns {boolean}
         * @private
         */
        function _validate_parameters(validations, parameters, callback) {

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
         * @param parameters
         */
        this.create = function(parameters) {

            _validate_parameters({
                requires: ['root', 'type']
            }, parameters, function(args) {

                var pattern = _library.find(function(chord) {
                    return chord.type === args.type;
                });

                var params = {
                    root: args.root,
                    type: pattern.type,
                    recipe: pattern.recipe
                };
                console.log(_factory.create_chord(params));
            });
        };

        _initialize();
    }

    window.ChordBank = window.ChordBank || ChordBank;
})();