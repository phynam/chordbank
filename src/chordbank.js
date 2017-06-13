(function() {

    var _chord_patterns = [
        {
            type: 'M',
            recipe: ['3', '5']
        },
        {
            type: 'm',
            recipe: ['b3', '5']
        },
        {
            type: 'dim',
            recipe: ['b3', 'bb5']
        },
        {
            type: 'aug',
            recipe: ['3', '##5']
        },
        {
            type: 'dim7',
            recipe: ['b3', 'bb5', 'bb7']
        },
        {
            type: 'm7b5',
            recipe: ['b3', 'bb5', 'b7']
        },
        {
            type: 'm7',
            recipe: ['b3', '5', 'b7']
        },
        {
            type: 'mM7',
            recipe: ['b3', '5', '7']
        },
        {
            type: '7',
            recipe: ['3', '5', 'b7']
        },
        {
            type: 'M7',
            recipe: ['3', '5', '7']
        },
        {
            type: 'aug7',
            recipe: ['3', '##5', 'b7']
        },
        {
            type: 'augM7',
            recipe: ['3', '##5', 'b7']
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

    var _Notes = function() {

        var _notes = [
            { note: 'C', semitones: 0 },
            { note: 'C#', semitones: 1 },
            { note: 'Db', semitones: 1 },
            { note: 'D', semitones: 2 },
            { note: 'D#', semitones: 3 },
            { note: 'Eb', semitones: 3 },
            { note: 'E', semitones: 4 },
            { note: 'F', semitones: 5 },
            { note: 'F#', semitones: 6 },
            { note: 'Gb', semitones: 6 },
            { note: 'G', semitones: 7 },
            { note: 'G#', semitones: 8 },
            { note: 'Ab', semitones: 8 },
            { note: 'A', semitones: 9 },
            { note: 'A#', semitones: 10 },
            { note: 'Bb', semitones: 10 },
            { note: 'B', semitones: 11 }
        ];

        /**
         * Validate a given note string and either return false, or execute callback
         *
         * @param note
         * @param callback
         */
        this.validate_note = function(note, callback) {

            var natural = note.charAt(0).toUpperCase(),
                accidental = note.charAt(1) || undefined,
                note = (accidental) ? natural + accidental : natural,
                valid_accidentals = ['b', '#'],
                note = this.find_by_note_name(note);

            if(note && (typeof accidental == 'undefined' || valid_accidentals.indexOf(accidental) !== -1 )) {
                callback(note, accidental);
                return true;
            } else {
                _notify('warn', 'Invalid note entered');
                return false;
            }
        }

        this.find_by_semitones = function(semitones, enharmonic_type) {
            var result = [];
            for (var i = 0; i < _notes.length; i++ ) {
                if (_notes[i].semitones == semitones) {
                    if(!enharmonic_type || _notes[i].note.length == 1 || (enharmonic_type && _notes[i].note.indexOf(enharmonic_type) !== -1)) {
                        result.push(_notes[i])
                    }
                }
            }
            console.log(result);
            return result[0];
        }

        this.find_by_note_name = function(note) {
            for (var i = 0; i < _notes.length; i++ ) {
                if (_notes[i].note == note) {
                    return _notes[i];
                    break;
                }
            }
        }
    }

    var _notes = new _Notes();

    /**
     * Return notes at given intervals
     *
     * @private
     */
    var _IntervalCalculator = function() {

        var _intervals = {
            1: { type: 'perfect', semitones: 0 },
            2: { type: 'major', semitones: 2 },
            3: { type: 'major', semitones: 4 },
            4: { type: 'perfect', semitones: 5 },
            5: { type: 'perfect', semitones: 7 },
            6: { type: 'major', semitones: 9 },
            7: { type: 'major', semitones: 11 },
            8: { type: 'perfect', semitones: 12 },
            //9: { type: 'perfect', semitones: 0 },
            //10: { type: 'perfect', semitones: 0 },
            //11: { type: 'perfect', semitones: 0 },
            //12: { type: 'perfect', semitones: 0 }
        }

        var _alterations = {
            '#': 1, 'b': -1, '##': 2, 'bb': -2
        }

        function _parse_interval(interval_string, callback) {

            var interval = interval_string.match(/\d/g),
                alteration_name,
                alteration_value = 0;

            for(var key in _alterations) {
                if(_alterations.hasOwnProperty(key) && interval_string.indexOf(key) !== -1) {
                    alteration_name = key;
                    alteration_value = _alterations[key];
                }
            }

            if(interval && _intervals[interval.join('')]) {

                interval = interval.join('');
                if(callback) {
                    callback(parseInt(interval), alteration_name, alteration_value);
                }
                return interval;
            } else {
                _notify('warn', 'Interval ' + interval_string + ' not valid');
                return false;
            }
        }

        /**
         * Return note at a particular interval
         *
         * @param root
         * @param interval
         */
        this.note_at_interval = function(root, interval) {

            _notes.validate_note(root, function(note, accidental) {

                _parse_interval(interval, function(interval, alteration_name, alteration_value) {

                    var int = _intervals[interval],
                        root_note = _notes.find_by_note_name(note.note),
                        augmented_interval,
                        enharmonic_type = (alteration_name) ? alteration_name.charAt(0) : alteration_name;

                    if(!enharmonic_type) {
                        enharmonic_type = accidental;
                    }

                    if (int.type == 'perfect') {
                        if (alteration_name == '##') {
                            alteration_value --;
                        } else if (alteration_name == 'bb') {
                            alteration_value ++;
                        }
                    }

                    augmented_interval = int.semitones + alteration_value;
                    var total_interval = augmented_interval + root_note.semitones;

                    calculated_interval = (total_interval < 12) ? total_interval : total_interval - 12;

                    // Apply alteration to interval semitones

                    var interval_note = _notes.find_by_semitones(calculated_interval, enharmonic_type);

                    console.log(interval_note);
                });
            });
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
            _calculator.note_at_interval(args.root, 'b5');
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

                return _factory.create_chord(params);
            });
        };

        _initialize();
    }

    window.ChordBank = window.ChordBank || ChordBank;
})();